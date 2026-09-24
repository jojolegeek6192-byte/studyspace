"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { LayoutDashboard, GraduationCap, ListChecks, LogOut } from "lucide-react";

const links = [
  { href: "/dashboard", label: "Accueil", icon: LayoutDashboard },
  { href: "/dashboard/notes", label: "Notes", icon: GraduationCap },
  { href: "/dashboard/devoirs", label: "Cahier de texte", icon: ListChecks },
];

export function Sidebar({ name }: { name: string }) {
  const pathname = usePathname();

  return (
    <>
      <aside className="hidden md:flex md:flex-col w-64 shrink-0 border-r border-[var(--border)] h-screen sticky top-0 p-5">
        <p className="font-semibold text-lg mb-8">🎓 StudySpace</p>
        <nav className="flex-1 space-y-1">
          {links.map(({ href, label, icon: Icon }) => {
            const active = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm ${
                  active ? "bg-[var(--accent)] text-white" : "hover:bg-[var(--surface-2)] text-muted"
                }`}
              >
                <Icon size={18} />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-[var(--border)] pt-3">
          <p className="text-sm font-medium mb-2">{name}</p>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex items-center gap-2 text-sm text-muted hover:text-red-500"
          >
            <LogOut size={16} /> Déconnexion
          </button>
        </div>
      </aside>

      <nav className="md:hidden fixed bottom-0 left-0 right-0 border-t border-[var(--border)] bg-[var(--surface)] flex justify-around py-2 z-10">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-0.5 text-[11px] px-2 ${
                active ? "text-[var(--accent)]" : "text-muted"
              }`}
            >
              <Icon size={20} />
              {label}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
