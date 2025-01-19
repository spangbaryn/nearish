import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

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
    if (inviteToken) {
      const { data: invite } = await supabase
        .from('team_invites')
        .select<'*, business:businesses!inner(id)', { 
          business: { id: string }, 
          role: string,
          first_name: string,
          last_name: string 
        }>('*, business:businesses!inner(id)')
        .eq('token', inviteToken)
        .single();
      
      if (invite?.business?.id) {
        role = 'business'; // lowercase to match database
      }
    }

    // Create or update profile with upsert
    const { error: profileError } = await supabase
      .from('profiles')
      .upsert({
        id: session.user.id,
        email: session.user.email,
        role: role,
        created_at: new Date().toISOString(),
        onboarded: true
      }, { 
        onConflict: 'id'
      });

    if (profileError) throw profileError;

    if (inviteToken) {
      // Get the invite details first to get role and business ID
      const { data: invite } = await supabase
        .from('team_invites')
        .select<'*, business:businesses!inner(id)', { 
          business: { id: string }, 
          role: string,
          first_name: string,
          last_name: string 
        }>('*, business:businesses!inner(id)')
        .eq('token', inviteToken)
        .single();

      if (!invite?.business?.id) throw new Error('Invalid invite data');

      // Mark the invite as accepted
      const { error: updateInviteError } = await supabase
        .from('team_invites')
        .update({ 
          accepted_at: new Date().toISOString() 
        })
        .eq('token', inviteToken);

      if (updateInviteError) throw updateInviteError;

      // Create business member association
      const { error: memberError } = await supabase
        .from('business_members')
        .insert({
          business_id: invite.business.id,
          profile_id: session.user.id,
          role: invite.role || 'staff'
        });

      if (memberError) throw memberError;

      // Update profile with name from invite
      const { error: profileError } = await supabase
        .from('profiles')
        .update({ 
          first_name: invite.first_name,
          last_name: invite.last_name
        })
        .eq('id', session.user.id);

      if (profileError) throw profileError;

      return NextResponse.redirect(
        new URL('/home', requestUrl.origin)
      );
    }

    return NextResponse.redirect(new URL('/onboarding', requestUrl.origin));
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(
      new URL(`/auth/login?error=${encodeURIComponent('Authentication failed')}`, requestUrl.origin)
    );
  }
} 