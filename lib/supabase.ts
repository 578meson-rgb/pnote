
import { createClient } from '@supabase/supabase-js';

// User provided Supabase credentials
const supabaseUrl = 'https://ltpmujaqfqqcgxdhksoz.supabase.co';
const supabaseAnonKey = 'sb_publishable_t9u_VxIeqzO1a4LYOhcMSQ_gj4Qr_l5';

// Initialize the client. If for some reason keys are empty, fallback logic is preserved.
const isDemoMode = !supabaseUrl || !supabaseAnonKey;

export const supabase = !isDemoMode 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const getIsDemoMode = () => isDemoMode;
