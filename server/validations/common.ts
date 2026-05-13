import { z } from "zod";

export const idSchema = z.string().trim().min(1, "ID requis");

export const idListSchema = z.array(idSchema).min(1, "Au moins un ID est requis");

export const optionalMessageSchema = z.string().trim().max(500).optional();
