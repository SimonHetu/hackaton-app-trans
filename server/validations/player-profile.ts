import { z } from "zod";

export const playerProfileSchema = z.object({
  city: z.string().trim().min(2, "La ville est requise.").max(80),
  favoriteSport: z.string().trim().min(2, "Le sport favori est requis.").max(80),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]).default("BEGINNER"),
  position: z
    .preprocess((value) => (value === null ? undefined : value), z.string().trim().max(80).optional())
    .transform((value) => value || null),
});

export type PlayerProfileInput = {
  city: string;
  favoriteSport: string;
  level?: "BEGINNER" | "INTERMEDIATE" | "ADVANCED";
  position?: string | null;
};
