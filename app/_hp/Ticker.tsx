// app/_hp/Ticker.tsx
//
// The scale of the thing, as one moving line.
//
// This is the page's clearest 2026 signal, and it is a technique rather than a
// decoration: the track is scrubbed by `animation-timeline: scroll(root block)`,
// so it moves because YOU scroll and runs backwards when you scroll back up. An
// auto-looping marquee is a 2019 ornament; a scrubbed one is an instrument
// readout, and it costs zero JavaScript.
//
// The list is duplicated once and the keyframe travels exactly -50%, which is
// what makes the loop seamless. Every figure is checkable in the database.
//
// SERVER COMPONENT.

import s from "./hp.module.css";
import { tickerCounts } from "@/lib/site-counts";

/* Figures with no table behind them yet. These are counted by hand from source
   files rather than rows, so they stay literals — but they are segregated here
   so it is obvious at a glance which numbers are measured and which are
   asserted. Anything that CAN be counted is, below. */
const ASSERTED: [string, string][] = [
  ["38", "conditions cooked for"],
  ["59", "training programmes"],
  ["154", "Indian foods per gram"],
  ["18", "body metrics tracked"],
  ["15", "delivery areas"],
];

function Row({ items, ariaHidden }: { items: [string, string][]; ariaHidden?: boolean }) {
  return (
    <div
      style={{ display: "flex", alignItems: "baseline" }}
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {items.map(([n, t]) => (
        <span key={n + t} className={s.tickItem}>
          {n}
          <span>{t}</span>
          <b className={s.tickDot} aria-hidden="true">
            /
          </b>
        </span>
      ))}
    </div>
  );
}

export default async function Ticker() {
  const c = await tickerCounts();

  /* Counted first, asserted after. A count that failed to read is dropped
     rather than back-filled with a remembered number. */
  const counted: [string, string][] = [
    [c.plans, "meal plans"],
    [c.prices, "published prices"],
    [c.exercises, "exercises"],
    [c.supplements, "supplements researched"],
  ]
    .filter((x): x is [number, string] => x[0] !== null)
    .map(([n, t]) => [n.toLocaleString("en-IN"), t]);

  const items: [string, string][] = [...counted, ...ASSERTED];

  return (
    <section className={s.tick} aria-label="FitFuel by the numbers">
      <div className={s.tickTrack}>
        <Row items={items} />
        {/* The duplicate exists only so the -50% travel wraps seamlessly.
            It is hidden from assistive tech so the figures are not read twice. */}
        <Row items={items} ariaHidden />
      </div>
    </section>
  );
}
