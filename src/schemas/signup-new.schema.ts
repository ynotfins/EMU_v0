import { z } from "zod"

export const signupNewSchema = z.object({
  nickname: z.string().min(1, "Nickname is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().regex(/^\(\d{3}\) \d{3}-\d{4}$/, "Invalid phone number format (e.g., (555) 123-4567)"),
})

export type SignupNewInput = z.infer<typeof signupNewSchema>

