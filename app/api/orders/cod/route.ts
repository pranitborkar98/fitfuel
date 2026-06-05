/* eslint-disable @typescript-eslint/no-explicit-any */
// app/api/orders/cod/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

// How many delivery days each duration gives
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


// Safe customer upsert — phone is @unique, so never assign a phone that
// already belongs to a different user (that caused P2002 on update).
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

    // 1. Upsert user (phone-collision safe)
    const user = await upsertCustomer(email, phone, `${firstname}${lastname ? " " + lastname : ""}`);

    // 2. Create address
    const addr = await (prisma as any).address.create({
      data: { userId: user.id, line1: address, area: city, city, pincode },
    });

    // 3. Create order
    const orderNumber = genOrderNumber();
    const order = await (prisma as any).order.create({
      data: {
        userId: user.id, addressId: addr.id, orderNumber,
        status: "CONFIRMED", subtotalRs: subtotal, gstRs: gst, totalRs: total,
        paymentMethod: "CASH_ON_DELIVERY", paymentStatus: "PENDING",
        notes: JSON.stringify({ diet, dur, meal, deliveryWindow: deliveryWindow === "EVENING" ? "EVENING" : "MORNING", isJain: diet === "jain" }),
      },
    });

    // 4. Create order item
    await (prisma as any).orderItem.create({
      data: {
        orderId: order.id, productId: null,
        diet: dietEnum, duration: durEnum, mealsPerDay: mealEnum,
        priceRs: subtotal, gstRs: gst, totalRs: total, quantity: 1,
      },
    });

    // 5. Create payment record
    await (prisma as any).payment.create({
      data: {
        orderId: order.id, method: "CASH_ON_DELIVERY",
        status: "PENDING", amountRs: total,
      },
    });

    // 6. Create UserActivePlan so delivery generator picks this customer up
    const startDate = new Date();
    const days = DUR_DAYS[durEnum] ?? 30;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    // ── FIX (Decision: always attach to weight-loss-veg, the only active plan) ──
    // Previously: prisma.mealPlan.findFirst() → returned an ARBITRARY plan.
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
          startDate,
          endDate,
          currentDay: 1,
          status: "active",
          mealsPerDay: mealEnum as any,
          duration: durEnum as any,
          deliveryWindow: (deliveryWindow === "EVENING" ? "EVENING" : "MORNING") as any,
          skipDates: [],
        },
      });
    } else {
      console.error("[COD] No meal plan found to attach — manual fix needed", { orderNumber });
    }

    console.log("[COD Order saved]", { orderNumber, userId: user.id, total });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id, total });

  } catch (err) {
    console.error("[COD order error]", err);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}