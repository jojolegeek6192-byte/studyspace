import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  title: z.string().min(1).max(120).optional(),
  description: z.string().nullable().optional(),
  dueDate: z.string().optional(),
  dueTime: z.string().nullable().optional(),
  priority: z.enum(["normal", "important", "urgent"]).optional(),
  status: z.enum(["todo", "in_progress", "done"]).optional(),
});

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const existing = await prisma.homework.findFirst({ where: { id: id, userId } });
  if (!existing) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  const { dueDate, ...rest } = parsed.data;

  const homework = await prisma.homework.update({
    where: { id: id },
    data: { ...rest, dueDate: dueDate ? new Date(dueDate) : undefined },
    include: { tasks: true, subject: true },
  });

  return NextResponse.json(homework);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const result = await prisma.homework.deleteMany({ where: { id: id, userId } });
  if (result.count === 0) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  return NextResponse.json({ ok: true });
}
