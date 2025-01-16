import { supabase } from '@/lib/supabase';
import { AppError, AuthError } from '@/lib/errors';
import type { User, UserRole } from '@/types/auth';

export class AuthService {
  static async signUp(email: string, password: string): Promise<User> {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { role: 'customer' }
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
        role: 'customer',
        created_at: new Date().toISOString(),
        onboarded: false
      })
      .select()
      .single();

    if (error) throw new AuthError('Failed to create profile');
    if (!data) throw new AuthError('Profile not found');

    return {
      id: data.id,
      email: data.email,
      role: data.role,
      created_at: data.created_at
    };
  }
}
