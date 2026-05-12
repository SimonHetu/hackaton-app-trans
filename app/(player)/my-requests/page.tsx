import { prisma } from "@/lib/prisma";
import { getCurrentPlayerProfile } from "@/server/actions/player-profile";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CancelRequestButton } from "./cancel-request-button";

export default async function MyRequestsPage() {
  const { user } = await getCurrentPlayerProfile();

  const requests = await prisma.joinRequest.findMany({
    where: { playerId: user.id },
    include: {
      team: {
        include: {
          tournament: { select: { name: true, sport: true, city: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-3xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mes demandes</h1>

      {requests.length === 0 ? (
        <p className="text-muted-foreground">
          Tu n&apos;as encore envoyé aucune demande. Va sur{" "}
          <a href="/teams" className="underline">Rechercher une équipe</a>.
        </p>
      ) : (
        <div className="space-y-4">
          {requests.map((req) => {
            const statusConfig = {
              PENDING: { label: "En attente", variant: "secondary" as const },
              ACCEPTED: { label: "Acceptée", variant: "default" as const },
              REJECTED: { label: "Refusée", variant: "destructive" as const },
            };
            const { label, variant } = statusConfig[req.status];

            return (
              <Card key={req.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <CardTitle>{req.team.name}</CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {req.team.tournament.name} · {req.team.tournament.sport} · {req.team.tournament.city}
                      </p>
                    </div>
                    <Badge variant={variant}>{label}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  {req.message && (
                    <p className="italic text-muted-foreground">&ldquo;{req.message}&rdquo;</p>
                  )}
                  <p className="text-muted-foreground">
                    Envoyée le {req.createdAt.toLocaleDateString("fr-CA")}
                  </p>

                  {req.paymentStatus === "PENDING" && (
                    <p className="text-yellow-600">⏳ En attente de paiement</p>
                  )}
                  {req.paymentStatus === "PAID" && (
                    <p className="text-green-600">✓ Paiement confirmé</p>
                  )}

                  {req.status === "PENDING" && (
                    <div className="pt-2">
                      <CancelRequestButton requestId={req.id} />
                    </div>
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