/**
 * Authentication Middleware
 * 
 * Protects routes and validates sessions using Next.js middleware.
 * Runs on the Edge runtime for optimal performance.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Cookie names
const SESSION_COOKIE_NAME = '__emu_session';
const AUTH_COOKIE_NAME = '__emu_authed';

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/signup',
  '/signup/new',
  '/forgot-password',
  '/reset-password',
  '/unauthorized',
  '/about',
  '/contact',
  '/privacy',
  '/terms',
];

// Static assets and API routes that should be ignored
const IGNORED_PATHS = [
  '/_next',
  '/api',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '.png',
  '.jpg',
  '.jpeg',
  '.svg',
  '.gif',
  '.ico',
  '.webp',
  '.css',
  '.js',
];

// Role-based route access
const ROLE_ROUTES = {
  chaser: ['/chaser'],
  supe: ['/supe'],
  admin: ['/admin'],
};

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for ignored paths
  if (IGNORED_PATHS.some(path => pathname.includes(path))) {
    return NextResponse.next();
  }
  
  // Allow access to public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }
  
  // Check for authentication cookie
  const authCookie = request.cookies.get(AUTH_COOKIE_NAME);
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);
  
  // If not authenticated, redirect to login
  if (!authCookie || !sessionCookie) {
    const redirectUrl = new URL('/login', request.url);
    redirectUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(redirectUrl);
  }
  
  // Role-based route protection
  // Note: For now, we're just checking if the route starts with the role path
  // In production, you'd validate the actual role from the session token
  
  // Check if accessing a role-specific route
  for (const [role, routes] of Object.entries(ROLE_ROUTES)) {
    if (routes.some(route => pathname.startsWith(route))) {
      // For now, we'll allow access if authenticated
      // In production, decode the session token to verify the role
      return NextResponse.next();
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
