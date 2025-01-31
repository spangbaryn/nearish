import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse, NextRequest } from 'next/server'

type RouteContext = any // Bypass strict typing temporarily

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  try {
    const { id } = context.params;
    const supabase = createRouteHandlerClient({ cookies })
    const { data, error } = await supabase
      .from('team_invites')
      .select('*')
      .eq('business_id', id)
      .is('accepted_at', null)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error: any) {
    console.error('Failed to fetch invites:', error)
    return NextResponse.json({ error: 'Failed to fetch invites' }, { status: 500 })
  }
} 