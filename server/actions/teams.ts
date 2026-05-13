"use server";

import { revalidatePath } from "next/cache";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { teamSchema, type TeamInput } from "@/server/validations/team";

export async function createTeam(input: TeamInput) {
  const user = await requireRole("ORGANIZER");
  const data = teamSchema.parse(input);

  // Vérifie que le tournoi appartient à l'organisateur
  const tournament = await prisma.tournament.findUnique({
    where: { id: data.tournamentId },
  });
  if (!tournament) throw new Error("Tournoi introuvable");
  if (tournament.organizerId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }

  const team = await prisma.team.create({
    data: {
      name: data.name,
      tournamentId: data.tournamentId,
      maxCapacity: data.maxCapacity,
    },
  });

  revalidatePath(`/tournaments/${data.tournamentId}`);
  return team;
}

export async function deleteTeam(id: string) {
  const user = await requireRole("ORGANIZER");

  const team = await prisma.team.findUnique({
    where: { id },
    include: { tournament: true, _count: { select: { members: true } } },
  });
  if (!team) throw new Error("Équipe introuvable");
  if (team.tournament.organizerId !== user.id && user.role !== "ADMIN") {
    throw new Error("Forbidden");
  }
  if (team._count.members > 0) {
    throw new Error("Impossible de supprimer une équipe avec des joueurs");
  }

  await prisma.team.delete({ where: { id } });
  revalidatePath(`/tournaments/${team.tournamentId}`);
}