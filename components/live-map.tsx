"use client"

import { MapPin, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LocationMarker } from "@/hooks/use-live-locations"
import type { IncidentLite } from "@/types/domain"

interface LiveMapProps {
  markers: LocationMarker[]
  incidents?: IncidentLite[]
}

export function LiveMap({ markers, incidents = [] }: LiveMapProps) {
  return (
    <div className="relative h-full w-full bg-[#E5E7EB] rounded-lg overflow-hidden">
      {/* 4 Hours Text - Small and unintrusive */}
      <div className="absolute top-4 right-4 z-10">
        <p className="text-xs text-[#6B7280] bg-white/80 backdrop-blur-sm px-2 py-1 rounded">
          Last 4 hours
        </p>
      </div>

      {/* Map Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="text-center space-y-3">
          <MapPin className="h-16 w-16 text-[#6B7280] mx-auto" />
          <p className="text-[#6B7280] font-medium">Live Map View</p>
          <p className="text-sm text-[#6B7280]">
            {incidents.length} alert{incidents.length !== 1 ? 's' : ''} from last 4 hours
          </p>
        </div>
      </div>

      {/* Active Responders Overlay */}
      <Card className="absolute top-4 left-4 right-4 p-3">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-[#007AFF]" />
          <span className="text-sm font-medium text-foreground">Active Responders</span>
          <Badge className="bg-[#34C759] hover:bg-[#2DA84A] ml-auto">{markers.length}</Badge>
        </div>
        <div className="mt-3 space-y-2">
          {markers.map((marker) => (
            <div key={marker.uid} className="flex items-center gap-2 text-sm">
              <div className="h-2 w-2 bg-[#34C759] rounded-full animate-pulse" />
              <span className="text-foreground">{marker.name}</span>
              <span className="text-[#6B7280] text-xs ml-auto">
                {marker.lat.toFixed(4)}, {marker.lng.toFixed(4)}
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
