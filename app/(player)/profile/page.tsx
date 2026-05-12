import Link from "next/link";
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
      <div className="mb-6 flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Mon profil</h1>
        <Link
          href="/"
          className="inline-flex h-10 items-center rounded-md border border-zinc-300 px-4 text-sm font-medium hover:bg-zinc-100"
        >
          Retour accueil
        </Link>
      </div>
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
