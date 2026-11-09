// lib/payu-mode.ts
// PayU environment selection. Pure module (no server-only import) so the
// contract tests can import it directly.
//
// PAYU_MODE selects which PayU environment the checkout talks to:
//   sandbox (default)  -> test.payu.in, the PayU test environment
//   production         -> secure.payu.in / info.payu.in, live money
// The aliases "test" and "live" are accepted. Anything else, including an
// unset variable, falls back to sandbox: with no live keys configured the
// safe default is the environment where no real payment can be taken.

export type PayuMode = "sandbox" | "production";

export const PAYU_PAYMENT_URLS: Record<PayuMode, string> = {
  sandbox: "https://test.payu.in/_payment",
  production: "https://secure.payu.in/_payment",
};

// Refund and other postservice calls go to a different host per environment.
// Production postservice lives on info.payu.in, not secure.payu.in.
export const PAYU_REFUND_URLS: Record<PayuMode, string> = {
  sandbox: "https://test.payu.in/merchant/postservice.php?form=2",
  production: "https://info.payu.in/merchant/postservice.php?form=2",
};

export function resolvePayuMode(raw: string | undefined): PayuMode {
  const value = raw?.trim().toLowerCase();
  if (value === "production" || value === "live") return "production";
  return "sandbox";
}
