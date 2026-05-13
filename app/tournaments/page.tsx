import Link from "next/link";
import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DeleteTournamentButton } from "./delete-tournament-button";

export default async function TournamentsPage() {
  const user = await requireRole("ORGANIZER");

  const tournaments = await prisma.tournament.findMany({
    where: user.role === "ADMIN" ? {} : { organizerId: user.id },
    include: { _count: { select: { teams: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Mes tournois</h1>
        <Button asChild>
          <Link href="/tournaments/new">+ Créer un tournoi</Link>
        </Button>
      </div>

      {tournaments.length === 0 ? (
        <p className="text-muted-foreground">
          Tu n&apos;as encore créé aucun tournoi.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tournaments.map((t) => {
            const isPaid = t.entryFee > 0;
            return (
              <Card key={t.id}>
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle>{t.name}</CardTitle>
                    {isPaid ? (
                      <Badge variant="secondary">
                        {(t.entryFee / 100).toFixed(2)} {t.currency}
                      </Badge>
                    ) : (
                      <Badge>Gratuit</Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <p><strong>Sport :</strong> {t.sport}</p>
                  <p><strong>Ville :</strong> {t.city}</p>
                  <p><strong>Date :</strong> {t.startDate.toLocaleDateString("fr-CA")}</p>
                  <p><strong>Équipes :</strong> {t._count.teams}</p>
                  <div className="flex gap-2 pt-3">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/tournaments/${t.id}`}>Voir / Gérer</Link>
                    </Button>
                    <DeleteTournamentButton id={t.id} name={t.name} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}