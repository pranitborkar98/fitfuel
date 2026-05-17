/* eslint-disable @typescript-eslint/no-explicit-any */
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

function genOrderNumber(): string {
  const d = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`;
  return `FF-COD-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { firstname, lastname, email, phone, address, city, pincode, diet, dur, meal, price } = body;

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

   // 1. Upsert user — if auth user already exists (has Account), use them directly.
//    Otherwise upsert a guest row (will be merged on first Google sign-in).
const existingUser = await (prisma as any).user.findFirst({
  where:   { email },
  include: { accounts: true },
});

const user = existingUser
  ? await (prisma as any).user.update({
      where:  { id: existingUser.id },
      data:   { phone, name: `${firstname}${lastname ? " " + lastname : ""}` },
    })
  : await (prisma as any).user.create({
      data: { email, phone, name: `${firstname}${lastname ? " " + lastname : ""}` },
    });

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
        notes: JSON.stringify({ diet, dur, meal, isJain: diet === "jain" }),
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

    console.log("[COD Order saved]", { orderNumber, userId: user.id, total });

    return NextResponse.json({ success: true, orderNumber: order.orderNumber, orderId: order.id, total });

  } catch (err) {
    console.error("[COD order error]", err);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}