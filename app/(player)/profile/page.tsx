import { getCurrentPlayerProfile } from "@/server/actions/player-profile";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const { user, playerProfile } = await getCurrentPlayerProfile();

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-1">Mon profil</h1>
      <p className="text-gray-500 mb-6">{user.fullName} — {user.email}</p>
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