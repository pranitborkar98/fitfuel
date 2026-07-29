// app/_hp/More.tsx
//
// EVERYTHING ELSE THE BUSINESS RUNS, in one band instead of eight sections.
//
// This resolves a real contradiction in the brief. The owner asked, correctly,
// that nothing the business has built be invisible on the homepage — the app,
// the coach, the 952-exercise library, supplements, corporate, partners,
// franchise, digital plans. Two outside reviews then said, also correctly, that
// eight more sections about systems is what buries the food.
//
// Both are right, and the resolution is that BREADTH DOES NOT REQUIRE
// CHAPTERS. Everything below is still reachable in one click from the
// homepage; none of it gets to stand in front of a person deciding what to eat
// tomorrow. Each destination is a real page that explains itself properly.
//
// This replaces Loop, Coach, Inside, Supplements, Corporate and Network as
// full sections. Those components still exist on disk and each one's content
// lives on the page it links to.
//
// SERVER COMPONENT.

import type { CSSProperties } from "react";
import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, PANEL, INK, DIM, LIME, display, sub, body } from "./theme";

const CELLS: { href: string; name: string; what: string; stat: string }[] = [
  {
    href: "/dashboard/nutrition",
    name: "The diary",
    what: "Your meals arrive pre-logged. Anything else you eat, you add per gram from an Indian food database.",
    stat: "154 foods",
  },
  {
    href: "/dashboard/exercises",
    name: "Training",
    what: "A programme built around your plan, not a video library you scroll through.",
    stat: "952 exercises",
  },
  {
    href: "/dashboard/body-metrics",
    name: "Body metrics",
    what: "Your Bluetooth scale talks to FitFuel in the browser. No companion app, no typing.",
    stat: "18 metrics",
  },
  {
    href: "/dashboard/progress",
    name: "The coach",
    what: "Spots a plateau, recalculates your target from your own numbers, and shows the arithmetic.",
    stat: "7700 kcal/kg",
  },
  {
    href: "/supplements",
    name: "Supplements",
    what: "Researched properly, bought at Nutrabay. We hold no stock and own no supplement brand.",
    stat: "46 researched",
  },
  {
    href: "/corporate",
    name: "Corporate",
    what: "Your whole team, personalised per employee, on one GST invoice.",
    stat: "One invoice",
  },
  {
    href: "/partners",
    name: "Partners",
    what: "Gyms, trainers, dieticians, doctors, offices and residences. Commission, tracked in your own console.",
    stat: "8 types",
  },
  {
    href: "/dashboard/referrals",
    name: "Refer a friend",
    what: "Rs 500 credit to you, Rs 500 off for them, paid when their first order completes.",
    stat: "Rs 500",
  },
  {
    href: "/tdee-calculator",
    name: "TDEE calculator",
    what: "Free, no account, no email. Work out your numbers before you decide anything.",
    stat: "Free",
  },
];

export default function More() {
  return (
    <section aria-labelledby="hp-more" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="Everything else we run" />

        <div className={`${s.duo} ${s.reveal}`}>
          <h2 id="hp-more" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "14ch" }}>
            The food is the front of a much bigger thing
          </h2>
          <p style={{ ...body(16.5) }}>
            All of it is included with a plan and none of it is a second subscription. It
            gets one line each here rather than a chapter, because you came to find out
            about dinner.
          </p>
        </div>

        <div className={`${s.more} ${s.deep}`} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {CELLS.map((c, i) => (
            <Link
              key={c.href}
              href={c.href}
              className={`${s.moreCell} ${s.stagger} ${s.lift}`}
              style={{ "--i": i % 3 } as CSSProperties}
            >
              <h3 style={{ ...sub("clamp(1.05rem,1.6vw,1.25rem)") }}>{c.name}</h3>
              <p style={{ ...body(14), marginTop: 9 }}>{c.what}</p>
              <span style={{ ...body(14), color: LIME, marginTop: 12, display: "block", fontWeight: 600 }}>
                {c.stat}
              </span>
            </Link>
          ))}
        </div>

        <p style={{ ...body(14), color: DIM, marginTop: 20 }}>
          Want to run a FitFuel kitchen in your city?{" "}
          <Link href="/contact" style={{ color: INK }}>
            Talk to us
          </Link>
          .
        </p>
      </div>
    </section>
  );
}
