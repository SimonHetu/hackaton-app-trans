import { prisma } from "@/lib/prisma";
import { getCurrentPlayerProfile } from "@/server/actions/player-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { matchesSearchParamsSchema } from "@/server/validations/pages";
import { MatchesFilter } from "./matches-filter";

type SearchParams = Promise<{ filter?: string }>;

export default async function MatchesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { filter } = matchesSearchParamsSchema.parse(await searchParams);
  const { user } = await getCurrentPlayerProfile();

  // Récupère les équipes dont le user est membre
  const myTeams = await prisma.team.findMany({
    where: { members: { some: { id: user.id } } },
    select: { id: true },
  });
  const teamIds = myTeams.map((t) => t.id);

  const now = new Date();
  const dateFilter =
    filter === "past" ? { date: { lt: now } } :
    filter === "upcoming" ? { date: { gte: now } } : {};

  const matches = await prisma.match.findMany({
    where: {
      OR: [
        { teamAId: { in: teamIds } },
        { teamBId: { in: teamIds } },
      ],
      ...dateFilter,
    },
    include: {
      teamA: { select: { id: true, name: true } },
      teamB: { select: { id: true, name: true } },
    },
    orderBy: { date: "asc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mes matchs</h1>

      <MatchesFilter />

      {matches.length === 0 ? (
        <p className="text-muted-foreground mt-6">
          Aucun match {filter === "past" ? "passé" : filter === "upcoming" ? "à venir" : "trouvé"}.
        </p>
      ) : (
        <div className="space-y-4 mt-6">
          {matches.map((m) => {
            const isPast = m.date < now;
            const myTeamId = teamIds.includes(m.teamAId) ? m.teamAId : m.teamBId;
            const myTeam = m.teamAId === myTeamId ? m.teamA : m.teamB;
            const opponent = m.teamAId === myTeamId ? m.teamB : m.teamA;
            const myScore = m.teamAId === myTeamId ? m.scoreA : m.scoreB;
            const oppScore = m.teamAId === myTeamId ? m.scoreB : m.scoreA;

            return (
              <Card key={m.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">
                      {myTeam.name} vs {opponent.name}
                    </CardTitle>
                    <Badge variant={isPast ? "secondary" : "default"}>
                      {isPast ? "Passé" : "À venir"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-1 text-sm">
                  <p><strong>Date :</strong> {m.date.toLocaleString("fr-CA")}</p>
                  <p><strong>Lieu :</strong> {m.location}</p>
                  {myScore !== null && oppScore !== null && (
                    <p className="text-base font-semibold mt-2">
                      Score : {myScore} - {oppScore}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
