import { supabase } from '@/lib/supabase';
import { AuthError } from '@/lib/errors';
import type { BusinessRole } from '@/types/auth';

export class BusinessService {
  static async createBusinessMember(businessId: string, userId: string, role: string) {
    // First update profile role
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'business' })
      .eq('id', userId);

    if (profileError) throw new AuthError('Failed to update profile role');

    // Then create business member
    const { error: memberError } = await supabase
      .from('business_members')
      .insert({
        business_id: businessId,
        profile_id: userId,
        role
      });

    if (memberError) throw new AuthError('Failed to create business member');
  }
} 