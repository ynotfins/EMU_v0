"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import { LiveMap } from "@/components/live-map"
import { useIncidents } from "@/hooks/use-incidents"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin } from "lucide-react"

export default function SupeLiveMapPage() {
  const router = useRouter()
  const { data: allIncidents, isLoading } = useIncidents()
  const [recentIncidents, setRecentIncidents] = useState<typeof allIncidents>([])

  // Filter incidents from last 4 hours that have lat/lng
  useEffect(() => {
    const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000)
    
    const filtered = allIncidents.filter(incident => {
      const incidentTime = new Date(incident.updatedAt).getTime()
      const isRecent = incidentTime >= fourHoursAgo
      const hasLocation = incident.lat !== undefined && incident.lng !== undefined
      return isRecent && hasLocation
    })

    setRecentIncidents(filtered)
  }, [allIncidents])

  return (
    <RoleLayout role="supe">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-[#007AFF] text-white p-4 flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-bold flex-1">Live Alert Map</h1>
          <Badge className="bg-white text-[#007AFF]">
            {recentIncidents.length} Alerts
          </Badge>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <LiveMap 
            incidents={recentIncidents}
            markers={[]}
          />
          
          {/* Legend Overlay */}
          <Card className="absolute top-4 left-4 p-3 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-[#FF3B30]" />
              <span className="font-semibold">Alert Locations</span>
            </div>
            <p className="text-sm text-gray-600">
              Showing {recentIncidents.length} alerts from the last 4 hours
            </p>
          </Card>
        </div>

        {/* Bottom Info */}
        <div className="bg-white border-t p-4">
          <div className="text-center">
            <p className="text-sm text-gray-600 mb-1">Last Updated</p>
            <p className="font-medium">{new Date().toLocaleString()}</p>
          </div>
        </div>
      </div>
    </RoleLayout>
  )
}
