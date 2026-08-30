import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { linkCommercialError, supplementIdSchema, supplementLinkPatchSchema } from "@/lib/supplements-admin-validation";
import { readJson } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ linkId: string }> };

async function linkId(ctx: Ctx) {
  const parsed = supplementIdSchema.safeParse((await ctx.params).linkId);
  return parsed.success ? parsed.data : null;
}

export async function PATCH(req: NextRequest, ctx: Ctx) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const id = await linkId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid buying link id." }, { status: 400 });
  const parsed = await readJson(req, supplementLinkPatchSchema, { maxBytes: 32 * 1024 });
  if (!parsed.ok) return parsed.response;

  const current = await prisma.supplementLink.findUnique({
    where: { id },
    select: { network: true, merchantLabel: true, priceRs: true, mrpRs: true },
  });
  if (!current) return NextResponse.json({ error: "Buying link not found." }, { status: 404 });
  const input = parsed.data;
  const commercialError = linkCommercialError({
    network: input.network ?? current.network,
    merchantLabel: input.merchantLabel !== undefined ? input.merchantLabel : current.merchantLabel,
    priceRs: input.priceRs !== undefined ? input.priceRs : current.priceRs,
    mrpRs: input.mrpRs !== undefined ? input.mrpRs : current.mrpRs,
  });
  if (commercialError) return NextResponse.json({ error: commercialError }, { status: 400 });

  try {
    const link = await prisma.supplementLink.update({
      where: { id },
      data: {
        ...input,
        ...(input.merchantLabel !== undefined ? { merchantLabel: input.merchantLabel || null } : {}),
        ...(input.notes !== undefined ? { notes: input.notes || null } : {}),
      },
    });
    return NextResponse.json({ ok: true, link });
  } catch (error: unknown) {
    console.error("[admin/supplements/links] update failed", error);
    return NextResponse.json({ error: "Buying link update failed." }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, ctx: Ctx) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const id = await linkId(ctx);
  if (!id) return NextResponse.json({ error: "Invalid buying link id." }, { status: 400 });
  const result = await prisma.supplementLink.updateMany({ where: { id }, data: { isActive: false } });
  if (result.count === 0) return NextResponse.json({ error: "Buying link not found." }, { status: 404 });
  return NextResponse.json({ ok: true });
}
