import { NextRequest, NextResponse } from "next/server";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL!;

// PayU POSTs here on payment failure / cancellation

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();

    const txnid       = formData.get("txnid")       as string;
    const amount      = formData.get("amount")      as string;
    const productinfo = formData.get("productinfo") as string;
    const email       = formData.get("email")       as string;
    const error_Message = formData.get("error_Message") as string;

    console.error("[PayU] Payment FAILED", { txnid, amount, email, error_Message });

    // TODO Phase 3: log failure to DB
    // await prisma.payments.create({ txnid, amount, status: "failed", errorMsg: error_Message })

    return NextResponse.redirect(
      `${BASE_URL}/checkout?error=payment_failed&txnid=${txnid}&msg=${encodeURIComponent(error_Message || "Payment was not completed")}`
    );
  } catch (err) {
    console.error("[PayU failed handler error]", err);
    return NextResponse.redirect(`${BASE_URL}/checkout?error=server_error`);
  }
}

export async function GET() {
  return NextResponse.redirect(`${BASE_URL}/plans`);
}
