"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/features/role-layout"

// Helper to normalize Firestore timestamps
function normalizeTimestamp(ts: string | Date | { seconds: number }): number {
  if (typeof ts === 'string') return new Date(ts).getTime();
  if (ts instanceof Date) return ts.getTime();
  if (ts && typeof ts === 'object' && 'seconds' in ts) return ts.seconds * 1000;
  return Date.now();
}
import { FilterBar } from "@/components/features/filter-bar"
import { IncidentListItem } from "@/components/features/incident-list-item"
import { toggleFavorite, unfavorite, toggleBookmark, unbookmark } from "@/hooks/use-incidents"
import { useIncidentsWithDistance } from "@/hooks/use-incidents-with-distance"
import { useFilters } from "@/hooks/use-filters"
import { useProfile } from "@/hooks/use-profile"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { Map, MapPin, AlertCircle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SharedIncidentsPage() {
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
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)

  // Determine role dynamically based on user profile
  const userRole = profile?.role === "super_admin" || profile?.role === "admin" || profile?.role === "supe" 
    ? "supe" 
    : "chaser"

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
    // Use shared incident route
    router.push(`/incident/${id}`)
  }

  const handleHideIncident = (id: string) => {
    setHiddenIncidents(prev => new Set(prev).add(id))
  }

  const handleUnhideIncident = (id: string) =>
    setHiddenIncidents(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })


  if (!profile) {
    return (
      <RoleLayout role={userRole}>
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
            const incidentTime = normalizeTimestamp(inc.updatedAt);
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
          filtered.sort((a, b) => normalizeTimestamp(b.updatedAt) - normalizeTimestamp(a.updatedAt));
        }
        
        return filtered;
      })()
    : []

  return (
    <RoleLayout role={userRole}>
      <div className="flex flex-col h-screen bg-white">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-bold text-foreground">Incidents</h1>
            <div className="flex items-center gap-2">
              {!locationPermissionGranted && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    try {
                      const permission = await navigator.permissions.query({ name: 'geolocation' as PermissionName })
                      if (permission.state === 'denied') {
                        alert('Location permission denied. Please enable it in your browser settings.')
                      }
                    } catch (err) {
                      // Fallback for browsers that don't support permissions API
                    }
                  }}
                  className="text-xs"
                >
                  <MapPin className="h-4 w-4 mr-1" />
                  Enable Location
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortByDistance(!sortByDistance)}
                className={sortByDistance ? "bg-[#007AFF] text-white hover:bg-[#0051D5]" : ""}
              >
                <ArrowUpDown className="h-4 w-4 mr-1" />
                {sortByDistance ? "Sort by Time" : "Sort by Distance"}
              </Button>
            </div>
          </div>

          {/* Filter Bar */}
          <FilterBar
            filters={filters}
            onDistanceChange={setDistance}
            onTypesChange={setTypes}
            onKeywordChange={setKeyword}
            onHighAlertOnlyChange={setHighAlertOnly}
            onMinUpdatesChange={setMinUpdates}
            collapsed={filtersCollapsed}
            onToggleCollapse={() => setFiltersCollapsed(!filtersCollapsed)}
          />
        </div>

        {/* Incident List */}
        <div className="flex-1 overflow-y-auto pb-20">
          {safeIncidents.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-8">
              <AlertCircle className="h-12 w-12 text-[#6B7280] mb-4" />
              <p className="text-lg font-semibold text-foreground mb-2">No incidents found</p>
              <p className="text-sm text-[#6B7280]">
                {filters.keyword || filters.types.length > 0 || filters.highAlertOnly || filters.minUpdates > 0
                  ? "Try adjusting your filters"
                  : "New incidents will appear here"}
              </p>
            </div>
          ) : (
            <div data-testid="incidents-list" className="space-y-4 p-4">
              {safeIncidents.map((incident) => (
                <IncidentListItem
                  key={incident.id}
                  incident={incident}
                  onOpen={() => handleOpenIncident(incident.incidentId || incident.incidentNumber?.toString() || incident.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onToggleBookmark={handleToggleBookmark}
                  onToggleSilence={toggleSilence}
                  onHide={handleHideIncident}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  )
}

