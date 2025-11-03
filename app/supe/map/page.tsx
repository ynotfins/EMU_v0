"use client"

import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import { LiveTeamMap } from "@/components/live-team-map"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export default function SupeLiveMapPage() {
  const router = useRouter()

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
          <h1 className="text-lg font-bold flex-1">Live Team Map</h1>
        </div>

        {/* Map Container - Full height */}
        <div className="flex-1">
          <LiveTeamMap />
        </div>
      </div>
    </RoleLayout>
  )
}
