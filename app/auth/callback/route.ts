import { AuthError } from '@/lib/errors';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  
  if (!code) {
    throw new AuthError('Missing confirmation code');
  }

  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) throw new AuthError(error.message);
    if (!session?.user) throw new AuthError('No user in session');

    // Create profile if it doesn't exist
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: session.user.id,
        email: session.user.email,
        role: 'customer'
      })
      .single();

    if (profileError) {
      // Only throw if it's not a duplicate key error
      if (profileError.code !== '23505') {
        throw new AuthError('Failed to create user profile');
      }
    }

    return NextResponse.redirect(`${requestUrl.origin}/home`);
  } catch (error) {
    const errorMessage = error instanceof AuthError ? error.message : 'Authentication failed';
    return NextResponse.redirect(
      `${requestUrl.origin}/auth/login?error=${encodeURIComponent(errorMessage)}`
    );
  }
} 