import { AuthError } from '@/lib/errors';
import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Log the request path so you can trace which routes are processed
  console.debug("Middleware - request path:", req.nextUrl.pathname);
  
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (error) throw new AuthError(error.message);

    // If the user is logged in and accesses the public homepage, redirect to /home
    if (req.nextUrl.pathname === '/' && session) {
      console.debug("Logged in user on homepage; redirecting to /home");
      return NextResponse.redirect(new URL('/home', req.url));
    }

    // Handle routes starting with /auth
    if (req.nextUrl.pathname.startsWith('/auth')) {
      console.debug("Accessing /auth route:", req.nextUrl.pathname);
      if (session) {
        // Check if the user needs onboarding
        const { data: profile } = await supabase
          .from('profiles')
          .select('onboarded')
          .eq('id', session.user.id)
          .single();

        if (!profile?.onboarded) {
          console.debug("User not onboarded; redirecting to /onboarding");
          return NextResponse.redirect(new URL('/onboarding', req.url));
        }

        console.debug("User onboarded; redirecting to /home");
        return NextResponse.redirect(new URL('/home', req.url));
      }
      return NextResponse.next();
    }

    // Exclude public business pages: any path starting with /b
    if (req.nextUrl.pathname.startsWith('/b')) {
      console.debug("Public business page accessed; skipping auth checks:", req.nextUrl.pathname);
      return NextResponse.next();
    }

    // Protected routes (excluding auth, onboarding, invite, auth/callback, root, business)
    if (
      !req.nextUrl.pathname.startsWith('/auth') &&
      !req.nextUrl.pathname.startsWith('/onboarding') &&
      !req.nextUrl.pathname.startsWith('/invite') &&
      !req.nextUrl.pathname.startsWith('/auth/callback') &&
      req.nextUrl.pathname !== '/' &&
      req.nextUrl.pathname !== '/business'
    ) {
      console.debug("Protected route accessed:", req.nextUrl.pathname);
      if (!session) {
        console.debug("No session; redirecting to /auth/login");
        return NextResponse.redirect(new URL('/auth/login', req.url));
      }

      // Check if user needs onboarding on protected routes
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarded')
        .eq('id', session.user.id)
        .single();

      if (!profile?.onboarded) {
        console.debug("User not onboarded on protected route; redirecting to /onboarding");
        return NextResponse.redirect(new URL('/onboarding', req.url));
      }

      console.debug("User authenticated and onboarded; allowing access");
      return NextResponse.next();
    }

    // Optional: additional handling for /onboarding routes if needed
    if (req.nextUrl.pathname.startsWith('/onboarding')) {
      console.debug("Onboarding route accessed:", req.nextUrl.pathname);
      const response = NextResponse.next();
      response.headers.set('x-layout', 'auth');
      return response;
    }

    console.debug("Returning final response for:", req.nextUrl.pathname);
    return res;
  } catch (error) {
    console.error("Middleware error:", error);
    if (error instanceof AuthError) {
      return NextResponse.redirect(new URL('/auth/login', req.url));
    }
    throw error;
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