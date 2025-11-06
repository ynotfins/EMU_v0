/**
 * Firebase Auth Repository Implementation
 * Implements IAuthRepository using Firebase Auth
 */

import {
  Auth,
  User as FirebaseUser,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  confirmPasswordReset,
  updateProfile,
  sendEmailVerification,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase-client';
import {
  IAuthRepository,
  AuthUser,
  SignInCredentials,
  SignUpData,
  AuthToken,
} from '../interfaces/repositories/auth.repository.interface';
import { AuthRepositoryError, AuthErrorCode } from '../errors/auth.errors';

export class FirebaseAuthRepository implements IAuthRepository {
  private auth: Auth;
  private googleProvider: GoogleAuthProvider;

  constructor(authInstance: Auth = auth) {
    this.auth = authInstance;
    this.googleProvider = new GoogleAuthProvider();
  }

  async signInWithEmail(credentials: SignInCredentials): Promise<AuthUser> {
    try {
      const userCredential = await signInWithEmailAndPassword(
        this.auth,
        credentials.email,
        credentials.password
      );
      return this.mapFirebaseUserToAuthUser(userCredential.user);
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async signInWithGoogle(): Promise<AuthUser> {
    try {
      const userCredential = await signInWithPopup(this.auth, this.googleProvider);
      return this.mapFirebaseUserToAuthUser(userCredential.user);
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async signUp(data: SignUpData): Promise<AuthUser> {
    try {
      const userCredential = await createUserWithEmailAndPassword(
        this.auth,
        data.email,
        data.password
      );

      // Update display name if provided
      if (data.displayName) {
        await updateProfile(userCredential.user, {
          displayName: data.displayName,
        });
      }

      // Send verification email
      await sendEmailVerification(userCredential.user);

      // Create user profile in Firestore
      await this.createUserProfile(userCredential.user, data.role);

      return this.mapFirebaseUserToAuthUser(userCredential.user);
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async signOut(): Promise<void> {
    try {
      await firebaseSignOut(this.auth);
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async getIdToken(): Promise<string> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthRepositoryError(
          AuthErrorCode.NOT_AUTHENTICATED,
          'No authenticated user'
        );
      }
      return await user.getIdToken();
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async refreshToken(): Promise<AuthToken> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthRepositoryError(
          AuthErrorCode.NOT_AUTHENTICATED,
          'No authenticated user'
        );
      }
      
      const token = await user.getIdToken(true);
      const tokenResult = await user.getIdTokenResult();
      
      return {
        token,
        expiresAt: new Date(tokenResult.expirationTime),
      };
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async getCurrentUser(): Promise<AuthUser | null> {
    const user = this.auth.currentUser;
    if (!user) return null;
    return this.mapFirebaseUserToAuthUser(user);
  }

  async updateUserProfile(
    userId: string,
    data: Partial<AuthUser>
  ): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (!user || user.uid !== userId) {
        throw new AuthRepositoryError(
          AuthErrorCode.PERMISSION_DENIED,
          'Cannot update other user profiles'
        );
      }

      // Update Firebase Auth profile
      if (data.displayName !== undefined || data.photoURL !== undefined) {
        await updateProfile(user, {
          displayName: data.displayName || user.displayName,
          photoURL: data.photoURL || user.photoURL,
        });
      }

      // Update Firestore profile
      await setDoc(
        doc(db, 'users', userId),
        {
          ...data,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async sendPasswordResetEmail(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(this.auth, email);
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async confirmPasswordReset(
    code: string,
    newPassword: string
  ): Promise<void> {
    try {
      await confirmPasswordReset(this.auth, code, newPassword);
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  async sendEmailVerification(): Promise<void> {
    try {
      const user = this.auth.currentUser;
      if (!user) {
        throw new AuthRepositoryError(
          AuthErrorCode.NOT_AUTHENTICATED,
          'No authenticated user'
        );
      }
      await sendEmailVerification(user);
    } catch (error: any) {
      throw this.handleFirebaseAuthError(error);
    }
  }

  onAuthStateChanged(
    callback: (user: AuthUser | null) => void
  ): () => void {
    return firebaseOnAuthStateChanged(this.auth, async (firebaseUser) => {
      if (firebaseUser) {
        const authUser = await this.mapFirebaseUserToAuthUser(firebaseUser);
        callback(authUser);
      } else {
        callback(null);
      }
    });
  }

  async isAuthenticated(): Promise<boolean> {
    return this.auth.currentUser !== null;
  }

  // Private helper methods

  private async mapFirebaseUserToAuthUser(
    firebaseUser: FirebaseUser
  ): Promise<AuthUser> {
    // Get role from Firestore
    const role = await this.getUserRole(firebaseUser.uid);

    return {
      uid: firebaseUser.uid,
      email: firebaseUser.email,
      displayName: firebaseUser.displayName,
      photoURL: firebaseUser.photoURL,
      emailVerified: firebaseUser.emailVerified,
      role: role || 'chaser',
      metadata: {
        createdAt: firebaseUser.metadata.creationTime || '',
        lastLoginAt: firebaseUser.metadata.lastSignInTime || '',
      },
    };
  }

  private async getUserRole(uid: string): Promise<AuthUser['role'] | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      if (userDoc.exists()) {
        return userDoc.data().role || null;
      }
      return null;
    } catch (error) {
      console.error('Failed to get user role:', error);
      return null;
    }
  }

  private async createUserProfile(
    user: FirebaseUser,
    role?: 'supe' | 'chaser'
  ): Promise<void> {
    try {
      const userProfile = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        role: role || 'chaser',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        emailVerified: user.emailVerified,
      };

      await setDoc(doc(db, 'users', user.uid), userProfile, { merge: true });
    } catch (error) {
      console.error('Failed to create user profile:', error);
    }
  }

  private handleFirebaseAuthError(error: any): AuthRepositoryError {
    const errorMap: { [key: string]: AuthErrorCode } = {
      'auth/invalid-email': AuthErrorCode.INVALID_EMAIL,
      'auth/user-disabled': AuthErrorCode.USER_DISABLED,
      'auth/user-not-found': AuthErrorCode.USER_NOT_FOUND,
      'auth/wrong-password': AuthErrorCode.WRONG_PASSWORD,
      'auth/invalid-credential': AuthErrorCode.INVALID_CREDENTIALS,
      'auth/email-already-in-use': AuthErrorCode.EMAIL_ALREADY_EXISTS,
      'auth/weak-password': AuthErrorCode.WEAK_PASSWORD,
      'auth/popup-closed-by-user': AuthErrorCode.POPUP_CLOSED,
      'auth/network-request-failed': AuthErrorCode.NETWORK_ERROR,
      'auth/too-many-requests': AuthErrorCode.TOO_MANY_REQUESTS,
      'auth/operation-not-allowed': AuthErrorCode.OPERATION_NOT_ALLOWED,
    };

    const code = errorMap[error.code] || AuthErrorCode.UNKNOWN;
    return new AuthRepositoryError(code, error.message, error);
  }
}
