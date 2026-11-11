// app/api/orders/dishes/route.ts
//
// À LA CARTE CHECKOUT — the single-meal basket, through PayU.
//
// WHY THIS DID NOT EXIST. lib/menu-cart.ts settled the basket over WhatsApp and
// named the reason: OrderItem required `diet`, `duration` and `mealsPerDay` as
// non-nullable subscription enums and pointed `productId` at MealPlanProduct, so
// a dish line could not be written to an order at all. PayU was wired the whole
// time and simply unreachable for dishes. The 20260813040000 migration widened
// those three columns and added kind/dishId/dishName/addOn*, so this route is
// now possible.
//
// IT MIRRORS app/api/payments/payu/route.ts DELIBERATELY — same hash formula,
// same PENDING_PAYMENT-order-keyed-by-txnid pattern, same success/failure
// callbacks. Two payment integrations that drift apart is how one of them
// quietly stops working.
//
// THE CLIENT NEVER SENDS A PRICE. It sends dish ids, quantities and an add-on
// kind; resolveLines() re-prices every line from lib/menu-alacarte on the
// server and receipt() recomputes delivery, packaging and GST. A basket that
// posts {price: 1} gets charged the real total.

import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson } from "@/lib/validation/core";
import { DISH_BY_ID, MAX_QTY, isOrderable, receipt, resolveLines } from "@/lib/menu-cart";
import { resolveCheckoutCustomer } from "@/lib/checkout-customer";
import { auth } from "@/lib/auth";
import { getPayuConfig } from "@/lib/payu-config";
import { captureCheckoutReferral } from "@/lib/checkout-referral";

function genOrderNumber(): string {
  return `FF${Date.now().toString(36).toUpperCase()}${crypto.randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase()}`;
}

const dishOrderSchema = z.object({
  firstname: z.string().min(1).max(80),
  email: z.string().email().max(160),
  phone: z.string().min(8).max(20),
  address: z.string().min(1).max(300),
  city: z.string().min(1).max(80).optional(),
  pincode: z.string().min(4).max(10),
  deliveryWindow: z.enum(["MORNING", "EVENING"]).optional(),
  lines: z
    .array(
      z.object({
        id: z.string().min(1).max(120),
        qty: z.number().int().min(1).max(MAX_QTY),
        addOn: z.enum(["Veg", "Egg", "Non-veg"]).optional(),
      }),
    )
    .min(1)
    .max(40),
});

export async function POST(req: NextRequest) {
  try {
    const rl = await enforceRateLimit(req, "checkout");
    if (!rl.ok) return rl.response;
    const payu = getPayuConfig();
    if (!payu) {
      console.error("[dish order init] Missing or invalid payment configuration");
      return NextResponse.json({ error: "Online payment is temporarily unavailable." }, { status: 503 });
    }

    const parsed = await readJson(req, dishOrderSchema);
    if (!parsed.ok) return parsed.response;
    const { firstname, email, phone, address, city, pincode, deliveryWindow, lines } = parsed.data;

    /* SERVER-SIDE REPRICING. resolveLines drops unknown ids and clamps qty;
       the provisional Rs 100 rows are then rejected outright, because 32 of the
       48 dishes carry a placeholder price and charging one would be charging a
       number the kitchen never set. */
    const resolved = resolveLines(lines).filter((l) => isOrderable(l.dish));
    if (resolved.length === 0) {
      return NextResponse.json(
        { error: "No priced dishes in this order. Some dishes are price-on-request." },
        { status: 400 },
      );
    }

    const bill = receipt(resolved);
    if (bill.totalRs < 1) {
      return NextResponse.json({ error: "Order total must be at least ₹1." }, { status: 400 });
    }

    const session = await auth();
    const user = await resolveCheckoutCustomer({
      email,
      phone,
      name: firstname,
      authenticatedUserId: session?.user?.id,
    });
    const referral = await captureCheckoutReferral({
      userId: user.id,
      candidateCode: req.cookies.get("ff_ref")?.value,
    });
    const payuAmount = bill.totalRs.toFixed(2);
    const txnid = `FD${Date.now()}${crypto.randomUUID().replace(/-/g, "").slice(0, 8)}`;
    const productinfo = `FitFuel ${resolved.length} dish${resolved.length === 1 ? "" : "es"}`;

    // Identical formula to the plan route. All udf fields empty.
    const hashString = `${payu.key}|${txnid}|${payuAmount}|${productinfo}|${firstname}|${email}|||||||||||${payu.salt}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    await prisma.$transaction(async (tx) => {
      const addr = await tx.address.create({
        data: { userId: user.id, line1: address, area: city ?? "Pune", city: city ?? "Pune", pincode },
      });
      await tx.order.create({
        data: {
          userId: user.id,
          addressId: addr.id,
          orderNumber: genOrderNumber(),
        status: "PENDING_PAYMENT",
        subtotalRs: bill.subtotalRs + bill.deliveryRs + bill.packagingRs,
        gstRs: bill.gstRs,
        totalRs: bill.totalRs,
        paymentMethod: "PAYU",
        paymentStatus: "PENDING",
        payuTxnId: txnid,
        referralAttribution: referral?.code ?? null,
        /* `kind: "DISH"` is what stops the success callback running the
           subscription path and creating a UserActivePlan for a salad. */
        notes: JSON.stringify({
          kind: "DISH",
          deliveryWindow: deliveryWindow ?? "MORNING",
          deliveryRs: bill.deliveryRs,
          packagingRs: bill.packagingRs,
          dishes: resolved.map((l) => ({ id: l.id, qty: l.qty, addOn: l.addOn?.kind ?? null })),
        }),
        items: {
          create: resolved.map((l) => ({
            kind: "DISH" as const,
            dishId: l.id,
            dishName: DISH_BY_ID.get(l.id)?.name ?? l.dish.name,
            addOnKind: l.addOn?.kind ?? null,
            addOnLabel: l.addOn?.what ?? null,
            priceRs: l.lineRs,
            // GST is charged once on the whole basket, not per line.
            gstRs: 0,
            totalRs: l.lineRs,
            quantity: l.qty,
          })),
        },
        payment: {
          create: { method: "PAYU", status: "PENDING", amountRs: bill.totalRs, payuTxnId: txnid },
        },
        },
      });
    });

    return NextResponse.json({
      payuUrl: payu.paymentUrl,
      key: payu.key,
      txnid,
      amount: payuAmount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl: `${payu.baseUrl}/api/payments/payu/success`,
      furl: `${payu.baseUrl}/api/payments/payu/failed`,
      service_provider: "payu_paisa",
      receipt: bill,
    });
  } catch (err) {
    console.error("[dish order init error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
