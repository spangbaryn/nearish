import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/response'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    
    try {
      await supabase.auth.exchangeCodeForSession(code)
      
      // Get the user after exchange
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('Failed to get user after verification')
      }

      // Create profile after email verification
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            role: 'Customer'
          }
        ])
        .single()

      if (profileError) {
        console.error('Failed to create profile:', profileError)
        // Continue anyway since the user is verified
      }

      // Redirect to home page after successful verification
      return NextResponse.redirect(`${requestUrl.origin}/home`)
    } catch (error) {
      console.error('Auth callback error:', error)
      return NextResponse.redirect(
        `${requestUrl.origin}/auth/login?error=Failed to verify email`
      )
    }
  }

  // Return to login if no code present
  return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
} 