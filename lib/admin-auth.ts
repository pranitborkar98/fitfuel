// lib/admin-auth.ts
// Phase 10 â€” command-center auth gate.
//
// Reuses your EXISTING Google login. No new auth system. It reads the NextAuth
// database session cookie, looks the session up in your `Session` table, and
// only lets ADMIN / OWNER through. Customers (default role) are blocked.
//
// This works because you use database sessions (you have the `Session` model).
// If you ever switch NextAuth to JWT strategy, swap this for getServerSession().

import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";

export type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: "ADMIN" | "OWNER";
};

// Standard NextAuth cookie names. The __Secure- one is used on https (prod).
const SESSION_COOKIES = [
  "__Secure-next-auth.session-token",
  "next-auth.session-token",
];

export async function getAdminUser(): Promise<AdminUser | null> {
  const jar = await cookies();
  let token: string | undefined;
  for (const name of SESSION_COOKIES) {
    token = jar.get(name)?.value;
    if (token) break;
  }
  if (!token) return null;

  const session = await prisma.session.findUnique({
    where: { sessionToken: token },
    select: {
      expires: true,
      user: { select: { id: true, email: true, name: true, role: true } },
    },
  });

  if (!session || session.expires < new Date()) return null;

  const u = session.user;
  if (u.role !== "ADMIN" && u.role !== "OWNER") return null;

  return { id: u.id, email: u.email, name: u.name, role: u.role };
}

// Throwing guard for API routes. Returns the admin or a 401 NextResponse.
export async function requireAdmin() {
  const admin = await getAdminUser();
  return admin; // routes check for null and return 401 themselves
}