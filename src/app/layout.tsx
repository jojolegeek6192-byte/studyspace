import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StudySpace — Toute ta vie scolaire, au même endroit",
  description: "Notes, moyennes, devoirs, emploi du temps : un espace tout-en-un pour collège, lycée et études supérieures.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="antialiased min-h-screen">{children}</body>
    </html>
  );
}
