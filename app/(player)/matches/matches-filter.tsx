"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

export function MatchesFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const current = searchParams.get("filter") ?? "all";

  const setFilter = (f: string) => {
    if (f === "all") router.push("/matches");
    else router.push(`/matches?filter=${f}`);
  };

  return (
    <div className="flex gap-2">
      <Button variant={current === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
        Tous
      </Button>
      <Button variant={current === "upcoming" ? "default" : "outline"} size="sm" onClick={() => setFilter("upcoming")}>
        À venir
      </Button>
      <Button variant={current === "past" ? "default" : "outline"} size="sm" onClick={() => setFilter("past")}>
        Passés
      </Button>
    </div>
  );
}