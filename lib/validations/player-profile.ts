import { z } from "zod";

export const playerProfileSchema = z.object({
  fullName: z.string().min(2, "Minimum 2 caractères").max(100),
  city: z.string().min(2, "Minimum 2 caractères").max(100),
  favoriteSport: z.string().min(2, "Sport requis"),
  level: z.enum(["BEGINNER", "INTERMEDIATE", "ADVANCED"]),
  position: z.string().max(50).optional().or(z.literal("")),
});

export type PlayerProfileInput = z.infer<typeof playerProfileSchema>;