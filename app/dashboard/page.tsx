import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";

export default async function DashboardPage() {
  const user = await currentUser();
  const displayName =
    user?.fullName || user?.primaryEmailAddress?.emailAddress || "Utilisateur connecte";

  return (
    <main className="min-h-screen bg-zinc-50 px-6 py-8 text-zinc-950">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <div>
            <p className="text-sm text-zinc-500">Session active</p>
            <h1 className="text-2xl font-semibold">Dashboard</h1>
          </div>
          <UserButton />
        </header>

        <section className="rounded-md border border-zinc-200 bg-white p-6">
          <p className="text-sm font-medium text-zinc-500">Connecte avec Clerk</p>
          <h2 className="mt-2 text-xl font-semibold">{displayName}</h2>
          <p className="mt-2 text-sm text-zinc-600">
            Cette page est protegee par le middleware Clerk et servira de point de depart
            pour les prochaines fonctionnalites.
          </p>
        </section>
      </div>
    </main>
  );
}
