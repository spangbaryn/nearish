import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get('token_hash')
  const type = requestUrl.searchParams.get('type')
  const redirect_to = requestUrl.searchParams.get('redirect_to')

  if (!token_hash || !type) {
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=Invalid authentication link`
    )
  }

  // Create a Supabase client
  const supabase = createRouteHandlerClient({ cookies })

  try {
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery'
    })

    if (error) throw error

    // Now the user is logged in on the server side
    // Redirect to the target page or /dashboard
    return NextResponse.redirect(redirect_to || `${requestUrl.origin}/dashboard`)
  } catch (error) {
    console.error('Error verifying OTP:', error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=Authentication+failed`
    )
  }
}