"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { AuthState, User } from "@/types/auth";

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, role: UserRole) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (data: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
  });
  const router = useRouter();

  useEffect(() => {
    // Check active sessions and subscribe to auth changes
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        updateUserState(session);
      }
      setState((s) => ({ ...s, loading: false }));
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session) {
          await updateUserState(session);
        } else {
          setState({ user: null, loading: false });
        }
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  async function updateUserState(session: any) {
    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (error) {
      console.error('Error fetching user data:', error);
      return;
    }

    setState({
      user: {
        id: session.user.id,
        email: session.user.email,
        role: userData.role,
        businessRole: userData.business_role || undefined,
        businessId: userData.business_id || undefined,
        metadata: session.user.user_metadata
      },
      loading: false
    });
  }

  const value = {
    ...state,
    signIn: async (email: string, password: string) => {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    },
    signUp: async (email: string, password: string, role: UserRole) => {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { role },
        },
      });
      if (error) throw error;
    },
    signOut: async () => {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      router.push("/auth/login");
    },
    updateUser: async (data: Partial<User>) => {
      const { error } = await supabase.auth.updateUser({
        data: data.metadata,
      });
      if (error) throw error;
    },
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}; 