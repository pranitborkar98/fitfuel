// app/api/admin/staff/route.ts
// Phase 15-STAFF — manage staff roles from the UI (no DB/dev needed).
//   GET            -> current staff; ?q= searches all users by name/email to promote
//   POST {userId, role} -> set a user's role
// Staff surface = OWNER only.

import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const ASSIGNABLE = ["CUSTOMER", "ADMIN", "KITCHEN", "DISPATCH", "OWNER"] as const;
const STAFF = ["OWNER", "ADMIN", "KITCHEN", "DISPATCH"] as const;

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("staff");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const q = req.nextUrl.searchParams.get("q")?.trim();

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
    where: { role: { in: STAFF as unknown as string[] } },
    orderBy: [{ role: "asc" }, { email: "asc" }],
    select: { id: true, name: true, email: true, image: true, role: true },
  });
  return NextResponse.json({ users: staff });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("staff");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { userId?: string; role?: string };
  const userId = body.userId;
  const role = body.role;

  if (!userId || !role || !ASSIGNABLE.includes(role as (typeof ASSIGNABLE)[number])) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }

  // Guard: the owner can't accidentally strip their own OWNER role and lock out.
  if (userId === admin.id && role !== "OWNER") {
    return NextResponse.json(
      { error: "You can't change your own role away from OWNER." },
      { status: 400 }
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { role: role as any },
    select: { id: true, name: true, email: true, image: true, role: true },
  });

  return NextResponse.json({ user: updated });
}
