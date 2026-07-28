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

const ITEMS: [string, string][] = [
  ["126", "meal plans"],
  ["3,614", "published prices"],
  ["38", "conditions cooked for"],
  ["952", "exercises"],
  ["59", "training programmes"],
  ["46", "supplements researched"],
  ["154", "Indian foods per gram"],
  ["18", "body metrics tracked"],
  ["15", "delivery areas"],
];

function Row({ ariaHidden }: { ariaHidden?: boolean }) {
  return (
    <div
      style={{ display: "flex", alignItems: "baseline" }}
      aria-hidden={ariaHidden ? "true" : undefined}
    >
      {ITEMS.map(([n, t]) => (
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

export default function Ticker() {
  return (
    <section className={s.tick} aria-label="FitFuel by the numbers">
      <div className={s.tickTrack}>
        <Row />
        {/* The duplicate exists only so the -50% travel wraps seamlessly.
            It is hidden from assistive tech so the figures are not read twice. */}
        <Row ariaHidden />
      </div>
    </section>
  );
}
