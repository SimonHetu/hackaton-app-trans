import Link from "next/link";
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
import { createCartCheckoutSession, removeCartItem } from "@/server/actions/payments";
import { cartSearchParamsSchema } from "@/server/validations/pages";

type CartPageProps = {
  searchParams: Promise<{ status?: string }>;
};

export default async function CartPage({ searchParams }: CartPageProps) {
  const [user, { status }] = await Promise.all([
    requireAuth(),
    searchParams.then((value) => cartSearchParamsSchema.parse(value)),
  ]);

  const cartItems = await prisma.joinRequest.findMany({
    where: {
      playerId: user.id,
      status: "PENDING",
      paymentStatus: "PENDING",
      paidAt: null,
      team: { tournament: { entryFee: { gt: 0 } } },
    },
    include: {
      team: {
        include: {
          tournament: true,
          _count: { select: { members: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const total = cartItems.reduce((sum, item) => sum + item.team.tournament.entryFee, 0);
  const currency = cartItems[0]?.team.tournament.currency ?? "CAD";

  return (
    <main className="mx-auto max-w-4xl space-y-6 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Mon panier</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Les places payantes ajoutees au panier sont payees ensemble au checkout.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href="/teams">Continuer a magasiner</Link>
        </Button>
      </div>

      {status === "added" && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-800">
          Place ajoutee au panier.
        </div>
      )}
      {status === "empty" && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          Ton panier ne contient aucun item payable.
        </div>
      )}

      {cartItems.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-sm text-muted-foreground">
            Ton panier est vide pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {cartItems.map((item) => {
            const placesLeft = item.team.maxCapacity - item.team._count.members;

            return (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <CardTitle>{item.team.name}</CardTitle>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {item.team.tournament.name} · {item.team.tournament.sport}
                      </p>
                    </div>
                    <Badge variant="secondary">
                      {formatEntryFee(item.team.tournament.entryFee, item.team.tournament.currency)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  <p>Ville: {item.team.tournament.city}</p>
                  <p>Places restantes: {Math.max(placesLeft, 0)}</p>
                </CardContent>
                <CardFooter className="justify-between">
                  <Button asChild variant="outline">
                    <Link href={`/teams/${item.teamId}`}>Voir l&apos;equipe</Link>
                  </Button>
                  <form action={removeCartItem}>
                    <input type="hidden" name="joinRequestId" value={item.id} />
                    <Button type="submit" variant="ghost">
                      Retirer
                    </Button>
                  </form>
                </CardFooter>
              </Card>
            );
          })}

          <Card>
            <CardContent className="flex flex-wrap items-center justify-between gap-4 py-6">
              <div>
                <p className="text-sm text-muted-foreground">Total</p>
                <p className="text-2xl font-semibold">{formatEntryFee(total, currency)}</p>
              </div>
              <form action={createCartCheckoutSession}>
                <Button type="submit">Passer au checkout</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      )}
    </main>
  );
}
