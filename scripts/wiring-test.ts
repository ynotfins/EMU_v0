import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

// Debug: Check if env vars are loaded
console.log("🔍 Environment check:")
console.log("  API Key loaded:", process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? "✅ Yes" : "❌ No")
console.log("  Project ID:", process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "❌ Missing")
console.log()

import { testFirebaseAccess } from "../lib/diagnostics"

;(async () => {
  console.log("🔥 Running Firebase wiring diagnostics...\n")
  const result = await testFirebaseAccess()
  console.table(result)
  
  if (result.ok) {
    console.log("\n✅ Firebase connection successful!")
  } else {
    console.log("\n❌ Firebase connection failed!")
    console.log("📋 Check:")
    console.log("  1. .env.local exists with valid Firebase keys")
    console.log("  2. Firestore rules allow read on /diagnostic/test")
    console.log("  3. Firebase project is active")
  }
  
  process.exit(result.ok ? 0 : 1)
})()
