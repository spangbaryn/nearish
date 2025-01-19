"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { User } from "@/types/auth";
import { AuthError } from "@/lib/errors";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";

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
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();

  // Debounce the profile sync function
  const debouncedSyncProfile = debounce(async (userId: string, email: string) => {
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (existingProfile) {
      setUser(existingProfile as User);
      return;
    }

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
  }, 1000); // 1 second delay

  useEffect(() => {
    let mounted = true;

    const initialize = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user && mounted) {
          await debouncedSyncProfile(session.user.id, session.user.email!);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
          setIsInitialized(true);
        }
      }
    };

    initialize();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isInitialized || !mounted) return;
        
        if (session?.user) {
          await debouncedSyncProfile(session.user.id, session.user.email!);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
      debouncedSyncProfile.cancel();
    };
  }, [isInitialized]);

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
        router.push('/auth/login');
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

