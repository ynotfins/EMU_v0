/**
 * Sign Up DTOs
 * 
 * Data Transfer Objects for the sign-up use case.
 */

export interface SignUpRequest {
  email: string;
  password: string;
  displayName: string;
  role?: 'chaser' | 'supe'; // Optional, defaults to 'chaser'
  phoneNumber?: string;
}

export interface SignUpResponse {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: false; // Always false for new signups
  verificationEmailSent: boolean;
}
