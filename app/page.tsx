"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE / "LAB DOSSIER" art direction (see DESIGN.md)
   Measured, flush-left, near-flat, data-first. Mono is the signature.
   Colour is rationed: lime does one job per section. No glows, no
   gradients, no glassmorphism, no centered card grids. Hairlines and
   whitespace carry the design. No em dashes.
══════════════════════════════════════════════════════════════════ */

const BG = "#080808";
const PANEL = "#0c0c0c";
const HAIR = "#1e1e1e";
const HAIR2 = "#2a2a2a";
const TXT = "#f5f5f4";
const MUTE = "#8a8a86";
const DIM = "#5a5a57";
const LIME = "#84cc16";
const LIME_LT = "#a3e635";

const BARLOW = "'Barlow Condensed','Arial Narrow',sans-serif";
const MONO = "ui-monospace,'SF Mono',SFMono-Regular,Menlo,'Cascadia Mono',Consolas,monospace";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: CSSProperties = { width: "100%", maxWidth: 1180, margin: "0 auto", padding: "0 clamp(20px,4vw,40px)" };

/* ─── primitives ─── */
function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.6, ease: EASE, delay }} style={style}>
      {children}
    </motion.div>
  );
}
const mono = (size = 11, color = DIM): CSSProperties => ({ fontFamily: MONO, fontSize: size, letterSpacing: "0.14em", textTransform: "uppercase", color });
const display = (size: string): CSSProperties => ({ fontFamily: BARLOW, fontWeight: 800, fontSize: size, lineHeight: 0.92, letterSpacing: "-0.01em", textTransform: "uppercase", color: TXT, margin: 0 });

function IndexHeader({ n, label, right }: { n: string; label: string; right?: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 40 }}>
      <span style={{ ...mono(11, LIME), letterSpacing: "0.18em" }}>[ {n} ]</span>
      <span style={mono(11, MUTE)}>{label}</span>
      <span style={{ flex: 1, height: 1, background: HAIR }} />
      {right ? <span style={mono(11, DIM)}>{right}</span> : null}
    </div>
  );
}
function FullRule() { return <div style={{ height: 1, background: HAIR, width: "100%" }} />; }

/* ─── data ─── */
const GOALS = [
  { key: "weight-loss", label: "Lose fat", note: "Deficit, keeps muscle" },
  { key: "muscle-gain", label: "Build muscle", note: "High-protein surplus" },
  { key: "balanced", label: "Eat balanced", note: "Clean maintenance" },
];
const DIETS = [{ key: "veg", label: "Veg" }, { key: "egg", label: "Egg" }, { key: "non-veg", label: "Non-Veg" }, { key: "jain", label: "Jain" }];
const GOAL_NAME: Record<string, string> = { "weight-loss": "Weight Loss", "muscle-gain": "Muscle Gain", "balanced": "Balanced" };

export default function Home() {
  return (
    <div style={{ background: BG, color: TXT, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>
      <Hero />
      <Moat />
      <Loop />
      <Verified />
      <Instrumentation />
      <Products />
      <Coach />
      <Membership />
      <BuiltFor />
      <Franchise />
      <Finder />
      <Referral />
      <Roadmap />
      <FieldReports />
      <Kitchen />
      <Cta />
      <style>{`
        @keyframes ff-tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ff-ticker { animation: ff-tick 60s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ff-ticker { animation: none; } }
        .ff-row:hover { background: #0b0b0b; }
        .ff-link { color: ${LIME_LT}; text-decoration: none; border-bottom: 1px solid ${HAIR2}; padding-bottom: 2px; transition: border-color .2s; }
        .ff-link:hover { border-color: ${LIME}; }
        .ff-solid:hover { background: ${LIME_LT} !important; }
        .ff-goal:hover, .ff-diet:hover { border-color: ${HAIR2} !important; }
      `}</style>
    </div>
  );
}

/* ═══ HERO / masthead ═══ */
function Hero() {
  const meta = ["FITFUEL", "VERIFIED-INTAKE HEALTH OS", "PUNE · IN", "EST. 2019"];
  return (
    <section style={{ paddingTop: 96 }}>
      {/* masthead meta strip */}
      <div style={{ borderBottom: `1px solid ${HAIR}` }}>
        <div style={{ ...WRAP, display: "flex", flexWrap: "wrap", justifyContent: "space-between", gap: 8, padding: "13px clamp(20px,4vw,40px)" }}>
          {meta.map((m, i) => <span key={m} style={mono(10.5, i === 0 ? TXT : DIM)}>{m}</span>)}
        </div>
      </div>

      <div style={{ ...WRAP, paddingTop: "clamp(48px,8vw,90px)", paddingBottom: "clamp(40px,6vw,72px)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)", gap: "clamp(32px,5vw,64px)", alignItems: "end" }} className="ff-hero-grid">
          {/* headline */}
          <Reveal>
            <div style={{ ...mono(11, DIM), marginBottom: 22 }}>001 / THE THESIS</div>
            <h1 style={display("clamp(2.9rem,8vw,6.4rem)")}>
              We don&apos;t guess<br />what you ate.<br /><span style={{ color: LIME }}>We cooked it.</span>
            </h1>
            <p style={{ fontSize: "clamp(1rem,1.6vw,1.18rem)", color: MUTE, lineHeight: 1.6, maxWidth: "48ch", marginTop: 26 }}>
              Every app asks you to log your food and trusts you to be honest. FitFuel cooks each meal in its own
              Pune kitchen, tracks the macros to the gram, and recalibrates when you plateau. Intake you can verify,
              not a number you typed in.
            </p>
            <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginTop: 34 }}>
              <Link href="/plans" className="ff-solid" style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, background: LIME, color: "#000", textDecoration: "none", padding: "14px 22px", transition: "background .2s" }}>Explore 126 plans</Link>
              <a href="#loop" className="ff-link" style={{ ...mono(12, LIME_LT) }}>See the system ↓</a>
            </div>
          </Reveal>

          {/* readout instrument */}
          <Reveal delay={0.12}>
            <Readout />
          </Reveal>
        </div>
      </div>

      <Ticker />
      <style>{`@media (max-width: 860px){ .ff-hero-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

function Readout() {
  const rows = [
    { k: "Intake", v: "1,842", u: "kcal", bars: 9 },
    { k: "Burn", v: "410", u: "kcal", bars: 3 },
  ];
  return (
    <div style={{ border: `1px solid ${HAIR2}`, background: PANEL }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 16px", borderBottom: `1px solid ${HAIR}` }}>
        <span style={mono(10.5, MUTE)}>Daily Readout</span>
        <span style={{ ...mono(10, LIME_LT), display: "inline-flex", alignItems: "center", gap: 7 }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: LIME }} />Live</span>
      </div>
      <div style={{ padding: "6px 16px" }}>
        {rows.map((r) => (
          <div key={r.k} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 0", borderBottom: `1px solid ${HAIR}` }}>
            <span style={mono(11, MUTE)}>{r.k}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "flex", gap: 2 }}>{[...Array(10)].map((_, i) => <span key={i} style={{ width: 3, height: 12, background: i < r.bars ? DIM : "#161616" }} />)}</span>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 22, color: TXT, minWidth: 62, textAlign: "right" }}>{r.v}</span>
              <span style={mono(9.5, DIM)}>{r.u}</span>
            </span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0 14px" }}>
          <span style={mono(11, LIME_LT)}>Net</span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 40, color: LIME, lineHeight: 1 }}>1,432</span>
            <span style={mono(10, DIM)}>/ 1,450 kcal</span>
          </span>
        </div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 16px", borderTop: `1px solid ${HAIR}` }}>
        <span style={mono(10, DIM)}>Consistency</span>
        <span style={mono(10, MUTE)}>92 / 100</span>
      </div>
    </div>
  );
}

function Ticker() {
  const items = ["Weight Loss", "Muscle Gain", "PCOS", "Diabetic", "Thyroid", "Heart", "Gut Health", "Fertility", "Anti-Aging", "Cricket", "Keto Indian", "Hair Health", "Hypertension", "Endurance", "Quit Smoking", "Jain", "Anaemia", "Fatty Liver"];
  const row = [...items, ...items];
  return (
    <div style={{ borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, overflow: "hidden", background: "#060606" }}>
      <div className="ff-ticker" style={{ display: "flex", gap: 0, width: "max-content", padding: "11px 0" }}>
        {row.map((it, i) => (
          <span key={i} style={{ ...mono(10.5, i % 6 === 0 ? MUTE : DIM), padding: "0 22px", borderRight: `1px solid ${HAIR}`, whiteSpace: "nowrap" }}>{it}</span>
        ))}
      </div>
    </div>
  );
}

/* ═══ 001 THE MOAT ═══ */
function Moat() {
  const rows = [
    { who: "Tiffin service", owns: "Cooks the food", miss: "No macros. No tracking. No idea if it moved you." },
    { who: "Fitness app", owns: "Tracks the numbers", miss: "You self-report. Honest logging is a guess." },
    { who: "Supplement brand", owns: "Sells the pills", miss: "No plan, no context, no link to your food." },
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="002" label="The Moat" right="Verified intake" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "18ch" }}>
            The meal is the door. The <span style={{ color: LIME }}>data loop</span> is the product.
          </h2>
        </Reveal>
        <Reveal delay={0.08} style={{ marginTop: 48 }}>
          <div style={{ border: `1px solid ${HAIR}` }}>
            <div style={{ display: "grid", gridTemplateColumns: "minmax(120px,1fr) minmax(120px,1fr) minmax(0,2fr)", ...mono(10, DIM), background: "#060606", borderBottom: `1px solid ${HAIR}` }}>
              <span style={{ padding: "11px 16px" }}>Category</span>
              <span style={{ padding: "11px 16px" }}>Owns</span>
              <span style={{ padding: "11px 16px" }}>What it misses</span>
            </div>
            {rows.map((r) => (
              <div key={r.who} className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(120px,1fr) minmax(120px,1fr) minmax(0,2fr)", borderBottom: `1px solid ${HAIR}`, transition: "background .15s" }}>
                <span style={{ padding: "18px 16px", fontFamily: BARLOW, fontWeight: 700, fontSize: 19, textTransform: "uppercase", color: TXT }}>{r.who}</span>
                <span style={{ padding: "18px 16px", fontSize: 14, color: MUTE, alignSelf: "center" }}>{r.owns}</span>
                <span style={{ padding: "18px 16px", fontSize: 14, color: MUTE, alignSelf: "center" }}>{r.miss}</span>
              </div>
            ))}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "20px 16px", background: "rgba(132,204,22,0.04)" }}>
              <span style={mono(11, LIME)}>FitFuel</span>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.1rem,2.4vw,1.7rem)", textTransform: "uppercase", color: TXT }}>Runs all three as one system.</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 002 THE DAILY LOOP ═══ */
function Loop() {
  const steps = [
    ["Onboard", "Body, goal, diet and condition. We compute exact calories and macros (Mifflin-St Jeor)."],
    ["Cook", "Your plan is cooked fresh in our Pune kitchen from 04:00, portioned to your macros."],
    ["Deliver", "Hot at your door by 08:00, six days a week. Tracked kitchen to doorstep."],
    ["Log", "Tap 'I ate this'. It auto-writes to your diary with measured macros. Nothing to count."],
    ["Train", "A workout linked to your plan, not random. Burned calories feed the net-calorie ring."],
    ["Weigh in", "Weekly weigh-in trends your weight. Flat for two weeks flags a plateau automatically."],
    ["Recalibrate", "Plateau detected. Target drops, the plan adapts. It changes as your body changes."],
    ["Score", "Meals, workouts, water and weigh-ins roll into a 0 to 100 consistency score."],
  ];
  return (
    <section id="loop" style={{ padding: "clamp(72px,10vw,120px) 0", background: "#060606", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <IndexHeader n="003" label="The Daily Loop" right="Runs every day" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "16ch", marginBottom: 44 }}>The engine that runs every single day</h2>
        </Reveal>
        <div>
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 4) * 0.04}>
              <div className="ff-row" style={{ display: "grid", gridTemplateColumns: "56px minmax(120px,220px) minmax(0,1fr)", gap: "clamp(10px,2vw,28px)", alignItems: "baseline", padding: "22px 8px", borderTop: `1px solid ${HAIR}`, transition: "background .15s" }}>
                <span style={mono(13, LIME)}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.3rem,2.6vw,1.8rem)", textTransform: "uppercase", color: TXT }}>{t}</span>
                <span style={{ fontSize: 14.5, color: MUTE, lineHeight: 1.55 }}>{d}</span>
              </div>
            </Reveal>
          ))}
          <div style={{ borderTop: `1px solid ${HAIR}`, paddingTop: 22 }}>
            <span style={mono(12, DIM)}>{"↻"} Then it repeats, sharper every week.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 003 VERIFIED VS SELF-REPORTED ═══ */
function Verified() {
  const cols = ["Tiffin", "App", "Supp.", "FitFuel"];
  const rows: [string, boolean[]][] = [
    ["Cooks your food fresh, daily", [true, false, false, true]],
    ["Tracks every gram automatically", [false, false, false, true]],
    ["Adapts targets on a plateau", [false, false, false, true]],
    ["126 condition-specific plans", [false, false, false, true]],
    ["Consistency score on real data", [false, false, false, true]],
    ["Coaches on what actually happened", [false, false, false, true]],
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="004" label="Verified vs Self-Reported" />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)", gap: "clamp(28px,5vw,60px)", alignItems: "start" }} className="ff-verify-grid">
          <Reveal>
            <h2 style={{ ...display("clamp(2rem,4.6vw,3.4rem)"), maxWidth: "14ch" }}>Measured, not typed in</h2>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginTop: 22, maxWidth: "42ch" }}>
              When we cook every meal, the macros are measured. That closed loop is the one thing a tiffin, an app
              or a supplement brand cannot copy. The moat is not software. It is owning the plate.
            </p>
            <a href="/how-it-works" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block", marginTop: 24 }}>Read the method →</a>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ border: `1px solid ${HAIR}` }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) repeat(4, minmax(40px,1fr))", background: "#060606", borderBottom: `1px solid ${HAIR}` }}>
                <span />
                {cols.map((c, i) => <span key={c} style={{ ...mono(9.5, i === 3 ? "#000" : DIM), padding: "12px 4px", textAlign: "center", background: i === 3 ? LIME : "transparent" }}>{c}</span>)}
              </div>
              {rows.map(([label, marks], ri) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) repeat(4, minmax(40px,1fr))", borderBottom: ri < rows.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <span style={{ padding: "14px 14px", fontSize: 13, color: MUTE }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "14px 4px", textAlign: "center", ...mono(12, m ? (ci === 3 ? LIME : MUTE) : "#333"), background: ci === 3 ? "rgba(132,204,22,0.05)" : "transparent" }}>{m ? "✓" : "·"}</span>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
      <style>{`@media (max-width: 820px){ .ff-verify-grid{ grid-template-columns: 1fr !important; } }`}</style>
    </section>
  );
}

/* ═══ 004 INSTRUMENTATION (inside the app) ═══ */
function Instrumentation() {
  const tools: [string, string, string][] = [
    ["IN-01", "Meal logging", "Tap 'I ate this'. Auto-writes to your diary with exact macros."],
    ["IN-02", "Net-calorie engine", "Calories in, minus calories burned, against your target. One live ring."],
    ["IN-03", "Water intake", "Log every glass, hit your daily hydration goal beside your food."],
    ["IN-04", "Today's workout", "A session linked to your plan type, not a random routine."],
    ["IN-05", "Workout logger", "Sets, reps and weight from an 800+ exercise library. Burn feeds the ring."],
    ["IN-06", "Body metrics", "Weight, body fat, muscle, BMI and more, trended over time."],
    ["IN-07", "Progress charts", "Weight trend, macro history and consistency. Plateaus surface early."],
    ["IN-08", "Consistency score", "One 0 to 100 signal that drives your recalibration."],
    ["IN-09", "Coach + digest", "Morning preview, evening recap, and a Sunday digest of your week."],
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0", background: "#060606", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <IndexHeader n="005" label="Instrumentation" right="Inside the app" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "18ch", marginBottom: 12 }}>Every gram, every rep, every glass. Tracked.</h2>
          <p style={{ fontSize: 15, color: MUTE, maxWidth: "52ch", lineHeight: 1.6, marginBottom: 44 }}>Your meals come with a full health app. Not a step counter bolted on, but a connected system where food, movement, water and weight feed one another.</p>
        </Reveal>
        <div style={{ borderTop: `1px solid ${HAIR}` }}>
          {tools.map(([code, t, d], i) => (
            <Reveal key={code} delay={(i % 3) * 0.04}>
              <div className="ff-row" style={{ display: "grid", gridTemplateColumns: "72px minmax(140px,240px) minmax(0,1fr)", gap: "clamp(10px,2vw,26px)", alignItems: "baseline", padding: "20px 8px", borderBottom: `1px solid ${HAIR}`, transition: "background .15s" }}>
                <span style={mono(11, DIM)}>{code}</span>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.2rem,2.4vw,1.6rem)", textTransform: "uppercase", color: TXT }}>{t}</span>
                <span style={{ fontSize: 14, color: MUTE, lineHeight: 1.55 }}>{d}</span>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 30 }}>
          <a href="/how-it-works" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block" }}>See the full system →</a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 005 THREE PRODUCTS ═══ */
function Products() {
  const p = [
    { n: "01", t: "The kitchen", tag: "MEALS", specs: ["126 goal + condition plans", "Chef-cooked, macro-portioned", "Delivered daily across Pune"], href: "/plans", cta: "Meal plans" },
    { n: "02", t: "The app", tag: "MOVEMENT", specs: ["800+ exercise library", "Net-calorie + body metrics", "Progress + consistency"], href: "/how-it-works", cta: "Inside the app" },
    { n: "03", t: "The stack", tag: "NUTRABAY", specs: ["Condition-matched doses", "Educational, not a wall of pills", "Ordered via Nutrabay"], href: "/supplements", cta: "Supplements" },
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="006" label="Three Products, One System" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", borderTop: `1px solid ${HAIR}`, borderLeft: `1px solid ${HAIR}` }}>
          {p.map((x) => (
            <Reveal key={x.t}>
              <Link href={x.href} className="ff-row" style={{ display: "block", padding: "30px 26px", borderRight: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, textDecoration: "none", height: "100%", transition: "background .15s" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <span style={mono(12, DIM)}>{x.n}</span>
                  <span style={mono(10, LIME_LT)}>{x.tag}</span>
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.7rem,3vw,2.3rem)", textTransform: "uppercase", color: TXT, margin: "0 0 20px" }}>{x.t}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
                  {x.specs.map((s) => (
                    <div key={s} style={{ display: "flex", gap: 10, alignItems: "baseline" }}>
                      <span style={{ width: 5, height: 5, background: LIME, flexShrink: 0, transform: "translateY(-2px)" }} />
                      <span style={{ fontSize: 13.5, color: MUTE }}>{s}</span>
                    </div>
                  ))}
                </div>
                <span style={{ ...mono(11, LIME_LT), display: "inline-flex", alignItems: "center", gap: 6 }}>{x.cta} <ArrowUpRight size={13} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 006 THE COACH ═══ */
function Coach() {
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0", background: "#060606", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <IndexHeader n="007" label="The Coach" right="Luxury · in development" />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: "clamp(28px,5vw,60px)", alignItems: "start" }} className="ff-verify-grid">
          <Reveal>
            <h2 style={{ ...display("clamp(2rem,4.6vw,3.4rem)"), maxWidth: "16ch" }}>An AI trainer that watched every rep and every meal</h2>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginTop: 22, maxWidth: "46ch" }}>
              Not a chatbot you have to explain yourself to. The system already logged 30 days of your meals,
              workouts and weigh-ins, so the coach knows where you slipped and what to fix, and it talks to you daily
              like a trainer who was there for all of it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ border: `1px solid ${HAIR}` }}>
              {[
                ["Context", "Every logged meal and session is memory."],
                ["Proactive", "It nudges before you drift, not after."],
                ["Guarded", "Medical + body-image safety lines built in."],
                ["Status", "In development. Ships with Luxury."],
              ].map(([k, v], i, a) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "16px", borderBottom: i < a.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <span style={mono(11, i === 3 ? LIME_LT : MUTE)}>{k}</span>
                  <span style={{ fontSize: 13, color: i === 3 ? MUTE : "#c9c9c5", textAlign: "right", maxWidth: "24ch" }}>{v}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ 007 MEMBERSHIP ═══ */
function Membership() {
  const tiers = [
    { name: "Free", price: "Rs 0", note: "Explore", href: "/auth/signin", cta: "Create account" },
    { name: "Standard", price: "from Rs 112 / meal", note: "The daily loop", href: "/plans", cta: "Start a plan", on: true },
    { name: "Premium", price: "Waitlist", note: "Coaching layer", href: "/plans", cta: "Join waitlist" },
    { name: "Luxury", price: "Waitlist", note: "Fully managed", href: "/plans", cta: "Join waitlist" },
  ];
  const matrix: [string, (boolean | string)[]][] = [
    ["Full menus + macros", [true, true, true, true]],
    ["Meal delivery", [false, true, true, true]],
    ["Per-gram logging + net calories", [false, true, true, true]],
    ["Body metrics + recalibration", [false, true, true, true]],
    ["Consistency score + digest", [false, true, true, true]],
    ["Linked workout schedule", [false, false, true, true]],
    ["Personalised supplement stack", [false, false, true, true]],
    ["Weekly progress PDF", [false, false, true, true]],
    ["AI trainer chat", [false, false, false, true]],
    ["Nutritionist consult", [false, false, false, true]],
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="008" label="Membership" />
        <Reveal>
          <div style={{ border: `1px solid ${HAIR}`, overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
              {/* header */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1.6fr) repeat(4,minmax(90px,1fr))", borderBottom: `1px solid ${HAIR}` }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "18px 12px", borderLeft: `1px solid ${HAIR}`, background: t.on ? "rgba(132,204,22,0.04)" : "transparent" }}>
                    <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 22, textTransform: "uppercase", color: t.on ? LIME : TXT }}>{t.name}</div>
                    <div style={mono(9.5, DIM)}>{t.note}</div>
                    <div style={{ ...mono(10, MUTE), marginTop: 8 }}>{t.price}</div>
                  </div>
                ))}
              </div>
              {/* rows */}
              {matrix.map(([label, marks]) => (
                <div key={label} style={{ display: "grid", gridTemplateColumns: "minmax(200px,1.6fr) repeat(4,minmax(90px,1fr))", borderBottom: `1px solid ${HAIR}` }}>
                  <span style={{ padding: "13px 16px", fontSize: 13, color: MUTE }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "13px 12px", textAlign: "center", borderLeft: `1px solid ${HAIR}`, background: ci === 1 ? "rgba(132,204,22,0.03)" : "transparent", ...mono(12, m ? (ci === 1 ? LIME : MUTE) : "#333") }}>{m ? "✓" : "·"}</span>
                  ))}
                </div>
              ))}
              {/* cta row */}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1.6fr) repeat(4,minmax(90px,1fr))" }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "14px 12px", borderLeft: `1px solid ${HAIR}` }}>
                    <Link href={t.href} className={t.on ? "ff-solid" : "ff-link"} style={t.on ? { display: "block", textAlign: "center", background: LIME, color: "#000", ...mono(10, "#000"), fontWeight: 700, padding: "9px 6px", textDecoration: "none" } : { ...mono(10, LIME_LT), display: "block", textAlign: "center" }}>{t.cta}</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 008 BUILT FOR ═══ */
function BuiltFor() {
  const rows = [
    { tag: "IND", title: "Individuals", d: "126 goal and condition plans, cooked and tracked for you daily.", href: "/plans", cta: "Find your plan" },
    { tag: "B2B", title: "Corporate wellness", d: "Subsidised, condition-specific meal programs and reporting for Pune offices.", href: "/corporate", cta: "Enquire for your team" },
    { tag: "PARTNER", title: "Gyms + trainers", d: "Coaches and clinics earn on every member. QR onboarding, live tracking, monthly payouts.", href: "/partners/apply", cta: "Become a partner" },
    { tag: "PDF", title: "Digital plans", d: "Not in Pune? The full 30-day plan as a designed PDF: recipes, macros, grocery list, training.", href: "/plans/digital", cta: "Browse digital plans" },
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0", background: "#060606", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <IndexHeader n="009" label="Built For" right="Many front doors" />
        <div style={{ borderTop: `1px solid ${HAIR}` }}>
          {rows.map((r) => (
            <Reveal key={r.title}>
              <Link href={r.href} className="ff-row" style={{ display: "grid", gridTemplateColumns: "90px minmax(160px,300px) minmax(0,1fr) auto", gap: "clamp(12px,2vw,26px)", alignItems: "center", padding: "24px 8px", borderBottom: `1px solid ${HAIR}`, textDecoration: "none", transition: "background .15s" }}>
                <span style={mono(10.5, LIME)}>{r.tag}</span>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.4rem,2.6vw,2rem)", textTransform: "uppercase", color: TXT }}>{r.title}</span>
                <span style={{ fontSize: 14, color: MUTE, lineHeight: 1.5 }} className="ff-bf-desc">{r.d}</span>
                <span style={{ ...mono(10.5, LIME_LT), display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{r.cta} <ArrowRight size={13} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
      <style>{`@media (max-width: 760px){ .ff-bf-desc{ display:none !important; } }`}</style>
    </section>
  );
}

/* ═══ 009 FRANCHISE ═══ */
function Franchise() {
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="010" label="The Operating System" right="Franchise" />
        <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: "clamp(28px,5vw,60px)", alignItems: "start" }} className="ff-verify-grid">
          <Reveal>
            <h2 style={{ ...display("clamp(2.2rem,5vw,3.8rem)"), maxWidth: "12ch" }}>A cloud kitchen in a box</h2>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginTop: 22, maxWidth: "46ch" }}>
              FitFuel is not just a brand, it is the operating system to run one. Recipe SOPs with step-by-step
              cooking, batch scaling, and a production dashboard that tells any outlet exactly how many portions
              of each dish to cook tomorrow. The system that runs our Pune kitchen is what a partner plugs into.
            </p>
            <a href="/contact" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block", marginTop: 24 }}>Talk franchise →</a>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ border: `1px solid ${HAIR}` }}>
              {[
                ["SOP-01", "Recipe SOPs", "Every dish, step-by-step, portion-scaled."],
                ["SOP-02", "Production board", "Tomorrow's portions per recipe, auto-computed."],
                ["SOP-03", "Dispatch + drivers", "Outlet-scoped delivery boards, ready to scale."],
              ].map(([c, t, d], i, a) => (
                <div key={c} style={{ padding: "18px 16px", borderBottom: i < a.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 18, textTransform: "uppercase", color: TXT }}>{t}</span>
                    <span style={mono(10, DIM)}>{c}</span>
                  </div>
                  <span style={{ fontSize: 13, color: MUTE }}>{d}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ 010 FINDER ═══ */
function Finder() {
  const [goal, setGoal] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const ready = goal && diet;
  const slug = ready ? `${goal}-${diet}` : "";
  const planName = ready ? `${GOAL_NAME[goal!]}, ${DIETS.find((d) => d.key === diet)!.label}` : "";
  return (
    <section id="finder" style={{ padding: "clamp(72px,10vw,120px) 0", background: "#060606", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <IndexHeader n="011" label="Plan Finder" right="60 seconds" />
        <div style={{ border: `1px solid ${HAIR2}` }}>
          <div style={{ padding: "clamp(22px,4vw,40px)", borderBottom: `1px solid ${HAIR}` }}>
            <div style={{ ...mono(10.5, DIM), marginBottom: 14 }}>01 / Goal</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 0, border: `1px solid ${HAIR}` }}>
              {GOALS.map((g, i) => {
                const a = goal === g.key;
                return (
                  <button key={g.key} onClick={() => setGoal(g.key)} className="ff-goal" style={{ textAlign: "left", cursor: "pointer", background: a ? "rgba(132,204,22,0.06)" : "transparent", border: "none", borderRight: i < GOALS.length - 1 ? `1px solid ${HAIR}` : "none", borderLeft: a ? `2px solid ${LIME}` : "2px solid transparent", padding: "18px 20px", transition: "background .15s, border-color .15s" }}>
                    <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 21, textTransform: "uppercase", color: a ? TXT : "#c9c9c5" }}>{g.label}</div>
                    <div style={mono(10, DIM)}>{g.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "clamp(22px,4vw,40px)", borderBottom: `1px solid ${HAIR}` }}>
            <div style={{ ...mono(10.5, DIM), marginBottom: 14 }}>02 / Diet</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {DIETS.map((d) => {
                const a = diet === d.key;
                return (
                  <button key={d.key} onClick={() => setDiet(d.key)} className="ff-diet" style={{ cursor: "pointer", background: a ? LIME : "transparent", color: a ? "#000" : "#c9c9c5", border: `1px solid ${a ? LIME : HAIR}`, padding: "10px 22px", fontFamily: MONO, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase", transition: "all .15s" }}>{d.label}</button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "clamp(22px,4vw,40px)" }}>
            <div>
              <div style={mono(10, DIM)}>Match</div>
              <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", textTransform: "uppercase", color: ready ? TXT : "#333", marginTop: 4 }}>{ready ? planName : "Select goal + diet"}</div>
            </div>
            {ready ? (
              <Link href={`/plans/${slug}`} className="ff-solid" style={{ background: LIME, color: "#000", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "14px 24px", transition: "background .2s" }}>See my plan →</Link>
            ) : <span style={mono(11, DIM)}>Awaiting input</span>}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 011 REFERRAL ═══ */
function Referral() {
  return (
    <section style={{ padding: "clamp(60px,8vw,96px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="012" label="Referral" />
        <Reveal>
          <div style={{ border: `1px solid ${HAIR}`, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 24, padding: "clamp(26px,4vw,42px)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
                <span style={{ ...display("clamp(2rem,5vw,3.2rem)") }}>Give <span style={{ color: LIME }}>Rs 200</span></span>
                <span style={{ ...display("clamp(2rem,5vw,3.2rem)") }}>Get <span style={{ color: LIME }}>Rs 500</span></span>
              </div>
              <p style={{ fontSize: 14.5, color: MUTE, marginTop: 12, maxWidth: "50ch" }}>Your friend gets Rs 200 off their first plan. You earn Rs 500 in credit per signup. It stacks.</p>
            </div>
            <Link href="/dashboard/referrals" className="ff-solid" style={{ background: LIME, color: "#000", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "15px 26px", whiteSpace: "nowrap", transition: "background .2s" }}>Get your code →</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 012 ROADMAP ═══ */
function Roadmap() {
  const items: [string, string, boolean][] = [
    ["The plate", "Chef-cooked meals, tracked to the gram", true],
    ["Movement", "Workouts, net calories, exercise library", true],
    ["Body metrics", "Weight, composition, progress", true],
    ["Sleep + recovery", "Rest and recovery as a tracked domain", false],
    ["Wearables", "Verified HR, HRV and sleep via aggregator", false],
    ["Whole-person", "One operating system for your whole body", false],
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0", background: "#060606", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <IndexHeader n="013" label="Roadmap" right="Where it goes" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "14ch", marginBottom: 44 }}>Today the plate. Tomorrow everything.</h2>
        </Reveal>
        <div style={{ borderTop: `1px solid ${HAIR}` }}>
          {items.map(([t, d, live], i) => (
            <Reveal key={t} delay={(i % 3) * 0.04}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(160px,280px) minmax(0,1fr) 80px", gap: "clamp(12px,2vw,26px)", alignItems: "center", padding: "20px 8px", borderBottom: `1px solid ${HAIR}` }}>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.3rem,2.6vw,1.8rem)", textTransform: "uppercase", color: live ? TXT : DIM }}>{t}</span>
                <span style={{ fontSize: 14, color: MUTE }} className="ff-bf-desc">{d}</span>
                <span style={{ ...mono(9.5, live ? LIME : DIM), textAlign: "right" }}>[ {live ? "LIVE" : "NEXT"} ]</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 013 FIELD REPORTS ═══ */
function FieldReports() {
  const q = [
    { q: "Down 9 kg in four months without ever feeling like I was on a diet. The food is genuinely good.", n: "Rhea M.", r: "Weight Loss · Kharadi" },
    { q: "As a trainer I send clients here. The macros are dialled in and my members actually stick to it.", n: "Aditya K.", r: "Partner · Baner" },
    { q: "The PCOS plan sorted my energy and cycles. Cooked, delivered, done. No more decision fatigue.", n: "Sneha P.", r: "PCOS · Viman Nagar" },
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="014" label="Field Reports" right="Pune members" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", borderTop: `1px solid ${HAIR}`, borderLeft: `1px solid ${HAIR}` }}>
          {q.map((t) => (
            <Reveal key={t.n}>
              <div style={{ padding: "30px 26px", borderRight: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, height: "100%" }}>
                <p style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.2rem,2vw,1.5rem)", lineHeight: 1.2, color: TXT, textTransform: "uppercase", margin: "0 0 24px" }}>{t.q}</p>
                <div style={mono(11, MUTE)}>{t.n}</div>
                <div style={mono(9.5, DIM)}>{t.r}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 28 }}>
          <a href="/testimonials" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block" }}>More reports →</a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 014 KITCHEN ═══ */
function Kitchen() {
  const rows: [string, string][] = [
    ["Location", "FSSAI-licensed kitchen, Kharadi, Pune"],
    ["Cook time", "Fresh from 04:00, never frozen"],
    ["Delivery", "At your door by 08:00, six days a week"],
    ["Pricing", "Delivery, packaging and 5% GST, all in"],
    ["FSSAI Lic.", "21523035002815"],
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0", background: "#060606", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <IndexHeader n="015" label="The Kitchen" />
        <div style={{ borderTop: `1px solid ${HAIR}`, maxWidth: 760 }}>
          {rows.map(([k, v]) => (
            <Reveal key={k}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(120px,200px) minmax(0,1fr)", gap: 20, padding: "18px 8px", borderBottom: `1px solid ${HAIR}` }}>
                <span style={mono(11, DIM)}>{k}</span>
                <span style={{ fontSize: 15, color: TXT }}>{v}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ CTA / footer masthead ═══ */
function Cta() {
  return (
    <section style={{ padding: "clamp(80px,12vw,150px) 0" }}>
      <div style={WRAP}>
        <div style={{ ...mono(11, DIM), marginBottom: 24 }}>016 / START</div>
        <Reveal>
          <h2 style={display("clamp(2.6rem,8vw,6rem)")}>
            Start the trial day.<br /><span style={{ color: LIME }}>Rs 400.</span>
          </h2>
          <p style={{ fontSize: "clamp(1rem,1.6vw,1.15rem)", color: MUTE, lineHeight: 1.6, maxWidth: "46ch", marginTop: 24 }}>
            Breakfast plus lunch delivered tomorrow. No lock-in, no commitment. See why Pune keeps ordering.
          </p>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginTop: 34 }}>
            <Link href="/plans?trial=true" className="ff-solid" style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, background: LIME, color: "#000", textDecoration: "none", padding: "16px 28px", transition: "background .2s" }}>Start your trial day</Link>
            <Link href="/plans" className="ff-link" style={mono(12, LIME_LT)}>See all plans →</Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px", marginTop: 40, paddingTop: 24, borderTop: `1px solid ${HAIR}` }}>
            {["No lock-in", "Cancel anytime", "FSSAI licensed", "Verified intake"].map((t) => <span key={t} style={mono(10.5, DIM)}>{t}</span>)}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
