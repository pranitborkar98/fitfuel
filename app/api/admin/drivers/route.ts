// app/api/admin/drivers/route.ts
// Phase 10 â€” list + create drivers. Admin-gated. Creating a driver mints a
// unique accessToken => their /driver/<token> link works immediately.

import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

export const dynamic = "force-dynamic";

export async function GET() {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const drivers = await prisma.driver.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, phone: true, accessToken: true, isActive: true },
  });
  return NextResponse.json({ drivers });
}

export async function POST(req: NextRequest) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await req.json().catch(() => ({}))) as { name?: string; phone?: string };
  const name = body.name?.trim();
  const phone = body.phone?.trim();
  if (!name || !phone) {
    return NextResponse.json({ error: "name and phone are required" }, { status: 400 });
  }

  // high-entropy, URL-safe token â€” the token IS the auth for the driver link
  const accessToken = randomBytes(16).toString("hex");

  const driver = await prisma.driver.create({
    data: { name, phone, accessToken, isActive: true },
    select: { id: true, name: true, phone: true, accessToken: true, isActive: true },
  });

  return NextResponse.json({ driver }, { status: 201 });
}