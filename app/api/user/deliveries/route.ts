// app/api/user/deliveries/route.ts
// Phase 15C-CONFIRM — the customer side of the delivery handshake.
// GET  -> the user's recently dispatched deliveries (last 7 days)
// POST -> { deliveryId, action: 'confirm' | 'issue', note? }
//         'confirm' sets customerConfirmedAt; 'issue' sets customerIssueNote.
// Both verify the delivery belongs to the signed-in user (via order.userId).
// Phase 16A: on 'issue', fires delivery_issue_ack (customer) + staff_delivery_issue (OWNER/DISPATCH).

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { fireNotification, notifyStaffByRoles } from "@/lib/notify";

export const dynamic = "force-dynamic";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const since = new Date();
  since.setDate(since.getDate() - 7);

  const deliveries = await (prisma as any).delivery.findMany({
    where: {
      order: { userId: session.user.id },
      status: { in: ["OUT_FOR_DELIVERY", "DELIVERED"] },
      deliveryDate: { gte: since },
    },
    orderBy: { deliveryDate: "desc" },
    select: {
      id: true,
      deliveryDate: true,
      status: true,
      mealsIncluded: true,
      deliveryWindow: true,
      deliveredAt: true,
      customerConfirmedAt: true,
      customerIssueNote: true,
    },
  });

  return NextResponse.json({ deliveries });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const deliveryId: string | undefined = body?.deliveryId;
  const action: string | undefined = body?.action; // 'confirm' | 'issue'
  const note: string | undefined =
    typeof body?.note === "string" ? body.note.trim().slice(0, 500) : undefined;

  if (!deliveryId || (action !== "confirm" && action !== "issue")) {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
  if (action === "issue" && !note) {
    return NextResponse.json({ error: "Please describe the issue." }, { status: 400 });
  }

  // ── Ownership check: delivery must belong to one of this user's orders ──
  // (Widened select for Phase 16A so staff alert can include orderNumber.)
  const owned = await (prisma as any).delivery.findFirst({
    where: { id: deliveryId, order: { userId: session.user.id } },
    select: {
      id: true,
      order: { select: { orderNumber: true } },
    },
  });
  if (!owned) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const updated = await (prisma as any).delivery.update({
    where: { id: deliveryId },
    data:
      action === "confirm"
        ? { customerConfirmedAt: new Date() }
        : { customerIssueNote: note },
    select: { id: true, customerConfirmedAt: true, customerIssueNote: true },
  });

  // ────────────── Phase 16A: notifications on 'issue' ──────────────
  if (action === "issue") {
    try {
      const user = await (prisma as any).user.findUnique({
        where: { id: session.user.id },
        select: { name: true, email: true, phone: true },
      });
      fireNotification({
        userId: session.user.id,
        templateKey: "delivery_issue_ack",
        vars: { name: user?.name || "" },
      });
      notifyStaffByRoles(["OWNER", "DISPATCH"], "staff_delivery_issue", {
        customerName: user?.name || "Customer",
        orderNumber:  owned.order?.orderNumber || "?",
        issue:        note || "(no note)",
      });
    } catch (e) {
      console.error("[user/deliveries] issue-notify failed (non-blocking)", e);
    }
  }

  return NextResponse.json({ ok: true, delivery: updated });
}
