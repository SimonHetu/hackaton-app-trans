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
import { getCurrentUser } from "@/lib/auth";
import { formatEntryFee } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { addTeamToCart } from "@/server/actions/payments";

type TeamPageProps = {
  params: Promise<{ teamId: string }>;
  searchParams: Promise<{ status?: string }>;
};

function getPaymentLabel(paymentStatus?: "NOT_REQUIRED" | "PENDING" | "PAID") {
  if (paymentStatus === "PAID") return "Paiement recu";
  if (paymentStatus === "PENDING") return "Paiement en attente";
  if (paymentStatus === "NOT_REQUIRED") return "Paiement non requis";
  return "Aucune demande";
}

export default async function TeamPage({ params, searchParams }: TeamPageProps) {
  const [{ teamId }, { status }] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();

  const team = await prisma.team.findUnique({
    where: { id: teamId },
    include: {
      tournament: true,
      members: { select: { id: true, fullName: true } },
      joinRequests: user
        ? {
            where: { playerId: user.id },
            select: {
              id: true,
              status: true,
              paymentStatus: true,
              paidAt: true,
              stripeSessionId: true,
            },
          }
        : false,
      _count: { select: { members: true } },
    },
  });

  if (!team) notFound();

  const joinRequest = team.joinRequests[0];
  const placesLeft = team.maxCapacity - team._count.members;
  const isFull = placesLeft <= 0;
  const isPaidTournament = team.tournament.entryFee > 0;
  const isMember = user ? team.members.some((member) => member.id === user.id) : false;
  const canRequest = !isFull && !isMember && joinRequest?.status !== "ACCEPTED";

  return (
    <main className="mx-auto max-w-3xl space-y-6 p-6">
      <Link href="/teams" className="text-sm font-medium text-muted-foreground hover:text-foreground">
        Retour aux equipes
      </Link>

      {status === "requested" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Demande envoyee. L&apos;organisateur pourra la traiter.
        </div>
      )}
      {status === "already-member" && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800">
          Tu es deja membre de cette equipe.
        </div>
      )}

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <CardTitle className="text-2xl">{team.name}</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{team.tournament.name}</p>
            </div>
            {isPaidTournament ? <Badge variant="secondary">Payant</Badge> : <Badge>Gratuit</Badge>}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="grid gap-3 text-sm sm:grid-cols-2">
            <p>
              <strong>Sport:</strong> {team.tournament.sport}
            </p>
            <p>
              <strong>Ville:</strong> {team.tournament.city}
            </p>
            <p>
              <strong>Places:</strong> {team._count.members} / {team.maxCapacity}
            </p>
            <p>
              <strong>Frais:</strong>{" "}
              {isPaidTournament
                ? formatEntryFee(team.tournament.entryFee, team.tournament.currency)
                : "Aucun frais"}
            </p>
          </div>

          <div className="rounded-lg border bg-muted/30 p-4 text-sm">
            <p className="font-medium">Etat de ta demande</p>
            <p className="mt-1 text-muted-foreground">
              Demande: {joinRequest?.status ?? "Aucune"} · Paiement:{" "}
              {getPaymentLabel(joinRequest?.paymentStatus)}
            </p>
          </div>
        </CardContent>

        <CardFooter className="justify-between gap-3">
          {isMember || joinRequest?.status === "ACCEPTED" ? (
            <Badge>Deja membre</Badge>
          ) : isFull ? (
            <Badge variant="destructive">Equipe pleine</Badge>
          ) : (
            <form action={addTeamToCart}>
              <input type="hidden" name="teamId" value={team.id} />
              <Button type="submit" disabled={!canRequest}>
                {isPaidTournament ? "Ajouter au panier" : "Demander a rejoindre"}
              </Button>
            </form>
          )}

          {joinRequest?.paymentStatus === "PENDING" && isPaidTournament && (
            <Button asChild variant="outline">
              <Link href="/cart">Voir mon panier</Link>
            </Button>
          )}

          {joinRequest?.paymentStatus === "PAID" && (
            <Badge variant="secondary">Paiement confirme</Badge>
          )}
        </CardFooter>
      </Card>
    </main>
  );
}
