import { createContext } from 'react';
import type { Session } from '@supabase/supabase-js';

export type AuthContextValue = {
  session: Session | null;
  loading: boolean;
  isSupabaseConfigured: boolean;
  isAdmin: boolean;
  authError: string | null;
  signInWithEmail: (email: string, password: string) => Promise<{ error: string | null }>;
  signOutSupabase: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);
