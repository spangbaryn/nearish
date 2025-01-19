import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { token } = await request.json()

    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) throw new Error('Authentication required')

    // Get the invite
    const { data: invite, error: inviteError } = await supabase
      .from('team_invites')
      .select('*, businesses(id)')
      .eq('token', token)
      .is('accepted_at', null)
      .single()

    if (inviteError || !invite) {
      throw new Error('Invalid or expired invitation')
    }

    // Start a transaction
    const { error: acceptError } = await supabase.rpc('accept_team_invite', {
      p_token: token,
      p_user_id: user.id
    })

    if (acceptError) throw acceptError

    return NextResponse.json({ 
      success: true,
      business_id: invite.businesses.id
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
} 