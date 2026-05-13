import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TeamsFilters } from "./teams-filters";

type SearchParams = Promise<{
  city?: string;
  sport?: string;
  available?: string;
}>;

export default async function TeamsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { city, sport, available } = await searchParams;

  const teams = await prisma.team.findMany({
    where: {
      tournament: {
        ...(city ? { city: { contains: city, mode: "insensitive" } } : {}),
        ...(sport ? { sport: { contains: sport, mode: "insensitive" } } : {}),
      },
    },
    include: {
      tournament: { select: { name: true, sport: true, city: true, entryFee: true } },
      _count: { select: { members: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  // Filtre "places disponibles" côté serveur (après la query)
  const filtered =
    available === "true"
      ? teams.filter((t) => t._count.members < t.maxCapacity)
      : teams;

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Rechercher une équipe</h1>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline">
            <Link href="/">Accueil</Link>
          </Button>
          <Button asChild>
            <Link href="/tournaments">Créer une équipe</Link>
          </Button>
        </div>
      </div>

      <TeamsFilters />

      {filtered.length === 0 ? (
        <p className="text-gray-500 mt-8">Aucune équipe ne correspond à ta recherche.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
          {filtered.map((team) => {
            const places = team.maxCapacity - team._count.members;
            const isPaid = team.tournament.entryFee > 0;

            return (
              <Link key={team.id} href={`/teams/${team.id}`}>
                <Card className="hover:shadow-md transition cursor-pointer h-full">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{team.name}</span>
                      {isPaid && <Badge variant="secondary">Payant</Badge>}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    <p className="text-gray-600">
                      <strong>Tournoi :</strong> {team.tournament.name}
                    </p>
                    <p className="text-gray-600">
                      <strong>Sport :</strong> {team.tournament.sport}
                    </p>
                    <p className="text-gray-600">
                      <strong>Ville :</strong> {team.tournament.city}
                    </p>
                    <p className="font-semibold mt-2">
                      Places : {team._count.members} / {team.maxCapacity}
                      {places === 0 && (
                        <Badge variant="destructive" className="ml-2">Pleine</Badge>
                      )}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
