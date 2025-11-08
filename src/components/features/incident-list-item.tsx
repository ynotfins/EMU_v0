"use client"

import { useState, memo, useCallback } from "react"
import { Heart, Bookmark, Bell, BellOff, EyeOff } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import type { IncidentLite } from "@/types/extended-domain"
import { formatListLines } from "@/hooks/use-incidents"
import { isSilenced, toggleSilenceLocal } from "@/lib/utils/silence"
import { logger } from "@/lib/utils/logger"

interface IncidentListItemProps {
  incident: IncidentLite
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleBookmark: (id: string) => void
  onToggleSilence?: (id: string) => void
  onHide?: (id: string) => void
}

function IncidentListItemComponent({
  incident,
  onOpen,
  onToggleFavorite,
  onToggleBookmark,
  onToggleSilence,
  onHide,
}: IncidentListItemProps) {
  const { l1, l2, l3 } = formatListLines(incident)
  const updateCount = incident.updates?.length || 0
  const barHeightPercent = updateCount > 0 ? Math.min(updateCount, 5) * 20 : 0

  const [silenced, setSilenced] = useState(() => isSilenced(incident.id))

  const handleToggleSilence = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    const newState = toggleSilenceLocal(incident.id)
    setSilenced(newState)
    onToggleSilence?.(incident.id)
  }, [incident.id, onToggleSilence])

  const handleCardClick = useCallback(() => {
    const idToPass = incident.incidentId || incident.incidentNumber.toString()
    logger.debug('Opening incident', { code: 'IncidentListItem', incidentId: idToPass })
    onOpen(idToPass)
  }, [incident.incidentId, incident.incidentNumber, onOpen])

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite(incident.id)
  }, [incident.id, onToggleFavorite])

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleBookmark(incident.id)
  }, [incident.id, onToggleBookmark])

  const handleHideClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation()
    onHide?.(incident.id)
  }, [incident.id, onHide])

  return (
    <Card
      className={cn(
        "relative p-4 cursor-pointer hover:shadow-md transition-shadow",
        silenced && "opacity-50 bg-muted"
      )}
      onClick={handleCardClick}
    >
      {barHeightPercent > 0 && (
        <div
          className="absolute left-0 top-0 w-1.5 bg-primary rounded-l-lg transition-all"
          style={{ height: `${barHeightPercent}%` }}
          aria-label={`${updateCount} update${updateCount !== 1 ? "s" : ""}`}
        />
      )}

      <div className="flex flex-col gap-1">
        {incident.highAlert && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-destructive border-destructive shrink-0"
            >
              HIGH ALERT
            </Badge>
          </div>
        )}

        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-0.5 min-w-0">
            <div className="flex items-center justify-start gap-2">
              <div className="text-xs text-muted-foreground">{l1}</div>
              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleSilence}
                  className="p-1 rounded transition-colors hover:bg-muted"
                  aria-label={silenced ? "Unsilence" : "Silence"}
                  title={silenced ? "Click to unsilence" : "Click to silence"}
                >
                  {silenced ? (
                    <BellOff className="h-4 w-4 text-destructive" />
                  ) : (
                    <Bell className="h-4 w-4 text-primary" />
                  )}
                </button>
                {onHide && (
                  <button
                    onClick={handleHideClick}
                    className="p-1 rounded transition-colors hover:bg-muted"
                    aria-label="Hide alert"
                    title="Hide this alert"
                  >
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  </button>
                )}
              </div>
            </div>

            <div className="font-medium text-sm">{l2}</div>

            <div className="text-sm text-muted-foreground line-clamp-6">{l3}</div>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleFavoriteClick}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label={incident.isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  incident.isFavorited
                    ? "fill-destructive text-destructive"
                    : "text-muted-foreground"
                )}
              />
            </button>
            <button
              onClick={handleBookmarkClick}
              className="p-1 hover:bg-muted rounded transition-colors"
              aria-label={incident.isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Bookmark
                className={cn(
                  "h-5 w-5",
                  incident.isBookmarked
                    ? "fill-primary text-primary"
                    : "text-muted-foreground"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </Card>
  )
}

export const IncidentListItem = memo(IncidentListItemComponent, (prevProps, nextProps) => {
  return (
    prevProps.incident.id === nextProps.incident.id &&
    prevProps.incident.isFavorited === nextProps.incident.isFavorited &&
    prevProps.incident.isBookmarked === nextProps.incident.isBookmarked &&
    prevProps.incident.updatedAt === nextProps.incident.updatedAt &&
    prevProps.onOpen === nextProps.onOpen &&
    prevProps.onToggleFavorite === nextProps.onToggleFavorite &&
    prevProps.onToggleBookmark === nextProps.onToggleBookmark &&
    prevProps.onToggleSilence === nextProps.onToggleSilence &&
    prevProps.onHide === nextProps.onHide
  )
})
