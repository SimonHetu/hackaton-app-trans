"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { tournamentSchema, type TournamentInput } from "@/server/validations/tournament";

export async function createTournament(input: TournamentInput) {
  const user = await requireRole("ORGANIZER");
  const data = tournamentSchema.parse(input);

  const tournament = await prisma.tournament.create({
    data: {
      name: data.name,
      sport: data.sport,
      city: data.city,
      startDate: data.startDate,
      entryFee: Math.round(data.entryFee * 100), // converti $ en cents
      currency: data.currency,
      organizerId: user.id,
    },
  });

  revalidatePath("/tournaments");
  return tournament;
}

export async function deleteTournament(id: string) {
  const user = await requireRole("ORGANIZER");
  const tournament = await prisma.tournament.findUnique({ where: { id } });
  if (!tournament) throw new Error("Tournoi introuvable");
  if (tournament.organizerId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  await prisma.tournament.delete({ where: { id } });
  revalidatePath("/tournaments");
}