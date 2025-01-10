import { supabase } from "./supabase"
import { AuthError } from "./errors"
import type { Database } from "@/types/database.types"

type ZipCode = Database["public"]["Tables"]["zip_codes"]["Row"]
type ZipCodeStatus = {
  id: string
  zip_code_id: string
  is_active: boolean
  start_date: string
  end_date: string | null
  campaign_id?: string
  reason?: string
  created_by: string
}

export async function isZipCodeActive(zipCode: string, campaignId?: string): Promise<boolean> {
  const { data: zipCodeData, error: zipError } = await supabase
    .from('zip_codes')
    .select('id')
    .eq('code', zipCode)
    .single();

  if (zipError) throw new AuthError('Failed to check zip code');
  if (!zipCodeData) return false;

  const query = supabase
    .from('zip_code_status' as any)
    .select('*')
    .eq('zip_code_id', zipCodeData.id)
    .eq('is_active', true)
    .is('end_date', null);

  if (campaignId) {
    query.or(`campaign_id.eq.${campaignId},campaign_id.is.null`);
  }

  const { data: statusData, error: statusError } = await query;

  if (statusError) throw new AuthError('Failed to check zip code status');
  return statusData && statusData.length > 0;
}

export async function activateZipCode(
  zipCode: string, 
  userId: string, 
  reason?: string, 
  campaignId?: string
): Promise<void> {
  // First get or create the zip code
  const { data: existingZip, error: zipError } = await supabase
    .from('zip_codes')
    .select('id')
    .eq('code', zipCode)
    .single();

  if (zipError && zipError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new AuthError('Failed to check zip code');
  }

  let zipCodeId = existingZip?.id;

  // If zip code doesn't exist, we need to create it
  // Note: In practice, you might want to validate the zip code and fetch city/state data
  if (!zipCodeId) {
    const { data: newZip, error: createError } = await supabase
      .from('zip_codes')
      .insert({
        code: zipCode,
        city: 'Unknown', // You might want to fetch this from an API
        state: 'Unknown', // You might want to fetch this from an API
      })
      .select('id')
      .single();

    if (createError) throw new AuthError('Failed to create zip code');
    zipCodeId = newZip.id;
  }

  // Deactivate any existing active status
  const { error: updateError } = await supabase
    .from('zip_code_status' as any)
    .update({ end_date: new Date().toISOString() })
    .eq('zip_code_id', zipCodeId)
    .is('end_date', null);

  if (updateError) throw new AuthError('Failed to update existing status');

  // Create new active status
  const { error: insertError } = await supabase
    .from('zip_code_status' as any)
    .insert({
      zip_code_id: zipCodeId,
      is_active: true,
      start_date: new Date().toISOString(),
      campaign_id: campaignId,
      reason,
      created_by: userId
    });

  if (insertError) throw new AuthError('Failed to activate zip code');
} 