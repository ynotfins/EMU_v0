/**
 * @deprecated Use src/lib/firebase-client.ts instead
 * This file is kept for backward compatibility during migration
 * Will be removed after all imports are updated
 */

import clientApp, { auth, db, storage, database, rtdb, messaging } from '../firebase-client';

// Re-export from new location
export { auth, db, storage, database, rtdb, messaging };
export default clientApp;
