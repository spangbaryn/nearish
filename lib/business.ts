import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/database.types';
import type { BusinessRole } from '@/types/auth';

type Business = Database['public']['Tables']['businesses']['Insert'];
type BusinessMember = Database['public']['Tables']['business_members']['Insert'];

/**
 * Creates a new business and adds the creator as an owner
 */
export async function createBusiness(business: Business, userId: string) {
  const { data: businessData, error: businessError } = await supabase
    .from('businesses')
    .insert(business)
    .select()
    .single();

  if (businessError) throw businessError;

  const member: BusinessMember = {
    profile_id: userId,
    business_id: businessData.id,
    role: 'owner'
  };

  const { error: memberError } = await supabase
    .from('business_members')
    .insert(member);

  if (memberError) throw memberError;

  return businessData;
}

/**
 * Adds a new member to a business
 */
export async function addBusinessMember(businessId: string, profileId: string, role: BusinessRole) {
  const { data, error } = await supabase
    .from('business_members')
    .insert({
      business_id: businessId,
      profile_id: profileId,
      role
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Gets all businesses a user is a member of
 */
export async function getUserBusinesses(userId: string) {
  const { data, error } = await supabase
    .from('business_members')
    .select(`
      role,
      business:businesses (
        id,
        name,
        description
      )
    `)
    .eq('profile_id', userId);

  if (error) throw error;
  return data;
} 