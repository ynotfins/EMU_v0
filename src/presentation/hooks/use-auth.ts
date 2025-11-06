/**
 * useAuth Hook
 * 
 * Provides authentication state and methods for client components.
 * Works with Server Actions for authentication operations.
 */

'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getCurrentUser, 
  signOut as signOutAction,
  type SerializedUser 
} from '@/lib/actions/auth';
import { logger } from '@/lib/utils/logger';

interface AuthState {
  user: SerializedUser | null;
  loading: boolean;
  error: string | null;
}

interface UseAuthReturn {
  user: SerializedUser | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

export function useAuth(): UseAuthReturn {
  const router = useRouter();
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  /**
   * Fetch current user from server
   */
  const fetchUser = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      const result = await getCurrentUser();
      
      if (result.error) {
        setState({ user: null, loading: false, error: result.error });
      } else {
        setState({ user: result.user, loading: false, error: null });
      }
    } catch (error) {
      logger.error('Error fetching user', error as Error, { code: 'useAuth' });
      setState({ 
        user: null, 
        loading: false, 
        error: 'Failed to fetch user information' 
      });
    }
  }, []);

  /**
   * Sign out the user
   */
  const signOut = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true }));
      await signOutAction();
      // Server action handles redirect
    } catch (error) {
      logger.error('Sign out error', error as Error, { code: 'useAuth' });
      setState(prev => ({ ...prev, loading: false, error: 'Failed to sign out' }));
    }
  }, []);

  /**
   * Refresh user data
   */
  const refreshUser = useCallback(async () => {
    await fetchUser();
  }, [fetchUser]);

  // Fetch user on mount
  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    isAuthenticated: !!state.user,
    signOut,
    refreshUser,
  };
}

/**
 * Hook for role-based access control
 */
export function useRole(allowedRoles: string[]): {
  hasAccess: boolean;
  loading: boolean;
  userRole: string | null;
} {
  const { user, loading } = useAuth();
  
  return {
    hasAccess: user ? allowedRoles.includes(user.role) : false,
    loading,
    userRole: user?.role || null,
  };
}

/**
 * Hook for protecting routes
 */
export function useProtectedRoute(
  allowedRoles?: string[],
  redirectTo: string = '/login'
) {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      // Not authenticated
      if (!user) {
        router.push(redirectTo as any);
        return;
      }

      // Role check
      if (allowedRoles && !allowedRoles.includes(user.role)) {
        router.push('/unauthorized' as any);
      }
    }
  }, [user, loading, allowedRoles, redirectTo, router]);

  return { user, loading };
}
