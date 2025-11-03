"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { 
  MapPin, Clock, Bell, BellOff, Star, Bookmark, 
  Eye, EyeOff, AlertTriangle, ChevronRight, 
  Flame, Shield, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { IncidentLite } from "@/types/domain"
import { spacing, borderRadius, colors, iconSizes, typography } from "@/lib/design-tokens"

interface IncidentListItemProps {
  incident: IncidentLite
  onOpen: (id: string) => void
  onToggleFavorite: (id: string) => void
  onToggleBookmark: (id: string) => void
  onToggleSilence: (id: string) => void
  onHide: (id: string) => void
}

export function IncidentListItem({
  incident,
  onOpen,
  onToggleFavorite,
  onToggleBookmark,
  onToggleSilence,
  onHide,
}: IncidentListItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  
  const timeAgo = formatDistanceToNow(new Date(incident.updatedAt), { addSuffix: true })
  const hasUpdates = incident.updates && incident.updates.length > 0
  const updateCount = incident.updates?.length || 0

  // Incident type colors
  const getIncidentTypeColor = (type: string) => {
    const typeColors: Record<string, { bg: string; text: string; icon: React.ElementType }> = {
      "Structure Fire": { bg: colors.danger.light, text: colors.danger.dark, icon: Flame },
      "Vehicle Fire": { bg: colors.warning.light, text: colors.warning.dark, icon: Shield },
      "Wildfire": { bg: "#FEE2E2", text: "#991B1B", icon: Flame },
      "default": { bg: colors.gray[100], text: colors.gray[700], icon: AlertTriangle }
    }
    return typeColors[type] || typeColors.default
  }

  const typeInfo = getIncidentTypeColor(incident.type || "Fire Incident")
  const TypeIcon = typeInfo.icon

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onOpen(incident.id)
  }

  const handleActionClick = (e: React.MouseEvent, action: () => void) => {
    e.stopPropagation()
    action()
  }

  return (
    <div 
      className="bg-white hover:bg-gray-50 transition-all duration-200"
      style={{ 
        borderRadius: borderRadius.lg,
        overflow: 'hidden',
        cursor: 'pointer'
      }}
      onClick={handleClick}
    >
      {/* Main Content */}
      <div style={{ padding: spacing.xl }}>
        <div className="flex items-start justify-between gap-4">
          {/* Left: Icon + Info */}
          <div className="flex gap-4 flex-1">
            {/* Type Icon */}
            <div 
              className="flex items-center justify-center flex-shrink-0"
              style={{ 
                width: '56px',
                height: '56px',
                borderRadius: borderRadius.lg,
                backgroundColor: typeInfo.bg
              }}
            >
              <TypeIcon style={{ 
                width: iconSizes.lg, 
                height: iconSizes.lg,
                color: typeInfo.text
              }} />
            </div>

            {/* Incident Details */}
            <div className="flex-1 min-w-0">
              {/* Type and Time */}
              <div className="flex items-center gap-3 mb-2">
                <Badge 
                  variant={incident.highAlert ? "destructive" : "secondary"}
                  style={{ 
                    fontSize: typography.fontSize.xs,
                    padding: `${spacing.xs} ${spacing.sm}`,
                    borderRadius: borderRadius.DEFAULT,
                    fontWeight: typography.fontWeight.medium
                  }}
                >
                  {incident.highAlert && "⚠️ "}
                  {incident.type || "Fire Incident"}
                </Badge>
                
                <span style={{ 
                  fontSize: typography.fontSize.sm,
                  color: colors.gray[500],
                  display: 'flex',
                  alignItems: 'center',
                  gap: spacing.xs
                }}>
                  <Clock style={{ width: iconSizes.xs, height: iconSizes.xs }} />
                  {timeAgo}
                </span>

                {hasUpdates && (
                  <Badge 
                    variant="outline"
                    style={{ 
                      fontSize: typography.fontSize.xs,
                      padding: `${spacing.xs} ${spacing.sm}`,
                      borderColor: colors.primary.DEFAULT,
                      color: colors.primary.DEFAULT
                    }}
                  >
                    <RefreshCw style={{ width: iconSizes.xs, height: iconSizes.xs, marginRight: spacing.xs }} />
                    {updateCount} update{updateCount > 1 ? 's' : ''}
                  </Badge>
                )}
              </div>

              {/* Address */}
              <h3 style={{ 
                fontSize: typography.fontSize.lg,
                fontWeight: typography.fontWeight.semibold,
                color: colors.gray[900],
                marginBottom: spacing.xs,
                lineHeight: typography.lineHeight.tight
              }}>
                {incident.address}
              </h3>

              <p style={{ 
                fontSize: typography.fontSize.base,
                color: colors.gray[600],
                display: 'flex',
                alignItems: 'center',
                gap: spacing.xs
              }}>
                <MapPin style={{ width: iconSizes.sm, height: iconSizes.sm, color: colors.gray[400] }} />
                {incident.city}, {incident.state}
                {incident.distanceMi !== undefined && incident.distanceMi !== null && (
                  <span style={{ 
                    marginLeft: spacing.md,
                    fontWeight: typography.fontWeight.medium,
                    color: colors.primary.DEFAULT
                  }}>
                    {incident.distanceMi.toFixed(1)} mi away
                  </span>
                )}
              </p>

              {/* Message Preview */}
              {incident.message && (
                <p style={{ 
                  fontSize: typography.fontSize.sm,
                  color: colors.gray[600],
                  marginTop: spacing.md,
                  lineHeight: typography.lineHeight.normal,
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden'
                }}>
                  {incident.message}
                </p>
              )}
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-2">
            <ChevronRight style={{ 
              width: iconSizes.md, 
              height: iconSizes.md,
              color: colors.gray[400]
            }} />
          </div>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center gap-2 mt-4 pt-4 border-t" style={{ borderColor: colors.gray[200] }}>
          {/* Favorite */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleActionClick(e, () => onToggleFavorite(incident.id))}
            style={{ 
              color: incident.isFavorited ? colors.warning.DEFAULT : colors.gray[500],
              padding: spacing.sm,
              borderRadius: borderRadius.DEFAULT
            }}
            className="hover:bg-gray-100"
          >
            <Star 
              style={{ width: iconSizes.md, height: iconSizes.md }}
              fill={incident.isFavorited ? colors.warning.DEFAULT : 'none'}
            />
          </Button>

          {/* Bookmark */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleActionClick(e, () => onToggleBookmark(incident.id))}
            style={{ 
              color: incident.isBookmarked ? colors.primary.DEFAULT : colors.gray[500],
              padding: spacing.sm,
              borderRadius: borderRadius.DEFAULT
            }}
            className="hover:bg-gray-100"
          >
            <Bookmark 
              style={{ width: iconSizes.md, height: iconSizes.md }}
              fill={incident.isBookmarked ? colors.primary.DEFAULT : 'none'}
            />
          </Button>

          {/* Silence */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleActionClick(e, () => onToggleSilence(incident.id))}
            style={{ 
              color: incident.isSilenced ? colors.danger.DEFAULT : colors.gray[500],
              padding: spacing.sm,
              borderRadius: borderRadius.DEFAULT
            }}
            className="hover:bg-gray-100"
          >
            {incident.isSilenced ? (
              <BellOff style={{ width: iconSizes.md, height: iconSizes.md }} />
            ) : (
              <Bell style={{ width: iconSizes.md, height: iconSizes.md }} />
            )}
          </Button>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Hide */}
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => handleActionClick(e, () => onHide(incident.id))}
            style={{ 
              color: colors.gray[500],
              padding: spacing.sm,
              borderRadius: borderRadius.DEFAULT
            }}
            className="hover:bg-gray-100"
          >
            <EyeOff style={{ width: iconSizes.md, height: iconSizes.md }} />
          </Button>
        </div>
      </div>

      {/* High Alert Indicator */}
      {incident.highAlert && (
        <div 
          className="animate-pulse"
          style={{ 
            height: '4px',
            backgroundColor: colors.danger.DEFAULT,
            opacity: 0.8
          }}
        />
      )}
    </div>
  )
}
