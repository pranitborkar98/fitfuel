// app/api/admin/drivers/[id]/route.ts
// Phase 10 â€” update a driver (activate/deactivate, edit name/phone). Admin-gated.

import { prisma } from "@/lib/prisma";
import { getAdminUser } from "@/lib/admin-auth";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const admin = await getAdminUser();
  if (!admin) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = (await req.json().catch(() => ({}))) as {
    isActive?: boolean;
    name?: string;
    phone?: string;
  };

  const data: { isActive?: boolean; name?: string; phone?: string } = {};
  if (typeof body.isActive === "boolean") data.isActive = body.isActive;
  if (body.name?.trim()) data.name = body.name.trim();
  if (body.phone?.trim()) data.phone = body.phone.trim();

  if (Object.keys(data).length === 0) {
    return NextResponse.json({ error: "Nothing to update" }, { status: 400 });
  }

  const driver = await prisma.driver.update({
    where: { id },
    data,
    select: { id: true, name: true, phone: true, accessToken: true, isActive: true },
  });

  return NextResponse.json({ driver });
}