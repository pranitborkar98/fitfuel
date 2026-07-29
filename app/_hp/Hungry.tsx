// app/_hp/Hungry.tsx
//
// THE SHOP BAND. The homepage sold exactly one thing — a subscription — and
// the visitor who is simply hungry tonight had no route through it.
//
// This is deliberately ONE band and not a chapter. The page's own header
// argues that breadth does not require chapters, and that holds here: the
// storefront is a real page at /menu that explains itself. What this band owes
// the reader is the fact that single meals exist, what they cost, and one
// click. It does not owe them a product carousel.
//
// A hairline table rather than a card grid, for two reasons. The uniform 3-up
// grid is the first thing DESIGN.md rejects, and more practically there is no
// dish photography yet — six photo-shaped boxes holding nothing would be worse
// than the type. When images land, /menu picks them up; this band stays type.
//
// EVERY NUMBER IS COMPUTED from lib/menu-alacarte.ts. The counts and the
// per-course "from" price cannot drift when the kitchen edits the menu, and
// provisional rows are excluded from every price shown — see MENU_FROM's note
// on why a placeholder must never reach a headline.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { MENU } from "@/lib/menu-alacarte";
import { ORDERABLE_COUNT } from "@/lib/menu-cart";
import { WRAP, SECTION, RULE, INK, DIM, LIME, MONO, display, body } from "./theme";

/** Per course: how many dishes, and the cheapest price the kitchen has
 *  actually confirmed. Null when nothing in the course is priced yet. */
const COURSES = MENU.map((c) => {
  const priced = c.items.filter((i) => i.price != null && !i.provisional).map((i) => i.price!);
  return {
    key: c.key,
    label: c.label,
    count: c.items.length,
    from: priced.length ? Math.min(...priced) : null,
  };
});

export default function Hungry() {
  return (
    <section aria-labelledby="hp-hungry" style={{ ...SECTION, borderTop: `1px solid ${RULE}` }}>
      <div style={WRAP}>
        <Idx label="No subscription" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-hungry" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "13ch" }}>
            Just hungry? <span style={{ color: LIME }}>Order one meal.</span>
          </h2>
          <p style={{ ...body(16.5) }}>
            The same kitchen runs a single-dish menu — salads, keto, bowls, breakfast, protein
            bars and cold-pressed juice. No plan, no minimum, no commitment. Order it from the
            people who cook it rather than through an app that takes a cut of it.
          </p>
        </div>

        <ul
          style={{
            listStyle: "none", margin: "clamp(26px,3.4vw,42px) 0 0", padding: 0,
            borderTop: `1px solid ${RULE}`,
          }}
        >
          {COURSES.map((c) => (
            <li
              key={c.key}
              style={{
                display: "flex", alignItems: "baseline", justifyContent: "space-between",
                gap: 20, padding: "16px 0", borderBottom: `1px solid ${RULE}`,
              }}
            >
              <span
                style={{
                  fontFamily: "var(--ff-cond)", fontWeight: 800,
                  fontSize: "clamp(19px,2.4vw,26px)", lineHeight: 1,
                  letterSpacing: "-0.015em", textTransform: "uppercase", color: INK,
                }}
              >
                {c.label}
              </span>

              <span
                style={{
                  fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.14em",
                  textTransform: "uppercase", color: DIM, whiteSpace: "nowrap",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                {c.count} dishes
                {c.from != null ? ` · from ₹${c.from}` : " · price on request"}
              </span>
            </li>
          ))}
        </ul>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/menu" className={s.btn}>
            See the whole menu
          </Link>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 20 }}>
          {ORDERABLE_COUNT} dishes are priced and orderable now. The rest are cooked and listed,
          but the kitchen has not set their price yet, so they say so instead of showing a number
          we would not stand behind.
        </p>
      </div>
    </section>
  );
}
