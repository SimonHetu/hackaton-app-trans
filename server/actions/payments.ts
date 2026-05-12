"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getAppUrl, getStripe } from "@/lib/stripe";

const checkoutSchema = z.object({
  teamId: z.string().min(1, "Team id is required."),
});

const cartItemSchema = z.object({
  joinRequestId: z.string().min(1, "Cart item id is required."),
});

function formDataToCheckoutInput(formData: FormData) {
  return {
    teamId: formData.get("teamId"),
  };
}

function formDataToCartItemInput(formData: FormData) {
  return {
    joinRequestId: formData.get("joinRequestId"),
  };
}

export async function addTeamToCart(input: z.infer<typeof checkoutSchema> | FormData) {
  const user = await requireAuth();
  const { teamId } = checkoutSchema.parse(input instanceof FormData ? formDataToCheckoutInput(input) : input);

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      tournament: true,
      members: { where: { id: user.id }, select: { id: true } },
      _count: { select: { members: true } },
    },
  });

  if (!team) {
    throw new Error("Team not found.");
  }

  if (team.members.length > 0) {
    redirect(`/teams/${team.id}?status=already-member`);
  }

  if (team._count.members >= team.maxCapacity) {
    throw new Error("Team is full.");
  }

  const existingRequest = await prisma.joinRequest.findUnique({
    where: { playerId_teamId: { playerId: user.id, teamId: team.id } },
  });

  if (existingRequest?.status === "ACCEPTED") {
    redirect(`/teams/${team.id}?status=accepted`);
  }

  const requiresPayment = team.tournament.entryFee > 0;

  if (!requiresPayment) {
    await prisma.joinRequest.upsert({
      where: { playerId_teamId: { playerId: user.id, teamId: team.id } },
      create: {
        playerId: user.id,
        teamId: team.id,
        status: "PENDING",
        paymentStatus: "NOT_REQUIRED",
      },
      update: {
        status: "PENDING",
        paymentStatus: "NOT_REQUIRED",
        stripeSessionId: null,
        paidAt: null,
      },
    });

    revalidatePath("/teams");
    revalidatePath(`/teams/${team.id}`);
    redirect(`/teams/${team.id}?status=requested`);
  }

  await prisma.joinRequest.upsert({
    where: { playerId_teamId: { playerId: user.id, teamId: team.id } },
    create: {
      playerId: user.id,
      teamId: team.id,
      status: "PENDING",
      paymentStatus: "PENDING",
    },
    update: {
      status: "PENDING",
      paymentStatus: "PENDING",
      paidAt: null,
      stripeSessionId: null,
    },
  });

  revalidatePath("/cart");
  revalidatePath("/teams");
  revalidatePath(`/teams/${team.id}`);
  redirect(`/cart?status=added`);
}

export async function createCartCheckoutSession() {
  const user = await requireAuth();

  const cartItems = await prisma.joinRequest.findMany({
    where: {
      playerId: user.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      paidAt: null,
    },
    include: {
      team: {
        include: {
          tournament: true,
          members: { select: { id: true } },
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const payableItems = cartItems.filter(
    (item) => item.team.tournament.entryFee > 0 && item.team._count.members < item.team.maxCapacity,
  );

  if (payableItems.length === 0) {
    redirect("/cart?status=empty");
  }

  const appUrl = getAppUrl();
  const stripe = getStripe();
  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: user.email,
    line_items: payableItems.map((item) => ({
        quantity: 1,
        price_data: {
          currency: item.team.tournament.currency.toLowerCase(),
          unit_amount: item.team.tournament.entryFee,
          product_data: {
            name: `Inscription - ${item.team.tournament.name}`,
            description: `Equipe ${item.team.name}`,
          },
        },
      })),
    metadata: {
      joinRequestIds: JSON.stringify(payableItems.map((item) => item.id)),
      playerId: user.id,
    },
    success_url: `${appUrl}/payments/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/payments/cancel`,
  });

  await prisma.joinRequest.updateMany({
    where: { id: { in: payableItems.map((item) => item.id) } },
    data: { stripeSessionId: session.id },
  });

  if (!session.url) {
    throw new Error("Stripe did not return a checkout URL.");
  }

  redirect(session.url);
}

export async function createCheckoutSession(input?: z.infer<typeof checkoutSchema> | FormData) {
  if (input) {
    await addTeamToCart(input);
  }

  await createCartCheckoutSession();
}

export async function removeCartItem(input: z.infer<typeof cartItemSchema> | FormData) {
  const user = await requireAuth();
  const { joinRequestId } = cartItemSchema.parse(
    input instanceof FormData ? formDataToCartItemInput(input) : input,
  );

  await prisma.joinRequest.deleteMany({
    where: {
      id: joinRequestId,
      playerId: user.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      paidAt: null,
    },
  });

  revalidatePath("/cart");
}
