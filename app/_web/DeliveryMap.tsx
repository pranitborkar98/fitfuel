// app/_web/DeliveryMap.tsx
//
// "DO WE DELIVER TO YOU" IS THE FIRST QUESTION A COLD VISITOR HAS.
//
// The homepage answered it with a text table of eight drop times, and the one
// artefact that answers it properly — app/_hp/Areas.tsx, a map plotted from the
// published coordinates in areas-data.ts — was reachable only by tapping the
// location chip, as a full-screen sheet. Most people never tap it.
//
// THIS IS NOT THAT COMPONENT REMOUNTED. Areas.tsx renders at v2 scale: a
// 1000x520 map inside a full-bleed panel under a clamp(2.4rem, 6.6vw, 5.4rem)
// heading, correct for a page read once and wrong in a band someone scrolls
// past on their third visit. Same rule HomeBands.tsx followed — the content is
// rebuilt at app density on --fk-* tokens. THE DATA IS THE SAME MODULE, which
// is the part that matters: add a suburb to areas-data.ts and it appears here,
// in the sheet, and in the count, with no code change anywhere.
//
// WHY A PLOTTED MAP RATHER THAN A DRAWN ONE. Every mark is projected from the
// suburb's own published centroid and the rings are 3, 6 and 9km measured from
// the kitchen, so the SHAPE the marks make is the actual argument: one kitchen
// in Kharadi, a tight cluster, and a deliberate decision not to serve the whole
// city badly. A hand-drawn blob would be a picture of that claim. This is the
// claim.
//
// COLOUR IS NEVER THE ONLY CHANNEL. The kitchen is the only lime mark AND the
// only square one AND the only one whose label is in ink; every other name is
// also printed as text in the list beside it.
//
// No hooks, no state — it renders identically on the server and the client.

import { AREAS_AT, KITCHEN, KITCHEN_AT, distanceKm, offsetKm } from "@/app/_hp/areas-data";

import s from "./app.module.css";

/* The viewport in kilometres, sized to hold the furthest suburb plus a margin,
   so adding one further out widens the frame rather than pushing it off the
   edge. */
const SPAN = Math.ceil(Math.max(...AREAS_AT.map(distanceKm)) + 1.5);
const W = 720;
const H = 420;
/* 2.35 rather than 2 leaves a gutter for the labels, which sit to the right of
   their mark and would otherwise be cut off at the frame. */
const px = (km: number) => W / 2 + (km / SPAN) * (W / 2.35);
const py = (km: number) => H / 2 - (km / SPAN) * (H / 2.35);

export default function DeliveryMap() {
  const rings = [3, 6, 9].filter((r) => r <= SPAN);
  const grid = Array.from(
    { length: Math.floor(SPAN / 2) * 2 + 1 },
    (_, i) => i - Math.floor(SPAN / 2),
  );

  return (
    <figure className={s.map}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={
          `Delivery map: the ${KITCHEN} kitchen and ${AREAS_AT.length} delivered ` +
          `areas of east Pune, all within ${SPAN} kilometres. Every area is also ` +
          `listed as text below.`
        }
      >
        {grid.map((n) => (
          <g key={`g${n}`}>
            <line x1={px(n * 2)} y1={0} x2={px(n * 2)} y2={H} className={s.mapGrid} />
            <line x1={0} y1={py(n * 2)} x2={W} y2={py(n * 2)} className={s.mapGrid} />
          </g>
        ))}

        {rings.map((r) => (
          <g key={r}>
            <circle
              cx={px(0)}
              cy={py(0)}
              r={(r / SPAN) * (W / 2.35)}
              fill="none"
              className={s.mapRing}
            />
            <text
              x={px(0) + (r / SPAN) * (W / 2.35) + 5}
              y={py(0) - 5}
              className={s.mapRingLabel}
            >
              {r}km
            </text>
          </g>
        ))}

        {AREAS_AT.map((a) => {
          const { x, y } = offsetKm(a);
          return (
            <g key={a.name}>
              {/* The spoke is what makes "one kitchen" legible rather than
                  stated — every area is measured from the same point. */}
              <line x1={px(0)} y1={py(0)} x2={px(x)} y2={py(y)} className={s.mapSpoke} />
              <circle cx={px(x)} cy={py(y)} r="3.5" className={s.mapDot} />
              <text x={px(x) + 7} y={py(y) + 3.5} className={s.mapLabel}>
                {a.name}
              </text>
            </g>
          );
        })}

        {/* The kitchen: the only square, the only lime, the only ink label. */}
        <rect
          x={px(0) - 5}
          y={py(0) - 5}
          width="10"
          height="10"
          className={s.mapKitchen}
        />
        <text x={px(0) + 10} y={py(0) + 4} className={s.mapKitchenLabel}>
          {KITCHEN}
        </text>
      </svg>

      <figcaption className={s.mapCap}>
        <span className={s.mapCapKitchen}>Kitchen</span>
        <span>{AREAS_AT.length} delivered areas</span>
        <span>Rings at 3, 6 and 9 km</span>
        <span>Grid 2 km</span>
        <span>
          Plotted from published coordinates, {KITCHEN_AT.lat}°N {KITCHEN_AT.lng}°E
        </span>
      </figcaption>
    </figure>
  );
}
