import { z } from "zod";

export const donationSchema = z.object({
  email: z.string().email("Invalid email address"),
  amount: z.number().min(1, "Amount must be greater than 0"),
});

export type DonationForm = z.infer<typeof donationSchema>;
