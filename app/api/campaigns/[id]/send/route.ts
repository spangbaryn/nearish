import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { sendCampaignEmail, EmailServiceError } from '@/lib/email-service';
import { AuthError } from '@/lib/errors';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const supabase = createRouteHandlerClient({ cookies });
  let campaign: any;
  
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
      .eq('id', params.id)
      .single();

    if (campaignError || !campaignData) {
      throw new Error('Campaign not found');
    }

    campaign = campaignData;

    if (campaign.sent_at) {
      throw new Error('Campaign has already been sent');
    }

    const { response, recipientCount } = await sendCampaignEmail(
      params.id,
      campaign.email_templates.subject,
      campaign.email_templates.content,
      campaign.list_id
    );

    return NextResponse.json({ 
      success: true,
      message: 'Campaign sent successfully',
      recipientCount
    });

  } catch (error: any) {
    console.error('Campaign send error:', {
      error,
      campaignId: params.id,
      campaignDetails: campaign
    });
    
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