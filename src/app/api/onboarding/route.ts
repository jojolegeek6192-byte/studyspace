import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const subjectSchema = z.object({
  name: z.string().min(1).max(60),
  color: z.string().default("#6366f1"),
  icon: z.string().default("book"),
});

const schema = z.object({
  level: z.string().min(1),
  yearStructure: z.enum(["trimestres", "semestres", "autre"]),
  subjects: z.array(subjectSchema).min(1).max(30),
  notifPrefs: z.object({
    homework: z.boolean(),
    evaluations: z.boolean(),
    courses: z.boolean(),
    overdueTasks: z.boolean(),
  }),
});

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { level, yearStructure, subjects, notifPrefs } = parsed.data;
  const userId = (session.user as any).id as string;

  await prisma.$transaction([
    prisma.user.update({
      where: { id: userId },
      data: {
        level,
        yearStructure: yearStructure === "autre" ? "trimestres" : yearStructure,
        onboarded: true,
      },
    }),
    prisma.subject.deleteMany({ where: { userId } }),
    prisma.subject.createMany({
      data: subjects.map((s) => ({ ...s, userId })),
    }),
    prisma.notificationPreference.upsert({
      where: { userId },
      create: { userId, ...notifPrefs },
      update: notifPrefs,
    }),
  ]);

  return NextResponse.json({ ok: true });
}
