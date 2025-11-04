"use client"

import { GoogleMapLive } from './google-map-live'
import type { LocationMarker } from "@/hooks/use-live-locations"
import type { IncidentLite } from "@/types/extended-domain"

interface LiveMapProps {
  markers?: LocationMarker[]
  incidents?: IncidentLite[]
}

export function LiveMap({ markers, incidents = [] }: LiveMapProps) {
  return <GoogleMapLive incidents={incidents} className="w-full h-full" />
}
