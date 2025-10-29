"use client";

import { useIncident, addNote } from "@/hooks/use-incident";
import { useFiles } from "@/hooks/use-files";
import { useFavoritesContext } from "@/lib/context/favorites-context";
import { useState } from "react";
import { RoleLayout } from "@/components/role-layout";
import { MapCard } from "@/components/map-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from "lucide-react";

export default function Client({ id }: { id: string }) {
  const { data: incident, updates, error } = useIncident(id);
  const { data: files } = useFiles(id);
  const { toggleFavorite, toggleBookmark } = useFavoritesContext();
  const [noteText, setNoteText] = useState("");

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
                  <Heart className="h-6 w-6 text-gray-400" />
                </div>
                <p className="font-semibold text-lg mb-1">{incident.address}</p>
                <p className="text-gray-600 text-sm">
                  {incident.city}, {incident.county}, {incident.state}
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

              {/* Updates Section */}
              {incident.updates && incident.updates.length > 0 && (
                <div className="px-4 py-3 border-t">
                  <h3 className="font-semibold text-base mb-3">
                    Updates ({incident.updates.length})
                  </h3>
                  <div className="space-y-3">
                    {incident.updates.map((update, index) => (
                      <div key={index} className="text-sm">
                        <p className="text-xs text-gray-500 mb-1">
                          {new Date(update.ts).toLocaleString()}
                        </p>
                        <p className="text-gray-800">{update.message}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Employee Notes */}
              <div className="px-4 py-3 border-t">
                <h3 className="font-semibold text-base mb-3">Employee Notes</h3>
                <Textarea
                  placeholder="Add your notes about this alert..."
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  className="min-h-32 mb-3"
                />
                <Button
                  onClick={() => {
                    if (noteText.trim()) {
                      addNote(incident.id, noteText);
                      setNoteText("");
                    }
                  }}
                  className="w-full bg-[#007AFF] hover:bg-[#0051D5] h-12 text-base font-semibold"
                >
                  Save Notes
                </Button>

                {/* Display existing notes */}
                {incident.notes && incident.notes.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {incident.notes.map((note: any, index: number) => (
                      <div key={index} className="p-3 bg-gray-50 rounded">
                        <p className="text-xs text-gray-500 mb-1">
                          {note.uid} - {new Date(note.ts).toLocaleString()}
                        </p>
                        <p className="text-sm">{note.text}</p>
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

            <TabsContent value="homeowner" className="p-4">
              <p className="text-gray-500">
                Homeowner information will be displayed here
              </p>
            </TabsContent>

            <TabsContent value="docs" className="p-4">
              <p className="text-gray-500">Documents will be displayed here</p>
            </TabsContent>

            <TabsContent value="sign" className="p-4">
              <p className="text-gray-500">
                E-signature interface will be displayed here
              </p>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </RoleLayout>
  );
}
