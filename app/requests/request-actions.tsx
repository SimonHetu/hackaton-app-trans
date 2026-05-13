"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { acceptJoinRequest, rejectJoinRequest } from "@/server/actions/join-requests";

export function RequestActions({
  requestId,
  paymentStatus,
}: {
  requestId: string;
  paymentStatus: "NOT_REQUIRED" | "PENDING" | "PAID";
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const canAccept = paymentStatus !== "PENDING";

  const handleAccept = () => {
    startTransition(async () => {
      try {
        await acceptJoinRequest(requestId);
        toast.success("Demande acceptée");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  const handleReject = () => {
    if (!confirm("Refuser cette demande ?")) return;
    startTransition(async () => {
      try {
        await rejectJoinRequest(requestId);
        toast.success("Demande refusée");
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  return (
    <div className="flex gap-2 pt-2">
      <Button onClick={handleAccept} disabled={isPending || !canAccept} size="sm">
        {isPending ? "..." : canAccept ? "Accepter" : "En attente paiement"}
      </Button>
      <Button onClick={handleReject} disabled={isPending} size="sm" variant="outline">
        Refuser
      </Button>
    </div>
  );
}