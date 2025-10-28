"use client"

import type React from "react"

import { useState } from "react"
import { Camera, Upload, FileText, ImageIcon, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import type { FileMeta } from "@/types/domain"

interface DocsManagerProps {
  files: FileMeta[]
  onPickFile: (file: File) => void
  onDeleteFile?: (fileId: string) => void
  canDelete: boolean
}

export function DocsManager({ files, onPickFile, onDeleteFile, canDelete }: DocsManagerProps) {
  const [message, setMessage] = useState("")

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onPickFile(file)
      setMessage("")
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    })
  }

  return (
    <div className="space-y-4">
      {/* Upload Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <label htmlFor="camera-input">
          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-[#F2F2F7]">
            <div className="flex flex-col items-center gap-2 text-center">
              <Camera className="h-8 w-8 text-[#007AFF]" />
              <span className="text-sm font-medium text-foreground">Take Photo</span>
            </div>
          </Card>
          <input
            id="camera-input"
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>

        <label htmlFor="file-input">
          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-[#F2F2F7]">
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-[#007AFF]" />
              <span className="text-sm font-medium text-foreground">Upload Document</span>
            </div>
          </Card>
          <input
            id="file-input"
            type="file"
            accept="image/*,application/pdf"
            onChange={handleFileInput}
            className="hidden"
          />
        </label>
      </div>

      {/* Message Box */}
      <div className="space-y-2">
        <Textarea
          placeholder="Add a message with your upload (optional)"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="resize-none"
          rows={3}
        />
        <div className="text-xs text-[#6B7280] text-right">{message.length}/500</div>
      </div>

      {/* Files List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
        {files.length === 0 ? (
          <p className="text-sm text-[#6B7280] text-center py-8">No files uploaded yet</p>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 bg-[#F2F2F7] rounded-lg flex items-center justify-center flex-shrink-0">
                  {file.kind === "pdf" ? (
                    <FileText className="h-6 w-6 text-[#FF3B30]" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-[#007AFF]" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {file.uploadedBy.name}
                    </Badge>
                    <Badge variant="outline" className="text-xs capitalize">
                      {file.uploadedBy.role}
                    </Badge>
                    <span className="text-xs text-[#6B7280]">{formatTime(file.ts)}</span>
                  </div>
                  {file.message && <p className="text-xs text-[#6B7280] mt-1">{file.message}</p>}
                </div>
                {canDelete && onDeleteFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteFile(file.id)}
                    className="text-[#FF3B30] hover:text-[#FF3B30] hover:bg-[#FF3B30]/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
