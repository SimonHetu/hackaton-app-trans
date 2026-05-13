"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { tournamentSchema } from "@/server/validations/tournament";
import { createTournament, updateTournament } from "@/server/actions/tournaments";

type FormValues = z.input<typeof tournamentSchema>;

type TournamentFormProps = {
  mode?: "create" | "edit";
  tournamentId?: string;
  defaultValues?: FormValues;
};

function formatDateInputValue(value: Date | string) {
  return new Date(value).toISOString().slice(0, 10);
}

export function TournamentForm({
  mode = "create",
  tournamentId,
  defaultValues,
}: TournamentFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEdit = mode === "edit";
  const initialValues = defaultValues
    ? {
        ...defaultValues,
        startDate: formatDateInputValue(defaultValues.startDate as Date | string),
      }
    : {
        name: "",
        sport: "",
        city: "",
        startDate: formatDateInputValue(new Date()),
        entryFee: 0,
        currency: "CAD",
      };

  const { register, handleSubmit, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: initialValues,
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        if (isEdit) {
          if (!tournamentId) throw new Error("Tournoi introuvable");
          await updateTournament(tournamentId, data as never);
          toast.success("Tournoi mis a jour !");
          router.refresh();
          return;
        }

        await createTournament(data as never);
        toast.success("Tournoi cree !");
        router.push("/tournaments");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="name" className="mb-2 block">Nom du tournoi</Label>
            <Input id="name" {...register("name")} placeholder="Tournoi Été MTL" />
            {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <Label htmlFor="sport" className="mb-2 block">Sport</Label>
            <Input id="sport" {...register("sport")} placeholder="Football, Basketball..." />
            {errors.sport && <p className="text-sm text-red-500 mt-1">{errors.sport.message}</p>}
          </div>

          <div>
            <Label htmlFor="city" className="mb-2 block">Ville</Label>
            <Input id="city" {...register("city")} placeholder="Montréal" />
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
          </div>

          <div>
            <Label htmlFor="startDate" className="mb-2 block">Date de début</Label>
            <Input id="startDate" type="date" {...register("startDate")} />
            {errors.startDate && <p className="text-sm text-red-500 mt-1">{errors.startDate.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="entryFee" className="mb-2 block">Frais d&apos;inscription ($)</Label>
              <Input id="entryFee" type="number" step="0.01" min="0" {...register("entryFee")} />
              <p className="text-xs text-muted-foreground mt-1">0 = gratuit</p>
              {errors.entryFee && <p className="text-sm text-red-500 mt-1">{errors.entryFee.message}</p>}
            </div>
            <div>
              <Label htmlFor="currency" className="mb-2 block">Devise</Label>
              <Input id="currency" {...register("currency")} maxLength={3} />
              {errors.currency && <p className="text-sm text-red-500 mt-1">{errors.currency.message}</p>}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="submit" disabled={isPending} className="flex-1">
              {isPending
                ? isEdit ? "Mise a jour..." : "Creation..."
                : isEdit ? "Mettre a jour le tournoi" : "Creer le tournoi"}
            </Button>
            {!isEdit && (
              <Button type="button" variant="outline" onClick={() => router.push("/tournaments")}>
                Annuler
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
