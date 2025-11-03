"use client"

import { useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { initLocationTracking } from "@/lib/location-tracking"

interface PreferencesCardProps {
  pushEnabled: boolean
  trackingEnabled: boolean
  onPushChange: (enabled: boolean) => void
  onTrackingChange: (enabled: boolean) => void
}

export function PreferencesCard({
  pushEnabled,
  trackingEnabled,
  onPushChange,
  onTrackingChange,
}: PreferencesCardProps) {
  // Start/stop location tracking when toggle changes
  useEffect(() => {
    initLocationTracking(trackingEnabled)
  }, [trackingEnabled])

  const handleTrackingChange = async (enabled: boolean) => {
    // Request location permission if enabling
    if (enabled && navigator.geolocation) {
      try {
        await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject)
        })
      } catch (error) {
        console.error("Location permission denied")
        return
      }
    }
    onTrackingChange(enabled)
  }
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <Label htmlFor="push-notifications" className="text-sm font-medium flex items-center gap-2">
            <span className="text-lg">🔔</span>
            Push Notifications
          </Label>
          <Switch 
            id="push-notifications" 
            checked={pushEnabled} 
            onCheckedChange={onPushChange}
            className="data-[state=unchecked]:bg-[#34C759] data-[state=checked]:bg-[#FF9500]"
          />
        </div>
        <div className="flex items-center justify-between">
          <Label htmlFor="location-tracking" className="text-sm font-medium flex items-center gap-2">
            <span className="text-lg">📍</span>
            Location Tracking
          </Label>
          <Switch 
            id="location-tracking" 
            checked={trackingEnabled} 
            onCheckedChange={handleTrackingChange}
            className="data-[state=unchecked]:bg-[#34C759] data-[state=checked]:bg-[#FF9500]"
          />
        </div>
      </CardContent>
    </Card>
  )
}
