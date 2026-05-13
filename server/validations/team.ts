import { z } from "zod";

export const teamSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(50),
  tournamentId: z.string().min(1),
  maxCapacity: z.coerce.number().int().min(2, "Min 2").max(50, "Max 50").default(15),
});

export type TeamInput = z.infer<typeof teamSchema>;