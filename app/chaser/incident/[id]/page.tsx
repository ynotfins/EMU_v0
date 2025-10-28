"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Heart, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MapCard } from "@/components/map-card"
import { UpdatesList } from "@/components/updates-list"
import { NotesEditor } from "@/components/notes-editor"
import { HomeownerForm } from "@/components/homeowner-form"
import { DocsManager } from "@/components/docs-manager"
import { ESignManager } from "@/components/esign-manager"
import { useIncident } from "@/hooks/use-incident"
import { useFiles } from "@/hooks/use-files"
import { useFavoritesContext } from "@/lib/context/favorites-context"
import { respondToAlert, addNote } from "@/lib/actions/incidents"
import { uploadDoc } from "@/lib/actions/files"
import { sendForESign, liveSign } from "@/lib/actions/esign"
import type { HomeownerForm as HomeownerFormType } from "@/types/domain"

export default function ChaserIncidentPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const { data: incident } = useIncident(params.id)
  const { data: files, upload } = useFiles(params.id)
  const { toggleFavorite } = useFavoritesContext()
  const [noteText, setNoteText] = useState("")
  const [homeownerData, setHomeownerData] = useState<HomeownerFormType>(incident?.homeownerForm || {})
  const [activeTab, setActiveTab] = useState("details")

  if (!incident) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F2F7]">
        <p className="text-[#6B7280]">Incident not found</p>
      </div>
    )
  }

  const handleRespond = async () => {
    await respondToAlert(incident.id)
  }

  const handleToggleFavorite = () => {
    toggleFavorite(incident.id)
  }

  const handleSaveNote = async () => {
    if (noteText.trim()) {
      await addNote(incident.id, noteText)
      setNoteText("")
    }
  }

  const handleSaveHomeowner = async () => {
    console.log("[v0] Save homeowner form:", homeownerData)
  }

  const handleUploadDoc = async (file: File) => {
    await uploadDoc(incident.id, file)
    upload(file)
  }

  const handleSendForESign = async (docIds: string[], recipientEmail: string) => {
    await sendForESign({ incidentId: incident.id, docIds, recipientEmail })
  }

  const handleLiveSign = async (signatureDataUrl: string) => {
    await liveSign(incident.id, signatureDataUrl)
  }

  return (
    <div className="min-h-screen bg-[#F2F2F7] pb-20">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] p-4 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="p-2">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold text-foreground">NFA Alert Details</h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={handleToggleFavorite} className="p-2">
              <Heart
                className={incident.isFavorited ? "h-5 w-5 fill-[#FF3B30] text-[#FF3B30]" : "h-5 w-5 text-[#6B7280]"}
              />
            </Button>
            <Button variant="ghost" size="sm" className="p-2">
              <Share2 className="h-5 w-5 text-[#6B7280]" />
            </Button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full bg-white border-b border-[#E5E7EB] rounded-none h-12">
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

        <TabsContent value="details" className="p-4 space-y-4">
          {/* Map */}
          <MapCard address={incident.address} onOpenMaps={() => console.log("[v0] Open maps")} />

          {/* Respond Button */}
          <Button onClick={handleRespond} className="w-full bg-[#34C759] hover:bg-[#2DA84A] text-white">
            Respond to Alert
          </Button>

          {/* Updates */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Updates</h2>
            <UpdatesList
              rows={[
                {
                  ts: incident.updatedAt,
                  distanceMi: incident.distanceMi,
                  state: incident.state,
                  county: incident.county,
                  city: incident.city,
                  address: incident.address,
                  type: incident.type,
                  message: incident.message,
                  showIncidentId: true,
                  incidentNumber: incident.incidentNumber,
                },
              ]}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">Notes</h2>
            {incident.notes.map((note) => (
              <div key={note.uid} className="bg-white p-3 rounded-lg border border-[#E5E7EB]">
                <p className="text-sm text-foreground">{note.text}</p>
                <p className="text-xs text-[#6B7280] mt-1">{new Date(note.ts).toLocaleString()}</p>
              </div>
            ))}
            <NotesEditor value={noteText} onChange={setNoteText} onSave={handleSaveNote} />
          </div>
        </TabsContent>

        <TabsContent value="homeowner" className="p-4">
          <HomeownerForm
            value={homeownerData}
            onChange={(partial) => setHomeownerData({ ...homeownerData, ...partial })}
            onSave={handleSaveHomeowner}
          />
        </TabsContent>

        <TabsContent value="docs" className="p-4">
          <DocsManager files={files} onPickFile={handleUploadDoc} canDelete={false} />
        </TabsContent>

        <TabsContent value="sign" className="p-4">
          <ESignManager files={files} onSendForESign={handleSendForESign} onLiveSign={handleLiveSign} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
