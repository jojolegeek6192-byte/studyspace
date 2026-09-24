import Link from "next/link";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = await auth();
  if (session?.user) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-4">
        Toute ta vie scolaire,<br />au même endroit.
      </h1>
      <p className="text-muted max-w-lg mb-8">
        Notes, moyennes, devoirs, emploi du temps et statistiques dans un seul espace,
        pensé pour le collège, le lycée et les études supérieures.
      </p>
      <div className="flex gap-3">
        <Link href="/register" className="px-6 py-3 rounded-full bg-[var(--accent)] text-white font-medium">
          Créer mon espace
        </Link>
        <Link href="/login" className="px-6 py-3 rounded-full card font-medium">
          Se connecter
        </Link>
      </div>
    </main>
  );
}
