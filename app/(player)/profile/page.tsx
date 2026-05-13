import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentPlayerProfile } from "@/server/actions/player-profile";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const { user, playerProfile } = await getCurrentPlayerProfile();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold mb-1">Mon profil</h1>
          <p className="text-gray-500">{user.fullName} — {user.email}</p>
        </div>
        <Button asChild variant="outline">
          <Link href="/">Accueil</Link>
        </Button>
      </div>
      <ProfileForm
        defaultValues={{
          city: playerProfile?.city ?? "",
          favoriteSport: playerProfile?.favoriteSport ?? "",
          level: playerProfile?.level ?? "BEGINNER",
          position: playerProfile?.position ?? "",
        }}
      />
    </div>
  );
}
