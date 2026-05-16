import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL!;

// PayU POSTs to this URL after successful payment
// Verify hash BEFORE trusting anything

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
    const mihpayid    = formData.get("mihpayid")    as string; // PayU payment ID

    // ── Verify hash — PayU reverse formula ──────────────────────────────────
    // Reverse: salt|status|||||||||||email|firstname|productinfo|amount|txnid|key
    const reverseHash = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;
    const expectedHash = crypto.createHash("sha512").update(reverseHash).digest("hex");

    if (hash !== expectedHash) {
      console.error("[PayU] Hash mismatch — possible tampering", { txnid });
      return NextResponse.redirect(`${BASE_URL}/checkout?error=invalid_hash`);
    }

    if (status !== "success") {
      return NextResponse.redirect(`${BASE_URL}/checkout?error=payment_failed&txnid=${txnid}`);
    }

    // ── Payment verified — TODO Phase 3: save order to DB ───────────────────
    // import { prisma } from "@/lib/prisma"
    // await prisma.orders.create({ ... })
    // await prisma.payments.create({ txnid, mihpayid, amount, status: "paid" })

    console.log("[PayU] Payment SUCCESS", { txnid, mihpayid, amount, email });

    // Redirect to order confirmation
    return NextResponse.redirect(`${BASE_URL}/order/success?txnid=${txnid}&amount=${amount}`);
  } catch (err) {
    console.error("[PayU success handler error]", err);
    return NextResponse.redirect(`${BASE_URL}/checkout?error=server_error`);
  }
}

// PayU also sends GET in some flows
export async function GET() {
  return NextResponse.redirect(`${BASE_URL}/plans`);
}
