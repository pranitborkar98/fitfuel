import "server-only";

import { PAYU_PAYMENT_URLS, PAYU_REFUND_URLS, resolvePayuMode, type PayuMode } from "@/lib/payu-mode";

export type PayuConfig = {
  key: string;
  salt: string;
  mode: PayuMode;
  paymentUrl: string;
  refundUrl: string;
  baseUrl: string;
};

/** Payment routes must fail closed when production credentials are missing.
 * Non-null assertions turn a missing secret into a valid-looking hash over the
 * literal word "undefined", which can leave pending orders that can never pay. */
export function getPayuConfig(): PayuConfig | null {
  const key = process.env.PAYU_MERCHANT_KEY?.trim();
  const salt = process.env.PAYU_MERCHANT_SALT?.trim();
  const configuredBase = process.env.NEXT_PUBLIC_BASE_URL?.trim();
  if (!key || !salt || !configuredBase) return null;

  // PAYU_MODE selects the PayU environment. Values: "sandbox" (default),
  // "test", "production", "live". Anything else falls back to sandbox, so a
  // typo can never silently route a test payment at the live gateway. Live
  // payments need PAYU_MODE=production plus the live merchant key and salt;
  // there are no live credentials in this codebase.
  const mode = resolvePayuMode(process.env.PAYU_MODE);

  try {
    const parsed = new URL(configuredBase);
    if (!/^https?:$/.test(parsed.protocol)) return null;
    if (process.env.NODE_ENV === "production" && parsed.protocol !== "https:") return null;
    return {
      key,
      salt,
      mode,
      paymentUrl: PAYU_PAYMENT_URLS[mode],
      refundUrl: PAYU_REFUND_URLS[mode],
      baseUrl: configuredBase.replace(/\/$/, ""),
    };
  } catch {
    return null;
  }
}
