import { z } from "zod"

export const paymentInfoSchema = z.object({
  cashapp: z.string().optional(),
  venmo: z.string().optional(),
})

export type PaymentInfoInput = z.infer<typeof paymentInfoSchema>

