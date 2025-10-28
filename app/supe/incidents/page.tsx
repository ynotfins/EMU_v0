"use client"

import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import { FilterBar } from "@/components/filter-bar"
import { IncidentListItem } from "@/components/incident-list-item"
import { useIncidents, toggleFavorite, unfavorite, toggleBookmark, unbookmark } from "@/hooks/use-incidents"
import { useFilters } from "@/hooks/use-filters"
import { useProfile } from "@/hooks/use-profile"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { Button } from "@/components/ui/button"
import { Map } from "lucide-react"

export default function SupeIncidentsPage() {
  const router = useRouter()
  const { filters, setDistance, setTypes, setKeyword, setHighAlertOnly, setMinUpdates } = useFilters()
  const { data: incidents } = useIncidents(filters)
  const { data: profile, updateSettings } = useProfile()
  const { toggleSilence } = useFavoritesContext()

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
    router.push(`/supe/incident/${id}`)
  }

  if (!profile) {
    return (
      <RoleLayout role="supe">
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#6B7280]">Loading...</p>
        </div>
      </RoleLayout>
    )
  }

  // Null guards and sort by updatedAt descending (newest first)
  const safeIncidents = Array.isArray(incidents)
    ? [...incidents].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
    : []

  return (
    <RoleLayout role="supe">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-foreground">NFA Alerts</h1>
          <Button onClick={() => router.push("/supe/map")} className="bg-[#007AFF] hover:bg-[#0051D5]">
            <Map className="h-4 w-4 mr-2" />
            Live Map
          </Button>
        </div>

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
              />
            ))
          )}
        </div>
      </div>
    </RoleLayout>
  )
}
