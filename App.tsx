
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Search, 
  Plus, 
  Menu, 
  Pin, 
  Archive, 
  Trash2, 
  Grid, 
  List, 
  Moon, 
  Sun,
  X,
  Sparkles,
  ArrowLeft,
  Settings,
  MoreVertical,
  LogOut,
  Mail,
  Lock,
  User as UserIcon,
  Loader2,
  Check,
  HelpCircle,
  Send,
  Save,
  Cloud,
  CloudOff,
  ChevronRight,
  Shield,
  Zap,
  Globe
} from 'lucide-react';
import { Note, User } from './types';
import { noteService } from './services/noteService';
import { geminiService } from './services/geminiService';
import { supabase, getIsDemoMode } from './lib/supabase';

// --- UI Components ---

const IconButton: React.FC<{ 
  onClick: (e: React.MouseEvent) => void; 
  children: React.ReactNode; 
  title?: string;
  className?: string;
}> = ({ onClick, children, title, className = "" }) => (
  <button 
    onClick={onClick} 
    title={title}
    className={`p-2 hover:bg-black/5 dark:hover:bg-white/10 rounded-full transition-colors flex items-center justify-center ${className}`}
  >
    {children}
  </button>
);

const LandingPage: React.FC<{ onStart: () => void; onLogin: () => void }> = ({ onStart, onLogin }) => {
  return (
    <div className="min-h-screen bg-[#f8f9fa] dark:bg-[#121212] text-[#1a1a1b] dark:text-white flex flex-col overflow-x-hidden">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/20">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter">Ai notes</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={onLogin} className="font-bold text-gray-500 dark:text-gray-400 hover:text-blue-600 transition-colors">Login</button>
          <button onClick={onStart} className="bg-blue-600 hover:bg-blue-700 text-white font-black px-6 py-2.5 rounded-2xl shadow-xl shadow-blue-500/20 transition-all active:scale-95">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center text-center px-6 pt-12 md:pt-20">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full text-xs font-black uppercase tracking-widest mb-8 animate-in fade-in slide-in-from-top-4 duration-700">
          <Zap className="w-3 h-3 fill-current" /> Powered by Gemini AI
        </div>
        <h1 className="text-5xl md:text-8xl font-black mb-6 max-w-5xl tracking-tight leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-700">
          The smartest place for <span className="text-blue-600">your ideas.</span>
        </h1>
        <p className="text-lg md:text-2xl text-gray-500 dark:text-gray-400 max-w-2xl mb-12 font-medium leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-700 delay-100">
          A minimal, beautiful space to capture thoughts. Refine your writing instantly with AI and sync across all your devices.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 mb-20 animate-in fade-in slide-in-from-bottom-12 duration-700 delay-200">
          <button onClick={onStart} className="px-10 py-5 bg-blue-600 text-white text-lg font-black rounded-[2rem] shadow-2xl shadow-blue-600/30 hover:bg-blue-700 transition-all flex items-center gap-3 active:scale-95 group">
            Start Writing Free <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
          <button onClick={onLogin} className="px-10 py-5 bg-white dark:bg-[#1e1e1e] border-2 border-gray-100 dark:border-white/5 text-lg font-black rounded-[2rem] shadow-sm hover:shadow-xl transition-all active:scale-95">
            Already a user?
          </button>
        </div>

        {/* Features Preview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full py-20 border-t dark:border-white/5">
          <FeatureCard 
            icon={<Cloud className="w-8 h-8 text-blue-500" />} 
            title="Cloud Sync" 
            description="Access your notes from any browser. Your thoughts follow you everywhere."
          />
          <FeatureCard 
            icon={<Sparkles className="w-8 h-8 text-purple-500" />} 
            title="AI Refinement" 
            description="One click to polish your grammar and style using Gemini AI."
          />
          <FeatureCard 
            icon={<Shield className="w-8 h-8 text-green-500" />} 
            title="Privacy First" 
            description="Secure authentication ensures your personal notes stay strictly personal."
          />
        </div>
      </main>

      <footer className="py-10 text-center border-t dark:border-white/5 text-gray-400 font-medium text-sm">
        © 2024 Ai notes. Built with precision.
      </footer>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) => (
  <div className="p-8 bg-white dark:bg-[#1e1e1e] rounded-[2.5rem] text-left border dark:border-white/5 shadow-sm hover:shadow-xl transition-all group">
    <div className="mb-6 p-4 bg-gray-50 dark:bg-[#2d2e30] rounded-3xl w-fit group-hover:scale-110 transition-transform">
      {icon}
    </div>
    <h3 className="text-xl font-black mb-3">{title}</h3>
    <p className="text-gray-500 dark:text-gray-400 font-medium leading-relaxed">{description}</p>
  </div>
);

const AuthForm: React.FC<{ initialMode: 'login' | 'signup', onAuthSuccess: (user: User) => void; onBack: () => void }> = ({ initialMode, onAuthSuccess, onBack }) => {
  const [isLogin, setIsLogin] = useState(initialMode === 'login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (getIsDemoMode()) {
      setTimeout(() => {
        onAuthSuccess({ id: 'demo-user', email });
        setLoading(false);
      }, 800);
      return;
    }

    try {
      if (isLogin) {
        const { data, error } = await supabase!.auth.signInWithPassword({ email, password });
        if (error) throw error;
        if (data.user) onAuthSuccess({ id: data.user.id, email: data.user.email! });
      } else {
        const { data, error } = await supabase!.auth.signUp({ email, password });
        if (error) throw error;
        if (data.user) alert('Account created! Sign in to see your notes on any device.');
      }
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#f8f9fa] dark:bg-[#121212] p-4 relative">
      <button onClick={onBack} className="absolute top-8 left-8 flex items-center gap-2 text-gray-500 font-bold hover:text-blue-600 transition-colors">
        <ArrowLeft className="w-5 h-5" /> Back to home
      </button>
      
      <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-[2.5rem] shadow-2xl max-w-md w-full border dark:border-white/10 animate-in fade-in slide-in-from-bottom-8 duration-500">
        <div className="text-center mb-10">
          <div className="bg-blue-600 dark:bg-blue-500 p-4 rounded-3xl w-20 h-20 flex items-center justify-center mx-auto mb-6 shadow-xl shadow-blue-500/20">
            <Sparkles className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-4xl font-extrabold dark:text-white tracking-tight">Ai notes</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-3 font-medium">
            {isLogin ? 'Welcome back!' : 'Create your account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Mail className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="email" 
              placeholder="Email address"
              className="w-full bg-gray-50 dark:bg-[#2d2e30] border dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all font-bold"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="relative group">
            <Lock className="absolute left-4 top-4 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="password" 
              placeholder="Password"
              className="w-full bg-gray-50 dark:bg-[#2d2e30] border dark:border-white/5 rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:text-white transition-all font-bold"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && <div className="bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-900/20 rounded-xl p-3 text-red-600 dark:text-red-400 text-sm font-medium">{error}</div>}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-6 rounded-2xl transition-all shadow-lg shadow-blue-500/30 flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <div className="mt-10 text-center space-y-6">
          <button 
            onClick={() => setIsLogin(!isLogin)}
            className="text-sm font-semibold text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
          >
            {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
          </button>
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center"><span className="w-full border-t dark:border-white/10"></span></div>
            <div className="relative flex justify-center text-xs uppercase"><span className="bg-white dark:bg-[#1e1e1e] px-3 text-gray-500 font-bold tracking-widest">Or</span></div>
          </div>

          <button 
            onClick={() => onAuthSuccess({ id: 'demo-user', email: 'demo@ainotes.com' })}
            className="text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors underline underline-offset-4 font-medium"
          >
            Try Offline (No Sync)
          </button>
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'app'>('landing');
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [currentView, setCurrentView] = useState<'notes' | 'archive' | 'support'>('notes');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isNewNoteOpen, setIsNewNoteOpen] = useState(false);
  const [newNote, setNewNote] = useState({ title: '', content: '' });
  const [isSyncing, setIsSyncing] = useState(false);
  const [isRefining, setIsRefining] = useState(false);
  const [refineDiff, setRefineDiff] = useState<{ original: string; refined: string } | null>(null);

  useEffect(() => {
    if (getIsDemoMode()) {
      setIsAuthChecking(false);
      return;
    }
    const checkUser = async () => {
      try {
        const { data: { session } } = await supabase!.auth.getSession();
        if (session?.user) {
          setUser({ id: session.user.id, email: session.user.email! });
          setView('app');
        }
      } catch (err) {
        console.warn("Auth check error, probably missing credentials.", err);
      } finally {
        setIsAuthChecking(false);
      }
    };
    checkUser();
    const { data: { subscription } } = supabase!.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUser({ id: session.user.id, email: session.user.email! });
        setView('app');
      } else {
        setUser(null);
        setNotes([]);
        if (view === 'app') setView('landing');
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    const root = document.documentElement;
    if (!isDarkMode) { root.classList.add('dark'); localStorage.setItem('theme', 'dark'); }
    else { root.classList.remove('dark'); localStorage.setItem('theme', 'light'); }
  };

  const loadNotes = useCallback(async () => {
    if (!user || currentView === 'support') return;
    setIsSyncing(true);
    try {
      const data = currentView === 'notes' 
        ? await noteService.fetchNotes(user.id)
        : await noteService.fetchArchivedNotes(user.id);
      setNotes(data);
    } catch (err) { 
      console.error("Load error", err); 
    } finally {
      setIsSyncing(false);
    }
  }, [user, currentView]);

  useEffect(() => { if (user) loadNotes(); }, [user, loadNotes]);

  const handleCreateNote = async () => {
    if (!user) return;
    const title = newNote.title.trim();
    const content = newNote.content.trim();

    if (!title && !content) {
      setIsNewNoteOpen(false);
      return;
    }

    setIsNewNoteOpen(false);
    
    const tempId = 'temp-' + Date.now();
    const optimisticNote: Note = {
      id: tempId,
      user_id: user.id,
      title,
      content,
      is_pinned: false,
      is_archived: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_synced: false
    };

    setNotes(prev => [optimisticNote, ...prev]);
    setNewNote({ title: '', content: '' });

    setIsSyncing(true);
    try {
      const created = await noteService.createNote(user.id, { title, content });
      setNotes(prev => prev.map(n => n.id === tempId ? { ...created, is_synced: true } : n));
    } catch (err) {
      console.warn("Cloud sync delayed.", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const handleUpdateNote = async (id: string, updates: Partial<Note>, skipClose: boolean = false) => {
    if (!user) return;
    
    if (!skipClose) setEditingNote(null);
    
    setNotes(prev => prev.map(n => n.id === id ? { ...n, ...updates, updated_at: new Date().toISOString(), is_synced: false } : n));
    
    setIsSyncing(true);
    try {
      await noteService.updateNote(id, updates);
      setNotes(prev => prev.map(n => n.id === id ? { ...n, is_synced: true } : n));
    } catch (err) {
      console.warn("Cloud update delayed.", err);
    } finally {
      setIsSyncing(false);
    }
  };

  const togglePin = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    handleUpdateNote(note.id, { is_pinned: !note.is_pinned }, true);
  };

  const toggleArchive = (e: React.MouseEvent, note: Note) => {
    e.stopPropagation();
    const isArchiving = !note.is_archived;
    setNotes(prev => prev.filter(n => n.id !== note.id));
    noteService.updateNote(note.id, { is_archived: isArchiving });
  };

  const handleRefine = async () => {
    const textToRefine = editingNote ? editingNote.content : newNote.content;
    if (!textToRefine.trim()) return;
    setIsRefining(true);
    try {
      const refined = await geminiService.refineText(textToRefine);
      setRefineDiff({ original: textToRefine, refined });
    } catch (err) {
      console.error("AI Error", err);
    } finally {
      setIsRefining(false);
    }
  };

  const applyRefinement = (mode: 'replace' | 'both') => {
    if (!refineDiff) return;
    const finalContent = mode === 'replace' ? refineDiff.refined : `${refineDiff.original}\n\n---\nRefined:\n${refineDiff.refined}`;
    if (editingNote) setEditingNote({ ...editingNote, content: finalContent });
    else setNewNote(prev => ({ ...prev, content: finalContent }));
    setRefineDiff(null);
  };

  const filteredNotes = useMemo(() => {
    let result = notes.filter(n => 
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.content.toLowerCase().includes(searchQuery.toLowerCase())
    );
    result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
    return result;
  }, [notes, searchQuery]);

  const pinned = filteredNotes.filter(n => n.is_pinned);
  const others = filteredNotes.filter(n => !n.is_pinned);

  if (isAuthChecking) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-[#202124]">
      <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
      <span className="font-bold text-gray-400">Loading your space...</span>
    </div>
  );

  if (view === 'landing') return <LandingPage onStart={() => setView('signup')} onLogin={() => setView('login')} />;
  if (view === 'login' || view === 'signup') return (
    <AuthForm 
      initialMode={view === 'login' ? 'login' : 'signup'} 
      onAuthSuccess={(u) => { setUser(u); setView('app'); }} 
      onBack={() => setView('landing')}
    />
  );

  return (
    <div className="flex flex-col min-h-screen bg-[#f8f9fa] dark:bg-[#202124]">
      {/* HEADER */}
      <header className="sticky top-0 z-30 flex items-center justify-between px-6 h-16 bg-white/95 dark:bg-[#202124]/95 backdrop-blur-md border-b dark:border-white/5 shadow-sm">
        <div className="flex items-center gap-4">
          <IconButton onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <Menu className="w-6 h-6" />
          </IconButton>
          <div className="flex items-center gap-3 select-none">
            <div className="p-1.5 bg-blue-600 rounded-xl hidden sm:block shadow-lg shadow-blue-500/20">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl font-black tracking-tighter">Ai notes</h1>
          </div>
        </div>

        <div className="flex-1 max-w-2xl mx-6 relative">
          <div className="flex items-center bg-gray-100 dark:bg-[#2f3134] rounded-2xl px-4 py-2 focus-within:bg-white dark:focus-within:bg-[#35363a] focus-within:shadow-xl transition-all border border-transparent focus-within:border-blue-500/30">
            <Search className="w-5 h-5 text-gray-500 mr-3" />
            <input 
              className="bg-transparent w-full focus:outline-none placeholder-gray-500 font-bold"
              placeholder="Search synced notes..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSyncing && (
            <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/10 rounded-full animate-pulse">
               <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" />
               <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest hidden sm:block">Syncing</span>
            </div>
          )}
          <IconButton onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
            {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid className="w-5 h-5" />}
          </IconButton>
          <IconButton onClick={toggleTheme}>
            {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </IconButton>
          <div className="relative group ml-2">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-black cursor-pointer shadow-lg active:scale-95 transition-transform border-2 border-white dark:border-[#202124]">
              {user?.email[0].toUpperCase() || 'U'}
            </div>
            <div className="absolute right-0 top-full pt-3 hidden group-hover:block w-56">
              <div className="bg-white dark:bg-[#1e1e1e] rounded-2xl shadow-2xl border dark:border-white/10 p-2 animate-in fade-in slide-in-from-top-2">
                <div className="px-4 py-3 border-b dark:border-white/5 mb-1">
                  <p className="text-xs text-gray-400 uppercase font-black tracking-widest mb-1">Logged In As</p>
                  <p className="text-sm font-bold truncate dark:text-white">{user?.email}</p>
                </div>
                <button onClick={() => { if(!getIsDemoMode()) supabase!.auth.signOut(); setUser(null); setView('landing'); }} className="w-full flex items-center gap-3 px-4 py-3 text-sm font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all">
                  <LogOut className="w-4 h-4" /> Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* SIDEBAR */}
        <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} transition-all duration-300 border-r dark:border-white/5 flex flex-col pt-6 hidden md:flex bg-white dark:bg-[#202124]`}>
          <nav className="flex flex-col gap-2 px-3">
            <SidebarLink active={currentView === 'notes'} onClick={() => setCurrentView('notes')} icon={<Plus className="w-5 h-5" />} label="My Notes" isOpen={isSidebarOpen} />
            <SidebarLink active={currentView === 'archive'} onClick={() => setCurrentView('archive')} icon={<Archive className="w-5 h-5" />} label="Archive" isOpen={isSidebarOpen} />
            <SidebarLink active={currentView === 'support'} onClick={() => setCurrentView('support')} icon={<HelpCircle className="w-5 h-5" />} label="Support" isOpen={isSidebarOpen} />
          </nav>
        </aside>

        {/* MAIN AREA */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-10 scroll-smooth">
          {currentView === 'support' ? (
            <div className="max-w-2xl mx-auto py-10">
              <div className="bg-white dark:bg-[#1e1e1e] border dark:border-white/10 rounded-[2.5rem] shadow-2xl p-10">
                <h2 className="text-3xl font-black mb-10 flex items-center gap-4"><HelpCircle className="w-10 h-10 text-blue-600" /> Support</h2>
                <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); alert("Inquiry Sent!"); setCurrentView('notes'); }}>
                  <input required placeholder="Subject" className="w-full bg-gray-50 dark:bg-[#2d2e30] border-none rounded-2xl py-4 px-5 font-bold focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <textarea required rows={6} placeholder="How can we help?" className="w-full bg-gray-50 dark:bg-[#2d2e30] border-none rounded-2xl py-4 px-5 font-bold resize-none focus:ring-2 focus:ring-blue-500 focus:outline-none" />
                  <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-2xl shadow-xl flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-blue-700">
                    <Send className="w-6 h-6" /> Send Message
                  </button>
                </form>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in duration-500">
              {/* NEW NOTE INPUT (Always Visible) */}
              {currentView === 'notes' && !isNewNoteOpen && (
                <div className="max-w-2xl mx-auto mb-16">
                  <div 
                    onClick={() => setIsNewNoteOpen(true)}
                    className="bg-white dark:bg-[#202124] border-2 border-gray-100 dark:border-[#5f6368] rounded-2xl shadow-sm hover:shadow-xl hover:border-blue-300 dark:hover:border-blue-800 p-4 px-6 flex items-center justify-between cursor-text transition-all group"
                  >
                    <span className="text-gray-400 font-bold group-hover:text-blue-500 transition-colors">Capture a new thought...</span>
                    <div className="flex gap-2">
                       <IconButton onClick={(e) => { e.stopPropagation(); setIsNewNoteOpen(true); }} className="hover:bg-blue-50 dark:hover:bg-blue-900/20">
                        <Plus className="w-6 h-6 text-blue-600" />
                       </IconButton>
                    </div>
                  </div>
                </div>
              )}

              {/* EXPANDED EDITOR */}
              {isNewNoteOpen && (
                <div className="max-w-2xl mx-auto mb-16 bg-white dark:bg-[#202124] border-2 border-blue-500 rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-8">
                    <input autoFocus className="w-full text-2xl font-black bg-transparent focus:outline-none mb-4" placeholder="Title" value={newNote.title} onChange={(e) => setNewNote({...newNote, title: e.target.value})} />
                    <textarea className="w-full min-h-[160px] bg-transparent focus:outline-none resize-none text-lg font-medium" placeholder="Write something amazing..." value={newNote.content} onChange={(e) => setNewNote({...newNote, content: e.target.value})} />
                  </div>
                  <div className="flex items-center justify-between px-6 py-4 bg-gray-50 dark:bg-[#2d2e30]/50 border-t dark:border-white/5">
                    <div className="flex gap-2">
                      <IconButton onClick={handleRefine} className={isRefining ? "animate-pulse bg-blue-100 dark:bg-blue-900/30" : "bg-blue-50 dark:bg-blue-900/20"}>
                        <Sparkles className={`w-5 h-5 text-blue-600 ${isRefining ? 'animate-spin' : ''}`} />
                      </IconButton>
                    </div>
                    <div className="flex gap-4">
                      <button onClick={() => setIsNewNoteOpen(false)} className="px-6 py-2 text-gray-400 font-bold hover:text-gray-600 dark:hover:text-gray-200 transition-colors">Discard</button>
                      <button onClick={handleCreateNote} className="flex items-center gap-2 px-10 py-2.5 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-500/20 active:scale-95 transition-all hover:bg-blue-700">
                        <Save className="w-5 h-5" /> Save Note
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* LIST OF NOTES */}
              <div className="max-w-7xl mx-auto">
                {pinned.length > 0 && (
                  <div className="mb-14">
                    <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-2 flex items-center gap-2"><Pin className="w-3 h-3 fill-blue-500 text-blue-500" /> Pinned</h3>
                    <div className={viewMode === 'grid' ? 'masonry-grid' : 'flex flex-col gap-4'}>
                      {pinned.map(n => <NoteCard key={n.id} note={n} viewMode={viewMode} onClick={() => setEditingNote(n)} onPin={(e) => togglePin(e, n)} onArchive={(e) => toggleArchive(e, n)} />)}
                    </div>
                  </div>
                )}
                {others.length > 0 && (
                  <div>
                    {pinned.length > 0 && <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 ml-2">Notes</h3>}
                    <div className={viewMode === 'grid' ? 'masonry-grid' : 'flex flex-col gap-4'}>
                      {others.map(n => <NoteCard key={n.id} note={n} viewMode={viewMode} onClick={() => setEditingNote(n)} onPin={(e) => togglePin(e, n)} onArchive={(e) => toggleArchive(e, n)} />)}
                    </div>
                  </div>
                )}
                {filteredNotes.length === 0 && !isNewNoteOpen && (
                  <div className="flex flex-col items-center justify-center py-32 opacity-20">
                    <div className="bg-gray-200 dark:bg-gray-800 p-10 rounded-full mb-6">
                      {isSyncing ? <Loader2 className="w-16 h-16 animate-spin" /> : <Plus className="w-16 h-16" />}
                    </div>
                    <p className="text-2xl font-black">{isSyncing ? "Restoring from cloud..." : "No notes found."}</p>
                    {searchQuery && <p className="mt-2 text-gray-400 font-bold">Try a different search term.</p>}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FAB - Create Note (Mobile) */}
      {!isNewNoteOpen && !editingNote && currentView !== 'support' && (
        <button 
          onClick={() => setIsNewNoteOpen(true)}
          className="fixed bottom-8 right-8 w-16 h-16 bg-blue-600 text-white rounded-2xl shadow-2xl flex items-center justify-center active:scale-90 transition-transform z-40 md:hidden hover:bg-blue-700"
        >
          <Plus className="w-10 h-10" />
        </button>
      )}

      {/* EDIT MODAL */}
      {editingNote && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#202124] w-full max-w-3xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-8">
            <div className="flex items-center justify-between p-4 border-b dark:border-white/5">
              <IconButton onClick={() => setEditingNote(null)}><ArrowLeft className="w-5 h-5" /></IconButton>
              <div className="flex gap-2">
                <div className="flex items-center gap-1 px-3 bg-gray-50 dark:bg-white/5 rounded-full mr-2">
                  {editingNote.is_synced ? (
                    <>
                      <Cloud className="w-3.5 h-3.5 text-green-500" />
                      <span className="text-[10px] font-black text-green-600 uppercase">Cloud Synced</span>
                    </>
                  ) : (
                    <>
                      <CloudOff className="w-3.5 h-3.5 text-gray-400" />
                      <span className="text-[10px] font-black text-gray-400 uppercase">Device Only</span>
                    </>
                  )}
                </div>
                <IconButton onClick={(e) => togglePin(e, editingNote)}><Pin className={`w-5 h-5 ${editingNote.is_pinned ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}`} /></IconButton>
                <IconButton onClick={(e) => toggleArchive(e, editingNote)}><Archive className="w-5 h-5 text-gray-400" /></IconButton>
                <div className="w-px h-6 bg-gray-100 dark:bg-white/5 mx-1" />
                <IconButton onClick={() => { noteService.deleteNote(editingNote.id); setNotes(notes.filter(n => n.id !== editingNote.id)); setEditingNote(null); }}><Trash2 className="w-5 h-5 text-red-400" /></IconButton>
              </div>
            </div>
            <div className="p-10 max-h-[70vh] overflow-y-auto">
              <input className="w-full text-4xl font-black bg-transparent focus:outline-none mb-8 tracking-tight" placeholder="Title" value={editingNote.title} onChange={(e) => setEditingNote({...editingNote, title: e.target.value})} />
              <textarea className="w-full min-h-[300px] bg-transparent focus:outline-none resize-none text-xl font-medium leading-relaxed" placeholder="Write something..." value={editingNote.content} onChange={(e) => setEditingNote({...editingNote, content: e.target.value})} />
            </div>
            <div className="flex items-center justify-between px-10 py-6 bg-gray-50 dark:bg-[#2d2e30]/50 border-t dark:border-white/5">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{editingNote.is_synced ? 'All changes saved' : 'Syncing...'}</span>
              <div className="flex gap-4">
                <button onClick={handleRefine} className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-gray-800 border-2 border-blue-500 text-blue-600 font-black rounded-2xl shadow-sm hover:bg-blue-50 transition-colors">
                  <Sparkles className={`w-5 h-5 ${isRefining ? 'animate-spin' : ''}`} /> Ai Refine
                </button>
                <button 
                  onClick={() => handleUpdateNote(editingNote.id, { title: editingNote.title, content: editingNote.content })} 
                  className="flex items-center gap-3 px-10 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl shadow-blue-600/30 active:scale-95 transition-all hover:bg-blue-700"
                >
                  <Save className="w-5 h-5" /> Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI DIFF OVERLAY */}
      {refineDiff && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-in fade-in">
          <div className="bg-white dark:bg-[#1e1e1e] w-full max-w-4xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="p-8 border-b dark:border-white/5 flex items-center justify-between">
              <h2 className="text-2xl font-black flex items-center gap-3"><Sparkles className="text-blue-600" /> Ai Revision</h2>
              <IconButton onClick={() => setRefineDiff(null)}><X className="w-6 h-6" /></IconButton>
            </div>
            <div className="grid md:grid-cols-2 gap-px bg-gray-100 dark:bg-white/5">
              <div className="bg-white dark:bg-[#1e1e1e] p-8">
                <span className="text-[10px] font-black text-gray-400 uppercase mb-4 block">Original</span>
                <p className="text-gray-500 italic whitespace-pre-wrap text-sm line-clamp-[15]">{refineDiff.original}</p>
              </div>
              <div className="bg-white dark:bg-[#1e1e1e] p-8">
                <span className="text-[10px] font-black text-blue-600 uppercase mb-4 block">Ai Refined</span>
                <p className="text-lg font-bold whitespace-pre-wrap leading-relaxed">{refineDiff.refined}</p>
              </div>
            </div>
            <div className="p-8 flex flex-col sm:flex-row gap-4 justify-end bg-gray-50/50 dark:bg-[#2d2e30]/50">
              <button onClick={() => applyRefinement('both')} className="px-8 py-3 border-2 border-blue-600 text-blue-600 font-bold rounded-2xl hover:bg-blue-50 transition-all">Keep Both</button>
              <button onClick={() => applyRefinement('replace')} className="px-10 py-3 bg-blue-600 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all hover:bg-blue-700">Apply Changes</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- HELPERS ---

const SidebarLink = ({ active, onClick, icon, label, isOpen }: any) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'hover:bg-gray-100 dark:hover:bg-[#2d2e30] text-gray-500 font-medium'}`}
  >
    {icon}
    {isOpen && <span className="font-bold whitespace-nowrap">{label}</span>}
  </button>
);

const NoteCard = ({ note, onClick, onPin, onArchive, viewMode }: any) => (
  <div 
    onClick={onClick}
    className={`group relative bg-white dark:bg-[#202124] border-2 border-transparent hover:border-blue-200 dark:hover:border-blue-900 rounded-[2rem] shadow-sm hover:shadow-2xl transition-all duration-300 cursor-default overflow-hidden animate-in fade-in ${viewMode === 'list' ? 'flex items-center gap-6 p-6' : 'p-8'}`}
  >
    <div className={`absolute top-4 right-4 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10 ${note.is_pinned ? 'opacity-100' : ''}`}>
      <div className="p-2 bg-white/80 dark:bg-black/40 backdrop-blur-sm shadow-sm rounded-full flex items-center justify-center">
        {note.is_synced ? (
          <Cloud className="w-3 h-3 text-green-500" title="Synced to Cloud" />
        ) : (
          <CloudOff className="w-3 h-3 text-gray-400 animate-pulse" title="Saving to device only" />
        )}
      </div>
      <IconButton onClick={onPin} className="bg-white/80 dark:bg-black/40 backdrop-blur-sm shadow-sm">
        <Pin className={`w-4 h-4 ${note.is_pinned ? 'fill-blue-600 text-blue-600' : 'text-gray-400'}`} />
      </IconButton>
    </div>
    <div className="flex-1 min-w-0">
      {note.title && <h4 className="font-black text-xl mb-2 truncate dark:text-white">{note.title}</h4>}
      <p className={`text-gray-500 dark:text-gray-400 font-medium leading-relaxed whitespace-pre-wrap ${viewMode === 'grid' ? 'line-clamp-6 text-sm' : 'line-clamp-2'}`}>
        {note.content || "Empty thought"}
      </p>
    </div>
    <div className="flex gap-2 mt-4 opacity-0 group-hover:opacity-100 transition-opacity">
      <IconButton onClick={onArchive}><Archive className="w-4 h-4 text-gray-400" /></IconButton>
      <IconButton onClick={(e) => e.stopPropagation()}><MoreVertical className="w-4 h-4 text-gray-400" /></IconButton>
    </div>
  </div>
);

export default App;
