"use client"

import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Save } from "lucide-react"

interface NotesEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
}

export function NotesEditor({ value, onChange, onSave }: NotesEditorProps) {
  return (
    <div className="space-y-3">
      <Textarea
        placeholder="Add your notes here..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="min-h-32 resize-none"
      />
      <Button onClick={onSave} className="w-full bg-[#007AFF] hover:bg-[#0051D5]">
        <Save className="h-4 w-4 mr-2" />
        Save Note
      </Button>
    </div>
  )
}
