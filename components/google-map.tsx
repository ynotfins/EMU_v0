"use client"

import { useEffect, useState } from "react"
import { MapPin } from "lucide-react"
import type { LocationMarker } from "@/hooks/use-live-locations"
import type { IncidentLite } from "@/types/domain"

interface GoogleMapProps {
  center?: { lat: number; lng: number }
  markers?: LocationMarker[]
  incidents?: IncidentLite[]
  zoom?: number
}

export function GoogleMap({ center, markers = [], incidents = [], zoom = 13 }: GoogleMapProps) {
  const [mapUrl, setMapUrl] = useState<string | null>(null)
  const [incidentsWithLocation, setIncidentsWithLocation] = useState<IncidentLite[]>([])
  
  useEffect(() => {
    // If we have a single center point (for incident details)
    if (center?.lat && center?.lng) {
      // Use Google Maps embed API (doesn't require API key)
      const query = `${center.lat},${center.lng}`
      const embedUrl = `https://maps.google.com/maps?q=${query}&z=${zoom}&output=embed`
      setMapUrl(embedUrl)
    }
    // If we have multiple incidents (for live map)
    else if (incidents.length > 0) {
      const validIncidents = incidents.filter(inc => inc.lat && inc.lng)
      setIncidentsWithLocation(validIncidents)
      
      if (validIncidents.length > 0) {
        // Calculate center of all incidents
        const latSum = validIncidents.reduce((sum, inc) => sum + (inc.lat || 0), 0)
        const lngSum = validIncidents.reduce((sum, inc) => sum + (inc.lng || 0), 0)
        const centerLat = latSum / validIncidents.length
        const centerLng = lngSum / validIncidents.length
        
        // Use a lower zoom for multiple incidents
        const mapZoom = validIncidents.length > 1 ? 10 : 12
        const query = `${centerLat},${centerLng}`
        const embedUrl = `https://maps.google.com/maps?q=${query}&z=${mapZoom}&output=embed`
        setMapUrl(embedUrl)
      }
    }
  }, [center, incidents, zoom])

  if (!mapUrl) {
    // Show placeholder when no location data
    return (
      <div className="relative h-full w-full bg-[#E5E7EB] rounded-lg overflow-hidden flex items-center justify-center">
        <div className="text-center space-y-3">
          <MapPin className="h-16 w-16 text-[#6B7280] mx-auto" />
          <p className="text-[#6B7280] font-medium">No location data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative h-full w-full rounded-lg overflow-hidden">
      <iframe
        src={mapUrl}
        className="absolute inset-0 w-full h-full"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
      
      {/* View larger map link - only for single location */}
      {center && !incidents.length && (
        <a
          href={`https://maps.google.com/maps?q=${center.lat},${center.lng}`}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-md text-sm text-[#007AFF] hover:bg-white transition-colors shadow-md"
        >
          View larger map
        </a>
      )}
      
      {/* Last 4 hours indicator for live map */}
      {incidents.length > 0 && (
        <div className="absolute top-4 right-4 z-10">
          <p className="text-xs text-[#6B7280] bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
            Last 4 hours
          </p>
        </div>
      )}
    </div>
  )
}
