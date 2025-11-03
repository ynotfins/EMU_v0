'use server';

/**
 * Sign In Server Action
 * 
 * Handles email/password and Google sign-in through Server Actions.
 * Sets httpOnly session cookies for security.
 */

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getServerContainer } from '../container';
import { TOKENS } from '@infrastructure/di/tokens';
import { 
  SignInWithEmailUseCase,
  SignInWithGoogleUseCase 
} from '@application/auth';

// Cookie configuration
const SESSION_COOKIE_NAME = '__emu_session';
const AUTH_COOKIE_NAME = '__emu_authed';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 5 * 24 * 60 * 60, // 5 days in seconds
};

export interface SignInResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Sign in with email and password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<SignInResult> {
  try {
    const container = getServerContainer();
    const signInUseCase = container.get<SignInWithEmailUseCase>(TOKENS.SignInUseCase);

    const result = await signInUseCase.execute({ email, password });

    if (result.isLeft()) {
      return {
        success: false,
        error: result.value.message,
      };
    }

    const { user, sessionToken } = result.value;

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, COOKIE_OPTIONS);
    cookieStore.set(AUTH_COOKIE_NAME, '1', COOKIE_OPTIONS);

    // Determine redirect based on role
    const redirectTo = getRedirectForRole(user.role.value);

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Sign in with Google
 */
export async function signInWithGoogle(
  idToken: string
): Promise<SignInResult> {
  try {
    const container = getServerContainer();
    const signInUseCase = container.get<SignInWithGoogleUseCase>(TOKENS.SignInWithGoogleUseCase);

    const result = await signInUseCase.execute({ idToken });

    if (result.isLeft()) {
      return {
        success: false,
        error: result.value.message,
      };
    }

    const { user, sessionToken } = result.value;

    // Set session cookie
    const cookieStore = await cookies();
    cookieStore.set(SESSION_COOKIE_NAME, sessionToken, COOKIE_OPTIONS);
    cookieStore.set(AUTH_COOKIE_NAME, '1', COOKIE_OPTIONS);

    // Determine redirect based on role
    const redirectTo = getRedirectForRole(user.role.value);

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    console.error('Google sign in error:', error);
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Server-side redirect after sign in
 */
export async function redirectAfterSignIn(role: string): Promise<void> {
  const redirectTo = getRedirectForRole(role);
  redirect(redirectTo);
}

/**
 * Get redirect URL based on user role
 */
function getRedirectForRole(role: string): string {
  switch (role) {
    case 'super_admin':
    case 'admin':
    case 'supe':
      return '/supe/incidents';
    case 'chaser':
      return '/chaser/incidents';
    default:
      return '/';
  }
}
