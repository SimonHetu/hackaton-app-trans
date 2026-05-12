"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { playerProfileSchema } from "@/server/validations/player-profile";
import { upsertPlayerProfile } from "@/server/actions/player-profile";

type FormValues = z.input<typeof playerProfileSchema>;

export function ProfileForm({ defaultValues }: { defaultValues: FormValues }) {
  const [isPending, startTransition] = useTransition();
  const { register, handleSubmit, setValue, watch, formState: { errors } } =
    useForm<FormValues>({
      resolver: zodResolver(playerProfileSchema),
      defaultValues,
    });

  const onSubmit = (data: FormValues) => {
    startTransition(async () => {
      try {
        await upsertPlayerProfile(data as never);
        toast.success("Profil mis à jour");
      } catch {
        toast.error("Erreur");
      }
    });
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input id="city" {...register("city")} />
            {errors.city && <p className="text-sm text-red-500 mt-1">{errors.city.message}</p>}
          </div>
          <div>
            <Label htmlFor="favoriteSport">Sport préféré</Label>
            <Input id="favoriteSport" {...register("favoriteSport")} placeholder="Football, Basketball..." />
            {errors.favoriteSport && <p className="text-sm text-red-500 mt-1">{errors.favoriteSport.message}</p>}
          </div>
          <div>
            <Label>Niveau</Label>
            <Select
              value={watch("level") ?? "BEGINNER"}
              onValueChange={(v) => setValue("level", v as "BEGINNER" | "INTERMEDIATE" | "ADVANCED")}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="BEGINNER">Débutant</SelectItem>
                <SelectItem value="INTERMEDIATE">Intermédiaire</SelectItem>
                <SelectItem value="ADVANCED">Avancé</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="position">Poste préféré (optionnel)</Label>
            <Input id="position" {...register("position")} placeholder="Attaquant, Gardien..." />
          </div>
          <Button type="submit" disabled={isPending} className="w-full">
            {isPending ? "Sauvegarde..." : "Sauvegarder"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}