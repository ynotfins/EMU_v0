"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Save } from "lucide-react"
import { noteSchema, type NoteInput } from "@/schemas/notes.schema"

interface NotesEditorProps {
  value: string
  onChange: (value: string) => void
  onSave: () => void
}

export function NotesEditor({ value, onChange, onSave }: NotesEditorProps) {
  const form = useForm<NoteInput>({
    resolver: zodResolver(noteSchema),
    defaultValues: {
      text: value || "",
    },
  })

  const handleSubmit = (values: NoteInput) => {
    onChange(values.text)
    onSave()
    form.reset()
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-3">
        <FormField
          control={form.control}
          name="text"
          render={({ field }) => (
            <FormItem>
              <FormControl>
                <Textarea
                  placeholder="Add your notes here..."
                  className="min-h-32 resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" className="w-full bg-primary hover:bg-primary/90">
          <Save className="h-4 w-4 mr-2" />
          Save Note
        </Button>
      </form>
    </Form>
  )
}
