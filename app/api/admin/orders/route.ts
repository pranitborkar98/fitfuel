// app/api/admin/orders/route.ts
// Phase 15F — order payment reconciliation.
//   POST { action:"setPaymentStatus", id, paymentStatus }
// Orders surface (OWNER/ADMIN). Marking SUCCESS on a still-unpaid order also
// flips its status to CONFIRMED (manual / COD reconciliation). This records the
// payment for revenue + status; it does not re-run checkout/fulfilment automation.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const db = prisma as any;

const ALLOWED = ["PENDING", "SUCCESS", "FAILED", "REFUNDED"];

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("orders");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string; paymentStatus?: string };

  if (body.action === "setPaymentStatus") {
    if (!body.id || !ALLOWED.includes(body.paymentStatus ?? "")) {
      return NextResponse.json({ error: "Bad request" }, { status: 400 });
    }
    try {
      const data: any = { paymentStatus: body.paymentStatus };
      if (body.paymentStatus === "SUCCESS") {
        const cur = await db.order.findUnique({ where: { id: body.id }, select: { status: true } });
        if (cur && (cur.status === "PENDING_PAYMENT" || cur.status === "PAYMENT_FAILED")) {
          data.status = "CONFIRMED";
        }
      }
      const order = await db.order.update({
        where: { id: body.id },
        data,
        select: { id: true, paymentStatus: true, status: true },
      });
      return NextResponse.json({ ok: true, order });
    } catch {
      return NextResponse.json({ error: "Update failed" }, { status: 400 });
    }
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
