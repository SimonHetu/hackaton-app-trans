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
import { teamSchema } from "@/server/validations/team";
import { createTeam } from "@/server/actions/teams";

type FormValues = z.input<typeof teamSchema>;

export function CreateTeamForm({ tournamentId }: { tournamentId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(teamSchema),
    defaultValues: { name: "", tournamentId, maxCapacity: 15 },
  });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await createTeam(data as never);
        toast.success("Équipe créée !");
        reset({ name: "", tournamentId, maxCapacity: 15 });
        router.refresh();
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Erreur");
      }
    });
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <input type="hidden" {...register("tournamentId")} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <Label htmlFor="name" className="mb-2 block">Nom de l&apos;équipe</Label>
          <Input id="name" {...register("name")} placeholder="Les Lions" />
          {errors.name && <p className="text-sm text-red-500 mt-1">{errors.name.message}</p>}
        </div>
        <div>
          <Label htmlFor="maxCapacity" className="mb-2 block">Capacité max</Label>
          <Input id="maxCapacity" type="number" min="2" max="50" {...register("maxCapacity")} />
          {errors.maxCapacity && <p className="text-sm text-red-500 mt-1">{errors.maxCapacity.message}</p>}
        </div>
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? "Création..." : "Créer l'équipe"}
      </Button>
    </form>
  );
}