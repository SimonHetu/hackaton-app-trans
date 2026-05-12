"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";

export function TeamsFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const city = form.get("city")?.toString().trim();
    const sport = form.get("sport")?.toString().trim();
    const available = form.get("available") === "on";
    if (city) params.set("city", city);
    if (sport) params.set("sport", sport);
    if (available) params.set("available", "true");
    startTransition(() => router.push(`/teams?${params.toString()}`));
  };

  const reset = () => startTransition(() => router.push("/teams"));

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-wrap items-end gap-4 p-4 border rounded-lg bg-card"
    >
      <div className="flex-1 min-w-[150px]">
        <Label htmlFor="city" className="mb-2 block">Ville</Label>
        <Input id="city" name="city" defaultValue={searchParams.get("city") ?? ""} />
      </div>
      <div className="flex-1 min-w-[150px]">
        <Label htmlFor="sport" className="mb-2 block">Sport</Label>
        <Input id="sport" name="sport" defaultValue={searchParams.get("sport") ?? ""} />
      </div>
      <div className="flex items-center gap-2 pb-2">
        <Checkbox
          id="available"
          name="available"
          defaultChecked={searchParams.get("available") === "true"}
        />
        <Label htmlFor="available" className="cursor-pointer">
          Places dispo
        </Label>
      </div>
      <div className="flex gap-2">
        <Button type="submit" disabled={isPending}>
          Filtrer
        </Button>
        <Button type="button" variant="outline" onClick={reset} disabled={isPending}>
          Réinitialiser
        </Button>
      </div>
    </form>
  );
}