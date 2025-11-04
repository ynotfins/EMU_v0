"use client";

import { useIncident, addNote } from "@/hooks/use-incident";
import { useFiles } from "@/hooks/use-files";
import { toggleFavorite, toggleBookmark } from "@/hooks/use-incidents";
import { useState } from "react";
import { RoleLayout } from "@/components/features/role-layout";
import { MapCard } from "@/components/map-card";
import { HomeownerForm } from "@/components/features/homeowner-form";
import { DocsManager } from "@/components/features/docs-manager";
import { ESignManager } from "@/components/features/esign-manager";
import { IncidentChat } from "@/components/features/incident-chat";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, MessageCircle } from "lucide-react";
import type { HomeownerForm as HomeownerFormType } from "@/types/extended-domain";
import { useProfile } from "@/hooks/use-profile";
import { auth } from "@/lib/firebase/firebase";

export default function Client({ id }: { id: string }) {
  const { data: incident, updates, error } = useIncident(id);
  const { data: files } = useFiles(id);
  const { data: profile } = useProfile(auth.currentUser?.uid);
  const [noteText, setNoteText] = useState("");
  const [homeownerData, setHomeownerData] = useState<HomeownerFormType>({});

  if (error) {
    return (
      <RoleLayout role="supe">
        <div className="flex items-center justify-center h-screen">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </RoleLayout>
    );
  }

  if (!incident) {
    return (
      <RoleLayout role="supe">
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#6B7280]">Loading incident...</p>
        </div>
      </RoleLayout>
    );
  }

  // Render supe detail UI with all tabs
  return (
    <RoleLayout role="supe">
      <div className="flex flex-col h-screen bg-white">
        {/* Header with Back Button - Fixed at top */}
        <div className="bg-[#007AFF] text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-20">
          <button onClick={() => window.history.back()} className="text-white">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">Incident #{incident.incidentNumber}</h1>
          <button className="text-white">⋮</button>
        </div>

        {/* Spacer for fixed header */}
        <div className="h-14"></div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="flex-1 flex flex-col overflow-hidden">
          <TabsList className="w-full justify-start rounded-none border-b bg-white fixed top-14 left-0 right-0 z-10 h-12">
            <TabsTrigger value="details" className="flex-1">
              Details
            </TabsTrigger>
            <TabsTrigger value="homeowner" className="flex-1">
              Homeowner
            </TabsTrigger>
            <TabsTrigger value="docs" className="flex-1">
              Docs
            </TabsTrigger>
            <TabsTrigger value="sign" className="flex-1">
              eSign
            </TabsTrigger>
            <TabsTrigger value="chat" className="flex-1">
              <MessageCircle className="h-4 w-4 mr-1 inline" />
              Chat
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto pb-20 pt-12 min-h-0">
            <TabsContent value="details" className="m-0 space-y-0 min-h-0">
              {/* Map - Embedded Google Maps at CITY zoom level */}
              <div className="w-full h-64 bg-gray-100 relative">
                {/* Google Maps Embed showing CITY zoom (zoom=12) */}
                {process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ? (
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, pointerEvents: 'none' }}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&q=${encodeURIComponent(incident.address + ', ' + incident.city + ', ' + incident.state)}&zoom=12`}
                    title="Incident Location Map"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-500">
                    <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <p className="text-sm font-medium">Map Unavailable</p>
                    <p className="text-xs mt-1">Google Maps API key not configured</p>
                  </div>
                )}

                {/* Alert ID - Lower Left Corner */}
                <Badge 
                  className="absolute bottom-2 left-2 bg-[#007AFF] hover:bg-[#007AFF] cursor-default z-10 pointer-events-none"
                >
                  #NFA-{incident.incidentNumber}
                </Badge>
              </div>

              {/* Incident Header */}
              <div className="p-4 border-b">
                <div className="flex items-start justify-between mb-2">
                  <h2 className="text-xl font-bold">{incident.type}</h2>
                  <button
                    onClick={() => toggleFavorite(id)}
                    className="transition-colors"
                    aria-label={
                      incident.isFavorited
                        ? "Remove from favorites"
                        : "Add to favorites"
                    }
                  >
                    <Heart
                      className={`h-6 w-6 transition-colors ${
                        incident.isFavorited
                          ? "fill-[#FF3B30] text-[#FF3B30]"
                          : "text-gray-400 hover:text-[#FF3B30]"
                      }`}
                    />
                  </button>
                </div>
                <p className="font-semibold text-lg mb-1">{incident.address}</p>
                <p className="text-gray-600 text-sm">
                  {incident.state}, {incident.county}, {incident.city}
                </p>
              </div>

              {/* Updates Section */}
              {updates && updates.length > 0 ? (
                <div className="px-4 py-3">
                  <h3 className="font-semibold text-base mb-3">
                    Updates ({updates.length})
                  </h3>
                  <div className="space-y-3">
                    {updates.map((update, idx) => (
                      <div
                        key={update.id || update.ts}
                        className={`text-sm p-3 rounded-lg ${
                          update.stage === 'new' 
                            ? 'bg-blue-50 border-l-4 border-blue-500' 
                            : 'bg-gray-50 border-l-4 border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-semibold text-gray-700 uppercase">
                            {update.stage === 'new' ? '🆕 Initial Alert' : '[DOC] Update'} #{updates.length - idx}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {new Date(update.ts).toLocaleString()}
                          </p>
                        </div>
                        {update.title && update.title !== update.stage && (
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {update.title}
                          </p>
                        )}
                        <p className="text-gray-800 whitespace-pre-wrap wrap-break-word">
                          {update.message || 'No message provided'}
                        </p>
                        {update.address && (
                          <p className="text-xs text-gray-600 mt-2">
                            [LOC] {update.address}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3">
                  <h3 className="font-semibold text-base mb-3">
                    Initial Alert
                  </h3>
                  <div className="text-sm bg-gray-50 p-3 rounded-lg">
                    <p className="text-xs text-gray-500 mb-1 font-medium">
                      {new Date(incident.updatedAt).toLocaleString()}
                    </p>
                    <p className="text-sm font-semibold text-gray-900 mb-1">
                      {incident.type}
                    </p>
                    <p className="text-gray-800 whitespace-pre-wrap wrap-break-word">
                      {incident.message || incident.address}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2 italic">
                    No updates yet for this incident
                  </p>
                </div>
              )}

              {/* Employee Notes - Auto-saves on blur */}
              <div className="px-4 py-3">
                <h3 className="font-semibold text-base mb-3">
                  Employee Notes{" "}
                  <span className="text-xs text-gray-500">(auto-saves)</span>
                </h3>
                <Textarea
                  placeholder="Add your notes about this alert... (saves automatically when you leave this field)"
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  onBlur={async () => {
                    // Auto-save when user leaves the textarea
                    if (noteText.trim()) {
                      console.log("[Notes] Auto-saving note:", noteText);
                      await addNote(incident.id, noteText);
                      // Clear after successful save
                      setNoteText("");
                    }
                  }}
                  className="min-h-32"
                />

                {/* Display existing notes */}
                {incident.notes && incident.notes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">
                      Saved Notes ({incident.notes.length})
                    </h4>
                    {incident.notes.map((note: any, index: number) => (
                      <div key={index} className="p-3 bg-blue-50 border-l-4 border-blue-500 rounded">
                        <p className="text-xs text-gray-600 mb-1">
                          {new Date(note.createdAt || note.ts).toLocaleString()} • {note.createdBy || note.uid || 'User'}
                        </p>
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">{note.text}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="homeowner" className="p-4">
              <HomeownerForm 
                data={homeownerData}
                onChange={setHomeownerData}
                incidentId={id}
              />
            </TabsContent>

            <TabsContent value="docs" className="p-4">
              <DocsManager incidentId={id} files={files || []} />
            </TabsContent>

            <TabsContent value="sign" className="p-4">
              <ESignManager 
                incidentId={id} 
                files={files?.filter(f => f.type === 'document') || []}
              />
            </TabsContent>

            <TabsContent value="chat" className="p-4">
              <IncidentChat incidentId={id} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </RoleLayout>
  );
}

