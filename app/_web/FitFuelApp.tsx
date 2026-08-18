"use client";

// app/_web/FitFuelApp.tsx
//
// THE FITFUEL WEBAPP.
//
// What this replaces, and why. `/` was a 29-section scrolling document that
// argued the business: a trial panel, eight aisles, six course rails, three
// plan showcases, then seven numbered "moat" blocks. Every section was real and
// most of the content is still in the product — but the SHAPE was a brochure,
// and the owner asked for the shape a food app has. Those are different
// products, and no palette change turns one into the other.
//
// So the primary gesture here is search-and-add, not scroll-and-read:
//
//   - The shell is persistent. Search, location and basket never scroll away.
//     Sidebar >=1024px, bottom tab bar below, exactly one visible.
//   - The catalog is filterable in the client, instantly, over all 48 dishes.
//     No round trip, no skeleton, no "loading dishes…".
//   - Adding is one tap and the control morphs into a stepper in place.
//   - The basket surfaces itself as a bar the moment it has something in it.
//
// The long-form argument (moats, the rotation, the coach, the day timeline)
// is NOT deleted — it moves to routes that already exist and are linked from
// the rail. A customer choosing lunch should not have to scroll past a pitch
// deck; someone who wants the pitch can still reach it.

import Image from "next/image";
import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import { receipt } from "@/lib/menu-cart";
import { PLAN_CATS, type ShopDish, type ShopPlan } from "@/app/_shop/catalog";
import DishSheet from "@/app/_shop/DishSheet";
import PlanSheet from "@/app/_shop/PlanSheet";
import Sheet, { SheetClose } from "@/app/_shop/Sheet";
import Slot, { type SlotMap } from "@/app/_shop/Slot";
import { SERVICES } from "./services";
import HomeBands, { type BandCounts, type Quote } from "./HomeBands";
import Platform from "./Platform";
import s from "./app.module.css";

/* Alias so helper components can reach the stylesheet without shadowing the
   `s` name used for props inside the main component. */
const sx = s;

/* ── Icons ─────────────────────────────────────────────────────────────────
   Inline, 1.6 stroke, one family. SVG rather than an icon package so the
   shell has no runtime dependency and no version surprise, and never emoji. */
const I = {
  search: "M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16Zm10 2-4.35-4.35",
  x: "M18 6 6 18M6 6l12 12",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  bowl: "M3 11h18a9 9 0 0 1-18 0ZM7 11a5 5 0 0 1 10 0M12 3v3",
  layers: "m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
} as const;

function Icon({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}

/* THE RAIL IS FOR THINGS A BROWSING CUSTOMER CAN ACTUALLY USE.
   It previously listed "Diary" and "Account", which route to logged-in
   dashboard screens on a different visual system — a visitor clicking them
   lands somewhere unrecognisable and signed out. "Plans" also navigated AWAY
   from the app to a legacy page; it now switches the catalog in place, because
   the subscription IS the main product and it belongs inside the shell.
   Diary/Coach/Training still exist and are reached from Your account. */
type NavItem =
  | { kind: "mode"; mode: "dishes" | "plans" | "supps"; label: string; icon: string }
  | { kind: "link"; href: string; label: string; icon: string };

const NAV: NavItem[] = [
  { kind: "mode", mode: "dishes", label: "Order tonight", icon: I.bowl },
  { kind: "mode", mode: "plans", label: "Meal plans", icon: I.layers },
  { kind: "mode", mode: "supps", label: "Supplements", icon: I.spark },
  { kind: "link", href: "/dashboard/coach", label: "Coach", icon: I.spark },
  { kind: "link", href: "/dashboard", label: "Your account", icon: I.user },
];

/* THE FOOTER EXISTS BECAUSE A REACHABILITY AUDIT FOUND 26 ORPHANS. The app
   linked to 10 routes; everything else that exists — /plans, /menu, /results,
   /testimonials, /tdee-calculator, /locations, /about, /blog and EVERY legal
   page — was unreachable from `/`. Refund, privacy, terms and the medical
   disclaimer being unreachable is not a UX nicety, it is a compliance problem. */
const FOOTER: { title: string; links: { href: string; label: string }[] }[] = [
  { title: "Order", links: [
    { href: "/menu", label: "Full menu" },
    { href: "/plans", label: "All meal plans" },
    { href: "/plans/digital", label: "Digital plans" },
    { href: "/corporate", label: "For offices" },
    { href: "/supplements", label: "Supplements" },
  ]},
  { title: "FitFuel", links: [
    { href: "/why", label: "Why FitFuel" },
    { href: "/how-it-works", label: "How a day works" },
    { href: "/our-kitchen", label: "The kitchen" },
    { href: "/our-team", label: "The team" },
    { href: "/our-ingredients", label: "Our ingredients" },
    { href: "/about", label: "About" },
  ]},
  { title: "Proof", links: [
    { href: "/results", label: "Results" },
    { href: "/testimonials", label: "Testimonials" },
    { href: "/tdee-calculator", label: "TDEE calculator" },
    { href: "/locations", label: "Where we deliver" },
    { href: "/blog", label: "Blog" },
    { href: "/faq", label: "Questions" },
  ]},
  { title: "Legal", links: [
    { href: "/privacy", label: "Privacy" },
    { href: "/terms", label: "Terms" },
    { href: "/refund-policy", label: "Refunds" },
    { href: "/allergen-policy", label: "Allergens" },
    { href: "/medical-disclaimer", label: "Medical disclaimer" },
    { href: "/contact", label: "Contact" },
  ]},
];

/* Everything the long-form page used to argue, still reachable. */
const MORE = [
  /* /why carries the plan finder, the receipt builder, the day timeline and the
     coach. Those were orphaned when `/` became the app — reachable from nowhere
     — so this link is not decoration, it is the only way back to them. */
  { href: "/why", label: "Why FitFuel" },
  { href: "/dashboard/trainer", label: "Ask the coach" },
  { href: "/how-it-works", label: "How a day works" },
  { href: "/our-kitchen", label: "The kitchen" },
  { href: "/corporate", label: "For offices" },
  { href: "/supplements", label: "Supplements" },
  { href: "/faq", label: "Questions" },
] as const;

export type Course = { key: string; label: string; n: number };

/** A plan row from the database, shaped so PlanSheet can consume it unchanged. */
export type PlanMeal = { slot: string; name: string; kcal: number };
export type AppSupp = {
  slug: string; name: string; brand: string | null; tagline: string;
  category: string; form: string | null; dosage: string | null;
  timing: string | null; evidence: string | null; studies: string | null;
  benefits: string[];
};

/* THE SERVICES. The v2 homepage argued these as scrolling sections; a webapp
   carries them as destinations. Each is real and NONE was reachable from the
   app: the coach is lib/coach + lib/ai-trainer, training is 952 Exercise rows,
   corporate is CORP_PLANS, digital is 17 MealPlanProduct rows, and the gym
   network is Partner rows. */
/* SERVICES lives in ./services.ts. app/page.tsx is a server component and has to
   read it to resolve the photographs, and Next replaces every export of a
   "use client" module with a client REFERENCE across that boundary — so
   `SERVICES.map(...)` on the server threw "SERVICES.map is not a function" at
   prerender, after tsc and eslint both passed clean. Shared data belongs in a
   module that is neither client nor server. */

export type PlanVariant = {
  diet: string;
  slug: string;
  label: string;
  kcal: number;
  protein: number;
  meals: number;
};
export type AppPlan = ShopPlan & {
  diet: string;
  sub: string;
  meals: PlanMeal[];
  variants: PlanVariant[];
};

/* DIET_LABEL and SLOT_LABEL lived here for the plan card's two disclosure
   panels. Both panels are gone: the diet list is the live picker in the
   Configure sheet, and SLOT_LABEL moved to PlanSheet with the day-one menu. */

/** Diet chips. Jain and Vegan are cooked to the vegetarian sheet and priced as
 *  VEGETARIAN, but they are still separate plans and a customer filters by the
 *  word they use for themselves. */
const DIETS: { key: string; label: string }[] = [
  { key: "all", label: "Any diet" },
  { key: "VEG", label: "Vegetarian" },
  { key: "EGG", label: "Eggetarian" },
  { key: "NON_VEG", label: "Non-veg" },
  { key: "JAIN", label: "Jain" },
  { key: "VEGAN", label: "Vegan" },
];

export type AppProps = {
  dishes: ShopDish[];
  images: SlotMap;
  courses: Course[];
  plans: AppPlan[];
  supplements: AppSupp[];
  area: string;
  cutoffLabel: string;
  trialTotal: string;
  menuFrom: string;
  planCount: number;
  licence: string;
  /** Resolved server-side — lib/site-images.ts reads the filesystem and must
   *  never be called from a client component. Keyed by the service's href. */
  serviceImages: Record<string, string | null>;
  /** The delivery-area map, rendered on the server and handed down as a node so
   *  the location chip can open it without this file importing a server
   *  component. */
  areaPanel?: React.ReactNode;
  /** Counts and quotes for the bands below the catalog. Both come from the
   *  database in page.tsx so a figure here cannot disagree with the catalogue
   *  it describes. */
  bandCounts: BandCounts;
  quotes: Quote[];
};

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * MACRO SPLIT — the share of a dish's calories from protein, carbs and fat.
 *
 * "14P · 32C · 14F" is a readout: it makes the reader do arithmetic to answer
 * the only question anyone asks of it — is this a protein dish or a carb dish.
 * A proportional graphic answers that at a glance and keeps the grams for
 * anyone who wants them.
 *
 * 4 kcal/g for protein and carbs, 9 for fat, normalised so the shares always
 * sum to 100% even when the stated kcal disagrees slightly with the macros.
 *
 * ── WHY ONE RING AND NOT THREE ─────────────────────────────────────────────
 * The reflexive version of this graphic is three rings, one per macro, each
 * filling against its own maximum. That maximum is always invented. A ring
 * reads as "X out of Y", and on a menu grid there is no Y — we do not know the
 * reader's protein target while they are scanning lunch. Three rings sitting
 * at 70%, 40% and 60% full state a fact nobody has.
 *
 * This is a single ring whose three arcs are shares of one denominator that is
 * real: the dish's own calories. The circle closes by construction, and the
 * number in the middle is what the arcs are shares OF.
 *
 * It is NOT a macro ring standing in for a photograph, which AGENTS.md forbids.
 * The image well above it is untouched and still carries the dish; this sits in
 * the card body beside the name, blurb and price, and visualises numbers the
 * card already prints in words.
 */
const RING_R = 26;
const RING_C = 2 * Math.PI * RING_R;
/** Visual separation between arcs, in path units. Three gaps, so three×. */
const RING_GAP = 3.5;

function MacroSplit({
  p,
  c,
  f,
  kcal,
  unit = "kcal",
}: {
  p: number;
  c: number;
  f: number;
  kcal?: number;
  unit?: string;
}) {
  const kp = p * 4, kc = c * 4, kf = f * 9;
  const total = kp + kc + kf;
  if (!total) return null;

  /* Shares are taken from the raw kcal fractions, not from the rounded
     percentages, so three roundings cannot leave the ring 1% short or long. */
  const segs = [
    { key: "protein", label: "P", g: p, share: kp / total, cls: sx.segP, arc: sx.arcP },
    { key: "carbs", label: "C", g: c, share: kc / total, cls: sx.segC, arc: sx.arcC },
    { key: "fat", label: "F", g: f, share: kf / total, cls: sx.segF, arc: sx.arcF },
  ];
  const usable = RING_C - RING_GAP * segs.length;
  let cursor = 0;
  const arcs = segs.map((sg) => {
    const len = sg.share * usable;
    const start = cursor;
    cursor += len + RING_GAP;
    return { ...sg, len, start };
  });

  const proteinPct = Math.round((kp / total) * 100);

  return (
    <div className={sx.macro}>
      {/* One sentence for the whole graphic. The ring is decorative so a screen
          reader is not read three unlabelled shapes. */}
      <span className="fk-sr-only">
        {`${p} grams protein, ${c} grams carbohydrate, ${f} grams fat. ${proteinPct} per cent of calories from protein.`}
      </span>

      <svg className={sx.donut} viewBox="0 0 64 64" width="64" height="64" aria-hidden="true">
        <circle className={sx.donutTrack} cx="32" cy="32" r={RING_R} />
        {arcs.map((a) => (
          <circle
            key={a.key}
            className={`${sx.donutArc} ${a.arc}`}
            cx="32"
            cy="32"
            r={RING_R}
            style={
              {
                "--len": a.len.toFixed(2),
                "--circ": RING_C.toFixed(2),
                strokeDashoffset: -a.start,
              } as React.CSSProperties
            }
          />
        ))}
        {/* The denominator, in the middle of the thing it is the denominator of.
            Printed without a thousands separator: a plan's daily figure is four
            digits, and "1,800" does not fit the 45px well inside the ring. The
            narrow class drops the size for those. */}
        {kcal ? (
          <>
            <text
              className={`${sx.donutNum} ${kcal >= 1000 ? sx.donutNumWide : ""}`}
              x="32"
              y="31"
            >
              {kcal}
            </text>
            <text className={sx.donutUnit} x="32" y="42">{unit}</text>
          </>
        ) : null}
      </svg>

      <span className={sx.macroKeys} aria-hidden="true">
        {segs.map((sg) => (
          <span key={sg.key} className={sx.macroKey}>
            <i className={sg.cls} />
            {sg.g}g {sg.label}
          </span>
        ))}
      </span>
    </div>
  );
}

/**
 * BADGES, computed from the macros rather than typed by a marketer.
 *
 * A grid of 48 cards with identical structure has nothing to scan by. These are
 * the three claims the data can actually support, and each is a threshold on
 * real numbers: 12 dishes are high-protein at 25% of calories, 15 come in under
 * 250 kcal, 10 are low-carb at 20% or less. No badge is shown that cannot be
 * recomputed from the card's own figures.
 *
 * Two maximum. A card wearing four badges is a card with no hierarchy.
 *
 * DELIBERATELY ABSENT: a veg / non-veg mark. In India that is a regulated
 * claim, and the only way to derive it here would be keyword-matching dish
 * names — "Avocado Chicken" is easy, a paneer dish cooked in ghee is not. It
 * needs a real column on the dish, not a guess. Flagged rather than faked.
 */
function badgesFor(d: ShopDish): string[] {
  if (!d.kcal) return [];
  const out: string[] = [];
  if ((d.protein * 4) / d.kcal >= 0.25) out.push("High protein");
  if ((d.carbs * 4) / d.kcal <= 0.2) out.push("Low carb");
  if (d.kcal < 250) out.push("Under 250 kcal");
  return out.slice(0, 2);
}

/**
 * A deterministic colour field for the image well.
 *
 * Every card carried the same empty dark rectangle across the top — roughly 40%
 * of the card showing nothing, 48 times, which is what made the grid read as a
 * single texture. A coloured ground gives the grid rhythm while a card is still
 * waiting for its photograph, and the moment a real image lands it replaces
 * this with no layout change.
 *
 * THE HUE COMES FROM THE COURSE, NOT FROM A HASH OF THE ID. The first version
 * hashed the id, which produced variety and nothing else: two salads could land
 * 180° apart and a reader scrolling the grid learned nothing from the colour.
 * Anchoring each course to a hue makes the rhythm carry information — every
 * salad reads as one family — and the ±12° jitter keeps twelve salads from
 * being twelve identical rectangles.
 *
 * Hues stay in the part of the wheel food occupies: leaf, butter, roast, morning
 * yellow, berry, cold-press. Nothing lands in the blues.
 *
 * It is a SURFACE, not a diagram: it does not encode flavour, heat or
 * ingredients, and nothing about it invites the reader to decode it. That is
 * the line AGENTS.md draws — a macro ring pretending to be a dish is out, a
 * coloured ground under a course label is not.
 */
/* Three of the six courses live in the warm end, which is where the crowding
   is. Measured across all 48 cards, centres at 12/30/46 with ±12 of jitter put
   Bowls at 0-23, Keto at 20-37 and Breakfast at 35-56 — two overlaps, so a bowl
   and a keto dish could land on the same colour and the family cue was false
   exactly where most of the menu sits. Centres re-spaced to 20° apart and the
   jitter cut to ±7, which separates every pair. */
const COURSE_HUE: Record<string, number> = {
  bowls: 14,      // roast
  keto: 34,       // butter
  breakfast: 54,  // morning
  salads: 96,     // leaf
  juices: 168,    // cold-press
  bars: 344,      // berry
};
/** Half-width of the within-course spread, in degrees. */
const HUE_JITTER = 7;

/** Stable small integer from a string, for the within-course jitter. */
function hashOf(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 4096;
  return h;
}

function field(hue: number): React.CSSProperties {
  const h = ((hue % 360) + 360) % 360;
  return {
    backgroundImage:
      `radial-gradient(120% 100% at 20% 0%, hsl(${h} 45% 22% / 0.85), transparent 62%),` +
      `radial-gradient(90% 90% at 90% 100%, hsl(${(h + 48) % 360} 40% 18% / 0.7), transparent 60%)`,
  };
}

/** Dishes: the course sets the family, the id sets the variation within it. */
function dishField(d: ShopDish): React.CSSProperties {
  const base = COURSE_HUE[d.category] ?? 96;
  return field(base + (hashOf(d.id) % (HUE_JITTER * 2 + 1)) - HUE_JITTER);
}

/** Plans have no course, so they keep the hash. */
function fieldStyle(id: string): React.CSSProperties {
  return field(hashOf(id) % 360);
}

/**
 * POINTER-TRACKED DEPTH, at a cost the grid can afford.
 *
 * ONE listener on the grid, not one per card: a 126-plan grid would otherwise
 * attach 252 handlers. Reads are rAF-throttled to a single write per frame, and
 * the only thing written is four custom properties on one element — CSS
 * composes the transform and the gradient from there. Writing .style.transform
 * on several children per pointermove, which is the usual shape of this effect,
 * forces layout on every event.
 *
 * Bails entirely on coarse pointers and under prefers-reduced-motion, so a
 * phone never runs any of it. Everything degrades to the plain card.
 */
function useCardTilt<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof window.matchMedia !== "function") return;
    if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    /* Tilt in degrees at the corners. 8° — the figure the effect is usually
       written with — visibly skews a paragraph of body copy. 5 reads as depth
       and leaves the blurb flat enough to finish reading. */
    const MAX = 5;
    let frame = 0;
    let next: { el: HTMLElement; x: number; y: number } | null = null;

    const paint = () => {
      frame = 0;
      if (!next) return;
      const { el, x, y } = next;
      el.style.setProperty("--mx", `${x.toFixed(1)}%`);
      el.style.setProperty("--my", `${y.toFixed(1)}%`);
      el.style.setProperty("--rx", `${((50 - y) / 50) * MAX}deg`);
      el.style.setProperty("--ry", `${((x - 50) / 50) * MAX}deg`);
      /* Where the chromatic edge is brightest. atan2 puts 0 at three o'clock
         and the conic gradient starts its band a little after `from`, so the
         quarter turn lands the bright part under the cursor rather than
         trailing it. */
      const deg = (Math.atan2(y - 50, x - 50) * 180) / Math.PI - 90;
      el.style.setProperty("--edge", `${deg.toFixed(1)}deg`);
    };

    const clear = (el: HTMLElement) => {
      for (const p of ["--mx", "--my", "--rx", "--ry", "--edge"]) el.style.removeProperty(p);
    };

    const cardOf = (n: EventTarget | null) =>
      n instanceof Element ? (n.closest("li") as HTMLElement | null) : null;

    const onMove = (e: PointerEvent) => {
      const el = cardOf(e.target);
      if (!el || !root.contains(el)) return;
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      next = {
        el,
        x: ((e.clientX - r.left) / r.width) * 100,
        y: ((e.clientY - r.top) / r.height) * 100,
      };
      if (!frame) frame = requestAnimationFrame(paint);
    };

    /* pointerout bubbles (pointerleave does not), so it is the one that works
       for a delegated listener — but it also fires when crossing between
       children of the same card. relatedTarget tells those apart. */
    const onOut = (e: PointerEvent) => {
      const el = cardOf(e.target);
      if (!el) return;
      const to = e.relatedTarget;
      if (to instanceof Node && el.contains(to)) return;
      if (next?.el === el) next = null;
      clear(el);
    };

    root.addEventListener("pointermove", onMove, { passive: true });
    root.addEventListener("pointerout", onOut, { passive: true });
    /* Marks in the DOM that the effect engaged, so "is the tilt live?" is a
       question the page can answer directly. The effect has four separate
       reasons to bail (no ref, no matchMedia, coarse pointer, reduced motion)
       and without this the only way to tell a bail from a broken listener is
       to watch for motion — which a non-compositing preview pane cannot show. */
    root.dataset.tilt = "on";
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerout", onOut);
      delete root.dataset.tilt;
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return ref;
}

/** Add / stepper. One control, two states, same footprint. */
function AddControl({ dish }: { dish: ShopDish }) {
  const cart = useCart();
  const qty = cart.qtyOf(dish.id);
  const asked = cart.hasEnquiry(dish.id);

  if (!dish.orderable) {
    return (
      <button
        type="button"
        className={`${s.add} ${s.ghost} ${asked ? s.ghostOn : ""}`}
        onClick={() => cart.toggleEnquiry(dish.id)}
        aria-pressed={asked}
      >
        {asked ? "Price asked" : "Ask price"}
      </button>
    );
  }

  if (qty === 0) {
    return (
      <button type="button" className={s.add} onClick={() => cart.add(dish.id)}>
        Add
      </button>
    );
  }

  return (
    <span className={s.stepper}>
      <button
        type="button"
        className={s.stepBtn}
        onClick={() => cart.setQty(dish.id, qty - 1)}
        aria-label={`Remove one ${dish.name}`}
      >
        −
      </button>
      {/* CONFIRMATION AT THE POINT OF CONTACT. Tapping Add swapped the button
          for this stepper and said nothing else; the only other feedback is the
          basket count in the header, which is the one place you are not looking.
          The number pops on every change.

          The live region is the OUTER span and stays mounted — re-creating an
          aria-live element is how announcements get dropped. The inner span
          carries key={qty} so it remounts and replays the CSS animation, which
          is why this needs no timers, no state and no injected nodes. */}
      <span className={s.stepQty} aria-live="polite" aria-label={`${qty} in order`}>
        <span key={qty} className={s.qtyPop}>
          {qty}
        </span>
      </span>
      <button
        type="button"
        className={s.stepBtn}
        onClick={() => cart.add(dish.id)}
        aria-label={`Add one more ${dish.name}`}
      >
        +
      </button>
    </span>
  );
}

export default function FitFuelApp({
  dishes,
  images,
  courses,
  plans,
  supplements,
  area,
  cutoffLabel,
  trialTotal,
  menuFrom,
  planCount,
  licence,
  serviceImages,
  areaPanel,
  bandCounts,
  quotes,
}: AppProps) {
  const cart = useCart();
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [onlyOrderable, setOnlyOrderable] = useState(false);
  const [sheet, setSheet] = useState<ShopDish | null>(null);
  /* Two catalogs, one shell. Dishes are a single meal tonight; plans are a
     subscription configured by duration x diet x meals x tier. Both are the
     product, and the old page made you scroll past one to reach the other. */
  const [mode, setMode] = useState<"dishes" | "plans" | "supps">("dishes");
  const [suppCat, setSuppCat] = useState("all");
  const [planCat, setPlanCat] = useState("all");
  const [planDiet, setPlanDiet] = useState("all");
  /* AppPlan, not ShopPlan. Typing this as ShopPlan erased `meals` at the state
     boundary, so the day-one schedule never reached the sheet. */
  const [planSheet, setPlanSheet] = useState<AppPlan | null>(null);
  /* The order bar is dismissible. It is fixed, it sits over the last row of
     cards, and shipping it with no way out left a customer with something in
     the basket staring at a slab across the menu for the rest of the session.
     Dismissing costs nothing: the basket is one tap away in the header and the
     badge there still carries the count. */
  const [barHidden, setBarHidden] = useState(false);
  /* openVariants / openMenu are gone with the two disclosure buttons on the
     plan card. Both contents live in the Configure sheet now — see the comment
     on the plan card foot for why an inline panel was the wrong container. */
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useCardTilt<HTMLDivElement>();
  const [areaOpen, setAreaOpen] = useState(false);

  /* Keeps typing responsive on a long list: the input updates every keystroke,
     the 48-item filter runs at React's leisure. */
  const dq = useDeferredValue(q);

  /* "/" focuses search, the convention every catalog app follows. Ignored while
     the user is already typing somewhere. */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      const typing = t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable);
      if (e.key === "/" && !typing) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === "Escape" && document.activeElement === searchRef.current) setQ("");
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const needle = dq.trim().toLowerCase();
    return dishes.filter((d) => {
      if (course !== "all" && d.category !== course) return false;
      if (onlyOrderable && !d.orderable) return false;
      if (!needle) return true;
      return (
        d.name.toLowerCase().includes(needle) ||
        d.blurb.toLowerCase().includes(needle) ||
        d.category.toLowerCase().includes(needle)
      );
    });
  }, [dishes, dq, course, onlyOrderable]);

  const planResults = useMemo(() => {
    const needle = dq.trim().toLowerCase();
    return plans.filter((p) => {
      if (planCat !== "all" && p.cat !== planCat) return false;
      if (planDiet !== "all" && !p.variants.some((v) => v.diet === planDiet)) return false;
      if (!needle) return true;
      /* `sub` is the condition slug — searching it is what lets someone type
         "pcos", "thyroid" or "fatty liver" and land on their plan across 59
         conditions, which a label-only search would miss. */
      return (
        p.label.toLowerCase().includes(needle) ||
        p.note.toLowerCase().includes(needle) ||
        p.sub.replace(/_/g, " ").includes(needle) ||
        p.macroLine.toLowerCase().includes(needle)
      );
    });
  }, [plans, dq, planCat, planDiet]);

  /** Live counts per category, so a chip never leads to an empty grid. */
  const catCount = useMemo(() => {
    const m: Record<string, number> = { all: plans.length };
    for (const p of plans) m[p.cat] = (m[p.cat] ?? 0) + 1;
    return m;
  }, [plans]);

  const suppCats = useMemo(() => {
    const m = new Map<string, number>();
    for (const x of supplements) m.set(x.category, (m.get(x.category) ?? 0) + 1);
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [supplements]);

  const suppResults = useMemo(() => {
    const needle = dq.trim().toLowerCase();
    return supplements.filter((x) => {
      if (suppCat !== "all" && x.category !== suppCat) return false;
      if (!needle) return true;
      return (
        x.name.toLowerCase().includes(needle) ||
        x.tagline.toLowerCase().includes(needle) ||
        x.category.toLowerCase().includes(needle) ||
        x.benefits.some((b) => b.toLowerCase().includes(needle))
      );
    });
  }, [supplements, dq, suppCat]);

  /* ── THE GRID WAS SEVENTY PER CENT OF THE PAGE ─────────────────────────
     Measured: 48 dish cards ran 13,396px of a 19,058px page — sixteen phone
     screens of near-identical cards — and every argument for the business sat
     underneath it. Scale at 13,920px, conditions at 14,360, proof at 15,224,
     all seven services at 16,002. Nobody scrolls to screen twenty, so none of
     it existed.

     Nothing is removed. The first twelve are shown, the rest are one tap away,
     and search and the filter chips still run over the FULL catalogue — so
     typing "pcos" or "keto" still reaches every match instantly. What changes
     is that the page stops being a wall before it has said anything.

     Twelve, not six: on a 4-column desktop grid that is three full rows, so
     the catalogue still reads as a catalogue rather than a teaser. */
  const PREVIEW = 12;
  /* Keyed on the filter signature rather than reset in an effect — expanding
     "keto" and then searching "juice" should not silently keep you expanded,
     and doing it this way needs no effect and cannot desync. */
  const filterKey = `${mode}|${dq}|${course}|${planCat}|${planDiet}|${suppCat}|${onlyOrderable}`;
  const [expandedFor, setExpandedFor] = useState<string | null>(null);
  const expanded = expandedFor === filterKey;
  const cap = <T,>(list: T[]): T[] => (expanded ? list : list.slice(0, PREVIEW));

  /* The "show the rest" control, under whichever grid is live.
     A render HELPER, not a component: declaring a component inside render gives
     it a new identity every pass, so React unmounts and remounts it on each
     keystroke — losing focus and replaying the entrance animation. Returning
     nodes from a plain function has none of that. */
  const showAllControl = (total: number, noun: string) =>
    expanded || total <= PREVIEW ? null : (
      <div className={s.showAllWrap}>
        <button type="button" className={s.showAll} onClick={() => setExpandedFor(filterKey)}>
          Show all {total.toLocaleString("en-IN")} {noun}
        </button>
        <p className={s.showAllNote}>
          Showing {PREVIEW}. Search and the filters above run over all{" "}
          {total.toLocaleString("en-IN")}.
        </p>
      </div>
    );

  const orderableCount = results.filter((d) => d.orderable).length;
  const basketCount = cart.totals.count;
  /* Adding another dish brings the bar back. Without this one dismissal
     silences it for the session and later additions give no feedback at all.
     Comparing against a ref rather than setting state unconditionally keeps
     this from cascading a render on every pass. */
  const seenCount = useRef(basketCount);
  useEffect(() => {
    if (seenCount.current !== basketCount) {
      seenCount.current = basketCount;
      setBarHidden(false);
    }
  }, [basketCount]);
  /* The bar prints what will actually be collected, not the food subtotal.
     lib/menu-cart's receipt() adds delivery, packaging and the 5% GST — and
     charges none of them when the basket is enquiries only. */
  const basketTotal = receipt(cart.lines).totalRs;

  return (
    <div className={`fk ${s.app}`}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className={s.top}>
        <div className={s.topRow}>
          <Link href="/" className={s.brand}>
            Fit<em>Fuel</em>
          </Link>

          <div className={s.searchWrap}>
            <span className={s.searchIcon}>
              <Icon d={I.search} size={18} />
            </span>
            <label htmlFor="fk-search" className="fk-sr-only">
              Search dishes
            </label>
            <input
              id="fk-search"
              ref={searchRef}
              className={s.search}
              type="search"
              inputMode="search"
              placeholder={`Search ${dishes.length} dishes`}
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoComplete="off"
            />
            {q ? (
              <button type="button" className={s.searchClear} onClick={() => setQ("")} aria-label="Clear search">
                <Icon d={I.x} size={18} />
              </button>
            ) : null}
          </div>

          <div className={s.topActions}>
            {/* A DEAD CONTROL UNTIL NOW. This was a <button> with no onClick —
                it looked like the location picker every food app has and did
                nothing at all when tapped.

                It opens the delivery-area map: app/_hp/Areas.tsx, which plots
                every suburb from its published coordinates with 3, 6 and 9km
                rings measured from the kitchen. That component was written for
                the v2 homepage and has been imported by NOTHING since — the
                whole argument for one kitchen in Kharadi serving a tight
                cluster, sitting on no route. This is the question a cold
                visitor asks first, so it belongs behind the control that names
                the area. */}
            <button
              type="button"
              className={s.place}
              onClick={() => setAreaOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={areaOpen}
            >
              <Icon d={I.pin} size={16} />
              {area}
            </button>
            <button
              type="button"
              className={s.iconBtn}
              onClick={() => cart.setOpen(true)}
              aria-label={`Your order, ${basketCount} item${basketCount === 1 ? "" : "s"}`}
            >
              <Icon d={I.bag} size={18} />
              {basketCount > 0 ? <span className={s.badge}>{basketCount}</span> : null}
            </button>
          </div>
        </div>
        <div className={s.cutoff}>
          {/* Two products, two promises. The 9pm/8am line is the SUBSCRIPTION
              schedule (lib/order-cutoff models plan deliveries); single meals
              are ordered and delivered like any food app. Showing the plan
              promise over a 48-dish catalog was telling a customer buying one
              salad that it arrives tomorrow morning. */}
          <p className={s.cutoffRow}>
            {mode === "plans" ? (
              <span>
                Plans start tomorrow — order by <b>{cutoffLabel}</b>, at your door by 8am.
              </span>
            ) : mode === "supps" ? (
              /* Supplements are not cooked and not delivered by our drivers —
                 they are researched and linked out. Saying "cooked to order"
                 over a nootropic is the kind of copy that erodes trust. */
              <span>
                Researched against your plan, not stocked. Priced across six retailers.
              </span>
            ) : (
              <span>
                Cooked to order and delivered across <b>{area}</b> today.
              </span>
            )}
          </p>
        </div>

        {/* ── Rail + content ──────────────────────────────────────────────── */}
        <div className={s.filters}>
          {/* Catalog switch. A subscription and a single meal are different
              purchases, so they get different chip sets rather than one mixed
              grid where a Rs 230 salad sits beside a Rs 17,849 month. */}
          <div className={s.modeRow} role="group" aria-label="What are you ordering">
            <button
              type="button"
              className={`${s.mode} ${mode === "dishes" ? s.modeOn : ""}`}
              onClick={() => setMode("dishes")}
              aria-pressed={mode === "dishes"}
            >
              Single meals <span className={s.fcount}>{dishes.length}</span>
            </button>
            <button
              type="button"
              className={`${s.mode} ${mode === "plans" ? s.modeOn : ""}`}
              onClick={() => setMode("plans")}
              aria-pressed={mode === "plans"}
            >
              Meal plans <span className={s.fcount}>{planCount}</span>
            </button>
            <button
              type="button"
              className={`${s.mode} ${mode === "supps" ? s.modeOn : ""}`}
              onClick={() => setMode("supps")}
              aria-pressed={mode === "supps"}
            >
              Supplements <span className={s.fcount}>{supplements.length}</span>
            </button>
          </div>

          {mode === "supps" ? (
            <div className={s.chipRow} role="group" aria-label="Filter supplements">
              <button
                type="button"
                className={`${s.fchip} ${suppCat === "all" ? s.fchipOn : ""}`}
                onClick={() => setSuppCat("all")}
                aria-pressed={suppCat === "all"}
              >
                Everything <span className={s.fcount}>{supplements.length}</span>
              </button>
              {suppCats.map(([c, n]) => (
                <button
                  key={c}
                  type="button"
                  className={`${s.fchip} ${suppCat === c ? s.fchipOn : ""}`}
                  onClick={() => setSuppCat(c)}
                  aria-pressed={suppCat === c}
                >
                  {c} <span className={s.fcount}>{n}</span>
                </button>
              ))}
            </div>
          ) : mode === "plans" ? (
            <>
              <div className={s.chipRow} role="group" aria-label="Filter plans by goal">
                {PLAN_CATS.map((c) => (
                  <button
                    key={c.key}
                    type="button"
                    className={`${s.fchip} ${planCat === c.key ? s.fchipOn : ""}`}
                    onClick={() => setPlanCat(c.key)}
                    aria-pressed={planCat === c.key}
                  >
                    {c.key === "all" ? "All plans" : c.label}
                    <span className={s.fcount}>{catCount[c.key] ?? 0}</span>
                  </button>
                ))}
              </div>
              <div className={s.chipRow} role="group" aria-label="Filter plans by diet" style={{ marginTop: 8 }}>
                {DIETS.map((d) => (
                  <button
                    key={d.key}
                    type="button"
                    className={`${s.fchip} ${planDiet === d.key ? s.fchipOn : ""}`}
                    onClick={() => setPlanDiet(d.key)}
                    aria-pressed={planDiet === d.key}
                  >
                    {d.label}
                  </button>
                ))}
              </div>
            </>
          ) : (
          <div className={s.chipRow} role="group" aria-label="Filter by course">
            <button
              type="button"
              className={`${s.fchip} ${course === "all" ? s.fchipOn : ""}`}
              onClick={() => setCourse("all")}
              aria-pressed={course === "all"}
            >
              Everything <span className={s.fcount}>{dishes.length}</span>
            </button>
            {courses.map((c) => (
              <button
                key={c.key}
                type="button"
                className={`${s.fchip} ${course === c.key ? s.fchipOn : ""}`}
                onClick={() => setCourse(c.key)}
                aria-pressed={course === c.key}
              >
                {c.label} <span className={s.fcount}>{c.n}</span>
              </button>
            ))}
            <button
              type="button"
              className={`${s.fchip} ${onlyOrderable ? s.fchipOn : ""}`}
              onClick={() => setOnlyOrderable((v) => !v)}
              aria-pressed={onlyOrderable}
            >
              Priced tonight
            </button>
          </div>
          )}
        </div>
      </header>

      <div className={s.body}>
        <nav className={s.rail} aria-label="Sections">
          <ul className={s.railList}>
            {NAV.map((n) => (
              <li key={n.label}>
                {n.kind === "mode" ? (
                  <button
                    type="button"
                    className={`${s.railLink} ${mode === n.mode ? s.railOn : ""}`}
                    onClick={() => setMode(n.mode)}
                    aria-current={mode === n.mode ? "page" : undefined}
                  >
                    <Icon d={n.icon} />
                    {n.label}
                  </button>
                ) : (
                  <Link href={n.href} className={s.railLink}>
                    <Icon d={n.icon} />
                    {n.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>

          <ul className={s.railList} style={{ marginTop: "var(--fk-s-5)" }}>
            {MORE.map((m) => (
              <li key={m.href}>
                <Link href={m.href} className={s.railLink} style={{ fontSize: "var(--fk-t-sm)" }}>
                  {m.label}
                </Link>
              </li>
            ))}
          </ul>

          <p className={s.railNote}>
            Our own kitchen, our own drivers.
            <br />
            FSSAI <span className="fk-num">{licence}</span>
          </p>
        </nav>

        {/* A <div>, NOT a <main>. components/ChromeGate already wraps every
            route in a <main>, so a second one here is a duplicate landmark —
            and, worse, globals.css paints `html, body, main` near-black for the
            legacy pages. `main:has(.fk)` flips ChromeGate's outer main to warm
            paper, but it cannot match a <main> nested INSIDE the .fk subtree,
            so this element was rendering dark ink on #070707. */}
        {/* The tilt listener lives on this stable wrapper rather than on the
            grid: the three catalog modes each mount their own <ul>, so a ref on
            the grid would go stale the moment someone switched to plans. One
            listener here covers dishes, plans and supplements for the life of
            the app. */}
        <div className={s.main} ref={gridRef}>
          {/* Filters. Counts are real, so a chip never leads to an empty grid. */}
          <div className={s.pad}>
            {/* The app's one h1. Visually hidden because the shell states the
                brand with the wordmark and the view with the result heading —
                a big "FitFuel" banner would be a landing-page habit. It is a
                stable sentence, not the filtered heading, so a screen reader
                does not get a new page title every time a chip is tapped. */}
            {/* ── THE PAGE NOW SAYS WHAT IT IS ──────────────────────────────
                This was `fk-sr-only`. The reasoning was that the wordmark
                states the brand and the result heading states the view, so a
                banner would be a landing-page habit. Measured against a real
                visitor that argument fails: the first 108 words of this page
                were a search box, six filter chips and a price, and none of
                them said what FitFuel is or that it cooks for 70 conditions.
                Someone arriving from a link had no idea what they were looking
                at.

                It is two lines of type, not a hero. Nothing is pushed below the
                fold — measured after, the first dish card sits at essentially
                the same height, because the sr-only h1 was already occupying
                the block and the offer row shrank to pay for the deck. */}
            <h1 className={s.claim}>Food cooked to your numbers.</h1>
            {/* The deck must NOT repeat the delivery promise. The cutoff row
                above it is mode-aware — "delivered across Kharadi today" for a
                single meal, "at your door by 8am" for a plan — and an earlier
                draft of this line said "by 8am" over a 48-dish menu, which is
                the exact mistake that row's own comment was written to prevent.
                So this says the part nothing else on the fold says. */}
            <p className={s.claimDeck}>
              Weighed to your macros, cooked in our own kitchen, and logged in
              the app for you.
            </p>

            {/* ── THE SCALE, WHERE IT CAN ACTUALLY BE READ ──────────────────
                These six figures already existed, in HomeBands, at 13,920px —
                seventeen screens down, under the entire 48-card grid. They are
                the whole argument for the price and nobody had ever reached
                them. Same numbers, same source (counted from the database in
                page.tsx, never typed), moved to where they do work. */}
            <ul className={s.proof} aria-label="What the kitchen runs">
              {[
                [bandCounts.dishes, "dishes"],
                [bandCounts.plans, "meal plans"],
                [bandCounts.conditionPlans, "for a condition"],
                [bandCounts.exercises, "exercises"],
                [bandCounts.supplements, "supplements"],
              ].map(([n, label]) => (
                <li key={String(label)}>
                  <b className="fk-num">{Number(n).toLocaleString("en-IN")}</b>
                  <span>{label}</span>
                </li>
              ))}
            </ul>

            {/* The offer is a row, not a hero. It never pushes food below the fold. */}
            <div className={s.offer}>
              <span className={s.offerText}>
                <b>Try one day for {trialTotal}</b>
                <span>Breakfast and lunch, cooked to your macros. Nothing to cancel.</span>
              </span>
              <Link href="/checkout" className={s.add} style={{ textDecoration: "none" }}>
                Start the trial
              </Link>
            </div>

            <div className={s.resultBar}>
              <h2>
                {q.trim()
                  ? `Results for “${q.trim()}”`
                  : mode === "supps"
                    ? (suppCat === "all" ? "Supplements" : suppCat)
                  : mode === "plans"
                    ? PLAN_CATS.find((c) => c.key === planCat)?.label
                    : course === "all"
                      ? "Everything on the menu"
                      : courses.find((c) => c.key === course)?.label}
              </h2>
              <p>
                {mode === "supps"
                  ? `${suppResults.length} of ${supplements.length} · researched, not stocked`
                  : mode === "plans"
                  ? `${planResults.length} of ${planCount} plans · 59 goals and conditions`
                  : `${results.length} dish${results.length === 1 ? "" : "es"}` +
                    (orderableCount !== results.length
                      ? ` · ${orderableCount} priced tonight, from ${menuFrom}`
                      : ` · from ${menuFrom}`)}
              </p>
            </div>

            {mode === "supps" ? (
              <>
              <ul className={s.grid}>
                {cap(suppResults).map((x) => (
                  <li key={x.slug} className={s.card}>
                    <div className={s.shotPlaceholder} aria-hidden="true">
                      <span>{x.category}</span>
                    </div>
                    <div className={s.cardBody}>
                      <p className={s.dishTop}>
                        <span className={s.dishCourse}>{x.category}</span>
                        {x.evidence ? <span className="fk-num">{x.evidence.replace(/_/g, " ")}</span> : null}
                      </p>
                      <Link href={`/supplements#${x.slug}`} className={s.dishName}>{x.name}</Link>
                      {x.tagline ? <p className={s.dishBlurb}>{x.tagline}</p> : null}
                      {x.benefits.length ? (
                        <ul className={s.benefits}>
                          {x.benefits.map((b) => <li key={b}>{b}</li>)}
                        </ul>
                      ) : null}
                      <p className={s.macroLine}>
                        {[x.form, x.dosage, x.timing].filter(Boolean).join(" · ") || "Dosage on the page"}
                      </p>
                      <div className={s.cardFoot}>
                        <span className={s.askPrice}>{x.studies ? `${x.studies} studies` : "Researched"}</span>
                        <Link href={`/supplements#${x.slug}`} className={`${s.add} ${s.ghost}`}>Read up</Link>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {showAllControl(suppResults.length, "supplements")}
              </>
            ) : mode === "plans" ? (
              <>
              <ul className={s.grid}>
                {cap(planResults).map((p) => (
                  <li key={p.slug} className={s.card}>
                    {/* The image slot is KEPT as a labelled placeholder. There is
                        no photography pipeline yet; when one lands, this well
                        takes the file with no layout change. */}
                    <div className={s.shotPlaceholder} style={fieldStyle(p.slug)} aria-hidden="true">
                      <span>{p.sub.replace(/_/g, " ")}</span>
                    </div>

                    <div className={s.cardBody}>
                      <p className={s.planCat}>
                        {p.variants.length} diet{p.variants.length === 1 ? "" : "s"} · 4 meals a day
                      </p>
                      {/* THE PRODUCT PAGE. app/plans/[slug] is an 80KB page with
                          the full 30-day schedule, live PlanPrice rows and
                          Product/Offer schema — it has existed all along and
                          the app never linked to it. The card title is the way
                          in; the buttons below stay for quick answers. */}
                      <Link href={`/plans/${p.slug}`} className={s.dishName}>
                        {p.label}
                      </Link>
                      <p className={s.dishBlurb}>{p.note}</p>
                      {/* The daily kcal was a line of its own above the bar.
                          It is the ring's centre now, labelled "a day" so the
                          per-day basis survives the move. Falls back to the
                          plain line when a plan has no macro split to draw. */}
                      {p.pcf ? (
                        <MacroSplit
                          p={p.pcf[0]}
                          c={p.pcf[1]}
                          f={p.pcf[2]}
                          kcal={p.kcal ?? undefined}
                          unit="a day"
                        />
                      ) : p.kcal ? (
                        <p className={s.macroLine}>{p.kcal.toLocaleString("en-IN")} kcal a day</p>
                      ) : null}

                      {/* ── TWO ACTIONS, NO ACCORDIONS ────────────────────────
                          This card carried three controls — "N variations",
                          "View menu" and "Configure" — and the first two were
                          both wrong.

                          "N variations" was a read-only list of diets and their
                          calories. Configure has the same diets as a live
                          picker, with FSSAI dots and a price that moves when you
                          choose. A disclosure that previews a better control is
                          just a longer route to it.

                          "View menu" opened an inline panel, and 1 of 126 plan
                          rows has a seeded day-1 menu — so 58 of these 59 cards
                          opened the identical apology. Worse, the grid stretches
                          a row to its tallest card, so expanding one card grew
                          all four in its row by 155px and shoved every Configure
                          button down with it. Nothing was broken about the
                          click; the feedback just landed everywhere except where
                          you were looking.

                          The day-one menu moved into the Configure sheet, where
                          the buying decision is actually made, and the full
                          30-day schedule is on the plan's own page. So: one link
                          to the page, one button to the sheet. */}
                      <div className={`${s.cardFoot} ${s.planFoot}`}>
                        <Link href={`/plans/${p.slug}`} className={`${s.add} ${s.ghost}`}>
                          See the plan
                        </Link>
                        <button type="button" className={s.add} onClick={() => setPlanSheet(p)}>
                          Configure
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {showAllControl(planResults.length, "plans")}
              </>
            ) : results.length === 0 ? (
              /* No off-domain escape hatch here either. An empty search result
                 is not a reason to hand the customer to another company's app —
                 the two useful actions are both on this page. */
              <div className={s.empty}>
                <h3>Nothing matches that.</h3>
                <p>
                  We cook {dishes.length} dishes across {courses.length} courses, and {planCount}{" "}
                  plans on subscription. Try a different word, or look through the plans.
                </p>
                <span className={s.emptyActions}>
                  <button type="button" className={s.add} onClick={() => { setQ(""); setCourse("all"); setOnlyOrderable(false); }}>
                    Clear the search
                  </button>
                  <button
                    type="button"
                    className={`${s.add} ${s.ghost}`}
                    onClick={() => { setQ(""); setMode("plans"); }}
                  >
                    Browse {planCount} plans
                  </button>
                </span>
              </div>
            ) : (
              <>
              <ul className={s.grid}>
                {cap(results).map((d) => (
                  <li key={d.id} className={s.card}>
                    {!images[d.slot] ? (
                      /* The reserved space a photograph drops into. Drop a file
                         into public/images/dishes/<slug> and it fills with no
                         layout change.

                         EMPTY ON PURPOSE. It used to print the course name and
                         carry the badges. The course was already printed
                         immediately below it in .dishTop, so every card said
                         "SALADS" twice; and the badges sat ON the well, which
                         is exactly where the food goes — chips over a
                         photograph is the wrong instinct, and at the mobile row
                         size this well is 104px wide and could not hold them at
                         all. Both now live in the body. */
                      <button
                        type="button"
                        className={s.shotPlaceholder}
                        style={dishField(d)}
                        onClick={() => setSheet(d)}
                        aria-label={`See ${d.name}`}
                      />
                    ) : (
                    <button
                      type="button"
                      className={s.shot}
                      onClick={() => setSheet(d)}
                      aria-label={`See ${d.name}`}
                    >
                      {/* Slot is mounted ONLY when a real photograph exists. Its
                          no-image branch draws a macro glyph, and AGENTS.md
                          forbids a diagram standing in for a dish where someone
                          is choosing what to eat — so that branch is
                          deliberately unreachable from here. */}
                      <Slot
                        images={images}
                        name={d.slot}
                        alt={d.name}
                        sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                      />
                      {d.kcal ? <span className={s.kcalTag}>{d.kcalLabel}</span> : null}
                    </button>
                    )}

                    <div className={s.cardBody}>
                      {/* The kcal figure used to sit here as well. It is now the
                          number inside the ring, which is the one place on the
                          card where it is the denominator of something rather
                          than a loose statistic. Printing it twice made the top
                          row compete with the dish name for no gain. */}
                      {/* Course and badges share one line. The badges were an
                          overlay on the image well; as text beside the course
                          they survive the mobile row layout, stop covering the
                          photograph, and read as what they are — a measurement,
                          not a sticker on the food. */}
                      <p className={s.dishTop}>
                        <span className={s.dishCourse}>{d.categoryLabel}</span>
                        {badgesFor(d).map((b) => (
                          <span key={b} className={s.tag}>{b}</span>
                        ))}
                      </p>
                      {/* Every dish now has a URL. It was reachable only as a
                          card and a modal, so it could not be linked, shared,
                          indexed or sent to a customer. The sheet stays as the
                          quick look; this is the page. */}
                      <Link href={`/menu/${d.id}`} className={s.dishName}>
                        {d.name}
                      </Link>
                      <p className={s.dishBlurb}>{d.blurb}</p>
                      {d.kcal ? (
                        <MacroSplit p={d.protein} c={d.carbs} f={d.fat} kcal={d.kcal} />
                      ) : null}
                      {/* The add-on ladder (paneer/tofu, egg, grilled chicken)
                          and any variant already live in DishSheet. The card
                          only has to say they exist, or nobody opens it. */}
                      {/* CLICKABLE. This was a <p> with cursor:auto — it
                          advertised paneer/egg/chicken and every variant and
                          then did nothing when tapped. It opens the sheet that
                          actually holds them. */}
                      {d.orderable && (d.addOns?.length || d.variantNote) ? (
                        <button type="button" className={s.addOnHint} onClick={() => setSheet(d)}>
                          {d.addOns?.length ? `+ ${d.addOns.length} add-ons` : null}
                          {d.addOns?.length && d.variantNote ? " · " : null}
                          {d.variantNote ? d.variantNote : null}
                        </button>
                      ) : null}

                      <div className={s.cardFoot}>
                        {d.orderable ? (
                          <span className={s.priceBlock}>
                            <b className={s.price}>{d.priceLabel}</b>
                            {d.kcal ? (
                              <span className={s.perProtein}>
                                {d.protein}g protein
                              </span>
                            ) : null}
                          </span>
                        ) : (
                          <span className={s.askPrice}>Price on request</span>
                        )}
                        <AddControl dish={d} />
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {showAllControl(results.length, "dishes")}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── What you actually get ────────────────────────────────────────
          Placed HERE — directly under the catalogue, ahead of the bands — on
          purpose. The owner's complaint was that the page shows food and
          nothing else, while eleven dashboard screens and 54 models sit behind
          it unmentioned. It goes above conditions and proof because "there is
          an app" has to land before "the app is good". */}
      <Platform counts={bandCounts} />

      {/* ── The bands ────────────────────────────────────────────────────
          Scale, conditions and proof. All three were built for v2 and left on
          no route; all three are the arguments that make this hard to copy.
          They sit here, BELOW the catalog, because AGENTS.md is explicit that
          nothing pushes food down the page. */}
      <HomeBands counts={bandCounts} quotes={quotes} />

      {/* ── Services ─────────────────────────────────────────────────────
          The v2 homepage argued these as scrolling sections. A webapp carries
          them as destinations — the AI coach, training, corporate, digital
          plans and the gym network were all real and none was reachable. */}
      <section className={s.services} aria-labelledby="services-h">
        <div className={s.servicesInner}>
          <h2 id="services-h" className={s.servicesH}>Everything else the kitchen runs</h2>
          <ul className={s.serviceGrid}>
            {SERVICES.map((sv) => (
              <li key={sv.href}>
                <Link href={sv.href}>
                  {/* The three that have a real photograph get it; the three
                      that do not get the same colour ground the dish wells use,
                      hashed off the route so each is its own. Both branches are
                      the same height, so the row never goes ragged. */}
                  <span
                    className={s.serviceShot}
                    style={serviceImages[sv.href] ? undefined : fieldStyle(sv.href)}
                    aria-hidden="true"
                  >
                    {serviceImages[sv.href] ? (
                      <Image
                        src={serviceImages[sv.href]!}
                        alt=""
                        fill
                        sizes="(min-width: 1024px) 240px, (min-width: 640px) 45vw, 92vw"
                        style={{ objectFit: "cover" }}
                        loading="lazy"
                      />
                    ) : null}
                  </span>
                  <span className={s.serviceStat}>{sv.stat}</span>
                  <b>{sv.label}</b>
                  <span className={s.serviceBlurb}>{sv.blurb}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className={s.footer}>
        <div className={s.footerGrid}>
          {FOOTER.map((col) => (
            <div key={col.title}>
              <h2 className={s.footerTitle}>{col.title}</h2>
              <ul className={s.footerList}>
                {col.links.map((l) => (
                  <li key={l.href}>
                    <Link href={l.href}>{l.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <p className={s.footerBase}>
          <span>© {new Date().getFullYear()} FitFuel, Pune</span>
          <span>
            FSSAI <span className="fk-num">{licence}</span>
          </span>
        </p>
      </footer>

      {/* ── Bottom tabs ─────────────────────────────────────────────────── */}
      <nav className={s.tabs} aria-label="Sections">
        {NAV.map((n) =>
          n.kind === "mode" ? (
            <button
              key={n.label}
              type="button"
              className={`${s.tab} ${mode === n.mode ? s.tabOn : ""}`}
              onClick={() => setMode(n.mode)}
              aria-current={mode === n.mode ? "page" : undefined}
            >
              <Icon d={n.icon} size={22} />
              {n.label}
            </button>
          ) : (
            <Link key={n.label} href={n.href} className={s.tab}>
              <Icon d={n.icon} size={22} />
              {n.label}
            </Link>
          ),
        )}
      </nav>

      {/* ── Order bar ───────────────────────────────────────────────────── */}
      {/* Hidden while the basket drawer is open. The bar is z-index 101 and the
          drawer is 81, so it rendered straight over the Pay button — the one
          control that takes money, covered by a bar advertising the same
          basket you already have open. */}
      {basketCount > 0 && !barHidden && !cart.open ? (
        <div className={s.orderBar}>
          <div className={s.orderInner}>
            <span className={s.orderMeta}>
              <b>
                {basketCount} item{basketCount === 1 ? "" : "s"} in your order
              </b>
              <span>{rs(basketTotal)} including delivery, packaging and GST</span>
            </span>
            <button type="button" className={s.orderCta} onClick={() => cart.setOpen(true)}>
              View order
            </button>
            <button
              type="button"
              className={s.orderHide}
              onClick={() => setBarHidden(true)}
              aria-label="Hide the order bar. Your order is kept and is still in the basket."
            >
              <Icon d={I.x} size={18} />
            </button>
          </div>
        </div>
      ) : null}

      {sheet ? <DishSheet dish={sheet} images={images} onClose={() => setSheet(null)} /> : null}
      {planSheet ? <PlanSheet plan={planSheet} onClose={() => setPlanSheet(null)} /> : null}

      {/* areaPanel is a server component handed down as a node. Sheet already
          traps and restores focus and closes on Escape, so the map inherits all
          of that without knowing anything about it. */}
      {areaOpen && areaPanel ? (
        <Sheet onClose={() => setAreaOpen(false)} labelledBy="area-sheet-title">
          {/* SheetClose is not optional furniture. Escape and the backdrop both
              close this, but neither is visible, and a full-screen overlay whose
              only exits are invisible is the same trap as the order bar that
              could not be dismissed. */}
          <div className={s.areaSheetTop}>
            <h2 id="area-sheet-title" className={s.areaSheetH}>
              Where we deliver
            </h2>
            <SheetClose onClose={() => setAreaOpen(false)} />
          </div>
          <div className={s.areaSheet}>{areaPanel}</div>
        </Sheet>
      ) : null}
    </div>
  );
}
