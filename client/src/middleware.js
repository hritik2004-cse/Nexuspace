import { NextResponse } from 'next/server';

export function middleware(request) {
  // Extract token from cookies. We use csrf_token as a proxy for session existence 
  // because refresh_token is path-restricted to /api/auth/refresh and invisible to Next.js routes.
  const token = request.cookies.get('csrf_token')?.value;

  // Paths requiring authentication
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/workspace');
  const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/register');

  if (isProtectedRoute && !token) {
    // Redirect unauthenticated traffic down to Login
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (isAuthRoute && token) {
    // Redirect already authenticated traffic away from login directly back into workspace
    const workspaceUrl = new URL('/workspace', request.url);
    return NextResponse.redirect(workspaceUrl);
  }

  // Continue rendering normally
  return NextResponse.next();
}

// Config maps what pathnames to run middleware against natively without invoking regex
export const config = {
  matcher: ['/workspace/:path*', '/login', '/register'],
};
