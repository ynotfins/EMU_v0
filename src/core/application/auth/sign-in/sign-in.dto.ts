/**
 * Sign In DTOs
 * 
 * Data Transfer Objects for the sign-in use case.
 * Supports both email/password and Google sign-in.
 */

export interface SignInWithEmailRequest {
  email: string;
  password: string;
}

export interface SignInWithGoogleRequest {
  idToken: string; // Firebase ID token from client-side Google sign-in
}

export interface SignInResponse {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  sessionToken?: string; // For server-side session cookie creation
}
