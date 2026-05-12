"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { createJoinRequest } from "@/server/actions/join-requests";

type ExistingRequest = {
  id: string;
  status: "PENDING" | "ACCEPTED" | "REJECTED";
  paymentStatus: "NOT_REQUIRED" | "PENDING" | "PAID";
} | null;

export function JoinTeamButton({
  teamId,
  isMember,
  isFull,
  isPaid,
  existingRequest,
}: {
  teamId: string;
  isMember: boolean;
  isFull: boolean;
  isPaid: boolean;
  existingRequest: ExistingRequest;
}) {
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [isPending, startTransition] = useTransition();

  if (isMember) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-green-600 font-medium">✓ Tu es déjà membre de cette équipe.</p>
        </CardContent>
      </Card>
    );
  }

  if (existingRequest) {
    const statusLabels = {
      PENDING: { text: "Demande en attente", color: "text-yellow-600" },
      ACCEPTED: { text: "Demande acceptée", color: "text-green-600" },
      REJECTED: { text: "Demande refusée", color: "text-red-600" },
    };
    const { text, color } = statusLabels[existingRequest.status];

    return (
      <Card>
        <CardContent className="pt-6 space-y-2">
          <p className={`font-medium ${color}`}>{text}</p>
          {existingRequest.paymentStatus === "PENDING" && (
            <p className="text-sm text-muted-foreground">⏳ En attente de paiement.</p>
          )}
          {existingRequest.paymentStatus === "PAID" && (
            <p className="text-sm text-muted-foreground">✓ Paiement confirmé.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  if (isFull) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Cette équipe est complète.</p>
        </CardContent>
      </Card>
    );
  }

  const handleJoin = () => {
    startTransition(async () => {
      try {
        const result = await createJoinRequest({ teamId, message });
        if (result?.checkoutUrl) {
          // Tournoi payant : redirection vers Stripe
          window.location.href = result.checkoutUrl;
          return;
        }
        toast.success("Demande envoyée !");
        setShowForm(false);
        setMessage("");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur lors de l'envoi");
      }
    });
  };

  if (!showForm) {
    return (
      <Button size="lg" className="w-full" onClick={() => setShowForm(true)}>
        Rejoindre l&apos;équipe {isPaid && "(paiement requis)"}
      </Button>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envoyer une demande</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Textarea
          placeholder="Message de motivation (optionnel)..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          rows={4}
        />
        <div className="flex gap-2">
          <Button onClick={handleJoin} disabled={isPending} className="flex-1">
            {isPending ? "Envoi..." : isPaid ? "Continuer vers le paiement" : "Envoyer la demande"}
          </Button>
          <Button variant="outline" onClick={() => setShowForm(false)} disabled={isPending}>
            Annuler
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}