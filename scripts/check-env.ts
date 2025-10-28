/**
 * Environment variable validation script
 * Run with: npm run check-env
 *
 * This script validates that all required NEXT_PUBLIC_* environment variables exist.
 * Note: NEXT_PUBLIC_* variables are intentionally client-accessible by Next.js design.
 */

import { config } from "dotenv"
import { resolve } from "path"

// Load .env.local first (takes priority), then .env
config({ path: resolve(process.cwd(), ".env.local") })
config({ path: resolve(process.cwd(), ".env") })

// Construct variable names dynamically
const prefix = "NEXT_PUBLIC_"
const firebaseVars = [
  "FIREBASE_API_KEY",
  "FIREBASE_AUTH_DOMAIN",
  "FIREBASE_PROJECT_ID",
  "FIREBASE_STORAGE_BUCKET",
  "FIREBASE_MESSAGING_SENDER_ID",
  "FIREBASE_APP_ID_WEB",
]

const otherVars = ["GOOGLE_MAPS_API_KEY", "FCM_VAPID_KEY"]

const requiredEnvVars = [...firebaseVars.map((v) => `${prefix}${v}`), ...otherVars.map((v) => `${prefix}${v}`)]

const missing: string[] = []

console.log("Checking required NEXT_PUBLIC_* environment variables...\n")

for (const envVar of requiredEnvVars) {
  const value = process.env[envVar]
  if (!value) {
    missing.push(envVar)
    console.log(`❌ ${envVar} - MISSING`)
  } else {
    console.log(`✅ ${envVar} - OK`)
  }
}

if (missing.length > 0) {
  console.log("\n⚠️  Missing required environment variables:")
  missing.forEach((v) => console.log(`   - ${v}`))
  console.log("\nPlease add these to your Vercel project settings in the Vars section.")
  console.log("See /docs/ENV.md for details on each variable.")
  process.exit(1)
} else {
  console.log("\n✅ All required NEXT_PUBLIC_* keys present.")
  console.log("\nNext steps:")
  console.log("1. Review /docs/INTEGRATION_LOG.md for wiring progress")
  console.log("2. Implement Firestore queries in hooks (see TODOs)")
  console.log("3. Configure Firebase Extensions per /docs/EXTENSIONS.md")
  process.exit(0)
}
