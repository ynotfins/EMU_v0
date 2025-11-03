/**
 * Map Card Component
 * 
 * Displays a small map preview for an incident location.
 * This is a placeholder implementation until the map integration is complete.
 */

import { Card } from '@/components/ui/card';

interface MapCardProps {
  lat?: number;
  lng?: number;
  address?: string;
  className?: string;
}

export function MapCard({ lat, lng, address, className }: MapCardProps) {
  if (!lat || !lng) {
    return (
      <Card className={className}>
        <div className="p-4 text-center text-gray-500">
          No location data available
        </div>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <div className="p-4">
        <div className="text-sm font-medium mb-2">Location</div>
        <div className="text-sm text-gray-600">
          {address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`}
        </div>
        <div className="mt-4 bg-gray-100 h-48 rounded flex items-center justify-center">
          {/* TODO: Integrate actual map component */}
          <span className="text-gray-500">Map Preview</span>
        </div>
      </div>
    </Card>
  );
}
