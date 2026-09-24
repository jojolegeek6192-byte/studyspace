import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      authorize: async (credentials) => {
        const email = credentials?.email as string | undefined;
        const password = credentials?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          onboarded: user.onboarded,
        } as any;
      },
    }),
  ],
  callbacks: {
    // Le JWT ne contient jamais que l'id : tout le reste est relu en base
    // à chaque requête pour ne jamais faire confiance à des données côté client.
    jwt: async ({ token, user }) => {
      if (user) token.id = (user as any).id;
      return token;
    },
    session: async ({ session, token }) => {
      if (session.user) (session.user as any).id = token.id as string;
      return session;
    },
  },
});
