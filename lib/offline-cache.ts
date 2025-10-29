/**
 * Offline Cache for Geocoding and User Location
 * 
 * This module handles:
 * 1. Incident address geocoding (permanent - address never changes)
 * 2. User location caching (updates only when user moves significantly)
 * 
 * Uses localStorage for persistent offline access
 */

// Constants
const GEOCODE_CACHE_KEY = 'emu-geocode-cache';
const USER_LOCATION_KEY = 'emu-user-location';
const SIGNIFICANT_MOVE_THRESHOLD = 0.01; // ~1km in degrees (roughly 1km)

// Types
export interface GeocodedAddress {
  address: string;
  lat: number;
  lng: number;
  geocodedAt: string;
}

export interface CachedUserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  timestamp: number;
  source: 'gps' | 'network' | 'cached';
}

/**
 * Geocode Cache (Incident Addresses)
 * Permanent - address never changes, save forever for offline use
 */
export class GeocodeCache {
  private cache: Map<string, GeocodedAddress>;

  constructor() {
    this.cache = this.loadFromStorage();
  }

  /**
   * Load cache from localStorage
   */
  private loadFromStorage(): Map<string, GeocodedAddress> {
    try {
      const stored = localStorage.getItem(GEOCODE_CACHE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        return new Map(Object.entries(data));
      }
    } catch (error) {
      console.error('[GeocodeCache] Error loading from storage:', error);
    }
    return new Map();
  }

  /**
   * Save cache to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Object.fromEntries(this.cache);
      localStorage.setItem(GEOCODE_CACHE_KEY, JSON.stringify(data));
      console.log(`[GeocodeCache] 💾 Saved ${this.cache.size} addresses to localStorage`);
    } catch (error) {
      console.error('[GeocodeCache] Error saving to storage:', error);
    }
  }

  /**
   * Get geocoded coordinates for an address (offline-first)
   */
  get(address: string): GeocodedAddress | null {
    const normalized = this.normalizeAddress(address);
    const cached = this.cache.get(normalized);
    
    if (cached) {
      console.log(`[GeocodeCache] ✅ Hit (offline): ${address}`);
      return cached;
    }
    
    console.log(`[GeocodeCache] ❌ Miss: ${address}`);
    return null;
  }

  /**
   * Set geocoded coordinates for an address
   */
  set(address: string, lat: number, lng: number): void {
    const normalized = this.normalizeAddress(address);
    const entry: GeocodedAddress = {
      address: normalized,
      lat,
      lng,
      geocodedAt: new Date().toISOString(),
    };
    
    this.cache.set(normalized, entry);
    this.saveToStorage();
    console.log(`[GeocodeCache] 💾 Stored: ${address} → (${lat}, ${lng})`);
  }

  /**
   * Check if address is in cache
   */
  has(address: string): boolean {
    return this.cache.has(this.normalizeAddress(address));
  }

  /**
   * Get cache size
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clear cache (for testing/debugging only)
   */
  clear(): void {
    this.cache.clear();
    localStorage.removeItem(GEOCODE_CACHE_KEY);
    console.log('[GeocodeCache] 🗑️ Cache cleared');
  }

  /**
   * Normalize address for consistent caching
   */
  private normalizeAddress(address: string): string {
    return address.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Get all cached addresses (for debugging)
   */
  getAll(): GeocodedAddress[] {
    return Array.from(this.cache.values());
  }
}

/**
 * User Location Cache
 * Updates only when user moves significantly (saves battery & API calls)
 */
export class UserLocationCache {
  private cachedLocation: CachedUserLocation | null = null;

  constructor() {
    this.cachedLocation = this.loadFromStorage();
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): CachedUserLocation | null {
    try {
      const stored = localStorage.getItem(USER_LOCATION_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        console.log(`[UserLocationCache] 📍 Loaded cached location:`, data);
        return data;
      }
    } catch (error) {
      console.error('[UserLocationCache] Error loading from storage:', error);
    }
    return null;
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    if (this.cachedLocation) {
      try {
        localStorage.setItem(USER_LOCATION_KEY, JSON.stringify(this.cachedLocation));
        console.log(`[UserLocationCache] 💾 Saved location to localStorage`);
      } catch (error) {
        console.error('[UserLocationCache] Error saving to storage:', error);
      }
    }
  }

  /**
   * Get cached user location (may be stale but good for offline)
   */
  get(): CachedUserLocation | null {
    return this.cachedLocation;
  }

  /**
   * Check if we should update location (has user moved significantly?)
   */
  shouldUpdate(newLat: number, newLng: number): boolean {
    if (!this.cachedLocation) {
      console.log('[UserLocationCache] 📍 No cached location, should update');
      return true;
    }

    const distance = this.calculateDistance(
      this.cachedLocation.lat,
      this.cachedLocation.lng,
      newLat,
      newLng
    );

    const hasMoved = distance > SIGNIFICANT_MOVE_THRESHOLD;
    
    if (hasMoved) {
      console.log(`[UserLocationCache] 🚶 User moved ${(distance * 111).toFixed(1)}km, updating`);
    } else {
      console.log(`[UserLocationCache] ⏸️ User hasn't moved significantly (${(distance * 111).toFixed(1)}km), using cached`);
    }

    return hasMoved;
  }

  /**
   * Update cached location (only if moved significantly)
   */
  update(lat: number, lng: number, accuracy: number, source: 'gps' | 'network'): boolean {
    if (!this.shouldUpdate(lat, lng)) {
      return false; // No update needed
    }

    this.cachedLocation = {
      lat,
      lng,
      accuracy,
      timestamp: Date.now(),
      source,
    };

    this.saveToStorage();
    console.log(`[UserLocationCache] ✅ Location updated: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
    return true;
  }

  /**
   * Calculate distance between two points (degrees)
   * Simple Euclidean approximation for small distances
   */
  private calculateDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const dLat = lat2 - lat1;
    const dLng = lng2 - lng1;
    return Math.sqrt(dLat * dLat + dLng * dLng);
  }

  /**
   * Get age of cached location in seconds
   */
  getAge(): number {
    if (!this.cachedLocation) return Infinity;
    return (Date.now() - this.cachedLocation.timestamp) / 1000;
  }

  /**
   * Check if cached location is stale (> 5 minutes)
   */
  isStale(): boolean {
    return this.getAge() > 300; // 5 minutes
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cachedLocation = null;
    localStorage.removeItem(USER_LOCATION_KEY);
    console.log('[UserLocationCache] 🗑️ Cache cleared');
  }
}

/**
 * Singleton instances for app-wide use
 */
export const geocodeCache = new GeocodeCache();
export const userLocationCache = new UserLocationCache();

/**
 * Initialize caches (call once at app startup)
 */
export function initializeOfflineCaches() {
  console.log('[OfflineCache] 🚀 Initializing...');
  console.log(`[GeocodeCache] 📦 ${geocodeCache.size} addresses cached`);
  
  const userLoc = userLocationCache.get();
  if (userLoc) {
    console.log(`[UserLocationCache] 📍 Last location: (${userLoc.lat.toFixed(4)}, ${userLoc.lng.toFixed(4)})`);
    console.log(`[UserLocationCache] ⏰ Age: ${Math.floor(userLocationCache.getAge())}s`);
  } else {
    console.log(`[UserLocationCache] 📍 No cached location`);
  }
}

