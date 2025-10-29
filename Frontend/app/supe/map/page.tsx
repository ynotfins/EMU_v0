"use client"

import { RoleLayout } from "@/components/role-layout"
import { LiveMap } from "@/components/live-map"
import { useLiveLocations } from "@/hooks/use-live-locations"
import { Button } from "@/components/ui/button"
import { RefreshCw } from "lucide-react"

export default function SupeMapPage() {
  const { markers } = useLiveLocations()

  const handleRefresh = () => {
    console.log("[v0] Refresh live locations")
  }

  return (
    <RoleLayout role="supe">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">Live Map</h1>
          <Button onClick={handleRefresh} size="sm" variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Map */}
        <div className="flex-1 p-4">
          <LiveMap markers={markers} />
        </div>
      </div>
    </RoleLayout>
  )
}
