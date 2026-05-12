import { requireAuth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ProfileForm } from "./profile-form";

export default async function ProfilePage() {
  const user = await requireAuth();

  const profile = await prisma.playerProfile.findUnique({
    where: { userId: user.id },
  });

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Mon profil</h1>
      <ProfileForm
        defaultValues={{
          fullName: user.fullName,
          city: profile?.city ?? "",
          favoriteSport: profile?.favoriteSport ?? "",
          level: profile?.level ?? "BEGINNER",
          position: profile?.position ?? "",
        }}
      />
    </div>
  );
}