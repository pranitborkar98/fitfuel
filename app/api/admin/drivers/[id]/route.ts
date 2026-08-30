// app/api/admin/drivers/[id]/route.ts
// Phase 10 + 15-RBAC — update a driver (activate/deactivate, edit name/phone).
// Dispatch surface only.

import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { normalizeIndiaMobile } from "@/lib/phone";

const driverPatchSchema = z.object({
  isActive: z.boolean().optional(),
  name: z.string().trim().min(2).max(100).optional(),
  phone: z.string().trim().min(10).max(20).optional(),
}).strict();

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await requireApiRole("dispatch");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const { id } = await params;
  if (!id || id.length > 60) return NextResponse.json({ error: "Driver not found" }, { status: 404 });
  const parsed = await readJson(req, driverPatchSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  const data: { isActive?: boolean; name?: string; phone?: string } = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.name?.trim()) data.name = body.name.trim();
  if (body.phone) {
    const phone = normalizeIndiaMobile(body.phone);
    if (!phone) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number." }, { status: 400 });
    data.phone = phone;
  }

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const existing = await prisma.driver.findUnique({ where: { id }, select: { id: true, isActive: true } });
  if (!existing) return NextResponse.json({ error: "Driver not found" }, { status: 404 });

  const driver = await prisma.driver.update({
    where: { id },
    data: {
      ...data,
      ...(body.isActive === true && !existing.isActive
        ? { accessToken: randomBytes(16).toString("hex") }
        : {}),
    },
    select: { id: true, name: true, phone: true, accessToken: true, isActive: true },
  });

  return NextResponse.json({ driver });
}
