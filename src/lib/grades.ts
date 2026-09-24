export type GradeLike = {
  normalizedOn20: number;
  coefficient: number;
  subjectId: string;
  period: string;
  date: Date | string;
};

/** Convertit n'importe quel barème vers /20. */
export function normalizeTo20(value: number, maxValue: number): number {
  if (maxValue <= 0) return 0;
  return Math.round((value / maxValue) * 20 * 100) / 100;
}

/** Moyenne (pondérée ou simple) d'une liste de notes. */
export function average(grades: GradeLike[], weighted: boolean): number | null {
  if (grades.length === 0) return null;
  if (!weighted) {
    const sum = grades.reduce((acc, g) => acc + g.normalizedOn20, 0);
    return round1(sum / grades.length);
  }
  const totalCoef = grades.reduce((acc, g) => acc + g.coefficient, 0);
  if (totalCoef === 0) return null;
  const sum = grades.reduce((acc, g) => acc + g.normalizedOn20 * g.coefficient, 0);
  return round1(sum / totalCoef);
}

/** Moyenne par matière : { subjectId: moyenne } */
export function averageBySubject(grades: GradeLike[], weighted: boolean) {
  const bySubject = groupBy(grades, (g) => g.subjectId);
  const result: Record<string, number | null> = {};
  for (const [subjectId, list] of Object.entries(bySubject)) {
    result[subjectId] = average(list, weighted);
  }
  return result;
}

/** Moyenne par période (trimestre/semestre). */
export function averageByPeriod(grades: GradeLike[], weighted: boolean) {
  const byPeriod = groupBy(grades, (g) => g.period);
  const result: Record<string, number | null> = {};
  for (const [period, list] of Object.entries(byPeriod)) {
    result[period] = average(list, weighted);
  }
  return result;
}

/** Calcule la note nécessaire à la prochaine évaluation pour atteindre un objectif. */
export function neededGrade(
  currentGrades: GradeLike[],
  weighted: boolean,
  target: number,
  nextCoefficient: number
): number | null {
  if (nextCoefficient <= 0) return null;
  if (currentGrades.length === 0) return target;

  if (!weighted) {
    const sum = currentGrades.reduce((acc, g) => acc + g.normalizedOn20, 0);
    const n = currentGrades.length;
    const needed = target * (n + 1) - sum;
    return round1(needed);
  }
  const totalCoef = currentGrades.reduce((acc, g) => acc + g.coefficient, 0);
  const sum = currentGrades.reduce((acc, g) => acc + g.normalizedOn20 * g.coefficient, 0);
  const needed = (target * (totalCoef + nextCoefficient) - sum) / nextCoefficient;
  return round1(needed);
}

function round1(n: number) {
  return Math.round(n * 10) / 10;
}

function groupBy<T, K extends string | number>(arr: T[], keyFn: (item: T) => K): Record<K, T[]> {
  return arr.reduce((acc, item) => {
    const key = keyFn(item);
    (acc[key] ||= []).push(item);
    return acc;
  }, {} as Record<K, T[]>);
}
