// Customer side of the delivery receipt and issue-reporting handshake.

import { auth } from "@/lib/auth";
import { todayIndiaDate } from "@/lib/date-only";
import { notifyStaffByRoles, sendNotification } from "@/lib/notify";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { deliveryActionSchema } from "@/lib/validation/schemas";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const rl = await enforceRateLimit(req, "read", session.user.id);
  if (!rl.ok) return rl.response;

  const since = todayIndiaDate();
  since.setUTCDate(since.getUTCDate() - 7);
  const deliveries = await prisma.delivery.findMany({
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
  const rl = await enforceRateLimit(req, "mutation", session.user.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, deliveryActionSchema);
  if (!parsed.ok) return parsed.response;
  const { deliveryId, action } = parsed.data;
  const note = parsed.data.note?.trim();
  if (action === "issue" && !note) {
    return NextResponse.json({ error: "Please describe the issue." }, { status: 400 });
  }

  const owned = await prisma.delivery.findFirst({
    where: { id: deliveryId, order: { userId: session.user.id } },
    select: {
      id: true,
      status: true,
      customerConfirmedAt: true,
      customerIssueNote: true,
      order: { select: { orderNumber: true } },
    },
  });
  if (!owned) return NextResponse.json({ error: "Delivery not found." }, { status: 404 });
  if (owned.status !== "OUT_FOR_DELIVERY" && owned.status !== "DELIVERED") {
    return NextResponse.json({ error: "This delivery is not ready for confirmation yet." }, { status: 409 });
  }
  if (action === "confirm" && owned.customerIssueNote) {
    return NextResponse.json({ error: "This delivery already has an open issue." }, { status: 409 });
  }

  const firstIssue = action === "issue" && !owned.customerIssueNote;
  const updated = await prisma.delivery.update({
    where: { id: deliveryId },
    data:
      action === "confirm"
        ? { customerConfirmedAt: owned.customerConfirmedAt ?? new Date() }
        : { customerIssueNote: note!, customerConfirmedAt: null },
    select: { id: true, customerConfirmedAt: true, customerIssueNote: true },
  });

  if (firstIssue) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { name: true },
    });
    await Promise.allSettled([
      sendNotification({
        userId: session.user.id,
        templateKey: "delivery_issue_ack",
        vars: { name: user?.name || "" },
      }),
      notifyStaffByRoles(["OWNER", "DISPATCH"], "staff_delivery_issue", {
        customerName: user?.name || "Customer",
        orderNumber: owned.order.orderNumber,
        issue: note!,
      }),
    ]);
  }

  return NextResponse.json({ ok: true, delivery: updated });
}
