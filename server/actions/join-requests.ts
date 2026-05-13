"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createJoinRequest(input: { teamId: string; message?: string }) {
  // STUB — implémenté via addTeamToCart côté payments
  console.log("TODO createJoinRequest", input);
  return undefined;
}

export async function cancelJoinRequest(requestId: string) {
  // STUB — sera implémenté côté joueur
  console.log("TODO cancelJoinRequest", requestId);
}

export async function acceptJoinRequest(requestId: string) {
  const user = await requireRole("ORGANIZER");

  await prisma.$transaction(async (tx) => {
    const request = await tx.joinRequest.findUniqueOrThrow({
      where: { id: requestId },
      include: {
        team: {
          include: {
            tournament: { select: { organizerId: true } },
            _count: { select: { members: true } },
          },
        },
      },
    });

    // Vérifie que l'organisateur possède bien le tournoi
    if (request.team.tournament.organizerId !== user.id && user.role !== "ADMIN") {
      throw new Error("Forbidden");
    }

    if (request.status !== "PENDING") {
      throw new Error("Cette demande a déjà été traitée");
    }

    // Si tournoi payant, exige paiement validé
    if (request.paymentStatus === "PENDING") {
      throw new Error("Le paiement n'a pas encore été confirmé");
    }

    if (request.team._count.members >= request.team.maxCapacity) {
      throw new Error("L'équipe est pleine");
    }

    // Ajoute le joueur à l'équipe
    await tx.team.update({
      where: { id: request.teamId },
      data: { members: { connect: { id: request.playerId } } },
    });

    // Marque la demande comme acceptée
    await tx.joinRequest.update({
      where: { id: requestId },
      data: { status: "ACCEPTED" },
    });
  });

  revalidatePath("/requests");
  revalidatePath("/my-requests");
}

export async function rejectJoinRequest(requestId: string) {
  const user = await requireRole("ORGANIZER");

  const request = await prisma.joinRequest.findUnique({
    where: { id: requestId },
    include: {
      team: { include: { tournament: { select: { organizerId: true } } } },
    },
  });
  if (!request) throw new Error("Demande introuvable");
  if (request.team.tournament.organizerId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  if (request.status !== "PENDING") {
    throw new Error("Cette demande a déjà été traitée");
  }

  await prisma.joinRequest.update({
    where: { id: requestId },
    data: { status: "REJECTED" },
  });

  revalidatePath("/requests");
  revalidatePath("/my-requests");
}