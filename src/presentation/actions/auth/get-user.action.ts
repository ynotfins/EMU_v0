'use server';

/**
 * Get User Server Action
 * 
 * Retrieves the current authenticated user from session.
 */

import { cookies } from 'next/headers';
import { getServerContainer } from '../container';
import { TOKENS } from '@infrastructure/di/tokens';
import { GetCurrentUserUseCase } from '@application/auth';
import { User } from '@domain/entities/user/user.entity';

const SESSION_COOKIE_NAME = '__emu_session';

export interface GetUserResult {
  user: SerializedUser | null;
  error?: string;
}

export interface SerializedUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  status: string;
  photoURL?: string;
  phoneNumber?: string;
  emailVerified: boolean;
  settings: {
    maxResponseDistance?: number;
    notificationsEnabled?: boolean;
    soundEnabled?: boolean;
    autoAcceptIncidents?: boolean;
    locationSharingEnabled?: boolean;
  };
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser(): Promise<GetUserResult> {
  try {
    const cookieStore = cookies();
    const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;

    if (!sessionToken) {
      return { user: null };
    }

    const container = getServerContainer();
    const getCurrentUserUseCase = container.get<GetCurrentUserUseCase>(TOKENS.GetCurrentUserUseCase);

    const result = await getCurrentUserUseCase.execute({ sessionToken });

    if (result.isLeft()) {
      // Session invalid or expired
      return { 
        user: null,
        error: result.value.message,
      };
    }

    const { user } = result.value;

    // Serialize the user entity for client consumption
    const serializedUser: SerializedUser = {
      id: user.id.value,
      email: user.email.value,
      displayName: user.displayName,
      role: user.role.value,
      status: user.status,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      emailVerified: user.emailVerified,
      settings: user.settings,
    };

    return { user: serializedUser };
  } catch (error) {
    console.error('Get current user error:', error);
    return {
      user: null,
      error: 'An unexpected error occurred',
    };
  }
}

/**
 * Check if user is authenticated (for middleware)
 */
export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = cookies();
  const sessionToken = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  
  if (!sessionToken) {
    return false;
  }

  const result = await getCurrentUser();
  return result.user !== null;
}

/**
 * Get user role (for authorization)
 */
export async function getUserRole(): Promise<string | null> {
  const result = await getCurrentUser();
  return result.user?.role || null;
}

/**
 * Check if user has required role
 */
export async function hasRole(requiredRoles: string[]): Promise<boolean> {
  const userRole = await getUserRole();
  if (!userRole) return false;
  
  return requiredRoles.includes(userRole);
}
