// lib/admin-auth.ts
// Phase 10 + 15-RBAC — command-center auth gate (Auth.js v5).
// Role is read FRESH from the DB each request.
//
// Two axes: ROLE (what you can do) is here; SCOPE (which franchise/outlet's data)
// is deferred until franchising. OWNER/ADMIN see everything; KITCHEN sees the
// production SOP only; DISPATCH sees the dispatch board + drivers only.

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export type StaffRole = "OWNER" | "ADMIN" | "KITCHEN" | "DISPATCH";
const STAFF_ROLES: StaffRole[] = ["OWNER", "ADMIN", "KITCHEN", "DISPATCH"];

export type AdminUser = {
  id: string;
  email: string | null;
  name: string | null;
  role: StaffRole;
};

export type Surface =
  | "dispatch"
  | "drivers"
  | "production"
  | "recipes"
  | "staff"
  | "content"
  | "plans"
  | "orders"
  | "subscribers";

// Which roles may access each surface. OWNER/ADMIN are full-access.
export const SURFACE_ROLES: Record<Surface, StaffRole[]> = {
  dispatch: ["OWNER", "ADMIN", "DISPATCH"],
  drivers: ["OWNER", "ADMIN", "DISPATCH"],
  production: ["OWNER", "ADMIN", "KITCHEN"],
  recipes: ["OWNER", "ADMIN", "KITCHEN"],
  staff: ["OWNER"], // only the owner manages staff + roles
  content: ["OWNER", "ADMIN"],
  plans: ["OWNER", "ADMIN"],
  orders: ["OWNER", "ADMIN"],
  subscribers: ["OWNER", "ADMIN"],
};

export function canAccess(role: string | null | undefined, surface: Surface): boolean {
  if (!role) return false;
  return (SURFACE_ROLES[surface] ?? []).includes(role as StaffRole);
}

// Any staff member (used by the /admin layout gate + nav).
export async function getAdminUser(): Promise<AdminUser | null> {
  const session = await auth();
  const email = session?.user?.email;
  if (!email) return null;

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, email: true, name: true, role: true },
  });
  if (!user || !STAFF_ROLES.includes(user.role as StaffRole)) return null;

  return { id: user.id, email: user.email, name: user.name, role: user.role as StaffRole };
}

// Back-compat alias (used by older callers).
export async function requireAdmin() {
  return getAdminUser();
}

// Where to send a staff member who lands on a surface they can't see.
export function landingFor(role: StaffRole): string {
  if (canAccess(role, "dispatch")) return "/admin";
  if (canAccess(role, "production")) return "/admin/production";
  return "/";
}

// SERVER PAGES: enforce a surface or redirect. Returns the user when allowed.
export async function requireSurface(surface: Surface): Promise<AdminUser> {
  const user = await getAdminUser();
  if (!user) redirect("/auth/signin?callbackUrl=/admin");
  if (!canAccess(user.role, surface)) redirect(landingFor(user.role));
  return user;
}

// API ROUTES: returns the user if allowed, else null (caller returns 403).
export async function requireApiRole(surface: Surface): Promise<AdminUser | null> {
  const user = await getAdminUser();
  if (!user || !canAccess(user.role, surface)) return null;
  return user;
}
