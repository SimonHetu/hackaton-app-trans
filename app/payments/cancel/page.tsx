import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type PaymentCancelPageProps = {
  searchParams: Promise<{ teamId?: string }>;
};

export default async function PaymentCancelPage({ searchParams }: PaymentCancelPageProps) {
  const { teamId } = await searchParams;

  return (
    <main className="mx-auto flex min-h-screen max-w-xl items-center p-6">
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Paiement annule</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>Aucun paiement n&apos;a ete complete. Tes places restent dans ton panier.</p>
          <Link href={teamId ? `/teams/${teamId}` : "/cart"} className="font-medium text-foreground hover:underline">
            Retourner au panier
          </Link>
        </CardContent>
      </Card>
    </main>
  );
}
