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
import type { HomeownerForm as HomeownerFormType } from "@/types/domain";
import { recordAlertResponse } from "@/lib/actions/responses";
import { useProfile } from "@/hooks/use-profile";
import { auth } from "@/lib/firebase/firebase";

export default function Client({ id }: { id: string }) {
  const { data: incident, updates, error } = useIncident(id);
  const { data: files } = useFiles(id);
  const { data: profile } = useProfile(auth.currentUser?.uid);
  const [noteText, setNoteText] = useState("");
  const [homeownerData, setHomeownerData] = useState<HomeownerFormType>({});
  const [responding, setResponding] = useState(false);

  // Handle respond to alert action
  const handleRespondToAlert = async () => {
    if (!profile || !incident || responding) return;

    setResponding(true);
    try {
      // Open Google Maps navigation
      const address = encodeURIComponent(`${incident.address}, ${incident.city}, ${incident.state}`);
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${address}`, '_blank');

      // Record response and notify supes
      console.log('[Respond] Recording response and notifying supes...');
      await recordAlertResponse(
        incident.id,
        profile.uid,
        profile.displayName,
        profile.role,
        incident.address
      );
      console.log('[Respond] [OK] Response recorded successfully!');
    } catch (error) {
      console.error('[Respond] [X] Error recording response:', error);
    } finally {
      setResponding(false);
    }
  };

  if (error) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center h-screen">
          <p className="text-destructive">Error: {error}</p>
        </div>
      </RoleLayout>
    );
  }

  if (!incident) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#6B7280]">Loading incident...</p>
        </div>
      </RoleLayout>
    );
  }

  // Render incident detail UI
  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen bg-white">
        {/* Header with Back Button - Fixed at top */}
        <div className="bg-[#007AFF] text-white p-4 flex items-center justify-between fixed top-0 left-0 right-0 z-20">
          <button onClick={() => window.history.back()} className="text-white">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">NFA Alert Details</h1>
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
              <div 
                className="w-full h-64 bg-gray-100 relative cursor-pointer"
                onClick={handleRespondToAlert}
              >
                {/* Google Maps Embed showing CITY zoom (zoom=12) */}
                <iframe
                  width="100%"
                  height="100%"
                  style={{ border: 0, pointerEvents: 'none' }}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.google.com/maps/embed/v1/place?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || 'AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8'}&q=${encodeURIComponent(incident.address + ', ' + incident.city + ', ' + incident.state)}&zoom=12`}
                  title="Incident Location Map"
                />

                {/* Respond Button - Top Center */}
                <Button
                  size="sm"
                  className="absolute top-2 left-1/2 transform -translate-x-1/2 bg-[#34C759] hover:bg-[#2FB350] text-white px-3 py-1 text-xs z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRespondToAlert();
                  }}
                  disabled={responding}
                >
                  {responding ? 'Responding...' : 'Respond to Alert'}
                </Button>

                {/* Respond Button - Bottom Center */}
                <Button
                  size="sm"
                  className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-[#34C759] hover:bg-[#2FB350] text-white px-3 py-1 text-xs z-10"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRespondToAlert();
                  }}
                  disabled={responding}
                >
                  {responding ? 'Responding...' : 'Respond to Alert'}
                </Button>

                {/* Alert ID - Lower Left Corner (non-clickable) */}
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
                    onClick={() => {
                      console.log(
                        "[Details] Toggling favorite for ID:",
                        id,
                        "incident.id:",
                        incident.id
                      );
                      toggleFavorite(id);
                    }}
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

              {/* Updates Section - Show initial message if no updates */}
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
                      // Only clear after successful save
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

              {/* Files */}
              {files && files.length > 0 && (
                <div className="px-4 py-3">
                  <h3 className="font-semibold text-base mb-3">
                    Files ({files.length})
                  </h3>
                  <div className="space-y-2">
                    {files.map((file) => (
                      <div key={file.id} className="p-3 border rounded">
                        <span className="text-sm">{file.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="homeowner" className="m-0">
              <HomeownerForm
                value={homeownerData}
                onChange={(partial) => setHomeownerData({ ...homeownerData, ...partial })}
                onSave={async () => {
                  console.log("[Homeowner] Saving:", homeownerData);
                  // TODO: Implement save to Firestore
                }}
              />
            </TabsContent>

            <TabsContent value="docs" className="m-0">
              <DocsManager
                files={files || []}
                onPickFile={(file) => {
                  console.log("[Docs] File picked:", file.name);
                  // TODO: Implement file upload
                }}
                onDeleteFile={(fileId) => {
                  console.log("[Docs] Delete file:", fileId);
                  // TODO: Implement file deletion
                }}
                canDelete={true}
              />
            </TabsContent>

            <TabsContent value="sign" className="m-0">
              <ESignManager
                files={files || []}
                onSendForESign={(docIds, email) => {
                  console.log("[ESign] Send for signature:", { docIds, email });
                  // TODO: Implement e-signature sending
                }}
                onLiveSign={(signatureDataUrl) => {
                  console.log("[ESign] Live signature captured");
                  // TODO: Implement live signature save
                }}
              />
            </TabsContent>

            <TabsContent value="chat" className="m-0 h-full flex flex-col">
              <IncidentChat 
                incidentId={id} 
                incidentAddress={incident.address || 'Unknown Address'} 
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </RoleLayout>
  );
}
