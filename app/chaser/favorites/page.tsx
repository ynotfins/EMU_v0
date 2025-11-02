"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RoleLayout } from "@/components/role-layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { IncidentListItem } from "@/components/incident-list-item";
import {
  useIncidents,
  toggleFavorite,
  unfavorite,
  toggleBookmark,
  unbookmark,
} from "@/hooks/use-incidents";
import { useFavoritesContext } from "@/lib/context/favorites-context";
import { Heart, Bookmark, FileText, Navigation, type LucideIcon } from "lucide-react";
import { useResponses } from "@/hooks/use-responses";
import { useProfile } from "@/hooks/use-profile";
import { auth } from "@/lib/firebase";

// Enhanced empty state with nice UI matching screenshots
function EmptyState({
  icon: Icon,
  title,
  message,
  actionLabel,
  onAction,
  iconColor,
}: {
  icon: LucideIcon;
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  iconColor?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center px-6 py-20">
      <Icon 
        className={`h-32 w-32 mb-6 ${iconColor || "text-gray-300"}`}
        strokeWidth={1}
        fill={iconColor ? "currentColor" : "none"}
      />
      <h2 className="text-2xl font-bold text-gray-900 mb-3">{title}</h2>
      <p className="text-gray-500 mb-8 max-w-xs">{message}</p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#007AFF] hover:bg-[#0051D5] text-white px-8 py-6 text-base font-semibold rounded-full"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}

export default function ChaserFavoritesPage() {
  const router = useRouter();
  const { data: allIncidents } = useIncidents();
  const { toggleSilence } = useFavoritesContext();
  const { data: profile } = useProfile(auth.currentUser?.uid);
  const { responses, loading: responsesLoading } = useResponses(profile?.uid);
  const [activeTab, setActiveTab] = useState("favorites");

  const safeIncidents = Array.isArray(allIncidents) ? allIncidents : [];
  const favoritedIncidents = safeIncidents.filter((inc) => inc.isFavorited);
  const bookmarkedIncidents = safeIncidents.filter((inc) => inc.isBookmarked);
  const notedIncidents = safeIncidents.filter(
    (inc) => inc.id === "inc-001" || inc.id === "inc-003"
  );
  
  // Get incidents for responses
  const responseIncidents = responses.map(response => {
    return safeIncidents.find(inc => inc.id === response.incidentId);
  }).filter(Boolean);

  // Handle favorite/bookmark with Firestore toggle logic
  const handleToggleFavorite = async (id: string) => {
    const incident = safeIncidents.find((inc) => inc.id === id);
    if (incident?.isFavorited) {
      await unfavorite(id);
    } else {
      await toggleFavorite(id);
    }
  };

  const handleToggleBookmark = async (id: string) => {
    const incident = safeIncidents.find((inc) => inc.id === id);
    if (incident?.isBookmarked) {
      await unbookmark(id);
    } else {
      await toggleBookmark(id);
    }
  };

  const handleOpenIncident = (id: string) => {
    router.push(`/chaser/incident/${id}`);
  };

  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen">
        {/* Header - Fixed at top */}
        <div className="bg-white border-b border-[#E5E7EB] p-4 fixed top-0 left-0 right-0 z-20">
          <h1 className="text-2xl font-bold text-foreground">Favorites</h1>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-16"></div>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex-1 flex flex-col"
        >
          <TabsList className="w-full bg-white border-b border-[#E5E7EB] rounded-none h-12 justify-start px-4 fixed top-16 left-0 right-0 z-10">
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="h-4 w-4" />
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

          <TabsContent
            value="favorites"
            className="flex-1 overflow-y-auto p-0 mt-12 pb-20"
          >
            {favoritedIncidents.length === 0 ? (
              <EmptyState
                icon={Heart}
                title="No Favorites Yet"
                message="Tap the heart icon on any NFA Alert to add it to your favorites"
                actionLabel="Browse NFA Alerts"
                onAction={() => router.push("/chaser/incidents")}
                iconColor="text-[#FF3B30]"
              />
            ) : (
              <div className="p-4 space-y-3">
                {favoritedIncidents.map((incident) => (
                  <IncidentListItem
                    key={incident.id}
                    incident={incident}
                    onOpen={handleOpenIncident}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleSilence={toggleSilence}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="bookmarks"
            className="flex-1 overflow-y-auto p-0 mt-12 pb-20"
          >
            {bookmarkedIncidents.length === 0 ? (
              <EmptyState
                icon={Bookmark}
                title="No Bookmarks Yet"
                message="Tap the bookmark icon on any NFA Alert to save it for later"
                actionLabel="Browse NFA Alerts"
                onAction={() => router.push("/chaser/incidents")}
              />
            ) : (
              <div className="p-4 space-y-3">
                {bookmarkedIncidents.map((incident) => (
                  <IncidentListItem
                    key={incident.id}
                    incident={incident}
                    onOpen={handleOpenIncident}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleSilence={toggleSilence}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent
            value="notes"
            className="flex-1 overflow-y-auto p-0 mt-12 pb-20"
          >
            {notedIncidents.length === 0 ? (
              <EmptyState
                icon={FileText}
                title="No Notes Yet"
                message="Add notes to incidents to keep track of important information"
                actionLabel="Browse NFA Alerts"
                onAction={() => router.push("/chaser/incidents")}
              />
            ) : (
              <div className="p-4 space-y-3">
                {notedIncidents.map((incident) => (
                  <IncidentListItem
                    key={incident.id}
                    incident={incident}
                    onOpen={handleOpenIncident}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleSilence={toggleSilence}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          {/* Responses Tab - Shows incidents user has responded to */}
          <TabsContent
            value="responses"
            className="flex-1 overflow-y-auto p-0 mt-12 pb-20"
          >
            {responsesLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#007AFF] mx-auto mb-4"></div>
                  <p className="text-sm text-gray-500">Loading responses...</p>
                </div>
              </div>
            ) : responseIncidents.length === 0 ? (
              <EmptyState
                icon={Navigation}
                title="No Responses Yet"
                message="When you respond to an alert, it will appear here"
                actionLabel="View All Alerts"
                onAction={() => router.push("/chaser/incidents")}
                iconColor="text-[#34C759]"
              />
            ) : (
              <div className="divide-y divide-gray-200">
                {responseIncidents.map((incident: any) => (
                  <IncidentListItem
                    key={incident.id}
                    incident={incident}
                    onOpen={(incidentId) => {
                      router.push(`/chaser/incident/${incidentId}`);
                    }}
                    onToggleFavorite={handleToggleFavorite}
                    onToggleBookmark={handleToggleBookmark}
                    onToggleSilence={toggleSilence}
                  />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </RoleLayout>
  );
}
