"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

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
            onCheckedChange={onTrackingChange}
          />
        </div>
      </CardContent>
    </Card>
  )
}
