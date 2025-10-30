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
const DEVICE_TYPE_KEY = 'emu-device-type';

// Device-specific thresholds
const SIGNIFICANT_MOVE_THRESHOLD = {
  desktop: Infinity,  // Desktop NEVER auto-updates (manual only via reset button)
  laptop: 0.05,       // 5km - laptops can move but less frequently
  tablet: 0.01,       // 1km - tablets move like phones
  phone: 0.01,        // 1km - phones move frequently
};

// Cache duration (when to consider stale)
const CACHE_DURATION = {
  desktop: Infinity,                // Desktop NEVER expires (manual reset only)
  laptop: 5 * 60 * 60 * 1000,       // 5 hours - laptops move occasionally
  tablet: 2 * 60 * 60 * 1000,       // 2 hours - tablets move regularly
  phone: 2 * 60 * 60 * 1000,        // 2 hours - phones move frequently
};

// Types
export type DeviceType = 'desktop' | 'laptop' | 'tablet' | 'phone';

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
  deviceType: DeviceType;
  deviceId: string; // Detect if user switched devices
}

/**
 * Detect device type based on user agent and screen
 */
function detectDeviceType(): DeviceType {
  if (typeof window === 'undefined') return 'desktop';
  
  const ua = navigator.userAgent.toLowerCase();
  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  const screenWidth = window.screen.width;
  
  // Phone: mobile user agent + small screen
  if (/mobile|android|iphone/.test(ua) && screenWidth < 768) {
    return 'phone';
  }
  
  // Tablet: touch + medium screen OR explicit tablet UA
  if ((hasTouch && screenWidth >= 768 && screenWidth < 1024) || /ipad|tablet/.test(ua)) {
    return 'tablet';
  }
  
  // Laptop: touch capable desktop (hybrid devices) OR medium power
  if (hasTouch && screenWidth >= 1024) {
    return 'laptop';
  }
  
  // Desktop: large screen, no touch, high power
  return 'desktop';
}

/**
 * Generate a device fingerprint (detect device switches)
 */
function getDeviceFingerprint(): string {
  if (typeof window === 'undefined') return 'unknown';
  
  // Combine screen, UA, and some browser info
  const screen = `${window.screen.width}x${window.screen.height}`;
  const ua = navigator.userAgent.slice(0, 50); // First 50 chars
  const platform = navigator.platform;
  
  // Simple hash
  return btoa(`${screen}:${platform}:${ua}`).slice(0, 20);
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
    // Skip during SSR (server-side rendering)
    if (typeof window === 'undefined') return new Map();
    
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
    // Skip during SSR (server-side rendering)
    if (typeof window === 'undefined') return;
    
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
    // Skip during SSR (server-side rendering)
    if (typeof window === 'undefined') return null;
    
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
    // Skip during SSR (server-side rendering)
    if (typeof window === 'undefined') return;
    
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
   * Check if we should update location (device-aware movement detection)
   */
  shouldUpdate(newLat: number, newLng: number, forceIfNewDevice: boolean = true): boolean {
    const currentDeviceId = getDeviceFingerprint();
    const currentDeviceType = detectDeviceType();
    
    if (!this.cachedLocation) {
      console.log('[UserLocationCache] 📍 No cached location, should update');
      return true;
    }
    
    // CRITICAL: If user switched devices, ALWAYS update
    if (forceIfNewDevice && this.cachedLocation.deviceId !== currentDeviceId) {
      console.log(`[UserLocationCache] 🔄 Device changed (${this.cachedLocation.deviceType} → ${currentDeviceType}), force update`);
      return true;
    }

    // Get device-specific movement threshold
    const threshold = SIGNIFICANT_MOVE_THRESHOLD[currentDeviceType];
    
    const distance = this.calculateDistance(
      this.cachedLocation.lat,
      this.cachedLocation.lng,
      newLat,
      newLng
    );

    const hasMoved = distance > threshold;
    
    if (hasMoved) {
      console.log(`[UserLocationCache] 🚶 ${currentDeviceType.toUpperCase()}: User moved ${(distance * 111).toFixed(1)}km (threshold: ${(threshold * 111).toFixed(1)}km), updating`);
    } else {
      console.log(`[UserLocationCache] ⏸️ ${currentDeviceType.toUpperCase()}: User hasn't moved significantly (${(distance * 111).toFixed(1)}km), using cached`);
    }

    return hasMoved;
  }

  /**
   * Update cached location (device-aware, only if moved significantly)
   */
  update(lat: number, lng: number, accuracy: number, source: 'gps' | 'network'): boolean {
    if (!this.shouldUpdate(lat, lng)) {
      return false; // No update needed
    }

    const deviceType = detectDeviceType();
    const deviceId = getDeviceFingerprint();

    this.cachedLocation = {
      lat,
      lng,
      accuracy,
      timestamp: Date.now(),
      source,
      deviceType,
      deviceId,
    };

    this.saveToStorage();
    console.log(`[UserLocationCache] ✅ ${deviceType.toUpperCase()} location updated: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
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
   * Check if cached location is stale (device-aware durations)
   */
  isStale(): boolean {
    if (!this.cachedLocation) return true;
    
    const age = this.getAge();
    const deviceType = this.cachedLocation.deviceType || 'phone'; // Default to phone for old caches
    const maxAge = CACHE_DURATION[deviceType] / 1000; // Convert to seconds
    
    const isStale = age > maxAge;
    
    if (isStale) {
      console.log(`[UserLocationCache] ⏰ ${deviceType.toUpperCase()} cache is stale (${Math.floor(age/60)}min > ${Math.floor(maxAge/60)}min)`);
    }
    
    return isStale;
  }

  /**
   * Force refresh location (for desktop "Reset Location" button)
   */
  forceRefresh(lat: number, lng: number, accuracy: number, source: 'gps' | 'network' = 'gps'): void {
    const deviceType = detectDeviceType();
    const deviceId = getDeviceFingerprint();

    this.cachedLocation = {
      lat,
      lng,
      accuracy,
      timestamp: Date.now(),
      source,
      deviceType,
      deviceId,
    };

    this.saveToStorage();
    console.log(`[UserLocationCache] 🔄 FORCE REFRESH: ${deviceType.toUpperCase()} location updated: (${lat.toFixed(4)}, ${lng.toFixed(4)})`);
  }

  /**
   * Clear cache
   */
  clear(): void {
    this.cachedLocation = null;
    
    // Skip during SSR (server-side rendering)
    if (typeof window !== 'undefined') {
      localStorage.removeItem(USER_LOCATION_KEY);
    }
    
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

