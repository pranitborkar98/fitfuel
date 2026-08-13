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

const PAYU_KEY = process.env.PAYU_MERCHANT_KEY!;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const PAYU_URL = "https://secure.payu.in/_payment";

function genOrderNumber(): string {
  return `FF${Date.now().toString(36).toUpperCase()}${Math.floor(Math.random() * 900 + 100)}`;
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

async function upsertCustomer(email: string, phone: string, name: string) {
  let user = await prisma.user.findFirst({ where: { email } });
  if (!user && phone) user = await prisma.user.findFirst({ where: { phone } });
  const phoneOwner = phone ? await prisma.user.findFirst({ where: { phone } }) : null;

  if (user) {
    const data: { name: string; phone?: string } = { name };
    if (phone && (!phoneOwner || phoneOwner.id === user.id)) data.phone = phone;
    return prisma.user.update({ where: { id: user.id }, data });
  }
  const data: { email: string; name: string; phone?: string } = { email, name };
  if (phone && !phoneOwner) data.phone = phone;
  return prisma.user.create({ data });
}

export async function POST(req: NextRequest) {
  try {
    const rl = await enforceRateLimit(req, "checkout");
    if (!rl.ok) return rl.response;

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

    const user = await upsertCustomer(email, phone, firstname);
    const addr = await prisma.address.create({
      data: {
        userId: user.id,
        line1: address,
        area: city ?? "Pune",
        city: city ?? "Pune",
        pincode,
      },
    });

    const payuAmount = bill.totalRs.toFixed(2);
    const txnid = `FD${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const productinfo = `FitFuel ${resolved.length} dish${resolved.length === 1 ? "" : "es"}`;

    // Identical formula to the plan route. All udf fields empty.
    const hashString = `${PAYU_KEY}|${txnid}|${payuAmount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    await prisma.order.create({
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

    return NextResponse.json({
      payuUrl: PAYU_URL,
      key: PAYU_KEY,
      txnid,
      amount: payuAmount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/success`,
      furl: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/failed`,
      service_provider: "payu_paisa",
      receipt: bill,
    });
  } catch (err) {
    console.error("[dish order init error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
