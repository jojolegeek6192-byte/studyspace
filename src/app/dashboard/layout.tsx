import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Sidebar } from "@/components/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const user = await prisma.user.findUnique({
    where: { id: (session.user as any).id },
    select: { firstName: true, onboarded: true, accentColor: true },
  });
  if (!user) redirect("/login");
  if (!user.onboarded) redirect("/onboarding");

  return (
    <div
      className="flex"
      style={{ ["--accent" as any]: user.accentColor }}
    >
      <Sidebar name={user.firstName} />
      <main className="flex-1 p-5 md:p-8 pb-24 md:pb-8">{children}</main>
    </div>
  );
}
