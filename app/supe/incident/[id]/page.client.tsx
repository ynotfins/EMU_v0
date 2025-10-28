"use client"

import { useIncident } from "@/hooks/use-incident"
import { useFiles } from "@/hooks/use-files"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { useState } from "react"
import { RoleLayout } from "@/components/role-layout"

export default function SupeIncidentClient({ id }: { id: string }) {
  const { data: incident } = useIncident(id)
  const { data: files } = useFiles(id)
  const { toggleFavorite, toggleBookmark } = useFavoritesContext()
  const [noteText, setNoteText] = useState("")

  if (!incident) {
    return (
      <RoleLayout role="supe">
        <div className="flex items-center justify-center h-screen">
          <p className="text-[#6B7280]">Loading incident...</p>
        </div>
      </RoleLayout>
    )
  }

  // Render supe detail UI
  return (
    <RoleLayout role="supe">
      <div className="flex flex-col h-screen">
        <div className="bg-white border-b border-[#E5E7EB] p-4">
          <h1 className="text-2xl font-bold text-foreground">
            Incident #{incident.incidentNumber}
          </h1>
          <p className="text-sm text-[#6B7280]">{incident.address}</p>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="bg-white rounded-lg p-4 shadow-sm">
            <h2 className="font-semibold mb-2">Details</h2>
            <div className="space-y-2 text-sm">
              <p><span className="font-medium">Type:</span> {incident.type}</p>
              <p><span className="font-medium">Location:</span> {incident.city}, {incident.county}, {incident.state}</p>
              <p><span className="font-medium">Message:</span> {incident.message}</p>
              <p><span className="font-medium">Updated:</span> {new Date(incident.updatedAt).toLocaleString()}</p>
            </div>
          </div>

          {files && files.length > 0 && (
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h2 className="font-semibold mb-2">Files ({files.length})</h2>
              <div className="space-y-2">
                {files.map((file) => (
                  <div key={file.id} className="flex items-center gap-2 text-sm">
                    <span>{file.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </RoleLayout>
  )
}

