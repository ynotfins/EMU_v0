/**
 * Authentication Middleware
 * 
 * NOTE: Currently DISABLED because Firebase Auth uses localStorage, not cookies.
 * The middleware was checking for cookies that Firebase Auth doesn't set,
 * causing redirect loops. Client-side Firebase Auth handles authentication via
 * ProtectedRoute component instead.
 * 
 * TODO: If you want server-side auth checking, implement cookie-based auth
 * or use Firebase Admin SDK to verify tokens server-side.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

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

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for ignored paths
  if (IGNORED_PATHS.some(path => pathname.includes(path))) {
    return NextResponse.next();
  }
  
  // MIDDLEWARE DISABLED - Firebase Auth handles authentication client-side
  // via ProtectedRoute component. No server-side cookie checking needed.
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
