import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendCampaignEmail, EmailServiceError } from '@/lib/email-service';
import { AuthError } from '@/lib/errors';

export async function POST(
  request: Request,
  context: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    if (error) throw new AuthError(error.message);
    if (!session?.user) throw new AuthError('No user in session');

    // Check admin role
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profileError) throw new AuthError('Failed to fetch user profile');
    if (!profile || profile.role !== 'admin') throw new AuthError('Admin access required');

    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        email_templates (
          subject,
          content
        )
      `)
      .eq('id', context.params.id)
      .single();

    if (campaignError || !campaignData) {
      throw new Error('Campaign not found');
    }

    // Fetch subscribers from the list
    const { data: subscribers, error: subscribersError } = await supabase
      .from('profile_list_subscriptions')
      .select(`
        profiles (
          email
        )
      `)
      .eq('list_id', campaignData.list_id)
      .is('unsubscribed_at', null);

    if (subscribersError) {
      throw new Error('Failed to fetch subscribers');
    }

    const recipientEmails: string[] = subscribers
      .map(sub => sub.profiles.email)
      .filter(Boolean);

    if (recipientEmails.length === 0) {
      throw new Error('No subscribers found for this list');
    }

    const { response, recipientCount } = await sendCampaignEmail(
      context.params.id,
      campaignData.email_templates.subject,
      campaignData.email_templates.content,
      recipientEmails
    );

    // Update campaign sent_at timestamp
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', context.params.id);

    if (updateError) {
      throw new Error('Failed to update campaign status');
    }

    return NextResponse.json({ 
      success: true,
      message: 'Campaign sent successfully',
      recipientCount
    });

  } catch (error: any) {
    console.error('Campaign send error:', error);
    
    if (error instanceof AuthError) {
      return NextResponse.json({ error: error.message }, { status: 401 });
    }
    
    if (error instanceof EmailServiceError) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}