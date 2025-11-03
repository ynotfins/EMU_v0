"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import { LiveMap } from "@/components/live-map"
import { useIncidents } from "@/hooks/use-incidents"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ArrowLeft, MapPin } from "lucide-react"

export default function SupeLiveMapPage() {
  const router = useRouter()
  const { data: incidents, isLoading } = useIncidents()
  const [topIncidents, setTopIncidents] = useState<typeof incidents>([])

  // Get top 10 most recent incidents with coordinates
  useEffect(() => {
    const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000)
    
    // Filter to recent incidents with valid coordinates
    const recentWithCoords = incidents.filter(inc => {
      const incidentTime = new Date(inc.updatedAt).getTime()
      const isRecent = incidentTime >= fourHoursAgo
      const hasCoords = inc.lat !== undefined && inc.lat !== null && 
                       inc.lng !== undefined && inc.lng !== null &&
                       inc.lat !== 0 && inc.lng !== 0
      return isRecent && hasCoords
    })
    
    // Sort by updatedAt and take top 10
    const sorted = [...recentWithCoords]
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
      .slice(0, 10)
    
    console.log('[SupeLiveMap] Showing', sorted.length, 'recent incidents with coordinates')
    setTopIncidents(sorted)
  }, [incidents])

  return (
    <RoleLayout role="supe">
      <div className="flex flex-col min-h-screen">
        {/* Header */}
        <div className="bg-[#007AFF] text-white p-2 flex items-center gap-3">
          <Button
            onClick={() => router.back()}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/20 h-8 w-8 p-0"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-lg font-bold flex-1">Live Alert Map</h1>
          <Badge className="bg-white text-[#007AFF]">
            {topIncidents.length} Alerts
          </Badge>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <LiveMap 
            incidents={topIncidents}
            markers={[]}
          />
          
          {/* Legend Overlay */}
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-lg p-3 max-w-xs">
            <div className="flex items-center gap-2 mb-2">
              <MapPin className="h-5 w-5 text-[#FF3B30]" />
              <span className="font-semibold">Alert Locations</span>
            </div>
            <p className="text-sm text-gray-600">
              Showing top {topIncidents.length} most recent alerts (last 4 hours)
            </p>
          </div>
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
