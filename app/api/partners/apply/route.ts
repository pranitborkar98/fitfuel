// app/api/partners/apply/route.ts  · WS-3 hardened (SEC-1/2)
// Phase 17C-1 — Self-onboarding POST endpoint.
// Creates a PENDING Partner row owned by the signed-in user.
// Admin manually approves via /admin/partners (Decision #123).
// Tax fields (PAN/bank) required for cash types (#122).

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyStaffByRoles } from "@/lib/notify";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { partnerApplySchema } from "@/lib/validation/schemas";

const db = prisma as any;

const CASH_TYPES = new Set(["TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR"]);

// Per-type reward defaults (matches Decision #121 / 17A TYPE_DEFAULTS).
const TYPE_DEFAULTS: Record<string, { rewardType: string; rewardValueRs: number; refereeDiscountRs: number }> = {
  GYM:         { rewardType: "MEAL_VOUCHER",  rewardValueRs: 5,    refereeDiscountRs: 200 },
  TRAINER:     { rewardType: "CASH",          rewardValueRs: 500,  refereeDiscountRs: 200 },
  INFLUENCER:  { rewardType: "CASH",          rewardValueRs: 750,  refereeDiscountRs: 200 },
  DIETICIAN:   { rewardType: "CASH",          rewardValueRs: 1000, refereeDiscountRs: 200 },
  DOCTOR:      { rewardType: "CASH",          rewardValueRs: 1500, refereeDiscountRs: 200 },
  CORPORATE:   { rewardType: "DISCOUNT_ONLY", rewardValueRs: 0,    refereeDiscountRs: 250 },
  RESIDENCE:   { rewardType: "HYBRID",        rewardValueRs: 200,  refereeDiscountRs: 200 },
};

function genCode(baseName: string): string {
  const base = (baseName || "PARTNER").toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "PARTNER";
  const suffix = Math.random().toString(36).toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4) || "X3K7";
  return `FF-${base}-${suffix}`;
}

export async function POST(req: NextRequest) {
  try {
    // SEC-1: throttle self-onboarding spam, by IP (before auth + DB work).
    const rl = await enforceRateLimit(req, "partnerApply");
    if (!rl.ok) return rl.response;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const userId = session.user.id;

    // SEC-2: validated body. type ∈ enum, form.name + form.contactEmail required.
    // Detailed cash-type PAN/IFSC/bank checks stay below (preserve exact messages).
    const parsed = await readJson(req, partnerApplySchema);
    if (!parsed.ok) return parsed.response;
    const { type } = parsed.data;
    const form = parsed.data.form;

    // Tax fields required for cash payout types
    if (CASH_TYPES.has(type)) {
      const missing: string[] = [];
      if (!form.panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]$/.test(String(form.panNumber).trim())) missing.push("valid PAN");
      if (!form.bankAccountName || !String(form.bankAccountName).trim()) missing.push("bank holder name");
      if (!form.bankAccountNumber || !/^[0-9]{6,20}$/.test(String(form.bankAccountNumber).trim())) missing.push("valid bank account");
      if (!form.bankIfsc || !/^[A-Z]{4}0[A-Z0-9]{6}$/.test(String(form.bankIfsc).trim())) missing.push("valid IFSC");
      if (missing.length) {
        return NextResponse.json({ error: `Missing or invalid: ${missing.join(", ")}` }, { status: 400 });
      }
    }

    // Already a non-CUSTOMER partner? Block.
    const existing = await db.partner.findUnique({
      where: { ownerUserId: userId },
      select: { id: true, type: true },
    });
    if (existing && existing.type !== "CUSTOMER") {
      return NextResponse.json({ error: "You already have a partner application." }, { status: 409 });
    }

    // Generate a unique code
    let code = "";
    for (let i = 0; i < 8; i++) {
      const candidate = genCode(form.name);
      const clash = await db.partner.findUnique({ where: { code: candidate }, select: { id: true } });
      if (!clash) { code = candidate; break; }
    }
    if (!code) code = `FF-${Date.now().toString(36).toUpperCase().slice(-8)}`;

    const defaults = TYPE_DEFAULTS[type];

    const data: any = {
      type,
      status: "PENDING",
      name: String(form.name).trim(),
      contactEmail: form.contactEmail || null,
      contactPhone: form.contactPhone || null,
      ownerUserId: userId,
      code,
      rewardType: defaults.rewardType,
      rewardValueRs: defaults.rewardValueRs,
      refereeDiscountRs: defaults.refereeDiscountRs,
      createdById: userId,
    };

    // Type-specific
    if (type === "GYM") {
      data.gymAddress = form.gymAddress || null;
      data.gymManagerName = form.gymManagerName || null;
    } else if (type === "TRAINER" || type === "INFLUENCER") {
      data.bio = form.bio || null;
      data.specialty = form.specialty || null;
      data.socialHandle = form.socialHandle || null;
      data.followerCount = form.followerCount ? Number(form.followerCount) : null;
    } else if (type === "DIETICIAN" || type === "DOCTOR") {
      data.qualification = form.qualification || null;
      data.registrationNumber = form.registrationNumber || null;
      data.clinicName = form.clinicName || null;
      if (type === "DOCTOR") data.hospitalAffiliation = form.hospitalAffiliation || null;
    } else if (type === "CORPORATE") {
      data.allowedEmailDomain = form.allowedEmailDomain || null;
      data.hrContactName = form.hrContactName || null;
    } else if (type === "RESIDENCE") {
      data.treasurerContact = form.treasurerContact || null;
      data.societyAddress = form.societyAddress || null;
    }

    // Tax / payout (cash types)
    if (CASH_TYPES.has(type)) {
      data.panNumber = String(form.panNumber).trim().toUpperCase();
      data.bankAccountName = String(form.bankAccountName).trim();
      data.bankAccountNumber = String(form.bankAccountNumber).trim();
      data.bankIfsc = String(form.bankIfsc).trim().toUpperCase();
    }

    const created = await db.partner.create({
      data,
      select: { id: true, code: true, name: true, type: true },
    });

    // Notify staff (admin/owner) — non-blocking, fire-and-forget
    notifyStaffByRoles(["OWNER", "ADMIN"], "staff_new_partner_application", {
      partnerName: created.name,
      partnerType: created.type,
      partnerCode: created.code,
      adminUrl: "/admin/partners",
    }).catch((e: unknown) => console.error("[partners/apply] staff notify failed", e));

    return NextResponse.json({ ok: true, partner: created });
  } catch (err: any) {
    console.error("[partners/apply] error", err);
    return NextResponse.json({ error: err?.message || "Internal error" }, { status: 500 });
  }
}
