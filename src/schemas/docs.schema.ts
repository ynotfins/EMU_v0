import { z } from "zod"

export const docsMessageSchema = z.object({
  message: z.string().max(500, "Message must be 500 characters or less").optional(),
})

export type DocsMessageInput = z.infer<typeof docsMessageSchema>

