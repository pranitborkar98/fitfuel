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
// So the primary gesture here is browse-and-add, not scroll-and-read:
//
//   - The shell is persistent. The target, location and basket never scroll
//     away. Sidebar >=1024px, bottom tab bar below, exactly one visible.
//   - The catalog is filterable in the client, instantly, over all 48 dishes.
//     No round trip, no skeleton, no "loading dishes…".
//   - Adding is one tap and the control morphs into a stepper in place.
//
// THE SEARCH FIELD WAS REMOVED on 2026-08-19. It was the widest element of a
// phone header on a page whose measured problem was that the header took 40%
// of the screen; the course chips filter exactly and carry live counts, and
// /menu keeps a full searchable list. See the note where it used to sit.
//   - The basket surfaces itself as a bar the moment it has something in it.
//
// The long-form argument (moats, the rotation, the coach, the day timeline)
// is NOT deleted — it moves to routes that already exist and are linked from
// the rail. A customer choosing lunch should not have to scroll past a pitch
// deck; someone who wants the pitch can still reach it.

import Image from "next/image";
import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { useEffect, useMemo, useRef, useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import { receipt } from "@/lib/menu-cart";
import { PLAN_CATS, type ShopDish, type ShopPlan } from "@/app/_shop/catalog";
import type { PriceRow } from "@/lib/plan-tier-pricing";
import type { Dish } from "@/app/_hp/menu-types";
import DishSheet from "@/app/_shop/DishSheet";
import PlanSheet from "@/app/_shop/PlanSheet";
import Sheet, { SheetClose } from "@/app/_shop/Sheet";
import Slot, { type SlotMap } from "@/app/_shop/Slot";
import type { BandCounts, Quote } from "./HomeBands";
import HomeSections from "./HomeSections";
import { GOALS } from "./home-data";
import YourNumbers, { targetFor, useNumbers } from "./YourNumbers";
import { MacroSplit, dishField } from "./DishVisuals";
import s from "./app.module.css";
import r from "./refresh.module.css";


/* ── Icons ─────────────────────────────────────────────────────────────────
   Inline, 1.6 stroke, one family. SVG rather than an icon package so the
   shell has no runtime dependency and no version surprise, and never emoji. */
const I = {
  x: "M18 6 6 18M6 6l12 12",
  bag: "M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4H6ZM3 6h18M16 10a4 4 0 0 1-8 0",
  pin: "M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0ZM12 12a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z",
  bowl: "M3 11h18a9 9 0 0 1-18 0ZM7 11a5 5 0 0 1 10 0M12 3v3",
  layers: "m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5",
  spark: "M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18",
  book: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z",
  user: "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z",
  search: "m21 21-4.35-4.35M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z",
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
    { href: "/", label: "Full menu" },
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

export type Course = { key: string; label: string; n: number; note: string };

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
  /** The delivery-area map, rendered on the server and handed down as a node so
   *  the location chip can open it without this file importing a server
   *  component. */
  areaPanel?: React.ReactNode;
  /** Counts for the bands below the catalog. They come from the database in
   *  page.tsx so a figure here cannot disagree with the catalogue it
   *  describes. */
  bandCounts: BandCounts;
  /** Distinct subCategory values across the plans — goals and conditions. */
  goalCount: number;
  /** The seeded PlanPrice matrix, for the plan builder band. */
  prices: PriceRow[];
  /** The trial day itemised by lib/pricing-decomposition, for the receipt. */
  trial: { rows: { k: string; v: string }[]; total: string };
  /** Suburbs in app/_hp/areas-data.ts, kitchen included. */
  areaCount: number;
  /** Which catalogue to open on, from `?mode=` — the rail on every dish page
   *  and on /menu links here with it. Defaults to dishes. */
  initialMode: "dishes" | "plans" | "supps";
  /** Featured Testimonial rows. app/page.tsx has queried these all along; the
   *  imported redesign had no band to render them in, so for four days they
   *  were fetched and dropped. The proof band takes them now. */
  quotes: Quote[];
  /** Seven days of the one plan with a seeded schedule, for the rotation band.
   *  Empty when the query fails, and the band then renders nothing. */
  week: Dish[];
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
  areaPanel,
  bandCounts,
  goalCount,
  prices,
  trial,
  areaCount,
  initialMode,
  quotes,
  week,
}: AppProps) {
  const cart = useCart();
  const [query, setQuery] = useState("");
  const [course, setCourse] = useState("all");
  const [onlyOrderable, setOnlyOrderable] = useState(false);
  const [sheet, setSheet] = useState<ShopDish | null>(null);
  /* Two catalogs, one shell. Dishes are a single meal tonight; plans are a
     subscription configured by duration x diet x meals x tier. Both are the
     product, and the old page made you scroll past one to reach the other. */
  const [mode, setMode] = useState<"dishes" | "plans" | "supps">(initialMode);
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
  /* ── THE DAY TARGET ───────────────────────────────────────────────────────
     The one thing a food app can do that a menu cannot: say what a dish does to
     the day you are trying to have. The goal picker sets a kcal and a protein
     target, the basket fills two bars against it, and every card prints its own
     share of both. The numbers are the dish's own macros against the target the
     visitor picked — nothing per-dish is invented. */
  const [goal, setGoal] = useState("maintain");
  /* ── THE TARGET IS THE READER'S, IF THEY WANT IT TO BE ────────────────────
     Read from localStorage after mount by useNumbers. Null until then and null
     for anyone who has not set them, in which case the three goals fall back to
     their round figures. Nothing on the page is gated behind having a profile.

     This is app/_hp/Finder.tsx's calculator, which has sat on no route since
     the v2 homepage was built. What makes it worth importing is not the form —
     it is that every "% of your protein" on every card below stops being a
     percentage of an average person's day. */
  const [numbers, setNumbers] = useNumbers();
  const [numbersOpen, setNumbersOpen] = useState(false);
  /* Which course headers have been opened past their first two. Per course, so
     opening Salads does not dump all 48 dishes on the page. */
  const [openCourse, setOpenCourse] = useState<Record<string, boolean>>({});
  /* openVariants / openMenu are gone with the two disclosure buttons on the
     plan card. Both contents live in the Configure sheet now — see the comment
     on the plan card foot for why an inline panel was the wrong container. */
  const catalogRef = useRef<HTMLDivElement>(null);
  const [areaOpen, setAreaOpen] = useState(false);

  const normalizedQuery = query.trim().toLowerCase();

  const results = useMemo(
    () =>
      dishes.filter((d) => {
        if (course !== "all" && d.category !== course) return false;
        if (onlyOrderable && !d.orderable) return false;
        if (
          normalizedQuery &&
          !`${d.name} ${d.blurb} ${d.categoryLabel}`.toLowerCase().includes(normalizedQuery)
        ) return false;
        return true;
      }),
    [dishes, course, onlyOrderable, normalizedQuery],
  );

  /* ── THE DAY SO FAR, FROM THE BASKET ──────────────────────────────────────
     Counted over the dish catalogue rather than over cart lines because a line
     carries an add-on and a quantity but not the macros. Enquiry rows have no
     price and no quantity, so they contribute nothing here — which is correct:
     you have not decided to eat them. */
  const goalSpec = GOALS.find((g) => g.key === goal) ?? GOALS[1];
  const target = targetFor(numbers, goalSpec.goal, goalSpec);
  const day = useMemo(() => {
    let kcal = 0;
    let protein = 0;
    let count = 0;
    for (const d of dishes) {
      const n = cart.qtyOf(d.id);
      if (!n) continue;
      count += n;
      kcal += n * d.kcal;
      protein += n * d.protein;
    }
    return {
      kcal,
      protein,
      count,
      gapKcal: Math.max(0, target.kcal - kcal),
      gapProtein: Math.max(0, target.protein - protein),
    };
  }, [dishes, cart, target]);

  const planResults = useMemo(
    () =>
      plans.filter((p) => {
        if (planCat !== "all" && p.cat !== planCat) return false;
        if (planDiet !== "all" && !p.variants.some((v) => v.diet === planDiet)) return false;
        if (
          normalizedQuery &&
          !`${p.label} ${p.note} ${p.sub} ${p.variants.map((v) => v.label).join(" ")}`
            .toLowerCase()
            .includes(normalizedQuery)
        ) return false;
        return true;
      }),
    [plans, planCat, planDiet, normalizedQuery],
  );

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

  const suppResults = useMemo(
    () => supplements.filter((x) => {
      if (suppCat !== "all" && x.category !== suppCat) return false;
      if (
        normalizedQuery &&
        !`${x.name} ${x.tagline} ${x.category} ${x.benefits.join(" ")}`
          .toLowerCase()
          .includes(normalizedQuery)
      ) return false;
      return true;
    }),
    [supplements, suppCat, normalizedQuery],
  );

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
  const filterKey = `${mode}|${course}|${planCat}|${planDiet}|${suppCat}|${onlyOrderable}|${normalizedQuery}`;
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

  /* ── THE MENU IS ALWAYS IN COURSES ────────────────────────────────────────
     The sort row is gone (owner's call, 2026-08-19): four chips and a label
     cost 44px directly above the first card on every screen, and the ranking
     they offered is a question a browsing customer does not open a menu to
     ask. "Best protein per calorie" is still answerable — every card prints
     its own ₹-per-gram and its share of the day.

     What is left is the kitchen's own grouping: six courses, a heading and a
     note apiece, first two of each. It holds while nothing is filtered — a
     course chip is already a narrowing, and narrowing twice reads as a bug, so
     a filtered view falls back to one flat capped list. */
  const grouped = mode === "dishes" && course === "all" && !onlyOrderable;

  /** Dishes shown per course before its own "Show all" is offered. */
  const PER_COURSE = 2;

  /**
   * ONE DISH CARD.
   *
   * A render HELPER, not a component, for the reason showAllControl gives
   * above: a component declared inside render gets a new identity on every
   * pass, so React unmounts and remounts all 48 of these on each keystroke.
   *
   * It exists because the grid now has two shapes. In menu order the cards sit
   * inside six course groups; under any other sort they are one flat ranked
   * list. Both render the identical card, and writing it twice is how the two
   * drift apart.
   */
  function dishCard(d: ShopDish) {
    /* "Fits your day" is the only badge on this page that is not a property of
       the dish — it is a property of the dish AGAINST the target the visitor
       picked, and it disappears the moment the day is full. The protein floor
       is a quarter of what is left, capped at 20g, so it marks dishes that make
       a real dent rather than every 8g juice that happens to fit. */
    const fits =
      day.gapProtein > 0 &&
      d.protein >= Math.min(20, day.gapProtein * 0.25) &&
      d.kcal > 0 &&
      d.kcal <= day.gapKcal;

    return (
      <li key={d.id} className={`${s.card} ${r.productCard}`} data-card="">
        {!images[d.slot] ? (
          /* The reserved space a photograph drops into. Drop a file into
             public/images/dishes/<slug> and it fills with no layout change.

             NO MONOGRAM. The imported design set the dish's initial in a ring
             here; AGENTS.md bans "a macro ring, a glyph or a typographic
             stand-in" on a surface where someone is choosing what to eat, and
             the owner ruled for AGENTS.md on 2026-08-19. What is left is a
             course-hued ground with a dot texture and a gloss — a SURFACE,
             which the same paragraph explicitly allows, and which nothing
             invites the reader to decode. */
          <button
            type="button"
            className={`${s.shotPlaceholder} ${r.productMedia}`}
            style={dishField(d)}
            onClick={() => setSheet(d)}
            aria-label={`See ${d.name}`}
          >
            <span className={s.wellGrain} aria-hidden="true" />
            <span className={s.wellGloss} aria-hidden="true" />
            <span className={s.wellFoot} aria-hidden="true" />
            {fits ? <span className={s.fits}>Fits your day</span> : null}
            {d.kcal ? <span className={s.kcalTag}>{d.kcalLabel}</span> : null}
          </button>
        ) : (
          <button
            type="button"
            className={`${s.shot} ${r.productMedia}`}
            onClick={() => setSheet(d)}
            aria-label={`See ${d.name}`}
          >
            {/* Slot is mounted ONLY when a real photograph exists. Its no-image
                branch draws a macro glyph, and a diagram standing in for a dish
                is exactly what the well above is arguing about — so that branch
                is deliberately unreachable from here. */}
            <Slot
              images={images}
              name={d.slot}
              alt={d.name}
              sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
            />
            {fits ? <span className={s.fits}>Fits your day</span> : null}
            {d.kcal ? <span className={s.kcalTag}>{d.kcalLabel}</span> : null}
          </button>
        )}

        <div className={`${s.cardBody} ${r.productBody}`}>
          {/* Course and badges share one line. The badges were an overlay on
              the image well; as text beside the course they survive the mobile
              row layout, stop covering the photograph, and read as what they
              are — a measurement, not a sticker on the food. */}
          <p className={s.dishTop}>
            <span className={s.dishCourse}>{d.categoryLabel}</span>
            {badgesFor(d).map((b) => (
              <span key={b} className={s.tag}>{b}</span>
            ))}
          </p>
          <Link href={`/menu/${d.id}`} className={`${s.dishName} ${r.productTitle}`}>
            {d.name}
          </Link>
          <p className={`${s.dishBlurb} ${r.productDescription}`}>{d.blurb}</p>
          {d.kcal ? (
            <MacroSplit
              p={d.protein}
              c={d.carbs}
              f={d.fat}
              kcal={d.kcal}
              /* THE LINE THE WHOLE DAY BAR EXISTS FOR. Grams are a fact about
                 the dish; this is what the dish does to the day the visitor
                 said they wanted, and it moves when they change the target. */
              contrib={
                `${Math.round((d.protein / target.protein) * 100)}% of your protein · ` +
                `${Math.round((d.kcal / target.kcal) * 100)}% of your calories`
              }
            />
          ) : null}
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
                {d.protein > 0 && d.price ? (
                  /* The unit that matters to the person this catalogue is for,
                     and the one no competitor prints. It is division the reader
                     would otherwise do in their head across 48 cards. */
                  <span className={s.perProtein}>
                    ₹{Math.round(d.price / d.protein)} per gram of protein
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
    );
  }
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

  const switchMode = (next: "dishes" | "plans" | "supps", moveToCatalog = false) => {
    setMode(next);
    setQuery("");
    setExpandedFor(null);
    if (moveToCatalog) {
      requestAnimationFrame(() => catalogRef.current?.scrollIntoView({ block: "start" }));
    }
  };

  const searchPlaceholder =
    mode === "plans"
      ? "Search goals, conditions or diets"
      : mode === "supps"
        ? "Search supplements or benefits"
        : "Search dishes or ingredients";

  const noResults =
    mode === "plans"
      ? planResults.length === 0
      : mode === "supps"
        ? suppResults.length === 0
        : results.length === 0;

  const clearCurrentView = () => {
    setQuery("");
    if (mode === "plans") {
      setPlanCat("all");
      setPlanDiet("all");
    } else if (mode === "supps") {
      setSuppCat("all");
    } else {
      setCourse("all");
      setOnlyOrderable(false);
    }
  };

  return (
    <div className={`fk ${s.app}`}>
      {/* ── Top bar ─────────────────────────────────────────────────────── */}
      <header className={`${s.top} ${r.header}`}>
        <div className={`${s.topRow} ${r.topRow}`}>
          <span className={s.brandWrap}>
            <Wordmark className={s.brand} />
            {/* THE CUTOFF STRIP, AS A CHIP. It was a full-width band under the
                header saying the same sentence in 14px across 1440px. The
                promise is worth two seconds of a customer's attention, not a
                whole row of the fold — and it stays mode-aware, because a
                single salad tonight and a plan starting tomorrow are different
                promises and printing the plan one over a 48-dish menu tells a
                customer buying a salad it arrives in the morning. */}
            <span className={s.live}>
              <i aria-hidden="true" />
              {mode === "plans"
                ? `Order by ${cutoffLabel} · at your door by 8am`
                : mode === "supps"
                  ? "Researched, not stocked"
                  : `Cooking today · ${area}`}
            </span>
          </span>

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
              /* The label is explicit because the visible word is dropped below
                 640px — the pin alone is the control there, and the button must
                 still announce which area it opens. */
              aria-label={`Delivering to ${area}. See where we deliver`}
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

        <section className={r.hero} aria-labelledby="home-title">
          <div className={r.heroCopy}>
            <p className={r.heroKicker}>
              <span aria-hidden="true" /> Healthy food, built around you
            </p>
            <h1 id="home-title" className={r.heroTitle}>
              Your goal shouldn&apos;t end where dinner begins.
            </h1>
            <p className={r.heroDeck}>
              Pick one chef-cooked meal or run a complete plan. We weigh every
              portion in Kharadi, connect it to your daily target, and keep the
              diary, training and coach in the same app.
            </p>
            <div className={r.heroActions}>
              <button type="button" className={r.heroPrimary} onClick={() => switchMode("dishes", true)}>
                Order a meal
              </button>
              <button type="button" className={r.heroSecondary} onClick={() => switchMode("plans", true)}>
                Find my plan
              </button>
            </div>
            <Link href="/plans?trial=true" className={r.trialLink}>
              Prefer to test it first? Breakfast + lunch for {trialTotal}, once.
            </Link>
            <ul className={r.heroStats} aria-label="FitFuel at a glance">
              <li><b className="fk-num">{dishes.length}</b><span>real dishes</span></li>
              <li><b className="fk-num">{goalCount}</b><span>goals and conditions</span></li>
              <li><b className="fk-num">{bandCounts.exercises.toLocaleString("en-IN")}</b><span>training movements</span></li>
            </ul>
          </div>

          <div className={r.heroVisual}>
            <Image
              src="/images/hero-bowl-v2.png"
              alt="A FitFuel bowl with grilled paneer, brown rice, spinach, chickpeas, pickled onion and cucumber yoghurt"
              fill
              priority
              sizes="(min-width: 1024px) 52vw, 100vw"
              className={r.heroImage}
            />
            <div className={r.heroPlateNote}>
              <span>One connected day</span>
              <b>Cooked → delivered → logged</b>
            </div>
            <div className={r.heroTrust}>
              <span><i aria-hidden="true" /> Own Kharadi kitchen</span>
              <span>FSSAI <b className="fk-num">{licence}</b></span>
            </div>
          </div>
        </section>

        {/* ── Rail + content ──────────────────────────────────────────────── */}
        <div className={`${s.filters} ${r.filters}`} ref={catalogRef} id="catalog">
          {/* Catalog switch. A subscription and a single meal are different
              purchases, so they get different chip sets rather than one mixed
              grid where a Rs 230 salad sits beside a Rs 17,849 month. */}
          <div className={r.catalogControls}>
            <div className={`${s.modeRow} ${r.modeRow}`} role="group" aria-label="What are you ordering">
              <button
                type="button"
                className={`${s.mode} ${mode === "dishes" ? s.modeOn : ""}`}
                onClick={() => switchMode("dishes")}
                aria-pressed={mode === "dishes"}
              >
                Single meals <span className={s.fcount}>{dishes.length}</span>
              </button>
              <button
                type="button"
                className={`${s.mode} ${mode === "plans" ? s.modeOn : ""}`}
                onClick={() => switchMode("plans")}
                aria-pressed={mode === "plans"}
              >
                Meal plans <span className={s.fcount}>{planCount}</span>
              </button>
              <button
                type="button"
                className={`${s.mode} ${mode === "supps" ? s.modeOn : ""}`}
                onClick={() => switchMode("supps")}
                aria-pressed={mode === "supps"}
              >
                Supplements <span className={s.fcount}>{supplements.length}</span>
              </button>
            </div>

            <label className={r.search}>
              <span className="fk-sr-only">{searchPlaceholder}</span>
              <Icon d={I.search} size={18} />
              <input
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                autoComplete="off"
              />
              {query ? (
                <button type="button" onClick={() => setQuery("")} aria-label="Clear search">
                  <Icon d={I.x} size={16} />
                </button>
              ) : null}
            </label>
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

        {/* ── THE DAY BAR ──────────────────────────────────────────────────
            A menu tells you what a dish is. This tells you what it does to the
            day you are trying to have, which is the only thing a nutrition
            company can offer that a delivery app cannot.

            Everything in it is arithmetic on figures already on the page: the
            target is one of three the TDEE calculator hands out, and the fill
            is the basket's own macros against it. It is NOT a diagram standing
            in for food — it sits above the catalogue in the shell, and every
            card below still leads with the dish.

            It sits directly above the catalogue, where it can guide an order
            without occupying the viewport after the customer scrolls on. */}
        <div className={`${s.dayBar} ${r.dayBar}`}>
          <div className={s.dayBarInner}>
            <div className={s.goalPick}>
              <div className={s.goalSeg} role="group" aria-label="Your daily target">
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className={`${s.goalBtn} ${goal === g.key ? s.goalOn : ""}`}
                    onClick={() => setGoal(g.key)}
                    aria-pressed={goal === g.key}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              {/* "Your day" was a label on a control that already says what it
                  is. The room goes to the thing that changes the answer. */}
              <button
                type="button"
                className={`${s.numbersBtn} ${target.personal ? s.numbersBtnOn : ""}`}
                onClick={() => setNumbersOpen(true)}
                aria-haspopup="dialog"
                aria-expanded={numbersOpen}
              >
                {target.personal
                  ? `${numbers!.weightKg}kg · ${numbers!.age}`
                  : "Set your numbers"}
              </button>
            </div>

            {/* The live region is the METER BLOCK, not the sentence under it.
                Below 640px that sentence is dropped for room and the figures
                stay — announcing the change has to survive both layouts, and a
                region that exists on one breakpoint and not the other is a
                screen-reader bug nobody sees. */}
            <div className={s.dayMeters} aria-live="polite">
              <p className={s.dayFigs}>
                <span className="fk-num">
                  {day.kcal.toLocaleString("en-IN")} / {target.kcal.toLocaleString("en-IN")} kcal
                </span>
                <span className={`${s.dayProteinFig} fk-num`}>
                  {day.protein} / {target.protein}g protein
                </span>
              </p>
              <p className={s.dayTracks}>
                <span className={s.dayTrack}>
                  <span
                    className={s.dayFillK}
                    style={{ width: `${Math.min(100, Math.round((day.kcal / target.kcal) * 100))}%` }}
                  />
                </span>
                <span className={s.dayTrack}>
                  <span
                    className={s.dayFillP}
                    style={{
                      width: `${Math.min(100, Math.round((day.protein / target.protein) * 100))}%`,
                    }}
                  />
                </span>
              </p>
              <p className={s.dayNote}>
                {day.count === 0
                  ? target.personal
                    ? "Your target, from your own numbers. Add dishes and the bars fill."
                    : "Pick a target, then add dishes — the bars fill as you go."
                  : day.gapProtein > 0
                    ? `${day.gapProtein}g protein and ${day.gapKcal.toLocaleString("en-IN")} kcal left in the day.`
                    : `Protein target met. ${day.gapKcal.toLocaleString("en-IN")} kcal still spare.`}
              </p>
            </div>

            <div className={s.dayBasket}>
              <span className={s.dayBasketFig}>
                <b className="fk-num">{rs(basketTotal)}</b>
                <span>
                  {basketCount
                    ? `${basketCount} item${basketCount === 1 ? "" : "s"} · incl. GST`
                    : "delivery from ₹49"}
                </span>
              </span>
              {basketCount > 0 ? (
                <button type="button" className={s.dayView} onClick={() => cart.setOpen(true)}>
                  View order
                </button>
              ) : (
                <span className={s.dayEmpty}>Basket empty</span>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className={s.body}>
        <nav className={`${s.rail} ${r.sideRail}`} aria-label="Sections">
          <ul className={s.railList}>
            {NAV.map((n) => (
              <li key={n.label}>
                {n.kind === "mode" ? (
                  <button
                    type="button"
                    className={`${s.railLink} ${mode === n.mode ? s.railOn : ""}`}
                    onClick={() => switchMode(n.mode)}
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

          {/* ── THE OFFER, MOVED OFF THE FOLD AND INTO THE RAIL ────────────
              It was a row above the first dish card. The rail is where a
              persistent shell keeps the thing that is always on offer — it is
              in view for the whole session instead of scrolling away after two
              swipes, and the fold gets the food back.

              THE ROW BELOW 1024px IS NOT REDUNDANT. The rail does not exist on
              a phone, so the same offer stays inline there; CSS shows exactly
              one of the two. Dropping the row and keeping only this card would
              have deleted the trial from every phone. */}
          <div className={s.railOffer}>
            <span className={s.railOfferShot}>
              <Image
                src="/images/hero-bowl.jpg"
                alt=""
                fill
                sizes="220px"
                style={{ objectFit: "cover" }}
              />
            </span>
            <div className={s.railOfferBody}>
              <p className={s.railOfferKicker}>First day</p>
              <p className={s.railOfferPrice}>Two meals, {trialTotal}</p>
              <p className={s.railOfferNote}>
                Breakfast and lunch weighed to your macros. Nothing to cancel.
              </p>
              <Link href="/plans?trial=true" className={s.railOfferCta}>
                Start the trial
              </Link>
            </div>
          </div>

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
        <div className={s.main}>
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
            {/* ── THE LEDE ────────────────────────────────────────
                Two lines of type. The "KHARADI, PUNE" eyebrow and the six
                figures beside it are BOTH GONE on the owner's call
                (2026-08-19), and both were already said elsewhere: the area is
                the chip beside the wordmark and the location button, and all
                six figures are the platform band's own four plus the dish and
                plan counts printed on the result line under this. Nothing here
                was load-bearing; it was the fold repeating itself. */}
            <div className={`${s.resultBar} ${r.resultBar}`}>
              <h2>
                {mode === "supps"
                  ? suppCat === "all"
                    ? "Supplements"
                    : suppCat
                  : mode === "plans"
                    ? PLAN_CATS.find((c) => c.key === planCat)?.label
                    : course === "all"
                      ? "Tonight’s menu, by course"
                      : courses.find((c) => c.key === course)?.label}
              </h2>
              <p>
                {mode === "supps"
                  ? `${suppResults.length} of ${supplements.length} · researched, not stocked`
                  : mode === "plans"
                  ? `${planResults.length} of ${planCount} plans · ${goalCount} goals and conditions`
                  : `${results.length} dish${results.length === 1 ? "" : "es"}` +
                    (orderableCount !== results.length
                      ? ` · ${orderableCount} priced tonight, from ${menuFrom}`
                      : ` · from ${menuFrom}`)}
              </p>
            </div>

            {mode !== "dishes" ? (
              <div className={r.modeFeature}>
                <div className={r.modeFeatureImage}>
                  <Image
                    src={mode === "plans" ? "/images/hero-bowl-v2.png" : "/images/supplements.jpg"}
                    alt={
                      mode === "plans"
                        ? "A balanced FitFuel meal with paneer, rice, greens, chickpeas and raita"
                        : "A person preparing a measured supplement serving"
                    }
                    fill
                    sizes="(min-width: 1024px) 38vw, 100vw"
                    className={r.cardImage}
                  />
                </div>
                <div className={r.modeFeatureCopy}>
                  <span>{mode === "plans" ? "Complete nutrition" : "Evidence before products"}</span>
                  <h3>
                    {mode === "plans"
                      ? "A menu, a target and a feedback loop—not a PDF you forget."
                      : "Understand the evidence, dosage and timing before you buy anywhere."}
                  </h3>
                  <p>
                    {mode === "plans"
                      ? "Choose your goal, diet and meal schedule. Your diary arrives pre-filled, your training counts, and the coach proposes changes only when the trend supports them."
                      : "FitFuel does not stock supplements. The catalogue compares mechanisms, benefits, warnings, timing and study depth without turning the recommendation into a sales pitch."}
                  </p>
                </div>
              </div>
            ) : null}

            {noResults ? (
              <div className={s.empty}>
                <h3>Nothing matches that.</h3>
                <p>
                  {mode === "plans" ? (
                    <>There are {planCount} plans across goals, sports and {goalCount} conditions. </>
                  ) : mode === "supps" ? (
                    <>There are {supplements.length} researched supplements across {suppCats.length} categories. </>
                  ) : (
                    <>We cook {dishes.length} dishes across {courses.length} courses. </>
                  )}
                  Clear the search or try a different filter.
                </p>
                <span className={s.emptyActions}>
                  <button type="button" className={s.add} onClick={clearCurrentView}>
                    Show everything here
                  </button>
                  <button
                    type="button"
                    className={[s.add, s.ghost].join(" ")}
                    onClick={() => switchMode(mode === "dishes" ? "plans" : "dishes")}
                  >
                    {mode === "dishes" ? (
                      <>Browse {planCount} plans</>
                    ) : (
                      <>Browse {dishes.length} meals</>
                    )}
                  </button>
                </span>
              </div>
            ) : mode === "supps" ? (
              <>
              <ul className={`${s.grid} ${r.productGrid}`}>
                {cap(suppResults).map((x) => (
                  <li key={x.slug} className={`${s.card} ${r.productCard} ${r.textCard}`} data-card="">
                    <div className={`${s.cardBody} ${r.productBody}`}>
                      <p className={s.dishTop}>
                        <span className={s.dishCourse}>{x.category}</span>
                        {x.evidence ? <span className="fk-num">{x.evidence.replace(/_/g, " ")}</span> : null}
                      </p>
                      <Link href={`/supplements#${x.slug}`} className={`${s.dishName} ${r.productTitle}`}>{x.name}</Link>
                      {x.tagline ? <p className={`${s.dishBlurb} ${r.productDescription}`}>{x.tagline}</p> : null}
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
              <ul className={`${s.grid} ${r.productGrid}`}>
                {cap(planResults).map((p) => (
                  <li key={p.slug} className={`${s.card} ${r.productCard} ${r.textCard}`} data-card="">
                    <div className={`${s.cardBody} ${r.productBody}`}>
                      <p className={s.planCat}>
                        {p.variants.length} diet{p.variants.length === 1 ? "" : "s"} · 4 meals a day
                      </p>
                      {/* THE PRODUCT PAGE. app/plans/[slug] is an 80KB page with
                          the full 30-day schedule, live PlanPrice rows and
                          Product/Offer schema — it has existed all along and
                          the app never linked to it. The card title is the way
                          in; the buttons below stay for quick answers. */}
                      <Link href={`/plans/${p.slug}`} className={`${s.dishName} ${r.productTitle}`}>
                        {p.label}
                      </Link>
                      <p className={`${s.dishBlurb} ${r.productDescription}`}>{p.note}</p>
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
            ) : grouped ? (
              /* ── THE MENU, IN COURSES ──────────────────────────────────────
                 Six headings with a note apiece and the first two dishes of
                 each, rather than 48 identical cards in one undifferentiated
                 wall. The note is the kitchen's own — COURSES carries it — and
                 it is the sentence that tells someone why a course exists
                 before they scan the price of a single dish in it.

                 Each course opens on its own. Opening Salads must not dump the
                 other five on the page. */
              <ul className={`${s.grid} ${r.productGrid}`}>
                {courses.map((c) => {
                  const list = results.filter((d) => d.category === c.key);
                  if (!list.length) return null;
                  const open = !!openCourse[c.key];
                  const shown = open ? list : list.slice(0, PER_COURSE);
                  const cover = list.find((d) => images[d.slot]);
                  return (
                    <li key={c.key} className={s.courseSpan}>
                      <ul className={s.courseGroup}>
                        <li className={`${s.courseHead} ${r.courseHead}`}>
                          {cover ? (
                            <button
                              type="button"
                              className={r.courseCover}
                              onClick={() => setSheet(cover)}
                              aria-label={`See ${cover.name}`}
                            >
                              <Slot
                                images={images}
                                name={cover.slot}
                                alt=""
                                sizes="96px"
                              />
                            </button>
                          ) : null}
                          <span className={r.courseCopy}>
                            <span className={s.courseTitle}>
                              <b>{c.label}</b>
                              <span className="fk-num">{list.length} dishes</span>
                            </span>
                            <span className={s.courseNote}>{c.note}</span>
                          </span>
                          {!open && list.length > PER_COURSE ? (
                            <button
                              type="button"
                              className={s.courseMore}
                              onClick={() =>
                                setOpenCourse((o) => ({ ...o, [c.key]: true }))
                              }
                            >
                              Show all {list.length}
                            </button>
                          ) : null}
                        </li>
                        {shown.map((d) => dishCard(d))}
                      </ul>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <>
              <ul className={`${s.grid} ${r.productGrid}`}>{cap(results).map((d) => dishCard(d))}</ul>
              {showAllControl(results.length, "dishes")}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── EVERYTHING BELOW THE FOOD ──────────────────────────────────
          Eight bands, in app/_web/HomeSections.tsx: the day from 04:00 to your
          door, the platform behind the menu, the seven services, the plan
          builder with its arithmetic in the open, the conditions, the coach and
          the trial receipt, the drop times and the questions, then the close.

          They sit HERE, below the catalogue, because AGENTS.md is explicit that
          nothing pushes food down the page. Each is a section someone scrolls
          TO, not one they scroll PAST. */}
      <HomeSections
        counts={bandCounts}
        goalCount={goalCount}
        prices={prices}
        trial={trial}
        areaCount={areaCount}
        cutoffLabel={cutoffLabel}
        quotes={quotes}
        week={week}
      />

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
              onClick={() => switchMode(n.mode)}
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

      {numbersOpen ? (
        <YourNumbers
          goal={goalSpec.goal}
          goalLabel={goalSpec.label}
          initial={numbers}
          onSave={setNumbers}
          onClose={() => setNumbersOpen(false)}
        />
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
