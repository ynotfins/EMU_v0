/**
 * Google Maps Error Component
 * 
 * Displays a helpful error message when Google Maps API is not configured
 */

import { MapPin } from 'lucide-react';

interface GoogleMapsErrorProps {
  message?: string;
  className?: string;
}

export function GoogleMapsError({ 
  message = "Google Maps API key not configured", 
  className = "" 
}: GoogleMapsErrorProps) {
  return (
    <div className={`flex flex-col items-center justify-center h-full text-gray-500 ${className}`}>
      <MapPin className="w-12 h-12 mb-3" />
      <p className="text-sm font-medium">Map Unavailable</p>
      <p className="text-xs mt-1">{message}</p>
    </div>
  );
}
