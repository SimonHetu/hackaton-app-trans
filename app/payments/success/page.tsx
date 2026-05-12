import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

type PaymentSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

export default async function PaymentSuccessPage({ searchParams }: PaymentSuccessPageProps) {
  const { session_id: sessionId } = await searchParams;
  let teamId: string | null = null;

  if (sessionId) {
    const session = await getStripe().checkout.sessions.retrieve(sessionId);
    const joinRequestIds = session.metadata?.joinRequestIds
      ? (JSON.parse(session.metadata.joinRequestIds) as string[])
      : session.metadata?.joinRequestId
        ? [session.metadata.joinRequestId]
        : [];

    if (joinRequestIds.length > 0 && session.payment_status === "paid") {
      await prisma.joinRequest.updateMany({
        where: { id: { in: joinRequestIds } },
        data: {
          paymentStatus: "PAID",
          stripeSessionId: session.id,
          paidAt: new Date(),
        },
      });

      const firstJoinRequest = await prisma.joinRequest.findFirst({
        where: { id: { in: joinRequestIds } },
        select: { teamId: true },
      });

      teamId = firstJoinRequest?.teamId ?? null;
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <Badge className="w-fit">Paiement confirme</Badge>
          <CardTitle>Merci, ton paiement a ete recu.</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Ta demande d&apos;adhesion est maintenant marquee comme payee.</p>
          <Link href={teamId ? `/teams/${teamId}` : "/teams"} className="font-medium text-foreground hover:underline">
            Retourner a l&apos;equipe
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
