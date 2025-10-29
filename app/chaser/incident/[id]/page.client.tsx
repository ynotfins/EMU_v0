"use client"

import { useIncident, addNote } from "@/hooks/use-incident"
import { useFiles } from "@/hooks/use-files"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { useState } from "react"
import { RoleLayout } from "@/components/role-layout"
import { MapCard } from "@/components/map-card"
import { NotesEditor } from "@/components/notes-editor"
import { UpdatesList } from "@/components/updates-list"
import { Badge } from "@/components/ui/badge"

export default function Client({ id }: { id: string }) {
  const { data: incident, updates, error } = useIncident(id)
  const { data: files } = useFiles(id)
  const { toggleFavorite, toggleBookmark } = useFavoritesContext()
  const [noteText, setNoteText] = useState("")

  if (error) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center h-screen">
          <p className="text-red-600">Error: {error}</p>
        </div>
      </RoleLayout>
    )
  }

  if (!incident) {
    return (
      <RoleLayout role="chaser">
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#6B7280]">Loading incident...</p>
        </div>
      </RoleLayout>
    )
  }

  // Render incident detail UI
  return (
    <RoleLayout role="chaser">
      <div className="flex flex-col h-screen">
        {/* Header */}
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge className="bg-[#007AFF]">NFA-{incident.incidentNumber}</Badge>
            {incident.highAlert && (
              <Badge variant="outline" className="text-[#FF3B30] border-[#FF3B30]">
                HIGH ALERT
              </Badge>
            )}
          </div>
          <h1 className="text-lg font-bold">{incident.address}</h1>
        </div>

        <div className="flex-1 overflow-y-auto">
          {/* Map */}
          <div className="w-full h-64">
            <MapCard 
              address={`${incident.address}, ${incident.city}, ${incident.state}`}
              lat={null}
              lng={null}
            />
          </div>

          <div className="p-4 space-y-4">
            {/* Details */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-3 text-lg">Details</h2>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Type:</span> {incident.type}</p>
                <p><span className="font-medium">Location:</span> {incident.city}, {incident.county}, {incident.state}</p>
                <p><span className="font-medium">Message:</span> {incident.message}</p>
                <p><span className="font-medium">Updated:</span> {new Date(incident.updatedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Updates */}
            {incident.updates && incident.updates.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="font-semibold mb-3 text-lg">Updates ({incident.updates.length})</h2>
                <UpdatesList updates={incident.updates} />
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-3 text-lg">Notes</h2>
              <NotesEditor
                notes={incident.notes || []}
                onAddNote={(text) => {
                  addNote(incident.id, text)
                  setNoteText("")
                }}
              />
            </div>

            {/* Files */}
            {files && files.length > 0 && (
              <div className="bg-white rounded-lg p-4 shadow-sm">
                <h2 className="font-semibold mb-3 text-lg">Files ({files.length})</h2>
                <div className="space-y-2">
                  {files.map((file) => (
                    <div key={file.id} className="flex items-center gap-2 text-sm p-2 border rounded">
                      <span>{file.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </RoleLayout>
  )
}

