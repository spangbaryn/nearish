import { supabase } from "@/lib/supabase";
import type { User, UserRole } from "@/types/auth";

export async function signUp(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: {
        role: 'customer'
      }
    }
  });

  if (authError) throw authError;
  if (!authData.user) throw new Error('No user data returned');

  return {
    id: authData.user.id,
    email: authData.user.email!,
    role: 'customer' as UserRole
  };
}

export async function getUserProfile(userId: string): Promise<User> {
  console.log('[Auth] Fetching profile for user:', userId);
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('[Auth] Profile fetch error:', error);
    throw error;
  }
  if (!data) {
    console.error('[Auth] No profile found for user:', userId);
    throw new Error('Profile not found');
  }

  console.log('[Auth] Profile found:', data);
  return {
    id: data.id,
    email: data.email,
    role: data.role
  };
}