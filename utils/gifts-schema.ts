import { z } from "zod";

export const donationSchema = z.object({
  amount: z.number().min(1, "Amount must be at least 1 ETB"),
});

export type DonationForm = z.infer<typeof donationSchema>;
