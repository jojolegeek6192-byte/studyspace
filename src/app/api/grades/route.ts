import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeTo20 } from "@/lib/grades";

const schema = z.object({
  subjectId: z.string(),
  value: z.number(),
  maxValue: z.number().positive().default(20),
  coefficient: z.number().positive().default(1),
  type: z.string().default("Contrôle"),
  date: z.string().datetime().or(z.string()),
  period: z.string(),
  comment: z.string().optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const grades = await prisma.grade.findMany({
    where: { userId },
    include: { subject: true },
    orderBy: { date: "desc" },
  });
  return NextResponse.json(grades);
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  // Vérifie que la matière appartient bien à l'utilisateur avant de créer la note
  const subject = await prisma.subject.findFirst({ where: { id: data.subjectId, userId } });
  if (!subject) return NextResponse.json({ error: "Matière introuvable" }, { status: 404 });

  const grade = await prisma.grade.create({
    data: {
      userId,
      subjectId: data.subjectId,
      value: data.value,
      maxValue: data.maxValue,
      normalizedOn20: normalizeTo20(data.value, data.maxValue),
      coefficient: data.coefficient,
      type: data.type,
      date: new Date(data.date),
      period: data.period,
      comment: data.comment,
    },
  });

  return NextResponse.json(grade, { status: 201 });
}
