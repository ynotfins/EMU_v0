"use client"

import { RoleLayout } from "@/components/role-layout"
import { LiveMap } from "@/components/live-map"
import { useLiveLocations } from "@/hooks/use-live-locations"
import { useIncidents } from "@/hooks/use-incidents"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"
import { useMemo } from "react"

export default function SupeMapPage() {
  const { data: allIncidents } = useIncidents()

  // Filter incidents from last 4 hours
  const recentIncidents = useMemo(() => {
    const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000)
    return (allIncidents || []).filter((inc) => {
      const incidentTime = new Date(inc.updatedAt).getTime()
      // Include if incident updated in last 4 hours OR has updates in last 4 hours
      if (incidentTime >= fourHoursAgo) return true
      if (inc.updates && inc.updates.length > 0) {
        const latestUpdate = inc.updates[0]
        const updateTime = typeof latestUpdate.ts === 'string' 
          ? new Date(latestUpdate.ts).getTime() 
          : incidentTime
        return updateTime >= fourHoursAgo
      }
      return false
    })
  }, [allIncidents])

  const handleRefresh = () => {
    console.log("[v0] Refresh live locations")
  }

  return (
    <RoleLayout role="supe">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-20">
          <h1 className="text-2xl font-bold text-foreground">Live Map</h1>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-14"></div>

        {/* Map */}
        <div className="flex-1 p-4 pb-20 overflow-y-auto">
          <LiveMap markers={[]} incidents={recentIncidents} />
        </div>
      </div>
    </RoleLayout>
  )
}
