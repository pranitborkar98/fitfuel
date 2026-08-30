import "server-only";

import { prisma } from "@/lib/prisma";
import { resolveReferralCode } from "@/lib/partners";

type CaptureInput = {
  userId: string;
  candidateCode?: string | null;
  discountBaseRs?: number;
};

export type CheckoutReferral = {
  code: string;
  discountRs: number;
};

/** Preserve first-touch referral attribution and calculate the first-order
 * welcome amount from the same verified code. Unknown and self-owned codes are
 * discarded rather than copied onto orders. */
export async function captureCheckoutReferral(input: CaptureInput): Promise<CheckoutReferral | null> {
  const user = await prisma.user.findUnique({
    where: { id: input.userId },
    select: {
      referralCode: true,
      referredByPartnerCode: true,
      ownedPartner: { select: { code: true } },
    },
  });
  if (!user) return null;

  const candidate = String(user.referredByPartnerCode || input.candidateCode || "").trim().toUpperCase().slice(0, 64);
  if (!candidate || candidate === user.referralCode || candidate === user.ownedPartner?.code) return null;

  const resolved = await resolveReferralCode(candidate);
  if (!resolved) return null;
  const resolvedCode = resolved.kind === "PARTNER" ? resolved.partner.code : candidate;

  if (!user.referredByPartnerCode) {
    await prisma.user.updateMany({
      where: { id: input.userId, referredByPartnerCode: null },
      data: { referredByPartnerCode: resolvedCode },
    });
  }

  const paidOrders = await prisma.order.count({
    where: { userId: input.userId, paymentStatus: "SUCCESS" },
  });
  const advertised = resolved.kind === "PARTNER"
    ? Math.max(0, Number(resolved.partner.refereeDiscountRs || 0))
    : 200;
  const base = Math.max(0, Math.round(input.discountBaseRs ?? 0));
  const discountRs = paidOrders === 0 && base > 1
    ? Math.min(advertised, base - 1)
    : 0;

  return { code: resolvedCode, discountRs };
}
