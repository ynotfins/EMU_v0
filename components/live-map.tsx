"use client"

import { MapPin } from "lucide-react"
import type { LocationMarker } from "@/hooks/use-live-locations"
import type { IncidentLite } from "@/types/domain"
import { GoogleMap } from "./google-map"

interface LiveMapProps {
  markers?: LocationMarker[]
  incidents?: IncidentLite[]
}

export function LiveMap({ markers = [], incidents = [] }: LiveMapProps) {
  // If we have a single marker (for incident details), use it as center
  const center = markers.length === 1 ? { lat: markers[0].lat, lng: markers[0].lng } : undefined

  return <GoogleMap center={center} markers={markers} incidents={incidents} />
}
