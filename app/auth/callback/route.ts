import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth/login`)
  }

  const supabase = createRouteHandlerClient({ cookies })
  
  try {
    await supabase.auth.exchangeCodeForSession(code)
    return NextResponse.redirect(`${requestUrl.origin}/home`)
  } catch (error) {
    console.error('Auth callback error:', error)
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Failed to verify email`)
  }
} 