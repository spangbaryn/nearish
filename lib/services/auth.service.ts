import { supabase } from '@/lib/supabase';
import { AppError, AuthError } from '@/lib/errors';
import type { User, UserRole } from '@/types/auth';

export class AuthService {
  static async signUp(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      }
    });

    if (authError) throw new AuthError(authError.message);
    if (!authData.user) throw new AuthError('No user data returned');

    return this.createProfile(authData.user.id, email);
  }

  static async createProfile(userId: string, email: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email,
        role: 'customer' as UserRole,
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw new AuthError('Failed to create profile');
    if (!data) throw new AuthError('Profile not found');
    if (!isValidUserRole(data.role)) throw new AuthError('Invalid user role');

    if (!data.created_at) throw new AuthError('Missing creation timestamp');

    return {
      id: data.id,
      email: data.email,
      role: data.role as UserRole,
      created_at: data.created_at
    };
  }

  static async signIn(email: string, password: string): Promise<User> {
    const { data: { session }, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw new AuthError(error.message);
    if (!session?.user) throw new AuthError('No session created');

    return this.getUserProfile(session.user.id);
  }

  static async getUserProfile(userId: string): Promise<User> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) throw new AuthError('Failed to fetch profile');
    if (!data) throw new AuthError('Profile not found');
    if (!isValidUserRole(data.role)) throw new AuthError('Invalid user role');
    if (!data.created_at) throw new AuthError('Missing creation timestamp');

    return {
      id: data.id,
      email: data.email,
      role: data.role as UserRole,
      created_at: data.created_at
    };
  }
}

function isValidUserRole(role: any): role is UserRole {
  return ['admin', 'business', 'customer'].includes(role);
}
