import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (!code) {
    console.error('No code found. Full URL:', request.url);
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Missing confirmation code`);
  }

  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw error;
    if (!session?.user) throw new Error('No user in session');

    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email,
        role: 'customer'
      })
      .single();

    if (profileError && profileError.code !== '23505') { // Ignore duplicate key errors
      throw profileError;
    }

    return NextResponse.redirect(`${requestUrl.origin}/home`);
  } catch (error) {
    console.error('Auth callback error:', error);
    return NextResponse.redirect(`${requestUrl.origin}/auth/login?error=Authentication failed`);
  }
} 