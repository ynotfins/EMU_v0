/**
 * Auth Store
 * 
 * Global state management for authentication using Zustand.
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import type { SerializedUser } from '@/lib/actions/auth';

interface AuthState {
  // State
  user: SerializedUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setUser: (user: SerializedUser | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        ...initialState,
        
        setUser: (user) =>
          set(
            { 
              user, 
              isAuthenticated: !!user,
              error: null 
            },
            false,
            'setUser'
          ),
        
        setLoading: (isLoading) =>
          set({ isLoading }, false, 'setLoading'),
        
        setError: (error) =>
          set({ error }, false, 'setError'),
        
        reset: () =>
          set(initialState, false, 'reset'),
      }),
      {
        name: 'auth-store',
        // Only persist the user, not loading/error states
        partialize: (state) => ({ 
          user: state.user,
          isAuthenticated: state.isAuthenticated 
        }),
      }
    ),
    {
      name: 'AuthStore',
    }
  )
);

// Selectors
export const selectUser = (state: AuthState) => state.user;
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectAuthLoading = (state: AuthState) => state.isLoading;
export const selectAuthError = (state: AuthState) => state.error;
export const selectUserRole = (state: AuthState) => state.user?.role || null;

// Utility functions
export const hasRole = (state: AuthState, roles: string[]) => {
  const userRole = selectUserRole(state);
  return userRole ? roles.includes(userRole) : false;
};

export const isAdmin = (state: AuthState) => 
  hasRole(state, ['admin', 'super_admin']);

export const isSupe = (state: AuthState) => 
  hasRole(state, ['supe', 'admin', 'super_admin']);

export const isChaser = (state: AuthState) => 
  hasRole(state, ['chaser']);
