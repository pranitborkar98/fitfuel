// app/api/admin/staff/route.ts
// Phase 15-STAFF — manage staff roles from the UI (no DB/dev needed).
//   GET            -> current staff; ?q= searches all users by name/email to promote
//   POST {userId, role} -> set a user's role
// Staff surface = OWNER only.

import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson, readQuery } from "@/lib/validation/core";

export const dynamic = "force-dynamic";

const ASSIGNABLE = ["CUSTOMER", "ADMIN", "KITCHEN", "DISPATCH"] as const;
const STAFF = ["OWNER", "ADMIN", "KITCHEN", "DISPATCH"] as const;
const staffQuerySchema = z.object({ q: z.string().trim().min(2).max(80).optional() }).strict();
const staffRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(ASSIGNABLE),
}).strict();

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("staff");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;
  const parsed = readQuery(req, staffQuerySchema);
  if (!parsed.ok) return parsed.response;

  const q = parsed.data.q;

  if (q) {
    const results = await prisma.user.findMany({
      where: {
        OR: [
          { email: { contains: q, mode: "insensitive" } },
          { name: { contains: q, mode: "insensitive" } },
        ],
      },
      orderBy: { email: "asc" },
      take: 15,
      select: { id: true, name: true, email: true, image: true, role: true },
    });
    return NextResponse.json({ users: results });
  }

  const staff = await prisma.user.findMany({
    where: { role: { in: [...STAFF] } },
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: { id: true, name: true, email: true, image: true, role: true },
  });
  return NextResponse.json({ users: staff });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("staff");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, staffRoleSchema);
  if (!parsed.ok) return parsed.response;
  const { userId, role } = parsed.data;

  // Guard: the owner can't accidentally strip their own OWNER role and lock out.
  if (userId === admin.id) {
    return NextResponse.json(
      { error: "You can't change your own role away from OWNER." },
      { status: 400 }
    );
  }

  const target = await prisma.user.findUnique({ where: { id: userId }, select: { id: true, role: true } });
  if (!target) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (target.role === "OWNER") {
    return NextResponse.json({ error: "Owner access cannot be changed from the staff screen." }, { status: 409 });
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  return NextResponse.json({ user: updated });
}
