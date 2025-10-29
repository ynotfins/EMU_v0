"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { RoleLayout } from "@/components/role-layout"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { IncidentListItem } from "@/components/incident-list-item"
import { useIncidents } from "@/hooks/use-incidents"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { Star, Bookmark, FileText } from "lucide-react"

export default function ChaserFavoritesPage() {
  const router = useRouter()
  const { data: allIncidents } = useIncidents()
  const { toggleFavorite, toggleBookmark } = useFavoritesContext()
  const [activeTab, setActiveTab] = useState("favorites")

  const favoritedIncidents = allIncidents.filter((inc) => inc.isFavorited)
  const bookmarkedIncidents = allIncidents.filter((inc) => inc.isBookmarked)
  const notedIncidents = allIncidents.filter((inc) => inc.id === "inc-001" || inc.id === "inc-003")

  const handleOpenIncident = (id: string) => {
    router.push(`/chaser/incident/${id}`)
  }

  const EmptyState = ({ icon: Icon, message }: { icon: typeof Star; message: string }) => (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Icon className="h-16 w-16 text-[#E5E7EB] mb-4" />
      <p className="text-[#6B7280]">{message}</p>
    </div>
  )

  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className="w-full bg-white border-b border-[#E5E7EB] rounded-none h-12 justify-start px-4">
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
          </TabsList>

          <TabsContent value="favorites" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0">
            {favoritedIncidents.length === 0 ? (
              <EmptyState icon={Star} message="No favorited incidents yet" />
            ) : (
              favoritedIncidents.map((incident) => (
                <IncidentListItem
                  key={incident.id}
                  incident={incident}
                  onOpen={handleOpenIncident}
                  onToggleFavorite={toggleFavorite}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="bookmarks" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0">
            {bookmarkedIncidents.length === 0 ? (
              <EmptyState icon={Bookmark} message="No bookmarked incidents yet" />
            ) : (
              bookmarkedIncidents.map((incident) => (
                <IncidentListItem
                  key={incident.id}
                  incident={incident}
                  onOpen={handleOpenIncident}
                  onToggleFavorite={toggleFavorite}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="notes" className="flex-1 overflow-y-auto p-4 space-y-3 mt-0">
            {notedIncidents.length === 0 ? (
              <EmptyState icon={FileText} message="No incidents with notes yet" />
            ) : (
              notedIncidents.map((incident) => (
                <IncidentListItem
                  key={incident.id}
                  incident={incident}
                  onOpen={handleOpenIncident}
                  onToggleFavorite={toggleFavorite}
                  onToggleBookmark={toggleBookmark}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleLayout>
  )
}
