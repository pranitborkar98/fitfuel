"use client";

// app/_cart/DishCheckout.tsx
//
// The à la carte basket, paid for with a card instead of a text message.
//
// Until the 20260813040000 migration the basket had nowhere to go: OrderItem
// could only hold a subscription, so lib/menu-cart composed a WhatsApp message
// and a human priced it by hand. app/api/orders/dishes now creates a real
// PENDING_PAYMENT order and returns a signed PayU payload, and this is the form
// that drives it.
//
// WHATSAPP DOES NOT DISAPPEAR, and that is not sentimentality. 32 of the 48
// dishes carry a placeholder price, and the server REFUSES to charge for them
// (400, "price-on-request"). A basket of those has nothing to pay, so it still
// has to reach a person. Card for what is priced, WhatsApp for what is not.
//
// THE PRICE IS NEVER SENT. Only dish ids, quantities and an add-on kind go up;
// the server re-prices from lib/menu-alacarte. The total rendered beside the
// button is a preview of that same calculation, not an input to it.

import { useState } from "react";
import type { CartLine } from "@/lib/menu-cart";

type Props = {
  lines: CartLine[];
  totalRs: number;
  onCancel: () => void;
};

type Field = "firstname" | "email" | "phone" | "address" | "pincode";

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/** PayU expects a form POST, not fetch. The endpoint replies with the signed
 *  field set; this posts it as a real form so the browser follows the redirect
 *  into the gateway exactly as it does for the plan checkout. */
function postToPayU(payload: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = payload.payuUrl;
  form.style.display = "none";
  for (const k of [
    "key", "txnid", "amount", "productinfo", "firstname",
    "email", "phone", "surl", "furl", "hash", "service_provider",
  ]) {
    if (!payload[k]) continue;
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = k;
    input.value = payload[k];
    form.appendChild(input);
  }
  document.body.appendChild(form);
  form.submit();
}

export default function DishCheckout({ lines, totalRs, onCancel }: Props) {
  const [v, setV] = useState<Record<Field, string>>({
    firstname: "", email: "", phone: "", address: "", pincode: "",
  });
  const [window_, setWindow] = useState<"MORNING" | "EVENING">("MORNING");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setV((p) => ({ ...p, [f]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/orders/dishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...v,
          city: "Pune",
          deliveryWindow: window_,
          // ids and quantities only — never a price.
          lines: lines.map((l) => ({ id: l.id, qty: l.qty, addOn: l.addOn?.kind })),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error ?? "That did not go through. Try again.");
        setBusy(false);
        return;
      }
      postToPayU(data);
    } catch {
      setError("Could not reach the kitchen. Check your connection and try again.");
      setBusy(false);
    }
  }

  const F = ({
    id, label, type = "text", auto, hint, inputMode,
  }: {
    id: Field; label: string; type?: string; auto?: string; hint?: string;
    inputMode?: "text" | "tel" | "email" | "numeric";
  }) => (
    <p className="ff-f">
      <label htmlFor={`co-${id}`}>{label}</label>
      <input
        id={`co-${id}`}
        name={id}
        type={type}
        inputMode={inputMode}
        autoComplete={auto}
        required
        value={v[id]}
        onChange={set(id)}
      />
      {hint ? <small>{hint}</small> : null}
    </p>
  );

  return (
    <form className="ff-co" onSubmit={submit} noValidate={false}>
      <p className="ff-co-h">Where is it going?</p>

      {F({ id: "firstname", label: "Name", auto: "given-name" })}
      {F({ id: "phone", label: "Phone", type: "tel", auto: "tel", inputMode: "tel", hint: "The driver calls this number." })}
      {F({ id: "email", label: "Email", type: "email", auto: "email", inputMode: "email", hint: "Your receipt goes here." })}
      {F({ id: "address", label: "Address", auto: "street-address" })}
      {F({ id: "pincode", label: "Pincode", auto: "postal-code", inputMode: "numeric" })}

      <fieldset className="ff-co-win">
        <legend>Delivery window</legend>
        {(["MORNING", "EVENING"] as const).map((w) => (
          <label key={w} className={window_ === w ? "on" : ""}>
            <input
              type="radio"
              name="window"
              value={w}
              checked={window_ === w}
              onChange={() => setWindow(w)}
            />
            {w === "MORNING" ? "7–9 AM" : "6–8 PM"}
          </label>
        ))}
      </fieldset>

      {/* role="alert" so a screen reader is told the payment failed rather than
          the message appearing silently above the button. */}
      {error ? (
        <p className="ff-co-err" role="alert">
          {error}
        </p>
      ) : null}

      <button type="submit" className="ff-send" disabled={busy} aria-busy={busy}>
        {busy ? "Taking you to PayU…" : `Pay ${rs(totalRs)}`}
      </button>
      <button type="button" onClick={onCancel} className="ff-clear" disabled={busy}>
        Back to the order
      </button>

      <style>{`
        .ff-co { display: grid; gap: 12px; }
        .ff-co-h {
          margin: 0; font-family: var(--fk-sans); font-weight: 600;
          font-size: 15px; color: var(--fk-ink);
        }
        .ff-f { display: grid; gap: 5px; margin: 0; }
        .ff-f label {
          font-family: var(--fk-sans); font-size: 13px; font-weight: 600;
          color: var(--fk-ink-2);
        }
        .ff-f input {
          min-height: 44px; padding: 0 12px;
          background: var(--fk-paper);
          border: 1px solid var(--fk-line-strong);
          border-radius: 8px;
          color: var(--fk-ink);
          font-family: var(--fk-sans);
          /* 16px, or iOS zooms the whole drawer on focus. */
          font-size: 16px;
        }
        .ff-f input:focus-visible {
          outline: 3px solid var(--fk-green-deep);
          outline-offset: 1px;
          border-color: var(--fk-green);
        }
        .ff-f small { font-size: 12px; color: var(--fk-ink-3); }
        .ff-co-win { border: 0; padding: 0; margin: 0; display: grid; gap: 6px; }
        .ff-co-win legend {
          padding: 0; font-family: var(--fk-sans); font-size: 13px;
          font-weight: 600; color: var(--fk-ink-2); margin-bottom: 5px;
        }
        .ff-co-win label {
          display: flex; align-items: center; gap: 9px; min-height: 44px;
          padding: 0 12px; border: 1px solid var(--fk-line-2); border-radius: 8px;
          font-family: var(--fk-sans); font-size: 14px; color: var(--fk-ink-2);
          cursor: pointer;
        }
        .ff-co-win label.on {
          border-color: var(--fk-green); color: var(--fk-ink);
          background: var(--fk-green-wash);
        }
        .ff-co-err {
          margin: 0; padding: 10px 12px; border-radius: 8px;
          background: var(--fk-terracotta-wash);
          color: var(--fk-terracotta);
          font-family: var(--fk-sans); font-size: 13.5px;
        }
        .ff-send[disabled] { opacity: 0.6; cursor: progress; }
      `}</style>
    </form>
  );
}
