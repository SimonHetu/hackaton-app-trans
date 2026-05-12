"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cancelJoinRequest } from "@/server/actions/join-requests";

export function CancelRequestButton({ requestId }: { requestId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleCancel = () => {
    if (!confirm("Annuler cette demande ?")) return;

    startTransition(async () => {
      try {
        await cancelJoinRequest(requestId);
        toast.success("Demande annulée");
        router.refresh();
      } catch {
        toast.error("Erreur lors de l'annulation");
      }
    });
  };

  return (
    <Button variant="outline" size="sm" onClick={handleCancel} disabled={isPending}>
      {isPending ? "Annulation..." : "Annuler ma demande"}
    </Button>
  );
}