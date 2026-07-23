/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";

const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL!;

// ─── Label → Enum maps (mirrors COD route) ────────────────────────────────────
const DIET_LABEL_MAP: Record<string, string> = {
  "Vegetarian":     "VEGETARIAN",
  "Eggetarian":     "EGGETARIAN",
  "Non-Vegetarian": "NON_VEGETARIAN",
  "Jain":           "VEGETARIAN", // Jain maps to VEGETARIAN enum same as COD
};
const DUR_LABEL_MAP: Record<string, string> = {
  "Trial Day":                  "TRIAL_DAY",
  "Weekly (7 days)":            "WEEKLY",
  "Bi-weekly (15 days)":        "BI_WEEKLY",
  "Monthly excl. weekends":     "MONTHLY_EXCL_WEEKENDS",
  "1 Month":                    "ONE_MONTH",
  "2 Months":                   "TWO_MONTH",
  "3 Months":                   "THREE_MONTH",
};
const MEAL_LABEL_MAP: Record<string, string> = {
  "Breakfast + Lunch": "BREAKFAST_LUNCH",
  "Snack + Dinner":    "SNACK_DINNER",
  "All 4 meals":       "ALL_FOUR",
};

// ─── Parse productinfo string ─────────────────────────────────────────────────
// Format: "FitFuel {duration} · {meal} · {diet}"
// e.g.   "FitFuel Monthly excl. weekends · Snack + Dinner · Vegetarian"
function parseProductInfo(productinfo: string): {
  dietEnum: string | null;
  durEnum:  string | null;
  mealEnum: string | null;
} {
  // Strip "FitFuel " prefix, then split on " · "
  const stripped = productinfo.replace(/^FitFuel\s+/, "");
  const parts    = stripped.split(" · ");

  if (parts.length !== 3) {
    return { dietEnum: null, durEnum: null, mealEnum: null };
  }

  const [durLabel, mealLabel, dietLabel] = parts;

  return {
    durEnum:  DUR_LABEL_MAP[durLabel.trim()]  ?? null,
    mealEnum: MEAL_LABEL_MAP[mealLabel.trim()] ?? null,
    dietEnum: DIET_LABEL_MAP[dietLabel.trim()] ?? null,
  };
}

// ─── Order number generator ───────────────────────────────────────────────────
function genOrderNumber(): string {
  const d   = new Date();
  const ymd = `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, "0")}${String(d.getDate()).padStart(2, "0")}`;
  return `FF-PAY-${ymd}-${Math.floor(1000 + Math.random() * 9000)}`;
}

// ─── POST — PayU callback ─────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const status      = formData.get("status")      as string;
    const txnid       = formData.get("txnid")       as string;
    const amount      = formData.get("amount")      as string;
    const productinfo = formData.get("productinfo") as string;
    const firstname   = formData.get("firstname")   as string;
    const email       = formData.get("email")       as string;
    const hash        = formData.get("hash")        as string;
    const mihpayid    = formData.get("mihpayid")    as string;
    const phone       = (formData.get("phone")      as string) || "";
    const address     = (formData.get("address")    as string) || ""; // "line1, City - pincode"

    // ── 1. Verify hash ────────────────────────────────────────────────────────
    const reverseHash  = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;
    const expectedHash = crypto.createHash("sha512").update(reverseHash).digest("hex");

    if (hash !== expectedHash) {
      console.error("[PayU] Hash mismatch", { txnid });
      return NextResponse.redirect(`${BASE_URL}/checkout?error=invalid_hash`);
    }

    // ── 2. Payment not successful ─────────────────────────────────────────────
    if (status !== "success") {
      return NextResponse.redirect(`${BASE_URL}/checkout?error=payment_failed&txnid=${txnid}`);
    }

    console.log("[PayU] Payment SUCCESS", { txnid, mihpayid, amount, email });

    // ── 3. Idempotency — skip DB write if txnid already saved ─────────────────
    try {
      const existing = await (prisma as any).payment.findFirst({
        where: { txnid },
      });
      if (existing) {
        console.log("[PayU] Duplicate callback, txnid already saved, skipping", { txnid });
        return NextResponse.redirect(`${BASE_URL}/order/confirmation?txnid=${txnid}&amount=${amount}`);
      }
    } catch (dbCheckErr) {
      // If check fails, continue — worst case is a duplicate; log and proceed
      console.error("[PayU] Idempotency check failed", dbCheckErr);
    }

    // ── 4. Skip DB write for test transactions ────────────────────────────────
    const isTest = productinfo === "FitFuel TEST TRANSACTION, ignore";

    if (!isTest) {
      const amountNum = parseFloat(amount);
      const subtotal  = Math.round(amountNum / 1.05);  // reverse-calc pre-GST price
      const gst       = amountNum - subtotal;
      const total     = amountNum;

      const { dietEnum, durEnum, mealEnum } = parseProductInfo(productinfo);

      // 4a. Upsert guest user
      const user = await (prisma as any).user.upsert({
        where:  { email },
        update: { phone: phone || undefined, name: firstname },
        create: { email, phone: phone || null, name: firstname },
      });

      // 4b. Create address (best-effort — PayU only sends concatenated string)
      const addr = await (prisma as any).address.create({
        data: {
          userId: user.id,
          line1:  address || "Not provided",
          area:   "Pune",
          city:   "Pune",
          pincode: "000000", // not available from PayU callback
        },
      });

      // 4c. Create order
      const orderNumber = genOrderNumber();
      const order = await (prisma as any).order.create({
        data: {
          userId:        user.id,
          addressId:     addr.id,
          orderNumber,
          status:        "CONFIRMED",
          subtotalRs:    subtotal,
          gstRs:         Math.round(gst),
          totalRs:       Math.round(total),
          paymentMethod: "ONLINE",
          paymentStatus: "SUCCESS",
          notes: JSON.stringify({ productinfo, txnid, mihpayid }),
        },
      });

      // 4d. Create order item
      await (prisma as any).orderItem.create({
        data: {
          orderId:    order.id,
          productId:  null,               // populated in Phase 15 when products are seeded
          diet:       dietEnum  || "VEGETARIAN",
          duration:   durEnum   || "ONE_MONTH",
          mealsPerDay: mealEnum || "SNACK_DINNER",
          priceRs:    subtotal,
          gstRs:      Math.round(gst),
          totalRs:    Math.round(total),
          quantity:   1,
        },
      });

      // 4e. Create payment record
      await (prisma as any).payment.create({
        data: {
          orderId:  order.id,
          method:   "ONLINE",
          status:   "SUCCESS",
          txnid,
          mihpayid,                       // ← PayU's internal ID — needed for refunds
          amountRs: Math.round(total),
        },
      });

      console.log("[PayU] Order saved to DB", { orderNumber, userId: user.id, total, txnid, mihpayid });
    } else {
      console.log("[PayU] Test transaction, skipping DB save", { txnid });
    }

    return NextResponse.redirect(`${BASE_URL}/order/confirmation?txnid=${txnid}&amount=${amount}`);

  } catch (err) {
    console.error("[PayU success handler error]", err);
    // Still redirect to confirmation — payment was successful even if DB write failed
    // The txnid + mihpayid will be in Vercel logs for manual recovery
    return NextResponse.redirect(`${BASE_URL}/checkout?error=server_error`);
  }
}

// ─── GET — fallback ───────────────────────────────────────────────────────────
export async function GET() {
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/plans`);
}