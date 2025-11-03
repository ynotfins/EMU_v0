// Configuration values that need to be available on the client side
// This ensures environment variables are properly included in the browser bundle

export const config = {
  googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
  firebaseApiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '',
  firebaseAuthDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || '4axe.com',
  firebaseProjectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || '',
  firebaseStorageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || '',
  firebaseMessagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '',
  firebaseAppId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_WEB || '',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
} as const;

// Debug logging in development
if (config.isDevelopment) {
  console.log('[Config] Environment:', {
    hasGoogleMapsKey: !!config.googleMapsApiKey,
    hasFirebaseConfig: !!config.firebaseProjectId,
  });
}
