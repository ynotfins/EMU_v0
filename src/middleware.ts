/**
 * Authentication Middleware
 * 
 * Server-side authentication check using session cookies.
 * Provides additional security layer beyond client-side ProtectedRoute.
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { adminAuth } from '@/lib/firebase-admin';

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

// Public routes that don't require authentication
const PUBLIC_ROUTES = [
  '/login',
  '/signup',
  '/',
];

// Role-based route mappings
// Note: (app) route group is shared between roles - Next.js route groups don't appear in URL
const ROLE_ROUTES: Record<string, string[]> = {
  supe: ['/supe', '/chat'],  // Allow /chat/* routes (maps to (app)/chat)
  chaser: ['/chaser', '/chat'],  // Allow /chat/* routes (maps to (app)/chat)
  admin: ['/admin', '/supe', '/chaser', '/chat'],
};

/**
 * Get user role from session cookie
 */
async function getUserRoleFromSession(request: NextRequest): Promise<string | null> {
  try {
    const sessionCookie = request.cookies.get('__emu_session')?.value;
    if (!sessionCookie) {
      return null;
    }

    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie, true);
    return decodedClaims.role || decodedClaims.customClaims?.role || null;
  } catch {
    return null;
  }
}

/**
 * Check if route requires authentication
 */
function isProtectedRoute(pathname: string): boolean {
  return !PUBLIC_ROUTES.some(route => pathname === route || pathname.startsWith(route + '/'));
}

/**
 * Check if route matches user role
 */
function isRoleRoute(pathname: string, role: string | null): boolean {
  if (!role) return false;
  
  const allowedRoutes = ROLE_ROUTES[role] || [];
  return allowedRoutes.some(route => pathname.startsWith(route));
}

/**
 * Get home route for role
 */
function getRoleHome(role: string | null): string {
  if (!role) return '/login';
  
  const roleRoutes: Record<string, string> = {
    supe: '/supe/incidents',
    chaser: '/chaser/incidents',
    admin: '/admin',
  };
  
  return roleRoutes[role] || '/login';
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for ignored paths
  if (IGNORED_PATHS.some(path => pathname.includes(path))) {
    return NextResponse.next();
  }
  
  // Public routes don't require authentication
  if (!isProtectedRoute(pathname)) {
    return NextResponse.next();
  }
  
  // Get user role from session
  const userRole = await getUserRoleFromSession(request);
  
  // Redirect to login if not authenticated
  if (!userRole) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }
  
  // Check role-based access
  if (!isRoleRoute(pathname, userRole)) {
    // User has wrong role for this route - redirect to their home
    const homeUrl = new URL(getRoleHome(userRole), request.url);
    return NextResponse.redirect(homeUrl);
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
