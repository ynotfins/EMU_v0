"use client"

import { MapPin, Users } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { LocationMarker } from "@/hooks/use-live-locations"
import type { IncidentLite } from "@/types/extended-domain"

interface LiveMapProps {
  markers: LocationMarker[]
  incidents?: IncidentLite[]
}

export function LiveMap({ markers, incidents = [] }: LiveMapProps) {
  // Filter incidents with valid lat/lng coordinates
  const incidentsWithLocation = incidents.filter(inc => inc.lat && inc.lng);

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
            {incidentsWithLocation.length} alert{incidentsWithLocation.length !== 1 ? 's' : ''} with locations from last 4 hours
          </p>
        </div>
      </div>

      {/* Alert Locations Overlay */}
      <Card className="absolute top-4 left-4 right-4 p-3">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#FF3B30]" />
          <span className="text-sm font-medium text-foreground">Alert Locations</span>
          <Badge className="bg-[#FF3B30] hover:bg-[#E02A20] ml-auto">{incidentsWithLocation.length}</Badge>
        </div>
        <div className="mt-3 space-y-2 max-h-64 overflow-y-auto">
          {incidentsWithLocation.length === 0 ? (
            <p className="text-xs text-[#6B7280]">No alerts with locations</p>
          ) : (
            incidentsWithLocation.map((incident) => (
              <div key={incident.id} className="flex items-center gap-2 text-sm">
                <div className="h-2 w-2 bg-[#FF3B30] rounded-full" />
                <span className="text-foreground flex-1 truncate">{incident.address}</span>
                <span className="text-[#6B7280] text-xs">
                  {incident.city}, {incident.state}
                </span>
              </div>
            ))
          )}
        </div>
      </Card>
    </div>
  )
}
