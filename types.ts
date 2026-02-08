
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string;
  is_pinned: boolean;
  is_archived: boolean;
  created_at: string;
  updated_at: string;
  color?: string;
  is_synced?: boolean; // New property to track if note is in cloud
}

export type SortOption = 'updated_at' | 'created_at';

export interface User {
  id: string;
  email: string;
}

export interface RefineResult {
  original: string;
  refined: string;
}
