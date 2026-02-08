
import { createClient } from '@supabase/supabase-js';

// Fallback to the hardcoded keys if environment variables are missing
const supabaseUrl = (typeof process !== 'undefined' && process.env.SUPABASE_URL) 
  || 'https://ltpmujaqfqqcgxdhksoz.supabase.co';
const supabaseAnonKey = (typeof process !== 'undefined' && process.env.SUPABASE_ANON_KEY) 
  || 'sb_publishable_t9u_VxIeqzO1a4LYOhcMSQ_gj4Qr_l5';

const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = !isDemoMode 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getIsDemoMode = () => isDemoMode;
