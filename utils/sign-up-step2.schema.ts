import { z } from "zod";

export const signUpStep2Schema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  team: z.string().min(1, "Team is required"),
  department: z.string().min(1, "Department is required"),
  year: z.string().min(1, "Year is required"),
  telegram: z.string(),
});

export type SignUpStep2FormValues = z.infer<typeof signUpStep2Schema>;
