// app/api/admin/partners/route.ts
// Phase 17A \u2014 admin CRUD for the partner system. OWNER/ADMIN only.

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireApiRole } from "@/lib/admin-auth";
import { generateUniqueReferralCode } from "@/lib/partners";

export const dynamic = "force-dynamic";

const db = prisma as any;

const VALID_TYPES = [
  "CUSTOMER",
  "GYM",
  "TRAINER",
  "INFLUENCER",
  "DIETICIAN",
  "DOCTOR",
  "CORPORATE",
  "RESIDENCE",
];

const VALID_REWARD_TYPES = [
  "CREDIT",
  "CASH",
  "MEAL_VOUCHER",
  "DISCOUNT_ONLY",
  "HYBRID",
];

const VALID_STATUSES = ["PENDING", "ACTIVE", "PAUSED", "REJECTED", "TERMINATED"];

export async function GET(req: NextRequest) {
  const gate = await requireApiRole("partners");
  if (!gate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { searchParams } = new URL(req.url);
  const tab = searchParams.get("tab") || "list";

  if (tab === "detail") {
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const partner = await db.partner.findUnique({
      where: { id },
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
    if (!partner) return NextResponse.json({ error: "not found" }, { status: 404 });
    return NextResponse.json({ partner });
  }

  // list with filters
  const type = searchParams.get("type");
  const status = searchParams.get("status");
  const q = searchParams.get("q");
  const where: any = {};
  if (type && VALID_TYPES.includes(type)) where.type = type;
  if (status && VALID_STATUSES.includes(status)) where.status = status;
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { code: { contains: q, mode: "insensitive" } },
      { contactEmail: { contains: q, mode: "insensitive" } },
      { contactPhone: { contains: q } },
    ];
  }
  const partners = await db.partner.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 200,
    include: {
      _count: { select: { referrals: true } },
      ownerUser: { select: { id: true, name: true, email: true } },
    },
  });
  return NextResponse.json({ partners });
}

export async function POST(req: NextRequest) {
  const gate = await requireApiRole("partners");
  if (!gate) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const { action, data } = body;

  if (action === "create") {
    if (!data?.name || !data?.type || !data?.rewardType) {
      return NextResponse.json({ error: "name, type, rewardType required" }, { status: 400 });
    }
    if (!VALID_TYPES.includes(data.type)) return NextResponse.json({ error: "invalid type" }, { status: 400 });
    if (!VALID_REWARD_TYPES.includes(data.rewardType)) return NextResponse.json({ error: "invalid rewardType" }, { status: 400 });

    const code = data.code?.trim() || (await generateUniqueReferralCode(data.name));

    // Optionally link to existing user account
    let ownerUserId: string | null = null;
    if (data.ownerUserEmail) {
      const owner = await db.user.findFirst({
        where: { email: data.ownerUserEmail },
        select: { id: true },
      });
      if (!owner) return NextResponse.json({ error: `No user found with email ${data.ownerUserEmail}` }, { status: 400 });
      ownerUserId = owner.id;
    }

    const partner = await db.partner.create({
      data: {
        type: data.type,
        status: data.status || "ACTIVE",
        name: data.name,
        contactEmail: data.contactEmail || null,
        contactPhone: data.contactPhone || null,
        ownerUserId,
        code,
        customLandingSlug: data.customLandingSlug || null,
        rewardType: data.rewardType,
        rewardValueRs: Number(data.rewardValueRs || 0),
        refereeDiscountRs: Number(data.refereeDiscountRs || 0),
        gymAddress: data.gymAddress || null,
        gymManagerName: data.gymManagerName || null,
        bio: data.bio || null,
        specialty: data.specialty || null,
        profilePhotoUrl: data.profilePhotoUrl || null,
        socialHandle: data.socialHandle || null,
        followerCount: data.followerCount ? Number(data.followerCount) : null,
        qualification: data.qualification || null,
        registrationNumber: data.registrationNumber || null,
        clinicName: data.clinicName || null,
        credentialDocUrl: data.credentialDocUrl || null,
        hospitalAffiliation: data.hospitalAffiliation || null,
        companyLogoUrl: data.companyLogoUrl || null,
        allowedEmailDomain: data.allowedEmailDomain || null,
        hrContactName: data.hrContactName || null,
        treasurerContact: data.treasurerContact || null,
        societyAddress: data.societyAddress || null,
        adminNotes: data.adminNotes || null,
        internalLabel: data.internalLabel || null,
        createdById: gate.id,
        approvedAt: data.status === "ACTIVE" ? new Date() : null,
        approvedById: data.status === "ACTIVE" ? gate.id : null,
      },
    });
    return NextResponse.json({ ok: true, partner });
  }

  if (action === "update") {
    if (!data?.id) return NextResponse.json({ error: "id required" }, { status: 400 });
    const patch: any = {};
    const editable = [
      "name", "contactEmail", "contactPhone", "customLandingSlug",
      "rewardType", "rewardValueRs", "refereeDiscountRs",
      "gymAddress", "gymManagerName",
      "bio", "specialty", "profilePhotoUrl", "socialHandle", "followerCount",
      "qualification", "registrationNumber", "clinicName", "credentialDocUrl", "hospitalAffiliation",
      "companyLogoUrl", "allowedEmailDomain", "hrContactName",
      "treasurerContact", "societyAddress",
      "adminNotes", "internalLabel",
    ];
    for (const f of editable) {
      if (data[f] !== undefined) {
        patch[f] = data[f] === "" ? null : data[f];
      }
    }
    if (data.rewardValueRs !== undefined) patch.rewardValueRs = Number(data.rewardValueRs || 0);
    if (data.refereeDiscountRs !== undefined) patch.refereeDiscountRs = Number(data.refereeDiscountRs || 0);
    if (data.followerCount !== undefined) patch.followerCount = data.followerCount ? Number(data.followerCount) : null;

    const updated = await db.partner.update({ where: { id: data.id }, data: patch });
    return NextResponse.json({ ok: true, partner: updated });
  }

  if (action === "setStatus") {
    if (!data?.id || !VALID_STATUSES.includes(data?.status)) {
      return NextResponse.json({ error: "id + valid status required" }, { status: 400 });
    }
    const patch: any = { status: data.status };
    if (data.status === "ACTIVE") {
      patch.approvedAt = new Date();
      patch.approvedById = gate.id;
    }
    const updated = await db.partner.update({ where: { id: data.id }, data: patch });
    return NextResponse.json({ ok: true, partner: updated });
  }

  return NextResponse.json({ error: "unknown action" }, { status: 400 });
}
