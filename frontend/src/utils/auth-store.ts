import { create } from 'zustand';
import { supabase } from './supabase';
import { toast } from 'sonner';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone: string;
  investmentRange: string;
  propertyTypes: string[];
  preferredRegions: string[];
  occupation: string;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null });
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      if (!data.user) throw new Error('Falha ao fazer login');
      
      set({ user: data.user });
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signUp: async (email: string, password: string, profile: Omit<UserProfile, 'id' | 'createdAt' | 'updatedAt'>) => {
    set({ loading: true, error: null });
    
    try {
      // 1. Sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/verify-email`,
          data: {
            full_name: profile.fullName,
          },
        },
      });
      
      if (authError) throw authError;
      if (!authData.user) throw new Error('Falha ao criar conta');
      
      // 2. Create the profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          email,
          full_name: profile.fullName,
          phone: profile.phone,
          investment_range: profile.investmentRange,
          property_types: profile.propertyTypes,
          preferred_regions: profile.preferredRegions,
          occupation: profile.occupation,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      
      if (profileError) {
        console.error('Profile creation error:', profileError);
        throw new Error('Falha ao criar perfil');
      }
      
      set({ user: authData.user });
      toast.success('Conta criada com sucesso! Verifique seu email.');
      
    } catch (error) {
      console.error('Signup error:', error);
      set({ error: error as Error });
      toast.error((error as Error).message);
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      set({ user: null });
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },

  resetPassword: async (email: string) => {
    set({ loading: true, error: null });
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email);
      if (error) throw error;
    } catch (error) {
      set({ error: error as Error });
      throw error;
    } finally {
      set({ loading: false });
    }
  },
}));

// Initialize auth state
supabase.auth.onAuthStateChange((event, session) => {
  useAuthStore.setState({ user: session?.user ?? null });
});
