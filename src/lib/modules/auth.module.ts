/**
 * Authentication Module
 * Centralizes all authentication logic in one place
 */

import {
  Auth,
  User,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  updateProfile,
  sendPasswordResetEmail,
  confirmPasswordReset,
  UserCredential
} from 'firebase/auth';
import { auth } from '../firebase-client';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase-client';
import { saveAuthState } from '../firebase/auth-persistence';
import { logger } from '../utils/logger';

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role?: 'super_admin' | 'admin' | 'supe' | 'chaser';
  metadata?: {
    createdAt?: string;
    lastLoginAt?: string;
  };
}

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: Error | null;
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
  role?: 'supe' | 'chaser';
}

export interface SignInData {
  email: string;
  password: string;
}

class AuthenticationModule {
  private auth: Auth;
  private googleProvider: GoogleAuthProvider;

  constructor() {
    this.auth = auth;
    this.googleProvider = new GoogleAuthProvider();
    this.initializeAuth();
  }

  /**
   * Initialize authentication with persistence
   */
  private async initializeAuth() {
    try {
      await setPersistence(this.auth, browserLocalPersistence);
      logger.debug('Persistence initialized', { code: 'AuthModule' });
    } catch (error) {
      logger.error('Failed to set persistence', error as Error, { code: 'AuthModule' });
    }
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): User | null {
    return this.auth.currentUser;
  }

  /**
   * Listen to authentication state changes
   */
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void {
    return onAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = await this.enrichUserWithRole(firebaseUser);
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }

  /**
   * Sign in with email and password
   */
  async signInWithEmail(data: SignInData): Promise<AuthUser> {
    try {
      logger.debug('Signing in with email', { code: 'AuthModule', email: data.email });
      const credential = await signInWithEmailAndPassword(this.auth, data.email, data.password);
      
      // Save auth state and log event
      await this.postSignIn(credential.user);
      
      return this.enrichUserWithRole(credential.user);
    } catch (error: any) {
      logger.error('Email sign in failed', error, { code: 'AuthModule', email: data.email });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign in with Google
   */
  async signInWithGoogle(): Promise<AuthUser> {
    try {
      logger.debug('Signing in with Google', { code: 'AuthModule' });
      const credential = await signInWithPopup(this.auth, this.googleProvider);
      
      // Save auth state and log event
      await this.postSignIn(credential.user);
      
      return this.enrichUserWithRole(credential.user);
    } catch (error: any) {
      logger.error('Google sign in failed', error, { code: 'AuthModule' });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign up with email and password
   */
  async signUpWithEmail(data: SignUpData): Promise<AuthUser> {
    try {
      logger.debug('Creating account', { code: 'AuthModule', email: data.email, role: data.role });
      
      // Create user
      const credential = await createUserWithEmailAndPassword(this.auth, data.email, data.password);
      
      // Update profile if display name provided
      if (data.displayName) {
        await updateProfile(credential.user, { displayName: data.displayName });
      }
      
      // Send verification email
      await sendEmailVerification(credential.user);
      
      // Create user profile in Firestore
      await this.createUserProfile(credential.user, data.role);
      
      // Save auth state
      await this.postSignIn(credential.user);
      
      return this.enrichUserWithRole(credential.user);
    } catch (error: any) {
      logger.error('Sign up failed', error, { code: 'AuthModule', email: data.email });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Sign out
   */
  async signOut(): Promise<void> {
    try {
      logger.debug('Signing out', { code: 'AuthModule' });
      
      // Clear cookies
      document.cookie = '__emu_authed=; Path=/; Max-Age=0; SameSite=Lax';
      
      // Sign out from Firebase
      await firebaseSignOut(this.auth);
      
      logger.debug('Sign out successful', { code: 'AuthModule' });
    } catch (error: any) {
      logger.error('Sign out failed', error, { code: 'AuthModule' });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      logger.debug('Sending password reset email', { code: 'AuthModule', email });
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      logger.error('Password reset failed', error, { code: 'AuthModule', email });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Confirm password reset
   */
  async confirmPasswordReset(code: string, newPassword: string): Promise<void> {
    try {
      logger.debug('Confirming password reset', { code: 'AuthModule' });
      await confirmPasswordReset(this.auth, code, newPassword);
    } catch (error: any) {
      logger.error('Password reset confirmation failed', error, { code: 'AuthModule' });
      throw this.handleAuthError(error);
    }
  }

  /**
   * Get user role from Firestore
   */
  async getUserRole(uid: string): Promise<string | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role || null;
      }
      return null;
    } catch (error) {
      logger.error('Failed to get user role', error as Error, { code: 'AuthModule', uid });
      return null;
    }
  }

  /**
   * Update user role
   */
  async updateUserRole(uid: string, role: string): Promise<void> {
    try {
      logger.debug('Updating user role', { code: 'AuthModule', uid, role });
      await updateDoc(doc(db, 'users', uid), { role });
    } catch (error) {
      logger.error('Failed to update user role', error as Error, { code: 'AuthModule', uid, role });
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.auth.currentUser !== null;
  }

  /**
   * Check if user has specific role
   */
  async hasRole(role: string): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;
    
    const userRole = await this.getUserRole(user.uid);
    return userRole === role;
  }

  /**
   * Check if user is admin or super admin
   */
  async isAdmin(): Promise<boolean> {
    const user = this.auth.currentUser;
    if (!user) return false;
    
    const userRole = await this.getUserRole(user.uid);
    return userRole === 'admin' || userRole === 'super_admin';
  }

  // Private helper methods

  /**
   * Post sign-in tasks
   */
  private async postSignIn(user: User): Promise<void> {
    // Save auth state for persistence
    if (user.uid && user.email) {
      saveAuthState(user.uid, user.email);
    }
    
    // Set auth cookie
    const domain = window.location.hostname === 'localhost' ? '' : '; Domain=.4axe.com';
    document.cookie = `__emu_authed=1; Path=/${domain}; SameSite=Lax; Secure`;
    
    // Log auth event (could be to analytics or audit log)
    logger.debug('User authenticated', { code: 'AuthModule', email: user.email || undefined });
  }

  /**
   * Create user profile in Firestore
   */
  private async createUserProfile(user: User, role?: string): Promise<void> {
    try {
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role || 'chaser',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        emailVerified: user.emailVerified
      };
      
      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
      logger.debug('User profile created', { code: 'AuthModule', uid: user.uid, role: role || 'chaser' });
    } catch (error) {
      logger.error('Failed to create user profile', error as Error, { code: 'AuthModule', uid: user.uid });
    }
  }

  /**
   * Enrich Firebase user with role information
   */
  private async enrichUserWithRole(user: User): Promise<AuthUser> {
    const role = await this.getUserRole(user.uid);
    
    return {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      photoURL: user.photoURL,
      emailVerified: user.emailVerified,
      role: role as AuthUser['role'],
      metadata: {
        createdAt: user.metadata.creationTime,
        lastLoginAt: user.metadata.lastSignInTime
      }
    };
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(error: any): Error {
    const errorMap: { [key: string]: string } = {
      'auth/invalid-email': 'Invalid email address',
      'auth/user-disabled': 'This account has been disabled',
      'auth/user-not-found': 'No account found with this email',
      'auth/wrong-password': 'Incorrect password',
      'auth/email-already-in-use': 'An account already exists with this email',
      'auth/weak-password': 'Password should be at least 6 characters',
      'auth/invalid-credential': 'Invalid email or password',
      'auth/popup-closed-by-user': 'Sign-in cancelled',
      'auth/network-request-failed': 'Network error - please check your connection',
      'auth/too-many-requests': 'Too many failed attempts - please try again later'
    };

    const message = errorMap[error.code] || error.message || 'Authentication failed';
    return new Error(message);
  }
}

// Export singleton instance
export const authModule = new AuthenticationModule();

// Export convenience methods
export const {
  getCurrentUser,
  onAuthStateChanged: onAuth,
  signInWithEmail,
  signInWithGoogle,
  signUpWithEmail,
  signOut,
  sendPasswordResetEmail: resetPassword,
  confirmPasswordReset: confirmReset,
  getUserRole,
  updateUserRole,
  isAuthenticated,
  hasRole,
  isAdmin
} = authModule;
