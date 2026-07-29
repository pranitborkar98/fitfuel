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
// THE BAND NOW SELLS. It used to be a hairline table of course names and "from"
// prices, on the reasoning that a 3-up grid is what DESIGN.md rejects and that
// six photo-shaped boxes holding nothing would be worse than type. The first
// half of that is right; the conclusion was wrong, and it is worth naming why,
// because the same reasoning independently produced a text-only version of
// nearly every other section on this page.
//
// Falling back to type is only free if you are the one section doing it. Once
// every section makes that call the page has 3,915 words, nine images and no
// buyable object anywhere on it — a brochure for a food business. And the
// "boxes holding nothing" premise was never true: DishImage renders the dish's
// macro glyph when no photograph exists, so the slot is always occupied by
// something drawn from that dish's real numbers.
//
// So: a scroll rail of real, priced, addable dishes (ShopRow.tsx). Not a grid.
// The course summary survives underneath as one line, which is all it was ever
// worth.
//
// EVERY NUMBER IS COMPUTED from lib/menu-alacarte.ts. The counts and the
// per-course "from" price cannot drift when the kitchen edits the menu, and
// provisional rows are excluded from every price shown — see MENU_FROM's note
// on why a placeholder must never reach a headline.
//
// SERVER COMPONENT.

import Link from "next/link";
import Image from "next/image";

import s from "./hp.module.css";
import Idx from "./Idx";
import ShopRow, { type ShelfDish } from "./ShopRow";
import { findDishImage, dishSlug } from "./DishImage";
import { MENU } from "@/lib/menu-alacarte";
import { DISHES, ORDERABLE_COUNT, isOrderable } from "@/lib/menu-cart";
import { WRAP, SECTION, RULE, INK, DIM, LIME, MONO, display, sub, label, body } from "./theme";

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

/* THE SHELF: one dish from each course, cheapest first, then filled out to
   eight from whatever else is priced. Cheapest-per-course is deliberate — this
   band's whole argument is "no plan, no minimum", and the lowest real number in
   each course is the most honest possible demonstration of that. Provisional
   and unpriced rows are excluded by isOrderable, so nothing on the shelf can
   show a price the kitchen has not confirmed. */
const SHELF_SIZE = 8;

const ORDERABLE = DISHES.filter(isOrderable);

const SHELF_DISHES = (() => {
  const byCourse = new Map<string, (typeof ORDERABLE)[number]>();
  for (const d of [...ORDERABLE].sort((a, b) => a.price! - b.price!)) {
    if (!byCourse.has(d.category)) byCourse.set(d.category, d);
  }
  const picked = [...byCourse.values()];
  const seen = new Set(picked.map((d) => d.id));
  for (const d of ORDERABLE) {
    if (picked.length >= SHELF_SIZE) break;
    if (!seen.has(d.id)) { picked.push(d); seen.add(d.id); }
  }
  return picked.slice(0, SHELF_SIZE);
})();

/* The media for one tile, resolved on the server.
   A photograph when one exists; otherwise a typographic plate.

   NOT DishImage here, and the reason is data rather than taste: DishImage's
   fallback is DishGlyph, which draws a ring from a dish's protein/carbs/fat.
   The à-la-carte menu (lib/menu-alacarte.ts) carries no macros — every one of
   these would render a ring with all three arcs at zero, which is worse than
   no picture because it looks like a bug. The subscription dishes DO carry
   macros and DO use the glyph, in TrialDay.

   The moment a file lands in public/images/dishes/ or /ai/dishes/, this
   returns the photograph instead, with no edit here. */
function media(name: string) {
  const found = findDishImage(dishSlug(name));

  if (found) {
    return (
      <figure style={{ position: "relative", margin: 0, width: "100%", height: "100%" }}>
        <Image src={found.src} alt={name} fill sizes="276px" quality={75} style={{ objectFit: "cover" }} />
        {found.ai && (
          <figcaption className="sr-only">
            Illustrative AI-generated image. Not a photograph of the meal as delivered.
          </figcaption>
        )}
      </figure>
    );
  }

  /* The plate: the dish's own initials, set large. It is not pretending to be
     a photograph — it is a label, and it holds the slot at the right size so
     the shelf's rhythm is identical before and after the shoot. */
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-Za-z]/.test(w))
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join("");

  return (
    <div
      aria-hidden
      style={{
        display: "flex", alignItems: "center", justifyContent: "center",
        width: "100%", height: "100%",
        background: "radial-gradient(120% 100% at 50% 0%, #14140f 0%, #050504 72%)",
        fontFamily: "var(--ff-cond)", fontWeight: 800,
        fontSize: "clamp(38px,6vw,54px)", letterSpacing: "-0.02em",
        color: "#1f1f1b",
      }}
    >
      {initials}
    </div>
  );
}

const SHELF: ShelfDish[] = SHELF_DISHES.map((d) => ({
  id: d.id,
  name: d.name,
  blurb: d.blurb,
  price: d.price!,
  categoryLabel: d.categoryLabel,
  media: media(d.name),
}));

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

        {/* The merchandise. Adding from here puts the dish straight in the
            basket — no navigation, no second decision screen. */}
        <ShopRow dishes={SHELF} />

        {/* The course summary, demoted from a table to one line. It was never
            carrying more than this: what exists, and the floor price. */}
        <p
          style={{
            ...body(13.5), color: DIM, marginTop: 16,
            display: "flex", flexWrap: "wrap", gap: "6px 16px",
          }}
        >
          {COURSES.map((c) => (
            <span key={c.key} style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em" }}>
              <span style={{ color: INK }}>{c.label}</span>{" "}
              {c.count}
              {c.from != null ? ` · ₹${c.from}+` : " · on request"}
            </span>
          ))}
        </p>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/menu" className={s.btn}>
            See all {DISHES.length} dishes
          </Link>
        </div>

        {/* Aggregator channel. The owner confirmed FitFuel is live on both
            platforms today. It sits UNDER the direct-order CTA on purpose:
            ordering direct takes no platform cut (tracker Decision #77 —
            aggregators are an acquisition channel, not the model), but a
            customer already inside those apps should still find us. No store
            URL is hardcoded yet: when the Zomato and Swiggy store links exist,
            wrap each name in a Link to turn it live. */}
        <div
          style={{
            marginTop: "clamp(26px,3.4vw,40px)", paddingTop: 24,
            borderTop: `1px solid ${RULE}`, display: "flex", flexWrap: "wrap",
            alignItems: "center", gap: "14px clamp(18px,3vw,32px)",
          }}
        >
          <span style={{ ...label(), color: DIM }}>Also on</span>
          <span style={{ ...sub("clamp(1.4rem,2.6vw,2rem)"), color: INK }}>Zomato</span>
          <span aria-hidden style={{ color: RULE }}>/</span>
          <span style={{ ...sub("clamp(1.4rem,2.6vw,2rem)"), color: INK }}>Swiggy</span>
          <span style={{ ...body(14), color: DIM, maxWidth: "34ch" }}>
            Search <span style={{ color: INK }}>FitFuel</span> in either app. Ordering direct just
            means more of it reaches the kitchen.
          </span>
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
