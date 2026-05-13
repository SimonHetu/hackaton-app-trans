import { notFound } from "next/navigation";
import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CreateTeamForm } from "./create-team-form";
import { DeleteTeamButton } from "./delete-team-button";
import { TournamentForm } from "../new/tournament-form";
import { idRouteParamsSchema } from "@/server/validations/pages";

export default async function TournamentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = idRouteParamsSchema.parse(await params);
  const user = await requireRole("ORGANIZER");

  const tournament = await prisma.tournament.findUnique({
    where: { id },
    include: {
      teams: {
        include: {
          members: { select: { id: true, fullName: true } },
          _count: { select: { joinRequests: { where: { status: "PENDING" } } } },
        },
      },
    },
  });

  if (!tournament) notFound();
  if (tournament.organizerId !== user.id && user.role !== "ADMIN") {
    return <p className="p-6 text-red-500">Accès refusé</p>;
  }

  const isPaid = tournament.entryFee > 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Link href="/tournaments" className="text-sm text-muted-foreground hover:underline">
        ← Retour aux tournois
      </Link>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{tournament.name}</h1>
          {isPaid ? (
            <Badge variant="secondary">
              {(tournament.entryFee / 100).toFixed(2)} {tournament.currency}
            </Badge>
          ) : (
            <Badge>Gratuit</Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          {tournament.sport} · {tournament.city} · {tournament.startDate.toLocaleDateString("fr-CA")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Modifier le tournoi</CardTitle>
        </CardHeader>
        <CardContent>
          <TournamentForm
            mode="edit"
            tournamentId={tournament.id}
            defaultValues={{
              name: tournament.name,
              sport: tournament.sport,
              city: tournament.city,
              startDate: tournament.startDate,
              entryFee: tournament.entryFee / 100,
              currency: tournament.currency,
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Créer une équipe</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateTeamForm tournamentId={tournament.id} />
        </CardContent>
      </Card>

      <div>
        <h2 className="text-xl font-bold mb-4">
          Équipes ({tournament.teams.length})
        </h2>

        {tournament.teams.length === 0 ? (
          <p className="text-muted-foreground">Aucune équipe pour l&apos;instant.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tournament.teams.map((team) => (
              <Card key={team.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-lg">{team.name}</CardTitle>
                    {team._count.joinRequests > 0 && (
                      <Badge variant="destructive">
                        {team._count.joinRequests} demande{team._count.joinRequests > 1 ? "s" : ""}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p>
                    <strong>Places :</strong> {team.members.length} / {team.maxCapacity}
                  </p>
                  {team.members.length > 0 && (
                    <div>
                      <p className="font-medium mt-2">Joueurs :</p>
                      <ul className="list-disc list-inside text-muted-foreground">
                        {team.members.map((m) => (
                          <li key={m.id}>{m.fullName}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/requests">Voir demandes</Link>
                    </Button>
                    <DeleteTeamButton id={team.id} name={team.name} />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
