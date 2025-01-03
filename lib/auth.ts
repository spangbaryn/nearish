import { AuthError, ValidationError } from '@/lib/errors';
import { supabase } from "@/lib/supabase";
import type { User, UserRole } from "@/types/auth";

export async function signUp(email: string, password: string) {
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${window.location.origin}/auth/callback`,
      data: { role: 'customer' }
    }
  });

  if (authError) throw new AuthError(authError.message);
  if (!authData.user) throw new AuthError('No user data returned');

  return {
    id: authData.user.id,
    email: authData.user.email!,
    role: 'customer' as UserRole
  };
}

export async function getUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new AuthError('Failed to fetch profile');
  if (!data) throw new AuthError('Profile not found');

  return {
    id: data.id,
    email: data.email,
    role: data.role,
    created_at: data.created_at
  };
}