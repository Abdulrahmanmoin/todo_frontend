// frontend/middleware.ts
import { auth } from './src/lib/server-auth';
import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  // Get the session from the request
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  // Define protected routes
  const protectedPaths = ['/dashboard', '/profile', '/api/protected'];
  const isProtectedPath = protectedPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  // If user is accessing a protected route but not authenticated
  if (isProtectedPath && !session) {
    // Redirect to login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If user is logged in and trying to access login/signup pages, redirect to dashboard
  const authPaths = ['/login', '/signup'];
  const isAuthPath = authPaths.some(path =>
    request.nextUrl.pathname.startsWith(path)
  );

  if (isAuthPath && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};