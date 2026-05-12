import { verifyWebhook } from "@clerk/nextjs/webhooks";
import type { UserJSON } from "@clerk/nextjs/server";
import type { NextRequest } from "next/server";
import { prisma } from "@/prisma/lib/prisma";

export const runtime = "nodejs";

function getPrimaryEmail(user: UserJSON) {
  const primaryEmail = user.email_addresses.find(
    (email) => email.id === user.primary_email_address_id,
  );

  return primaryEmail?.email_address ?? user.email_addresses[0]?.email_address;
}

function getFullName(user: UserJSON, email: string) {
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ").trim();

  return fullName || user.username || email;
}

export async function POST(req: NextRequest) {
  const signingSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!signingSecret) {
    return Response.json({ error: "Clerk webhook secret is not configured." }, { status: 500 });
  }

  let event;

  try {
    event = await verifyWebhook(req, { signingSecret });
  } catch {
    return Response.json({ error: "Invalid Clerk webhook signature." }, { status: 400 });
  }

  if (event.type === "user.created" || event.type === "user.updated") {
    const user = event.data;
    const email = getPrimaryEmail(user);

    if (!email) {
      return Response.json({ error: "Clerk user has no email address." }, { status: 400 });
    }

    await prisma.user.upsert({
      where: { clerkId: user.id },
      create: {
        clerkId: user.id,
        email,
        fullName: getFullName(user, email),
      },
      update: {
        email,
        fullName: getFullName(user, email),
      },
    });
  }

  return Response.json({ received: true });
}
