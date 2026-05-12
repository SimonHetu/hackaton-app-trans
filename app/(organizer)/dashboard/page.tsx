import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-bold">Dashboard organisateur</h1>
      <p className="text-gray-500 mt-2">Page en construction.</p>
      <Link
        href="/profile"
        className="inline-flex h-10 items-center rounded-md bg-zinc-950 px-4 text-sm font-medium text-white hover:bg-zinc-800"
      >
        Acceder a mon profil
      </Link>
    </div>
  );
}
