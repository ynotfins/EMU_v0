"use client"

import { useEffect, useRef, useState } from 'react'
import { setOptions, importLibrary } from '@googlemaps/js-api-loader'
import type { IncidentLite } from '@/types/extended-domain'
import { MapPin } from 'lucide-react'
import { logger } from '@/lib/utils/logger'

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
  const [errorMessage, setErrorMessage] = useState<string>('')

  // Initialize map - wait for container to be rendered
  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      logger.error('No API key configured', undefined, { code: 'GoogleMapLive' })
      setError(true)
      setErrorMessage('Google Maps API key not configured')
      setLoading(false)
      return
    }

    logger.debug('Starting map initialization', { code: 'GoogleMapLive' })
    
    // Wait for next tick to ensure DOM is ready
    const initTimer = setTimeout(() => {
      if (!mapRef.current) {
        logger.error('Map ref still not available after timeout', undefined, { code: 'GoogleMapLive' })
        setError(true)
        setErrorMessage('Map container not found')
        setLoading(false)
        return
      }

      logger.debug('Map ref ready, initializing', { code: 'GoogleMapLive' })
      initializeMap(apiKey)
    }, 50)

    return () => clearTimeout(initTimer)
  }, [])

  const initializeMap = async (apiKey: string) => {
    logger.debug('Initializing map with API key', { code: 'GoogleMapLive', apiKeyPrefix: apiKey.substring(0, 10) + '...' })
    
    try {
      // Set options for the Google Maps API
      setOptions({
        key: apiKey,
        v: 'weekly',
        libraries: ['places'],
      })

      // Import the maps library
      const { Map } = await importLibrary('maps')

      logger.debug('Google Maps API loaded successfully', { code: 'GoogleMapLive' })
      
      if (!mapRef.current) {
        logger.error('Map ref disappeared during load', undefined, { code: 'GoogleMapLive' })
        setError(true)
        setErrorMessage('Map container not found')
        setLoading(false)
        return
      }

      // Calculate center based on incidents or default to NJ area
      const validIncidents = incidents.filter(inc => inc.lat && inc.lng)
      let center = { lat: 40.0583, lng: -74.4057 } // Default: New Jersey
      
      if (validIncidents.length > 0) {
        const avgLat = validIncidents.reduce((sum, inc) => sum + inc.lat!, 0) / validIncidents.length
        const avgLng = validIncidents.reduce((sum, inc) => sum + inc.lng!, 0) / validIncidents.length
        center = { lat: avgLat, lng: avgLng }
      }

      logger.debug('Creating map', { code: 'GoogleMapLive', center, zoom })
      
      const newMap = new Map(mapRef.current, {
        center,
        zoom,
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true,
      })

      logger.debug('Map created successfully', { code: 'GoogleMapLive' })
      setMap(newMap as google.maps.Map)
      setLoading(false)
    } catch (err: any) {
      logger.error('Error initializing map', err as Error, { code: 'GoogleMapLive' })
      setError(true)
      setErrorMessage(err.message || 'Failed to load Google Maps API')
      setLoading(false)
    }
  }

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
      const updatedAtDate = incident.updatedAt instanceof Date 
        ? incident.updatedAt 
        : typeof incident.updatedAt === 'string' 
          ? new Date(incident.updatedAt)
          : typeof incident.updatedAt === 'object' && 'seconds' in incident.updatedAt
            ? new Date((incident.updatedAt as { seconds: number }).seconds * 1000)
            : new Date()
      
      const infoWindow = new google.maps.InfoWindow({
        content: `
          <div class="p-3">
            <h3 class="font-bold text-sm">${incident.type}</h3>
            <p class="text-xs text-gray-600">${incident.address}</p>
            <p class="text-xs text-gray-500 mt-1">${updatedAtDate.toLocaleString()}</p>
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
        <p className="text-xs text-gray-500 mt-1">{errorMessage || 'Failed to load Google Maps'}</p>
        <button 
          onClick={() => {
            setError(false)
            setLoading(true)
            const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
            if (apiKey) {
              initializeMap(apiKey)
            }
          }}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className={`relative rounded-lg overflow-hidden ${className}`} style={{ minHeight: '500px' }}>
      {/* Loading Overlay */}
      {loading && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/90 z-50 rounded-lg">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-2" />
          <p className="text-sm text-gray-600">Loading map...</p>
          <p className="text-xs text-gray-400 mt-1">Initializing Google Maps</p>
        </div>
      )}
      
      {/* 4 Hours Text */}
      <div className="absolute top-4 right-4 z-10">
        <p className="text-xs text-gray-600 bg-white/90 backdrop-blur-sm px-2 py-1 rounded shadow">
          Last 4 hours
        </p>
      </div>
      
      {/* Map Container - Always rendered so ref can be set */}
      <div ref={mapRef} className="w-full h-full" style={{ minHeight: '500px', height: '100%' }} />
      
      {/* Incident Count Badge */}
      {!loading && (
        <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-sm px-3 py-1 rounded shadow">
          <p className="text-sm font-medium">
            {incidents.filter(inc => inc.lat && inc.lng).length} alerts
          </p>
        </div>
      )}
    </div>
  )
}
