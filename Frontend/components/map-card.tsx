"use client"

import { MapPin, ExternalLink } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface MapCardProps {
  lat?: number
  lng?: number
  address: string
  onOpenMaps: () => void
}

export function MapCard({ lat, lng, address, onOpenMaps }: MapCardProps) {
  return (
    <Card className="p-4 bg-[#F2F2F7]">
      <div className="flex items-start gap-3">
        <div className="h-24 w-24 bg-[#E5E7EB] rounded-lg flex items-center justify-center flex-shrink-0">
          <MapPin className="h-8 w-8 text-[#6B7280]" />
        </div>
        <div className="flex-1 space-y-2">
          <p className="text-sm font-medium text-foreground">{address}</p>
          {lat && lng && (
            <p className="text-xs text-[#6B7280]">
              {lat.toFixed(6)}, {lng.toFixed(6)}
            </p>
          )}
          <Button size="sm" variant="outline" onClick={onOpenMaps} className="h-8 bg-transparent">
            <ExternalLink className="h-3 w-3 mr-1" />
            Open in Maps
          </Button>
        </div>
      </div>
    </Card>
  )
}
