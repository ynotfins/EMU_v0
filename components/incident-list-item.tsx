"use client"

import { useState } from "react"
import { Heart, Bookmark, BellOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IncidentLite } from "@/types/domain"
import { formatListLines } from "@/hooks/use-incidents"
import { isSilenced, toggleSilenceLocal } from "@/lib/silence"

interface IncidentListItemProps {
  incident: IncidentLite
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleBookmark: (id: string) => void
  onToggleSilence?: (id: string) => void
}

export function IncidentListItem({
  incident,
  onOpen,
  onToggleFavorite,
  onToggleBookmark,
  onToggleSilence,
}: IncidentListItemProps) {
  const { l1, l2, l3 } = formatListLines(incident)
  const updateCount = incident.updates?.length || 0
  const barHeightPercent = updateCount > 0 ? Math.min(updateCount, 5) * 20 : 0
  
  // Track silence state locally
  const [silenced, setSilenced] = useState(() => isSilenced(incident.id))
  
  const handleToggleSilence = (e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = toggleSilenceLocal(incident.id)
    setSilenced(newState)
    onToggleSilence?.(incident.id)
  }

  return (
    <Card 
      className={cn(
        "relative p-4 cursor-pointer hover:shadow-md transition-shadow",
        silenced && "opacity-50 bg-gray-50"
      )} 
      onClick={() => onOpen(incident.id)}
    >
      {barHeightPercent > 0 && (
        <div
          className="absolute left-0 top-0 w-1 bg-[#007AFF] rounded-l-lg transition-all"
          style={{ height: `${barHeightPercent}%` }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-1">
          {/* Badge Header */}
          <div className="flex items-center gap-2">
            <Badge className="bg-[#007AFF] hover:bg-[#0051D5]">NFA-{incident.incidentNumber}</Badge>
            {incident.highAlert && (
              <Badge variant="outline" className="text-[#FF3B30] border-[#FF3B30]">
                HIGH ALERT
              </Badge>
            )}
          </div>

          {/* Line 1: Date/Time + Distance */}
          <div className="text-xs text-[#6B7280]">{l1}</div>

          {/* Line 2: Location */}
          <div className="font-medium text-sm">{l2}</div>

          {/* Line 3: Type + Message */}
          <div className="text-sm text-[#6B7280]">{l3}</div>
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
            onClick={handleToggleSilence}
            className={cn(
              "p-1 rounded transition-colors",
              silenced ? "bg-[#6B7280] hover:bg-[#9CA3AF]" : "hover:bg-[#F2F2F7]"
            )}
            aria-label={silenced ? "Unsilence" : "Silence"}
            title={silenced ? "Click to unsilence" : "Click to silence"}
          >
            <BellOff className={cn("h-5 w-5", silenced ? "text-white" : "text-[#6B7280]")} />
          </button>
        </div>
      </div>
    </Card>
  )
}
