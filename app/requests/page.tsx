import { requireRole } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RequestActions } from "./request-actions";

export default async function RequestsPage() {
  const user = await requireRole("ORGANIZER");

  const requests = await prisma.joinRequest.findMany({
    where: {
      team: {
        tournament: user.role === "ADMIN" ? {} : { organizerId: user.id },
      },
    },
    include: {
      player: {
        select: {
          fullName: true,
          email: true,
          playerProfile: {
            select: { city: true, favoriteSport: true, level: true, position: true },
          },
        },
      },
      team: {
        select: {
          name: true,
          tournament: { select: { name: true, sport: true, city: true } },
        },
      },
    },
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
  });

  const pending = requests.filter((r) => r.status === "PENDING");
  const treated = requests.filter((r) => r.status !== "PENDING");

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Demandes reçues</h1>

      <section>
        <h2 className="text-xl font-semibold mb-4">
          En attente ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-muted-foreground">Aucune demande en attente.</p>
        ) : (
          <div className="space-y-4">
            {pending.map((req) => (
              <RequestCard key={req.id} request={req} showActions />
            ))}
          </div>
        )}
      </section>

      {treated.length > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-semibold mb-4">
            Historique ({treated.length})
          </h2>
          <div className="space-y-4">
            {treated.map((req) => (
              <RequestCard key={req.id} request={req} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

type RequestData = Awaited<ReturnType<typeof prisma.joinRequest.findMany>>[number] & {
  player: {
    fullName: string;
    email: string;
    playerProfile: {
      city: string;
      favoriteSport: string;
      level: string;
      position: string | null;
    } | null;
  };
  team: {
    name: string;
    tournament: { name: string; sport: string; city: string };
  };
};

function RequestCard({ request, showActions }: { request: RequestData; showActions?: boolean }) {
  const statusConfig = {
    PENDING: { label: "En attente", variant: "secondary" as const },
    ACCEPTED: { label: "Acceptée", variant: "default" as const },
    REJECTED: { label: "Refusée", variant: "destructive" as const },
  };
  const { label, variant } = statusConfig[request.status];
  const profile = request.player.playerProfile;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div>
            <CardTitle>{request.player.fullName}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{request.player.email}</p>
          </div>
          <Badge variant={variant}>{label}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p><strong>Équipe :</strong> {request.team.name}</p>
          <p><strong>Tournoi :</strong> {request.team.tournament.name}</p>
          {profile && (
            <>
              <p><strong>Ville :</strong> {profile.city}</p>
              <p><strong>Sport :</strong> {profile.favoriteSport}</p>
              <p><strong>Niveau :</strong> {profile.level}</p>
              {profile.position && <p><strong>Poste :</strong> {profile.position}</p>}
            </>
          )}
        </div>

        {request.message && (
          <div className="border-l-2 pl-3 italic text-muted-foreground">
            &ldquo;{request.message}&rdquo;
          </div>
        )}

        <p className="text-xs text-muted-foreground">
          Reçue le {request.createdAt.toLocaleDateString("fr-CA")} · Paiement : {request.paymentStatus}
        </p>

        {showActions && <RequestActions requestId={request.id} paymentStatus={request.paymentStatus} />}
      </CardContent>
    </Card>
  );
}