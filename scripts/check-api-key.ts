#!/usr/bin/env tsx
/**
 * Check if Google Maps API key is configured
 */

console.log('🔍 Checking Google Maps API Key...\n');

const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

if (apiKey) {
  console.log('✅ Google Maps API Key found!');
  console.log(`   Key starts with: ${apiKey.substring(0, 10)}...`);
  console.log(`   Key length: ${apiKey.length} characters`);
} else {
  console.log('❌ Google Maps API Key NOT FOUND!');
  console.log('   The app will use OpenStreetMap for geocoding (less accurate)');
  console.log('\n📝 To add Google Maps API Key:');
  console.log('   1. Add to .env.local: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your-key');
  console.log('   2. Or set in Vercel: Settings → Environment Variables');
}

console.log('\n📍 Checking Firebase configuration...');
const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (firebaseApiKey && projectId) {
  console.log('✅ Firebase configuration found!');
  console.log(`   Project ID: ${projectId}`);
  console.log(`   API Key starts with: ${firebaseApiKey.substring(0, 10)}...`);
} else {
  console.log('❌ Firebase configuration missing!');
}

process.exit(0);
