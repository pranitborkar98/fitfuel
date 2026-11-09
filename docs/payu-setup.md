# PayU setup

Operator notes for the FitFuel PayU integration. This doc covers setup only. It does not change how payments work. The code is the source of truth: `lib/payu-config.ts` is the single config point, and every PayU caller goes through it.

No credential values live in this repo. Do not add any here, in code, or in chat. Names of variables only.

## Environment variables

Four variables. Set them as Vercel environment variables for the `fitfuel-eosin.vercel.app` deployment, then redeploy. There is no `.env.example` in the repo.

| Variable | What it is |
| --- | --- |
| `PAYU_MERCHANT_KEY` | Merchant key from the PayU merchant dashboard. |
| `PAYU_MERCHANT_SALT` | Merchant salt from the PayU merchant dashboard. The same salt also verifies the webhook (see below). |
| `PAYU_MODE` | Which PayU environment to use. See the mode table below. |
| `NEXT_PUBLIC_BASE_URL` | Public base URL of the deployment, `https://fitfuel-eosin.vercel.app`. The success and failure URLs (`surl`/`furl`) are built from this value. |

The setup fails closed. If `PAYU_MERCHANT_KEY`, `PAYU_MERCHANT_SALT`, or `NEXT_PUBLIC_BASE_URL` is missing, `getPayuConfig()` returns null and checkout is unavailable instead of taking a payment it cannot verify. In production, a non-HTTPS base URL is also rejected.

## Mode: production stays off

`PAYU_MODE` selects the environment (`lib/payu-mode.ts`). Only the exact values `production` or `live` select production. Anything else, including an unset variable, an empty value, `test`, or a typo, selects sandbox.

| Mode | Payment page | Refund (postservice) |
| --- | --- | --- |
| Sandbox (default) | `https://test.payu.in/_payment` | `https://test.payu.in/merchant/postservice.php?form=2` |
| Production | `https://secure.payu.in/_payment` | `https://info.payu.in/merchant/postservice.php?form=2` |

Do not set `PAYU_MODE` to `production` until chintu supplies the live merchant key and salt and says go. The default is sandbox on purpose: a typo can never silently route a test payment at the live gateway, and there are no live credentials in this codebase.

## Webhook

### There is no separate webhook secret

Correction to record: there is no `PAYU_WEBHOOK_SECRET` or any similar variable anywhere in the repo. Webhook verification reuses `PAYU_MERCHANT_SALT`. The webhook verifies the reverse hash of each notification with the merchant salt (`lib/payu-response.ts`, `verifyPayuResponse`). An unverified notification changes nothing and gets a 400. Do not invent or request a separate webhook secret.

### URL to register with PayU

Register this exact URL with PayU, against the `ws_online_response` parameter, through the PayU integration team:

`https://fitfuel-eosin.vercel.app/api/payments/payu/webhook`

The route is `app/api/payments/payu/webhook/route.ts`. It accepts POST only. A GET returns 405.

It only works if `NEXT_PUBLIC_BASE_URL` is `https://fitfuel-eosin.vercel.app`, because the success and failure URLs are built from that value and PayU posts the same response object to the webhook that it sends to those URLs.

Until the URL is registered, the route receives nothing. That is safe, not broken. The route exists so that a customer who pays and closes the browser before PayU posts back to the success URL does not leave an order stuck in `PENDING_PAYMENT` with no server-side reconciliation. A verified webhook success for a still-unpaid order confirms it through the same atomic claim the success route uses, so entitlement and accounting are repaired exactly once.

The webhook confirms payments only. It never handles refunds. There is no refund handling in the webhook route at all.

## Proving sandbox run

One end-to-end sandbox run proves the whole loop. Outline only; the sandbox merchant key and salt must come from the PayU merchant dashboard via chintu. None exist in the repo.

1. Get the sandbox merchant key and salt from the PayU merchant dashboard.
2. Set all four environment variables in Vercel for the `fitfuel-eosin.vercel.app` deployment and redeploy.
3. Buy one priced dish or plan on the subdomain and pay at `test.payu.in` with a PayU test payment method.
4. Confirm the order flips to `SUCCESS`.
5. In admin, use "Refund via PayU" on that order. Verify PayU returns a `request_id` and the order becomes `REFUNDED`.

If any step fails, stop. Do not work around it by editing payment code in the live deployment.

## Refunds: three different things

Do not mix these up. They look similar in admin and do different things.

### 1. "Refund via PayU" (moves money at PayU)

Admin button in `app/admin/orders/OrdersView.tsx`. It posts `{ action: "refundViaPayu", id }` to `app/api/admin/orders/route.ts`, which calls PayU first (`lib/payu-refund.ts`, `requestPayuRefund`) and only changes the database after PayU accepts the refund. If PayU refuses, nothing changes.

- A full refund sets the order and payment to `REFUNDED`.
- A partial refund keeps the order paid. Only the refund record and an admin note are added; nothing is reversed.
- Proof of a refund is PayU accepting it and returning a `request_id`. The money itself is queued with the bank, not instant. It typically takes 5 to 21 days to reach the customer.
- Only PayU orders can be refunded this way, only a successful payment can be refunded, and the order must have a PayU payment reference (`mihpayid` and `txnid`).

### 2. "Record refund" (moves no money)

This records a refund that was already made in the PayU dashboard. It never calls PayU. Use it only after the money was already returned in the PayU dashboard. If the money has not moved yet, use "Refund via PayU" instead.

### 3. Webhook (payment confirmation only)

The webhook confirms payments. It never refunds anything. A refund made in the PayU dashboard is only ever recorded through "Record refund" above. The webhook will not pick it up.

### Partial refunds are API-only

The admin UI never sends an amount, so "Refund via PayU" always refunds the full order total. A partial refund needs a direct authenticated POST to `/api/admin/orders` with `{ action: "refundViaPayu", id, amountRs }`. The amount cannot exceed the order total.

### Refunds are admin-only, with no second check

There is no approval step and no second person check on a refund. An admin clicking "Refund via PayU" moves money back to the customer and cannot be undone. Treat the button accordingly.

## Still needed

- Sandbox merchant key and salt from the PayU merchant dashboard, via chintu. Needed for the proving run above.
- Live merchant key and salt, plus chintu saying go, before `PAYU_MODE` is ever set to `production`.
- Webhook URL registered with PayU against `ws_online_response` via the PayU integration team.
