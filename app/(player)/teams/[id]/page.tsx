import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { requireAuth } from "@/lib/auth";
import { formatEntryFee } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { addTeamToCart } from "@/server/actions/payments";

type TeamDetailsPageProps = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ status?: string }>;
};

const statusMessages: Record<string, string> = {
  "already-member": "Tu fais deja partie de cette equipe.",
  accepted: "Ta demande pour cette equipe est deja acceptee.",
  requested: "Ta demande a ete envoyee.",
};

export default async function TeamDetailsPage({
  params,
  searchParams,
}: TeamDetailsPageProps) {
  const [{ id }, { status }, user] = await Promise.all([
    params,
    searchParams,
    requireAuth(),
  ]);

  const team = await prisma.team.findUnique({
    where: { id },
    include: {
      tournament: {
        select: {
          name: true,
          sport: true,
          city: true,
          startDate: true,
          entryFee: true,
          currency: true,
          organizer: { select: { fullName: true } },
        },
      },
      members: {
        select: { id: true, fullName: true },
        orderBy: { fullName: "asc" },
      },
      joinRequests: {
        where: { playerId: user.id },
        select: { status: true, paymentStatus: true },
        take: 1,
      },
      _count: { select: { members: true } },
    },
  });

  if (!team) {
    notFound();
  }

  const placesLeft = Math.max(team.maxCapacity - team._count.members, 0);
  const isFull = placesLeft === 0;
  const isPaid = team.tournament.entryFee > 0;
  const currentRequest = team.joinRequests[0];
  const isMember = team.members.some((member) => member.id === user.id);
  const canRequest = !isFull && !isMember && currentRequest?.status !== "ACCEPTED";
  const actionLabel = isPaid ? "Ajouter au panier" : "Demander a rejoindre";

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <Link href="/teams" className="text-sm text-muted-foreground hover:underline">
            Retour aux equipes
          </Link>
          <h1 className="mt-2 text-2xl font-bold">{team.name}</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {team.tournament.name} · {team.tournament.sport} · {team.tournament.city}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {isPaid && (
            <Badge variant="secondary">
              {formatEntryFee(team.tournament.entryFee, team.tournament.currency)}
            </Badge>
          )}
          <Badge variant={isFull ? "destructive" : "outline"}>
            {placesLeft} place{placesLeft > 1 ? "s" : ""} dispo
          </Badge>
        </div>
      </div>

      {status && statusMessages[status] && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          {statusMessages[status]}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <Card>
          <CardHeader>
            <CardTitle>Details du tournoi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="grid gap-1">
              <span className="text-muted-foreground">Sport</span>
              <span className="font-medium">{team.tournament.sport}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Ville</span>
              <span className="font-medium">{team.tournament.city}</span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Date</span>
              <span className="font-medium">
                {team.tournament.startDate.toLocaleDateString("fr-CA")}
              </span>
            </div>
            <div className="grid gap-1">
              <span className="text-muted-foreground">Organisateur</span>
              <span className="font-medium">{team.tournament.organizer.fullName}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Inscription</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground">
            <p>
              Membres: {team._count.members} / {team.maxCapacity}
            </p>
            {currentRequest && (
              <p>
                Demande: {currentRequest.status.toLowerCase()} · paiement{" "}
                {currentRequest.paymentStatus.toLowerCase()}
              </p>
            )}
            {isMember && <p>Tu es deja membre de cette equipe.</p>}
            {isFull && <p>Cette equipe est complete.</p>}
          </CardContent>
          <CardFooter>
            {canRequest ? (
              <form action={addTeamToCart} className="w-full">
                <input type="hidden" name="teamId" value={team.id} />
                <Button type="submit" className="w-full">
                  {actionLabel}
                </Button>
              </form>
            ) : (
              <Button disabled className="w-full">
                Non disponible
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Membres</CardTitle>
        </CardHeader>
        <CardContent>
          {team.members.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Aucun membre inscrit pour le moment.
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {team.members.map((member) => (
                <Badge key={member.id} variant="outline">
                  {member.fullName}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
