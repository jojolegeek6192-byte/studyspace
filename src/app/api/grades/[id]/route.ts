import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { normalizeTo20 } from "@/lib/grades";

const schema = z.object({
  value: z.number().optional(),
  maxValue: z.number().positive().optional(),
  coefficient: z.number().positive().optional(),
  type: z.string().optional(),
  date: z.string().optional(),
  period: z.string().optional(),
  comment: z.string().nullable().optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const existing = await prisma.grade.findFirst({ where: { id: id, userId } });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const data = parsed.data;

  const value = data.value ?? existing.value;
  const maxValue = data.maxValue ?? existing.maxValue;

  const grade = await prisma.grade.update({
    where: { id: id },
    data: {
      ...data,
      date: data.date ? new Date(data.date) : undefined,
      normalizedOn20: normalizeTo20(value, maxValue),
    },
  });

  return NextResponse.json(grade);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const result = await prisma.grade.deleteMany({ where: { id: id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
