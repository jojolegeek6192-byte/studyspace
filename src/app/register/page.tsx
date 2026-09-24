"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error || "Une erreur est survenue.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });
    setLoading(false);
    if (signInRes?.error) {
      setError("Compte créé, mais la connexion automatique a échoué. Connecte-toi manuellement.");
      return;
    }
    router.push("/onboarding");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6">
      <form onSubmit={handleSubmit} className="card w-full max-w-sm p-8 space-y-4">
        <h1 className="text-2xl font-semibold">Crée ton espace 🎓</h1>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <label className="text-sm text-muted">Prénom</label>
            <input
              required
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm text-muted">Nom</label>
            <input
              required
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm text-muted">Mot de passe (8 caractères min.)</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          />
        </div>
        <button
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-[var(--accent)] text-white font-medium disabled:opacity-60"
        >
          {loading ? "Création..." : "Créer mon compte"}
        </button>
        <p className="text-sm text-muted text-center">
          Déjà un compte ? <Link href="/login" className="text-[var(--accent)]">Connecte-toi</Link>
        </p>
      </form>
    </main>
  );
}
