import { config } from "dotenv"
import { resolve } from "path"

// Load environment variables
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

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

