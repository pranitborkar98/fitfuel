/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/cod/route.ts
// 16A: order_confirmed + staff_new_order notifications
// 17A: capture ?ref cookie -> Order.referralAttribution + processReferralReward

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { fireNotification, notifyStaffByRoles } from "@/lib/notify";
import { processReferralReward } from "@/lib/partners";

const DIET_MAP: Record<string, string> = {
  veg: "VEGETARIAN", egg: "EGGETARIAN", nonveg: "NON_VEGETARIAN", jain: "VEGETARIAN",
};
const DUR_MAP: Record<string, string> = {
  trial: "TRIAL_DAY", weekly: "WEEKLY", biweekly: "BI_WEEKLY",
  monthly_ex: "MONTHLY_EXCL_WEEKENDS", monthly: "ONE_MONTH",
  two_month: "TWO_MONTH", three_month: "THREE_MONTH",
};
const MEAL_MAP: Record<string, string> = {
  bl: "BREAKFAST_LUNCH", sd: "SNACK_DINNER", all: "ALL_FOUR",
};
const DUR_DAYS: Record<string, number> = {
  TRIAL_DAY: 1, WEEKLY: 7, BI_WEEKLY: 14,
  MONTHLY_EXCL_WEEKENDS: 26, ONE_MONTH: 30,
  TWO_MONTH: 60, THREE_MONTH: 90,
};

function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `FF-COD-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

async function upsertCustomer(email: string, phone: string, name: string) {
  let user = await (prisma as any).user.findFirst({ where: { email } });
  if (!user && phone) user = await (prisma as any).user.findFirst({ where: { phone } });
  const phoneOwner = phone ? await (prisma as any).user.findFirst({ where: { phone } }) : null;
  if (user) {
    const data: any = { name };
    if (phone && (!phoneOwner || phoneOwner.id === user.id)) data.phone = phone;
    return (prisma as any).user.update({ where: { id: user.id }, data });
  }
  const data: any = { email, name };
  if (phone && !phoneOwner) data.phone = phone;
  return (prisma as any).user.create({ data });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstname, lastname, email, phone, address, city, pincode, diet, dur, meal, price, deliveryWindow } = body;

    if (!firstname || !email || !phone || !address || !pincode || !diet || !dur || !meal || !price) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const dietEnum = DIET_MAP[diet];
    const durEnum  = DUR_MAP[dur];
    const mealEnum = MEAL_MAP[meal];
    if (!dietEnum || !durEnum || !mealEnum) {
      return NextResponse.json({ error: "Invalid plan parameters" }, { status: 400 });
    }

    const subtotal = Math.round(Number(price));
    const gst      = Math.round(subtotal * 0.05);
    const total    = subtotal + gst;

    const user = await upsertCustomer(email, phone, `${firstname}${lastname ? " " + lastname : ""}`);

    // ── Phase 17A: capture ref from cookie OR body, snapshot on Order ──
    const refFromBody: string | undefined = body.refCode;
    const refFromCookie = req.cookies.get("ff_ref")?.value;
    const refSnapshot = (refFromBody || refFromCookie || "").slice(0, 64) || null;

    // Also stamp the user's referredByPartnerCode if not yet set (first-touch)
    if (refSnapshot) {
      const existingAttribution = await (prisma as any).user.findUnique({
        where: { id: user.id },
        select: { referredByPartnerCode: true },
      });
      if (!existingAttribution?.referredByPartnerCode) {
        await (prisma as any).user.update({
          where: { id: user.id },
          data: { referredByPartnerCode: refSnapshot },
        });
      }
    }

    const addr = await (prisma as any).address.create({
      data: { userId: user.id, line1: address, area: city, city, pincode },
    });

    const orderNumber = genOrderNumber();
    const order = await (prisma as any).order.create({
      data: {
        userId: user.id, addressId: addr.id, orderNumber,
        status: "CONFIRMED", subtotalRs: subtotal, gstRs: gst, totalRs: total,
        paymentMethod: "CASH_ON_DELIVERY", paymentStatus: "PENDING",
        referralAttribution: refSnapshot,
        notes: JSON.stringify({ diet, dur, meal, deliveryWindow: deliveryWindow === "EVENING" ? "EVENING" : "MORNING", isJain: diet === "jain" }),
      },
    });

    await (prisma as any).orderItem.create({
      data: {
        orderId: order.id, productId: null,
        diet: dietEnum, duration: durEnum, mealsPerDay: mealEnum,
        priceRs: subtotal, gstRs: gst, totalRs: total, quantity: 1,
      },
    });

    await (prisma as any).payment.create({
      data: { orderId: order.id, method: "CASH_ON_DELIVERY", status: "PENDING", amountRs: total },
    });

    const startDate = new Date();
    const days = DUR_DAYS[durEnum] ?? 30;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    const mealPlan =
      (await (prisma as any).mealPlan.findUnique({ where: { slug: "weight-loss-veg" } })) ??
      (await (prisma as any).mealPlan.findFirst({ where: { isActive: true } })) ??
      (await (prisma as any).mealPlan.findFirst());

    if (mealPlan) {
      await (prisma as any).userActivePlan.create({
        data: {
          userId: user.id,
          mealPlanId: mealPlan.id,
          orderId: order.id,
          startDate, endDate, currentDay: 1, status: "active",
          mealsPerDay: mealEnum as any,
          duration: durEnum as any,
          deliveryWindow: (deliveryWindow === "EVENING" ? "EVENING" : "MORNING") as any,
          skipDates: [],
        },
      });
    } else {
      console.error("[COD] No meal plan to attach", { orderNumber });
    }

    console.log("[COD Order saved]", { orderNumber, userId: user.id, total });

    // ════════════════════ NOTIFICATIONS (16A) ════════════════════
    try {
      const planName = (mealPlan as any)?.displayName || (mealPlan as any)?.slug || "Meal Plan";
      fireNotification({
        userId: user.id,
        toEmail: user.email,
        toPhone: user.phone || undefined,
        toName: user.name,
        templateKey: "order_confirmed",
        vars: { orderNumber: order.orderNumber, planName, amount: String(total) },
      });
      notifyStaffByRoles(["OWNER", "ADMIN"], "staff_new_order", {
        orderNumber: order.orderNumber,
        customerName: user.name,
        planName,
        amount: String(total),
      });
    } catch (e) {
      console.error("[COD] notification dispatch failed", e);
    }

    // ════════════════════ REFERRAL REWARD (17A) ════════════════════
    try {
      await processReferralReward(order.id);
    } catch (e) {
      console.error("[COD] referral reward processing failed", e);
    }

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id, total });

  } catch (err) {
    console.error("[COD order error]", err);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}
