/**
 * Auth Repository Interface
 * Defines contract for authentication data access
 */

export interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified: boolean;
  role: 'super_admin' | 'admin' | 'supe' | 'chaser';
  metadata: {
    createdAt: string;
    lastLoginAt: string;
  };
}

export interface SignUpData {
  email: string;
  password: string;
  displayName?: string;
  role?: 'supe' | 'chaser';
}

export interface SignInCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  token: string;
  expiresAt: Date;
}

export interface IAuthRepository {
  // Authentication methods
  signInWithEmail(credentials: SignInCredentials): Promise<AuthUser>;
  signInWithGoogle(): Promise<AuthUser>;
  signUp(data: SignUpData): Promise<AuthUser>;
  signOut(): Promise<void>;
  
  // Token management
  getIdToken(): Promise<string>;
  refreshToken(): Promise<AuthToken>;
  
  // User management
  getCurrentUser(): Promise<AuthUser | null>;
  updateUserProfile(userId: string, data: Partial<AuthUser>): Promise<void>;
  sendPasswordResetEmail(email: string): Promise<void>;
  confirmPasswordReset(code: string, newPassword: string): Promise<void>;
  sendEmailVerification(): Promise<void>;
  
  // Auth state
  onAuthStateChanged(callback: (user: AuthUser | null) => void): () => void;
  isAuthenticated(): Promise<boolean>;
}
