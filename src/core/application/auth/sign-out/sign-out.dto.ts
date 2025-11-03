/**
 * Sign Out DTOs
 * 
 * Data Transfer Objects for the sign-out use case.
 */

export interface SignOutRequest {
  sessionToken: string;
  userId?: string; // Optional for additional validation
}

export interface SignOutResponse {
  success: boolean;
}
