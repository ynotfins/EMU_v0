"use client"

import type React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Camera, Upload, FileText, ImageIcon, Trash2 } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormField, FormItem } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import type { FileMeta } from "@/types/extended-domain"
import { docsMessageSchema, type DocsMessageInput } from "@/schemas/docs.schema"

interface DocsManagerProps {
  incidentId?: string
  files: FileMeta[]
  onPickFile: (file: File) => void
  onDeleteFile?: (fileId: string) => void
  canDelete: boolean
}

export function DocsManager({ files, onPickFile, onDeleteFile, canDelete }: DocsManagerProps) {
  const form = useForm<DocsMessageInput>({
    resolver: zodResolver(docsMessageSchema),
    defaultValues: {
      message: "",
    },
  })

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      onPickFile(file)
      form.reset()
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
    <div className="space-y-4 px-4 pb-6">
      {/* Upload Tiles */}
      <div className="grid grid-cols-2 gap-3">
        <label htmlFor="camera-input">
          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-muted">
            <div className="flex flex-col items-center gap-2 text-center">
              <Camera className="h-8 w-8 text-primary" />
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
          <Card className="p-6 cursor-pointer hover:shadow-md transition-shadow bg-muted">
            <div className="flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-primary" />
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

      <Form {...form}>
        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormControl>
                <Textarea
                  placeholder="Add a message with your upload (optional)"
                  className="resize-none"
                  rows={3}
                  {...field}
                />
              </FormControl>
              <div className="text-xs text-muted-foreground text-right">
                {field.value?.length || 0}/500
              </div>
            </FormItem>
          )}
        />
      </Form>

      {/* Files List */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-foreground">Uploaded Files</h3>
        {files.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">No files uploaded yet</p>
        ) : (
          files.map((file) => (
            <Card key={file.id} className="p-4">
              <div className="flex items-start gap-3">
                <div className="h-12 w-12 bg-muted rounded-lg flex items-center justify-center shrink-0">
                  {file.kind === "pdf" ? (
                    <FileText className="h-6 w-6 text-destructive" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1 space-y-1">
                  <p className="text-sm font-medium text-foreground">{file.name}</p>
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge variant="outline" className="text-xs">
                      {file.uploadedBy}
                    </Badge>
                    {file.role && (
                      <Badge variant="outline" className="text-xs capitalize">
                        {file.role}
                      </Badge>
                    )}
                    {file.ts && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(typeof file.ts === 'string' ? file.ts : file.ts.toISOString())}
                      </span>
                    )}
                  </div>
                  {file.message && <p className="text-xs text-muted-foreground mt-1">{file.message}</p>}
                </div>
                {canDelete && onDeleteFile && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onDeleteFile(file.id)}
                    className="text-destructive hover:text-destructive hover:bg-destructive/10"
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
