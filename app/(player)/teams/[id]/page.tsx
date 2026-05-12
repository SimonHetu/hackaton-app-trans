import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentPlayerProfile } from "@/server/actions/player-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { JoinTeamButton } from "./join-team-button";

export default async function TeamDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await getCurrentPlayerProfile();

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      tournament: true,
      members: { select: { id: true, fullName: true, email: true } },
      joinRequests: {
        where: { playerId: user.id },
        select: { id: true, status: true, paymentStatus: true },
      },
    },
  });

  if (!team) notFound();

  const isMember = team.members.some((m) => m.id === user.id);
  const existingRequest = team.joinRequests[0];
  const placesLeft = team.maxCapacity - team.members.length;
  const isFull = placesLeft <= 0;
  const isPaid = team.tournament.entryFee > 0;

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold">{team.name}</h1>
          {isPaid && <Badge variant="secondary">Payant</Badge>}
          {isFull && <Badge variant="destructive">Complète</Badge>}
        </div>
        <p className="text-muted-foreground">
          {team.tournament.name} · {team.tournament.sport} · {team.tournament.city}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Informations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <p><strong>Date du tournoi :</strong> {team.tournament.startDate.toLocaleDateString("fr-CA")}</p>
          <p><strong>Places :</strong> {team.members.length} / {team.maxCapacity}</p>
          {isPaid && (
            <p><strong>Frais d&apos;inscription :</strong> {(team.tournament.entryFee / 100).toFixed(2)} {team.tournament.currency}</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Membres ({team.members.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {team.members.length === 0 ? (
            <p className="text-muted-foreground text-sm">Aucun membre pour l&apos;instant.</p>
          ) : (
            <ul className="space-y-1 text-sm">
              {team.members.map((m) => (
                <li key={m.id}>{m.fullName}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <JoinTeamButton
        teamId={team.id}
        isMember={isMember}
        isFull={isFull}
        isPaid={isPaid}
        existingRequest={existingRequest ?? null}
      />
    </div>
  );
}