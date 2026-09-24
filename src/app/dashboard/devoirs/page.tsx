"use client";

import { useEffect, useState } from "react";

type Subject = { id: string; name: string; color: string };
type Task = { id: string; title: string; completed: boolean };
type Homework = {
  id: string;
  subjectId: string;
  subject: Subject;
  title: string;
  type: string;
  dueDate: string;
  priority: "normal" | "important" | "urgent";
  status: "todo" | "in_progress" | "done";
  tasks: Task[];
};

const TYPES = ["Devoir", "Évaluation", "Leçon", "Révision", "Projet", "Oral", "TP", "Autre"];
const PRIORITY_STYLE: Record<string, string> = {
  urgent: "bg-red-500/15 text-red-500",
  important: "bg-orange-500/15 text-orange-500",
  normal: "bg-green-500/15 text-green-500",
};

export default function DevoirsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [items, setItems] = useState<Homework[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    subjectId: "",
    title: "",
    type: "Devoir",
    dueDate: new Date().toISOString().slice(0, 10),
    priority: "normal" as const,
  });

  async function load() {
    const [s, h] = await Promise.all([
      fetch("/api/subjects").then((r) => r.json()),
      fetch("/api/homework").then((r) => r.json()),
    ]);
    setSubjects(s);
    setItems(h);
    setLoading(false);
    if (s.length > 0) setForm((f) => ({ ...f, subjectId: f.subjectId || s[0].id }));
  }

  useEffect(() => {
    load();
  }, []);

  async function addHomework(e: React.FormEvent) {
    e.preventDefault();
    await fetch("/api/homework", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({ ...form, title: "" });
    setShowForm(false);
    load();
  }

  async function toggleStatus(item: Homework) {
    const status = item.status === "done" ? "todo" : "done";
    await fetch(`/api/homework/${item.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    load();
  }

  async function toggleTask(task: Task) {
    await fetch(`/api/homework-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !task.completed }),
    });
    load();
  }

  async function remove(id: string) {
    await fetch(`/api/homework/${id}`, { method: "DELETE" });
    load();
  }

  if (loading) return <p className="text-muted">Chargement...</p>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">📝 Cahier de texte</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium"
        >
          + Ajouter
        </button>
      </div>

      {showForm && (
        <form onSubmit={addHomework} className="card p-5 grid sm:grid-cols-2 gap-3">
          <input
            required placeholder="Titre"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent sm:col-span-2"
          />
          <select
            value={form.subjectId}
            onChange={(e) => setForm({ ...form, subjectId: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          >
            {subjects.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
          <select
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          >
            {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <input
            type="date"
            value={form.dueDate}
            onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          />
          <select
            value={form.priority}
            onChange={(e) => setForm({ ...form, priority: e.target.value as any })}
            className="px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
          >
            <option value="normal">🟢 Normal</option>
            <option value="important">🟠 Important</option>
            <option value="urgent">🔴 Urgent</option>
          </select>
          <button className="px-4 py-2 rounded-lg bg-[var(--accent)] text-white text-sm font-medium sm:col-span-2">
            Enregistrer
          </button>
        </form>
      )}

      {items.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="mb-1">📝 Rien dans ton cahier de texte.</p>
          <p className="text-sm text-muted">Ajoute ton premier devoir pour commencer.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item) => {
            const progress = item.tasks.length > 0
              ? Math.round((item.tasks.filter((t) => t.completed).length / item.tasks.length) * 100)
              : null;
            return (
              <div key={item.id} className={`card p-4 ${item.status === "done" ? "opacity-60" : ""}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={item.status === "done"}
                      onChange={() => toggleStatus(item)}
                      className="w-5 h-5 mt-0.5"
                    />
                    <div>
                      <p className={`font-medium ${item.status === "done" ? "line-through" : ""}`}>{item.title}</p>
                      <p className="text-xs text-muted">
                        {item.subject.name} · {item.type} · {new Date(item.dueDate).toLocaleDateString("fr-FR")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2 py-1 rounded-full ${PRIORITY_STYLE[item.priority]}`}>
                      {item.priority}
                    </span>
                    <button onClick={() => remove(item.id)} className="text-muted hover:text-red-500">✕</button>
                  </div>
                </div>
                {item.tasks.length > 0 && (
                  <div className="mt-3 pl-8">
                    <ul className="space-y-1">
                      {item.tasks.map((t) => (
                        <li key={t.id} className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={t.completed}
                            onChange={() => toggleTask(t)}
                            className="w-4 h-4"
                          />
                          <span className={t.completed ? "line-through text-muted" : ""}>{t.title}</span>
                        </li>
                      ))}
                    </ul>
                    {progress !== null && (
                      <div className="h-1.5 bg-[var(--surface-2)] rounded-full mt-2 overflow-hidden">
                        <div className="h-full bg-[var(--accent)]" style={{ width: `${progress}%` }} />
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
