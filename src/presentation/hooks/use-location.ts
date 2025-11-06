/**
 * useLocation Hook
 * 
 * Provides user location tracking and distance calculations.
 */

'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { logger } from '@/lib/utils/logger';

interface Location {
  lat: number;
  lng: number;
  accuracy?: number;
  timestamp?: number;
}

interface UseLocationReturn {
  location: Location | null;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  requestPermission: () => Promise<void>;
  refreshLocation: () => Promise<void>;
  calculateDistance: (toLat: number, toLng: number) => number | null;
}

/**
 * Hook for accessing user's location
 */
export function useLocation(
  options?: PositionOptions
): UseLocationReturn {
  const [state, setState] = useState<{
    location: Location | null;
    loading: boolean;
    error: string | null;
    permissionGranted: boolean;
  }>({
    location: null,
    loading: false,
    error: null,
    permissionGranted: false,
  });

  const watchIdRef = useRef<number | null>(null);

  /**
   * Calculate distance between two coordinates using Haversine formula
   */
  const calculateDistance = useCallback((toLat: number, toLng: number): number | null => {
    if (!state.location) return null;

    const R = 6371; // Earth's radius in kilometers
    const dLat = toRadians(toLat - state.location.lat);
    const dLng = toRadians(toLng - state.location.lng);
    
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRadians(state.location.lat)) * 
      Math.cos(toRadians(toLat)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    
    return Math.round(distance * 10) / 10; // Round to 1 decimal place
  }, [state.location]);

  /**
   * Success callback for geolocation
   */
  const handleSuccess = useCallback((position: GeolocationPosition) => {
    const location: Location = {
      lat: position.coords.latitude,
      lng: position.coords.longitude,
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
    };

    setState(prev => ({
      ...prev,
      location,
      loading: false,
      error: null,
      permissionGranted: true,
    }));
  }, []);

  /**
   * Error callback for geolocation
   */
  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'Failed to get location';
    
    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: errorMessage,
      permissionGranted: error.code !== error.PERMISSION_DENIED,
    }));
  }, []);

  /**
   * Request location permission and get current position
   */
  const requestPermission = useCallback(async () => {
    if (!navigator.geolocation) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser',
        loading: false,
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    // Get current position
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, options]);

  /**
   * Refresh current location
   */
  const refreshLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      return;
    }

    setState(prev => ({ ...prev, loading: true }));
    
    navigator.geolocation.getCurrentPosition(
      handleSuccess,
      handleError,
      options
    );
  }, [handleSuccess, handleError, options]);

  /**
   * Start watching location
   */
  const startWatchingLocation = useCallback(() => {
    if (!navigator.geolocation || !state.permissionGranted) {
      return;
    }

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Start new watch
    watchIdRef.current = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        ...options,
        enableHighAccuracy: true,
      }
    );
  }, [state.permissionGranted, handleSuccess, handleError, options]);

  // Check permission status on mount
  useEffect(() => {
    if ('permissions' in navigator) {
      navigator.permissions
        .query({ name: 'geolocation' })
        .then((result) => {
          if (result.state === 'granted') {
            setState(prev => ({ ...prev, permissionGranted: true }));
            requestPermission();
          }
        })
        .catch((error) => {
          logger.error('Error checking geolocation permission', error as Error, { code: 'useLocation' });
        });
    }
  }, [requestPermission]);

  // Start watching if permission is granted
  useEffect(() => {
    if (state.permissionGranted) {
      startWatchingLocation();
    }

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
    };
  }, [state.permissionGranted, startWatchingLocation]);

  return {
    location: state.location,
    loading: state.loading,
    error: state.error,
    permissionGranted: state.permissionGranted,
    requestPermission,
    refreshLocation,
    calculateDistance,
  };
}

/**
 * Convert degrees to radians
 */
function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Hook for tracking distance to a specific location
 */
export function useDistanceTo(
  targetLat: number,
  targetLng: number
): {
  distance: number | null;
  loading: boolean;
  error: string | null;
} {
  const { location, loading, error, calculateDistance } = useLocation({
    enableHighAccuracy: true,
    maximumAge: 30000, // 30 seconds
    timeout: 10000, // 10 seconds
  });

  const distance = location ? calculateDistance(targetLat, targetLng) : null;

  return { distance, loading, error };
}
