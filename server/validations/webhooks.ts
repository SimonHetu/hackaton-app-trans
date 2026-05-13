import { z } from "zod";
import { idListSchema, idSchema } from "@/server/validations/common";

export const stripeSessionMetadataSchema = z
  .object({
    joinRequestIds: z
      .string()
      .optional()
      .transform((value, ctx) => {
        if (!value) return undefined;

        try {
          return idListSchema.parse(JSON.parse(value));
        } catch {
          ctx.addIssue({
            code: "custom",
            message: "Invalid joinRequestIds metadata",
          });
          return z.NEVER;
        }
      }),
    joinRequestId: idSchema.optional(),
  })
  .passthrough()
  .transform((metadata) => metadata.joinRequestIds ?? (metadata.joinRequestId ? [metadata.joinRequestId] : []));

export const clerkWebhookEventSchema = z.object({
  type: z.string(),
  data: z.object({
    id: idSchema,
    email_addresses: z
      .array(z.object({ email_address: z.string().email() }))
      .optional(),
    first_name: z.string().nullable().optional(),
    last_name: z.string().nullable().optional(),
  }),
});

export type ClerkWebhookEvent = z.infer<typeof clerkWebhookEventSchema>;
