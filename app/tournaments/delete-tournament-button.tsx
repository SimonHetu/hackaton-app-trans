"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteTournament } from "@/server/actions/tournaments";

export function DeleteTournamentButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Supprimer le tournoi "${name}" ? Cette action est irréversible.`)) return;
    startTransition(async () => {
      try {
        await deleteTournament(id);
        toast.success("Tournoi supprimé");
        router.refresh();
      } catch {
        toast.error("Impossible de supprimer");
      }
    });
  };

  return (
    <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isPending}>
      {isPending ? "..." : "Supprimer"}
    </Button>
  );
}