"use client"

import { Heart, Bookmark, MapPin, Clock, BellOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IncidentLite } from "@/types/domain"

interface IncidentListItemProps {
  incident: IncidentLite
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleBookmark: (id: string) => void
  onToggleSilence: (id: string) => void
}

export function IncidentListItem({
  incident,
  onOpen,
  onToggleFavorite,
  onToggleBookmark,
  onToggleSilence,
}: IncidentListItemProps) {
  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)

    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    if (diffHours < 24) return `${diffHours}h ago`
    const diffDays = Math.floor(diffHours / 24)
    return `${diffDays}d ago`
  }

  const updateCount = incident.updates?.length || 0
  const barHeightPercent = updateCount > 0 ? Math.min(updateCount, 5) * 20 : 0

  return (
    <Card className="relative p-4 cursor-pointer hover:shadow-md transition-shadow" onClick={() => onOpen(incident.id)}>
      {barHeightPercent > 0 && (
        <div
          className="absolute left-0 top-0 w-1 bg-[#007AFF] rounded-l-lg transition-all"
          style={{ height: `${barHeightPercent}%` }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-center gap-2">
            <Badge className="bg-[#007AFF] hover:bg-[#0051D5]">NFA-{incident.incidentNumber}</Badge>
            <Badge variant="outline" className="text-[#FF3B30] border-[#FF3B30]">
              {incident.type}
            </Badge>
          </div>

          {/* Location */}
          <div className="flex items-start gap-2">
            <MapPin className="h-4 w-4 text-[#6B7280] mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-foreground">{incident.address}</p>
              <p className="text-[#6B7280]">
                {incident.city}, {incident.county}, {incident.state}
              </p>
            </div>
          </div>

          {/* Message */}
          <p className="text-sm text-[#6B7280] line-clamp-2">{incident.message}</p>

          {/* Footer */}
          <div className="flex items-center gap-3 text-xs text-[#6B7280]">
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              <span>{formatTime(incident.updatedAt)}</span>
            </div>
            {incident.distanceMi !== undefined && (
              <div className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{incident.distanceMi.toFixed(1)} mi away</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleFavorite(incident.id)
            }}
            className="p-1 hover:bg-[#F2F2F7] rounded transition-colors"
          >
            <Heart
              className={cn("h-5 w-5", incident.isFavorited ? "fill-[#FF3B30] text-[#FF3B30]" : "text-[#6B7280]")}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleBookmark(incident.id)
            }}
            className="p-1 hover:bg-[#F2F2F7] rounded transition-colors"
          >
            <Bookmark
              className={cn("h-5 w-5", incident.isBookmarked ? "fill-[#007AFF] text-[#007AFF]" : "text-[#6B7280]")}
            />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onToggleSilence(incident.id)
            }}
            className="p-1 hover:bg-[#F2F2F7] rounded transition-colors"
          >
            <BellOff
              className={cn("h-5 w-5", incident.isSilenced ? "fill-[#6B7280] text-[#6B7280]" : "text-[#6B7280]")}
            />
          </button>
        </div>
      </div>
    </Card>
  )
}
