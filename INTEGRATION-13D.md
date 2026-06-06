# PHASE 13D — INTEGRATION GUIDE

Three touchpoints connect the digital channel to your existing PayU + delivery code.
Files 1–3 (`lib/digital-order.ts`, `lib/activate-digital-plan.ts`, `app/api/coupon/validate/route.ts`)
are already drop-in. The two edits below touch YOUR existing files.

---

## EDIT 1 — Delivery cron MUST skip digital plans (critical)

In your nightly delivery generator (the 11 PM IST cron that turns active plans into Delivery rows),
find the query that loads active plans and add `isDigital: false`:

```ts
// BEFORE
const plans = await prisma.userActivePlan.findMany({
  where: { status: "active", /* ... */ },
});

// AFTER
const plans = await prisma.userActivePlan.findMany({
  where: { status: "active", isDigital: false, /* ... */ },
});
```

Without this, digital customers (who have no address) spawn phantom deliveries onto the dispatch board.

---

## EDIT 2 — PayU success handler activates the digital plan

In your existing PayU success/callback handler, AFTER you mark the Payment SUCCESS and Order CONFIRMED,
branch on digital orders and call `activateDigitalPlan`. Read the plan + duration from the PayU udf
fields you set at initiation (udf2 = durationDays, udf3 = mealPlanId):

```ts
import { activateDigitalPlan } from "@/lib/activate-digital-plan";

// inside the success handler, once payment is confirmed:
if (order.paymentMethod === "PAYU" && payuResponse.udf3 /* mealPlanId present = digital */) {
  await activateDigitalPlan({
    orderId: order.id,
    mealPlanId: payuResponse.udf3,
    durationDays: Number(payuResponse.udf2),
  });
} else {
  // ...your existing physical-plan activation (creates deliveries) stays unchanged...
}
```

`activateDigitalPlan` is idempotent (safe if PayU calls back twice).

---

## EDIT 3 — Digital checkout route (TEMPLATE — needs your PayU helper)

This is the one piece I can't finish without seeing your existing PayU initiation code, because the
hash + request params depend on your merchant key/salt util. Here's the shape; swap the marked line
for your real PayU builder:

```ts
// app/api/checkout/digital/route.ts
import { auth } from "@/lib/auth";
import { createDigitalOrder } from "@/lib/digital-order";
// import { buildPayuRequest } from "@/lib/payu";  // <-- YOUR existing helper

export const runtime = "nodejs";

export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) return new Response("Unauthorized", { status: 401 });

  const { planSlug, duration, couponCode, buyerStateCode } = await req.json();

  const { order, breakdown, payuUdf } = await createDigitalOrder({
    userId: session.user.id, planSlug, duration, couponCode, buyerStateCode,
  });

  // >>> REPLACE with your existing PayU initiation. Pass:
  //     amount = breakdown.totalRs, txnid = order.orderNumber,
  //     udf1/udf2/udf3 = payuUdf, productinfo = planSlug
  // const payu = buildPayuRequest({ amount: breakdown.totalRs, txnid: order.orderNumber, ...payuUdf });
  // return Response.json({ payu });

  return Response.json({ orderId: order.id, totalRs: breakdown.totalRs, payuUdf });
}
```

Key difference from physical checkout: **no addressId, no deliveryWindow** — digital is online-pay only.

---

## TO FINISH 13D, SEND ME:
1. Your **PayU initiation route/helper** (where you build the hash + redirect to PayU) — so I wire EDIT 3 exactly.
2. Your **delivery cron file** (the 11 PM generator) — so I place EDIT 1 in the right query.

With those two, I'll return the finished checkout route + the exact cron diff, and 13D is closed.
```
