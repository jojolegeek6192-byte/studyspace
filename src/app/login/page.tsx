"use client";

import { Suspense, useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    setLoading(false);
    if (res?.error) {
      setError("Email ou mot de passe incorrect.");
      return;
    }
    router.push(params.get("callbackUrl") || "/dashboard");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card w-full max-w-sm p-8 space-y-4">
      <h1 className="text-2xl font-semibold">Content de te revoir 👋</h1>
      {error && <p className="text-sm text-red-500">{error}</p>}
      <div className="space-y-1">
        <label className="text-sm text-muted">Email</label>
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
        />
      </div>
      <div className="space-y-1">
        <label className="text-sm text-muted">Mot de passe</label>
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
        />
      </div>
      <button
        disabled={loading}
        className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium disabled:opacity-60"
      >
        {loading ? "Connexion..." : "Se connecter"}
      </button>
      <p className="text-sm text-muted text-center">
        Pas encore de compte ?{" "}
        <Link href="/register" className="text-[var(--accent)]">Inscris-toi</Link>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <Suspense fallback={<div className="card w-full max-w-sm p-8 text-center text-muted">Chargement...</div>}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
