"use client";

import { useState, memo, useCallback } from "react";
import { Heart, Bookmark, Bell, BellOff, EyeOff } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { IncidentLite } from "@/types/extended-domain";
import { formatListLines } from "@/hooks/use-incidents";
import { isSilenced, toggleSilenceLocal } from "@/lib/utils/silence";
import { logger } from "@/lib/utils/logger";

interface IncidentListItemProps {
  incident: IncidentLite;
  onOpen: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onToggleBookmark: (id: string) => void;
  onToggleSilence?: (id: string) => void;
  onHide?: (id: string) => void;
}

function IncidentListItemComponent({
  incident,
  onOpen,
  onToggleFavorite,
  onToggleBookmark,
  onToggleSilence,
  onHide,
}: IncidentListItemProps) {
  const { l1, l2, l3 } = formatListLines(incident);
  const updateCount = incident.updates?.length || 0;
  // Blue bar: 1 update = 20%, 5 updates = 100% (full height)
  // Each update is 1/5 of the card height
  const barHeightPercent = updateCount > 0 ? Math.min(updateCount, 5) * 20 : 0;

  // Track silence state locally
  const [silenced, setSilenced] = useState(() => isSilenced(incident.id));

  const handleToggleSilence = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    const newState = toggleSilenceLocal(incident.id);
    setSilenced(newState);
    onToggleSilence?.(incident.id);
  }, [incident.id, onToggleSilence]);

  const handleCardClick = useCallback(() => {
    const idToPass = incident.incidentId || incident.incidentNumber.toString();
    logger.debug('Opening incident', { code: 'IncidentListItem', incidentId: idToPass });
    onOpen(idToPass);
  }, [incident.incidentId, incident.incidentNumber, onOpen]);

  const handleFavoriteClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite(incident.id);
  }, [incident.id, onToggleFavorite]);

  const handleBookmarkClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleBookmark(incident.id);
  }, [incident.id, onToggleBookmark]);

  const handleHideClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onHide?.(incident.id);
  }, [incident.id, onHide]);

  return (
    <Card
      className={cn(
        "relative p-4 cursor-pointer hover:shadow-md transition-shadow",
        silenced && "opacity-50 bg-gray-50"
      )}
      onClick={handleCardClick}
    >
      {barHeightPercent > 0 && (
        <div
          className="absolute left-0 top-0 w-1.5 bg-[#007AFF] rounded-l-lg transition-all"
          style={{ height: `${barHeightPercent}%` }}
          aria-label={`${updateCount} update${updateCount !== 1 ? "s" : ""}`}
        />
      )}

      <div className="flex flex-col gap-1">
        {/* Badge Row */}
        {incident.highAlert && (
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[#FF3B30] border-[#FF3B30] shrink-0"
            >
              HIGH ALERT
            </Badge>
          </div>
        )}

        {/* Content Row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 space-y-0.5 min-w-0">
            {/* Date/Time Row - Just above state/city row, left aligned */}
            <div className="flex items-center justify-start gap-2">
              <div className="text-xs text-[#6B7280]">{l1}</div>
              {/* Silent and Hide buttons - centered to alert field */}
              <div className="flex items-center gap-1">
                <button
                  onClick={handleToggleSilence}
                  className="p-1 rounded transition-colors hover:bg-gray-100"
                  aria-label={silenced ? "Unsilence" : "Silence"}
                  title={silenced ? "Click to unsilence" : "Click to silence"}
                >
                  {silenced ? (
                    <BellOff className="h-4 w-4 text-[#FF3B30]" />
                  ) : (
                    <Bell className="h-4 w-4 text-[#34C759]" />
                  )}
                </button>
                {onHide && (
                  <button
                    onClick={handleHideClick}
                    className="p-1 rounded transition-colors hover:bg-gray-100"
                    aria-label="Hide alert"
                    title="Hide this alert"
                  >
                    <EyeOff className="h-4 w-4 text-[#FF9500]" />
                  </button>
                )}
              </div>
            </div>

            {/* Line 2: Location */}
            <div className="font-medium text-sm">{l2}</div>

            {/* Line 3: Type + Message - up to 6 lines */}
            <div className="text-sm text-[#6B7280] line-clamp-6">{l3}</div>
          </div>

          {/* Actions - Favorite and Bookmark */}
          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={handleFavoriteClick}
              className="p-1 hover:bg-[#F2F2F7] rounded transition-colors"
              aria-label={incident.isFavorited ? "Remove from favorites" : "Add to favorites"}
            >
              <Heart
                className={cn(
                  "h-5 w-5",
                  incident.isFavorited
                    ? "fill-[#FF3B30] text-[#FF3B30]"
                    : "text-[#6B7280]"
                )}
              />
            </button>
            <button
              onClick={handleBookmarkClick}
              className="p-1 hover:bg-[#F2F2F7] rounded transition-colors"
              aria-label={incident.isBookmarked ? "Remove bookmark" : "Add bookmark"}
            >
              <Bookmark
                className={cn(
                  "h-5 w-5",
                  incident.isBookmarked
                    ? "fill-[#007AFF] text-[#007AFF]"
                    : "text-[#6B7280]"
                )}
              />
            </button>
          </div>
        </div>
      </div>
    </Card>
  );
}

// Memoize component to prevent unnecessary re-renders
export const IncidentListItem = memo(IncidentListItemComponent, (prevProps, nextProps) => {
  // Custom comparison: only re-render if incident data or handlers change
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
  );
});
