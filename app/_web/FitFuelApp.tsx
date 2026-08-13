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

import Link from "next/link";
import { useDeferredValue, useEffect, useMemo, useRef, useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import { receipt } from "@/lib/menu-cart";
import { PLAN_CATS, type ShopDish, type ShopPlan } from "@/app/_shop/catalog";
import DishSheet from "@/app/_shop/DishSheet";
import PlanSheet from "@/app/_shop/PlanSheet";
import Slot, { type SlotMap } from "@/app/_shop/Slot";
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
const SERVICES: { href: string; label: string; blurb: string; stat: string }[] = [
  { href: "/dashboard/coach", label: "The AI coach", stat: "Recalibrates weekly",
    blurb: "Four weigh-ins that disagree with your goal move your target, with the arithmetic shown." },
  { href: "/dashboard/exercises", label: "Training", stat: "952 exercises",
    blurb: "Sets, reps and rest programmed into your week, burn fed back into today's net." },
  { href: "/corporate", label: "For offices", stat: "From ₹110 a meal",
    blurb: "One hot lunch a day at the desk, personalised by goal and diet, trays labelled per person." },
  { href: "/plans/digital", label: "Digital plans", stat: "₹299 / ₹699",
    blurb: "The 30-day recipe book, macros and grocery list, without the delivery." },
  { href: "/partners", label: "Gyms & trainers", stat: "Partner network",
    blurb: "Your gym or trainer puts your plan on your account and gets paid for it." },
  { href: "/why", label: "Why FitFuel", stat: "The whole argument",
    blurb: "The plan finder, the receipt builder and what happens between 4am and your door." },
];

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

const DIET_LABEL: Record<string, string> = {
  VEG: "Vegetarian", EGG: "Eggetarian", NON_VEG: "Non-veg", JAIN: "Jain", VEGAN: "Vegan",
};

const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast", LUNCH: "Lunch", SNACK: "Snack", DINNER: "Dinner",
};

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
};

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

/**
 * MACRO SPLIT — the share of a dish's calories from protein, carbs and fat.
 *
 * "14P · 32C · 14F" is a readout: it makes the reader do arithmetic to answer
 * the only question anyone asks of it — is this a protein dish or a carb dish.
 * A proportional bar answers that at a glance and keeps the grams for anyone
 * who wants them.
 *
 * 4 kcal/g for protein and carbs, 9 for fat, normalised so the segments always
 * sum to 100% even when the stated kcal disagrees slightly with the macros.
 *
 * This is NOT a macro ring standing in for a photograph, which AGENTS.md
 * forbids. It sits beside the dish's name, description and price and
 * visualises numbers the card already prints.
 */
function MacroSplit({ p, c, f }: { p: number; c: number; f: number }) {
  const kp = p * 4, kc = c * 4, kf = f * 9;
  const total = kp + kc + kf;
  if (!total) return null;
  const pct = (n: number) => Math.round((n / total) * 100);
  const segs = [
    { key: "protein", label: "P", g: p, w: pct(kp), cls: sx.segP },
    { key: "carbs", label: "C", g: c, w: pct(kc), cls: sx.segC },
    { key: "fat", label: "F", g: f, w: pct(kf), cls: sx.segF },
  ];
  return (
    <div className={sx.macro}>
      {/* One sentence for the whole graphic. The bar is decorative so a screen
          reader is not read three unlabelled divs. */}
      <span className="fk-sr-only">
        {`${p} grams protein, ${c} grams carbohydrate, ${f} grams fat. ${pct(kp)} per cent of calories from protein.`}
      </span>
      <span className={sx.macroBar} aria-hidden="true">
        {segs.map((sg) => (
          <span key={sg.key} className={sg.cls} style={{ width: `${sg.w}%` }} />
        ))}
      </span>
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
 * single texture. Hashing the dish id into a hue gives the grid rhythm while a
 * card is still waiting for its photograph, and the moment a real image lands
 * it replaces this with no layout change.
 *
 * It is a SURFACE, not a diagram: it does not encode flavour, heat or
 * ingredients, and nothing about it invites the reader to decode it. That is
 * the line AGENTS.md draws — a macro ring pretending to be a dish is out, a
 * coloured ground under a course label is not.
 */
function fieldStyle(id: string): React.CSSProperties {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return {
    backgroundImage:
      `radial-gradient(120% 100% at 20% 0%, hsl(${h} 45% 22% / 0.85), transparent 62%),` +
      `radial-gradient(90% 90% at 90% 100%, hsl(${(h + 48) % 360} 40% 18% / 0.7), transparent 60%)`,
  };
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
      <span className={s.stepQty} aria-live="polite" aria-label={`${qty} in order`}>
        {qty}
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
  const [planSheet, setPlanSheet] = useState<ShopPlan | null>(null);
  /* The order bar is dismissible. It is fixed, it sits over the last row of
     cards, and shipping it with no way out left a customer with something in
     the basket staring at a slab across the menu for the rest of the session.
     Dismissing costs nothing: the basket is one tap away in the header and the
     badge there still carries the count. */
  const [barHidden, setBarHidden] = useState(false);
  /* Which plan card has its variations open, and which has its menu open.
     Two separate buttons, two separate panels — a plan's diets and a plan's
     food are different questions and were previously behind one "Configure". */
  const [openVariants, setOpenVariants] = useState<string | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

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
            <button type="button" className={s.place}>
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
        <div className={s.main}>
          {/* Filters. Counts are real, so a chip never leads to an empty grid. */}
          <div className={s.pad}>
            {/* The app's one h1. Visually hidden because the shell states the
                brand with the wordmark and the view with the result heading —
                a big "FitFuel" banner would be a landing-page habit. It is a
                stable sentence, not the filtered heading, so a screen reader
                does not get a new page title every time a chip is tapped. */}
            <h1 className="fk-sr-only">FitFuel — order healthy food in Pune</h1>

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
              <ul className={s.grid}>
                {suppResults.map((x) => (
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
            ) : mode === "plans" ? (
              <ul className={s.grid}>
                {planResults.map((p) => (
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
                      <p className={s.macroLine}>{p.kcal?.toLocaleString("en-IN")} kcal a day</p>
                      {p.pcf ? <MacroSplit p={p.pcf[0]} c={p.pcf[1]} f={p.pcf[2]} /> : null}

                      <div className={s.planActions}>
                        <button
                          type="button"
                          className={`${s.add} ${s.ghost}`}
                          aria-expanded={openVariants === p.slug}
                          onClick={() => { setOpenVariants(openVariants === p.slug ? null : p.slug); setOpenMenu(null); }}
                        >
                          {p.variants.length} variation{p.variants.length === 1 ? "" : "s"}
                        </button>
                        <button
                          type="button"
                          className={`${s.add} ${s.ghost}`}
                          aria-expanded={openMenu === p.slug}
                          onClick={() => { setOpenMenu(openMenu === p.slug ? null : p.slug); setOpenVariants(null); }}
                        >
                          View menu
                        </button>
                      </div>

                      {openVariants === p.slug ? (
                        <ul className={s.panel}>
                          {p.variants.map((v) => (
                            <li key={v.slug}>
                              <span>{DIET_LABEL[v.diet] ?? v.diet}</span>
                              <span className="fk-num">{v.kcal.toLocaleString("en-IN")} kcal · {v.protein}g P</span>
                            </li>
                          ))}
                        </ul>
                      ) : null}

                      {openMenu === p.slug ? (
                        p.meals.length > 0 ? (
                          <ul className={s.panel}>
                            {p.meals.map((m) => (
                              <li key={m.slot}>
                                <span>{SLOT_LABEL[m.slot] ?? m.slot}</span>
                                <b>{m.name}</b>
                                <span className="fk-num">{m.kcal} kcal</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className={s.panelNote}>
                            The 30-day menu for this plan is published monthly. Its macros above
                            are the daily target the kitchen cooks to.
                          </p>
                        )
                      ) : null}

                      <div className={s.cardFoot}>
                        <span className={s.askPrice}>{p.macros}</span>
                        <button type="button" className={s.add} onClick={() => setPlanSheet(p)}>
                          Configure
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
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
              <ul className={s.grid}>
                {results.map((d) => (
                  <li key={d.id} className={s.card}>
                    {!images[d.slot] ? (
                      /* Image section KEPT as a placeholder. Drop a photograph
                         into public/images/dishes/<slug> and it replaces this
                         with no layout change — the well is already the right
                         aspect. */
                      <button
                        type="button"
                        className={s.shotPlaceholder}
                        style={fieldStyle(d.id)}
                        onClick={() => setSheet(d)}
                        aria-label={`See ${d.name}`}
                      >
                        <span>{d.categoryLabel}</span>
                        {badgesFor(d).length ? (
                          <span className={s.badgeRow}>
                            {badgesFor(d).map((b) => (
                              <span key={b} className={s.tag}>{b}</span>
                            ))}
                          </span>
                        ) : null}
                      </button>
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
                      <p className={s.dishTop}>
                        <span className={s.dishCourse}>{d.categoryLabel}</span>
                        {d.kcal ? <span className="fk-num">{d.kcalLabel}</span> : null}
                      </p>
                      {/* Every dish now has a URL. It was reachable only as a
                          card and a modal, so it could not be linked, shared,
                          indexed or sent to a customer. The sheet stays as the
                          quick look; this is the page. */}
                      <Link href={`/menu/${d.id}`} className={s.dishName}>
                        {d.name}
                      </Link>
                      <p className={s.dishBlurb}>{d.blurb}</p>
                      {d.kcal ? <MacroSplit p={d.protein} c={d.carbs} f={d.fat} /> : null}
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
            )}
          </div>
        </div>
      </div>

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
    </div>
  );
}
