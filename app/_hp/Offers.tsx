// app/_hp/Offers.tsx
//
// THE PRICE, AND EVERY WAY TO LOWER IT.
//
// Two things had never appeared on this homepage, and both cost real money:
//
//  1. The coupon codes. They are seeded, live and validated at checkout by
//     lib/coupons.ts, and no visitor could discover one without an email from
//     us. They are read from the Coupon table with the same validity rules
//     checkout applies, so an expired code can never sit here looking live.
//     FREEDEL expired on 23 July and is filtered out by the query, not by hand.
//
//  2. The strike-through. lib/pricing-decomposition.ts already computes an MRP
//     at 1.85x base, smoothed to a Rs X99 ending, and the plan cards use it. The
//     homepage was quoting a bare "Rs 400" with nothing to anchor it against.
//
// NO INVENTED NUMBERS ANYWHERE. Rs 400 is the real trial subtotal used site
// wide; every other figure in the receipt is decomposePrice() called on it, so
// this block and the checkout cannot drift apart.
//
// SERVER COMPONENT.

import Link from "next/link";

import { prisma } from "@/lib/prisma";
import { decomposePrice } from "@/lib/pricing-decomposition";
import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, INK, MUTE, DIM, LIME, display, sub, body, figure } from "./theme";

const TRIAL_SUBTOTAL_RS = 400;

type Offer = {
  code: string;
  headline: string;
  terms: string[];
};

function money(n: number): string {
  return `Rs ${n.toLocaleString("en-IN")}`;
}

/* Only the columns this section reads. Narrower than the Prisma row on
   purpose: it documents exactly what a coupon has to expose to be printable. */
type CouponRow = {
  code: string;
  discountType: "PERCENT" | "FLAT" | "FREE_DELIVERY";
  value: number;
  maxDiscountRs: number | null;
  minOrderRs: number | null;
  firstOrderOnly: boolean;
  appliesTo: string;
  validUntil: Date | null;
};

function headlineFor(c: CouponRow): string {
  if (c.discountType === "PERCENT") {
    return c.maxDiscountRs ? `${c.value}% off, up to ${money(c.maxDiscountRs)}` : `${c.value}% off`;
  }
  if (c.discountType === "FLAT") return `${money(c.value)} off`;
  return "Free delivery";
}

function termsFor(c: CouponRow): string[] {
  const t: string[] = [];
  if (c.minOrderRs) t.push(`Orders over ${money(c.minOrderRs)}`);
  if (c.firstOrderOnly) t.push("First order only");
  if (c.appliesTo === "DIGITAL") t.push("Digital plans");
  else if (c.appliesTo === "PHYSICAL") t.push("Delivered plans");
  else t.push("Any plan");
  if (c.validUntil) {
    t.push(
      `Until ${new Date(c.validUntil).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
      })}`,
    );
  }
  return t;
}

/* Same validity gate lib/coupons.ts applies, so nothing can be listed here that
   checkout would then reject. */
async function getOffers(): Promise<Offer[]> {
  try {
    const now = new Date();
    const rows: CouponRow[] = await prisma.coupon.findMany({
      where: {
        isActive: true,
        source: "MANUAL",
        AND: [
          { OR: [{ validFrom: null }, { validFrom: { lte: now } }] },
          { OR: [{ validUntil: null }, { validUntil: { gte: now } }] },
        ],
      },
      orderBy: { createdAt: "asc" },
      take: 4,
      select: {
        code: true,
        discountType: true,
        value: true,
        maxDiscountRs: true,
        minOrderRs: true,
        firstOrderOnly: true,
        appliesTo: true,
        validUntil: true,
      },
    });
    return rows.map((c) => ({
      code: c.code,
      headline: headlineFor(c),
      terms: termsFor(c),
    }));
  } catch {
    return [];
  }
}

export default async function Offers() {
  const offers = await getOffers();
  const p = decomposePrice({ subtotalRs: TRIAL_SUBTOTAL_RS, duration: "TRIAL_DAY" });

  return (
    <section aria-labelledby="hp-offers" style={SECTION}>
      <div style={WRAP}>
        <Idx label="Price and offers" />

        <div className={s.reveal}>
          <h2 id="hp-offers" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "14ch" }}>
            The receipt, before you pay
          </h2>
          <p style={{ ...body(16.5), marginTop: 20 }}>
            Delivery and packaging are separated out and named rather than buried inside a
            headline price, and GST is stated at 5% instead of appearing on the last screen.
            Every code below is live in the database right now, with the terms checkout will
            apply. Expired codes are filtered out by the query, not by us remembering to.
          </p>
        </div>

        {/* The anchor: the real trial day, with the real strike. */}
        <div
          className={s.split}
          style={{ marginTop: "clamp(28px,3.6vw,46px)", alignItems: "start" }}
        >
          <div>
            <h3 style={sub("clamp(1.2rem,2vw,1.5rem)")}>The trial day</h3>
            <div style={{ display: "flex", alignItems: "baseline", gap: 16, marginTop: 14 }}>
              <s className={s.slash} style={{ fontSize: "clamp(1.3rem,2.4vw,1.9rem)" }}>
                {money(p.mrpRs)}
              </s>
              <span style={figure("clamp(2.8rem,6vw,4.6rem)", LIME)}>{money(p.baseRs)}</span>
            </div>
            <p style={{ ...body(15), marginTop: 16 }}>
              Four meals, cooked and delivered, weighed to your macros. No subscription, no
              card kept on file, nothing to cancel. {money(p.baseRs)} is the food;
              delivery and packaging are added below at cost rather than smuggled into it.
            </p>
            <div className={s.actions} style={{ marginTop: 22 }}>
              <Link href="/plans?trial=true" className={s.btn}>
                Book the trial day
              </Link>
            </div>
          </div>

          <div>
            <h3 style={sub("clamp(1.2rem,2vw,1.5rem)")}>What you actually pay</h3>
            <div className={s.receipt} style={{ marginTop: 14 }}>
              <div className={s.receiptRow}>
                <span>The food</span>
                <span className={s.receiptVal}>{money(p.baseRs)}</span>
              </div>
              <div className={s.receiptRow}>
                <span>Delivery, to your door by 08:00</span>
                <span className={s.receiptVal}>{money(p.deliveryRs)}</span>
              </div>
              <div className={s.receiptRow}>
                <span>Sealed compartment packaging</span>
                <span className={s.receiptVal}>{money(p.packagingRs)}</span>
              </div>
              <div className={s.receiptRow}>
                <span>Subtotal</span>
                <span className={s.receiptVal}>{money(p.subtotalRs)}</span>
              </div>
              <div className={s.receiptRow}>
                <span>GST at {p.gstPercent}%</span>
                <span className={s.receiptVal}>{money(p.gstRs)}</span>
              </div>
              <div className={s.receiptRow}>
                <span style={{ fontWeight: 600 }}>Total collected</span>
                <span className={s.receiptVal} style={{ fontWeight: 700 }}>
                  {money(p.totalRs)}
                </span>
              </div>
            </div>
            <p style={{ ...body(13.5), color: DIM, marginTop: 14 }}>
              Cards, UPI and net banking clear through PayU. Cash on delivery is handled by
              us. Coupons and referral credit are applied and shown before you commit.
            </p>
          </div>
        </div>

        {/* Live codes. */}
        {offers.length > 0 && (
          <div style={{ marginTop: "clamp(34px,4.6vw,60px)" }}>
            <h3 style={{ ...sub("clamp(1.3rem,2.4vw,1.8rem)"), marginBottom: 18 }}>
              Codes that work today
            </h3>

            <div className={s.offers}>
              {offers.map((o) => (
                <div key={o.code} className={s.offer}>
                  <span className={s.code}>{o.code}</span>
                  <div style={{ ...sub("clamp(1.05rem,1.6vw,1.2rem)"), color: INK }}>
                    {o.headline}
                  </div>
                  <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 6 }}>
                    {o.terms.map((t) => (
                      <li
                        key={t}
                        style={{ ...body(13), color: MUTE, maxWidth: "none" }}
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* The two offers that are not codes. */}
        <div className={`${s.stats} ${s.stats2}`} style={{ marginTop: 1 }}>
          <div className={s.stat}>
            <div style={sub("clamp(1.2rem,2vw,1.5rem)")}>Rs 500 to you, Rs 500 to them</div>
            <p style={{ ...body(14), marginTop: 10 }}>
              Credit lands when their first order completes, tracked in a ledger you can
              read. No application, no approval queue.
            </p>
            <Link href="/dashboard/referrals" className={s.link} style={{ marginTop: 10 }}>
              Get your code
            </Link>
          </div>
          <div className={s.stat}>
            <div style={sub("clamp(1.2rem,2vw,1.5rem)")}>3,614 published prices</div>
            <p style={{ ...body(14), marginTop: 10 }}>
              Seven durations from one day to three months, four diets, three tiers, two
              delivery windows. Every combination has a real price on the plan page, with
              this same breakdown behind it.
            </p>
            <Link href="/plans" className={s.link} style={{ marginTop: 10 }}>
              See real prices
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
