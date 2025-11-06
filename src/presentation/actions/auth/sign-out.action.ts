'use server';

/**
 * Sign Out Server Action
 * 
 * Handles user logout by clearing session cookies.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerContainer } from '../container';
import { TOKENS } from '@infrastructure/di/tokens';
import { SignOutUseCase } from '@application/auth';
import { logger } from '@/lib/utils/logger';

// Cookie names
const SESSION_COOKIE_NAME = '__emu_session';
const AUTH_COOKIE_NAME = '__emu_authed';

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const cookieStore = await cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (sessionToken) {
      const container = getServerContainer();
      const signOutUseCase = container.get<SignOutUseCase>(TOKENS.SignOutUseCase);

      // Invalidate the session server-side
      await signOutUseCase.execute({ sessionToken });
    }

    // Clear cookies
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(AUTH_COOKIE_NAME);

  } catch (error) {
    logger.error('Sign out error', error as Error, { code: 'SignOutAction' });
    // Still clear cookies even if server invalidation fails
    const cookieStore = await cookies();
    cookieStore.delete(SESSION_COOKIE_NAME);
    cookieStore.delete(AUTH_COOKIE_NAME);
  }

  // Redirect to login page
  redirect('/login');
}
