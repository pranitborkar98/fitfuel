// app/_hp/Areas.tsx
//
// "Do you deliver to me" is the first question a cold visitor has, and on the
// old page it was answered in section eleven by a list of chips.
//
// THE MAP IS PLOTTED, NOT DRAWN. Every mark is projected from the published
// coordinates in areas-data.ts, and the rings are 3, 6 and 9km measured from the
// kitchen. That matters because the shape the marks make is the actual argument
// of this section: one kitchen in Kharadi, a tight cluster, and a deliberate
// decision not to serve the whole city badly. A hand-drawn blob would be a
// picture of that claim; this is the claim.
//
// The projection is equirectangular, which at 18.5°N over a 12km span is under a
// metre off the haversine figure. The rings are 1px hairlines and a metre is
// invisible, so the extra machinery would buy nothing.
//
// COLOUR IS NEVER THE ONLY CHANNEL. The kitchen is the only lime mark AND the
// only square one AND the only one with a label in ink, and the chip list below
// repeats every name as text.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import Idx from "./Idx";
import { AREAS_AT, KITCHEN, offsetKm, distanceKm } from "./areas-data";
import { cutoffLabel } from "@/lib/order-cutoff";
import { WRAP, PANEL, INK, DIM, LIME, RULE, RULE_2, display, body } from "./theme";

/* The viewport, in kilometres from the kitchen. Sized to hold the furthest
   suburb plus a margin, so adding one further out widens the frame rather than
   pushing it off the edge. */
const SPAN = Math.ceil(Math.max(...AREAS_AT.map(distanceKm)) + 1.5);
const W = 1000;
const H = 520;
const sx = (km: number) => W / 2 + (km / SPAN) * (W / 2.35);
const sy = (km: number) => H / 2 - (km / SPAN) * (H / 2.35);

export default function Areas() {
  const rings = [3, 6, 9].filter((r) => r <= SPAN);

  return (
    <section
      aria-labelledby="hp-areas"
      style={{ padding: "clamp(40px,5vw,72px) 0 clamp(56px,7vw,96px)", background: PANEL }}
    >
      <div style={WRAP}>
        <Idx label="Coverage" />

        <div className={v.head}>
          <div className={v.rise}>
            <h2 id="hp-areas" style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "12ch" }}>
              Do we deliver to you?
            </h2>
          </div>
          <p className={v.rise} style={{ ...body(16.5), maxWidth: "48ch" }}>
            Cooked from 04:00 in {KITCHEN}, at your door by 08:00. {AREAS_AT.length + 1} areas,
            one kitchen. We would rather serve east Pune properly than the whole city badly.
          </p>
        </div>

        <figure className={v.map} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          <svg
            viewBox={`0 0 ${W} ${H}`}
            role="img"
            aria-label={`Delivery map: the ${KITCHEN} kitchen and ${AREAS_AT.length} delivered areas of east Pune, all within ${SPAN} kilometres`}
          >
            {/* 2km graticule. */}
            {Array.from({ length: Math.floor(SPAN / 2) * 2 + 1 }, (_, i) => i - Math.floor(SPAN / 2)).map(
              (n) => (
                <g key={`g${n}`}>
                  <line x1={sx(n * 2)} y1={0} x2={sx(n * 2)} y2={H} stroke="#131311" strokeWidth="1" />
                  <line x1={0} y1={sy(n * 2)} x2={W} y2={sy(n * 2)} stroke="#131311" strokeWidth="1" />
                </g>
              ),
            )}

            {rings.map((r) => (
              <g key={r}>
                <circle
                  cx={sx(0)}
                  cy={sy(0)}
                  r={(r / SPAN) * (W / 2.35)}
                  fill="none"
                  stroke={RULE}
                  strokeWidth="1"
                />
                <text
                  x={sx(0) + (r / SPAN) * (W / 2.35) + 6}
                  y={sy(0) - 6}
                  fill={DIM}
                  fontFamily="var(--font-mono), monospace"
                  fontSize="13"
                  letterSpacing="1.4"
                >
                  {r}km
                </text>
              </g>
            ))}

            {AREAS_AT.map((a) => {
              const { x, y } = offsetKm(a);
              return (
                <g key={a.name}>
                  <line
                    x1={sx(0)}
                    y1={sy(0)}
                    x2={sx(x)}
                    y2={sy(y)}
                    stroke={RULE_2}
                    strokeWidth="1"
                  />
                  <circle cx={sx(x)} cy={sy(y)} r="4" fill={INK} />
                  <text
                    x={sx(x) + 9}
                    y={sy(y) + 4}
                    fill={DIM}
                    fontFamily="var(--font-mono), monospace"
                    fontSize="13"
                    letterSpacing="0.8"
                  >
                    {a.name}
                  </text>
                </g>
              );
            })}

            {/* The kitchen: the only square, the only lime, the only ink label. */}
            <rect x={sx(0) - 6} y={sy(0) - 6} width="12" height="12" fill={LIME} />
            <text
              x={sx(0) + 12}
              y={sy(0) + 5}
              fill={INK}
              fontFamily="var(--font-mono), monospace"
              fontSize="14"
              fontWeight="700"
              letterSpacing="1"
            >
              {KITCHEN.toUpperCase()}
            </text>
          </svg>

          <figcaption className={v.mapKey}>
            <span style={{ color: LIME }}>Kitchen</span>
            <span>Delivered area</span>
            <span>Rings at {rings.join(", ")} km</span>
            <span>Grid 2 km</span>
            <span>Plotted from coordinates</span>
          </figcaption>
        </figure>

        <div className={s.chips} style={{ borderTop: 0 }}>
          <span className={`${s.chip} ${s.chipHome}`}>{KITCHEN} · the kitchen</span>
          {AREAS_AT.map((a) => (
            <span key={a.name} className={s.chip}>
              {a.name}
            </span>
          ))}
        </div>

        <div className={s.actions} style={{ marginTop: 26 }}>
          <Link href="/locations" className={s.ghost}>
            Check your pincode
          </Link>
          <Link href="/contact" className={s.link}>
            Not on the list? Tell us where you are
          </Link>
        </div>

        <p style={{ ...body(13.5), color: DIM, marginTop: 20 }}>
          Order by {cutoffLabel()} and you eat the next morning; after that, the morning
          after. Two delivery windows, morning and evening, chosen per plan. Digital plans
          have no delivery at all and are available anywhere in India.
        </p>
      </div>
    </section>
  );
}
