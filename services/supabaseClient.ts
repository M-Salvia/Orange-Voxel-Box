
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

/**
 * Safely retrieves environment variables from the global process object.
 * Handles cases where 'process' or 'process.env' might be undefined in certain environments.
 */
const getEnv = (key: string): string => {
  try {
    if (typeof process !== 'undefined' && process.env) {
      return (process.env as any)[key] || '';
    }
    return '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = getEnv('VITE_SUPABASE_ANON_KEY');

/**
 * A mock Supabase client that mimics the structure of the real client.
 * This allows the application to continue running without crashing if
 * Supabase credentials are not provided.
 */
const mockSupabase = {
  auth: {
    getSession: async () => ({ data: { session: null }, error: null }),
    onAuthStateChange: () => ({ 
      data: { 
        subscription: { 
          unsubscribe: () => {
            console.debug("Mock Supabase: Unsubscribed from auth changes.");
          } 
        } 
      } 
    }),
    signInWithPassword: async () => ({ data: {}, error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') }),
    signUp: async () => ({ data: {}, error: new Error('Supabase is not configured. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.') }),
    signOut: async () => ({ error: null }),
  },
  from: () => ({
    select: () => ({
      eq: () => ({
        single: async () => ({ data: null, error: null })
      })
    }),
    update: () => ({
      eq: () => ({
        eq: async () => ({ data: null, error: null }),
        single: async () => ({ data: null, error: null })
      }),
      eq_async: async () => ({ data: null, error: null })
    }),
    insert: () => ({
      select: async () => ({ data: null, error: null })
    })
  })
} as any;

// Only attempt to create the client if the URL is valid (not empty)
export const supabase = (supabaseUrl && supabaseUrl.startsWith('http')) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (() => {
      console.warn("Supabase configuration missing or invalid. Application is running in local-only mode. Persistence features will be disabled.");
      return mockSupabase;
    })();
