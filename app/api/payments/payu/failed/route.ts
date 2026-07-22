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

    // This endpoint is unauthenticated (PayU posts here), so treat error_Message
    // as untrusted: strip to a safe charset and cap length before reflecting it.
    const safeMsg = (error_Message || "Payment was not completed")
      .replace(/[^\w\s.,:()'-]/g, "")
      .slice(0, 120);

    return NextResponse.redirect(
      `${BASE_URL}/checkout?error=payment_failed&txnid=${encodeURIComponent(txnid || "")}&msg=${encodeURIComponent(safeMsg)}`
    );
  } catch (err) {
    console.error("[PayU failed handler error]", err);
    return NextResponse.redirect(`${BASE_URL}/checkout?error=server_error`);
  }
}

export async function GET() {
  return NextResponse.redirect(`${BASE_URL}/plans`);
}
