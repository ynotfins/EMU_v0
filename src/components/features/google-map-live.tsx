"use client"

import { useEffect, useRef, useState } from 'react'
import { Loader } from '@googlemaps/js-api-loader'
import type { IncidentLite } from '@/types/extended-domain'
import { MapPin } from 'lucide-react'

interface GoogleMapLiveProps {
  incidents: IncidentLite[]
  className?: string
  zoom?: number
}

export function GoogleMapLive({ incidents, className = '', zoom = 10 }: GoogleMapLiveProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  // Initialize map
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setError(true)
      setLoading(false)
      return
    }

    const loader = new Loader({
      apiKey,
      version: 'weekly',
      libraries: ['places']
    })

    loader
      .load()
      .then((google) => {
        if (!mapRef.current) return

        // Calculate center based on incidents or default to NJ area
        const validIncidents = incidents.filter(inc => inc.lat && inc.lng)
        let center = { lat: 40.0583, lng: -74.4057 } // Default: New Jersey
        
        if (validIncidents.length > 0) {
          const avgLat = validIncidents.reduce((sum, inc) => sum + inc.lat!, 0) / validIncidents.length
          const avgLng = validIncidents.reduce((sum, inc) => sum + inc.lng!, 0) / validIncidents.length
          center = { lat: avgLat, lng: avgLng }
        }

        const newMap = new google.maps.Map(mapRef.current, {
          center,
          zoom,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        })

        setMap(newMap)
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error loading Google Maps:', err)
        setError(true)
        setLoading(false)
      })
  }, [])

  // Update markers when map or incidents change
  useEffect(() => {
    if (!map) return

    // Clear existing markers
    markersRef.current.forEach(marker => marker.setMap(null))
    markersRef.current = []

    // Add new markers
    const validIncidents = incidents.filter(inc => inc.lat && inc.lng)
    const bounds = new google.maps.LatLngBounds()
    
    validIncidents.forEach((incident) => {
      const position = { lat: incident.lat!, lng: incident.lng! }
      
      const marker = new google.maps.Marker({
        position,
        map,
        title: `${incident.type}: ${incident.address}`,
        animation: google.maps.Animation.DROP,
      })

      // Add info window
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-bold text-sm">${incident.type}</h3>
            <p class="text-xs text-gray-600">${incident.address}</p>
            <p class="text-xs text-gray-500 mt-1">${new Date(incident.updatedAt).toLocaleString()}</p>
          </div>
        `,
      })

      marker.addListener('click', () => {
        infoWindow.open(map, marker)
      })

      markersRef.current.push(marker)
      bounds.extend(position)
    })

    // Fit map to show all markers
    if (validIncidents.length > 0) {
      map.fitBounds(bounds)
      // Ensure we don't zoom in too much
      const listener = google.maps.event.addListener(map, 'idle', () => {
        if (map.getZoom()! > 15) map.setZoom(15)
        google.maps.event.removeListener(listener)
      })
    }
  }, [map, incidents])

  if (error) {
    return (
      <div className={`flex flex-col items-center justify-center h-full bg-gray-100 rounded-lg ${className}`}>
        <MapPin className="w-12 h-12 mb-3 text-gray-500" />
        <p className="text-sm font-medium text-gray-600">Map Unavailable</p>
        <p className="text-xs text-gray-500 mt-1">Google Maps API key not configured</p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-full bg-gray-100 rounded-lg ${className}`}>
        <p className="text-sm text-gray-600">Loading map...</p>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`}>
      {/* 4 Hours Text */}
      <div className="absolute top-4 right-4 z-10">
        <p className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow">
          Last 4 hours
        </p>
      </div>
      
      {/* Map Container */}
      <div ref={mapRef} className="w-full h-full" />
      
      {/* Incident Count Badge */}
      <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded shadow">
        <p className="text-sm font-medium">
          {incidents.filter(inc => inc.lat && inc.lng).length} alerts
        </p>
      </div>
    </div>
  )
}
