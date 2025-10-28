"use client"

import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import { FilterBar } from "@/components/filter-bar"
import { IncidentListItem } from "@/components/incident-list-item"
import { useIncidents } from "@/hooks/use-incidents"
import { useFilters } from "@/hooks/use-filters"
import { useProfile } from "@/hooks/use-profile"
import { useFavoritesContext } from "@/lib/context/favorites-context"

export default function ChaserIncidentsPage() {
  const router = useRouter()
  const { filters, setDistance, setTypes, setKeyword, setHighAlertOnly, setMinUpdates } = useFilters()
  const { data: incidents } = useIncidents(filters)
  const { data: profile, updateSettings } = useProfile()
  const { toggleFavorite, toggleBookmark, toggleSilence } = useFavoritesContext()

  const handleOpenIncident = (id: string) => {
    router.push(`/chaser/incident/${id}`)
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

  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <h1 className="text-2xl font-bold text-foreground">NFA Alerts</h1>
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
          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#6B7280]">No incidents found</p>
            </div>
          ) : (
            incidents.map((incident) => (
              <IncidentListItem
                key={incident.id}
                incident={incident}
                onOpen={handleOpenIncident}
                onToggleFavorite={toggleFavorite}
                onToggleBookmark={toggleBookmark}
                onToggleSilence={toggleSilence}
              />
            ))
          )}
        </div>
      </div>
    </RoleLayout>
  )
}
