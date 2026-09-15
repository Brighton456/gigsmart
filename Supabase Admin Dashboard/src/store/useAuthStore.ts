import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { User } from '../lib/supabase';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
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

      // Fetch user profile from users table
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', data.user?.id)
        .single();

      if (userError) throw userError;

      set({ user: userData, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  signOut: async () => {
    set({ loading: true });
    try {
      await supabase.auth.signOut();
      set({ user: null, loading: false });
    } catch (error: any) {
      set({ error: error.message, loading: false });
    }
  },

  checkAuth: async () => {
    set({ loading: true });
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', user.id)
          .single();

        if (userError) throw userError;
        set({ user: userData });
      }
    } catch (error: any) {
      console.error('Auth check error:', error);
    } finally {
      set({ loading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
