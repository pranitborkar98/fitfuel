// app/api/admin/drivers/route.ts
// Phase 10 + 15-RBAC — list + create drivers. Dispatch surface only.
// Creating a driver mints a unique accessToken => their /driver/<token> link works.

import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { normalizeIndiaMobile } from "@/lib/phone";

export const dynamic = "force-dynamic";
const driverCreateSchema = z.object({
  name: z.string().trim().min(2).max(100),
  phone: z.string().trim().min(10).max(20),
}).strict();

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("dispatch");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const drivers = await prisma.driver.findMany({
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
    select: { id: true, name: true, phone: true, accessToken: true, isActive: true },
  });
  return NextResponse.json({ drivers });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("dispatch");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, driverCreateSchema);
  if (!parsed.ok) return parsed.response;
  const { name } = parsed.data;
  const phone = normalizeIndiaMobile(parsed.data.phone);
  if (!phone) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });

  // high-entropy, URL-safe token — the token IS the auth for the driver link
  const accessToken = randomBytes(16).toString("hex");

  const driver = await prisma.driver.create({
    data: { name, phone, accessToken, isActive: true },
    select: { id: true, name: true, phone: true, accessToken: true, isActive: true },
  });

  return NextResponse.json({ driver }, { status: 201 });
}
