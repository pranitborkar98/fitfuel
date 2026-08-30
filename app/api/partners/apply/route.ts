// Self-onboarding creates a pending partner row. Staff approval is required
// before its code can attribute a customer or earn a reward.

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notifyStaffByRoles } from "@/lib/notify";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { partnerApplySchema } from "@/lib/validation/schemas";
import { generateUniqueReferralCode } from "@/lib/partners";
import {
  encryptSensitiveData,
  SensitiveDataConfigurationError,
} from "@/lib/sensitive-data";
import type { PartnerRewardType, PartnerType, Prisma } from "@prisma/client";

const CASH_TYPES = new Set<PartnerType>(["TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "RESIDENCE"]);

// Per-type reward defaults (matches Decision #121 / 17A TYPE_DEFAULTS).
const TYPE_DEFAULTS: Record<Exclude<PartnerType, "CUSTOMER">, { rewardType: PartnerRewardType; rewardValueRs: number; refereeDiscountRs: number }> = {
  GYM:         { rewardType: "MEAL_VOUCHER",  rewardValueRs: 5,    refereeDiscountRs: 200 },
  TRAINER:     { rewardType: "CASH",          rewardValueRs: 500,  refereeDiscountRs: 200 },
  INFLUENCER:  { rewardType: "CASH",          rewardValueRs: 750,  refereeDiscountRs: 200 },
  DIETICIAN:   { rewardType: "CASH",          rewardValueRs: 1000, refereeDiscountRs: 200 },
  DOCTOR:      { rewardType: "CASH",          rewardValueRs: 1500, refereeDiscountRs: 200 },
  CORPORATE:   { rewardType: "DISCOUNT_ONLY", rewardValueRs: 0,    refereeDiscountRs: 250 },
  RESIDENCE:   { rewardType: "HYBRID",        rewardValueRs: 200,  refereeDiscountRs: 200 },
};

function isUniqueConflict(error: unknown): boolean {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}

export async function POST(req: NextRequest) {
  try {
    const rl = await enforceRateLimit(req, "partnerApply");
    if (!rl.ok) return rl.response;

    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Sign in required" }, { status: 401 });
    }
    const userId = session.user.id;

    const parsed = await readJson(req, partnerApplySchema);
    if (!parsed.ok) return parsed.response;
    const { type } = parsed.data;
    const form = parsed.data.form;

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

    const existing = await prisma.partner.findUnique({
      where: { ownerUserId: userId },
      select: { id: true, type: true, code: true },
    });
    if (existing && existing.type !== "CUSTOMER") {
      return NextResponse.json({ error: "You already have a partner application." }, { status: 409 });
    }

    const code = existing?.code || await generateUniqueReferralCode(form.name);
    const defaults = TYPE_DEFAULTS[type];
    const data: Prisma.PartnerUncheckedCreateInput = {
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

    if (CASH_TYPES.has(type)) {
      data.panNumber = encryptSensitiveData(String(form.panNumber).trim().toUpperCase());
      data.bankAccountName = encryptSensitiveData(String(form.bankAccountName).trim());
      data.bankAccountNumber = encryptSensitiveData(String(form.bankAccountNumber).trim());
      data.bankIfsc = encryptSensitiveData(String(form.bankIfsc).trim().toUpperCase());
    }

    let created: { id: string; code: string; name: string; type: PartnerType };
    if (existing) {
      const claimed = await prisma.partner.updateMany({
        where: { id: existing.id, type: "CUSTOMER" },
        data,
      });
      if (claimed.count !== 1) {
        return NextResponse.json({ error: "Your partner account changed. Refresh and try again." }, { status: 409 });
      }
      created = await prisma.partner.findUniqueOrThrow({
        where: { id: existing.id },
        select: { id: true, code: true, name: true, type: true },
      });
    } else {
      created = await prisma.partner.create({
        data,
        select: { id: true, code: true, name: true, type: true },
      });
    }

    await notifyStaffByRoles(["OWNER", "ADMIN"], "staff_new_partner_application", {
      partnerName: created.name,
      partnerType: created.type,
      partnerCode: created.code,
      adminUrl: "/admin/partners",
    }).catch((e: unknown) => console.error("[partners/apply] staff notify failed", e));

    return NextResponse.json({ ok: true, partner: created });
  } catch (err: unknown) {
    console.error("[partners/apply] error", err);
    if (err instanceof SensitiveDataConfigurationError) {
      return NextResponse.json(
        { error: "Partner applications with cash payouts are temporarily unavailable." },
        { status: 503 },
      );
    }
    if (isUniqueConflict(err)) {
      return NextResponse.json({ error: "You already have a partner application. Refresh to see its status." }, { status: 409 });
    }
    return NextResponse.json({ error: "Could not submit the application." }, { status: 500 });
  }
}
