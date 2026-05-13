"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deleteTeam } from "@/server/actions/teams";

export function DeleteTeamButton({ id, name }: { id: string; name: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Supprimer l'équipe "${name}" ?`)) return;
    startTransition(async () => {
      try {
        await deleteTeam(id);
        toast.success("Équipe supprimée");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  return (
    <Button size="sm" variant="destructive" onClick={handleDelete} disabled={isPending}>
      {isPending ? "..." : "Supprimer"}
    </Button>
  );
}