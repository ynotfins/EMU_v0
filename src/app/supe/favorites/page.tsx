"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/features/role-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncidentListItem } from "@/components/features/incident-list-item"
import { useIncidents, toggleFavorite, unfavorite, toggleBookmark, unbookmark } from "@/hooks/use-incidents"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { Star, Bookmark, FileText, Navigation, type LucideIcon } from "lucide-react"
import { useResponses } from "@/hooks/use-responses"
import { useProfile } from "@/hooks/use-profile"
import { auth } from "@/lib/firebase/firebase"

// Empty state component (moved outside to fix ESLint rule)
function EmptyState({ icon: Icon, message }: { icon: LucideIcon; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-16 w-16 text-[#E5E7EB] mb-4" />
      <p className="text-[#6B7280]">{message}</p>
    </div>
  )
}

export default function SupeFavoritesPage() {
  const router = useRouter()
  const { data: allIncidents } = useIncidents()
  const { toggleSilence } = useFavoritesContext()
  const { data: profile } = useProfile(auth.currentUser?.uid)
  const { responses, loading: responsesLoading } = useResponses(profile?.uid)
  const [activeTab, setActiveTab] = useState("favorites")

  const safeIncidents = Array.isArray(allIncidents) ? allIncidents : []
  const favoritedIncidents = safeIncidents.filter((inc) => inc.isFavorited)
  const bookmarkedIncidents = safeIncidents.filter((inc) => inc.isBookmarked)
  const notedIncidents = safeIncidents.filter((inc) => inc.notes && inc.notes.length > 0)
  
  // Get incidents for responses
  const responseIncidents = responses.map(response => {
    return safeIncidents.find(inc => inc.id === response.incidentId)
  }).filter(Boolean)

  // Handle favorite/bookmark with Firestore toggle logic
  const handleToggleFavorite = async (id: string) => {
    const incident = safeIncidents.find((inc) => inc.id === id)
    if (incident?.isFavorited) {
      await unfavorite(id)
    } else {
      await toggleFavorite(id)
    }
  }

  const handleToggleBookmark = async (id: string) => {
    const incident = safeIncidents.find((inc) => inc.id === id)
    if (incident?.isBookmarked) {
      await unbookmark(id)
    } else {
      await toggleBookmark(id)
    }
  }

  const handleOpenIncident = (id: string) => {
    router.push(`/supe/incident/${id}`)
  }

  return (
    <RoleLayout role="supe">
      <div className="flex flex-col h-screen">
        {/* Header - Fixed at top */}
        <div className="bg-white border-b border-[#E5E7EB] p-4 fixed top-0 left-0 right-0 z-20">
          <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-16"></div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full bg-white border-b border-[#E5E7EB] rounded-none h-12 justify-start px-4 fixed top-16 left-0 right-0 z-10">
            <TabsTrigger value="favorites" className="gap-2">
              <Star className="h-4 w-4" />
              Favorites
            </TabsTrigger>
            <TabsTrigger value="bookmarks" className="gap-2">
              <Bookmark className="h-4 w-4" />
              Bookmarks
            </TabsTrigger>
            <TabsTrigger value="notes" className="gap-2">
              <FileText className="h-4 w-4" />
              Notes
            </TabsTrigger>
            <TabsTrigger value="responses" className="gap-2">
              <Navigation className="h-4 w-4" />
              Responses ({responses.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="favorites" className="flex-1 overflow-y-auto p-4 space-y-3 pt-28 pb-20 min-h-0">
            {favoritedIncidents.length === 0 ? (
              <EmptyState icon={Star} message="No favorited incidents yet" />
            ) : (
              favoritedIncidents.map((incident) => (
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
          </TabsContent>

          <TabsContent value="bookmarks" className="flex-1 overflow-y-auto p-4 space-y-3 pt-28 pb-20 min-h-0">
            {bookmarkedIncidents.length === 0 ? (
              <EmptyState icon={Bookmark} message="No bookmarked incidents yet" />
            ) : (
              bookmarkedIncidents.map((incident) => (
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
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 space-y-3 pt-28 pb-20 min-h-0">
            {notedIncidents.length === 0 ? (
              <EmptyState icon={FileText} message="No incidents with notes yet" />
            ) : (
              notedIncidents.map((incident) => (
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
          </TabsContent>

          <TabsContent value="responses" className="flex-1 overflow-y-auto p-4 space-y-3 pt-28 pb-20 min-h-0">
            {responseIncidents.length === 0 ? (
              <EmptyState icon={Navigation} message="No responses yet" />
            ) : (
              responseIncidents.map((incident) => (
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
          </TabsContent>
        </Tabs>
      </div>
    </RoleLayout>
  )
}
