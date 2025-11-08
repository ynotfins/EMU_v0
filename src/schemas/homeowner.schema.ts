import { z } from "zod"

export const homeownerFormSchema = z.object({
  homeownerName: z.string().min(1, "Homeowner name is required"),
  contactPerson: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  propertyAddress: z.string().optional(),
  policyNumber: z.string().optional(),
  carrierName: z.string().optional(),
  claimsPhone: z.string().optional(),
  incidentDate: z.string().optional(),
  damageDescription: z.string().optional(),
  adjusterName: z.string().optional(),
  adjusterPhone: z.string().optional(),
  additionalNotes: z.string().optional(),
})

export type HomeownerFormInput = z.infer<typeof homeownerFormSchema>

