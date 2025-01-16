"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/auth";
import { AuthError } from "@/lib/errors";

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Single function to handle profile creation/update
  async function syncProfile(userId: string, email: string) {
    // First try to get existing profile
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      setUser(existingProfile as User);
      return;
    }

    // If no profile exists, create one
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        role: 'customer',
        created_at: new Date().toISOString(),
        onboarded: false
      })
      .select()
      .single();

    if (error) {
      console.error('Profile sync error:', error);
      return;
    }

    setUser(data as User);
  }

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        syncProfile(session.user.id, session.user.email!);
      }
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          await syncProfile(session.user.id, session.user.email!);
        } else {
          setUser(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isLoading,
      signIn: async (email, password) => {
        const { error } = await supabase.auth.signInWithPassword({ 
          email, 
          password 
        });
        if (error) throw new AuthError(error.message);
      },
      signUp: async (email, password) => {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'customer' }
          }
        });
        if (error) throw new AuthError(error.message);
      },
      signOut: async () => {
        await supabase.auth.signOut();
      }
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}

