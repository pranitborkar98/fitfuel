"use client";

// app/_shop/PlanSheet.tsx
//
// The plan configurator, as the prototype draws it: tier, diet, meals a day,
// how long, and then the receipt BEFORE the button rather than after it.
//
// The receipt is the point of this sheet and the reason it is not just a link
// to /plans/[slug]. Food, delivery, packaging and GST are split out and the
// usual price is struck through, all of it from lib/pricing-decomposition.ts —
// the same function checkout runs — so the number in the sheet and the number
// PayU collects cannot disagree. "3,614 prices, all published" is a claim the
// page makes two sections above this one; this is where it is kept.
//
// Premium and Luxury are priced at × 1.25 and × 1.5 and say so, because those
// kitchens do not exist yet. Their CTA joins a waitlist rather than pretending
// to sell something.

import Link from "next/link";
import { useState } from "react";

import { buildCheckoutUrl } from "@/lib/plan-tier-pricing";
import { decomposePrice } from "@/lib/pricing-decomposition";
import {
  DELIVERY_COUNT, DIETS, DURATIONS, MEALS, TIERS, planSubtotal, rs, tierMultiplier,
  type DietKey, type MealKey, type PlanDurationKey, type ShopPlan, type Tier,
} from "./catalog";
import Sheet, { SheetClose } from "./Sheet";
import { C, MONO, SANS, display, figure, label, num, seg } from "./theme";
import s from "./shop.module.css";

/** Day one, when the plan has a seeded schedule. Optional, because the static
 *  SHOP_PLANS rows Shop.tsx passes carry no menu — only the database-backed
 *  rows the app builds do. */
export type PlanSheetPlan = ShopPlan & {
  meals?: { slot: string; name: string; kcal: number }[];
};

const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner",
};

export default function PlanSheet({ plan, onClose }: { plan: PlanSheetPlan; onClose: () => void }) {
  const [tier, setTier] = useState<Tier>("STANDARD");
  const [diet, setDiet] = useState<DietKey>("VEG");
  const [meal, setMeal] = useState<MealKey>("ALL_FOUR");
  const [duration, setDuration] = useState<PlanDurationKey>("ONE_MONTH");

  const tierRow = TIERS.find((t) => t.key === tier)!;
  const dietRow = DIETS.find((d) => d.key === diet)!;
  const durRow = DURATIONS.find((d) => d.key === duration)!;

  const subtotal = planSubtotal(diet, duration, meal, tier);
  const p = decomposePrice({ subtotalRs: subtotal ?? 0, duration });
  const drops = DELIVERY_COUNT[duration];
  const mealsTotal = drops * (meal === "ALL_FOUR" ? 4 : 2);

  const receipt: [string, string, boolean][] = [
    [`Food, ${durRow.days}${durRow.days === 1 ? " day" : " days"}`, rs(p.baseRs), false],
    [`Delivery, ${drops} ${drops === 1 ? "drop" : "drops"}`, rs(p.deliveryRs), false],
    ["Packaging", rs(p.packagingRs), false],
    ["GST at 5% on food", rs(p.gstRs), false],
    ["Usual price", rs(p.mrpRs), true],
  ];

  const kStyle: React.CSSProperties = { ...label(11, { letterSpacing: "0.12em" }) };
  const vStyle: React.CSSProperties = { ...num(12.5) };

  return (
    <Sheet onClose={onClose} labelledBy="plan-sheet-title">
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12, padding: "15px 16px", borderBottom: `1px solid ${C.rule}` }}>
        <span>
          <span style={{ display: "block", ...label(10, { letterSpacing: "0.06em" }), marginBottom: 8 }}>Configure your plan</span>
          <b id="plan-sheet-title" style={display(28, { display: "block", lineHeight: 1.06, letterSpacing: "-0.025em" })}>
            {plan.label} ({dietRow.short})
          </b>
        </span>
        <SheetClose onClose={onClose} />
      </div>

      {/* Tier */}
      <div style={{ padding: "16px 16px 0" }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.06em" }), marginBottom: 9 }}>Tier</span>
        <div style={{ display: "flex", gap: 1, background: C.rule, border: `1px solid ${C.rule}` }}>
          {TIERS.map((t) => (
            <button key={t.key} type="button" onClick={() => setTier(t.key)} aria-pressed={tier === t.key} style={seg(tier === t.key, { flex: 1 })}>
              <span style={{ display: "block", fontFamily: SANS, fontWeight: 600, fontSize: 15, lineHeight: 1, textTransform: "none" }}>{t.label}</span>
              <span style={{ display: "block", marginTop: 6, fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "none" }}>
                {t.available ? "orderable" : "waitlist"}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Diet */}
      <div style={{ padding: "18px 16px 0" }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.06em" }), marginBottom: 9 }}>Diet</span>
        <div className={s.rail} style={{ display: "flex", gap: 7, overflowX: "auto", paddingBottom: 2 }}>
          {DIETS.map((d) => {
            const on = diet === d.key;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setDiet(d.key)}
                aria-pressed={on}
                style={{
                  flex: "none", display: "inline-flex", alignItems: "center", gap: 7, minHeight: 44, padding: "0 13px",
                  border: `1px solid ${on ? C.lime : C.rule}`, background: on ? C.wash : "transparent",
                  color: on ? C.ink : C.mute, cursor: "pointer",
                  fontFamily: SANS, fontWeight: 600, fontSize: 13.5, letterSpacing: "0", textTransform: "none",
                }}
              >
                {/* FSSAI labelling convention: green vegetarian, red non-veg.
                    Regulated meaning, never the only signal — the word is
                    always beside it. */}
                <span aria-hidden="true" style={{ width: 7, height: 7, flex: "none", background: d.dot }} />
                {d.short}
              </button>
            );
          })}
        </div>
      </div>

      {/* Meals a day */}
      <div style={{ padding: "18px 16px 0" }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.06em" }), marginBottom: 9 }}>Meals a day</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 1, background: C.rule, border: `1px solid ${C.rule}` }}>
          {MEALS.map((m) => (
            <button key={m.key} type="button" onClick={() => setMeal(m.key)} aria-pressed={meal === m.key} style={seg(meal === m.key)}>
              <span style={{ display: "block", fontFamily: SANS, fontWeight: 600, fontSize: 16, lineHeight: 1, textTransform: "none" }}>{m.short}</span>
              <span style={{ display: "block", marginTop: 6, fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "none" }}>{m.time}</span>
            </button>
          ))}
        </div>
      </div>

      {/* How long */}
      <div style={{ padding: "18px 16px 0" }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.06em" }), marginBottom: 9 }}>How long</span>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.rule, border: `1px solid ${C.rule}` }}>
          {DURATIONS.map((d) => {
            const sub = planSubtotal(diet, d.key, meal, tier);
            return (
              <button key={d.key} type="button" onClick={() => setDuration(d.key)} aria-pressed={duration === d.key} style={seg(duration === d.key)}>
                <span style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                  <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 16, lineHeight: 1, textTransform: "none" }}>{d.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "none", color: C.dim }}>
                    {d.days === 1 ? "1 day" : `${d.days} days`}
                  </span>
                </span>
                <span style={{ display: "block", marginTop: 8, ...num(12.5, { color: "inherit" }) }}>
                  {sub == null ? "—" : rs(decomposePrice({ subtotalRs: sub, duration: d.key }).totalRs)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ── WHAT YOU EAT ────────────────────────────────────────────────────
          This was a "View menu" accordion on the plan card. It belongs here:
          the card is where you scan, this is where you decide, and expanding a
          panel in a stretched grid row dragged three neighbouring cards down
          with it.

          1 of 126 plan rows currently has a seeded day-one schedule, so the
          empty branch is the one nearly everyone sees. It says what is true and
          points at the page that carries the full 30 days, rather than
          pretending the section is missing. */}
      <div style={{ padding: "18px 16px 0" }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.06em" }), marginBottom: 9 }}>
          What you eat on day one
        </span>
        {plan.meals && plan.meals.length > 0 ? (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 8 }}>
            {plan.meals.map((m) => (
              <li
                key={m.slot}
                style={{
                  display: "grid", gridTemplateColumns: "76px minmax(0, 1fr) auto",
                  gap: 10, alignItems: "baseline",
                }}
              >
                <span style={{ ...label(10, { letterSpacing: "0.06em" }) }}>
                  {SLOT_LABEL[m.slot] ?? m.slot}
                </span>
                <span style={{ fontFamily: SANS, fontSize: 13.5, color: C.ink, minWidth: 0 }}>
                  {m.name}
                </span>
                <span style={{ ...num(12), color: C.dim }}>{m.kcal} kcal</span>
              </li>
            ))}
          </ul>
        ) : (
          <>
            <p style={{ margin: 0, fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: C.dim }}>
              The 30-day menu for this plan is published monthly and is not seeded
              here yet. The macros you picked above are the daily target the
              kitchen cooks to.
            </p>
            {/* A block action, not a link inside the sentence. WCAG 2.5.8 would
                exempt an inline link, but the same call was already made for
                app/menu/[dish] — a navigation action carries a real target
                here. */}
            <Link
              href={`/plans/${plan.slug}`}
              style={{
                display: "inline-flex", alignItems: "center", minHeight: 44,
                marginTop: 4, color: C.lime, fontFamily: SANS,
                fontSize: 13, fontWeight: 600,
              }}
            >
              See the plan page
            </Link>
          </>
        )}
      </div>

      {/* The receipt */}
      <div style={{ padding: "20px 16px 0" }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.06em" }), marginBottom: 12 }}>The receipt, before you pay</span>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {receipt.map(([k, v, struck]) => (
            <span key={k} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12 }}>
              <span style={kStyle}>{k}</span>
              <span style={struck ? { ...vStyle, color: C.dim, textDecoration: "line-through" } : vStyle}>{v}</span>
            </span>
          ))}
        </div>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.rule2}` }}>
          <span>
            <span style={{ display: "block", fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", textTransform: "none", color: C.ink }}>Total</span>
            <span style={{ display: "block", marginTop: 6, fontFamily: MONO, fontSize: 12, letterSpacing: "0", color: C.dim }}>
              {rs(Math.round(p.totalRs / mealsTotal))} a meal · {mealsTotal} meals
            </span>
          </span>
          <b style={figure(34, { color: C.lime })}>{rs(p.totalRs)}</b>
        </div>

        {tierRow.available ? (
          <Link
            href={buildCheckoutUrl({
              dietaryVariant: diet,
              duration,
              mealCombo: meal,
              priceRs: subtotal ?? 0,
              planSlug: plan.slug,
              planName: plan.label,
              tier,
            })}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              marginTop: 16, width: "100%", minHeight: 54, textDecoration: "none",
              background: C.lime, border: `1px solid ${C.lime}`, color: C.onLime,
              fontFamily: SANS, fontWeight: 600, fontSize: 17, letterSpacing: "0", textTransform: "none",
            }}
          >
            Order · {rs(p.totalRs)}
          </Link>
        ) : (
          <Link
            href={`/plans/${plan.slug}?tier=${tier}`}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              marginTop: 16, width: "100%", minHeight: 54, textDecoration: "none",
              background: "transparent", border: `1px solid ${C.lime}`, color: C.lime,
              fontFamily: SANS, fontWeight: 600, fontSize: 17, letterSpacing: "0", textTransform: "none",
            }}
          >
            Join the {tierRow.label} waitlist
          </Link>
        )}

        <p style={{ margin: "11px 0 20px", fontFamily: SANS, fontSize: 12, lineHeight: 1.6, color: C.dim }}>
          {tierRow.available
            ? "Order before 9pm and the first delivery is tomorrow at 08:00. Pause, skip or swap any day from the dashboard."
            : `${tierRow.label} prices are an estimate at × ${tierMultiplier(tier).toFixed(2)} of Standard until those kitchens open.`}
        </p>
      </div>
    </Sheet>
  );
}
