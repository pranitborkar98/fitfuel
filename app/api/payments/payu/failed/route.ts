import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getPayuConfig } from "@/lib/payu-config";
import { payuAmountMatches, readPayuResponse, safePayuFailureMessage, verifyPayuResponse } from "@/lib/payu-response";
import { parseOrderMeta } from "@/lib/order-entitlement";

// PayU POSTs here on payment failure / cancellation

export async function POST(req: NextRequest) {
  const fallbackBase = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || req.nextUrl.origin;
  try {
    const payu = getPayuConfig();
    if (!payu) return NextResponse.json({ error: "Payment callback is not configured." }, { status: 503 });
    const response = readPayuResponse(await req.formData());
    const safeMsg = safePayuFailureMessage(response.errorMessage);

    if (!verifyPayuResponse(response, payu)) {
      console.error("[PayU failure] Hash mismatch", { txnid: response.txnid });
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=invalid_hash`, 303);
    }
    if (response.status === "success") {
      console.error("[PayU failure] Success response posted to failure URL", { txnid: response.txnid });
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=payment_state`, 303);
    }

    const orders = await prisma.order.findMany({
      where: { payuTxnId: response.txnid },
      take: 2,
      select: { id: true, orderNumber: true, notes: true, totalRs: true, status: true, paymentStatus: true },
    });
    if (orders.length !== 1) {
      console.error(
        orders.length > 1 ? "[PayU failure] Duplicate transaction id on orders" : "[PayU failure] Signed response for unknown order",
        { txnid: response.txnid },
      );
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=order_not_found`, 303);
    }
    const order = orders[0];
    if (!payuAmountMatches(response.amount, Number(order.totalRs))) {
      console.error("[PayU failure] Amount mismatch", { txnid: response.txnid });
      return NextResponse.redirect(`${payu.baseUrl}/checkout?error=amount_mismatch`, 303);
    }

    if (order.paymentStatus === "SUCCESS") {
      const meta = parseOrderMeta(order.notes);
      const destination = meta.isDigital
        ? `${payu.baseUrl}/dashboard?digital=1&order=${encodeURIComponent(order.orderNumber)}`
        : `${payu.baseUrl}/order/confirmation?order=${encodeURIComponent(order.orderNumber)}`;
      return NextResponse.redirect(destination, 303);
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.updateMany({
        where: { id: order.id, status: "PENDING_PAYMENT", paymentStatus: "PENDING" },
        data: { status: "PAYMENT_FAILED", paymentStatus: "FAILED", payuPaymentId: response.mihpayid || null },
      });
      await tx.payment.updateMany({
        where: { orderId: order.id, status: "PENDING" },
        data: {
          status: "FAILED",
          payuPaymentId: response.mihpayid || null,
          failureReason: safeMsg,
          rawResponse: {
            status: response.status,
            unmappedStatus: response.unmappedStatus,
            error: safeMsg,
          },
        },
      });
    });

    console.error("[PayU] Payment failed", { txnid: response.txnid, reason: safeMsg });

    return NextResponse.redirect(
      `${payu.baseUrl}/checkout?error=payment_failed&txnid=${encodeURIComponent(response.txnid)}&msg=${encodeURIComponent(safeMsg)}`,
      303,
    );
  } catch (err) {
    console.error("[PayU failed handler error]", err);
    return NextResponse.redirect(`${fallbackBase}/checkout?error=server_error`, 303);
  }
}

export async function GET(req: NextRequest) {
  const base = process.env.NEXT_PUBLIC_BASE_URL?.replace(/\/$/, "") || req.nextUrl.origin;
  return NextResponse.redirect(`${base}/plans`, 303);
}
