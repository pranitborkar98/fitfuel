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
import type { ShopDish } from "@/app/_shop/catalog";
import DishSheet from "@/app/_shop/DishSheet";
import Slot, { type SlotMap } from "@/app/_shop/Slot";
import s from "./app.module.css";

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

const NAV = [
  { href: "/", label: "Order", icon: I.bowl },
  { href: "/plans", label: "Plans", icon: I.layers },
  { href: "/dashboard/coach", label: "Coach", icon: I.spark },
  { href: "/dashboard/nutrition", label: "Diary", icon: I.book },
  { href: "/dashboard", label: "Account", icon: I.user },
] as const;

/* Everything the long-form page used to argue, still reachable. */
const MORE = [
  { href: "/how-it-works", label: "How a day works" },
  { href: "/our-kitchen", label: "The kitchen" },
  { href: "/corporate", label: "For offices" },
  { href: "/supplements", label: "Supplements" },
  { href: "/faq", label: "Questions" },
] as const;

export type Course = { key: string; label: string; n: number };

export type AppProps = {
  dishes: ShopDish[];
  images: SlotMap;
  courses: Course[];
  area: string;
  cutoffLabel: string;
  trialTotal: string;
  menuFrom: string;
  planCount: number;
  waHref: string;
  licence: string;
};

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

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
  area,
  cutoffLabel,
  trialTotal,
  menuFrom,
  planCount,
  waHref,
  licence,
}: AppProps) {
  const cart = useCart();
  const [q, setQ] = useState("");
  const [course, setCourse] = useState("all");
  const [onlyOrderable, setOnlyOrderable] = useState(false);
  const [sheet, setSheet] = useState<ShopDish | null>(null);
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

  const orderableCount = results.filter((d) => d.orderable).length;
  const basketCount = cart.totals.count;
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
          <p className={s.cutoffRow}>
            <span>
              Order by <b>{cutoffLabel}</b> to eat tomorrow — at your door by 8am.
            </span>
          </p>
        </div>

        {/* ── Rail + content ──────────────────────────────────────────────── */}
        <div className={s.filters}>
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
        </div>
      </header>

      <div className={s.body}>
        <nav className={s.rail} aria-label="Sections">
          <ul className={s.railList}>
            {NAV.map((n) => (
              <li key={n.href}>
                <Link href={n.href} className={`${s.railLink} ${n.href === "/" ? s.railOn : ""}`}>
                  <Icon d={n.icon} />
                  {n.label}
                </Link>
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
              <h2>{q.trim() ? `Results for “${q.trim()}”` : course === "all" ? "Everything on the menu" : courses.find((c) => c.key === course)?.label}</h2>
              <p>
                {results.length} dish{results.length === 1 ? "" : "es"}
                {orderableCount !== results.length ? ` · ${orderableCount} priced tonight, from ${menuFrom}` : ` · from ${menuFrom}`}
              </p>
            </div>

            {results.length === 0 ? (
              <div className={s.empty}>
                <h3>Nothing matches that.</h3>
                <p>
                  We cook {dishes.length} dishes across {courses.length} courses, and {planCount} plans on
                  subscription. Try a different word, or ask the kitchen directly.
                </p>
                <a href={waHref} className={s.add} style={{ textDecoration: "none" }}>
                  Ask on WhatsApp
                </a>
              </div>
            ) : (
              <ul className={s.grid}>
                {results.map((d) => (
                  <li key={d.id} className={s.card}>
                    <button
                      type="button"
                      className={s.shot}
                      onClick={() => setSheet(d)}
                      aria-label={`See ${d.name}`}
                    >
                      {/* Slot is mounted ONLY when a real photograph exists.
                          Its no-image branch draws a macro glyph, and
                          AGENTS.md forbids a diagram standing in for a dish
                          where someone is choosing what to eat — so that
                          branch is deliberately unreachable from here. */}
                      {images[d.slot] ? (
                        <Slot
                          images={images}
                          name={d.slot}
                          alt={d.name}
                          sizes="(min-width: 1024px) 300px, (min-width: 640px) 45vw, 90vw"
                        />
                      ) : (
                        <span className={s.shotEmpty}>{d.categoryLabel}</span>
                      )}
                      {d.kcal ? <span className={s.kcalTag}>{d.kcalLabel}</span> : null}
                    </button>

                    <div className={s.cardBody}>
                      <button type="button" className={s.dishName} onClick={() => setSheet(d)}>
                        {d.name}
                      </button>
                      <p className={s.dishBlurb}>{d.blurb}</p>
                      {d.kcal ? <p className={s.macroLine}>{d.macroLine}</p> : null}

                      <div className={s.cardFoot}>
                        {d.orderable ? (
                          <span className={s.price}>{d.priceLabel}</span>
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

      {/* ── Bottom tabs ─────────────────────────────────────────────────── */}
      <nav className={s.tabs} aria-label="Sections">
        {NAV.map((n) => (
          <Link key={n.href} href={n.href} className={`${s.tab} ${n.href === "/" ? s.tabOn : ""}`}>
            <Icon d={n.icon} size={22} />
            {n.label}
          </Link>
        ))}
      </nav>

      {/* ── Order bar ───────────────────────────────────────────────────── */}
      {basketCount > 0 ? (
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
          </div>
        </div>
      ) : null}

      {sheet ? <DishSheet dish={sheet} images={images} onClose={() => setSheet(null)} /> : null}
    </div>
  );
}
