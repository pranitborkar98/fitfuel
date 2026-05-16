import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

// ─── PayU hash — MUST be server-side only, never expose SALT to browser ───────
// Formula: key|txnid|amount|productinfo|firstname|email|||||||||||salt
// Then SHA512 of that string

const PAYU_KEY  = process.env.PAYU_MERCHANT_KEY!;
const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const PAYU_URL  = "https://secure.payu.in/_payment"; // production

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      firstname,
      email,
      phone,
      amount,       // in INR, string e.g. "7560.00"
      productinfo,  // e.g. "Monthly excl. weekends · Snack + Dinner · Vegetarian"
      address,
    } = body;

    // Validate required fields
    if (!firstname || !email || !phone || !amount || !productinfo) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique transaction ID
    const txnid = `FF${Date.now()}${Math.floor(Math.random() * 1000)}`;

    // Build hash string — PayU formula exactly
    const hashString = `${PAYU_KEY}|${txnid}|${amount}|${productinfo}|${firstname}|${email}|||||||||||${PAYU_SALT}`;
    const hash = crypto.createHash("sha512").update(hashString).digest("hex");

    // Return all params needed for the PayU form POST
    return NextResponse.json({
      payuUrl:     PAYU_URL,
      key:         PAYU_KEY,
      txnid,
      amount,
      productinfo,
      firstname,
      email,
      phone,
      hash,
      surl:        `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/success`,
      furl:        `${process.env.NEXT_PUBLIC_BASE_URL}/api/payments/payu/failed`,
      service_provider: "payu_paisa",
    });
  } catch (err) {
    console.error("[PayU hash error]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
