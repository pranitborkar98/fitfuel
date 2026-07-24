// app/_home/OpenMenu.tsx
//
// THE STANCE NOBODY ELSE TAKES.
//
// Two facts, both verified against the live DB and the tracker, neither of
// which was anywhere on the site:
//
// 1. The standard menu cycle is SIXTY days. 115 of the 126 plans carry
//    cycleLengthDays = 60 (7 at 30, 3 at 21, 1 at 9). Two months before a
//    dish comes round again. Every tiffin service in Pune repeats weekly.
//
// 2. The entire menu is PUBLIC. Decision #43 in the master tracker, held in
//    code: `app/plans/[slug]/page.tsx` has no auth() call, no redirect, no
//    blur, no day-gate. "The moat is the system, not the menu. Anyone can
//    Google a weight-loss Indian meal plan. Nobody else gives per-gram
//    tracking, adaptive recalibration and a consistency score on top of
//    daily delivery. Sign-in wall is on the system, never the menu."
//
// That is a competitive stance, not a feature, and stances belong on a
// homepage. It also does real conversion work: the single biggest objection
// to a two-month food commitment is "what will I actually be eating," and
// the answer is one click away with no email required.
//
// Mechanism 13: a sixty-cell grid, one cell per menu day, that fills in
// sequence as the section scrolls. The number 60 stops being a claim and
// becomes something you watch accumulate. Cells stagger via --d.
//
// SERVER COMPONENT.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Reveal from "./Reveal";
import { WRAP, RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "./theme";

const DAYS = 60;

export default function OpenMenu() {
  return (
    <section aria-labelledby="menu-heading" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}` }}>
      <div style={WRAP}>
        <div className="ff-menu-cols">
          <div>
            <Reveal>
              <span style={tag(LIME)}>No signup wall</span>
              <h2 id="menu-heading" style={{ ...huge("clamp(2.4rem,5.8vw,4.8rem)"), maxWidth: "14ch", marginTop: 16 }}>
                Read the menu before you pay
              </h2>
              <p style={{ ...copy(16.5), marginTop: 22, maxWidth: "48ch" }}>
                Every one of the 126 plans publishes its full cycle: every day, every dish,
                every macro. No email gate, no blurred days, no "sign up to see more". If you
                are about to commit two months of your food to us, you should be able to read
                exactly what arrives, first.
              </p>
            </Reveal>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,4vw,52px)", marginTop: "clamp(26px,3vw,40px)" }}>
              {[["60", "day cycle, standard"], ["0", "days behind a login"], ["126", "plans, all public"]].map(([f, l]) => (
                <div key={l}>
                  <div style={{ ...huge("clamp(1.9rem,3vw,2.7rem)"), color: LIME, lineHeight: 0.85 }}>{f}</div>
                  <div style={{ ...copy(13.5), color: DIM, marginTop: 8, maxWidth: "16ch" }}>{l}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: "clamp(28px,3vw,40px)" }}>
              <Link href="/plans/weight-loss-veg" className="ff-a">See a full 60-day menu <ArrowRight size={17} /></Link>
            </div>
          </div>

          {/* Sixty cells, one per menu day, filling as you scroll. The claim
              made countable. Decorative, so it is hidden from assistive tech;
              the figures above carry the same facts as text. */}
          <div className="ff-menu-grid" aria-hidden>
            {Array.from({ length: DAYS }, (_, i) => (
              <span key={i} className="ff-menu-cell" style={{ ["--d" as string]: i }} />
            ))}
          </div>
        </div>

        <p style={{ ...copy(14), color: DIM, marginTop: "clamp(26px,3vw,38px)", maxWidth: "64ch" }}>
          Sixty days is the standard cycle on 115 of the 126 plans. The rest run shorter,
          condition-specific cycles where a tighter rotation is the point.
        </p>
      </div>
    </section>
  );
}
