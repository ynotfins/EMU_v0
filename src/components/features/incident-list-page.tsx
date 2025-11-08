"use client"

import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/features/role-layout"
import { FilterBar } from "@/components/features/filter-bar"
import { IncidentListItem } from "@/components/features/incident-list-item"
import { toggleFavorite, unfavorite, toggleBookmark, unbookmark } from "@/hooks/use-incidents"
import { useIncidentsWithDistance } from "@/hooks/use-incidents-with-distance"
import { useFilters } from "@/hooks/use-filters"
import { useProfile } from "@/hooks/use-profile"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { Map, AlertCircle, ArrowUpDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import type { IncidentLite } from "@/types/extended-domain"

function normalizeTimestamp(ts: string | Date | { seconds: number }): number {
  if (typeof ts === 'string') return new Date(ts).getTime()
  if (ts instanceof Date) return ts.getTime()
  if (ts && typeof ts === 'object' && 'seconds' in ts) return ts.seconds * 1000
  return Date.now()
}

interface IncidentListPageProps {
  role: "chaser" | "supe"
}

export function IncidentListPage({ role }: IncidentListPageProps) {
  const router = useRouter()
  const { filters, setDistance, setTypes, setKeyword, setHighAlertOnly, setMinUpdates } = useFilters()
  const { data: incidents, locationPermissionGranted } = useIncidentsWithDistance(filters)
  const { data: profile, updateSettings } = useProfile()
  const { toggleSilence } = useFavoritesContext()
  const [sortByDistance, setSortByDistance] = useState(false)
  const [hiddenIncidents, setHiddenIncidents] = useState<Set<string>>(new Set())
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)

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
    router.push(`/${role}/incident/${id}`)
  }

  const handleHideIncident = (id: string) => {
    setHiddenIncidents(prev => new Set(prev).add(id))
  }

  const safeIncidents = useMemo(() => {
    if (!Array.isArray(incidents)) return []
    
    let filtered = incidents.filter(inc => !hiddenIncidents.has(inc.id))
    
    if (sortByDistance) {
      const fourHoursAgo = Date.now() - (4 * 60 * 60 * 1000)
      filtered = filtered.filter(inc => {
        const incidentTime = normalizeTimestamp(inc.updatedAt)
        return incidentTime >= fourHoursAgo
      })
      
      filtered.sort((a, b) => {
        if (a.distanceMi === undefined) return 1
        if (b.distanceMi === undefined) return -1
        return a.distanceMi - b.distanceMi
      })
    } else {
      filtered.sort((a, b) => normalizeTimestamp(b.updatedAt) - normalizeTimestamp(a.updatedAt))
    }
    
    return filtered
  }, [incidents, hiddenIncidents, sortByDistance])

  if (!profile) {
    return (
      <RoleLayout role={role}>
        <div className="flex items-center justify-center h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </RoleLayout>
    )
  }

  return (
    <RoleLayout role={role}>
      <div className="flex flex-col h-screen">
        <div className="bg-background border-b border-border px-4 py-2 flex items-center justify-between fixed top-0 left-0 right-0 z-20">
          <div className="flex items-center gap-2">
            <img 
              src="/app-icon.png" 
              alt="EMU Alerts" 
              className="h-10 w-10"
            />
            <h1 className="text-xl font-bold text-muted-foreground">FIRE ALERTS</h1>
          </div>
          
          <div className="flex items-end gap-2">
            <button
              onClick={() => setFiltersCollapsed(!filtersCollapsed)}
              className="text-2xl pb-1 hover:scale-110 transition-transform"
              title={filtersCollapsed ? "Show filters" : "Hide filters"}
            >
              🤏
            </button>

            <button
              onClick={() => setHighAlertOnly(!filters.highAlertOnly)}
              className={`relative px-4 py-2 rounded-md font-bold text-xs leading-tight transition-all ${
                filters.highAlertOnly 
                  ? 'bg-destructive text-destructive-foreground shadow-lg' 
                  : 'bg-muted text-muted-foreground border border-border'
              }`}
            >
              <div className="flex flex-col items-center">
                <span>HIGH</span>
                <span>ALERT</span>
              </div>
              {filters.highAlertOnly && (
                <div className="absolute -top-2 -right-2 text-destructive text-2xl animate-pulse">
                  ≈
                </div>
              )}
            </button>
            
            <Button onClick={() => router.push(`/${role}/map`)} size="sm" className="bg-primary hover:bg-primary/90 text-xs px-3 py-1 h-7">
              <Map className="h-3 w-3 mr-1" />
              Live Map
            </Button>
          </div>
        </div>

        <div className="h-12" />

        {locationPermissionGranted === false && (
          <Alert variant="destructive" className="m-3">
            <AlertCircle className="h-5 w-5" />
            <AlertDescription>
              <p className="font-semibold text-sm">Location Permission Required</p>
              <p className="text-xs mt-1 opacity-90">
                Enable location to see distances to incidents. Check your browser settings.
              </p>
            </AlertDescription>
          </Alert>
        )}

        {locationPermissionGranted && !filtersCollapsed && (
          <div className="bg-background border-b border-border px-4 py-2 flex items-center justify-end">
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

        {!filtersCollapsed && (
          <FilterBar
            distanceMi={filters.distanceMi}
            onDistanceChange={setDistance}
            types={filters.types}
            onTypesChange={setTypes}
            keyword={filters.keyword}
            onKeywordChange={setKeyword}
            highAlertEnabled={filters.highAlertOnly}
            onHighAlertChange={setHighAlertOnly}
            highAlertSound={profile.settings?.highAlertSound ?? 'default'}
            onHighAlertSoundChange={(soundId) => updateSettings({ highAlertSound: soundId })}
            muted={profile.settings?.muted ?? false}
            onMutedChange={(muted) => updateSettings({ muted })}
            minUpdates={filters.minUpdates}
            onMinUpdatesChange={setMinUpdates}
          />
        )}

        {hiddenIncidents.size > 0 && (
          <div className="bg-muted text-muted-foreground px-3 py-1 flex items-center justify-between text-xs border-b border-border">
            <span className="font-medium">
              {hiddenIncidents.size} alert{hiddenIncidents.size > 1 ? 's' : ''} hidden
            </span>
            <button
              onClick={() => setHiddenIncidents(new Set())}
              className="text-muted-foreground hover:text-foreground hover:underline"
            >
              Show All
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-20">
          {safeIncidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No incidents found</p>
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

