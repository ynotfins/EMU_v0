import { z } from "zod"

export const noteSchema = z.object({
  text: z.string().min(1, "Note cannot be empty"),
})

export type NoteInput = z.infer<typeof noteSchema>

