import { z } from "zod";
import { idSchema } from "@/server/validations/common";

export const teamsSearchParamsSchema = z.object({
  city: z.string().trim().max(80).optional(),
  sport: z.string().trim().max(50).optional(),
  available: z.enum(["true"]).optional(),
});

export const matchesSearchParamsSchema = z.object({
  filter: z.enum(["all", "past", "upcoming"]).optional(),
});

export const cartSearchParamsSchema = z.object({
  status: z.enum(["added", "empty"]).optional(),
});

export const teamDetailsSearchParamsSchema = z.object({
  status: z.enum(["already-member", "accepted", "requested"]).optional(),
});

export const paymentSuccessSearchParamsSchema = z.object({
  session_id: idSchema.optional(),
});

export const paymentCancelSearchParamsSchema = z.object({
  teamId: idSchema.optional(),
});

export const idRouteParamsSchema = z.object({
  id: idSchema,
});
