"use client";

import { createContext, useContext, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import type { User, UserRole } from "@/types/auth";
import { getUserProfile } from "@/lib/auth";
import { AuthError } from "@/lib/errors";

export type AuthContextType = {
  user: User | null;
  isLoading: boolean;
  error: Error | null;
  signIn: (email: string, password: string) => Promise<User>;
  signUp: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

async function fetchAuthState() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw new AuthError(error.message);
  
  if (session?.user) {
    const profile = await getUserProfile(session.user.id);
    return { user: profile };
  }
  return { user: null };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const queryClient = useQueryClient();
  
  const { data, error, isLoading } = useQuery({
    queryKey: ['auth'],
    queryFn: fetchAuthState,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      queryClient.invalidateQueries({ queryKey: ['auth'] });
    });

    return () => subscription.unsubscribe();
  }, [queryClient]);

  const value = {
    user: data?.user ?? null,
    isLoading,
    error: error as Error | null,
    signIn: async (email: string, password: string) => {
      const { data: { session }, error } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });
      if (error) throw new AuthError(error.message);
      if (!session?.user) throw new AuthError('No session created');
      
      return getUserProfile(session.user.id);
    },
    signUp: async (email: string, password: string) => {
      const { data: authData, error } = await supabase.auth.signUp({
        email,
        password,
        options: { 
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { role: 'customer' }
        }
      });
      if (error) throw new AuthError(error.message);
      if (!authData.user) throw new AuthError('No user data returned');

      return {
        id: authData.user.id,
        email: authData.user.email!,
        role: 'customer' as UserRole,
        created_at: new Date().toISOString()
      };
    },
    signOut: async () => {
      try {
        await supabase.auth.signOut();
        window.location.href = '/auth/login';
      } catch (error) {
        console.error('Error signing out:', error);
      }
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

