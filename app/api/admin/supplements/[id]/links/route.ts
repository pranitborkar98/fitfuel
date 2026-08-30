import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { linkCommercialError, supplementIdSchema, supplementLinkCreateSchema } from "@/lib/supplements-admin-validation";
import { readJson } from "@/lib/validation/core";
import { NextRequest, NextResponse } from "next/server";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, ctx: Ctx) {
  const admin = await requireApiRole("supplements");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const idResult = supplementIdSchema.safeParse((await ctx.params).id);
  if (!idResult.success) return NextResponse.json({ error: "Invalid supplement id." }, { status: 400 });
  const parsed = await readJson(req, supplementLinkCreateSchema, { maxBytes: 32 * 1024 });
  if (!parsed.ok) return parsed.response;
  const input = parsed.data;

  const commercialError = linkCommercialError(input);
  if (commercialError) return NextResponse.json({ error: commercialError }, { status: 400 });

  const supplement = await prisma.supplement.findUnique({
    where: { id: idResult.data },
    select: { id: true, isActive: true },
  });
  if (!supplement) return NextResponse.json({ error: "Supplement not found." }, { status: 404 });
  if (!supplement.isActive) {
    return NextResponse.json({ error: "Activate the supplement before adding a buying link." }, { status: 409 });
  }

  try {
    const link = await prisma.supplementLink.create({
      data: {
        supplementId: supplement.id,
        network: input.network,
        affiliateUrl: input.affiliateUrl,
        merchantLabel: input.merchantLabel || null,
        priceRs: input.priceRs,
        mrpRs: input.mrpRs,
        notes: input.notes || null,
        sortOrder: input.sortOrder,
        isActive: true,
      },
    });
    return NextResponse.json({ ok: true, link });
  } catch (error: unknown) {
    console.error("[admin/supplements/links] create failed", error);
    return NextResponse.json({ error: "Buying link creation failed." }, { status: 500 });
  }
}
