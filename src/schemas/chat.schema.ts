import { z } from "zod"

export const chatMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty").max(1000, "Message too long"),
})

export type ChatMessageInput = z.infer<typeof chatMessageSchema>

