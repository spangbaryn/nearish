import { AuthError } from '@/lib/errors';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PUBLIC_ROUTES = [
  '/',
  '/auth',
  '/b',
  '/business',
  '/onboarding',
  '/invite',
  '/auth/callback'
]

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
    )

    if (isPublicRoute) {
      return res;
    }

    const { data: { session }, error } = await supabase.auth.getSession();

    if (error?.message?.includes('rate limit')) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      return res;
    }

    if (error) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('onboarded')
      .eq('id', session.user.id)
      .single();

    if (!profile?.onboarded && !req.nextUrl.pathname.startsWith('/onboarding')) {
      return NextResponse.redirect(new URL('/onboarding', req.url));
    }

    return res;
  } catch (error) {
    const isPublicRoute = PUBLIC_ROUTES.some(route => 
      req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
    );
    if (isPublicRoute) {
      return res;
    }
    return NextResponse.redirect(new URL('/auth/login', req.url));
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (assets folder)
     * - api (api routes - let them handle their own auth)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets|api).*)',
  ],
} 