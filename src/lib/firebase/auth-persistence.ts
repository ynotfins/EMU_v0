/**
 * BULLETPROOF AUTH PERSISTENCE
 * 
 * This is CRITICAL for first responders who CANNOT miss alerts.
 * Multiple fallback mechanisms ensure users NEVER get signed out.
 */

import { logger } from '@/lib/utils/logger';

const AUTH_KEYS = {
  USER_ID: 'emu_user_id',
  EMAIL: 'emu_user_email',
  LAST_AUTH: 'emu_last_auth',
  SESSION_TOKEN: 'emu_session_token',
} as const;

/**
 * Save auth state to multiple storage mechanisms
 */
export function saveAuthState(userId: string, email: string) {
  if (typeof window === 'undefined') return;

  const timestamp = new Date().toISOString();

  try {
    // Primary: localStorage
    localStorage.setItem(AUTH_KEYS.USER_ID, userId);
    localStorage.setItem(AUTH_KEYS.EMAIL, email);
    localStorage.setItem(AUTH_KEYS.LAST_AUTH, timestamp);
    
    // Fallback 1: sessionStorage
    sessionStorage.setItem(AUTH_KEYS.USER_ID, userId);
    sessionStorage.setItem(AUTH_KEYS.EMAIL, email);
    
    // Fallback 2: Cookie (90 days)
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 90);
    document.cookie = `${AUTH_KEYS.USER_ID}=${userId}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    document.cookie = `${AUTH_KEYS.EMAIL}=${email}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Lax`;
    
    logger.debug('Auth state saved to 3 locations', {
      code: 'AuthPersistence',
      email,
    });
  } catch (error) {
    logger.error('Failed to save auth state', error, {
      code: 'AuthPersistence',
    });
  }
}

/**
 * Load auth state from any available storage
 */
export function loadAuthState(): { userId: string; email: string } | null {
  if (typeof window === 'undefined') return null;

  try {
    // Try localStorage first
    let userId = localStorage.getItem(AUTH_KEYS.USER_ID);
    let email = localStorage.getItem(AUTH_KEYS.EMAIL);

    // Fallback to sessionStorage
    if (!userId) {
      userId = sessionStorage.getItem(AUTH_KEYS.USER_ID);
      email = sessionStorage.getItem(AUTH_KEYS.EMAIL);
    }

    // Fallback to cookies
    if (!userId) {
      const cookies = document.cookie.split(';').reduce((acc, cookie) => {
        const [key, value] = cookie.trim().split('=');
        acc[key] = value;
        return acc;
      }, {} as Record<string, string>);

      userId = cookies[AUTH_KEYS.USER_ID];
      email = cookies[AUTH_KEYS.EMAIL];
    }

    if (userId && email) {
      logger.debug('Auth state loaded from storage', {
        code: 'AuthPersistence',
        email,
      });
      return { userId, email };
    }

    logger.debug('No auth state found', {
      code: 'AuthPersistence',
    });
    return null;
  } catch (error) {
    logger.error('Failed to load auth state', error, {
      code: 'AuthPersistence',
    });
    return null;
  }
}

/**
 * Clear all auth state (only on manual sign out)
 */
export function clearAuthState() {
  if (typeof window === 'undefined') return;

  try {
    // Clear localStorage
    localStorage.removeItem(AUTH_KEYS.USER_ID);
    localStorage.removeItem(AUTH_KEYS.EMAIL);
    localStorage.removeItem(AUTH_KEYS.LAST_AUTH);
    localStorage.removeItem(AUTH_KEYS.SESSION_TOKEN);

    // Clear sessionStorage
    sessionStorage.removeItem(AUTH_KEYS.USER_ID);
    sessionStorage.removeItem(AUTH_KEYS.EMAIL);

    // Clear cookies
    document.cookie = `${AUTH_KEYS.USER_ID}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    document.cookie = `${AUTH_KEYS.EMAIL}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;

    logger.debug('Auth state cleared (manual sign out)', {
      code: 'AuthPersistence',
    });
  } catch (error) {
    logger.error('Failed to clear auth state', error, {
      code: 'AuthPersistence',
    });
  }
}

/**
 * Check if user was recently authenticated
 */
export function wasRecentlyAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const lastAuth = localStorage.getItem(AUTH_KEYS.LAST_AUTH);
    if (!lastAuth) return false;

    const lastAuthTime = new Date(lastAuth).getTime();
    const now = new Date().getTime();
    const hoursSinceAuth = (now - lastAuthTime) / (1000 * 60 * 60);

    // If authenticated within last 24 hours, consider it recent
    return hoursSinceAuth < 24;
  } catch {
    return false;
  }
}

