
import { createClient } from '@supabase/supabase-js';

// Safe environment variable retrieval
const getEnv = (key: string, fallback: string): string => {
  try {
    // Check for process.env (Node/Vite) or import.meta.env (Vite)
    const val = (typeof process !== 'undefined' && process.env && process.env[key]) 
             || (typeof (import.meta as any).env !== 'undefined' && (import.meta as any).env[key]);
    return val || fallback;
  } catch (e) {
    return fallback;
  }
};

const supabaseUrl = getEnv('SUPABASE_URL', 'https://ltpmujaqfqqcgxdhksoz.supabase.co');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY', 'sb_publishable_t9u_VxIeqzO1a4LYOhcMSQ_gj4Qr_l5');

// Only initialize if we have valid-looking strings
const isValid = supabaseUrl.startsWith('http') && supabaseAnonKey.length > 10;

export const supabase = isValid 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getIsDemoMode = () => !supabase;
