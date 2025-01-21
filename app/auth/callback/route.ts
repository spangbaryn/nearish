import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { BusinessService } from '@/lib/services/business.service'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type');
  const inviteToken = requestUrl.searchParams.get('invite');
  
  try {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    if (!token_hash || !type) {
      throw new Error('Missing authentication parameters');
    }

    const { data: { session }, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'email' | 'invite' | 'recovery' | 'signup' | 'magiclink'
    });

    if (error) throw error;
    if (!session) throw new Error('No session after verification');

    // Get the invite first to determine role
    let role = 'customer'; // lowercase to match database
    let invite = null;
    if (inviteToken) {
      invite = await supabase
        .from('team_invites')
        .select('*, business:businesses!inner(id)')
        .eq('token', inviteToken)
        .single();
      
      if (invite?.data) {
        role = 'business';
        
        // Create or update profile
        const { error: profileError } = await supabase
          .from('profiles')
          .upsert({
            id: session.user.id,
            email: session.user.email,
            first_name: invite.data.first_name,
            last_name: invite.data.last_name,
            role: role,
            created_at: new Date().toISOString(),
            onboarded: true
          });

        if (profileError) throw profileError;

        // Add them as a business member
        const { error: memberError } = await supabase
          .from('business_members')
          .insert({
            business_id: invite.data.business.id,
            profile_id: session.user.id,
            role: invite.data.role,
            created_at: new Date().toISOString()
          });

        if (memberError) throw memberError;

        // Mark invite as accepted
        const { error: inviteError } = await supabase
          .from('team_invites')
          .update({ status: 'accepted' })
          .eq('token', inviteToken);

        if (inviteError) throw inviteError;

        return NextResponse.redirect(new URL('/home', requestUrl.origin));
      }
    }

    return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
    );
  }
} 