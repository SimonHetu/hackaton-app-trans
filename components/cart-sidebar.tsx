import { auth } from "@clerk/nextjs/server";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatEntryFee } from "@/lib/money";
import { prisma } from "@/lib/prisma";
import { createCartCheckoutSession, removeCartItem } from "@/server/actions/payments";

export async function CartSidebar() {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: { id: true },
  });

  if (!user) {
    return null;
  }

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
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const total = cartItems.reduce((sum, item) => sum + item.team.tournament.entryFee, 0);
  const currency = cartItems[0]?.team.tournament.currency ?? "CAD";

  return (
    <>
      <aside className="fixed bottom-0 right-0 top-0 z-30 hidden w-80 border-l bg-background/95 p-4 shadow-lg backdrop-blur lg:flex lg:flex-col">
        <div className="flex items-center justify-between border-b pb-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="size-4" />
            <h2 className="font-semibold">Panier</h2>
          </div>
          <span className="text-sm text-muted-foreground">{cartItems.length}</span>
        </div>

        {cartItems.length === 0 ? (
          <div className="flex flex-1 flex-col justify-center text-sm text-muted-foreground">
            Ton panier est vide.
          </div>
        ) : (
          <div className="flex min-h-0 flex-1 flex-col">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto py-4">
              {cartItems.map((item) => (
                <div key={item.id} className="rounded-lg border p-3 text-sm">
                  <Link href={`/teams/${item.teamId}`} className="font-medium hover:underline">
                    {item.team.name}
                  </Link>
                  <p className="mt-1 text-muted-foreground">{item.team.tournament.name}</p>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="font-medium">
                      {formatEntryFee(item.team.tournament.entryFee, item.team.tournament.currency)}
                    </span>
                    <form action={removeCartItem}>
                      <input type="hidden" name="joinRequestId" value={item.id} />
                      <Button type="submit" variant="ghost" size="sm">
                        Retirer
                      </Button>
                    </form>
                  </div>
                </div>
              ))}
            </div>

            <div className="space-y-3 border-t pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total</span>
                <span className="text-lg font-semibold">{formatEntryFee(total, currency)}</span>
              </div>
              <form action={createCartCheckoutSession}>
                <Button type="submit" className="w-full">
                  Passer au checkout
                </Button>
              </form>
              <Button asChild variant="outline" className="w-full">
                <Link href="/cart">Voir le panier</Link>
              </Button>
            </div>
          </div>
        )}
      </aside>

      <Link
        href="/cart"
        className="fixed bottom-4 right-4 z-30 inline-flex h-12 items-center gap-2 rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground shadow-lg lg:hidden"
      >
        <ShoppingCart className="size-4" />
        Panier {cartItems.length > 0 ? `(${cartItems.length})` : ""}
      </Link>
    </>
  );
}
