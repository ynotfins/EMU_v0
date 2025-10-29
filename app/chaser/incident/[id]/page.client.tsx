"use client";

import { useIncident, addNote } from "@/hooks/use-incident";
import { useFiles } from "@/hooks/use-files";
import { toggleFavorite, toggleBookmark } from "@/hooks/use-incidents";
import { useState } from "react";
import { RoleLayout } from "@/components/role-layout";
import { MapCard } from "@/components/map-card";
import { HomeownerForm } from "@/components/homeowner-form";
import { DocsManager } from "@/components/docs-manager";
import { ESignManager } from "@/components/esign-manager";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";
import type { HomeownerForm as HomeownerFormType } from "@/types/domain";

export default function Client({ id }: { id: string }) {
  const { data: incident, updates, error } = useIncident(id);
  const { data: files } = useFiles(id);
  const [noteText, setNoteText] = useState("");
  const [homeownerData, setHomeownerData] = useState<HomeownerFormType>({});

  if (error) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-600">Error: {error}</p>
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
        {/* Header with Back Button */}
        <div className="bg-[#007AFF] text-white p-4 flex items-center justify-between">
          <button onClick={() => window.history.back()} className="text-white">
            ← Back
          </button>
          <h1 className="text-lg font-semibold">NFA Alert Details</h1>
          <button className="text-white">⋮</button>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="details" className="flex-1 flex flex-col">
          <TabsList className="w-full justify-start rounded-none border-b bg-white">
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
              Sign
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-y-auto">
            <TabsContent value="details" className="m-0 h-full">
              {/* Map */}
              <div className="w-full h-64 bg-gray-100">
                <MapCard
                  address={`${incident.address}, ${incident.city}, ${incident.state}`}
                  lat={null}
                  lng={null}
                />
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
                          ? "fill-red-500 text-red-500"
                          : "text-gray-400 hover:text-red-400"
                      }`}
                    />
                  </button>
                </div>
                <p className="font-semibold text-lg mb-1">{incident.address}</p>
                <p className="text-gray-600 text-sm">
                  {incident.state}, {incident.county}, {incident.city}
                </p>
                <p className="text-gray-500 text-xs mt-2">
                  Alert ID: #NFA-{incident.incidentNumber}
                </p>
              </div>

              {/* Respond Button */}
              <div className="px-4 py-3">
                <Button className="w-full bg-[#FF3B30] hover:bg-[#FF2D1F] text-white h-12 text-base font-semibold">
                  ⚡ Respond to Alert
                </Button>
              </div>

              {/* Updates Section - Show initial message if no updates */}
              {updates && updates.length > 0 ? (
                <div className="px-4 py-3 border-t">
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
                            {update.stage === 'new' ? '🆕 Initial Alert' : '📝 Update'} #{updates.length - idx}
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
                            📍 {update.address}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="px-4 py-3 border-t">
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
              <div className="px-4 py-3 border-t">
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
                <div className="px-4 py-3 border-t">
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
          </div>
        </Tabs>
      </div>
    </RoleLayout>
  );
}
