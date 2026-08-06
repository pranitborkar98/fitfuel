"use client";

// app/_shop/Shop.tsx
//
// design/FitFuel Shop.dc.html — the SHOP screen, implemented.
//
// The storefront is drawn in two halves and the fold between them is the whole
// argument of the page.
//
//   PART ONE IS A SHOP. Trial day, eight aisles, sixteen dishes you can put in
//   a basket right now, six course rails, three plans priced as a real day of
//   food, the corporate rail and the digital plans. Nothing above the fold asks
//   you to believe anything: it asks you to order.
//
//   PART TWO IS THE MOAT. "Anyone can sell you a salad" opens seven blocks that
//   each name something a cloud kitchen with a Swiggy listing cannot copy in a
//   weekend: weighed macros per dish, a thirty-day rotation, a coach that
//   argues with your goal, the tracker, owning the whole line, 3,614 published
//   prices, and the bulk accounts.
//
// This is a client component for one reason: the basket. Adding a dish, opening
// the dish sheet and configuring a plan are all interactions on the same state,
// and the prototype is one stateful component for the same reason. Everything
// the database can answer is fetched in app/page.tsx and passed in, so the
// screen renders identically whether or not those queries succeed.

import Link from "next/link";
import { useMemo, useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import { TRIAL, TRIAL_TOTAL_GLYPH } from "@/lib/trial-price";
import { MENU_STATS } from "@/lib/menu-alacarte";
import {
  AISLES, APP_ROWS, APP_SCREENS, COACH_FIGURES, CORP_FROM_RS, CORP_PLANS, CORP_TIERS,
  COURSES, CUISINES, DIGITAL, MONTH_TOTAL_RS, PER_MEAL_RS, PRICED_DISHES, SHOP_PLANS,
  dishSlot, macroBars, rs, type ShopDish,
} from "./catalog";
import { ShopFooter, ShopHeader, ShopTabs, SectionLabel } from "./Chrome";
import DishSheet from "./DishSheet";
import PlanSheet from "./PlanSheet";
import Slot, { type SlotMap } from "./Slot";
import { C, COND, MONO, SANS, body, display, figure, ghostBtn, grid, label, num, solidBtn, sub, PANEL, PANEL_LIVE, RAIL } from "./theme";
import s from "./shop.module.css";

export type ShopMeal = { slot: string; name: string; kcal: number; protein: number; carbs: number; fat: number };
export type ShopDay = { d: number; dishes: ShopMeal[]; kcal: number; protein: number };

export type ShopProps = {
  /** Seven days off the Weight Loss (Veg) schedule, live from PlanScheduleSlot. */
  days: ShopDay[];
  /** slug → public image src, resolved at build time on the server. */
  images: SlotMap;
  counts: { plans: number; conditions: number; exercises: number; supplements: number; foods: number; prices: number };
  waHref: string;
  licence: string;
};

/* The counts strip is the one place on the site that carries more than one
   hue. It is inherited from the v2 homepage ticker and the prototype keeps it,
   but it is a standing conflict with DESIGN.md's "lime is the only chromatic
   value" — flagged rather than silently resolved either way. */
const COUNT_ROWS = (c: ShopProps["counts"]) => [
  { n: c.plans.toLocaleString("en-IN"), l: "goal & condition plans", accent: C.limeLight },
  { n: c.conditions.toLocaleString("en-IN"), l: "medical conditions", accent: C.ink },
  { n: c.exercises.toLocaleString("en-IN"), l: "exercises", accent: C.ink },
  { n: c.supplements.toLocaleString("en-IN"), l: "supplements", accent: C.ink },
  { n: c.foods.toLocaleString("en-IN"), l: "foods tracked", accent: C.lime },
  { n: c.prices.toLocaleString("en-IN"), l: "published prices", accent: C.ink },
];

/** Three segments over a 4px trough. The dish's own macros, as a proportion of
 *  its own calories, on every catalog surface. */
function Bars({ bars, height = 4 }: { bars: { pct: number; color: string }[]; height?: number }) {
  if (!bars.length) return null;
  return (
    <span aria-hidden="true" style={{ display: "flex", gap: 2, height, background: C.trough }}>
      {bars.map((b, i) => (
        <span key={i} style={{ display: "block", height: "100%", width: `${b.pct}%`, background: b.color }} />
      ))}
    </span>
  );
}

/** The one control that changes per dish: add it, or ask what it costs. */
function DishAction({ dish, size = "row" }: { dish: ShopDish; size?: "row" | "rail" | "tile" }) {
  const cart = useCart();
  const qty = cart.qtyOf(dish.id);
  const asked = cart.hasEnquiry(dish.id);
  const compact = size === "rail";

  const base: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: 44, minWidth: compact ? 60 : 104, padding: "0 12px",
    fontFamily: COND, fontWeight: 800, fontSize: compact ? 12.5 : 13.5,
    letterSpacing: "0.06em", textTransform: "uppercase", cursor: "pointer",
    ...(size === "tile" ? { margin: 11, minHeight: 44 } : null),
  };

  if (!dish.orderable) {
    return (
      <button
        type="button"
        onClick={() => cart.toggleEnquiry(dish.id)}
        style={{ ...base, background: "transparent", border: `1px solid ${asked ? C.lime : C.rule2}`, color: asked ? C.lime : C.mute }}
      >
        {asked ? (compact ? "Asked" : "Price asked") : compact ? "Ask" : "Ask price"}
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => cart.add(dish.id)}
      style={{ ...base, border: `1px solid ${C.lime}`, background: qty > 0 ? "transparent" : C.lime, color: qty > 0 ? C.lime : C.onLime }}
    >
      {qty > 0 ? (compact ? `+${qty}` : `${qty} in order`) : size === "tile" ? "Add to order" : "Add"}
    </button>
  );
}

export default function Shop({ days, images, counts, waHref, licence }: ShopProps) {
  const [sheetDish, setSheetDish] = useState<ShopDish | null>(null);
  const [planIx, setPlanIx] = useState<number | null>(null);
  const [day, setDay] = useState(0);

  const active = days[day] ?? days[0]!;
  const peak = Math.max(...days.map((x) => x.kcal));
  const floorK = Math.min(...days.map((x) => x.kcal)) - 150;

  /* The trial-day receipt, as widths. Four segments that always sum to the
     total, because they are computed from it rather than typed. */
  const trialBits = useMemo(() => {
    const t = TRIAL.totalRs;
    return [
      { w: (TRIAL.baseRs / t) * 100, bg: C.ink, k: `food ${TRIAL.baseRs}` },
      { w: (TRIAL.deliveryRs / t) * 100, bg: C.limeLight, k: `del ${TRIAL.deliveryRs}` },
      { w: (TRIAL.packagingRs / t) * 100, bg: C.fat, k: `pack ${TRIAL.packagingRs}` },
      { w: (TRIAL.gstRs / t) * 100, bg: C.rule2, k: `gst ${TRIAL.gstRs}` },
    ];
  }, []);

  const dayOne = days[0]!;

  return (
    <div style={{ position: "relative", background: C.bg, color: C.ink, minHeight: "100vh", fontFamily: SANS, overflowX: "clip" }}>
      {/* Generated grain. A data URI, so there is no image request and nothing
          to 404. Fixed, overlay, and never in the way of a pointer. */}
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 0.055, mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      <ShopHeader active="shop" waHref={waHref} />

      {/* A <div>, not a <main>: components/ChromeGate already wraps every
          route in one, and two <main> landmarks nested inside each other is
          invalid markup and two "main" stops for a screen reader. */}
      <div className={s.pad}>
        {/* ══ THE TRIAL DAY ══ */}
        <section aria-labelledby="shop-trial" className={s.shell} style={{ padding: "18px 16px 0" }}>
          <div style={PANEL_LIVE}>
            <div style={{ padding: "16px 16px 12px" }}>
              <span style={{ display: "block", ...label(10.5, { color: C.lime }), marginBottom: 9 }}>Start here · one day</span>
              <h1 id="shop-trial" style={display(34, { lineHeight: 0.86 })}>
                Trial day
                <br />
                {TRIAL_TOTAL_GLYPH} all in
              </h1>
              <p style={body(13.5, { margin: "11px 0 0", maxWidth: "34ch" })}>
                Breakfast plus lunch, cooked to your macros and at your door by 08:00 tomorrow. Nothing to cancel.
              </p>
            </div>

            <div aria-hidden="true" style={{ display: "flex", gap: 1, padding: "0 16px" }}>
              {trialBits.map((b) => (
                <span key={b.k} style={{ width: `${b.w}%`, height: 10, background: b.bg }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "7px 16px 0", ...label(10, { letterSpacing: "0.1em" }) }}>
              {trialBits.map((b) => (
                <span key={b.k}>{b.k}</span>
              ))}
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 1, background: C.rule, marginTop: 16 }}>
              <Link href="/plans?trial=true" style={{ ...solidBtn({ minHeight: 50, fontSize: 16, textDecoration: "none" }) }}>
                Start the trial day
              </Link>
              <span style={{ display: "grid", placeItems: "center", padding: "0 14px", background: C.panel, ...label(10.5, { letterSpacing: "0.12em" }), textAlign: "center" }}>
                6 mornings
                <br />a week
              </span>
            </div>
          </div>
        </section>

        {/* ══ SHOP BY COURSE ══ */}
        <section aria-labelledby="shop-aisles" className={s.shell} style={{ padding: "26px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 12 }}>
            <h2 id="shop-aisles" style={display(22, { lineHeight: 1, letterSpacing: "-0.02em" })}>Shop by course</h2>
            <span style={label(10.5, { letterSpacing: "0.16em" })}>{AISLES.length} aisles</span>
          </div>
          <div className={s.four} style={grid("repeat(4,1fr)")}>
            {AISLES.map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={s.tile}
                style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "space-between", gap: 14, minHeight: 92, padding: "10px 9px", background: C.panel, textDecoration: "none" }}
              >
                <span style={{ ...num(14, { color: C.lime }) }}>{a.n}</span>
                <span style={sub(14, { lineHeight: 1, letterSpacing: "0.01em" })}>{a.label}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ ORDER TONIGHT — the sixteen priced dishes ══ */}
        <section aria-labelledby="shop-tonight" className={s.shell} style={{ padding: "30px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
            <h2 id="shop-tonight" style={display(26, { lineHeight: 1, letterSpacing: "-0.025em" })}>Order tonight</h2>
            <Link href="/menu" className={s.under} style={{ ...label(10.5, { letterSpacing: "0.14em", color: C.lime }), display: "inline-flex", alignItems: "center", minHeight: 44, paddingLeft: 8, textDecoration: "none" }}>
              All {MENU_STATS.items} →
            </Link>
          </div>
          <p style={body(13, { margin: "0 0 14px" })}>
            Single meals, no subscription, no minimum. {MENU_STATS.priced === 16 ? "Sixteen" : MENU_STATS.priced} dishes carry a
            price the kitchen has set, and every one of them is here.
          </p>

          <div style={grid("1fr 1fr")}>
            {PRICED_DISHES.map((d) => (
              <article key={d.id} className={s.tile} style={{ background: C.panel, display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", aspectRatio: "3/2", background: C.panel2, borderBottom: `1px solid ${C.rule}`, overflow: "hidden" }}>
                  <Slot images={images} name={d.slot} alt={d.name} dish={d} />
                  <span style={{ position: "absolute", top: 0, left: 0, background: C.lime, color: C.bg, ...label(10, { letterSpacing: "0.16em", color: C.bg }), padding: "5px 8px", pointerEvents: "none" }}>
                    {d.categoryLabel}
                  </span>
                  <span style={{ position: "absolute", right: 0, bottom: 0, background: C.bg, padding: "4px 8px", ...figure(21, { lineHeight: 1 }), pointerEvents: "none" }}>
                    {d.priceLabel}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setSheetDish(d)}
                  style={{ all: "unset", cursor: "pointer", display: "block", padding: "11px 11px 0" }}
                >
                  <span style={{ display: "block", ...sub(15) }}>{d.name}</span>
                  <span style={{ display: "block", marginTop: 6, fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: C.dim }}>{d.shortBlurb}</span>
                </button>

                <span style={{ display: "block", padding: "9px 11px 0" }}>
                  <span style={{ display: "flex", alignItems: "baseline", gap: 7 }}>
                    <span style={num(11, { color: C.lime })}>{d.kcalLabel}</span>
                    <span style={{ ...num(10, { fontWeight: 400, color: C.dim }) }}>{d.macroLine}</span>
                  </span>
                  <span style={{ display: "block", marginTop: 7 }}>
                    <Bars bars={d.bars} />
                  </span>
                </span>

                <DishAction dish={d} size="tile" />
              </article>
            ))}
          </div>
        </section>

        {/* ══ THE SIX COURSE RAILS ══ */}
        {COURSES.map((course) => (
          <section key={course.key} aria-labelledby={`rail-${course.key}`} style={{ padding: "28px 0 0" }}>
            <div className={s.shell} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 16px", marginBottom: 4 }}>
              <h2 id={`rail-${course.key}`} style={display(22, { lineHeight: 1, letterSpacing: "-0.02em" })}>{course.label}</h2>
              <span style={label(10, { letterSpacing: "0.14em" })}>{course.n} dishes</span>
            </div>
            <p className={s.shell} style={body(12.5, { margin: "0 auto 12px", padding: "0 16px", color: C.dim })}>{course.note}</p>

            <div className={`${s.rail} ${s.shell}`} style={{ ...RAIL, padding: "0 16px 2px" }}>
              {course.items.map((d) => (
                <article key={d.id} className={s.tile} style={{ flex: "none", width: 186, background: C.panel, border: `1px solid ${C.rule}`, display: "flex", flexDirection: "column", scrollSnapAlign: "start" }}>
                  <div style={{ position: "relative", height: 112, background: C.panel2, borderBottom: `1px solid ${C.rule}`, overflow: "hidden" }}>
                    <Slot images={images} name={d.slot} alt={d.name} dish={d} sizes="186px" />
                    <span style={{ position: "absolute", left: 0, bottom: 0, background: C.bg, padding: "4px 7px", ...num(10, { color: C.lime }), pointerEvents: "none" }}>
                      {d.kcalLabel}
                    </span>
                  </div>
                  <button type="button" onClick={() => setSheetDish(d)} style={{ all: "unset", cursor: "pointer", display: "block", padding: "12px 12px 0" }}>
                    <span style={{ display: "block", ...sub(15), minHeight: 32 }}>{d.name}</span>
                    <span style={{ display: "block", marginTop: 7, fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: C.dim }}>{d.shortBlurb}</span>
                  </button>
                  <div style={{ marginTop: "auto", padding: "11px 12px 0" }}>
                    <span style={{ display: "block", ...num(10, { fontWeight: 400, color: C.dim }) }}>{d.macroLine}</span>
                    <span style={{ display: "block", marginTop: 6 }}>
                      <Bars bars={d.bars} />
                    </span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, padding: 12 }}>
                    <span style={d.orderable ? figure(21, { lineHeight: 1 }) : label(11, { letterSpacing: "0.16em" })}>{d.priceLabel}</span>
                    <DishAction dish={d} size="rail" />
                  </div>
                </article>
              ))}
            </div>
          </section>
        ))}

        {/* ══ A WHOLE DAY, ON ONE PLAN ══ */}
        <section aria-labelledby="shop-plans" className={s.shell} style={{ padding: "32px 16px 0" }}>
          <SectionLabel accent>Eat this way daily</SectionLabel>
          <h2 id="shop-plans" style={display(32, { margin: "11px 0 0" })}>
            A whole day,
            <br />
            on one plan
          </h2>
          <p style={body(13.5, { margin: "12px 0 16px" })}>
            Four weighed meals a day on a 30-day rotation. This is an actual day off each plan: the dishes, the calories,
            and what the month costs.
          </p>

          {SHOP_PLANS.slice(0, 3).map((p, ix) => {
            const meals = (days[ix] ?? dayOne).dishes;
            const bars = p.pcf ? macroBars(p.pcf[0], p.pcf[1], p.pcf[2], (p.pcf[0] + p.pcf[1]) * 4 + p.pcf[2] * 9) : [];
            return (
              <div key={p.slug} className={`${s.rise}`} style={{ ...PANEL, marginBottom: 16 }}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: C.rule }}>
                  {meals.map((m) => (
                    <span key={m.slot} style={{ position: "relative", display: "block", height: 104, background: C.panel2, overflow: "hidden" }}>
                      <Slot images={images} name={dishSlot(m.name)} alt={m.name} dish={m} sizes="25vw" />
                      <span style={{ position: "absolute", top: 0, left: 0, background: C.lime, color: C.bg, fontFamily: MONO, fontWeight: 700, fontSize: 12, letterSpacing: "0.14em", textTransform: "uppercase", padding: "4px 6px", pointerEvents: "none" }}>
                        {m.slot}
                      </span>
                      <span style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "12px 6px 5px", background: "linear-gradient(transparent,rgba(7,7,7,0.96))", ...num(10), pointerEvents: "none" }}>
                        {m.kcal} kcal
                      </span>
                    </span>
                  ))}
                </div>

                <div style={{ padding: 14 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
                    <span style={{ minWidth: 0 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 8 }}>
                        <span aria-hidden="true" style={{ width: 7, height: 7, flex: "none", background: "#22c55e" }} />
                        <span style={label(10, { letterSpacing: "0.16em" })}>Veg · standard · 30-day rotation</span>
                      </span>
                      <b style={display(30, { display: "block", lineHeight: 0.9 })}>{p.label}</b>
                      <span style={{ display: "block", marginTop: 6, fontFamily: SANS, fontSize: 12.5, color: C.dim }}>{p.note}</span>
                    </span>
                    <span style={{ flex: "none", textAlign: "right" }}>
                      <b style={figure(30, { display: "block", color: C.lime })}>{p.kcal?.toLocaleString("en-IN") ?? "—"}</b>
                      <span style={{ display: "block", marginTop: 6, ...label(10, { letterSpacing: "0.14em" }) }}>kcal a day</span>
                    </span>
                  </div>

                  <div style={{ marginTop: 14 }}>
                    <Bars bars={bars} height={5} />
                  </div>
                  <span style={{ display: "block", marginTop: 8, ...num(10, { fontWeight: 400, color: C.mute }) }}>{p.macroLine}</span>
                  <p style={body(12, { margin: "12px 0 0", color: C.dim, textWrap: "pretty" })}>
                    {meals.map((m) => m.name).slice(0, 3).join(", ")} and {meals[3]?.name}.
                  </p>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, alignItems: "center", marginTop: 14, paddingTop: 13, borderTop: `1px solid ${C.rule}` }}>
                    <span>
                      <span style={{ display: "block" }}>
                        <b style={figure(23)}>{rs(PER_MEAL_RS)}</b>
                        <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: C.dim }}> a meal</span>
                      </span>
                      <span style={{ display: "block", marginTop: 5, ...label(10, { letterSpacing: "0.1em" }) }}>
                        {rs(MONTH_TOTAL_RS)} a month, all in
                      </span>
                    </span>
                    <button type="button" onClick={() => setPlanIx(ix)} style={solidBtn({ minHeight: 44, fontSize: 14 })}>
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          <Link
            href="/plans"
            className={s.tile}
            style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", minHeight: 54, padding: "0 15px", border: `1px solid ${C.rule2}`, textDecoration: "none" }}
          >
            <span style={{ fontFamily: COND, fontWeight: 900, fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase", color: C.ink }}>See more plans</span>
            <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <span style={label(10, { letterSpacing: "0.12em" })}>{Math.max(0, counts.plans - 3)} more</span>
              <span style={{ fontFamily: MONO, fontSize: 13, color: C.lime }}>→</span>
            </span>
          </Link>
        </section>

        {/* ══ FOR THE OFFICE ══ */}
        <section aria-labelledby="shop-office" style={{ padding: "30px 0 0" }}>
          <div className={s.shell} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, padding: "0 16px", marginBottom: 4 }}>
            <h2 id="shop-office" style={display(26, { lineHeight: 1, letterSpacing: "-0.025em" })}>For the office</h2>
            <Link href="/corporate" className={s.under} style={{ ...label(10.5, { letterSpacing: "0.14em", color: C.lime }), display: "inline-flex", alignItems: "center", minHeight: 44, paddingLeft: 8, textDecoration: "none" }}>Bulk rates →</Link>
          </div>
          <p className={s.shell} style={body(13, { margin: "0 auto 14px", padding: "0 16px" })}>
            Same kitchen, priced per seat. Every employee still picks their own goal and diet; you get one GST invoice.
          </p>
          <div className={`${s.rail} ${s.shell}`} style={{ ...RAIL, padding: "0 16px 2px" }}>
            {CORP_PLANS.map((p) => (
              <article key={p.slug} className={s.tile} style={{ flex: "none", width: 214, background: C.panel, border: `1px solid ${C.rule}`, display: "flex", flexDirection: "column", scrollSnapAlign: "start" }}>
                <div style={{ position: "relative", height: 118, background: C.panel2, borderBottom: `1px solid ${C.rule}`, overflow: "hidden" }}>
                  <Slot images={images} name={`corporate-${p.slug}`} alt={p.label} sizes="214px" />
                  <span style={{ position: "absolute", top: 0, left: 0, background: C.lime, ...label(10, { letterSpacing: "0.14em", color: C.bg }), padding: "4px 7px", pointerEvents: "none" }}>{p.tag}</span>
                </div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", flex: 1 }}>
                  <b style={display(20, { display: "block", lineHeight: 0.94, letterSpacing: "-0.02em" })}>{p.label}</b>
                  <span style={{ display: "block", marginTop: 8, fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: C.dim }}>
                    {p.note.split(".")[0]}.
                  </span>
                  <span style={{ display: "block", marginTop: "auto", paddingTop: 12 }}>
                    <b style={figure(26, { display: "block", color: C.lime })}>{p.price}</b>
                    <span style={{ display: "block", marginTop: 6, ...label(10, { letterSpacing: "0.1em" }) }}>{p.unit}</span>
                  </span>
                </div>
              </article>
            ))}
          </div>
          <div className={s.shell} style={{ padding: "14px 16px 0" }}>
            <Link
              href="/corporate"
              className={s.tile}
              style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", minHeight: 54, padding: "0 15px", border: `1px solid ${C.lime}`, textDecoration: "none" }}
            >
              <span style={{ fontFamily: COND, fontWeight: 900, fontSize: 16, letterSpacing: "0.06em", textTransform: "uppercase", color: C.lime }}>Price your team</span>
              <span style={label(10, { letterSpacing: "0.1em" })}>from {rs(CORP_FROM_RS)} a meal</span>
            </Link>
          </div>
        </section>

        {/* ══ NOT IN PUNE? ══ */}
        <section aria-labelledby="shop-digital" className={s.shell} style={{ padding: "32px 16px 0" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, marginBottom: 4 }}>
            <h2 id="shop-digital" style={display(26, { lineHeight: 1, letterSpacing: "-0.025em" })}>Not in Pune?</h2>
            <Link href="/plans/digital" className={s.under} style={{ ...label(10.5, { letterSpacing: "0.14em", color: C.lime }), display: "inline-flex", alignItems: "center", minHeight: 44, paddingLeft: 8, textDecoration: "none" }}>Digital plans →</Link>
          </div>
          <p style={body(13, { margin: "0 0 14px" })}>
            Cook it yourself, anywhere in India. The same 30-day plan as a PDF: recipes, per-meal macros, a consolidated
            grocery list, and logging on the same dashboard.
          </p>
          <div style={grid("1fr 1fr")}>
            {DIGITAL.map((d) => (
              <Link key={d.key} href="/plans/digital" className={s.tile} style={{ display: "block", background: C.panel, textDecoration: "none" }}>
                <span style={{ position: "relative", display: "block", height: 126, background: C.panel2, borderBottom: `1px solid ${C.rule}`, overflow: "hidden" }}>
                  <Slot images={images} name={`digital-${d.key.toLowerCase()}`} alt={d.label} sizes="50vw" />
                  <span style={{ position: "absolute", top: 0, left: 0, background: d.popular ? C.lime : C.bg, color: d.popular ? C.bg : C.dim, ...label(10, { letterSpacing: "0.14em", color: d.popular ? C.bg : C.dim }), padding: "4px 7px", pointerEvents: "none" }}>
                    {d.popular ? "Most popular" : "Cook it yourself"}
                  </span>
                </span>
                <span style={{ display: "block", padding: 12 }}>
                  <b style={display(21, { display: "block", lineHeight: 0.94, letterSpacing: "-0.025em" })}>{d.label}</b>
                  <span style={{ display: "block", marginTop: 7, ...label(10, { letterSpacing: "0.1em" }) }}>30-day PDF · {d.bullets.length} inclusions</span>
                  <span style={{ display: "block", marginTop: 9, fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: C.dim }}>{d.bullets[0]}</span>
                </span>
              </Link>
            ))}
          </div>
        </section>

        {/* ══ PART TWO ══ */}
        <section aria-labelledby="shop-moats" style={{ marginTop: 44, padding: "26px 0 22px", background: C.panel, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}` }}>
          <div className={s.shell} style={{ padding: "0 16px" }}>
            <SectionLabel accent>Part two</SectionLabel>
            <h2 id="shop-moats" style={display(46, { margin: "12px 0 0", lineHeight: 0.84, letterSpacing: "-0.035em" })}>
              Anyone can
              <br />
              sell you
              <br />
              <span style={{ color: C.lime }}>a salad.</span>
            </h2>
            <p style={body(14, { margin: "16px 0 0" })}>
              Below this line is everything the kitchen has built that a cloud kitchen with a Swiggy listing cannot copy
              in a weekend.
            </p>
          </div>
        </section>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.rule, borderBottom: `1px solid ${C.rule}` }}>
          {COUNT_ROWS(counts).map((c) => (
            <div key={c.l} style={{ padding: "16px 13px", background: C.bg }}>
              <b style={figure(38, { display: "block", lineHeight: 0.84, letterSpacing: "-0.04em", color: c.accent })}>{c.n}</b>
              <span style={{ display: "block", marginTop: 9, ...label(10, { letterSpacing: "0.16em" }) }}>{c.l}</span>
            </div>
          ))}
        </div>

        {/* ══ MOAT 01 — THE SCALE ══ */}
        <section aria-labelledby="moat-1" className={s.shell} style={{ padding: "30px 16px 0" }}>
          <SectionLabel>Moat 01 · the scale</SectionLabel>
          <h2 id="moat-1" style={display(32, { margin: "11px 0 0" })}>
            Weighed on a scale,
            <br />
            not eyeballed
          </h2>
          <p style={body(13.5, { margin: "12px 0 0" })}>
            Every dish carries its own weighed macros, not a plan average. Here is day one of Weight Loss (Veg), the plan
            the kitchen cooks most.
          </p>
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 16, border: `1px solid ${C.rule}` }}>
            <caption className="sr-only">Day one of Weight Loss (Veg): four meals and their weighed macros</caption>
            <tbody>
              {dayOne.dishes.map((m) => (
                <tr key={m.slot} style={{ background: C.panel, borderBottom: `1px solid ${C.rule}` }}>
                  <th scope="row" style={{ textAlign: "left", padding: 13, fontWeight: 400 }}>
                    <span style={{ display: "block", ...label(10, { letterSpacing: "0.18em", color: C.lime }), marginBottom: 7 }}>{m.slot}</span>
                    <span style={{ display: "block", ...sub(16, { lineHeight: 1.08 }) }}>{m.name}</span>
                  </th>
                  <td style={{ padding: 13, textAlign: "right", whiteSpace: "nowrap", ...num(10.5, { fontWeight: 400, color: C.dim }) }}>
                    {m.kcal} kcal · {Math.round(m.protein)}g P
                  </td>
                </tr>
              ))}
              <tr style={{ background: C.panel2 }}>
                <th scope="row" style={{ textAlign: "left", padding: 13, ...label(10.5, { letterSpacing: "0.16em" }), fontWeight: 400 }}>Day one, all in</th>
                <td style={{ padding: 13, textAlign: "right" }}>
                  <b style={figure(26, { color: C.lime })}>
                    {Math.round(dayOne.kcal).toLocaleString("en-IN")} kcal · {Math.round(dayOne.protein)}g
                  </b>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ══ MOAT 02 — THE ROTATION ══ */}
        <section aria-labelledby="moat-2" className={s.shell} style={{ padding: "34px 16px 0" }}>
          <SectionLabel>Moat 02 · the rotation</SectionLabel>
          <h2 id="moat-2" style={display(32, { margin: "11px 0 0" })}>
            Thirty days.
            <br />
            No repeats.
          </h2>
          <p style={body(13.5, { margin: "12px 0 0" })}>
            Twenty-six distinct dishes a week across eleven regional cuisines, published a month ahead. Tap a day.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 5, alignItems: "end", height: 160, marginTop: 18 }}>
            {days.map((x) => {
              const on = x.d === day;
              const h = Math.round(((x.kcal - floorK) / Math.max(1, peak - floorK)) * 100);
              return (
                <button
                  key={x.d}
                  type="button"
                  onClick={() => setDay(x.d)}
                  aria-pressed={on}
                  style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: 7, background: "transparent", border: 0, padding: 0, cursor: "pointer" }}
                >
                  <span aria-hidden="true" style={{ width: "100%", height: `${h}%`, minHeight: 22, marginTop: "auto", background: on ? C.lime : C.rule2, borderTop: `3px solid ${on ? C.limeLight : "#4c4c46"}` }} />
                  <b style={{ fontFamily: COND, fontWeight: 900, fontSize: 13, letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: on ? C.limeLight : C.ink }}>
                    {x.kcal}
                  </b>
                  <span style={label(10, { letterSpacing: "0.1em", color: on ? C.ink : C.dim })}>D{x.d + 1}</span>
                </button>
              );
            })}
          </div>
          <p style={{ display: "flex", flexWrap: "wrap", gap: 10, margin: "14px 0 0", ...label(10, { letterSpacing: "0.14em" }) }}>
            {CUISINES.map((cu) => (
              <span key={cu}>{cu}</span>
            ))}
          </p>
          <p style={body(12.5, { margin: "12px 0 0", color: C.dim })}>
            Day {day + 1}: {active.dishes.map((m) => m.name).join(", ")}.
          </p>
        </section>

        {/* ══ MOAT 03 — THE COACH ══ */}
        <section aria-labelledby="moat-3" className={s.shell} style={{ padding: "34px 16px 0" }}>
          <SectionLabel>Moat 03 · the coach</SectionLabel>
          <h2 id="moat-3" style={display(32, { margin: "11px 0 0" })}>
            The plan
            <br />
            argues back
          </h2>
          <p style={body(13.5, { margin: "12px 0 0" })}>
            Four weigh-ins that disagree with your goal move your target, with the arithmetic shown, and a ±300 kcal cap
            so it can never crash your day.
          </p>
          <div style={{ ...PANEL, marginTop: 16 }}>
            <div style={{ padding: 14, borderBottom: `1px solid ${C.rule}` }}>
              <span style={{ display: "block", ...label(10, { letterSpacing: "0.18em" }), marginBottom: 8 }}>You</span>
              <span style={{ display: "block", fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: C.ink }}>
                I have not lost anything for two weeks. Am I doing something wrong?
              </span>
            </div>
            <div style={{ padding: 14 }}>
              <span style={{ display: "block", ...label(10, { letterSpacing: "0.18em", color: C.lime }), marginBottom: 8 }}>Coach</span>
              <span style={{ display: "block", fontFamily: SANS, fontSize: 13, lineHeight: 1.6, color: C.mute }}>
                No. Four weigh-ins say 78.4, 78.2, 78.3, 78.2 kg, so your actual rate is 0.05 kg a week against the 0.50
                your goal needs. Through 7,700 kcal per kg that gap is 495 kcal a day, which the cap holds at 300.
              </span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 12 }}>
                {COACH_FIGURES.map((f) => (
                  <span key={f} style={{ border: `1px solid ${C.rule2}`, padding: "6px 9px", ...num(10.5, { fontWeight: 400 }) }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ MOAT 04 — THE APP ══ */}
        <section aria-labelledby="moat-4" className={s.shell} style={{ padding: "34px 16px 0" }}>
          <SectionLabel>Moat 04 · the app</SectionLabel>
          <h2 id="moat-4" style={display(32, { margin: "11px 0 0" })}>
            The food
            <br />
            logs itself
          </h2>
          <p style={body(13.5, { margin: "12px 0 0" })}>
            Nobody else delivering lunch in Pune also ships the tracker. Your meals arrive already entered, and behind
            that sits a real product, not a receipt list.
          </p>
          <div className={s.rail} style={{ ...RAIL, marginTop: 18, paddingBottom: 2 }}>
            {APP_SCREENS.map((sc) => (
              <article key={sc.key} className={s.tile} style={{ flex: "none", width: 198, background: C.panel, border: `1px solid ${C.rule}`, scrollSnapAlign: "start", display: "flex", flexDirection: "column" }}>
                <div style={{ position: "relative", height: 236, background: C.panel2, borderBottom: `1px solid ${C.rule}`, overflow: "hidden" }}>
                  <Slot images={images} name={`app-${sc.key}`} alt={`${sc.label} screen`} sizes="198px" />
                  <span style={{ position: "absolute", top: 0, left: 0, background: C.lime, ...label(10, { letterSpacing: "0.14em", color: C.bg }), padding: "4px 7px", pointerEvents: "none" }}>{sc.tag}</span>
                </div>
                <div style={{ padding: 12, display: "flex", flexDirection: "column", flex: 1 }}>
                  <b style={display(19, { display: "block", lineHeight: 0.96, letterSpacing: "-0.02em" })}>{sc.label}</b>
                  <span style={{ display: "block", marginTop: 7, fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: C.dim }}>{sc.note}</span>
                  <span style={{ display: "block", marginTop: "auto", paddingTop: 11, ...num(10.5, { color: C.lime }) }}>{sc.stat}</span>
                </div>
              </article>
            ))}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 1, background: C.rule, border: `1px solid ${C.rule}`, marginTop: 16 }}>
            {APP_ROWS.map((r) => (
              <div key={r.label} className={s.row} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 13, alignItems: "baseline", padding: 14, background: C.panel }}>
                <b style={figure(22, { lineHeight: 1, color: C.lime, minWidth: 56 })}>{r.n}</b>
                <span>
                  <span style={{ display: "block", ...sub(16, { lineHeight: 1 }) }}>{r.label}</span>
                  <span style={{ display: "block", marginTop: 6, fontFamily: SANS, fontSize: 12.5, lineHeight: 1.5, color: C.dim }}>{r.note}</span>
                </span>
              </div>
            ))}
          </div>
          <Link href="/dashboard" style={solidBtn({ marginTop: 14, width: "100%", minHeight: 50, textDecoration: "none" })}>
            Look inside the dashboard
          </Link>
        </section>

        {/* ══ MOAT 05 — THE MARGIN ══ */}
        <section aria-labelledby="moat-5" className={s.shell} style={{ padding: "34px 16px 0" }}>
          <SectionLabel>Moat 05 · the margin</SectionLabel>
          <h2 id="moat-5" style={display(32, { margin: "11px 0 0" })}>
            We own the
            <br />
            whole line
          </h2>
          <p style={body(13.5, { margin: "12px 0 0" })}>
            Own kitchen, own licence, own drivers, own storefront. The apps take roughly 40 paise of every rupee. This
            shop takes none.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
            {/* Zomato red and Swiggy orange are those companies' own brand
                colours, used to name a third party rather than to decorate
                ours. That is the only reason a non-lime hue is allowed here. */}
            {[["Zomato", "#e23744"], ["Swiggy", "#fc8019"]].map(([nm, col]) => (
              <span key={nm} style={{ display: "inline-flex", alignItems: "center", gap: 7, border: `1px solid ${col}`, color: col, padding: "9px 12px", fontFamily: SANS, fontSize: 13, fontWeight: 600 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true">
                  <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
                  <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
                </svg>
                {nm}
              </span>
            ))}
            <span style={{ display: "inline-flex", alignItems: "center", border: `1px solid ${C.lime}`, color: C.lime, padding: "9px 12px", fontFamily: COND, fontWeight: 800, fontSize: 14, letterSpacing: "0.06em", textTransform: "uppercase" }}>
              Direct · this shop
            </span>
          </div>
          <Link href="/menu/card" style={ghostBtn(false, { marginTop: 14, width: "100%", minHeight: 48, textDecoration: "none" })}>
            See the price difference
          </Link>
        </section>

        {/* ══ MOAT 06 — THE RECEIPT ══ */}
        <section aria-labelledby="moat-6" className={s.shell} style={{ padding: "34px 16px 0" }}>
          <SectionLabel>Moat 06 · the receipt</SectionLabel>
          <h2 id="moat-6" style={display(32, { margin: "11px 0 0" })}>
            {counts.prices.toLocaleString("en-IN")} prices,
            <br />
            all published
          </h2>
          <p style={body(13.5, { margin: "12px 0 0" })}>
            Every plan, length, meal combination and diet has a price printed on the site, with food, delivery, packaging
            and GST split out. Nothing is quoted on WhatsApp that is not already here.
          </p>
          <div style={{ ...grid("1fr 1fr"), marginTop: 16 }}>
            {[
              { n: TRIAL_TOTAL_GLYPH, l: `Trial day, all in. Food ${TRIAL.baseRs}, delivery ${TRIAL.deliveryRs}, packaging ${TRIAL.packagingRs}, GST ${TRIAL.gstRs}.` },
              { n: rs(PER_MEAL_RS), l: "Per meal on a one-month, four-meal plan." },
              { n: "5%", l: "GST on food, shown before you pay, never added at the door." },
              { n: "08:00", l: "At your door, six mornings a week, from Kharadi." },
            ].map((p) => (
              <div key={p.l} style={{ padding: "14px 12px", background: C.panel }}>
                <b style={figure(24, { display: "block" })}>{p.n}</b>
                <span style={{ display: "block", marginTop: 8, fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: C.mute }}>{p.l}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ══ MOAT 07 — THE ACCOUNTS ══ */}
        <section aria-labelledby="moat-7" className={s.shell} style={{ padding: "34px 16px 0" }}>
          <SectionLabel>Moat 07 · the accounts</SectionLabel>
          <h2 id="moat-7" style={display(32, { margin: "11px 0 0" })}>
            Gyms, offices,
            <br />
            expos, NutraBay
          </h2>
          <p style={body(13.5, { margin: "12px 0 0" })}>
            A cloud kitchen sells one lunch at a time. Bulk pricing is published for four seat bands, voucher blocks,
            expo counters and a supplement channel that runs on someone else&rsquo;s stock.
          </p>
          <Link href="/corporate" className={s.tile} style={{ display: "block", width: "100%", marginTop: 16, border: `1px solid ${C.rule}`, textDecoration: "none" }}>
            <span style={{ position: "relative", display: "block", height: 132, background: C.panel2, borderBottom: `1px solid ${C.rule}`, overflow: "hidden" }}>
              <Slot images={images} name="corporate" alt="A FitFuel corporate lunch drop at reception" sizes="(max-width: 860px) 100vw, 900px" />
            </span>
            <span style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 1, background: C.rule }}>
              {CORP_TIERS.map((t) => (
                <span key={t.label} style={{ padding: "12px 11px", background: C.panel }}>
                  <b style={figure(22, { display: "block", color: C.lime })}>{rs(t.perMeal)}</b>
                  <span style={{ display: "block", marginTop: 6, ...label(10, { letterSpacing: "0.12em" }) }}>{t.label} seats · {t.off}</span>
                </span>
              ))}
            </span>
            <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "14px 13px", background: C.panel, borderTop: `1px solid ${C.rule}` }}>
              <span style={sub(15, { letterSpacing: "0.06em" })}>Price a corporate account</span>
              <span style={{ fontFamily: MONO, fontSize: 13, color: C.lime }}>→</span>
            </span>
          </Link>
        </section>

        {/* ══ THE CLOSE ══ */}
        <section aria-labelledby="shop-close" className={s.shell} style={{ padding: "34px 16px 20px" }}>
          <div style={{ ...PANEL_LIVE, padding: 18 }}>
            <h2 id="shop-close" style={display(34, { lineHeight: 0.86 })}>
              Start with
              <br />
              one day.
            </h2>
            <p style={body(13.5, { margin: "12px 0 0" })}>
              {TRIAL_TOTAL_GLYPH}, breakfast and lunch tomorrow morning. If it is not better than what you were going to
              order anyway, that is where it ends.
            </p>
            <Link href="/plans?trial=true" style={solidBtn({ marginTop: 16, width: "100%", minHeight: 52, fontSize: 17, textDecoration: "none" })}>
              Start the trial day
            </Link>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginTop: 14, paddingTop: 12, borderTop: `1px solid ${C.rule}`, ...label(10, { letterSpacing: "0.14em" }) }}>
              <span>FSSAI licensed</span>
              <span>Kharadi kitchen</span>
              <span>15 areas</span>
            </div>
          </div>
        </section>

        <ShopFooter licence={licence} />
      </div>

      <ShopTabs active="shop" />

      {sheetDish && <DishSheet dish={sheetDish} images={images} onClose={() => setSheetDish(null)} />}
      {planIx !== null && <PlanSheet plan={SHOP_PLANS[planIx]!} onClose={() => setPlanIx(null)} />}
    </div>
  );
}
