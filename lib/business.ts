import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { BusinessRole, TeamMember } from '@/types/auth';

type BusinessMember = Database['public']['Tables']['business_members']['Insert'];

/**
 * Gets all businesses a user is a member of
 */
export async function getUserBusinesses(userId: string) {
  const { data, error } = await supabase
    .from('business_members')
    .select(`
      role,
      business:businesses!inner(
        id,
        name,
        description
      )
    `)
    .eq('profile_id', userId);

  if (error) throw error;
  return data as unknown as Array<{
    role: BusinessRole;
    business: {
      id: string;
      name: string;
      description: string | null;
    }
  }>;
}

export async function getBusinessMembers(businessId: string): Promise<TeamMember[]> {
  const { data, error } = await supabase
    .from('business_members')
    .select(`
      id,
      role,
      profile:profiles!inner(
        id,
        email,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('business_id', businessId);

  if (error) throw error;
  return (data || []) as unknown as TeamMember[];
}

export async function removeBusinessMember(businessId: string, profileId: string) {
  const { error } = await supabase
    .from('business_members')
    .delete()
    .eq('business_id', businessId)
    .eq('profile_id', profileId);

  if (error) throw error;
}

export async function updateBusinessMemberRole(
  businessId: string, 
  profileId: string, 
  role: BusinessRole
) {
  const { error } = await supabase
    .from('business_members')
    .update({ role })
    .eq('business_id', businessId)
    .eq('profile_id', profileId);

  if (error) throw error;
} 