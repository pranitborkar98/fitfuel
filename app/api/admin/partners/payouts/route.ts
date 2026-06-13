// app/api/admin/partners/payouts/route.ts
// Phase 17C-1 — Payout admin actions.
//
// GET  ?format=csv&status=PENDING  → CSV download of payouts (filterable)
// GET  ?format=csv&period=2026-06  → CSV of one period
// POST { action: "markPaid", id, paymentRef }      → set status=PAID, paidAt=now, paymentRef
// POST { action: "markProcessing", id }            → set status=PROCESSING
// POST { action: "markFailed", id }                → set status=FAILED
//
// Per Decision #122: cash payouts via CSV export → manual UPI in business banking → mark paid here.

import { NextRequest, NextResponse } from "next/server";
import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { fireNotification } from "@/lib/notify";

const db = prisma as any;

function csvEscape(v: any): string {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    return `"${s.replace(/"/g, "\"\"")}"`;
  }
  return s;
}

export async function GET(req: NextRequest) {
  const me = await requireApiRole("partners");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "json").toLowerCase();
  const status = url.searchParams.get("status") || undefined; // PENDING / PROCESSING / PAID / FAILED
  const period = url.searchParams.get("period") || undefined; // YYYY-MM

  const where: any = {};
  if (status) where.status = status;
  if (period) where.periodYearMonth = period;

  const payouts = await db.partnerPayout.findMany({
    where,
    orderBy: [{ periodYearMonth: "desc" }, { createdAt: "desc" }],
    include: {
      partner: {
        select: {
          id: true, code: true, name: true, type: true, rewardType: true,
          contactEmail: true, contactPhone: true,
          panNumber: true, bankAccountName: true, bankAccountNumber: true, bankIfsc: true,
        },
      },
    },
  });

  if (format !== "csv") {
    return NextResponse.json({
      payouts: payouts.map((p: any) => ({
        id: p.id,
        partnerId: p.partnerId,
        partnerName: p.partner?.name,
        partnerCode: p.partner?.code,
        partnerType: p.partner?.type,
        rewardType: p.partner?.rewardType,
        periodYearMonth: p.periodYearMonth,
        amountRs: p.amountRs,
        referralCount: p.referralCount,
        status: p.status,
        paidAt: p.paidAt,
        paymentRef: p.paymentRef,
        createdAt: p.createdAt,
        contactEmail: p.partner?.contactEmail,
        contactPhone: p.partner?.contactPhone,
        bankAccountName: p.partner?.bankAccountName,
        bankAccountNumber: p.partner?.bankAccountNumber,
        bankIfsc: p.partner?.bankIfsc,
        panNumber: p.partner?.panNumber,
      })),
    });
  }

  // CSV
  const headers = [
    "PayoutId", "Period", "PartnerName", "PartnerCode", "PartnerType", "RewardType",
    "AmountRs", "ReferralCount", "Status", "PaidAt", "PaymentRef",
    "ContactEmail", "ContactPhone",
    "BankHolderName", "BankAccountNumber", "BankIFSC", "PAN",
    "CreatedAt",
  ];
  const rows = payouts.map((p: any) => [
    p.id, p.periodYearMonth, p.partner?.name, p.partner?.code, p.partner?.type, p.partner?.rewardType,
    p.amountRs, p.referralCount, p.status,
    p.paidAt ? new Date(p.paidAt).toISOString() : "",
    p.paymentRef || "",
    p.partner?.contactEmail || "", p.partner?.contactPhone || "",
    p.partner?.bankAccountName || "", p.partner?.bankAccountNumber || "", p.partner?.bankIfsc || "", p.partner?.panNumber || "",
    p.createdAt ? new Date(p.createdAt).toISOString() : "",
  ].map(csvEscape).join(","));

  const csv = [headers.join(","), ...rows].join("\n");
  const filename = `fitfuel-payouts${period ? "-" + period : ""}${status ? "-" + status.toLowerCase() : ""}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}

export async function POST(req: NextRequest) {
  const me = await requireApiRole("partners");
  if (!me) return NextResponse.json({ error: "forbidden" }, { status: 403 });

  const body = await req.json().catch(() => ({}));
  const action = String(body?.action || "");
  const id = String(body?.id || "");
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  if (action === "markPaid") {
    const paymentRef = body?.paymentRef ? String(body.paymentRef).slice(0, 200) : null;
    const updated = await db.partnerPayout.update({
      where: { id },
      data: { status: "PAID", paidAt: new Date(), paymentRef },
      include: { partner: { select: { ownerUserId: true, name: true } } },
    });

    // Notify the partner-owner that their payout landed
    if (updated.partner?.ownerUserId) {
      fireNotification({
        userId: updated.partner.ownerUserId,
        templateKey: "partner_payout_paid",
        vars: {
          partnerName: updated.partner.name || "",
          amountRs: String(updated.amountRs),
          period: updated.periodYearMonth,
          paymentRef: paymentRef || "(no reference)",
        },
      } as any);
    }
    return NextResponse.json({ ok: true, payout: updated });
  }

  if (action === "markProcessing") {
    const updated = await db.partnerPayout.update({
      where: { id },
      data: { status: "PROCESSING" },
    });
    return NextResponse.json({ ok: true, payout: updated });
  }

  if (action === "markFailed") {
    const updated = await db.partnerPayout.update({
      where: { id },
      data: { status: "FAILED" },
    });
    return NextResponse.json({ ok: true, payout: updated });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
