import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { average } from "@/lib/grades";
import Link from "next/link";

export default async function DashboardPage() {
  const session = await auth();
  const userId = (session!.user as any).id as string;

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { firstName: true, weightedAverage: true },
  });

  const [grades, homework] = await Promise.all([
    prisma.grade.findMany({ where: { userId }, orderBy: { date: "asc" } }),
    prisma.homework.findMany({
      where: { userId, status: { not: "done" } },
      include: { subject: true },
      orderBy: { dueDate: "asc" },
      take: 6,
    }),
  ]);

  const currentAvg = average(grades, user.weightedAverage);

  // Moyenne "avant la dernière note" pour calculer une tendance simple
  const previousAvg =
    grades.length > 1 ? average(grades.slice(0, -1), user.weightedAverage) : null;
  const trend = currentAvg !== null && previousAvg !== null ? currentAvg - previousAvg : null;

  const allHomework = await prisma.homework.findMany({ where: { userId } });
  const doneCount = allHomework.filter((h) => h.status === "done").length;
  const progress = allHomework.length > 0 ? Math.round((doneCount / allHomework.length) * 100) : 0;

  const nextEval = homework.find((h) => h.type === "Évaluation");

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold">Bonjour {user.firstName} ! 👋</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card p-5">
          <p className="text-sm text-muted mb-1">Moyenne générale</p>
          <p className="text-3xl font-semibold">
            {currentAvg !== null ? currentAvg.toFixed(1) : "—"} <span className="text-lg text-muted">/20</span>
          </p>
          {trend !== null && (
            <p className={`text-sm mt-1 ${trend >= 0 ? "text-green-500" : "text-red-500"}`}>
              {trend >= 0 ? "+" : ""}
              {trend.toFixed(1)} {trend >= 0 ? "↑" : "↓"}
            </p>
          )}
        </div>

        <div className="card p-5">
          <p className="text-sm text-muted mb-1">Progression</p>
          <p className="text-3xl font-semibold">{progress}%</p>
          <p className="text-sm text-muted mt-1">devoirs terminés</p>
        </div>

        <div className="card p-5">
          <p className="text-sm text-muted mb-1">Prochaine évaluation</p>
          {nextEval ? (
            <>
              <p className="font-medium">{nextEval.subject.name}</p>
              <p className="text-sm text-muted">{nextEval.title}</p>
            </>
          ) : (
            <p className="text-sm text-muted">Aucune à venir</p>
          )}
        </div>

        <div className="card p-5">
          <p className="text-sm text-muted mb-1">Notes enregistrées</p>
          <p className="text-3xl font-semibold">{grades.length}</p>
        </div>
      </div>

      <div className="card p-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold">📝 À faire</h2>
          <Link href="/dashboard/devoirs" className="text-sm text-[var(--accent)]">Tout voir</Link>
        </div>
        {homework.length === 0 ? (
          <p className="text-sm text-muted">Rien à faire pour le moment — profite-en 🎉</p>
        ) : (
          <ul className="space-y-2">
            {homework.map((h) => (
              <li key={h.id} className="flex items-center justify-between py-2 border-b border-[var(--border)] last:border-0">
                <div>
                  <p className="font-medium text-sm">{h.title}</p>
                  <p className="text-xs text-muted">{h.subject.name} · {new Date(h.dueDate).toLocaleDateString("fr-FR")}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    h.priority === "urgent"
                      ? "bg-red-500/15 text-red-500"
                      : h.priority === "important"
                      ? "bg-orange-500/15 text-orange-500"
                      : "bg-green-500/15 text-green-500"
                  }`}
                >
                  {h.priority}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
