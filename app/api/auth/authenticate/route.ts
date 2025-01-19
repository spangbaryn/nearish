import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { NextRequest, NextResponse } from 'next/server'

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

  // Create a NextResponse to allow Supabase to set cookies
  const response = NextResponse.next()
  // Pass both req and res to createRouteHandlerClient
  const supabase = createRouteHandlerClient({ req: request, res: response })

  try {
    const { data: { session }, error } = await supabase.auth.verifyOtp({
      token_hash,
      type
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