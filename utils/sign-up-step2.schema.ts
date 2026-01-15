import { z } from "zod";

export const signUpStep2Schema = z.object({
  team: z.string().min(1, "Team is required"),
  department: z.string().min(1, "Department is required"),
  year: z.string().min(1, "Year is required"),
  telegram: z
    .string()
    .transform((val) => val.trim())
    .refine(
      (val) => val === "" || /^@?[a-zA-Z0-9_]{3,32}$/.test(val),
      "Enter a valid Telegram handle"
    ),
});

export type SignUpStep2FormValues = z.infer<typeof signUpStep2Schema>;
