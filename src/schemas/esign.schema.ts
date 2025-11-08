import { z } from "zod"

export const esignRecipientSchema = z.object({
  recipientEmail: z.string().email("Invalid email address"),
})

export type ESignRecipientInput = z.infer<typeof esignRecipientSchema>

