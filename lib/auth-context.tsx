"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/auth";
import { getUserProfile } from "@/lib/auth";

interface AuthState {
  user: User | null;
  loading: boolean;
  error: Error | null;
  initialized: boolean;
}

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshSession: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

const LOADING_TIMEOUT = 3000; // 3 seconds max loading time

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
    initialized: false
  });

  const refreshSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setState(prev => ({ ...prev, user: profile, loading: false, error: null, initialized: true }));
      } else {
        setState(prev => ({ ...prev, user: null, loading: false, error: null, initialized: true }));
      }
    } catch (error) {
      setState(prev => ({ ...prev, error: error as Error, loading: false, initialized: true }));
    }
  };

  useEffect(() => {
    const loadingTimeout = setTimeout(() => {
      setState(prev => ({
        ...prev,
        loading: false,
        initialized: true,
        error: prev.loading ? new Error('Auth loading timeout') : prev.error
      }));
    }, LOADING_TIMEOUT);

    refreshSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          setState(prev => ({ ...prev, user: profile, loading: false, error: null, initialized: true }));
        } catch (error) {
          setState(prev => ({ ...prev, error: error as Error, loading: false, initialized: true }));
        }
      } else {
        setState(prev => ({ ...prev, user: null, loading: false, error: null, initialized: true }));
      }
    });

    return () => {
      clearTimeout(loadingTimeout);
      subscription.unsubscribe();
    };
  }, []);

  // Don't render anything until we've initialized
  if (!state.initialized) {
    return null;
  }

  const value = {
    ...state,
    refreshSession,
    signIn: async (email: string, password: string) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
        throw error;
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    },
    signUp: async (email: string, password: string) => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
        });
        if (error) throw error;
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
        throw error;
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    },
    signOut: async () => {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
        const { error } = await supabase.auth.signOut();
        if (error) throw error;
        setState(prev => ({ ...prev, user: null }));
      } catch (error) {
        setState(prev => ({ ...prev, error: error as Error }));
        throw error;
      } finally {
        setState(prev => ({ ...prev, loading: false }));
      }
    }
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

