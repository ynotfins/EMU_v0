/**
 * Authentication Server Actions
 * 
 * Re-exports all auth-related server actions for easy importing.
 */

export { signInWithEmail, signInWithGoogle, type SignInResult } from './sign-in.action';
export { signUp, checkEmailAvailability, type SignUpResult } from './sign-up.action';
export { signOut } from './sign-out.action';
export { 
  getCurrentUser, 
  isAuthenticated, 
  getUserRole, 
  hasRole,
  type GetUserResult,
  type SerializedUser 
} from './get-user.action';
