"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Send, PenTool, CheckCircle2, Clock, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import type { FileMeta } from "@/types/extended-domain"
import { esignRecipientSchema, type ESignRecipientInput } from "@/schemas/esign.schema"

interface ESignManagerProps {
  incidentId?: string
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
]

export function ESignManager({ files, onSendForESign, onLiveSign }: ESignManagerProps) {
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [showSignModal, setShowSignModal] = useState(false)

  const form = useForm<ESignRecipientInput>({
    resolver: zodResolver(esignRecipientSchema),
    defaultValues: {
      recipientEmail: "",
    },
  })

  const toggleDoc = (docId: string) => {
    if (selectedDocs.includes(docId)) {
      setSelectedDocs(selectedDocs.filter((id) => id !== docId))
    } else {
      setSelectedDocs([...selectedDocs, docId])
    }
  }

  const handleSendForESign = (values: ESignRecipientInput) => {
    if (selectedDocs.length > 0) {
      onSendForESign(selectedDocs, values.recipientEmail)
      setSelectedDocs([])
      form.reset()
    }
  }

  const handleLiveSign = () => {
    const mockSignature = "data:image/png;base64,..."
    onLiveSign(mockSignature)
    setShowSignModal(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle2 className="h-4 w-4 text-emerald-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-amber-500" />
      case "declined":
        return <XCircle className="h-4 w-4 text-destructive" />
      default:
        return null
    }
  }

  const getStatusBadge = (status: string) => {
    const badgeConfig = {
      completed: {
        variant: "outline" as const,
        className: "border-emerald-500 text-emerald-500 bg-emerald-500/10",
      },
      pending: {
        variant: "outline" as const,
        className: "border-amber-500 text-amber-500 bg-amber-500/10",
      },
      declined: {
        variant: "destructive" as const,
        className: "",
      },
    }
    const config = badgeConfig[status as keyof typeof badgeConfig]
    if (!config) return null
    return (
      <Badge variant={config.variant} className={config.className}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    )
  }

  return (
    <div className="space-y-6 pb-6 px-4">
      {/* Document Selection */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold text-foreground">Select Documents to Sign</h3>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No documents available for signing</p>
        ) : (
          files.map((file) => (
            <div key={file.id} className="flex items-center gap-3 p-3 border border-border rounded-lg">
              <Checkbox checked={selectedDocs.includes(file.id)} onCheckedChange={() => toggleDoc(file.id)} />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  Uploaded by {file.uploadedBy} {file.role && `(${file.role})`}
                </p>
              </div>
            </div>
          ))
        )}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSendForESign)} className="space-y-4">
          <FormField
            control={form.control}
            name="recipientEmail"
            render={({ field }) => (
              <FormItem className="space-y-2">
                <FormLabel className="text-sm font-medium text-foreground">
                  Recipient Email
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="homeowner@example.com"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-2">
            <Button
              type="submit"
              disabled={selectedDocs.length === 0}
              className="w-full bg-primary hover:bg-primary/90"
            >
              <Send className="h-4 w-4 mr-2" />
              Send for E-Sign
            </Button>
          </div>
        </form>
      </Form>

      <div className="space-y-2">

        <Button onClick={() => setShowSignModal(true)} variant="outline" className="w-full">
          <PenTool className="h-4 w-4 mr-2" />
          Sign Live
        </Button>
      </div>

      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-base font-semibold text-foreground">Signature History</h3>
        {mockSignatureHistory.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No signature requests yet</p>
        ) : (
          <div className="space-y-3">
            {mockSignatureHistory.map((sig) => (
              <div key={sig.id} className="p-3 border border-border rounded-lg space-y-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-foreground">{sig.documentName}</p>
                    <p className="text-xs text-muted-foreground">To: {sig.recipient}</p>
                  </div>
                  {getStatusIcon(sig.status)}
                </div>
                <div className="flex items-center justify-between">
                  {getStatusBadge(sig.status)}
                  <p className="text-xs text-muted-foreground">Sent {new Date(sig.sentAt).toLocaleDateString()}</p>
                </div>
                {sig.completedAt && (
                  <p className="text-xs text-emerald-500">Completed {new Date(sig.completedAt).toLocaleDateString()}</p>
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
            <div className="h-48 border-2 border-dashed border-border rounded-lg flex items-center justify-center bg-muted">
              <p className="text-sm text-muted-foreground">Signature canvas placeholder</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowSignModal(false)} className="flex-1">
                Clear
              </Button>
              <Button onClick={handleLiveSign} className="flex-1 bg-primary hover:bg-primary/90">
                Save Signature
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
