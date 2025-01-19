import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { createClient } from '@supabase/supabase-js'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import crypto from 'crypto'

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })
    const { businessId, email, firstName, lastName, role } = await request.json()

    // Get the business details
    const { data: business } = await supabase
      .from('businesses')
      .select('name')
      .eq('id', businessId)
      .single()

    if (!business) {
      throw new Error('Business not found')
    }

    // Generate a unique invite token
    const inviteToken = crypto.randomUUID()

    // Store the invitation in the database
    const { error: inviteError } = await supabase
      .from('team_invites')
      .insert({
        business_id: businessId,
        email,
        first_name: firstName,
        last_name: lastName,
        role,
        token: inviteToken,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) throw inviteError

    // Send invite using Supabase's invite template
    const { error: inviteUserError } = await supabaseAdmin.auth.admin.inviteUserByEmail(email, {
      data: {
        invite_token: inviteToken,
        business_name: business.name,
        role: role,
        first_name: firstName,
        last_name: lastName
      }
    })

    if (inviteUserError) throw inviteUserError

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Invite error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
} 