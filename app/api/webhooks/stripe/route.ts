import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe";
import { completePaidJoinRequests } from "@/server/services/join-requests";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    return Response.json({ error: "Stripe webhook secret is not configured." }, { status: 500 });
  }

  const body = await req.text();
  const headersList = await headers();
  const signature = headersList.get("stripe-signature");

  if (!signature) {
    return Response.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  let event;

  try {
    event = getStripe().webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return Response.json({ error: "Invalid Stripe webhook signature." }, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const joinRequestIds = session.metadata?.joinRequestIds
      ? (JSON.parse(session.metadata.joinRequestIds) as string[])
      : session.metadata?.joinRequestId
        ? [session.metadata.joinRequestId]
        : [];

    if (joinRequestIds.length > 0 && session.payment_status === "paid") {
      const { teamIds } = await completePaidJoinRequests(joinRequestIds, session.id);

      revalidatePath("/cart");
      revalidatePath("/teams");
      for (const teamId of teamIds) {
        revalidatePath(`/teams/${teamId}`);
      }
    }
  }

  return Response.json({ received: true });
}
