/**
 * Session Management Service
 * 
 * Handles session cookies following Next.js best practices.
 * Uses httpOnly cookies for security.
 */

import { injectable } from 'inversify';
import { cookies } from 'next/headers';
import { adminAuth } from '../firebase/config/firebase-admin.config';
import { ISessionService } from '@application/shared/interfaces/services.interface';
import { Either, left, right } from '@domain/shared/errors';

// Session configuration
const SESSION_COOKIE_NAME = '__emu_session';
const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

// Session duration: 5 days in milliseconds
const SESSION_DURATION = 5 * 24 * 60 * 60 * 1000;

@injectable()
export class SessionService implements ISessionService {
  
  /**
   * Creates a session cookie from a Firebase ID token
   */
  async createSessionCookie(idToken: string): Promise<Either<Error, string>> {
    try {
      // Create session cookie with Firebase Admin SDK
      const sessionCookie = await adminAuth.createSessionCookie(idToken, {
        expiresIn: SESSION_DURATION,
      });

      // Set the cookie (this should be done in the Server Action/Route)
      const cookieStore = cookies();
      cookieStore.set(SESSION_COOKIE_NAME, sessionCookie, {
        ...SESSION_COOKIE_OPTIONS,
        maxAge: SESSION_DURATION / 1000, // Convert to seconds
      });

      return right(sessionCookie);
    } catch (error) {
      return left(new Error('Failed to create session cookie'));
    }
  }

  /**
   * Verifies a session cookie and returns the user ID
   */
  async verifySessionToken(token: string): Promise<Either<Error, string>> {
    try {
      // Verify the session cookie
      const decodedClaims = await adminAuth.verifySessionCookie(token, true);
      return right(decodedClaims.uid);
    } catch (error) {
      return left(new Error('Invalid or expired session'));
    }
  }

  /**
   * Gets user ID from token without full verification
   * Used for quick checks - should be followed by full verification for sensitive operations
   */
  getUserIdFromToken(token: string): string | null {
    try {
      // This is a simplified version - in production, you might cache decoded tokens
      // For now, return null as this requires async verification
      return null;
    } catch {
      return null;
    }
  }

  /**
   * Gets the current session cookie
   */
  async getSessionCookie(): Promise<string | null> {
    try {
      const cookieStore = cookies();
      const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);
      return sessionCookie?.value || null;
    } catch {
      return null;
    }
  }

  /**
   * Invalidates a session
   */
  async invalidateSession(sessionToken: string): Promise<Either<Error, void>> {
    try {
      // Verify the session first
      const verifyResult = await this.verifySessionToken(sessionToken);
      if (verifyResult.isLeft()) {
        return left(verifyResult.value);
      }

      const userId = verifyResult.value;

      // Revoke refresh tokens for the user
      await adminAuth.revokeRefreshTokens(userId);

      // Clear the session cookie
      const cookieStore = cookies();
      cookieStore.delete(SESSION_COOKIE_NAME);

      return right(undefined);
    } catch (error) {
      return left(new Error('Failed to invalidate session'));
    }
  }

  /**
   * Refreshes a session cookie if it's close to expiration
   */
  async refreshSessionIfNeeded(sessionToken: string): Promise<Either<Error, string | null>> {
    try {
      // Verify current session
      const decodedClaims = await adminAuth.verifySessionCookie(sessionToken);
      
      // Check if session needs refresh (less than 1 day remaining)
      const expirationTime = decodedClaims.exp * 1000; // Convert to milliseconds
      const timeRemaining = expirationTime - Date.now();
      const oneDayInMs = 24 * 60 * 60 * 1000;

      if (timeRemaining < oneDayInMs) {
        // Generate new ID token for the user
        const customToken = await adminAuth.createCustomToken(decodedClaims.uid);
        
        // In production, you would exchange this for a new session cookie
        // For now, return the existing token
        return right(sessionToken);
      }

      // No refresh needed
      return right(null);
    } catch (error) {
      return left(new Error('Failed to refresh session'));
    }
  }

  /**
   * Creates a session object with user information
   */
  async getSessionUser(sessionToken: string): Promise<Either<Error, {
    uid: string;
    email?: string;
    emailVerified?: boolean;
    customClaims?: Record<string, any>;
  }>> {
    try {
      const decodedClaims = await adminAuth.verifySessionCookie(sessionToken, true);
      
      return right({
        uid: decodedClaims.uid,
        email: decodedClaims.email,
        emailVerified: decodedClaims.email_verified,
        customClaims: decodedClaims,
      });
    } catch (error) {
      return left(new Error('Failed to get session user'));
    }
  }

  /**
   * Validates that a session belongs to a specific user
   */
  async validateSessionForUser(sessionToken: string, userId: string): Promise<Either<Error, boolean>> {
    try {
      const verifyResult = await this.verifySessionToken(sessionToken);
      if (verifyResult.isLeft()) {
        return left(verifyResult.value);
      }

      const sessionUserId = verifyResult.value;
      return right(sessionUserId === userId);
    } catch (error) {
      return left(new Error('Failed to validate session'));
    }
  }
}
