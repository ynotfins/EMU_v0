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
import { Map, AlertCircle, Filter, SortAsc, Flame, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { spacing, borderRadius, cardStyles, colors, iconSizes, typography } from "@/lib/design-tokens"

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
  const [filtersCollapsed, setFiltersCollapsed] = useState(true)

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

  const handleUnhideIncident = (id: string) => {
    setHiddenIncidents(prev => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }

  if (!profile) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center h-screen bg-[#F8F9FA]">
          <Card style={{ ...cardStyles.base, padding: spacing['2xl'], textAlign: 'center' }}>
            <div className="animate-pulse">
              <Flame style={{ 
                width: iconSizes['2xl'], 
                height: iconSizes['2xl'], 
                color: colors.primary.DEFAULT,
                margin: '0 auto',
                marginBottom: spacing.lg
              }} />
              <p style={{ fontSize: typography.fontSize.lg, color: colors.gray[600] }}>
                Loading alerts...
              </p>
            </div>
          </Card>
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
        
        // If sorting by distance, filter to last 4 hours only
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
      <div className="flex flex-col min-h-screen" style={{ backgroundColor: '#F8F9FA' }}>
        {/* Modern Header */}
        <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-20">
          <div style={{ 
            padding: `${spacing.lg} ${spacing.xl}`,
          }}>
            <div className="flex items-center justify-between">
              {/* Left: Logo + Title */}
              <div className="flex items-center gap-4">
                <img 
                  src="/app-icon.png" 
                  alt="EMU Alerts" 
                  style={{ 
                    width: iconSizes['xl'], 
                    height: iconSizes['xl'],
                    borderRadius: borderRadius.md
                  }}
                />
                <div>
                  <h1 style={{ 
                    fontSize: typography.fontSize['2xl'], 
                    fontWeight: typography.fontWeight.bold,
                    color: colors.gray[900]
                  }}>
                    Fire Alerts
                  </h1>
                  <p style={{ 
                    fontSize: typography.fontSize.sm,
                    color: colors.gray[600]
                  }}>
                    {safeIncidents.length} active incidents
                  </p>
                </div>
              </div>
              
              {/* Right: Actions */}
              <div className="flex items-center gap-3">
                {/* Filter Toggle */}
                <Button
                  variant="outline"
                  onClick={() => setFiltersCollapsed(!filtersCollapsed)}
                  style={{ 
                    borderRadius: borderRadius.md,
                    padding: `${spacing.md} ${spacing.lg}`,
                    borderColor: colors.gray[300],
                    gap: spacing.sm
                  }}
                >
                  <Filter style={{ width: iconSizes.md, height: iconSizes.md }} />
                  {filtersCollapsed ? 'Filters' : 'Hide'}
                </Button>

                {/* High Alert Toggle */}
                <Button
                  onClick={() => setHighAlertOnly(!filters.highAlertOnly)}
                  style={{ 
                    borderRadius: borderRadius.md,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: filters.highAlertOnly ? colors.danger.DEFAULT : 'transparent',
                    color: filters.highAlertOnly ? 'white' : colors.danger.DEFAULT,
                    border: `2px solid ${colors.danger.DEFAULT}`,
                    fontWeight: typography.fontWeight.semibold,
                    transition: 'all 0.2s ease'
                  }}
                  className={filters.highAlertOnly ? 'animate-pulse' : ''}
                >
                  <Flame style={{ width: iconSizes.md, height: iconSizes.md, marginRight: spacing.sm }} />
                  HIGH ALERT
                </Button>

                {/* Live Map */}
                <Button
                  onClick={() => router.push("/chaser/map")}
                  style={{ 
                    borderRadius: borderRadius.md,
                    padding: `${spacing.md} ${spacing.lg}`,
                    backgroundColor: colors.primary.DEFAULT,
                    color: 'white',
                    fontWeight: typography.fontWeight.medium,
                    gap: spacing.sm
                  }}
                  className="hover:opacity-90 transition-opacity"
                >
                  <Map style={{ width: iconSizes.md, height: iconSizes.md }} />
                  Live Map
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Spacer for fixed header */}
        <div style={{ height: '120px' }}></div>

        {/* Filter Panel */}
        {!filtersCollapsed && (
          <div className="bg-white shadow-sm" style={{ 
            padding: spacing.xl,
            borderBottom: `1px solid ${colors.gray[200]}`
          }}>
            <Card style={{ ...cardStyles.base, padding: spacing.xl }}>
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
            </Card>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1" style={{ padding: spacing.xl }}>
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            {/* Location Permission Alert */}
            {locationPermissionGranted === false && (
              <Card style={{ 
                ...cardStyles.base, 
                marginBottom: spacing.xl,
                backgroundColor: colors.warning.light,
                border: `2px solid ${colors.warning.DEFAULT}`,
                padding: spacing.lg
              }}>
                <div className="flex items-start gap-3">
                  <AlertCircle style={{ 
                    width: iconSizes.lg, 
                    height: iconSizes.lg,
                    color: colors.warning.dark,
                    flexShrink: 0
                  }} />
                  <div>
                    <h3 style={{ 
                      fontSize: typography.fontSize.lg,
                      fontWeight: typography.fontWeight.semibold,
                      color: colors.warning.dark,
                      marginBottom: spacing.xs
                    }}>
                      Location Permission Required
                    </h3>
                    <p style={{ 
                      fontSize: typography.fontSize.sm,
                      color: colors.warning.dark,
                      opacity: 0.9
                    }}>
                      Enable location access to see distances to incidents. Check your browser settings.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {/* Sort Options */}
            {locationPermissionGranted && safeIncidents.length > 0 && (
              <Card style={{ 
                ...cardStyles.base, 
                marginBottom: spacing.xl,
                padding: spacing.lg
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SortAsc style={{ 
                      width: iconSizes.md, 
                      height: iconSizes.md,
                      color: colors.gray[500]
                    }} />
                    <span style={{ 
                      fontSize: typography.fontSize.base,
                      color: colors.gray[700],
                      fontWeight: typography.fontWeight.medium
                    }}>
                      Sort by:
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => setSortByDistance(!sortByDistance)}
                    style={{ 
                      borderRadius: borderRadius.md,
                      padding: `${spacing.sm} ${spacing.lg}`,
                      borderColor: sortByDistance ? colors.primary.DEFAULT : colors.gray[300],
                      color: sortByDistance ? colors.primary.DEFAULT : colors.gray[700],
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    {sortByDistance ? '📍 Closest First' : '🕐 Newest First'}
                  </Button>
                </div>
              </Card>
            )}

            {/* Hidden Incidents Banner */}
            {hiddenIncidents.size > 0 && (
              <Card style={{ 
                ...cardStyles.base, 
                marginBottom: spacing.xl,
                backgroundColor: colors.gray[50],
                border: `1px solid ${colors.gray[200]}`,
                padding: spacing.md
              }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <EyeOff style={{ 
                      width: iconSizes.sm, 
                      height: iconSizes.sm,
                      color: colors.gray[500]
                    }} />
                    <span style={{ 
                      fontSize: typography.fontSize.sm,
                      color: colors.gray[600],
                      fontWeight: typography.fontWeight.medium
                    }}>
                      {hiddenIncidents.size} alert{hiddenIncidents.size > 1 ? 's' : ''} hidden
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setHiddenIncidents(new Set())}
                    style={{ 
                      color: colors.primary.DEFAULT,
                      fontWeight: typography.fontWeight.medium
                    }}
                  >
                    Show All
                  </Button>
                </div>
              </Card>
            )}

            {/* Empty State */}
            {safeIncidents.length === 0 && (
              <Card style={{ 
                ...cardStyles.base, 
                textAlign: "center",
                padding: spacing['3xl']
              }}>
                <AlertCircle style={{ 
                  width: '64px', 
                  height: '64px',
                  color: colors.gray[300],
                  margin: '0 auto',
                  marginBottom: spacing.xl
                }} />
                <h3 style={{ 
                  fontSize: typography.fontSize.xl,
                  fontWeight: typography.fontWeight.semibold,
                  color: colors.gray[700],
                  marginBottom: spacing.sm
                }}>
                  No active alerts
                </h3>
                <p style={{ 
                  fontSize: typography.fontSize.base,
                  color: colors.gray[500]
                }}>
                  Check back later for updates or adjust your filters
                </p>
              </Card>
            )}

            {/* Incident List */}
            {safeIncidents.length > 0 && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: spacing.md }}>
                {safeIncidents.map((incident) => (
                  <Card 
                    key={incident.id} 
                    style={{ 
                      ...cardStyles.base,
                      padding: 0,
                      overflow: "hidden",
                      transition: "all 0.2s ease",
                      cursor: 'pointer'
                    }}
                    className="hover:shadow-lg"
                    onClick={() => handleOpenIncident(incident.id)}
                  >
                    <IncidentListItem
                      incident={incident}
                      onOpen={handleOpenIncident}
                      onToggleFavorite={handleToggleFavorite}
                      onToggleBookmark={handleToggleBookmark}
                      onToggleSilence={toggleSilence}
                      onHide={handleHideIncident}
                    />
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </RoleLayout>
  )
}
