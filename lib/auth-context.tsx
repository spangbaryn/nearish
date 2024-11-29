"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { User, AuthState, UserRole } from "@/types/auth";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: false,
  error: null,
  signIn: async (email: string, password: string): Promise<void> => {},
  signUp: async (email: string, password: string): Promise<User> => ({ id: '', email: '', role: 'customer' }),
  signOut: async (): Promise<void> => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: false,
    error: null,
  });

  useEffect(() => {
    console.log("Initializing auth...");

    // Check initial session
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log(
        "Session check:",
        session ? "Found session" : "No session",
        error || ""
      );
      if (error) {
        setState((s) => ({ ...s, error: new Error(error.message) }));
        return;
      }
      setState((s) => ({ 
        ...s, 
        user: session?.user ? {
          ...session.user,
          email: session.user.email || '',
          role: (session.user.user_metadata.role as UserRole) || 'Customer'
        } : null 
      }));
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log(
        "Auth state change:",
        event,
        session ? "Session exists" : "No session"
      );
      setState((s) => ({ 
        ...s, 
        user: session?.user ? {
          ...session.user,
          email: session.user.email || '',
          role: (session.user.user_metadata.role as UserRole) || 'Customer'
        } : null 
      }));
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signIn = async (email: string, password: string) => {
    setState((s) => ({ ...s, loading: true }));
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;
    setState((s) => ({ ...s, loading: false }));
  };

  const signUp = async (email: string, password: string) => {
    setState(s => ({ ...s, loading: true, error: null }));
    
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('No user data returned');
      
      return {
        id: data.user.id,
        email: data.user.email || '',
        role: 'customer'
      };

    } catch (error) {
      setState(s => ({ ...s, error: message }));
      throw error;
    } finally {
      setState(s => ({ ...s, loading: false }));
    }
  };

  const signOut = async () => {
    setState((s) => ({ ...s, loading: true }));
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    setState((s) => ({ ...s, user: null, loading: false }));
  };

  return (
    <AuthContext.Provider value={{ ...state, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

