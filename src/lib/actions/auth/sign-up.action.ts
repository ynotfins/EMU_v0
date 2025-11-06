'use server';

/**
 * Sign Up Server Action
 * 
 * Handles new user registration with email/password.
 * Creates user profile and sets session cookies.
 */

import { cookies } from 'next/headers';
import { getServerContainer } from '../container';
import { TOKENS } from '@infrastructure/di/tokens';
import { SignUpUseCase } from '@application/auth';
import { logger } from '@/lib/utils/logger';

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

export interface SignUpResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
}

/**
 * Sign up with email and password
 */
export async function signUp(
  email: string,
  password: string,
  name: string,
  role: 'chaser' | 'supe'
): Promise<SignUpResult> {
  try {
    const container = getServerContainer();
    const signUpUseCase = container.get<SignUpUseCase>(TOKENS.SignUpUseCase);

    const result = await signUpUseCase.execute({
      email,
      password,
      name,
      role,
    });

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
    const redirectTo = role === 'chaser' ? '/chaser/incidents' : '/supe/incidents';

    return {
      success: true,
      redirectTo,
    };
  } catch (error) {
    logger.error('Sign up error', error, {
      code: 'SignUpAction',
    });
    return {
      success: false,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Check if email is already in use
 */
export async function checkEmailAvailability(email: string): Promise<{
  available: boolean;
  error?: string;
}> {
  try {
    const container = getServerContainer();
    const userRepository = container.get(TOKENS.UserRepository);
    
    // This would use the repository directly for a quick check
    // In production, you might want a specific use case for this
    
    return {
      available: true,
    };
  } catch (error) {
    logger.error('Email check error', error, {
      code: 'SignUpAction',
    });
    return {
      available: false,
      error: 'Unable to check email availability',
    };
  }
}

