import { SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import Link from "next/link";

export default async function Home() {
  const { userId } = await auth();
  const isSignedIn = Boolean(userId);

  return (
    <main className="min-h-screen bg-zinc-50 text-zinc-950">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-6 py-8">
        <header className="flex items-center justify-between border-b border-zinc-200 pb-4">
          <Link href="/" className="text-lg font-semibold">
            Ligues Sportives
          </Link>
          {isSignedIn ? (
            <div className="flex items-center gap-4">
              <Link href="/profile" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
                Profil
              </Link>
              <Link href="/dashboard" className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
                Dashboard
              </Link>
              <UserButton />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <SignInButton mode="modal">
                <button className="text-sm font-medium text-zinc-700 hover:text-zinc-950">
                  Connexion
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <button className="rounded-md bg-zinc-950 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800">
                  Creer un compte
                </button>
              </SignUpButton>
            </div>
          )}
        </header>

        <section className="flex flex-1 flex-col justify-center gap-6 py-16">
          <p className="text-sm font-medium uppercase tracking-wide text-zinc-500">Hackathon</p>
          <div className="max-w-2xl space-y-4">
            <h1 className="text-4xl font-semibold sm:text-5xl">
              Gestion de ligues sportives communautaires
            </h1>
            <p className="text-lg leading-8 text-zinc-600">
              Authentification Clerk active, synchronisation utilisateur en base et routes privees protegees.
            </p>
          </div>

          {isSignedIn ? (
            <div className="flex flex-wrap gap-3">
              <Link
                href="/profile"
                className="inline-flex h-11 w-fit items-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800"
              >
                Completer mon profil
              </Link>
              <Link
                href="/dashboard"
                className="inline-flex h-11 w-fit items-center rounded-md border border-zinc-300 px-5 text-sm font-medium hover:bg-zinc-100"
              >
                Ouvrir le dashboard
              </Link>
            </div>
          ) : (
            <div className="flex flex-wrap gap-3">
              <SignUpButton mode="modal">
                <button className="inline-flex h-11 items-center rounded-md bg-zinc-950 px-5 text-sm font-medium text-white hover:bg-zinc-800">
                  Commencer
                </button>
              </SignUpButton>
              <SignInButton mode="modal">
                <button className="inline-flex h-11 items-center rounded-md border border-zinc-300 px-5 text-sm font-medium hover:bg-zinc-100">
                  J&apos;ai deja un compte
                </button>
              </SignInButton>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
