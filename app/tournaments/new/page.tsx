import Link from "next/link";
import { Button } from "@/components/ui/button";
import { requireRole } from "@/lib/auth";
import { TournamentForm } from "./tournament-form";

export default async function NewTournamentPage() {
  await requireRole("ORGANIZER");

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">Créer un tournoi</h1>
        <Button asChild variant="outline">
          <Link href="/">Accueil</Link>
        </Button>
      </div>
      <TournamentForm />
    </div>
  );
}
