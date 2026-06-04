// lib/admin-auth.ts
// Phase 10 — command-center auth gate (Auth.js v5).
// Delegates session reading to the app's own auth() resolver from lib/auth.ts.
// Role is read FRESH from the DB each request.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: "ADMIN" | "OWNER";
};

export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user || (user.role !== "ADMIN" && user.role !== "OWNER")) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role };
}

export async function requireAdmin() {
  return getAdminUser();
}