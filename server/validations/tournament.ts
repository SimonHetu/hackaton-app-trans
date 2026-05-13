import { z } from "zod";

export const tournamentSchema = z.object({
  name: z.string().trim().min(2, "Nom requis").max(80),
  sport: z.string().trim().min(2, "Sport requis").max(50),
  city: z.string().trim().min(2, "Ville requise").max(80),
  startDate: z.coerce.date(),
  entryFee: z.coerce.number().min(0, "Doit être ≥ 0").default(0),
  currency: z.string().length(3).default("CAD"),
});

export type TournamentInput = z.infer<typeof tournamentSchema>;