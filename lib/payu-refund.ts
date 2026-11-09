// lib/payu-refund.ts
// PayU refund (cancel_refund_transaction) via the merchant postservice API.
// Pure module (node:crypto only, no server-only import) so the contract tests
// can import it directly and prove the request shape against a stubbed fetch.
// No live call is possible without merchant credentials, and none is attempted
// here: the caller must supply a config built from environment variables.
//
// Source: PayU developer docs (docs.payu.in), "Refund Transaction API", read
// 2026-11-09. POST to the mode-selected postservice URL with form fields:
//   key, command= cancel_refund_transaction, var1 = mihpayid (the PayU
//   payment id from the success response), var2 = txnid (the merchant
//   transaction id, used as the unique refund token), var3 = amount,
//   hash = sha512(key|command|var1|var2|var3|salt).
// A successful call returns JSON with status 1 and a request_id, which is
// the handle for the Check Refund Status API. A refund is queued with the
// bank, not instant: it typically takes 5 to 21 days to reach the customer.

import { buildPayuRefundHash } from "@/lib/payu-hash";

export type PayuRefundConfig = {
  key: string;
  salt: string;
  refundUrl: string;
};

export type PayuRefundInput = {
  /** PayU payment id (mihpayid) from the success response. */
  mihpayid: string;
  /** Merchant transaction id. Doubles as the unique refund token. */
  txnid: string;
  /** Refund amount in rupees. Must be above 0 and not above the paid total. */
  amountRs: number;
};

export type PayuRefundRequest = {
  url: string;
  /** Form fields, in the exact names PayU expects. */
  body: Record<string, string>;
};

export type PayuRefundResult =
  | {
      ok: true;
      /** PayU request id for the refund. Use it with check_action_status. */
      requestId: string;
      mihpayid: string;
      bankRefNum: string | null;
      raw: unknown;
    }
  | { ok: false; error: string; raw?: unknown };

const REFUND_COMMAND = "cancel_refund_transaction";

function formatRefundAmount(amountRs: number): string | null {
  if (!Number.isFinite(amountRs) || amountRs <= 0) return null;
  return amountRs.toFixed(2);
}

/** Builds the exact request the refund call sends. Pure: no network, no
 * credentials beyond the supplied config. Returns null on invalid input. */
export function buildPayuRefundRequest(
  config: PayuRefundConfig,
  input: PayuRefundInput,
): PayuRefundRequest | null {
  const mihpayid = input.mihpayid.trim();
  const txnid = input.txnid.trim();
  const amount = formatRefundAmount(input.amountRs);
  if (!config.key || !config.salt || !config.refundUrl || !mihpayid || !txnid || !amount) return null;
  const hash = buildPayuRefundHash({
    key: config.key,
    command: REFUND_COMMAND,
    var1: mihpayid,
    var2: txnid,
    var3: amount,
    salt: config.salt,
  });
  return {
    url: config.refundUrl,
    body: {
      key: config.key,
      command: REFUND_COMMAND,
      var1: mihpayid,
      var2: txnid,
      var3: amount,
      hash,
    },
  };
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asString(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

/** Sends the refund request. fetchImpl exists so tests can stub the network;
 * production callers pass nothing and get the global fetch. The result is
 * typed: ok only when PayU answers with a success status and a request id. */
export async function requestPayuRefund(
  config: PayuRefundConfig,
  input: PayuRefundInput,
  fetchImpl: typeof fetch = fetch,
): Promise<PayuRefundResult> {
  const request = buildPayuRefundRequest(config, input);
  if (!request) return { ok: false, error: "Invalid refund request: missing PayU reference, transaction id, or amount." };
  let response: Response;
  try {
    response = await fetchImpl(request.url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(request.body).toString(),
    });
  } catch (error: unknown) {
    return { ok: false, error: `PayU refund request failed: ${error instanceof Error ? error.message : "network error"}` };
  }
  const text = await response.text().catch(() => "");
  const parsed: unknown = (() => {
    try {
      return JSON.parse(text) as unknown;
    } catch {
      return null;
    }
  })();
  const record = asRecord(parsed);
  if (!response.ok || !record) {
    return { ok: false, error: `PayU refund failed with status ${response.status}.`, raw: text.slice(0, 500) };
  }
  const status = asString(record.status);
  const requestId = asString(record.request_id);
  if (status !== "1" && status.toLowerCase() !== "success") {
    return { ok: false, error: asString(record.msg) || asString(record.error) || "PayU refused the refund.", raw: parsed };
  }
  if (!requestId) {
    return { ok: false, error: "PayU accepted the refund but returned no request id.", raw: parsed };
  }
  return {
    ok: true,
    requestId,
    mihpayid: asString(record.mihpayid) || input.mihpayid,
    bankRefNum: asString(record.bank_ref_num) || null,
    raw: parsed,
  };
}
