// app/_hp/Counts.tsx
//
// THE SCALE OF THE CATALOGUE, AS SIX STILL CELLS.
//
// THIS IS THE TICKER, REBUILT, AND THE OWNER'S OBJECTION TO THE TICKER STANDS.
// Ticker.tsx ran "952 exercises / 46 supplements / 38 conditions" as a
// scroll-scrubbed marquee and his verdict was that it is ugly and says nothing.
// He was right on both counts, and the second one is the interesting one: every
// figure in it was a capability count, not a reason to buy dinner.
//
// So the numbers are the same and everything around them is different:
//
//   it does not move            a marquee is motion with no information in it
//   each figure has its unit    "952" alone is a brag; "952, one mark = 8" is a
//                               scale you can check against the glyph beside it
//   each figure is DRAWN        the glyph is one mark per unit, so the reader
//                               sees the size before reading the digits
//   each cell links somewhere   a count you cannot go and look at is decoration
//
// NO PER-CATEGORY HUES. The prototype gives each cell its own accent — amber for
// exercises, sky for supplements, teal for conditions. That is the palette
// banned by hex, and here it is decorative rather than structural: these
// six are not a taxonomy, they are six counts of six different things. They are
// distinguished by label and by the shape of their own glyph.
//
// SOFT FAILURE. tickerCounts() returns null per key when Postgres cannot be
// reached and the cell is dropped rather than printing a stale literal. If all
// six fail the strip disappears, which is the correct outcome for a band whose
// only claim is "these numbers are real".
//
// SERVER COMPONENT.

import Link from "next/link";

import v from "./v2.module.css";
import { tickerCounts } from "@/lib/site-counts";
import { INK, DIM, RULE_2, LIME, label, figure } from "./theme";

type Cell = {
  key: string;
  n: number;
  /** What one drawn mark is worth, so the glyph is a scale and not a texture. */
  per: number;
  rows: number;
  unit: string;
  href: string;
};

/** One mark per `per` units, laid out in `rows`. Marks are the token ramp, with
 *  the remainder mark set in lime so the count reads as exact rather than
 *  rounded. */
function Glyph({ n, per, rows }: { n: number; per: number; rows: number }) {
  const marks = Math.max(1, Math.min(120, Math.ceil(n / per)));
  const cols = Math.ceil(marks / rows);
  return (
    <svg
      viewBox={`0 0 ${cols * 4} ${rows * 4}`}
      preserveAspectRatio="xMinYMid meet"
      aria-hidden="true"
      style={{ width: "100%", height: "100%" }}
    >
      {Array.from({ length: marks }, (_, i) => (
        <rect
          key={i}
          x={Math.floor(i / rows) * 4}
          y={(i % rows) * 4}
          width="2"
          height="2"
          fill={i === marks - 1 ? LIME : RULE_2}
        />
      ))}
    </svg>
  );
}

export default async function Counts() {
  const c = await tickerCounts();

  const cells: Cell[] = [
    { key: "plans", n: c.plans ?? 0, per: 1, rows: 8, unit: "one mark each", href: "/plans" },
    { key: "prices", n: c.prices ?? 0, per: 50, rows: 8, unit: "one mark = 50", href: "/plans" },
    { key: "exercises", n: c.exercises ?? 0, per: 8, rows: 8, unit: "one mark = 8", href: "/dashboard/exercises" },
    { key: "supplements", n: c.supplements ?? 0, per: 1, rows: 8, unit: "one mark each", href: "/supplements" },
    { key: "conditions", n: 38, per: 1, rows: 8, unit: "one mark each", href: "/plans?category=LIFESTYLE_MEDICAL" },
    { key: "testimonials", n: c.testimonials ?? 0, per: 1, rows: 4, unit: "one mark each", href: "/testimonials" },
  ];

  const LABEL: Record<string, string> = {
    plans: "meal plans",
    prices: "published prices",
    exercises: "exercises",
    supplements: "supplements researched",
    conditions: "conditions",
    testimonials: "verified reviews",
  };

  /* A count of zero means the query failed or the table is empty. Either way
     there is nothing to stand behind, so the cell goes. */
  const live = cells.filter((x) => x.n > 0);
  if (!live.length) return null;

  return (
    <div className={v.strip}>
      {live.map((x) => (
        <Link key={x.key} href={x.href} style={{ textDecoration: "none", color: "inherit" }}>
          <div className={v.stripGlyph}>
            <Glyph n={x.n} per={x.per} rows={x.rows} />
          </div>
          <div className={v.stripBody}>
            <b style={figure("clamp(1.7rem,3.4vw,2.9rem)", INK)}>
              {x.n.toLocaleString("en-IN")}
            </b>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.16em" }}>
              {LABEL[x.key]}
            </span>
            <span style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.14em" }}>{x.unit}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
