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
  async signIn({ user, isNewUser }) {
    if (!user.email || !user.id) return;

    // Run merge whether or not it's a new user —
    // guest rows may exist from before auth was set up
    const guestUser = await (prisma as any).user.findFirst({
      where: {
        email:    user.email,
        id:       { not: user.id },
        accounts: { none: {} },
      },
    });

    if (!guestUser) return;

    console.log(`[Auth] Merging guest ${guestUser.id} → auth user ${user.id}`);

    await (prisma as any).order.updateMany({
      where: { userId: guestUser.id },
      data:  { userId: user.id },
    });

    await (prisma as any).address.updateMany({
      where: { userId: guestUser.id },
      data:  { userId: user.id },
    });

    const authUser = await (prisma as any).user.findUnique({ where: { id: user.id } });
    if (!authUser?.phone && guestUser.phone) {
      await (prisma as any).user.update({
        where: { id: user.id },
        data:  { phone: guestUser.phone },
      });
    }

    await (prisma as any).user.delete({ where: { id: guestUser.id } });

    console.log(`[Auth] Merge complete — guest ${guestUser.id} deleted`);
  },
},
  pages: {
    signIn: "/auth/signin",
  },
});