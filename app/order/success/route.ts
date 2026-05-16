import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const PAYU_SALT = process.env.PAYU_MERCHANT_SALT!;
const BASE_URL  = process.env.NEXT_PUBLIC_BASE_URL!;

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

    const reverseHash  = `${PAYU_SALT}|${status}|||||||||||${email}|${firstname}|${productinfo}|${amount}|${txnid}|${process.env.PAYU_MERCHANT_KEY}`;
    const expectedHash = crypto.createHash("sha512").update(reverseHash).digest("hex");

    if (hash !== expectedHash) {
      console.error("[PayU] Hash mismatch", { txnid });
      return NextResponse.redirect(`${BASE_URL}/checkout?error=invalid_hash`);
    }

    if (status !== "success") {
      return NextResponse.redirect(`${BASE_URL}/checkout?error=payment_failed&txnid=${txnid}`);
    }

    console.log("[PayU] Payment SUCCESS", { txnid, mihpayid, amount, email });
    return NextResponse.redirect(`${BASE_URL}/order/confirmation?txnid=${txnid}&amount=${amount}`);
  } catch (err) {
    console.error("[PayU success handler error]", err);
    return NextResponse.redirect(`${BASE_URL}/checkout?error=server_error`);
  }
}

export async function GET() {
  return NextResponse.redirect(`${process.env.NEXT_PUBLIC_BASE_URL}/plans`);
}
