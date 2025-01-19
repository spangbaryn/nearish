import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(
  request: Request,
  { params }: { params: { token: string } }
) {
  if (!params.token) {
    return NextResponse.json({ error: 'Token is required' }, { status: 400 })
  }

  try {
    const supabase = createRouteHandlerClient({ cookies })
    
    // Log the token we're querying
    console.log('Verifying token:', params.token)

    const { data, error } = await supabase
      .from('team_invites')
      .select('*, businesses(id, name)')
      .eq('token', params.token)
      .is('accepted_at', null)
      .single()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Invalid or expired invitation' }, { status: 400 })
    }

    if (!data) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Server error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 