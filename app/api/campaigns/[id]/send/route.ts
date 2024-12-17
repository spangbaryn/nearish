import { NextResponse, NextRequest } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendCampaignEmail, EmailServiceError } from '@/lib/email-service';
import { AuthError } from '@/lib/errors';

export async function POST(request: NextRequest) {
  const supabase = createRouteHandlerClient({ cookies });

  try {
    // Extract 'id' from request URL
    const { pathname } = request.nextUrl;
    const segments = pathname.split('/');
    const id = segments[segments.indexOf('campaigns') + 1];

    // Ensure 'id' is present
    if (!id) {
      throw new Error('Campaign ID not found in URL');
    }

    // Get the current session
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
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

    // Fetch campaign data
    const { data: campaignData, error: campaignError } = await supabase
      .from('campaigns')
      .select(`
        *,
        email_templates (
          subject,
          content
        )
      `)
      .eq('id', id)
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

    // Map over subscribers to get emails
    const recipientEmails: string[] = subscribers
      .map(sub => (sub.profiles as unknown as { email: string }).email)
      .filter(Boolean);

    if (recipientEmails.length === 0) {
      throw new Error('No subscribers found for this list');
    }

    // Send the campaign email
    const { response, recipientCount } = await sendCampaignEmail(
      id,
      campaignData.email_templates.subject,
      campaignData.email_templates.content,
      recipientEmails
    );

    // Update campaign sent_at timestamp
    const { error: updateError } = await supabase
      .from('campaigns')
      .update({ sent_at: new Date().toISOString() })
      .eq('id', id);

    if (updateError) {
      throw new Error('Failed to update campaign status');
    }

    return NextResponse.json({
      success: true,
      message: 'Campaign sent successfully',
      recipientCount,
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