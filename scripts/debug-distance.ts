#!/usr/bin/env tsx
/**
 * Debug distance calculation issue
 */

// Load environment variables from .env.local
import { config } from 'dotenv';
import { resolve } from 'path';

// Load .env.local file
config({ path: resolve(process.cwd(), '.env.local') });

console.log('🔍 Debugging distance calculation...\n');

// Check API key
const googleApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
console.log('Google Maps API Key:', googleApiKey ? `${googleApiKey.substring(0, 15)}...` : 'NOT FOUND');

// Test geocoding directly
if (googleApiKey) {
  const testAddress = '123 Main St, Los Angeles, CA';
  console.log(`\nTesting geocoding for: ${testAddress}`);
  
  fetch(`https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(testAddress)}&key=${googleApiKey}`)
    .then(res => res.json())
    .then(data => {
      console.log('API Response Status:', data.status);
      if (data.results && data.results[0]) {
        console.log('Location found:', data.results[0].geometry.location);
      } else if (data.error_message) {
        console.log('API Error:', data.error_message);
      }
    })
    .catch(err => {
      console.error('Request failed:', err);
    });
} else {
  console.log('\n❌ Google Maps API key not found in environment!');
  console.log('The app will fall back to OpenStreetMap for geocoding.');
}
