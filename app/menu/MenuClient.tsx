"use client";

// app/menu/MenuClient.tsx
//
// The menu as an editorial list, not a grid of cards.
//
// A uniform 3-up card grid is the first thing DESIGN.md rejects on sight, and
// it is also just wrong for this content: 48 dishes in 6 courses is a menu,
// and a menu is a list. Rows let the blurb — which is the only art direction
// this page has until photography exists — actually be read, and they scale to
// a phone by doing nothing.
//
// Two buttons, never both on one row:
//   Add       priced dishes. Quantity, add-on, running total.
//   Ask price provisional dishes. Joins an enquiry list on the same message.
//
// See app/menu/page.tsx for why that split exists.

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Check, Plus } from "lucide-react";

import type { AddOn, MenuCategoryKey } from "@/lib/menu-alacarte";
import { useCart } from "@/app/_cart/CartProvider";

export type MenuDish = {
  id: string;
  name: string;
  blurb: string;
  price: number | null;
  provisional: boolean;
  variantNote: string | null;
  addOns: AddOn[] | null;
  category: MenuCategoryKey;
  categoryLabel: string;
  image: string | null;
};

type Stats = { items: number; categories: number; from: number; orderable: number; enquiry: number };

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

const ORDER: MenuCategoryKey[] = ["salads", "keto", "bowls", "breakfast", "bars", "juices"];

export default function MenuClient({ dishes, stats }: { dishes: MenuDish[]; stats: Stats }) {
  const [cat, setCat] = useState<MenuCategoryKey | "all">("all");
  const [buyableOnly, setBuyableOnly] = useState(false);

  const { add, toggleEnquiry, qtyOf, hasEnquiry, hydrated } = useCart();

  const shown = useMemo(() => {
    const list = dishes.filter(
      (d) => (cat === "all" || d.category === cat) && (!buyableOnly || !d.provisional),
    );
    const groups = new Map<MenuCategoryKey, MenuDish[]>();
    for (const d of list) {
      const g = groups.get(d.category);
      if (g) g.push(d); else groups.set(d.category, [d]);
    }
    return ORDER.filter((k) => groups.has(k)).map((k) => ({
      key: k,
      label: groups.get(k)![0].categoryLabel,
      items: groups.get(k)!,
    }));
  }, [dishes, cat, buyableOnly]);

  const cats = useMemo(() => {
    const seen = new Map<MenuCategoryKey, string>();
    for (const d of dishes) if (!seen.has(d.category)) seen.set(d.category, d.categoryLabel);
    return ORDER.filter((k) => seen.has(k)).map((k) => ({ key: k, label: seen.get(k)! }));
  }, [dishes]);

  return (
    <div className="mn">
      {/* ── Masthead ─────────────────────────────────────────────────────── */}
      <header className="mn-top">
        <div className="mn-wrap">
          <h1 className="mn-h1">
            The menu.<br />
            <span className="mn-h1-lime">One meal at a time.</span>
          </h1>

          <div className="mn-lede">
            <p>
              {stats.items} dishes the same kitchen cooks for the meal plans, sold singly with no
              subscription and no minimum. Same licence, same scale, same morning.
            </p>
            <p>
              Order direct here or on WhatsApp. We are listed on Swiggy and Zomato too, but
              ordering here reaches the kitchen without a middleman.
            </p>
          </div>

          <dl className="mn-figs">
            <div><dt>From</dt><dd>{rs(stats.from)}</dd></div>
            <div><dt>Dishes</dt><dd>{stats.items}</dd></div>
            <div><dt>Courses</dt><dd>{stats.categories}</dd></div>
          </dl>
        </div>
      </header>

      {/* ── Filters ──────────────────────────────────────────────────────── */}
      <div className="mn-bar">
        <div className="mn-wrap mn-bar-in">
          <div className="mn-chips" role="group" aria-label="Filter by course">
            <button
              onClick={() => setCat("all")}
              className="mn-chip" data-on={cat === "all" ? "1" : "0"}
              aria-pressed={cat === "all"}
            >
              Everything
            </button>
            {cats.map((c) => (
              <button
                key={c.key}
                onClick={() => setCat(c.key)}
                className="mn-chip" data-on={cat === c.key ? "1" : "0"}
                aria-pressed={cat === c.key}
              >
                {c.label}
              </button>
            ))}
          </div>

          <label className="mn-toggle">
            <input
              type="checkbox"
              checked={buyableOnly}
              onChange={(e) => setBuyableOnly(e.target.checked)}
            />
            <span>Only what I can order now ({stats.orderable})</span>
          </label>
        </div>
      </div>

      {/* ── The honesty line about the other 32 ──────────────────────────── */}
      {!buyableOnly && stats.enquiry > 0 && (
        <div className="mn-wrap">
          <p className="mn-caveat">
            {stats.orderable} of these {stats.items} dishes have a price the kitchen has set, and
            those you can order right now. The other {stats.enquiry} are cooked and on the menu but
            not priced yet, so rather than print a number nobody agreed to, they carry
            <em> ask price</em> — add them and we reply with the figure.
          </p>
        </div>
      )}

      {/* ── The list ─────────────────────────────────────────────────────── */}
      <div className="mn-wrap">
        {shown.map((group) => (
          <section key={group.key} className="mn-sec" aria-labelledby={`sec-${group.key}`}>
            <h2 id={`sec-${group.key}`} className="mn-sec-h">
              {group.label}
              <span className="mn-sec-n">{group.items.length}</span>
            </h2>

            <ul className="mn-list">
              {group.items.map((d) => (
                <Row
                  key={d.id}
                  dish={d}
                  qty={hydrated ? qtyOf(d.id) : 0}
                  asked={hydrated ? hasEnquiry(d.id) : false}
                  onAdd={add}
                  onAsk={toggleEnquiry}
                />
              ))}
            </ul>
          </section>
        ))}

        {shown.length === 0 && (
          <p className="mn-caveat">Nothing matches that filter.</p>
        )}
      </div>

      {/* ── Foot ─────────────────────────────────────────────────────────── */}
      <div className="mn-wrap">
        <div className="mn-foot">
          <p>
            Eating this way every day is what the meal plans are for — cooked to your macros,
            delivered six mornings a week, and cheaper per meal than ordering singly.
          </p>
          <Link href="/plans" className="mn-foot-cta">See the meal plans</Link>
        </div>
      </div>

      <style>{`
        .mn { padding-top: 68px; background: var(--ff-bg, #070707); }
        .mn-wrap { width: 100%; max-width: 1180px; margin: 0 auto; padding: 0 clamp(18px,4vw,40px); }

        .mn-top { padding: clamp(48px,7vw,96px) 0 clamp(30px,4vw,48px); }
        .mn-h1 {
          margin: 0; font-family: var(--ff-cond); font-weight: 900;
          font-size: clamp(3rem, 9vw, 7.5rem); line-height: 0.86; letter-spacing: -0.03em;
          text-transform: uppercase; color: var(--ff-ink, #f7f7f5);
        }
        .mn-h1-lime { color: var(--ff-lime, #84cc16); }

        .mn-lede { display: grid; gap: 14px; margin-top: 30px; max-width: 62ch; }
        .mn-lede p {
          margin: 0; font-family: var(--ff-body); font-size: 16px; line-height: 1.62;
          color: var(--ff-mute, #9a9a94);
        }

        .mn-figs {
          display: flex; flex-wrap: wrap; gap: clamp(28px, 6vw, 64px);
          margin: 38px 0 0; padding-top: 22px; border-top: 1px solid var(--ff-rule, #232320);
        }
        .mn-figs div { display: flex; flex-direction: column; gap: 7px; }
        .mn-figs dt {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px;
          letter-spacing: 0.22em; text-transform: uppercase; color: var(--ff-dim, #85857e);
        }
        .mn-figs dd {
          margin: 0; font-family: var(--ff-cond); font-weight: 900;
          font-size: clamp(2rem, 4vw, 3rem); line-height: 0.82; letter-spacing: -0.035em;
          color: var(--ff-ink, #f7f7f5); font-variant-numeric: tabular-nums;
        }

        /* Sticky under the 68px navbar so the course filter stays reachable
           through a 48-row list. */
        .mn-bar {
          position: sticky; top: 68px; z-index: 20;
          background: rgba(7,7,7,0.94); backdrop-filter: blur(10px);
          border-top: 1px solid var(--ff-rule, #232320);
          border-bottom: 1px solid var(--ff-rule, #232320);
        }
        .mn-bar-in {
          display: flex; align-items: center; justify-content: space-between;
          gap: 18px; flex-wrap: wrap; padding-top: 12px; padding-bottom: 12px;
        }
        .mn-chips { display: flex; flex-wrap: wrap; gap: 7px; }
        .mn-chip {
          font-family: var(--ff-cond); font-weight: 800; font-size: 14px;
          letter-spacing: 0.05em; text-transform: uppercase;
          background: transparent; color: var(--ff-mute, #9a9a94);
          border: 1px solid var(--ff-rule, #232320); border-radius: 0;
          padding: 8px 14px; min-height: 38px; cursor: pointer;
          transition: color .15s, border-color .15s, background .15s;
        }
        .mn-chip:hover { color: var(--ff-ink, #f7f7f5); border-color: var(--ff-rule-2, #33332f); }
        .mn-chip[data-on="1"] {
          background: var(--ff-lime, #84cc16); border-color: var(--ff-lime, #84cc16); color: #06140b;
        }
        .mn-toggle {
          display: inline-flex; align-items: center; gap: 9px; cursor: pointer;
          font-family: var(--ff-body); font-size: 13px; color: var(--ff-mute, #9a9a94);
        }
        .mn-toggle input { width: 16px; height: 16px; accent-color: var(--ff-lime, #84cc16); }

        .mn-caveat {
          margin: 26px 0 0; max-width: 78ch;
          font-family: var(--ff-body); font-size: 13.5px; line-height: 1.65;
          color: var(--ff-dim, #85857e);
        }
        .mn-caveat em { color: var(--ff-mute, #9a9a94); font-style: normal; font-weight: 600; }

        .mn-sec { padding: clamp(44px,6vw,76px) 0 0; }
        .mn-sec-h {
          display: flex; align-items: baseline; gap: 14px; margin: 0 0 4px;
          font-family: var(--ff-cond); font-weight: 900;
          font-size: clamp(1.9rem, 4.4vw, 3.2rem); line-height: 0.9; letter-spacing: -0.025em;
          text-transform: uppercase; color: var(--ff-ink, #f7f7f5);
        }
        .mn-sec-n {
          font-family: var(--font-mono), ui-monospace, monospace; font-weight: 700; font-size: 13px;
          letter-spacing: 0.1em; color: var(--ff-dim, #85857e); font-variant-numeric: tabular-nums;
        }

        .mn-list { list-style: none; margin: 20px 0 0; padding: 0; border-top: 1px solid var(--ff-rule, #232320); }

        .mn-row {
          display: flex; align-items: flex-start; gap: clamp(14px, 3vw, 30px);
          padding: 22px 0; border-bottom: 1px solid var(--ff-rule, #232320);
        }
        .mn-shot {
          position: relative; width: 88px; height: 88px; flex-shrink: 0;
          background: var(--ff-panel-2, #0c0c0a); overflow: hidden;
        }
        .mn-shot img { object-fit: cover; filter: saturate(1.06) contrast(1.07); }

        .mn-main { flex: 1; min-width: 0; }
        .mn-name {
          font-family: var(--ff-cond); font-weight: 800; font-size: clamp(18px, 2.2vw, 22px);
          line-height: 1.08; letter-spacing: -0.015em; text-transform: uppercase;
          color: var(--ff-ink, #f7f7f5); margin: 0;
        }
        .mn-blurb {
          margin: 7px 0 0; max-width: 60ch;
          font-family: var(--ff-body); font-size: 14px; line-height: 1.6; color: var(--ff-mute, #9a9a94);
        }
        .mn-variant {
          display: block; margin-top: 6px;
          font-family: var(--ff-body); font-size: 12.5px; color: var(--ff-dim, #85857e);
        }
        .mn-addon {
          margin-top: 11px; background: var(--ff-panel, #050504);
          border: 1px solid var(--ff-rule, #232320); border-radius: 0;
          color: var(--ff-mute, #9a9a94); font-family: var(--ff-body); font-size: 12.5px;
          padding: 7px 9px; min-height: 36px; max-width: 260px; width: 100%;
        }
        .mn-addon:focus-visible { outline: 2px solid var(--ff-lime, #84cc16); outline-offset: 2px; }

        .mn-side {
          display: flex; flex-direction: column; align-items: flex-end; gap: 10px;
          flex-shrink: 0; min-width: 132px;
        }
        .mn-price {
          font-family: var(--ff-cond); font-weight: 900; font-size: clamp(20px, 2.6vw, 27px);
          line-height: 1; letter-spacing: -0.03em; color: var(--ff-ink, #f7f7f5);
          font-variant-numeric: tabular-nums;
        }
        .mn-price[data-ask="1"] {
          font-size: 12px; font-family: var(--font-mono), ui-monospace, monospace;
          font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase;
          color: var(--ff-dim, #85857e);
        }

        .mn-add {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          font-family: var(--ff-cond); font-weight: 800; font-size: 14px;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: var(--ff-lime, #84cc16); color: #06140b;
          border: 1px solid var(--ff-lime, #84cc16); border-radius: 0;
          padding: 0 16px; min-height: 44px; min-width: 116px; cursor: pointer;
          transition: background .15s, border-color .15s;
        }
        .mn-add:hover { background: var(--ff-lime-light, #a3e635); border-color: var(--ff-lime-light, #a3e635); }
        .mn-add[data-in="1"] { background: transparent; color: var(--ff-lime, #84cc16); }
        .mn-add[data-in="1"]:hover { background: rgba(132,204,22,0.1); }

        .mn-ask {
          display: inline-flex; align-items: center; justify-content: center; gap: 7px;
          font-family: var(--ff-cond); font-weight: 800; font-size: 14px;
          letter-spacing: 0.06em; text-transform: uppercase;
          background: transparent; color: var(--ff-mute, #9a9a94);
          border: 1px solid var(--ff-rule-2, #33332f); border-radius: 0;
          padding: 0 16px; min-height: 44px; min-width: 116px; cursor: pointer;
          transition: color .15s, border-color .15s;
        }
        .mn-ask:hover { color: var(--ff-ink, #f7f7f5); border-color: var(--ff-mute, #9a9a94); }
        .mn-ask[data-on="1"] { color: var(--ff-lime, #84cc16); border-color: var(--ff-lime, #84cc16); }

        .mn-foot {
          display: flex; align-items: center; justify-content: space-between;
          gap: 24px; flex-wrap: wrap;
          margin: clamp(56px,8vw,110px) 0 clamp(64px,9vw,120px);
          padding-top: 26px; border-top: 1px solid var(--ff-rule-2, #33332f);
        }
        .mn-foot p {
          margin: 0; max-width: 56ch;
          font-family: var(--ff-body); font-size: 15px; line-height: 1.6; color: var(--ff-mute, #9a9a94);
        }
        .mn-foot-cta {
          display: inline-flex; align-items: center; min-height: 48px; padding: 0 24px;
          font-family: var(--ff-cond); font-weight: 800; font-size: 15px;
          letter-spacing: 0.06em; text-transform: uppercase; text-decoration: none;
          color: var(--ff-ink, #f7f7f5); border: 1px solid var(--ff-rule-2, #33332f);
          transition: border-color .15s, color .15s;
        }
        .mn-foot-cta:hover { border-color: var(--ff-lime, #84cc16); color: var(--ff-lime, #84cc16); }

        @media (max-width: 720px) {
          .mn-row { flex-wrap: wrap; }
          .mn-side { min-width: 0; width: 100%; flex-direction: row; align-items: center; justify-content: space-between; }
          .mn-shot { width: 64px; height: 64px; }
        }
      `}</style>
    </div>
  );
}

/* ── One dish ────────────────────────────────────────────────────────────── */

function Row({
  dish, qty, asked, onAdd, onAsk,
}: {
  dish: MenuDish;
  qty: number;
  asked: boolean;
  onAdd: (id: string, addOn?: AddOn["kind"]) => void;
  onAsk: (id: string) => void;
}) {
  const [addOn, setAddOn] = useState<AddOn["kind"] | "">("");
  const orderable = dish.price != null && !dish.provisional;
  const chosen = dish.addOns?.find((a) => a.kind === addOn);
  const unit = (dish.price ?? 0) + (chosen?.price ?? 0);

  return (
    <li className="mn-row">
      {dish.image && (
        <div className="mn-shot">
          {/* quality must stay 75 — next.config images.qualities allows only
              that one value, and anything else throws in production. */}
          <Image src={dish.image} alt={dish.name} fill sizes="88px" quality={75} />
        </div>
      )}

      <div className="mn-main">
        <h3 className="mn-name">{dish.name}</h3>
        <p className="mn-blurb">{dish.blurb}</p>
        {dish.variantNote && <span className="mn-variant">{dish.variantNote}</span>}

        {orderable && dish.addOns && dish.addOns.length > 0 && (
          <select
            className="mn-addon"
            value={addOn}
            onChange={(e) => setAddOn(e.target.value as AddOn["kind"] | "")}
            aria-label={`Add protein to ${dish.name}`}
          >
            <option value="">No add-on</option>
            {dish.addOns.map((a) => (
              <option key={a.kind} value={a.kind}>
                {a.kind} — {a.what} (+{rs(a.price)})
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="mn-side">
        {orderable ? (
          <>
            <span className="mn-price">{rs(unit)}</span>
            <button
              className="mn-add"
              data-in={qty > 0 ? "1" : "0"}
              onClick={() => onAdd(dish.id, addOn || undefined)}
            >
              {qty > 0
                ? <><Check size={14} aria-hidden="true" />{qty} in order</>
                : <><Plus size={14} aria-hidden="true" />Add</>}
            </button>
          </>
        ) : (
          <>
            <span className="mn-price" data-ask="1">Not priced yet</span>
            <button
              className="mn-ask"
              data-on={asked ? "1" : "0"}
              onClick={() => onAsk(dish.id)}
              aria-pressed={asked}
            >
              {asked ? <><Check size={14} aria-hidden="true" />Asked</> : "Ask price"}
            </button>
          </>
        )}
      </div>
    </li>
  );
}
