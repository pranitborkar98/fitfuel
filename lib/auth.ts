import type { Role } from "@prisma/client";
import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id:   string;
      role: Role;
    } & DefaultSession["user"];
  }
  interface User {
    role: Role;
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // Auth.js v5 reads AUTH_SECRET; fall back to the legacy NEXTAUTH_SECRET name
  // so local .env files using the v4 name keep working.
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET || undefined,

  session: {
    strategy: "database",
  },

  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      allowDangerousEmailAccountLinking: true,
    }),
  ],

  callbacks: {
    async session({ session, user }) {
      if (session.user) {
        session.user.id   = user.id;
        session.user.role = user.role ?? "CUSTOMER";
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
});
