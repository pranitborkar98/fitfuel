// app/_hp/Readout.tsx
//
// THE READOUT BAR, WELDED TO THE HERO.
//
// DESIGN.md signature device 1: a full-bleed band with a hairline top rule,
// condensed 900 numerals against dim labels. It is also the section that breaks
// the alternating-band rhythm feedback §2.8 complained about, because it has no
// top gap at all against the hero and runs to both viewport edges.
//
// WHAT CHANGED FROM THE OLD ONE. The four cells used to be a figure and a line
// of text each, which is a stat grid wearing the readout's name. Each cell now
// carries the instrument that proves its own number:
//
//   08:00   the delivery day drawn as a 24h rule, cook window to door window
//   Rs 420  the receipt as one stacked bar, segment widths = decomposePrice()
//   15      fourteen delivered areas against the kitchen's own mark
//   FSSAI   the licence number set digit by digit
//
// EVERY FIGURE IS DERIVED, NOT TYPED. The price segments are computed from
// lib/trial-price's TRIAL breakdown, so if pricing moves the bar moves with it
// and cannot drift from the receipt further down the page. The area count is
// AREAS.length from Areas.tsx, so adding a suburb updates both.
//
// NO CATEGORY HUES. The stacked bar steps down the token grey ramp rather than
// colour-coding its four parts: ink for the food, then mute, dim, rule. Lime
// does one job in this band, marking the window the whole promise rests on.
//
// SERVER COMPONENT.

import v from "./v2.module.css";
import { AREAS, KITCHEN } from "./areas-data";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { TRIAL, TRIAL_TOTAL_LABEL } from "@/lib/trial-price";
import { INK, MUTE, DIM, RULE_2, body, label, figure } from "./theme";

/* The day, in hours, so the two marks below are positions rather than magic
   percentages. Cook starts at 04:00, the last box is at a door by 08:00. */
const COOK_FROM = 4;
const DOOR_BY = 8;
const pct = (h: number) => `${(h / 24) * 100}%`;

export default function Readout() {
  /* Shares of the total collected, which is the number on the payment screen.
     Not the subtotal: this cell sits beside "08:00" and "FSSAI", both of which
     survive being checked, so the price beside them has to as well. */
  const t = TRIAL;
  const share = (n: number) => `${(n / t.totalRs) * 100}%`;
  const parts: [string, number, string][] = [
    ["food", t.baseRs, INK],
    ["del", t.deliveryRs, MUTE],
    ["pack", t.packagingRs, DIM],
    ["gst", t.gstRs, RULE_2],
  ];

  return (
    <div className={v.readout}>
      <div className={v.cell}>
        <div style={figure("clamp(1.5rem,3vw,2.4rem)")}>08:00</div>
        <div style={{ ...body(13.5), maxWidth: "none" }}>
          at your door, six mornings a week
        </div>
        <div className={v.cellFoot}>
          <div className={v.day24} aria-hidden="true">
            <i />
            <b style={{ left: pct(COOK_FROM), width: pct(DOOR_BY - COOK_FROM) }} />
          </div>
          <div className={v.scale}>
            <span>00:00</span>
            <b>04:00 cook</b>
            <b>08:00 door</b>
            <span>24:00</span>
          </div>
        </div>
      </div>

      <div className={v.cell}>
        <div style={figure("clamp(1.5rem,3vw,2.4rem)")}>{TRIAL_TOTAL_LABEL}</div>
        <div style={{ ...body(13.5), maxWidth: "none" }}>
          one full day, four meals, all in, nothing to cancel
        </div>
        <div className={v.cellFoot}>
          <div className={v.stack} aria-hidden="true">
            {parts.map(([k, n, c]) => (
              <span key={k} style={{ width: share(n), background: c }} />
            ))}
          </div>
          <div className={v.scale}>
            {parts.map(([k, n]) => (
              <span key={k}>
                {k} {n}
              </span>
            ))}
          </div>
        </div>
      </div>

      <div className={v.cell}>
        <div style={figure("clamp(1.5rem,3vw,2.4rem)")}>{AREAS.length + 1}</div>
        <div style={{ ...body(13.5), maxWidth: "none" }}>
          areas of east Pune, from one kitchen in {KITCHEN}
        </div>
        <div className={v.cellFoot}>
          {/* Not colour alone: the kitchen's mark is the tallest as well as the
              lightest, and both facts are stated in the scale underneath. */}
          <div className={v.ticks} aria-hidden="true">
            <span style={{ height: 18 }} />
            {AREAS.map((a, i) => (
              <span key={a} style={{ height: 8 + (i % 4) * 2, background: RULE_2 }} />
            ))}
          </div>
          <div className={v.scale}>
            <b>{KITCHEN}, the kitchen</b>
            <span>{AREAS.length} delivered</span>
          </div>
        </div>
      </div>

      <div className={v.cell}>
        <div style={figure("clamp(1.5rem,3vw,2.4rem)")}>FSSAI</div>
        <div style={{ ...body(13.5), maxWidth: "none" }}>
          our own licence, not a rented shift
        </div>
        <div className={v.cellFoot}>
          {/* Split for the instrument look, but the whole number is announced
              once to assistive tech rather than as fourteen separate digits. */}
          <div className={v.licence} aria-hidden="true">
            {FSSAI_LICENCE.split("").map((d, i) => (
              <span key={`${d}${i}`}>{d}</span>
            ))}
          </div>
          <span className="sr-only">FSSAI licence {FSSAI_LICENCE}</span>
          <div style={{ ...label(DIM), fontSize: 12, letterSpacing: "0.12em" }}>
            verified against the FSSAI register
          </div>
        </div>
      </div>
    </div>
  );
}
