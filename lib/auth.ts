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
        session.user.role = (user as any).role ?? "CUSTOMER";
      }
      return session;
    },
  },

  events: {
    async createUser({ user }) {
      // Runs when PrismaAdapter creates a brand-new auth User row.
      // Check if a guest User already exists with the same email
      // (created by COD orders before the customer signed up).
      if (!user.email || !user.id) return;

      const guestUser = await (prisma as any).user.findFirst({
        where: {
          email: user.email,
          id:    { not: user.id },          // not the newly created auth user
          accounts: { none: {} },            // no OAuth accounts = guest
        },
      });

      if (!guestUser) return;

      console.log(`[Auth] Merging guest ${guestUser.id} → auth user ${user.id}`);

      // Re-parent everything from guest → new auth user
      await (prisma as any).order.updateMany({
        where:  { userId: guestUser.id },
        data:   { userId: user.id },
      });

      await (prisma as any).address.updateMany({
        where:  { userId: guestUser.id },
        data:   { userId: user.id },
      });

      // Copy over phone number if auth user doesn't have one yet
      if (!user.phone) {
        await (prisma as any).user.update({
          where: { id: user.id },
          data:  { phone: guestUser.phone },
        });
      }

      // Delete the guest user (orders/addresses already re-parented above)
      await (prisma as any).user.delete({
        where: { id: guestUser.id },
      });

      console.log(`[Auth] Merge complete — guest user ${guestUser.id} deleted`);
    },
  },

  pages: {
    signIn: "/auth/signin",
  },
});