"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import { FilterBar } from "@/components/filter-bar"
import { IncidentListItem } from "@/components/incident-list-item"
import { toggleFavorite, unfavorite, toggleBookmark, unbookmark } from "@/hooks/use-incidents"
import { useIncidentsWithDistance } from "@/hooks/use-incidents-with-distance"
import { useFilters } from "@/hooks/use-filters"
import { useProfile } from "@/hooks/use-profile"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { MapPin, AlertCircle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ChaserIncidentsPage() {
  const router = useRouter()
  const { filters, setDistance, setTypes, setKeyword, setHighAlertOnly, setMinUpdates } = useFilters()
  const { 
    data: incidents, 
    locationPermissionGranted, 
    userLocation 
  } = useIncidentsWithDistance(filters)
  const { data: profile, updateSettings } = useProfile()
  const { toggleSilence } = useFavoritesContext()
  const [sortByDistance, setSortByDistance] = useState(false)
  const [hiddenIncidents, setHiddenIncidents] = useState<Set<string>>(new Set())

  // Handle favorite/bookmark with Firestore toggle logic
  const handleToggleFavorite = async (id: string) => {
    const incident = incidents?.find((inc) => inc.id === id)
    if (incident?.isFavorited) {
      await unfavorite(id)
    } else {
      await toggleFavorite(id)
    }
  }

  const handleToggleBookmark = async (id: string) => {
    const incident = incidents?.find((inc) => inc.id === id)
    if (incident?.isBookmarked) {
      await unbookmark(id)
    } else {
      await toggleBookmark(id)
    }
  }

  const handleOpenIncident = (id: string) => {
    router.push(`/chaser/incident/${id}`)
  }

  const handleHideIncident = (id: string) => {
    setHiddenIncidents(prev => new Set(prev).add(id))
  }

  if (!profile) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#6B7280]">Loading...</p>
        </div>
      </RoleLayout>
    )
  }

  // Null guards, filtering, and sorting logic
  const safeIncidents = Array.isArray(incidents)
    ? (() => {
        let filtered = [...incidents];
        
        // Filter out hidden incidents
        filtered = filtered.filter(inc => !hiddenIncidents.has(inc.id));
        
        // If sorting by distance, filter to last 4 hours only (changed from 2)
        if (sortByDistance) {
          const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000);
          filtered = filtered.filter(inc => {
            const incidentTime = new Date(inc.updatedAt).getTime();
            return incidentTime >= fourHoursAgo;
          });
          
          // Sort by distance (closest first), undefined distances go to end
          filtered.sort((a, b) => {
            if (a.distanceMi === undefined) return 1;
            if (b.distanceMi === undefined) return -1;
            return a.distanceMi - b.distanceMi;
          });
        } else {
          // Default: sort by updatedAt descending (newest first)
          filtered.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        }
        
        return filtered;
      })()
    : []

  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <h1 className="text-2xl font-bold text-foreground">NFA Alerts</h1>
        </div>

        {/* Location Permission Banner */}
        {locationPermissionGranted === false && (
          <div className="bg-[#FF3B30] text-white p-3 flex items-start gap-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-sm">Location Permission Required</p>
              <p className="text-xs mt-1 opacity-90">
                Enable location to see distances to incidents. Check your browser settings.
              </p>
            </div>
          </div>
        )}

        {locationPermissionGranted === true && userLocation && (
          <div className="bg-[#34C759] text-white p-2 flex items-center justify-center gap-2">
            <MapPin className="h-4 w-4" />
            <p className="text-sm font-medium">
              Location enabled • {userLocation.lat.toFixed(4)}, {userLocation.lng.toFixed(4)}
            </p>
          </div>
        )}

        {/* Filters */}
        <FilterBar
          distanceMi={filters.distanceMi}
          onDistanceChange={setDistance}
          types={filters.types}
          onTypesChange={setTypes}
          keyword={filters.keyword}
          onKeywordChange={setKeyword}
          highAlertEnabled={filters.highAlertOnly}
          onHighAlertChange={setHighAlertOnly}
          highAlertSound={profile.settings.highAlertSound}
          onHighAlertSoundChange={(soundId) => updateSettings({ highAlertSound: soundId })}
          muted={profile.settings.muted}
          onMutedChange={(muted) => updateSettings({ muted })}
          minUpdates={filters.minUpdates}
          onMinUpdatesChange={setMinUpdates}
        />

        {/* Sort Options */}
        {locationPermissionGranted && (
          <div className="bg-white border-b border-[#E5E7EB] px-4 py-2 flex items-center justify-between">
            <p className="text-sm text-[#6B7280]">
              {sortByDistance 
                ? `Showing ${safeIncidents.length} alerts from last 4 hours, sorted by distance`
                : `Showing ${safeIncidents.length} alerts, sorted by time`
              }
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setSortByDistance(!sortByDistance)}
              className={`gap-2 ${sortByDistance ? 'animate-flash-red-white border-2' : ''}`}
            >
              <ArrowUpDown className="h-4 w-4" />
              {sortByDistance ? 'Sort by Time' : 'Sort by Distance'}
            </Button>
          </div>
        )}

        {/* Incidents List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {safeIncidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7280]">No incidents found</p>
            </div>
          ) : (
            safeIncidents.map((incident) => (
              <IncidentListItem
                key={incident.id}
                incident={incident}
                onOpen={handleOpenIncident}
                onToggleFavorite={handleToggleFavorite}
                onToggleBookmark={handleToggleBookmark}
                onToggleSilence={toggleSilence}
                onHide={handleHideIncident}
              />
            ))
          )}
        </div>
      </div>
    </RoleLayout>
  )
}
