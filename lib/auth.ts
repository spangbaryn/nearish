import { AuthService } from '@/lib/services/auth.service';
import { AuthError } from '@/lib/errors';
import type { User } from '@/types/auth';

export async function signUp(email: string, password: string): Promise<User> {
  return AuthService.signUp(email, password);
}

export async function getUserProfile(userId: string): Promise<User> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw new AuthError('Failed to fetch profile');
  if (!data) throw new AuthError('Profile not found');
  if (!isValidUserRole(data.role)) throw new AuthError('Invalid user role');

  if (!data.email || !data.created_at) throw new AuthError('Missing required profile data');

  return {
    id: data.id,
    email: data.email,
    role: data.role as UserRole,
    created_at: data.created_at,
    ...(data.avatar_url ? { avatar_url: data.avatar_url } : {})
  };
}

function isValidUserRole(role: any): role is UserRole {
  return ['admin', 'business', 'customer'].includes(role);
}