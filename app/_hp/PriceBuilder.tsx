"use client";

// app/_hp/PriceBuilder.tsx
//
// THE RECEIPT, BUILT BEFORE YOU PAY.
//
// The old section printed one duration's breakdown and left the other six to the
// plan pages, which meant the homepage's loudest claim — "delivery and packaging
// are named, not buried" — was demonstrated exactly once. Pick a duration here
// and the whole receipt recomputes.
//
// IT RUNS THE REAL FUNCTION. decomposePrice() from lib/pricing-decomposition is
// the same call checkout makes, with the same DELIVERY_COUNT table, the same
// Rs 50 rounding, the same 5% GST and the same 1.85x MRP smoothed to an X99
// ending. This component does no pricing arithmetic of its own. If pricing
// moves, this moves with it, which is the only way a receipt on a marketing
// page stays true.
//
// SUBTOTALS ARE PASSED IN, not computed. They are the real seeded PlanPrice
// figures for the reference plan, queried server-side in Offers.tsx. A duration
// with no seeded price is not offered rather than being extrapolated: the whole
// argument of this section is that the numbers are real.
//
// CLIENT COMPONENT: it is a control.

import { useState } from "react";
import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import { decomposePrice, DELIVERY_COUNT, type PlanDurationKey } from "@/lib/pricing-decomposition";
import { INK, MUTE, DIM, LIME, BG, PANEL_2, body, label, figure } from "./theme";

export type Duration = {
  key: PlanDurationKey;
  label: string;
  subtotalRs: number;
  blurb: string;
};

export type Coupon = { code: string; headline: string; terms: string };

const money = (n: number) => `Rs ${n.toLocaleString("en-IN")}`;

export default function PriceBuilder({
  durations,
  coupons,
}: {
  durations: Duration[];
  coupons: Coupon[];
}) {
  const [i, setI] = useState(0);
  const d = durations[i]!;
  const p = decomposePrice({ subtotalRs: d.subtotalRs, duration: d.key });
  const deliveries = DELIVERY_COUNT[d.key];
  const perDay = Math.round(p.totalRs / deliveries);

  return (
    <>
      <div
        className={v.chips}
        role="radiogroup"
        aria-label="Plan duration"
        style={{ marginTop: "clamp(30px,4vw,52px)" }}
      >
        {durations.map((x, n) => (
          <button
            key={x.key}
            type="button"
            role="radio"
            aria-checked={n === i}
            onClick={() => setI(n)}
            style={{ background: n === i ? LIME : BG, color: n === i ? BG : MUTE }}
          >
            {x.label}
          </button>
        ))}
      </div>

      <div className={v.priceGrid}>
        <div className={v.priceMain}>
          <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.2em" }}>
            {d.label} · {deliveries} {deliveries === 1 ? "delivery" : "deliveries"}
          </span>

          <div style={{ display: "flex", alignItems: "baseline", gap: 16, flexWrap: "wrap", marginTop: 16 }}>
            <s className={s.slash} style={{ fontSize: "clamp(1.1rem,2vw,1.6rem)" }}>
              {money(p.mrpRs)}
            </s>
            <span style={{ ...figure("clamp(3rem,7vw,5.4rem)"), lineHeight: 0.8 }}>
              {money(p.baseRs)}
            </span>
          </div>

          <p style={{ ...body(15), margin: "16px 0 0", maxWidth: "46ch" }}>{d.blurb}</p>

          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              gap: 10,
              marginTop: 22,
              paddingTop: 20,
              borderTop: "1px solid #232320",
            }}
          >
            <span style={figure("clamp(1.6rem,3vw,2.4rem)")}>{money(perDay)}</span>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>
              per day, all in, four meals
            </span>
          </div>

          <div className={s.actions} style={{ marginTop: 26 }}>
            <Link href="/plans" className={s.btn}>
              Order, {money(p.totalRs)}
            </Link>
          </div>
        </div>

        <div className={v.priceSide}>
          <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.2em" }}>
            What you actually pay
          </span>

          <div className={v.rows} style={{ marginTop: 18 }}>
            {(
              [
                ["The food", p.baseRs],
                ["Delivery, to your door by 08:00", p.deliveryRs],
                ["Sealed compartment packaging", p.packagingRs],
                ["Subtotal", p.subtotalRs],
                [`GST at ${p.gstPercent}%`, p.gstRs],
                ["Total collected", p.totalRs],
              ] as const
            ).map(([k, n]) => (
              <div key={k} className={v.priceRow}>
                <span>{k}</span>
                <b>{money(n)}</b>
              </div>
            ))}
          </div>

          {coupons.length > 0 && (
            <div className={v.coupons} style={{ marginTop: 20 }}>
              {coupons.map((c) => (
                <div key={c.code} className={v.coupon}>
                  <span className={v.couponCode}>{c.code}</span>
                  <span style={{ ...body(12.5), color: DIM, display: "block", marginTop: 6, maxWidth: "none" }}>
                    {c.headline} · {c.terms}
                  </span>
                </div>
              ))}
            </div>
          )}

          <p style={{ ...body(13), color: DIM, margin: "18px 0 0" }}>
            Cards, UPI and net banking clear through PayU; cash on delivery is handled by us.
            {coupons.length > 0
              ? " Codes are live in the database right now, with the terms checkout applies."
              : ""}
          </p>
        </div>
      </div>

      <span className="sr-only" style={{ color: INK, background: PANEL_2 }}>
        {d.label}: total {money(p.totalRs)} across {deliveries} deliveries.
      </span>
    </>
  );
}
