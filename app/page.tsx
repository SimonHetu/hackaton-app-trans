import { UserButton } from "@clerk/nextjs";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function Home() {
  const user = await getCurrentUser();
  const isSignedIn = Boolean(user);
  const canCreateTournament = user?.role === "ORGANIZER" || user?.role === "ADMIN";

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <Link href="/" className="text-lg font-semibold">
            Ligues Sportives Tofu
          </Link>
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/teams" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
                Equipes
              </Link>
              <Link href="/profile" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
                Profil
              </Link>
              <Link href="/cart" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
                Panier
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/sign-in" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Creer un compte
              </Link>
            </div>
          )}
        </header>

        <section className="flex flex-1 flex-col justify-center gap-6 py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">Hackathon</p>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">
              Ligues Sportives Tofu
            </h1>
            <p className="text-lg leading-8 text-zinc-600">
              Crée des tournois, organise les équipes, réserve les places disponibles et suis les inscriptions
              de ta ligue communautaire au même endroit.
            </p>
          </div>

          {isSignedIn ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/teams"
                className="inline-flex h-11 w-fit items-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Magasiner les equipes
              </Link>
              <Link
                href="/profile"
                className="inline-flex h-11 w-fit items-center rounded-md border border-zinc-300 px-5 text-sm font-medium hover:bg-zinc-100"
              >
                Completer mon profil
              </Link>
              {canCreateTournament && (
                <Link
                  href="/tournaments"
                  className="inline-flex h-11 w-fit items-center rounded-md border border-zinc-300 px-5 text-sm font-medium hover:bg-zinc-100"
                >
                  Mes tournois
                </Link>
              )}
              <Link
                href="/cart"
                className="inline-flex h-11 w-fit items-center rounded-md border border-zinc-300 px-5 text-sm font-medium hover:bg-zinc-100"
              >
                Voir mon panier
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="inline-flex h-11 items-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Commencer
              </Link>
              <Link
                href="/sign-in"
                className="inline-flex h-11 items-center rounded-md border border-zinc-300 px-5 text-sm font-medium hover:bg-zinc-100"
              >
                J&apos;ai deja un compte
              </Link>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
