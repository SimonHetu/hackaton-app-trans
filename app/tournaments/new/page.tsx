import { requireRole } from "@/lib/auth";
import { TournamentForm } from "./tournament-form";

export default async function NewTournamentPage() {
  await requireRole("ORGANIZER");

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Créer un tournoi</h1>
      <TournamentForm />
    </div>
  );
}