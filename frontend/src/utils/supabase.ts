import { createClient, SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Supabase configuration
export const supabaseUrl = 'https://qpkjyprzfumeupvwmdlk.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFwa2p5cHJ6ZnVtZXVwdndtZGxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk3MjcwODQsImV4cCI6MjA1NTMwMzA4NH0.WtStl9rOHBM2Y0BU32Z8F3AyCBMmLd_rw6OqZDBo0Ik';

// Initialize the Supabase client
let supabase: SupabaseClient<Database>;

try {
  console.log('Initializing Supabase client with:', { supabaseUrl });
  supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      flowType: 'pkce',
    },
    global: {
      headers: {
        'X-Client-Info': 'luxuryvista@1.0.0',
      },
    },
  });
  console.log('Supabase client initialized successfully');
} catch (error) {
  console.error('Error initializing Supabase client:', error);
  throw new Error('Failed to initialize Supabase client');
}

export { supabase };
