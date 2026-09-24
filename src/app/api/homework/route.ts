import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({
  subjectId: z.string(),
  title: z.string().min(1).max(120),
  description: z.string().optional(),
  type: z.string().default("Devoir"),
  dueDate: z.string(),
  dueTime: z.string().optional(),
  priority: z.enum(["normal", "important", "urgent"]).default("normal"),
  tasks: z.array(z.string().min(1)).optional(),
});

export async function GET() {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  const homework = await prisma.homework.findMany({
    where: { userId },
    include: { subject: true, tasks: true },
    orderBy: { dueDate: "asc" },
  });
  return NextResponse.json(homework);
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

  const subject = await prisma.subject.findFirst({ where: { id: data.subjectId, userId } });
  if (!subject) return NextResponse.json({ error: "Matière introuvable" }, { status: 404 });

  const homework = await prisma.homework.create({
    data: {
      userId,
      subjectId: data.subjectId,
      title: data.title,
      description: data.description,
      type: data.type,
      dueDate: new Date(data.dueDate),
      dueTime: data.dueTime,
      priority: data.priority,
      tasks: data.tasks
        ? { create: data.tasks.map((title, order) => ({ title, order })) }
        : undefined,
    },
    include: { tasks: true, subject: true },
  });

  return NextResponse.json(homework, { status: 201 });
}
