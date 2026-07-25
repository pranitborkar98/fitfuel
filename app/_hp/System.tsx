// app/_hp/System.tsx
//
// Six sections of the old page (AppBlock, Diary, Scale, LoopDial, Coach,
// Recalibrate) compressed into one. They were each a full-bleed chapter making
// the same argument at a different zoom level, which is how the page reached 55
// viewports. Compression, not deletion: every claim below is still here, and each
// column links to the page that explains it properly.
//
// Language note: this says "coach", never "AI trainer". The coaching layer is a
// deterministic engine (lib/coach) whose Reason step is rules-based today. The
// conversational trainer is not built, so it is not sold.

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import s from "./hp.module.css";
import { WRAP, SECTION, INK_3, GREEN, display, sub, body, label, figure } from "./theme";

const COLS: { k: string; h: string; p: string; stat: string; statNote: string }[] = [
  {
    k: "Eat",
    h: "It arrives already logged",
    p: "Your FitFuel meals land in the diary with the macros they were weighed to. Everything else — the office samosa, the weekend biryani, the chai — you add from 154 Indian foods, per gram.",
    stat: "154",
    statNote: "Indian foods in the diary",
  },
  {
    k: "Train",
    h: "A programme, not a video library",
    p: "59 programmes across 413 training days, built around your plan and drawing on a 952-exercise library. Sets, reps and the burn feed one net-calorie figure.",
    stat: "952",
    statNote: "exercises, sets and reps set",
  },
  {
    k: "Measure",
    h: "Step on the scale, it fills in eighteen numbers",
    p: "Your Bluetooth scale talks to FitFuel in the browser directly. No companion app, no pairing screen, no typing. Two hardware readings become eighteen tracked metrics.",
    stat: "18",
    statNote: "metrics stored and charted",
  },
  {
    k: "Adjust",
    h: "When you stall, the target moves",
    p: "Weight flat for a week against the rate your goal needs, and your calorie target is recalculated from energy-balance arithmetic on numbers we already hold. You get a recap twice a day and a review every week.",
    stat: "7700",
    statNote: "kcal per kg, the constant behind it",
  },
];

// The real rubric from lib/consistency-score.ts. Published deliberately —
// a score you cannot audit is a score you cannot aim at.
const SCORE: [string, number][] = [
  ["Meals logged, against meals delivered", 40],
  ["Workouts done, against workouts scheduled", 30],
  ["Weekly weigh-in", 10],
  ["Zero skipped meals", 10],
  ["Water logged", 10],
];

export default function System() {
  return (
    <section aria-labelledby="hp-system" style={{ ...SECTION, background: "#ebe6dc" }}>
      <div style={WRAP}>
        <div className={s.reveal}>
          <span style={label(GREEN)}>What happens after the box arrives</span>
          <h2 id="hp-system" style={{ ...display("clamp(2.1rem,4.6vw,3.5rem)"), marginTop: 14, maxWidth: "19ch" }}>
            It watches the week so you do not have to
          </h2>
          <p style={{ ...body(17), marginTop: 18, maxWidth: "58ch" }}>
            The food is the input. This is the rest of the system, and it is included —
            not a second subscription, not five apps that do not talk to each other.
          </p>
        </div>

        <div className={s.system}>
          {COLS.map((c) => (
            <div key={c.k} className={s.systemCell}>
              <span style={label(GREEN)}>{c.k}</span>
              <h3 style={{ ...sub("clamp(1.05rem,1.5vw,1.24rem)") }}>{c.h}</h3>
              <p style={{ ...body(14.5) }}>{c.p}</p>
              <div style={{ marginTop: "auto", paddingTop: 16 }}>
                <div style={figure("clamp(1.5rem,2.4vw,2rem)", GREEN)}>{c.stat}</div>
                <div style={{ ...label(INK_3), fontSize: 10.5, letterSpacing: "0.1em", marginTop: 7 }}>
                  {c.statNote}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* The score, with its maths shown. */}
        <div style={{ marginTop: "clamp(40px,5vw,64px)", display: "grid", gridTemplateColumns: "minmax(0,1fr)", gap: 24 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
            <h3 style={{ ...sub("clamp(1.3rem,2.2vw,1.7rem)"), maxWidth: "24ch" }}>
              One score out of a hundred each week, and here is exactly how it is built
            </h3>
            <span style={figure("clamp(2rem,3.4vw,2.8rem)", GREEN)}>100</span>
          </div>

          <div>
            {SCORE.map(([name, pts]) => (
              <div key={name} className={s.scoreRow}>
                <div>
                  <span style={{ ...body(15) }}>{name}</span>
                  <span className={s.scoreBar} style={{ width: `${pts}%` }} />
                </div>
                <span style={{ ...sub("1.05rem"), color: INK_3, whiteSpace: "nowrap" }}>{pts} pts</span>
              </div>
            ))}
          </div>
        </div>

        <div className={s.actions} style={{ marginTop: 32 }}>
          <Link href="/how-it-works" className={s.btnGhost}>
            How the whole system works <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
