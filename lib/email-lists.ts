import { supabase } from '@/lib/supabase';
import { AuthError } from '@/lib/errors';
import type { Database } from '@/types/database.types';

type EmailList = Database['public']['Tables']['email_lists']['Row'];
type ProfileListSubscription = Database['public']['Tables']['profile_list_subscriptions']['Row'];

/**
 * Get all email lists a user is subscribed to
 */
export async function getUserLists(userId: string): Promise<EmailList[]> {
  const { data, error } = await supabase
    .from('profile_list_subscriptions')
    .select(`
      email_lists (
        id,
        name,
        description,
        created_at,
        updated_at
      )
    `)
    .eq('profile_id', userId)
    .is('unsubscribed_at', null);

  console.log('Supabase response:', JSON.stringify(data, null, 2));

  if (error) throw new AuthError('Failed to fetch user lists');
  return data?.map(subscription => subscription.email_lists as unknown as EmailList) || [];
}

/**
 * Subscribe a user to an email list
 */
export async function subscribeToList(userId: string, listId: string): Promise<void> {
  const { error } = await supabase
    .from('profile_list_subscriptions')
    .upsert({
      profile_id: userId,
      list_id: listId,
      unsubscribed_at: null
    }, {
      onConflict: 'profile_id,list_id'
    });

  if (error) throw new AuthError('Failed to subscribe to list');
}

/**
 * Unsubscribe a user from an email list
 */
export async function unsubscribeFromList(userId: string, listId: string): Promise<void> {
  const { error } = await supabase
    .from('profile_list_subscriptions')
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq('profile_id', userId)
    .eq('list_id', listId);

  if (error) throw new AuthError('Failed to unsubscribe from list');
}

/**
 * Get all available email lists
 */
export async function getAllLists(): Promise<EmailList[]> {
  const { data, error } = await supabase
    .from('email_lists')
    .select('*')
    .order('name');

  if (error) throw new AuthError('Failed to fetch email lists');
  return data || [];
} 