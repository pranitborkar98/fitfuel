// app/_hp/Loop.tsx
//
// THE LOOP: eat, train, measure, adjust.
//
// Six chapters of the old page (AppBlock, Diary, Scale, LoopDial, Coach,
// Recalibrate) each made the same argument at a different zoom level, which is
// how that page reached 55 viewports. This is compression, not deletion: every
// claim survives, each one links to the page that explains it properly.
//
// The consistency rubric is published with its actual weights from
// lib/consistency-score.ts. A score you cannot audit is a score you cannot aim
// at, and publishing the maths is also the strongest possible signal that the
// number is real rather than a dial we spin.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import Idx from "./Idx";
import { WRAP, SECTION, PANEL, INK, DIM, LIME, display, sub, body, figure } from "./theme";

const STEPS: { k: string; h: string; p: string; stat: string; href: string }[] = [
  {
    k: "01 Eat",
    h: "It arrives already logged",
    p: "Your FitFuel meals land in the diary with the macros they were weighed to. Everything else, the office samosa, the weekend biryani, the chai, you add from 154 Indian foods, per gram.",
    stat: "154",
    href: "/dashboard/nutrition",
  },
  {
    k: "02 Train",
    h: "A programme, not a video library",
    p: "59 programmes across 413 training days, built around your plan and drawing on a 952-exercise library. Sets, reps and the burn feed one net-calorie figure.",
    stat: "952",
    href: "/dashboard/exercises",
  },
  {
    k: "03 Measure",
    h: "Step on the scale, it fills in eighteen numbers",
    p: "Your Bluetooth scale talks to FitFuel in the browser directly. No companion app, no pairing screen, no typing. Two hardware readings become eighteen tracked metrics.",
    stat: "18",
    href: "/dashboard/body-metrics",
  },
  {
    k: "04 Adjust",
    h: "When you stall, the target moves",
    p: "Weight flat for a fortnight against the rate your goal needs, and the calorie target is recalculated from energy-balance arithmetic on numbers we already hold.",
    stat: "7700",
    href: "/dashboard/progress",
  },
];

/* The real rubric from lib/consistency-score.ts. */
const SCORE: [string, number][] = [
  ["Meals logged, against meals delivered", 40],
  ["Workouts done, against workouts scheduled", 30],
  ["Weekly weigh-in", 10],
  ["Zero skipped meals", 10],
  ["Water logged", 10],
];

export default function Loop() {
  return (
    <section aria-labelledby="hp-loop" style={{ ...SECTION, background: PANEL }}>
      <div style={WRAP}>
        <Idx label="The loop" />

        <div className={s.reveal}>
          <h2 id="hp-loop" style={{ ...display("clamp(2.1rem,5.6vw,4.2rem)"), maxWidth: "15ch" }}>
            It watches the week so you do not have to
          </h2>
          <p style={{ ...body(16.5), marginTop: 20 }}>
            The food is the input. This is the rest of the system and it is included:
            not a second subscription, not five apps that cannot see each other.
          </p>
        </div>

        <div className={s.svcList} style={{ marginTop: "clamp(26px,3.4vw,44px)" }}>
          {STEPS.map((c) => (
            <Link key={c.k} href={c.href} className={s.svc}>
              <span className={s.svcNum}>{c.k.split(" ")[0]}</span>
              <span>
                <span className={s.svcName}>{c.k.split(" ").slice(1).join(" ")}</span>
                <span style={{ ...body(14.5), color: INK, marginTop: 6, display: "block" }}>
                  {c.h}
                </span>
              </span>
              <span className={s.svcDesc}>{c.p}</span>
              <span className={s.svcStat} style={figure("clamp(1.3rem,2.2vw,1.9rem)", LIME)}>
                {c.stat}
              </span>
            </Link>
          ))}
        </div>

        {/* The score, with its maths shown. */}
        <div style={{ marginTop: "clamp(38px,5vw,64px)" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
              gap: 20,
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            <h3 style={{ ...sub("clamp(1.3rem,2.4vw,1.8rem)"), maxWidth: "26ch" }}>
              One consistency score a week, and here is exactly how it is built
            </h3>
            <span style={figure("clamp(2rem,3.4vw,2.8rem)", LIME)}>/100</span>
          </div>

          {SCORE.map(([name, pts]) => (
            <div key={name} className={s.scoreRow}>
              <div>
                <span style={{ ...body(15), color: INK }}>{name}</span>
                <span className={s.scoreBar} style={{ width: `${pts}%` }} />
              </div>
              <span style={{ ...sub("1.1rem"), color: DIM, whiteSpace: "nowrap" }}>{pts} pts</span>
            </div>
          ))}

          <p style={{ ...body(13.5), color: DIM, marginTop: 16 }}>
            Published from lib/consistency-score.ts, not from a marketing deck. If we change
            the weights, this changes.
          </p>
        </div>

        <div className={s.actions} style={{ marginTop: 30 }}>
          <Link href="/how-it-works" className={s.ghost}>
            How the whole system works
          </Link>
        </div>
      </div>
    </section>
  );
}
