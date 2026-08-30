// Manual partner payout export and reconciliation. OWNER/ADMIN only.

import { requireApiRole } from "@/lib/admin-auth";
import { sendNotification } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import {
  decryptPartnerSensitiveFields,
  SensitiveDataConfigurationError,
} from "@/lib/sensitive-data";
import { readJson, readQuery } from "@/lib/validation/core";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

const PAYOUT_STATUSES = ["PENDING", "PROCESSING", "PAID", "FAILED"] as const;
const querySchema = z
  .object({
    format: z.enum(["json", "csv"]).default("json"),
    status: z.enum(PAYOUT_STATUSES).optional(),
    period: z.string().regex(/^20\d{2}-(0[1-9]|1[0-2])$/, "Use a YYYY-MM period.").optional(),
  })
  .strict();
const actionSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("markPaid"),
    id: z.string().cuid(),
    paymentRef: z.string().trim().min(3, "Payment reference is required.").max(200),
  }).strict(),
  z.object({ action: z.literal("markProcessing"), id: z.string().cuid(), paymentRef: z.string().optional() }).strict(),
  z.object({ action: z.literal("markFailed"), id: z.string().cuid(), paymentRef: z.string().optional() }).strict(),
]);

function csvEscape(value: unknown): string {
  if (value === null || value === undefined) return "";
  let text = String(value).replace(/\r?\n/g, " ");
  if (/^[=+\-@]/.test(text)) text = `'${text}`;
  if (text.includes(",") || text.includes("\"") || text.includes("\n")) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("partners");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = readQuery(req, querySchema);
  if (!parsed.ok) return parsed.response;
  const query = parsed.data;
  const where: Prisma.PartnerPayoutWhereInput = {
    ...(query.status ? { status: query.status } : {}),
    ...(query.period ? { periodYearMonth: query.period } : {}),
  };

  const payouts = await prisma.partnerPayout.findMany({
    where,
    orderBy: [{ periodYearMonth: "desc" }, { createdAt: "desc" }],
    take: 2_000,
    include: {
      partner: {
        select: {
          id: true,
          code: true,
          name: true,
          type: true,
          rewardType: true,
          contactEmail: true,
          contactPhone: true,
          panNumber: true,
          bankAccountName: true,
          bankAccountNumber: true,
          bankIfsc: true,
        },
      },
    },
  });

  let readablePayouts;
  try {
    readablePayouts = payouts.map((payout) => ({
      ...payout,
      partner: decryptPartnerSensitiveFields(payout.partner),
    }));
  } catch (error: unknown) {
    console.error("[admin/partners/payouts] could not decrypt payout data", error);
    return NextResponse.json(
      { error: error instanceof SensitiveDataConfigurationError ? "Payout data is not configured." : "Payout data could not be read." },
      { status: 503 },
    );
  }

  if (query.format === "json") {
    return NextResponse.json({
      payouts: readablePayouts.map((payout) => ({
        id: payout.id,
        partnerId: payout.partnerId,
        partnerName: payout.partner.name,
        partnerCode: payout.partner.code,
        partnerType: payout.partner.type,
        rewardType: payout.partner.rewardType,
        periodYearMonth: payout.periodYearMonth,
        amountRs: payout.amountRs,
        referralCount: payout.referralCount,
        status: payout.status,
        paidAt: payout.paidAt,
        paymentRef: payout.paymentRef,
        createdAt: payout.createdAt,
        contactEmail: payout.partner.contactEmail,
        contactPhone: payout.partner.contactPhone,
        bankAccountName: payout.partner.bankAccountName,
        bankAccountNumber: payout.partner.bankAccountNumber,
        bankIfsc: payout.partner.bankIfsc,
        panNumber: payout.partner.panNumber,
      })),
    });
  }

  const headers = [
    "PayoutId", "Period", "PartnerName", "PartnerCode", "PartnerType", "RewardType",
    "AmountRs", "ReferralCount", "Status", "PaidAt", "PaymentRef", "ContactEmail",
    "ContactPhone", "BankHolderName", "BankAccountNumber", "BankIFSC", "PAN", "CreatedAt",
  ];
  const rows = readablePayouts.map((payout) => [
    payout.id,
    payout.periodYearMonth,
    payout.partner.name,
    payout.partner.code,
    payout.partner.type,
    payout.partner.rewardType,
    payout.amountRs,
    payout.referralCount,
    payout.status,
    payout.paidAt?.toISOString() || "",
    payout.paymentRef || "",
    payout.partner.contactEmail || "",
    payout.partner.contactPhone || "",
    payout.partner.bankAccountName || "",
    payout.partner.bankAccountNumber || "",
    payout.partner.bankIfsc || "",
    payout.partner.panNumber || "",
    payout.createdAt.toISOString(),
  ].map(csvEscape).join(","));
  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `fitfuel-payouts${query.period ? `-${query.period}` : ""}${query.status ? `-${query.status.toLowerCase()}` : ""}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("partners");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, actionSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    const payout = await prisma.partnerPayout.findUnique({
      where: { id: body.id },
      select: {
        id: true,
        status: true,
        amountRs: true,
        periodYearMonth: true,
        partner: { select: { ownerUserId: true, name: true } },
      },
    });
    if (!payout) return NextResponse.json({ error: "Payout not found." }, { status: 404 });
    if (payout.status === "PAID") {
      return NextResponse.json({ error: "A paid payout is final and cannot be changed." }, { status: 409 });
    }

    if (body.action === "markProcessing") {
      if (payout.status !== "PENDING" && payout.status !== "FAILED") {
        return NextResponse.json({ error: "Only pending or failed payouts can move to processing." }, { status: 409 });
      }
      const claimed = await prisma.partnerPayout.updateMany({
        where: { id: body.id, status: { in: ["PENDING", "FAILED"] } },
        data: { status: "PROCESSING", paidAt: null, paymentRef: null },
      });
      if (claimed.count !== 1) return NextResponse.json({ error: "Payout changed. Refresh and try again." }, { status: 409 });
    } else if (body.action === "markFailed") {
      if (payout.status !== "PROCESSING") {
        return NextResponse.json({ error: "Only a processing payout can be marked failed." }, { status: 409 });
      }
      const claimed = await prisma.partnerPayout.updateMany({
        where: { id: body.id, status: "PROCESSING" },
        data: { status: "FAILED", paidAt: null, paymentRef: null },
      });
      if (claimed.count !== 1) return NextResponse.json({ error: "Payout changed. Refresh and try again." }, { status: 409 });
    } else {
      if (payout.status !== "PENDING" && payout.status !== "PROCESSING") {
        return NextResponse.json({ error: "Only pending or processing payouts can be marked paid." }, { status: 409 });
      }
      const claimed = await prisma.partnerPayout.updateMany({
        where: { id: body.id, status: { in: ["PENDING", "PROCESSING"] } },
        data: { status: "PAID", paidAt: new Date(), paymentRef: body.paymentRef },
      });
      if (claimed.count !== 1) return NextResponse.json({ error: "Payout changed. Refresh and try again." }, { status: 409 });

      if (payout.partner.ownerUserId) {
        await sendNotification({
          userId: payout.partner.ownerUserId,
          templateKey: "partner_payout_paid",
          vars: {
            partnerName: payout.partner.name,
            amountRs: String(payout.amountRs),
            period: payout.periodYearMonth,
            paymentRef: body.paymentRef,
          },
        }).catch((error: unknown) => console.error("[admin/partners/payouts] paid notification failed", error));
      }
    }

    const updated = await prisma.partnerPayout.findUniqueOrThrow({ where: { id: body.id } });
    return NextResponse.json({ ok: true, payout: updated });
  } catch (error: unknown) {
    console.error("[admin/partners/payouts] update failed", error);
    return NextResponse.json({ error: "Payout update failed." }, { status: 500 });
  }
}
