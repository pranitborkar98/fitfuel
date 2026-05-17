import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// ─── Enum maps (URL param → Prisma enum string values) ───────────────────────
const DIET_MAP: Record<string, string> = {
  veg:    "VEGETARIAN",
  egg:    "EGGETARIAN",
  nonveg: "NON_VEGETARIAN",
  jain:   "VEGETARIAN",
};

const DUR_MAP: Record<string, string> = {
  trial:       "TRIAL_DAY",
  weekly:      "WEEKLY",
  biweekly:    "BI_WEEKLY",
  monthly_ex:  "MONTHLY_EXCL_WEEKENDS",
  monthly:     "ONE_MONTH",
  two_month:   "TWO_MONTH",
  three_month: "THREE_MONTH",
};

const MEAL_MAP: Record<string, string> = {
  bl:  "BREAKFAST_LUNCH",
  sd:  "SNACK_DINNER",
  all: "ALL_FOUR",
};

// ─── Order number generator ───────────────────────────────────────────────────
function genOrderNumber(): string {
  const d   = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  const rnd = Math.floor(1000 + Math.random() * 9000);
  return `FF-COD-${ymd}-${rnd}`;
}

// ─── POST /api/orders/cod ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      firstname,
      lastname,
      email,
      phone,
      address,
      city,
      pincode,
      diet,    // "veg" | "egg" | "nonveg" | "jain"
      dur,     // "trial" | "weekly" | ...
      meal,    // "bl" | "sd" | "all"
      price,   // number — plan price excl. GST
    } = body;

    // ── Validate ──────────────────────────────────────────────────────────────
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

    // ── 1. Upsert User (guest — linked by email when auth lands in Phase 4) ──
    const user = await prisma.user.upsert({
      where:  { email },
      update: { phone, name: `${firstname}${lastname ? " " + lastname : ""}` },
      create: {
        email,
        phone,
        name: `${firstname}${lastname ? " " + lastname : ""}`,
      },
    });

    // ── 2. Create Address ─────────────────────────────────────────────────────
    const addr = await prisma.address.create({
      data: {
        userId:  user.id,
        line1:   address,
        area:    city,
        city:    city,
        pincode: pincode,
      },
    });

    // ── 3. Create Order + Payment in a transaction ────────────────────────────
    const orderNumber = genOrderNumber();

    const order = await prisma.$transaction(async (tx: typeof prisma) => {
      const o = await tx.order.create({
        data: {
          userId:        user.id,
          addressId:     addr.id,
          orderNumber,
          status:        "CONFIRMED",
          subtotalRs:    subtotal,
          gstRs:         gst,
          totalRs:       total,
          paymentMethod: "CASH_ON_DELIVERY",
          paymentStatus: "PENDING",
          notes: JSON.stringify({ diet, dur, meal, isJain: diet === "jain" }),
        },
      });

      // OrderItem — productId is null until products seeded in Phase 15
      await tx.orderItem.create({
        data: {
          orderId:     o.id,
          productId:   null,             // ← requires schema migration (see below)
          diet:        dietEnum,
          duration:    durEnum,
          mealsPerDay: mealEnum,
          priceRs:     subtotal,
          gstRs:       gst,
          totalRs:     total,
          quantity:    1,
        },
      });

      await tx.payment.create({
        data: {
          orderId:  o.id,
          method:   "CASH_ON_DELIVERY",
          status:   "PENDING",
          amountRs: total,
        },
      });

      return o;
    });

    console.log("[COD Order saved]", { orderNumber, userId: user.id, total });

    return NextResponse.json({
      success:     true,
      orderNumber: order.orderNumber,
      orderId:     order.id,
      total,
    });

  } catch (err) {
    console.error("[COD order error]", err);
    return NextResponse.json({ error: "Failed to save order" }, { status: 500 });
  }
}