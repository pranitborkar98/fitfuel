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
// prices, on the reasoning that a 3-up grid is rejected on sight and that
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
import Aggregators from "./Aggregators";
import { findDishImage, dishSlug } from "./DishImage";
import { MENU } from "@/lib/menu-alacarte";
import { DISHES, dishId, isOrderable } from "@/lib/menu-cart";
import { WRAP, SECTION, RULE, DIM, LIME, display, sub, label } from "./theme";

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

/* FIVE DISHES FROM EVERY COURSE, one rail each — the owner asked for this
   explicitly and the previous version shipped eight dishes total, which read as
   a token sample of a 48-dish menu rather than a menu.

   Priced dishes lead within each course, so the first thing in every rail can
   go straight into a basket; the unpriced ones follow with an enquiry toggle
   rather than being hidden, because they are cooked and on the menu. */
const PER_COURSE = 5;

const COURSE_SHELVES = MENU.map((c) => {
  const items = [...c.items].sort((a, b) => {
    const ao = isOrderable(a) ? 0 : 1;
    const bo = isOrderable(b) ? 0 : 1;
    if (ao !== bo) return ao - bo;
    return (a.price ?? Infinity) - (b.price ?? Infinity);
  });
  return { key: c.key, label: c.label, note: c.note, items: items.slice(0, PER_COURSE) };
});

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

const SHELVES = COURSE_SHELVES.map((c) => ({
  key: c.key,
  label: c.label,
  note: c.note,
  dishes: c.items.map<ShelfDish>((d) => ({
    id: dishId(d.name),
    name: d.name,
    blurb: d.blurb,
    price: isOrderable(d) ? d.price : null,
    categoryLabel: c.label,
    media: media(d.name),
  })),
}));

export default function Hungry() {
  return (
    <section aria-labelledby="hp-hungry" style={{ ...SECTION, borderTop: `1px solid ${RULE}` }}>
      <div style={WRAP}>
        <Idx label="No subscription" />

        {/* Title only, per the owner. The paragraph listed the six courses in
            prose; the shelf below shows them. */}
        <div className={s.trialHead}>
          <h2 id="hp-hungry" style={{ ...display("clamp(2.4rem,6.4vw,5rem)"), maxWidth: "11ch" }}>
            Just hungry? <span style={{ color: LIME }}>Order one meal.</span>
          </h2>

          <Link href="/menu" className={s.btnBig}>
            Browse the menu
            <b>{DISHES.length}</b>
          </Link>
        </div>

        {/* Six rails, one per course, five dishes each. Adding from any of
            them puts the dish straight in the basket. */}
        {SHELVES.map((c, i) => {
          const meta = COURSES.find((x) => x.key === c.key);

          return (
            <section key={c.key} className={s.course} style={{ "--i": i } as React.CSSProperties}>
              <div className={s.courseHead}>
                <h3 style={{ ...sub("clamp(1.35rem,2.4vw,1.9rem)") }}>{c.label}</h3>
                <span style={{ ...label(DIM) }}>
                  {meta?.count} dishes
                  {meta?.from != null ? ` · from ₹${meta.from}` : ""}
                </span>
              </div>
              <ShopRow dishes={c.dishes} label={`${c.label} — order a single dish`} />
            </section>
          );
        })}

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
          <Aggregators />
        </div>
      </div>
    </section>
  );
}
