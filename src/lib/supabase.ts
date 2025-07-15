import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type AuthUser = {
  id: string;
  email: string;
  user_metadata?: {
    firstname?: string;
    lastname?: string;
    role?: string;
    store_numbers?: number[];
    selected_store?: number;
    app_metadata?: any;
  };
};

export type AuthSession = {
  access_token: string;
  refresh_token: string;
  user: AuthUser;
}; 