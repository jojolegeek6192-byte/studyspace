"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const LEVELS = [
  { group: "Collège", options: ["6e", "5e", "4e", "3e"] },
  { group: "Lycée", options: ["Seconde", "Première", "Terminale"] },
  { group: "Études supérieures", options: ["BTS", "BUT", "Licence", "Master", "Autre"] },
];

const DEFAULT_SUBJECTS = [
  { name: "Français", color: "#f97316", icon: "book" },
  { name: "Mathématiques", color: "#3b82f6", icon: "calculator" },
  { name: "Physique-Chimie", color: "#8b5cf6", icon: "flask" },
  { name: "SVT", color: "#22c55e", icon: "leaf" },
  { name: "Anglais", color: "#ef4444", icon: "globe" },
];

type Subject = { name: string; color: string; icon: string };

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [level, setLevel] = useState<string | null>(null);
  const [subjects, setSubjects] = useState<Subject[]>(DEFAULT_SUBJECTS);
  const [yearStructure, setYearStructure] = useState<"trimestres" | "semestres">("trimestres");
  const [notifPrefs, setNotifPrefs] = useState({
    homework: true,
    evaluations: true,
    courses: false,
    overdueTasks: true,
  });
  const [saving, setSaving] = useState(false);

  const steps = ["Bienvenue", "Niveau", "Matières", "Année", "Notifications"];

  function addSubject() {
    setSubjects([...subjects, { name: "Nouvelle matière", color: "#6366f1", icon: "book" }]);
  }
  function updateSubject(i: number, patch: Partial<Subject>) {
    setSubjects(subjects.map((s, idx) => (idx === i ? { ...s, ...patch } : s)));
  }
  function removeSubject(i: number) {
    setSubjects(subjects.filter((_, idx) => idx !== i));
  }

  async function finish() {
    setSaving(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ level, yearStructure, subjects, notifPrefs }),
    });
    router.push("/dashboard");
    router.refresh();
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="card w-full max-w-xl p-8">
        <div className="flex gap-1 mb-8">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? "bg-[var(--accent)]" : "bg-[var(--border)]"}`}
            />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Bienvenue sur StudySpace 👋</h1>
            <p className="text-muted">Configurons ton espace étudiant en quelques minutes.</p>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <h1 className="text-2xl font-semibold">Quel est ton niveau ?</h1>
            {LEVELS.map((group) => (
              <div key={group.group}>
                <p className="text-sm text-muted mb-2">{group.group}</p>
                <div className="flex flex-wrap gap-2">
                  {group.options.map((opt) => (
                    <button
                      key={opt}
                      onClick={() => setLevel(opt)}
                      className={`px-4 py-2 rounded-full border text-sm ${
                        level === opt
                          ? "bg-[var(--accent)] text-white border-transparent"
                          : "border-[var(--border)]"
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Tes matières</h1>
            <p className="text-muted text-sm">Modifie, renomme, ajoute ou supprime librement.</p>
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {subjects.map((s, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="color"
                    value={s.color}
                    onChange={(e) => updateSubject(i, { color: e.target.value })}
                    className="w-8 h-8 rounded-lg border-0 bg-transparent cursor-pointer"
                  />
                  <input
                    value={s.name}
                    onChange={(e) => updateSubject(i, { name: e.target.value })}
                    className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-transparent"
                  />
                  <button onClick={() => removeSubject(i)} className="text-muted hover:text-red-500 px-2">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <button onClick={addSubject} className="text-sm text-[var(--accent)] font-medium">
              + Ajouter une matière
            </button>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Comment fonctionne ton année ?</h1>
            <div className="flex gap-2">
              {(["trimestres", "semestres"] as const).map((opt) => (
                <button
                  key={opt}
                  onClick={() => setYearStructure(opt)}
                  className={`px-4 py-2 rounded-full border text-sm capitalize ${
                    yearStructure === opt
                      ? "bg-[var(--accent)] text-white border-transparent"
                      : "border-[var(--border)]"
                  }`}
                >
                  {opt === "trimestres" ? "3 trimestres" : "2 semestres"}
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-4">
            <h1 className="text-2xl font-semibold">Rappels</h1>
            <p className="text-muted text-sm">Tu pourras modifier ces réglages plus tard.</p>
            {[
              { key: "homework", label: "Devoirs" },
              { key: "evaluations", label: "Évaluations" },
              { key: "courses", label: "Cours" },
              { key: "overdueTasks", label: "Tâches en retard" },
            ].map((item) => (
              <label key={item.key} className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={(notifPrefs as any)[item.key]}
                  onChange={(e) =>
                    setNotifPrefs({ ...notifPrefs, [item.key]: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                {item.label}
              </label>
            ))}
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setStep(Math.max(0, step - 1))}
            className={`px-4 py-2 rounded-full text-sm ${step === 0 ? "invisible" : "card"}`}
          >
            Retour
          </button>
          {step < steps.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={step === 1 && !level}
              className="px-5 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-50"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={finish}
              disabled={saving}
              className="px-5 py-2 rounded-full bg-[var(--accent)] text-white text-sm font-medium disabled:opacity-60"
            >
              {saving ? "Configuration..." : "C'est parti 🚀"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
