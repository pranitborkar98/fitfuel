// Partner/referral channel management. OWNER/ADMIN only.

import { requireApiRole } from "@/lib/admin-auth";
import { generateUniqueReferralCode } from "@/lib/partners";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  decryptPartnerSensitiveFields,
  redactPartnerSensitiveFields,
  SensitiveDataConfigurationError,
} from "@/lib/sensitive-data";
import { readJson, readQuery } from "@/lib/validation/core";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const TYPES = ["CUSTOMER", "GYM", "TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "CORPORATE", "RESIDENCE"] as const;
const REWARD_TYPES = ["CREDIT", "CASH", "MEAL_VOUCHER", "DISCOUNT_ONLY", "HYBRID"] as const;
const STATUSES = ["PENDING", "ACTIVE", "PAUSED", "REJECTED", "TERMINATED"] as const;
const idSchema = z.string().cuid();
const optionalText = (max: number) => z.string().trim().max(max).optional();
const optionalUrl = z.string().trim().max(2048).refine(
  (value) => !value || value.startsWith("/") || /^https:\/\//i.test(value),
  "Use an HTTPS URL or an app-relative path.",
).optional();
const optionalEmail = z.union([z.literal(""), z.string().trim().email().max(254)]).optional();
const optionalPhone = z.string().trim().max(20).refine(
  (value) => !value || /^[0-9+()\-\s]+$/.test(value),
  "Phone number contains invalid characters.",
).optional();

const editableFieldsSchema = z.object({
  name: z.string().trim().min(1).max(160).optional(),
  contactEmail: optionalEmail,
  contactPhone: optionalPhone,
  customLandingSlug: z.string().trim().max(80).refine(
    (value) => !value || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value),
    "Landing slug must use lowercase letters, numbers, and hyphens.",
  ).optional(),
  rewardType: z.enum(REWARD_TYPES).optional(),
  rewardValueRs: z.coerce.number().int().min(0).max(1_000_000).optional(),
  refereeDiscountRs: z.coerce.number().int().min(0).max(100_000).optional(),
  gymAddress: optionalText(500),
  gymManagerName: optionalText(120),
  bio: optionalText(2_000),
  specialty: optionalText(200),
  profilePhotoUrl: optionalUrl,
  socialHandle: optionalText(120),
  followerCount: z.union([z.literal(""), z.null(), z.coerce.number().int().min(0).max(2_000_000_000)]).optional(),
  qualification: optionalText(300),
  registrationNumber: optionalText(160),
  clinicName: optionalText(240),
  credentialDocUrl: optionalUrl,
  hospitalAffiliation: optionalText(300),
  companyLogoUrl: optionalUrl,
  allowedEmailDomain: z.string().trim().toLowerCase().max(254).refine(
    (value) => !value || /^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,}$/.test(value),
    "Enter a valid company email domain.",
  ).optional(),
  hrContactName: optionalText(160),
  treasurerContact: optionalText(200),
  societyAddress: optionalText(500),
  adminNotes: optionalText(4_000),
  internalLabel: optionalText(160),
});

const createSchema = z.object({
  action: z.literal("create"),
  data: editableFieldsSchema.extend({
    type: z.enum(TYPES),
    status: z.enum(STATUSES).default("ACTIVE"),
    name: z.string().trim().min(1, "Name is required.").max(160),
    rewardType: z.enum(REWARD_TYPES),
    code: z.string().trim().max(64).optional().default(""),
    ownerUserEmail: optionalEmail,
  }),
}).strict();
const updateSchema = z.object({
  action: z.literal("update"),
  data: editableFieldsSchema.extend({ id: idSchema }),
}).strict();
const statusSchema = z.object({
  action: z.literal("setStatus"),
  data: z.object({ id: idSchema, status: z.enum(STATUSES) }).strict(),
}).strict();
const actionSchema = z.discriminatedUnion("action", [createSchema, updateSchema, statusSchema]);

const querySchema = z.object({
  tab: z.enum(["list", "detail"]).default("list"),
  id: idSchema.optional(),
  type: z.enum(TYPES).optional(),
  status: z.enum(STATUSES).optional(),
  q: z.string().trim().min(1).max(100).optional(),
}).strict();

function nullable(value: string | undefined): string | null | undefined {
  return value === undefined ? undefined : value || null;
}

function rewardError(rewardType: typeof REWARD_TYPES[number], rewardValueRs: number): string | null {
  if (rewardType === "DISCOUNT_ONLY") return null;
  return rewardValueRs < 1 ? "This reward type needs a positive reward value." : null;
}

function editablePatch(input: z.infer<typeof editableFieldsSchema>) {
  return {
    ...(input.name !== undefined ? { name: input.name } : {}),
    contactEmail: nullable(input.contactEmail),
    contactPhone: nullable(input.contactPhone),
    customLandingSlug: nullable(input.customLandingSlug),
    ...(input.rewardType !== undefined ? { rewardType: input.rewardType } : {}),
    ...(input.rewardValueRs !== undefined ? { rewardValueRs: input.rewardValueRs } : {}),
    ...(input.refereeDiscountRs !== undefined ? { refereeDiscountRs: input.refereeDiscountRs } : {}),
    gymAddress: nullable(input.gymAddress),
    gymManagerName: nullable(input.gymManagerName),
    bio: nullable(input.bio),
    specialty: nullable(input.specialty),
    profilePhotoUrl: nullable(input.profilePhotoUrl),
    socialHandle: nullable(input.socialHandle),
    ...(input.followerCount !== undefined
      ? { followerCount: input.followerCount === "" ? null : input.followerCount }
      : {}),
    qualification: nullable(input.qualification),
    registrationNumber: nullable(input.registrationNumber),
    clinicName: nullable(input.clinicName),
    credentialDocUrl: nullable(input.credentialDocUrl),
    hospitalAffiliation: nullable(input.hospitalAffiliation),
    companyLogoUrl: nullable(input.companyLogoUrl),
    allowedEmailDomain: nullable(input.allowedEmailDomain),
    hrContactName: nullable(input.hrContactName),
    treasurerContact: nullable(input.treasurerContact),
    societyAddress: nullable(input.societyAddress),
    adminNotes: nullable(input.adminNotes),
    internalLabel: nullable(input.internalLabel),
  };
}

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("partners");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = readQuery(req, querySchema);
  if (!parsed.ok) return parsed.response;
  const query = parsed.data;

  if (query.tab === "detail") {
    if (!query.id) return NextResponse.json({ error: "Partner id is required." }, { status: 400 });
    const partner = await prisma.partner.findUnique({
      where: { id: query.id },
      include: {
        ownerUser: { select: { id: true, name: true, email: true } },
        referrals: {
          orderBy: { createdAt: "desc" },
          take: 100,
          include: {
            refereeUser: { select: { id: true, name: true, email: true } },
            refereeOrder: { select: { id: true, orderNumber: true, totalRs: true } },
          },
        },
        payouts: { orderBy: { periodYearMonth: "desc" }, take: 24 },
      },
    });
    if (!partner) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    try {
      return NextResponse.json({ partner: decryptPartnerSensitiveFields(partner) });
    } catch (error: unknown) {
      console.error("[admin/partners] could not decrypt payout data", error);
      return NextResponse.json(
        { error: error instanceof SensitiveDataConfigurationError ? "Payout data is not configured." : "Payout data could not be read." },
        { status: 503 },
      );
    }
  }

  const where: Prisma.PartnerWhereInput = {
    ...(query.type ? { type: query.type } : {}),
    ...(query.status ? { status: query.status } : {}),
    ...(query.q
      ? {
          OR: [
            { name: { contains: query.q, mode: "insensitive" } },
            { code: { contains: query.q, mode: "insensitive" } },
            { contactEmail: { contains: query.q, mode: "insensitive" } },
            { contactPhone: { contains: query.q } },
          ],
        }
      : {}),
  };
  const partners = await prisma.partner.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { referrals: true } },
      ownerUser: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ partners: partners.map(redactPartnerSensitiveFields) });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("partners");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, actionSchema, { maxBytes: 64 * 1024 });
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    if (body.action === "create") {
      const input = body.data;
      const rewardValueRs = input.rewardType === "DISCOUNT_ONLY" ? 0 : input.rewardValueRs ?? 0;
      const invalidReward = rewardError(input.rewardType, rewardValueRs);
      if (invalidReward) return NextResponse.json({ error: invalidReward }, { status: 400 });

      let code = input.code.toUpperCase().replace(/\s+/g, "");
      if (code && !/^[A-Z0-9_-]{3,64}$/.test(code)) {
        return NextResponse.json({ error: "Partner code must be 3–64 letters, numbers, underscores, or hyphens." }, { status: 400 });
      }
      if (!code) code = await generateUniqueReferralCode(input.name);

      let ownerUserId: string | null = null;
      if (input.ownerUserEmail) {
        const owner = await prisma.user.findFirst({
          where: { email: { equals: input.ownerUserEmail, mode: "insensitive" } },
          select: { id: true },
        });
        if (!owner) return NextResponse.json({ error: "No user account matches that email." }, { status: 400 });
        ownerUserId = owner.id;
      }

      const patch = editablePatch(input);
      const partner = await prisma.partner.create({
        data: {
          ...patch,
          name: input.name,
          type: input.type,
          status: input.status,
          ownerUserId,
          code,
          rewardType: input.rewardType,
          rewardValueRs,
          refereeDiscountRs: input.refereeDiscountRs ?? 0,
          createdById: admin.id,
          approvedAt: input.status === "ACTIVE" ? new Date() : null,
          approvedById: input.status === "ACTIVE" ? admin.id : null,
        },
      });
      return NextResponse.json({ ok: true, partner });
    }

    if (body.action === "update") {
      const current = await prisma.partner.findUnique({
        where: { id: body.data.id },
        select: { id: true, rewardType: true, rewardValueRs: true, status: true },
      });
      if (!current) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
      if (current.status === "TERMINATED") {
        return NextResponse.json({ error: "A terminated partner is locked." }, { status: 409 });
      }
      const rewardType = body.data.rewardType ?? current.rewardType;
      const rewardValueRs = rewardType === "DISCOUNT_ONLY" ? 0 : body.data.rewardValueRs ?? current.rewardValueRs;
      const invalidReward = rewardError(rewardType, rewardValueRs);
      if (invalidReward) return NextResponse.json({ error: invalidReward }, { status: 400 });

      const patch = editablePatch(body.data);
      patch.rewardType = rewardType;
      patch.rewardValueRs = rewardValueRs;
      const updated = await prisma.partner.update({ where: { id: body.data.id }, data: patch });
      return NextResponse.json({ ok: true, partner: updated });
    }

    const current = await prisma.partner.findUnique({
      where: { id: body.data.id },
      select: { status: true },
    });
    if (!current) return NextResponse.json({ error: "Partner not found." }, { status: 404 });
    if (current.status === body.data.status) {
      return NextResponse.json({ ok: true, unchanged: true });
    }
    const transitions: Record<typeof STATUSES[number], readonly typeof STATUSES[number][]> = {
      PENDING: ["ACTIVE", "REJECTED", "TERMINATED"],
      ACTIVE: ["PAUSED", "TERMINATED"],
      PAUSED: ["ACTIVE", "TERMINATED"],
      REJECTED: ["TERMINATED"],
      TERMINATED: [],
    };
    if (!transitions[current.status].includes(body.data.status)) {
      return NextResponse.json({ error: `Cannot move a ${current.status.toLowerCase()} partner to ${body.data.status.toLowerCase()}.` }, { status: 409 });
    }
    const updated = await prisma.partner.update({
      where: { id: body.data.id },
      data: {
        status: body.data.status,
        ...(body.data.status === "ACTIVE" ? { approvedAt: new Date(), approvedById: admin.id } : {}),
      },
    });
    return NextResponse.json({ ok: true, partner: updated });
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? error.code : null;
    if (code === "P2002") return NextResponse.json({ error: "Partner code, landing slug, or linked user is already in use." }, { status: 409 });
    console.error("[admin/partners] save failed", error);
    return NextResponse.json({ error: "Partner operation failed." }, { status: 500 });
  }
}
