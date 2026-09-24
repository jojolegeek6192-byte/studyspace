"use client";

import { useEffect, useState } from "react";

type Subject = { id: string; name: string; color: string };
type Grade = {
  id: string;
  subjectId: string;
  subject: Subject;
  value: number;
  maxValue: number;
  normalizedOn20: number;
  coefficient: number;
  type: string;
  date: string;
  period: string;
};

const TYPES = ["Contrôle", "Interrogation", "DM", "Oral", "Projet", "TP", "Participation", "Autre"];
const PERIODS = ["T1", "T2", "T3"];

export default function NotesPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    value: "",
    maxValue: "20",
    coefficient: "1",
    type: "Contrôle",
    period: "T1",
    date: new Date().toISOString().slice(0, 10),
    comment: "",
  });

  async function load() {
    const [s, g] = await Promise.all([
      fetch("/api/subjects").then((r) => r.json()),
      fetch("/api/grades").then((r) => r.json()),
    ]);
    setSubjects(s);
    setGrades(g);
    setLoading(false);
    if (s.length > 0) setForm((f) => ({ ...f, subjectId: f.subjectId || s[0].id }));
  }

  useEffect(() => {
    load();
  }, []);

  async function addGrade(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/grades", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        subjectId: form.subjectId,
        value: parseFloat(form.value),
        maxValue: parseFloat(form.maxValue),
        coefficient: parseFloat(form.coefficient),
        type: form.type,
        period: form.period,
        date: new Date(form.date).toISOString(),
        comment: form.comment || undefined,
      }),
    });
    setForm({ ...form, value: "", comment: "" });
    setShowForm(false);
    load();
  }

  async function deleteGrade(id: string) {
    await fetch(`/api/grades/${id}`, { method: "DELETE" });
    load();
  }

  const bySubject = subjects.map((s) => {
    const list = grades.filter((g) => g.subjectId === s.id);
    const totalCoef = list.reduce((a, g) => a + g.coefficient, 0);
    const avg = totalCoef > 0 ? list.reduce((a, g) => a + g.normalizedOn20 * g.coefficient, 0) / totalCoef : null;
    return { subject: s, grades: list, avg };
  });

  if (loading) return <p className="text-muted">Chargement...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">📊 Mes notes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium"
        >
          + Ajouter une note
        </button>
      </div>

      {showForm && (
        <form onSubmit={addGrade} className="card p-5 grid sm:grid-cols-3 gap-3">
          <select
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          >
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>
          <input
            type="number" step="0.01" required placeholder="Note"
            value={form.value}
            onChange={(e) => setForm({ ...form, value: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          />
          <select
            value={form.maxValue}
            onChange={(e) => setForm({ ...form, maxValue: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          >
            {["5", "10", "20"].map((v) => <option key={v} value={v}>/{v}</option>)}
          </select>
          <input
            type="number" step="0.5" min="0" placeholder="Coefficient"
            value={form.coefficient}
            onChange={(e) => setForm({ ...form, coefficient: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          />
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select
            value={form.period}
            onChange={(e) => setForm({ ...form, period: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          >
            {PERIODS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <input
            type="date"
            value={form.date}
            onChange={(e) => setForm({ ...form, date: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          />
          <input
            placeholder="Commentaire (optionnel)"
            value={form.comment}
            onChange={(e) => setForm({ ...form, comment: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent sm:col-span-2"
          />
          <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium">
            Enregistrer
          </button>
        </form>
      )}

      {grades.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="mb-1">📊 Aucune note pour le moment.</p>
          <p className="text-sm text-muted">Ajoute ta première note pour commencer à suivre ta moyenne.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {bySubject.filter((b) => b.grades.length > 0).map(({ subject, grades: list, avg }) => (
            <div key={subject.id} className="card p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full" style={{ background: subject.color }} />
                  <h3 className="font-medium">{subject.name}</h3>
                </div>
                <span className="font-semibold">{avg !== null ? avg.toFixed(1) : "—"}/20</span>
              </div>
              <ul className="space-y-1">
                {list.map((g) => (
                  <li key={g.id} className="flex items-center justify-between text-sm py-1.5 border-t border-[var(--border)]">
                    <span className="text-muted">
                      {g.type} · {new Date(g.date).toLocaleDateString("fr-FR")} · coef {g.coefficient}
                    </span>
                    <div className="flex items-center gap-3">
                      <span>{g.value}/{g.maxValue} <span className="text-muted">({g.normalizedOn20.toFixed(1)}/20)</span></span>
                      <button onClick={() => deleteGrade(g.id)} className="text-muted hover:text-red-500">✕</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
