"use client"

import { useState } from "react"
import { Send, PenTool, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { FileMeta } from "@/types/domain"

interface ESignManagerProps {
  files: FileMeta[]
  onSendForESign: (docIds: string[], recipientEmail: string) => void
  onLiveSign: (signatureDataUrl: string) => void
}

const mockSignatureHistory = [
  {
    id: "sig-1",
    documentName: "Damage Assessment Form.pdf",
    recipient: "john.doe@email.com",
    status: "completed" as const,
    sentAt: "2024-01-15T10:30:00Z",
    completedAt: "2024-01-15T14:20:00Z",
  },
  {
    id: "sig-2",
    documentName: "Authorization Form.pdf",
    recipient: "jane.smith@email.com",
    status: "pending" as const,
    sentAt: "2024-01-16T09:15:00Z",
  },
  {
    id: "sig-3",
    documentName: "Release Form.pdf",
    recipient: "bob.wilson@email.com",
    status: "declined" as const,
    sentAt: "2024-01-14T16:45:00Z",
  },
]

export function ESignManager({ files, onSendForESign, onLiveSign }: ESignManagerProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [recipientEmail, setRecipientEmail] = useState("")
  const [showSignModal, setShowSignModal] = useState(false)

  const toggleDoc = (docId: string) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(selectedDocs.filter((id) => id !== docId))
    } else {
      setSelectedDocs([...selectedDocs, docId])
    }
  }

  const handleSendForESign = () => {
    if (selectedDocs.length > 0 && recipientEmail) {
      onSendForESign(selectedDocs, recipientEmail)
      setSelectedDocs([])
      setRecipientEmail("")
    }
  }

  const handleLiveSign = () => {
    // Stub: would capture canvas signature
    const mockSignature = "data:image/png;base64,..."
    onLiveSign(mockSignature)
    setShowSignModal(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-[#34C759]" />
      case "pending":
        return <Clock className="h-4 w-4 text-[#FF9500]" />
      case "declined":
        return <XCircle className="h-4 w-4 text-[#FF3B30]" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-[#34C759]/10 text-[#34C759] border-[#34C759]/20",
      pending: "bg-[#FF9500]/10 text-[#FF9500] border-[#FF9500]/20",
      declined: "bg-[#FF3B30]/10 text-[#FF3B30] border-[#FF3B30]/20",
    }
    return (
      <Badge variant="outline" className={variants[status as keyof typeof variants]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Document Selection */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Select Documents to Sign</h3>
        {files.length === 0 ? (
          <p className="text-sm text-[#6B7280] text-center py-8">No documents available for signing</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 border border-[#E5E7EB] rounded-lg">
              <Checkbox checked={selectedDocs.includes(file.id)} onCheckedChange={() => toggleDoc(file.id)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-[#6B7280]">
                  Uploaded by {file.uploadedBy.name} ({file.uploadedBy.role})
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recipient Email */}
      <div className="space-y-2">
        <label htmlFor="recipient-email" className="text-sm font-medium text-foreground">
          Recipient Email
        </label>
        <Input
          id="recipient-email"
          type="email"
          placeholder="homeowner@example.com"
          value={recipientEmail}
          onChange={(e) => setRecipientEmail(e.target.value)}
        />
      </div>

      {/* Actions */}
      <div className="space-y-2">
        <Button
          onClick={handleSendForESign}
          disabled={selectedDocs.length === 0 || !recipientEmail}
          className="w-full bg-[#007AFF] hover:bg-[#0051D5]"
        >
          <Send className="h-4 w-4 mr-2" />
          Send for E-Sign
        </Button>

        <Button onClick={() => setShowSignModal(true)} variant="outline" className="w-full">
          <PenTool className="h-4 w-4 mr-2" />
          Sign Live
        </Button>
      </div>

      <div className="space-y-3 pt-4 border-t border-[#E5E7EB]">
        <h3 className="text-base font-semibold text-foreground">Signature History</h3>
        {mockSignatureHistory.length === 0 ? (
          <p className="text-sm text-[#6B7280] text-center py-8">No signature requests yet</p>
        ) : (
          <div className="space-y-3">
            {mockSignatureHistory.map((sig) => (
              <div key={sig.id} className="p-3 border border-[#E5E7EB] rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{sig.documentName}</p>
                    <p className="text-xs text-[#6B7280]">To: {sig.recipient}</p>
                  </div>
                  {getStatusIcon(sig.status)}
                </div>
                <div className="flex items-center justify-between">
                  {getStatusBadge(sig.status)}
                  <p className="text-xs text-[#6B7280]">Sent {new Date(sig.sentAt).toLocaleDateString()}</p>
                </div>
                {sig.completedAt && (
                  <p className="text-xs text-[#34C759]">Completed {new Date(sig.completedAt).toLocaleDateString()}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Signature Modal */}
      <Dialog open={showSignModal} onOpenChange={setShowSignModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Live Signature</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="h-48 border-2 border-dashed border-[#E5E7EB] rounded-lg flex items-center justify-center bg-[#F2F2F7]">
              <p className="text-sm text-[#6B7280]">Signature canvas placeholder</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSignModal(false)} className="flex-1">
                Clear
              </Button>
              <Button onClick={handleLiveSign} className="flex-1 bg-[#007AFF] hover:bg-[#0051D5]">
                Save Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
