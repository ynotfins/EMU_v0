/**
 * Get Current User DTOs
 * 
 * Data Transfer Objects for retrieving the current authenticated user.
 */

export interface GetCurrentUserRequest {
  sessionToken?: string; // From cookie
  userId?: string; // Alternative if we already know the user ID
}

export interface GetCurrentUserResponse {
  userId: string;
  email: string;
  displayName: string;
  role: string;
  emailVerified: boolean;
  photoURL?: string;
  phoneNumber?: string;
  lastLogin?: string; // ISO date string
  settings: {
    notificationsEnabled: boolean;
    soundEnabled: boolean;
    locationSharingEnabled: boolean;
    maxResponseDistance?: number; // For chasers
    autoAcceptIncidents?: boolean; // For chasers
  };
  permissions: string[]; // List of permission strings
}
