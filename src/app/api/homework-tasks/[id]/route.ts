import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const schema = z.object({ completed: z.boolean() });

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  const userId = (session.user as any).id as string;

  // On vérifie que la tâche appartient à un devoir de cet utilisateur
  const task = await prisma.homeworkTask.findFirst({
    where: { id: id, homework: { userId } },
  });
  if (!task) return NextResponse.json({ error: "Introuvable" }, { status: 404 });

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Requête invalide" }, { status: 400 });

  const updated = await prisma.homeworkTask.update({
    where: { id: id },
    data: { completed: parsed.data.completed },
  });

  return NextResponse.json(updated);
}
