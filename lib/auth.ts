import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/prisma";

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers: [
    Google({
      clientId:     process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  session: {
    strategy: "jwt", // JWT — no Session table needed, simpler for now
  },
  callbacks: {
    async jwt({ token, user }) {
      // On first sign-in, user object is available — persist id + role to token
      if (user) {
        token.id   = user.id;
        token.role = (user as any).role ?? "CUSTOMER";
      }
      return token;
    },
    async session({ session, token }) {
      // Expose id + role to the client session
      if (session.user) {
        session.user.id   = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/signin", // custom sign-in page (Phase 4)
  },
});
