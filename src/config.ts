import { publicConfig } from './config.public';
export const config = { supabaseUrl: import.meta.env.VITE_SUPABASE_URL || publicConfig.supabaseUrl, supabaseAnonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || publicConfig.supabaseAnonKey };
