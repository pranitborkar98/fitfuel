"use client";

// app/v2/Storefront.tsx
//
// The storefront's one interactive piece: course filtering, the grid, and the
// basket bar. Everything else on /v2 is data handed down from the server.
//
// THREE THINGS THIS DOES THAT THE LIVE HOMEPAGE DOES NOT.
//
// 1. It prices the offer on the first screen and lets you buy from it. The live
//    hero is a promise, a paragraph and three links to other pages.
// 2. It shows all forty-eight dishes. The live page shows thirty across six
//    rails and calls the rest "see the menu".
// 3. It keeps a running basket in view. A shop where the total is behind a
//    drawer icon is a catalogue.
//
// The filter is client state rather than a route, so switching courses costs
// nothing and never reloads the grid.

import { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "../_cart/CartProvider";
import c from "./v2.module.css";

export type ShopDish = {
  id: string;
  name: string;
  blurb: string;
  price: number | null;
  course: string;
  courseLabel: string;
  img: string | null;
};

export type ShopPlan = {
  goal: string;
  who: string;
  href: string;
  accent: string;
  count: number;
};

type Trial = {
  price: string;
  cutoff: string;
  kcal: number;
  protein: number;
  meals: { slot: string; name: string; kcal: number | null; img: string | null }[];
};

/** Two letters on a flat plate. Not pretending to be a photograph — it holds
 *  the tile at the exact proportion the real image will occupy, so the grid's
 *  rhythm is identical before and after the shoot. */
function Plate({ name }: { name: string }) {
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");
  return <div className={c.plate} aria-hidden>{initials}</div>;
}

export default function Storefront({
  dishes,
  courses,
  plans,
  trial,
  totalDishes,
}: {
  dishes: ShopDish[];
  courses: { key: string; label: string; count: number }[];
  plans: ShopPlan[];
  trial: Trial;
  totalDishes: number;
}) {
  const [course, setCourse] = useState<string>("ALL");
  const { add, qtyOf, hydrated, totals, setOpen, toggleEnquiry, hasEnquiry } = useCart();

  const shown = useMemo(
    () => (course === "ALL" ? dishes : dishes.filter((d) => d.course === course)),
    [dishes, course],
  );

  const priced = dishes.filter((d) => d.price != null).length;

  return (
    <main className={c.page}>
      {/* ── 1. THE OFFER, PRICED, ON ONE SCREEN ───────────────────────── */}
      <section className={c.top}>
        <div className={c.offer}>
          <span className={c.eyebrow}>Pune · cooked this morning</span>
          <h1 className={c.h1}>
            Four meals at your door by <em>8am</em>.
          </h1>
          <p className={c.sub}>
            Order by {trial.cutoff}. No cooking, no counting, no 7pm decision.
          </p>

          <div className={c.buyRow}>
            <Link href="/plans?trial=true" className={c.buy}>
              Order a full day <b>{trial.price}</b>
            </Link>
            <a className={c.alt} href="#shop">
              or just one dish
            </a>
          </div>

          <ul className={c.marks}>
            <li><b>08:00</b><span>six mornings a week</span></li>
            <li><b>{trial.kcal}</b><span>kcal · {trial.protein}g protein</span></li>
            <li><b>FSSAI</b><span>our own licence</span></li>
          </ul>
        </div>

        {/* The day, as four buyable-looking tiles. This is the product. */}
        <div className={c.dayGrid}>
          {trial.meals.map((m) => (
            <figure key={m.slot} className={c.dayTile}>
              {m.img ? (
                <Image src={m.img} alt={m.name} fill sizes="220px" className={c.cover} />
              ) : (
                <Plate name={m.name} />
              )}
              <figcaption>
                <span>{m.slot}</span>
                <b>{m.name}</b>
                {m.kcal != null && <i>{m.kcal} kcal</i>}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ── 2. STICKY COURSE BAR ──────────────────────────────────────── */}
      <nav className={c.bar} id="shop" aria-label="Filter by course">
        <button
          type="button"
          onClick={() => setCourse("ALL")}
          className={course === "ALL" ? `${c.chip} ${c.chipOn}` : c.chip}
          aria-pressed={course === "ALL"}
        >
          Everything <i>{totalDishes}</i>
        </button>
        {courses.map((x) => (
          <button
            key={x.key}
            type="button"
            onClick={() => setCourse(x.key)}
            className={course === x.key ? `${c.chip} ${c.chipOn}` : c.chip}
            aria-pressed={course === x.key}
          >
            {x.label} <i>{x.count}</i>
          </button>
        ))}
      </nav>

      {/* ── 3. THE GRID. Every dish, every price, an Add on each. ─────── */}
      <section className={c.grid} aria-label="Menu">
        {shown.map((d) => {
          const inCart = hydrated ? qtyOf(d.id) : 0;
          const asking = hydrated ? hasEnquiry(d.id) : false;

          return (
            <article key={d.id} className={c.card}>
              <div className={c.media}>
                {d.img ? (
                  <Image src={d.img} alt={d.name} fill sizes="(max-width:640px) 50vw, 260px" className={c.cover} />
                ) : (
                  <Plate name={d.name} />
                )}
              </div>

              <div className={c.body}>
                <span className={c.course}>{d.courseLabel}</span>
                <h3>{d.name}</h3>
                <p>{d.blurb}</p>
              </div>

              <div className={c.foot}>
                {d.price == null ? <span className={c.ask}>On request</span> : <span className={c.price}>₹{d.price}</span>}

                {d.price == null ? (
                  <button type="button" onClick={() => toggleEnquiry(d.id)} className={c.add} aria-pressed={asking}>
                    {asking ? "✓ Asking" : "Ask"}
                  </button>
                ) : (
                  <button type="button" onClick={() => add(d.id)} className={c.add} aria-label={`Add ${d.name}, ₹${d.price}`}>
                    {inCart > 0 ? `✓ ${inCart}` : "Add"}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </section>

      <p className={c.note}>
        {priced} of {totalDishes} dishes are priced and orderable now. The rest are cooked and
        listed — the kitchen has not set their price, so they say so.
      </p>

      {/* ── 4. PLANS, AS FOUR DOORS WITH REAL COUNTS ──────────────────── */}
      <section className={c.plans} aria-label="Meal plans">
        <h2 className={c.h2}>Or never decide again</h2>
        <div className={c.doors}>
          {plans.map((p) => (
            <Link key={p.goal} href={p.href} className={c.door} style={{ "--a": p.accent } as React.CSSProperties}>
              <b>{p.goal}</b>
              <span>{p.who}</span>
              <i>{p.count} plans →</i>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 5. THE BASKET, ALWAYS IN VIEW ─────────────────────────────── */}
      {hydrated && totals.count > 0 && (
        <div className={c.dock} role="status">
          <span>
            {totals.count} {totals.count === 1 ? "item" : "items"} · <b>₹{totals.subtotalRs}</b>
          </span>
          <button type="button" onClick={() => setOpen(true)} className={c.dockBtn}>
            View basket
          </button>
        </div>
      )}
    </main>
  );
}
