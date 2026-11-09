import assert from "node:assert/strict";
import test from "node:test";
import crypto from "node:crypto";

import { PAYU_PAYMENT_URLS, PAYU_REFUND_URLS, resolvePayuMode } from "@/lib/payu-mode";
import {
  buildPayuInitHash,
  buildPayuRefundHash,
  buildPayuResponseHash,
  verifyPayuResponseHash,
} from "@/lib/payu-hash";
import { buildPayuRefundRequest, requestPayuRefund, type PayuRefundConfig } from "@/lib/payu-refund";

// All keys, salts, ids and amounts below are test-only placeholders written
// for this file. They are not real credentials and must never be used as any.

const TEST_KEY = "test-merchant-key";
const TEST_SALT = "test-merchant-salt";

test("sandbox is the default PayU mode and production needs an explicit value", () => {
  assert.equal(resolvePayuMode(undefined), "sandbox");
  assert.equal(resolvePayuMode(""), "sandbox");
  assert.equal(resolvePayuMode("sandbox"), "sandbox");
  assert.equal(resolvePayuMode("test"), "sandbox");
  assert.equal(resolvePayuMode("typo"), "sandbox");
  assert.equal(resolvePayuMode("production"), "production");
  assert.equal(resolvePayuMode("live"), "production");
  assert.equal(resolvePayuMode("PRODUCTION"), "production");
});

test("sandbox selects the PayU test hosts and production selects the live hosts", () => {
  assert.equal(PAYU_PAYMENT_URLS.sandbox, "https://test.payu.in/_payment");
  assert.equal(PAYU_REFUND_URLS.sandbox, "https://test.payu.in/merchant/postservice.php?form=2");
  assert.equal(PAYU_REFUND_URLS.production, "https://info.payu.in/merchant/postservice.php?form=2");
});

test("production mode keeps the exact payment URL the code hardcoded before", () => {
  assert.equal(PAYU_PAYMENT_URLS.production, "https://secure.payu.in/_payment");
});

test("the init hash matches the formula the checkout routes used before", () => {
  const input = {
    key: TEST_KEY,
    txnid: "FFP123",
    amount: "420.00",
    productinfo: "Weight Loss Plan",
    firstname: "Test",
    email: "test@example.com",
    salt: TEST_SALT,
  };
  const expected = crypto
    .createHash("sha512")
    .update(`${input.key}|${input.txnid}|${input.amount}|${input.productinfo}|${input.firstname}|${input.email}|||||||||||${input.salt}`)
    .digest("hex");
  assert.equal(buildPayuInitHash(input), expected);
  assert.notEqual(buildPayuInitHash({ ...input, salt: "other-salt" }), expected);
});

function signedResponse(overrides: Record<string, string> = {}) {
  const base = {
    salt: TEST_SALT,
    key: TEST_KEY,
    status: "success",
    txnid: "FFP123",
    amount: "420.00",
    productinfo: "Weight Loss Plan",
    firstname: "Test",
    email: "test@example.com",
    udf1: "",
    udf2: "",
    udf3: "",
    udf4: "",
    udf5: "",
    additionalCharges: "",
    ...overrides,
  };
  return { ...base, hash: buildPayuResponseHash(base) };
}

test("webhook verification accepts a correctly hashed PayU response", () => {
  const response = signedResponse();
  assert.equal(verifyPayuResponseHash(response, { key: TEST_KEY, salt: TEST_SALT }), true);
});

test("webhook verification rejects a tampered amount, status, key, or missing hash", () => {
  const good = signedResponse();
  assert.equal(verifyPayuResponseHash({ ...good, amount: "421.00" }, { key: TEST_KEY, salt: TEST_SALT }), false);
  assert.equal(verifyPayuResponseHash({ ...good, status: "failure" }, { key: TEST_KEY, salt: TEST_SALT }), false);
  assert.equal(verifyPayuResponseHash(good, { key: "other-key", salt: TEST_SALT }), false);
  assert.equal(verifyPayuResponseHash({ ...good, hash: "" }, { key: TEST_KEY, salt: TEST_SALT }), false);
  assert.equal(verifyPayuResponseHash({ ...good, hash: "0".repeat(128) }, { key: TEST_KEY, salt: TEST_SALT }), false);
});

test("webhook verification handles additional charges the way PayU specifies", () => {
  const withCharges = signedResponse({ additionalCharges: "10.00" });
  assert.equal(verifyPayuResponseHash(withCharges, { key: TEST_KEY, salt: TEST_SALT }), true);
  // The same hash without the charge must not verify: the charge is part of it.
  const withoutCharges = { ...withCharges, additionalCharges: "" };
  assert.equal(verifyPayuResponseHash(withoutCharges, { key: TEST_KEY, salt: TEST_SALT }), false);
});

const SANDBOX_REFUND_CONFIG: PayuRefundConfig = {
  key: TEST_KEY,
  salt: TEST_SALT,
  refundUrl: PAYU_REFUND_URLS.sandbox,
};

test("the refund request carries the PayU postservice fields and hash", () => {
  const request = buildPayuRefundRequest(SANDBOX_REFUND_CONFIG, {
    mihpayid: "403993715521937565",
    txnid: "FFP123",
    amountRs: 420,
  });
  assert.ok(request);
  assert.equal(request.url, "https://test.payu.in/merchant/postservice.php?form=2");
  assert.equal(request.body.key, TEST_KEY);
  assert.equal(request.body.command, "cancel_refund_transaction");
  assert.equal(request.body.var1, "403993715521937565");
  assert.equal(request.body.var2, "FFP123");
  assert.equal(request.body.var3, "420.00");
  const expectedHash = buildPayuRefundHash({
    key: TEST_KEY,
    command: "cancel_refund_transaction",
    var1: "403993715521937565",
    var2: "FFP123",
    var3: "420.00",
    salt: TEST_SALT,
  });
  assert.equal(request.body.hash, expectedHash);
  assert.equal(
    request.body.hash,
    crypto
      .createHash("sha512")
      .update(`${TEST_KEY}|cancel_refund_transaction|403993715521937565|FFP123|420.00|${TEST_SALT}`)
      .digest("hex"),
  );
});

test("the refund request goes to the production postservice host in production mode", () => {
  const request = buildPayuRefundRequest(
    { key: TEST_KEY, salt: TEST_SALT, refundUrl: PAYU_REFUND_URLS.production },
    { mihpayid: "403993715521937565", txnid: "FFP123", amountRs: 420 },
  );
  assert.ok(request);
  assert.equal(request.url, "https://info.payu.in/merchant/postservice.php?form=2");
});

test("the refund builder refuses an invalid amount or missing reference", () => {
  assert.equal(buildPayuRefundRequest(SANDBOX_REFUND_CONFIG, { mihpayid: "403993715521937565", txnid: "FFP123", amountRs: 0 }), null);
  assert.equal(buildPayuRefundRequest(SANDBOX_REFUND_CONFIG, { mihpayid: "403993715521937565", txnid: "FFP123", amountRs: -5 }), null);
  assert.equal(buildPayuRefundRequest(SANDBOX_REFUND_CONFIG, { mihpayid: "", txnid: "FFP123", amountRs: 420 }), null);
  assert.equal(buildPayuRefundRequest(SANDBOX_REFUND_CONFIG, { mihpayid: "403993715521937565", txnid: "", amountRs: 420 }), null);
});

test("a stubbed PayU refund success returns the request id", async () => {
  let seenUrl = "";
  let seenBody = "";
  const stubFetch: typeof fetch = async (input, init) => {
    seenUrl = String(input);
    seenBody = typeof init?.body === "string" ? init.body : "";
    return new Response(
      JSON.stringify({ status: 1, msg: "Refund request queued", request_id: "131278422", mihpayid: "403993715521937565", bank_ref_num: "BANKREF1" }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  };
  const result = await requestPayuRefund(
    SANDBOX_REFUND_CONFIG,
    { mihpayid: "403993715521937565", txnid: "FFP123", amountRs: 420 },
    stubFetch,
  );
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.requestId, "131278422");
    assert.equal(result.bankRefNum, "BANKREF1");
  }
  assert.equal(seenUrl, "https://test.payu.in/merchant/postservice.php?form=2");
  const posted = new URLSearchParams(seenBody);
  assert.equal(posted.get("command"), "cancel_refund_transaction");
  assert.equal(posted.get("var1"), "403993715521937565");
  assert.equal(posted.get("var2"), "FFP123");
  assert.equal(posted.get("var3"), "420.00");
  assert.equal(posted.get("hash")?.length, 128);
});

test("a stubbed PayU refund refusal and a network failure both fail closed", async () => {
  const refusedFetch: typeof fetch = async () =>
    new Response(JSON.stringify({ status: 0, msg: "Refund request failed" }), { status: 200 });
  const refused = await requestPayuRefund(
    SANDBOX_REFUND_CONFIG,
    { mihpayid: "403993715521937565", txnid: "FFP123", amountRs: 420 },
    refusedFetch,
  );
  assert.equal(refused.ok, false);

  const failingFetch: typeof fetch = async () => {
    throw new Error("network down");
  };
  const failed = await requestPayuRefund(
    SANDBOX_REFUND_CONFIG,
    { mihpayid: "403993715521937565", txnid: "FFP123", amountRs: 420 },
    failingFetch,
  );
  assert.equal(failed.ok, false);

  const garbageFetch: typeof fetch = async () => new Response("not json", { status: 200 });
  const garbage = await requestPayuRefund(
    SANDBOX_REFUND_CONFIG,
    { mihpayid: "403993715521937565", txnid: "FFP123", amountRs: 420 },
    garbageFetch,
  );
  assert.equal(garbage.ok, false);
});
