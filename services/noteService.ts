
import { supabase, getIsDemoMode } from '../lib/supabase';
import { Note } from '../types';

const STORAGE_KEY = 'ainotes_backup_storage';

// Local Storage Helpers
const getLocalNotes = (): Note[] => {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
};

const saveLocalNotes = (notes: Note[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
};

export const noteService = {
  async fetchNotes(userId: string): Promise<Note[]> {
    const localData = getLocalNotes();
    const userLocals = localData.filter(n => n.user_id === userId && !n.is_archived);

    try {
      if (getIsDemoMode()) return userLocals;

      const { data: cloudData, error } = await supabase!
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', false)
        .order('is_pinned', { ascending: false })
        .order('updated_at', { ascending: false });
      
      if (error) throw error;

      // Mark cloud notes as synced
      const syncedCloudData = (cloudData || []).map(n => ({ ...n, is_synced: true }));

      // Find local notes that are NOT in the cloud yet (pending sync)
      const cloudIds = new Set(syncedCloudData.map(n => n.id));
      const pendingSync = userLocals.filter(n => !cloudIds.has(n.id) && n.id.startsWith('temp-'));

      const merged = [...pendingSync, ...syncedCloudData];
      
      // Update local storage for this user while preserving other users' local data
      const otherUsersData = localData.filter(n => n.user_id !== userId);
      saveLocalNotes([...merged, ...otherUsersData]);

      return merged;
    } catch (err) {
      console.warn("Could not reach cloud, using device copy", err);
      return userLocals;
    }
  },

  async fetchArchivedNotes(userId: string): Promise<Note[]> {
    try {
      if (getIsDemoMode()) {
        return getLocalNotes().filter(n => n.user_id === userId && n.is_archived);
      }
      const { data, error } = await supabase!
        .from('notes')
        .select('*')
        .eq('user_id', userId)
        .eq('is_archived', true)
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      return (data || []).map(n => ({ ...n, is_synced: true }));
    } catch (err) {
      return getLocalNotes().filter(n => n.user_id === userId && n.is_archived);
    }
  },

  async createNote(userId: string, note: Partial<Note>): Promise<Note> {
    const timestamp = new Date().toISOString();
    const tempId = 'temp-' + Math.random().toString(36).substr(2, 9);
    
    const newNote: Note = {
      id: tempId,
      user_id: userId,
      title: note.title || '',
      content: note.content || '',
      is_pinned: note.is_pinned || false,
      is_archived: false,
      created_at: timestamp,
      updated_at: timestamp,
      color: note.color || 'transparent',
      is_synced: false
    };

    // Save locally immediately
    const locals = getLocalNotes();
    saveLocalNotes([newNote, ...locals]);

    if (getIsDemoMode()) return newNote;

    try {
      const { data, error } = await supabase!
        .from('notes')
        .insert([{
          user_id: userId,
          title: note.title || '',
          content: note.content || '',
          is_pinned: note.is_pinned || false,
          is_archived: false,
          color: note.color || 'transparent'
        }])
        .select()
        .single();

      if (error) throw error;
      
      const cloudNote = { ...data, is_synced: true };
      
      // Replace temp with cloud version
      const updatedLocals = getLocalNotes().map(n => n.id === tempId ? cloudNote : n);
      saveLocalNotes(updatedLocals);
      
      return cloudNote;
    } catch (err) {
      console.error("Cloud Save Failed. Note is on this device only.", err);
      return newNote; 
    }
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<void> {
    const updatedAt = new Date().toISOString();
    
    const notes = getLocalNotes();
    const index = notes.findIndex(n => n.id === id);
    if (index !== -1) {
      notes[index] = { ...notes[index], ...updates, updated_at: updatedAt, is_synced: false };
      saveLocalNotes(notes);
    }

    if (getIsDemoMode() || id.startsWith('temp-')) return;

    try {
      const { error } = await supabase!
        .from('notes')
        .update({ ...updates, updated_at: updatedAt })
        .eq('id', id);

      if (error) throw error;
      
      // Mark as synced locally after successful update
      const freshNotes = getLocalNotes();
      const freshIndex = freshNotes.findIndex(n => n.id === id);
      if (freshIndex !== -1) {
        freshNotes[freshIndex].is_synced = true;
        saveLocalNotes(freshNotes);
      }
    } catch (err) {
      console.warn("Cloud update failed", err);
    }
  },

  async deleteNote(id: string): Promise<void> {
    const notes = getLocalNotes().filter(n => n.id !== id);
    saveLocalNotes(notes);

    if (getIsDemoMode() || id.startsWith('temp-')) return;

    try {
      await supabase!.from('notes').delete().eq('id', id);
    } catch (err) {
      console.error("Delete failed on cloud", err);
    }
  }
};
