import NextAuth, { DefaultSession } from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: {
      id:   string;
      role: string;
    } & DefaultSession["user"];
  }
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),

  // ✅ REMOVED: useSecureCookies + custom cookies block
  // Those were setting sameSite:"none" which browsers reject outside cross-origin iframes.
  // NextAuth on Vercel HTTPS auto-sets __Secure- prefix + sameSite:lax correctly.

  session: {
    strategy: "database", // ✅ explicit — use DB sessions via PrismaAdapter
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
        session.user.role = (user as any).role ?? "CUSTOMER";
      }
      return session;
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});