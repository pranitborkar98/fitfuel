"use client";

import { useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Check, Flame, Leaf, Dumbbell, HeartPulse, Trophy, ChefHat,
  Truck, ShieldCheck, Star, Building2, Users, Pill, FileText, Gift, Clock,
  MapPin, Sparkles, Activity, Scale, Utensils, Repeat, Target, Brain, Store,
  Globe, Crown, ArrowUpRight, CheckCircle2, LineChart, X,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — the full story (2026-07)
   Mission (tracker I.0): "Not a meal-delivery app. A personal health
   operating system that delivers food. The meal is the entry point;
   the data loop is the product." Moat: controls the plate — verified
   intake, not self-reported. Three products connected (tiffin + fitness
   app + supplement brand). Individuals → corporate → gyms → franchise.
   Tokens: bg #080808 · lime #84cc16/#a3e635 · Barlow Condensed display.
══════════════════════════════════════════════════════════════════ */

const BG = "#080808";
const CARD = "#0d0d0d";
const CARD2 = "#101010";
const BORDER = "#1f1f1f";
const LIME = "#84cc16";
const LIME_LIGHT = "#a3e635";
const TXT = "#f5f5f4";
const MUTE = "#a3a3a3";
const DIM = "#6b7280";
const BARLOW = "'Barlow Condensed','Arial Narrow',sans-serif";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: CSSProperties = { width: "100%", maxWidth: 1200, margin: "0 auto", padding: "0 24px" };

function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.65, ease: EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

function Eyebrow({ children, color = LIME_LIGHT }: { children: ReactNode; color?: string }) {
  return (
    <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 18 }}>
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: color, boxShadow: `0 0 10px ${color}` }} />
      <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.22em", color, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}

function Title({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(2.1rem,4.8vw,3.5rem)", lineHeight: 1.0, color: TXT, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0, ...style }}>
      {children}
    </h2>
  );
}

const GOALS = [
  { key: "weight-loss", label: "Lose fat", note: "Deficit that keeps muscle", icon: Flame },
  { key: "muscle-gain", label: "Build muscle", note: "High-protein surplus", icon: Dumbbell },
  { key: "balanced", label: "Eat balanced", note: "Clean maintenance fuel", icon: Leaf },
];
const DIETS = [
  { key: "veg", label: "Veg" }, { key: "egg", label: "Egg" },
  { key: "non-veg", label: "Non-Veg" }, { key: "jain", label: "Jain" },
];
const GOAL_NAME: Record<string, string> = { "weight-loss": "Weight Loss", "muscle-gain": "Muscle Gain", "balanced": "Balanced" };

export default function Home() {
  return (
    <div style={{ background: BG, color: TXT, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>
      <Hero />
      <Manifesto />
      <Problem />
      <DailyLoop />
      <VerifiedIntake />
      <ConditionMarquee />
      <ThreeProducts />
      <AiTrainer />
      <Tiers />
      <Ecosystem />
      <Franchise />
      <Finder />
      <ReferBanner />
      <Vision />
      <Testimonials />
      <Kitchen />
      <FinalCTA />
      <style>{`
        @keyframes ff-marq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes ff-spin { to { transform: rotate(360deg); } }
        .ff-marq-track { animation: ff-marq 46s linear infinite; }
        .ff-orbit { animation: ff-spin 40s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ff-marq-track, .ff-orbit { animation: none; } }
        .ff-card { transition: border-color .2s, transform .2s, background .2s; }
        .ff-card:hover { border-color: #333 !important; transform: translateY(-3px); }
        .ff-cta:hover { background: ${LIME_LIGHT} !important; transform: translateY(-2px); box-shadow: 0 8px 34px rgba(132,204,22,0.45) !important; }
        .ff-ghost:hover { border-color: #3a3a3a !important; color: #fff !important; }
      `}</style>
    </div>
  );
}

/* ═══════════════ HERO ═══════════════ */
function Hero() {
  return (
    <section style={{ position: "relative", paddingTop: 150, paddingBottom: 70, overflow: "hidden" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(85% 55% at 72% 8%, rgba(132,204,22,0.18), transparent 60%), radial-gradient(70% 60% at 8% 92%, rgba(132,204,22,0.05), transparent 55%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.35, backgroundImage: "linear-gradient(#ffffff06 1px, transparent 1px), linear-gradient(90deg, #ffffff06 1px, transparent 1px)", backgroundSize: "62px 62px", maskImage: "radial-gradient(65% 55% at 50% 0%, #000, transparent 78%)", WebkitMaskImage: "radial-gradient(65% 55% at 50% 0%, #000, transparent 78%)" }} />

      <div style={{ ...WRAP, position: "relative" }}>
        <div style={{ maxWidth: 940, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.25)", borderRadius: 999, padding: "7px 16px", marginBottom: 30 }}>
              <Sparkles size={13} color={LIME_LIGHT} />
              <span style={{ fontSize: 12, fontWeight: 600, color: LIME_LIGHT }}>A personal health operating system — that delivers food</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(3rem,8.2vw,6.4rem)", lineHeight: 0.92, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}>
              We don&apos;t just feed you.<br />
              <span style={{ color: LIME }}>We control the plate.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p style={{ fontSize: "clamp(1.05rem,2vw,1.32rem)", color: MUTE, lineHeight: 1.6, maxWidth: 660, margin: "26px auto 0" }}>
              Apps ask you to log what you ate and hope you&apos;re honest. FitFuel cooks every meal in our own
              Pune kitchen, tracks every gram, watches your weight trend, and recalibrates when you plateau.
              <b style={{ color: TXT }}> Verified intake, not self-reported.</b>
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 38 }}>
              <Link href="/plans" className="ff-cta" style={ctaStyle}>Explore 126 plans <ArrowRight size={17} /></Link>
              <a href="#loop" className="ff-ghost" style={ghostStyle}>See how the system works</a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div style={{ display: "flex", gap: "10px 26px", justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
              {[
                { i: <Star size={14} color={LIME_LIGHT} fill={LIME_LIGHT} />, t: "4.8/5 from Pune members" },
                { i: <ShieldCheck size={14} color={LIME_LIGHT} />, t: "Own FSSAI kitchen" },
                { i: <Clock size={14} color={LIME_LIGHT} />, t: "Fresh from 4am, at your door by 8am" },
              ].map((x) => (
                <span key={x.t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: DIM, fontWeight: 500 }}>{x.i}{x.t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

const ctaStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 9, background: LIME, color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "16px 30px", borderRadius: 11, boxShadow: "0 6px 30px rgba(132,204,22,0.4)", transition: "all .2s", border: "none", cursor: "pointer" };
const ghostStyle: CSSProperties = { display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.02)", color: MUTE, fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "16px 26px", borderRadius: 11, border: `1px solid ${BORDER}`, transition: "all .2s", cursor: "pointer" };

/* ═══════════════ MANIFESTO ═══════════════ */
function Manifesto() {
  return (
    <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: "#060606", padding: "70px 0" }}>
      <div style={{ ...WRAP, maxWidth: 900, textAlign: "center" }}>
        <Reveal>
          <p style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.6rem,3.6vw,2.6rem)", lineHeight: 1.2, color: TXT, textTransform: "uppercase", margin: 0 }}>
            The meal is just the door.{" "}
            <span style={{ color: DIM }}>The system that tracks it, adapts it, and coaches you on it —</span>{" "}
            <span style={{ color: LIME }}>that&apos;s the product.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ THE PROBLEM ═══════════════ */
function Problem() {
  const cols = [
    { icon: Utensils, t: "Tiffin services", d: "Just feed you. No macros, no tracking, no idea if it's moving you toward your goal.", bad: true },
    { icon: Activity, t: "Fitness apps", d: "Ask you to log every bite and hope you're honest. Self-reported data is a guess.", bad: true },
    { icon: Pill, t: "Supplement brands", d: "Sell you a wall of 40 pills with no plan, no context, no connection to your food.", bad: true },
  ];
  return (
    <section style={{ padding: "90px 0" }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 54, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
          <Eyebrow>The problem</Eyebrow>
          <Title>Everyone owns one piece.<br />Nobody closes the loop.</Title>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px,1fr))", gap: 18 }}>
          {cols.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "30px 26px", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}>
                  <div style={{ width: 46, height: 46, borderRadius: 12, background: "#141414", border: `1px solid ${BORDER}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <c.icon size={21} color={DIM} />
                  </div>
                  <X size={18} color="#5a1a1a" />
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 23, textTransform: "uppercase", margin: "0 0 8px", color: TXT }}>{c.t}</h3>
                <p style={{ fontSize: 14, color: MUTE, lineHeight: 1.6, margin: 0 }}>{c.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ textAlign: "center", marginTop: 44 }}>
          <p style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.5rem,3.4vw,2.3rem)", textTransform: "uppercase", color: TXT, margin: 0 }}>
            FitFuel builds all three — <span style={{ color: LIME }}>connected.</span>
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ THE DAILY LOOP (core engine) ═══════════════ */
function DailyLoop() {
  const steps = [
    { icon: Target, t: "Onboard", d: "Tell us your body, goal, diet and condition. We compute your exact calories and macros with Mifflin-St Jeor." },
    { icon: ChefHat, t: "We cook it", d: "Your plan is cooked fresh in our Pune kitchen from 4am, portioned to your macros. Never frozen." },
    { icon: Truck, t: "We deliver it", d: "Hot meals at your door by 8am, six days a week. Track your box from kitchen to doorstep." },
    { icon: Utensils, t: "You eat, we log it", d: "Tap 'I ate this' and it auto-logs to your diary. No calorie-counting — the intake is already verified." },
    { icon: Dumbbell, t: "You train", d: "A workout linked to your plan, not random. Complete it and burned calories feed your net-calorie ring." },
    { icon: Scale, t: "You weigh in", d: "Weekly weigh-in trends your weight. Flat for two weeks? The system flags a plateau automatically." },
    { icon: Repeat, t: "We recalibrate", d: "Plateau detected → your target drops and the plan adapts. It changes as your body changes." },
    { icon: LineChart, t: "Consistency score", d: "Meals, workouts, water and weigh-ins roll into a 0-100 score — the signal that drives everything." },
  ];
  return (
    <section id="loop" style={{ padding: "90px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 20 }}>
          <Eyebrow>The core engine</Eyebrow>
          <Title>The daily loop</Title>
          <p style={{ fontSize: 15.5, color: MUTE, maxWidth: 620, margin: "18px auto 0", lineHeight: 1.6 }}>
            Every meal, workout, weigh-in and score feeds one engine that knows you better than any nutritionist you&apos;ve met. This is the loop that runs every single day.
          </p>
        </Reveal>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px,1fr))", gap: 16, marginTop: 46 }}>
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={(i % 4) * 0.06}>
              <div className="ff-card" style={{ position: "relative", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "24px 22px", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ width: 40, height: 40, borderRadius: 11, background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <s.icon size={19} color={LIME} />
                  </div>
                  <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 15, color: LIME_LIGHT, letterSpacing: "0.08em" }}>{String(i + 1).padStart(2, "0")}</span>
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 21, textTransform: "uppercase", margin: "0 0 7px", color: TXT }}>{s.t}</h3>
                <p style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.55, margin: 0 }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal style={{ textAlign: "center", marginTop: 40 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 10, fontFamily: BARLOW, fontWeight: 700, fontSize: 18, color: TXT, textTransform: "uppercase", letterSpacing: "0.05em", background: "rgba(132,204,22,0.06)", border: "1px solid rgba(132,204,22,0.2)", borderRadius: 999, padding: "12px 24px" }}>
            <Repeat size={17} color={LIME} /> Then it repeats — sharper every week
          </span>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ VERIFIED INTAKE ═══════════════ */
function VerifiedIntake() {
  const rows = [
    "Cooks your food fresh, daily",
    "Tracks every gram automatically",
    "Adapts your targets on a plateau",
    "126 condition-specific plans",
    "Consistency score on your real data",
    "Coaches you on what actually happened",
  ];
  const cols = ["Tiffin", "Fitness app", "Supplement brand", "FitFuel"];
  return (
    <section style={{ padding: "90px 0" }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 44, alignItems: "center" }}>
          <Reveal>
            <Eyebrow>The moat</Eyebrow>
            <Title style={{ marginBottom: 18 }}>Verified intake,<br />not self-reported</Title>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginBottom: 22 }}>
              When we cook every meal, your macros are measured — not guessed. That closed loop is what no tiffin
              service, fitness app or supplement brand can replicate. The moat isn&apos;t clever software. It&apos;s
              owning the plate.
            </p>
            <Link href="/how-it-works" className="ff-ghost" style={{ ...ghostStyle, padding: "14px 24px" }}>
              How it works <ArrowRight size={15} />
            </Link>
          </Reveal>

          <Reveal delay={0.1}>
            <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4, 1fr)", background: "#0a0a0a", borderBottom: `1px solid ${BORDER}` }}>
                <div />
                {cols.map((c, i) => (
                  <div key={c} style={{ padding: "14px 6px", textAlign: "center", fontFamily: BARLOW, fontWeight: 800, fontSize: 13, textTransform: "uppercase", letterSpacing: "0.02em", color: i === 3 ? "#000" : DIM, background: i === 3 ? LIME : "transparent" }}>{c}</div>
                ))}
              </div>
              {rows.map((r, ri) => (
                <div key={r} style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4, 1fr)", borderBottom: ri < rows.length - 1 ? `1px solid #161616` : "none" }}>
                  <div style={{ padding: "13px 16px", fontSize: 13, color: MUTE }}>{r}</div>
                  {[0, 1, 2, 3].map((ci) => (
                    <div key={ci} style={{ padding: "13px 6px", display: "flex", justifyContent: "center", alignItems: "center", background: ci === 3 ? "rgba(132,204,22,0.06)" : "transparent" }}>
                      {ci === 3 ? <Check size={16} color={LIME} /> : <X size={13} color="#3a3a3a" />}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ CONDITION MARQUEE ═══════════════ */
const CONDITIONS: { n: string; c: string }[] = [
  { n: "Weight Loss", c: LIME_LIGHT }, { n: "Muscle Gain", c: LIME_LIGHT }, { n: "PCOS", c: "#f472b6" },
  { n: "Diabetic", c: "#2dd4bf" }, { n: "Thyroid", c: "#a78bfa" }, { n: "Heart Health", c: "#fb7185" },
  { n: "Gut Health", c: "#34d399" }, { n: "Fertility", c: "#f9a8d4" }, { n: "Anti-Aging", c: "#fbbf24" },
  { n: "Cricket", c: "#c084fc" }, { n: "Keto Indian", c: LIME_LIGHT }, { n: "Hair Health", c: "#fbbf24" },
  { n: "Hypertension", c: "#fb7185" }, { n: "Endurance", c: "#c084fc" }, { n: "Quit Smoking", c: "#4ade80" },
  { n: "Jain", c: LIME_LIGHT }, { n: "Anaemia", c: "#fb7185" }, { n: "Fatty Liver", c: "#34d399" },
];
function ConditionMarquee() {
  const row = [...CONDITIONS, ...CONDITIONS];
  return (
    <section style={{ padding: "40px 0", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: "#060606" }}>
      <p style={{ textAlign: "center", fontSize: 12.5, color: DIM, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24 }}>
        126 plans — one for every body, goal and condition
      </p>
      <div style={{ position: "relative", overflow: "hidden", maskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 6%,#000 94%,transparent)" }}>
        <div className="ff-marq-track" style={{ display: "flex", gap: 12, width: "max-content" }}>
          {row.map((it, i) => (
            <span key={i} style={{ flexShrink: 0, fontFamily: BARLOW, fontSize: 16, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.03em", color: it.c, background: `${it.c}14`, border: `1px solid ${it.c}30`, padding: "9px 16px", borderRadius: 9, whiteSpace: "nowrap" }}>{it.n}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ THREE PRODUCTS, ONE SYSTEM ═══════════════ */
function ThreeProducts() {
  const p = [
    { icon: ChefHat, t: "The kitchen", tag: "Meals", d: "Chef-cooked, macro-portioned meals for 126 goals and conditions, delivered daily across Pune.", href: "/plans", cta: "See meal plans" },
    { icon: Dumbbell, t: "The fitness app", tag: "Movement", d: "Plan-linked workouts, an 800+ exercise library, net-calorie tracking, body metrics and progress charts.", href: "/how-it-works", cta: "Inside the app" },
    { icon: Pill, t: "The supplement stack", tag: "Nutrabay", d: "A condition-matched stack with real doses — not a wall of pills. Educational first, ordered via Nutrabay.", href: "/supplements", cta: "Browse supplements" },
  ];
  return (
    <section style={{ padding: "90px 0" }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 54, maxWidth: 720, marginLeft: "auto", marginRight: "auto" }}>
          <Eyebrow>Three products, one system</Eyebrow>
          <Title>A tiffin, an app and a supplement brand — talking to each other</Title>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 18 }}>
          {p.map((x, i) => (
            <Reveal key={x.t} delay={i * 0.07}>
              <Link href={x.href} className="ff-card" style={{ display: "flex", flexDirection: "column", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "32px 28px", textDecoration: "none", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 13, background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <x.icon size={24} color={LIME} />
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: LIME_LIGHT, textTransform: "uppercase", letterSpacing: "0.12em", background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.22)", padding: "5px 11px", borderRadius: 999 }}>{x.tag}</span>
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 28, textTransform: "uppercase", margin: "0 0 10px", color: TXT }}>{x.t}</h3>
                <p style={{ fontSize: 14.5, color: MUTE, lineHeight: 1.6, margin: "0 0 22px", flex: 1 }}>{x.d}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: LIME_LIGHT, textTransform: "uppercase", letterSpacing: "0.05em" }}>{x.cta} <ArrowRight size={15} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ AI TRAINER ═══════════════ */
function AiTrainer() {
  return (
    <section style={{ padding: "90px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ ...WRAP, maxWidth: 940 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 40, alignItems: "center" }}>
          <Reveal>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: FUCHSIA_LABEL, background: "rgba(232,121,249,0.08)", border: "1px solid rgba(232,121,249,0.25)", padding: "6px 13px", borderRadius: 999, marginBottom: 20 }}>
              <Crown size={13} /> Luxury tier · coming soon
            </div>
            <Title style={{ marginBottom: 18 }}>An AI trainer that watched every rep and every meal</Title>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7 }}>
              Not a chatbot you have to explain yourself to. Because the system already logged 30 days of your
              meals, workouts, weigh-ins and score, the coach knows exactly where you slipped and what to fix —
              and it talks to you daily like a trainer who was there for all of it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ background: "linear-gradient(160deg,#0f0f0f,#0a0a0a)", border: `1px solid ${BORDER}`, borderRadius: 18, padding: 24 }}>
              {[
                { icon: Brain, t: "Knows your full history", d: "Every logged meal and session is context." },
                { icon: Target, t: "Proactive, not reactive", d: "It nudges before you drift, not after." },
                { icon: ShieldCheck, t: "Safety-guarded", d: "Medical boundary and body-image guardrails built in." },
              ].map((f) => (
                <div key={f.t} style={{ display: "flex", gap: 14, padding: "14px 0", borderBottom: `1px solid #161616` }}>
                  <f.icon size={20} color={LIME} style={{ flexShrink: 0, marginTop: 2 }} />
                  <div>
                    <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 17, textTransform: "uppercase", color: TXT }}>{f.t}</div>
                    <div style={{ fontSize: 13, color: MUTE }}>{f.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
const FUCHSIA_LABEL = "#e879f9";

/* ═══════════════ MEMBERSHIP TIERS ═══════════════ */
function Tiers() {
  const tiers = [
    { name: "Free", accent: DIM, price: "₹0", note: "Explore everything", feats: ["Full 30-day menus + macros", "TDEE calculator", "60-second plan finder", "Browse exercise library"], cta: { label: "Create account", href: "/auth/signin" } },
    { name: "Standard", accent: LIME_LIGHT, price: "from ₹112", unit: "/ meal", note: "The daily loop", feats: ["Daily meal delivery", "Per-gram meal logging", "Net-calorie engine", "Body metrics + recalibration", "Consistency score + digest"], cta: { label: "Start a plan", href: "/plans" }, featured: true },
    { name: "Premium", accent: "#f59e0b", price: "Waitlist", note: "Coaching layer", feats: ["Everything in Standard", "Linked workout schedule", "Personalised supplement stack", "Weekly progress PDF", "Priority WhatsApp support"], cta: { label: "Join waitlist", href: "/plans" } },
    { name: "Luxury", accent: "#e879f9", price: "Waitlist", note: "Fully managed", feats: ["Everything in Premium", "AI personal trainer chat", "1-on-1 nutritionist consult", "Custom plan adjustments", "Quarterly transformation report"], cta: { label: "Join waitlist", href: "/plans" } },
  ];
  return (
    <section style={{ padding: "90px 0" }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow>Membership</Eyebrow>
          <Title>Start free. Grow into the full system.</Title>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 16 }}>
          {tiers.map((t, i) => (
            <Reveal key={t.name} delay={i * 0.06}>
              <div style={{ position: "relative", background: t.featured ? "linear-gradient(170deg, rgba(132,204,22,0.07), #0c0c0c)" : CARD, border: `1px solid ${t.featured ? "rgba(132,204,22,0.4)" : BORDER}`, borderRadius: 18, padding: "28px 24px", height: "100%", display: "flex", flexDirection: "column" }}>
                {t.featured && <span style={{ position: "absolute", top: -11, left: 24, fontSize: 10, fontWeight: 800, color: "#000", background: LIME, padding: "4px 11px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>Most popular</span>}
                <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 24, textTransform: "uppercase", color: t.accent }}>{t.name}</div>
                <div style={{ fontSize: 12, color: DIM, marginBottom: 16 }}>{t.note}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 5, marginBottom: 20 }}>
                  <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 34, color: TXT }}>{t.price}</span>
                  {t.unit && <span style={{ fontSize: 13, color: DIM }}>{t.unit}</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, flex: 1, marginBottom: 22 }}>
                  {t.feats.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 9, fontSize: 13, color: MUTE, lineHeight: 1.4 }}>
                      <CheckCircle2 size={15} color={t.accent} style={{ flexShrink: 0, marginTop: 1 }} />{f}
                    </div>
                  ))}
                </div>
                <Link href={t.cta.href} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, textDecoration: "none", padding: "12px", borderRadius: 10, fontSize: 12.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.05em", background: t.featured ? LIME : "transparent", color: t.featured ? "#000" : t.accent, border: t.featured ? "none" : `1px solid ${BORDER}` }}>
                  {t.cta.label}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ ECOSYSTEM (who it's for) ═══════════════ */
function Ecosystem() {
  const lines = [
    { icon: HeartPulse, accent: LIME_LIGHT, tag: "For you", title: "Individuals", body: "126 goal and condition plans, cooked and tracked for you daily.", href: "/plans", cta: "Find your plan" },
    { icon: Building2, accent: "#38bdf8", tag: "For companies", title: "Corporate Wellness", body: "Subsidised, condition-specific meal programs and wellness reporting for Pune offices.", href: "/corporate", cta: "Enquire for your team" },
    { icon: Users, accent: "#c084fc", tag: "For gyms & coaches", title: "Partner Program", body: "Gyms, trainers, dieticians and clinics earn on every member — QR onboarding, live tracking, monthly payouts.", href: "/partners/apply", cta: "Become a partner" },
    { icon: FileText, accent: "#fbbf24", tag: "Anywhere in India", title: "Digital Plans", body: "Not in Pune? Get the full 30-day plan as a designed PDF — recipes, macros, grocery list, training.", href: "/plans/digital", cta: "Browse digital plans" },
  ];
  return (
    <section style={{ padding: "90px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 52, maxWidth: 640, marginLeft: "auto", marginRight: "auto" }}>
          <Eyebrow>Built for everyone</Eyebrow>
          <Title>One system, many front doors</Title>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(270px,1fr))", gap: 18 }}>
          {lines.map((l, i) => (
            <Reveal key={l.title} delay={i * 0.06}>
              <Link href={l.href} className="ff-card" style={{ display: "flex", flexDirection: "column", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "30px 26px", textDecoration: "none", height: "100%" }}>
                <div style={{ width: 50, height: 50, borderRadius: 13, background: `${l.accent}18`, border: `1px solid ${l.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <l.icon size={23} color={l.accent} />
                </div>
                <span style={{ fontSize: 10.5, fontWeight: 800, color: l.accent, textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 10 }}>{l.tag}</span>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 26, textTransform: "uppercase", margin: "0 0 10px", color: TXT }}>{l.title}</h3>
                <p style={{ fontSize: 14, color: MUTE, lineHeight: 1.6, margin: "0 0 20px", flex: 1 }}>{l.body}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 12.5, fontWeight: 700, color: l.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>{l.cta} <ArrowRight size={14} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ FRANCHISE ═══════════════ */
function Franchise() {
  return (
    <section style={{ padding: "90px 0" }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(150deg, #0e0e0e, #0a0a0a)", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(32px,5vw,56px)" }}>
            <div aria-hidden style={{ position: "absolute", top: -80, right: -80, width: 320, height: 320, background: "radial-gradient(circle, rgba(132,204,22,0.12), transparent 65%)", pointerEvents: "none" }} />
            <div style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 40, alignItems: "center" }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11, fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: LIME_LIGHT, background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.25)", padding: "6px 13px", borderRadius: 999, marginBottom: 20 }}>
                  <Store size={13} /> Franchise
                </div>
                <Title style={{ marginBottom: 18 }}>A cloud kitchen<br />in a box</Title>
                <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginBottom: 24 }}>
                  FitFuel isn&apos;t just a brand — it&apos;s the operating system to run one. Recipe SOPs with
                  step-by-step cooking, batch scaling, and a kitchen production dashboard that tells any outlet
                  exactly how many portions of each dish to cook tomorrow. The system that runs our Pune kitchen
                  is the system a franchise partner plugs into.
                </p>
                <Link href="/contact" className="ff-cta" style={ctaStyle}>Talk franchise <ArrowRight size={16} /></Link>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {[
                  { icon: ChefHat, t: "Recipe SOPs", d: "Every dish, step-by-step and portion-scaled." },
                  { icon: Activity, t: "Production dashboard", d: "Tomorrow's portions per recipe, auto-computed." },
                  { icon: Truck, t: "Dispatch + drivers", d: "Outlet-scoped delivery boards, ready to scale." },
                ].map((f) => (
                  <div key={f.t} style={{ display: "flex", gap: 14, background: "#0c0c0c", border: `1px solid ${BORDER}`, borderRadius: 14, padding: "18px 20px" }}>
                    <f.icon size={20} color={LIME} style={{ flexShrink: 0, marginTop: 2 }} />
                    <div>
                      <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 18, textTransform: "uppercase", color: TXT }}>{f.t}</div>
                      <div style={{ fontSize: 13, color: MUTE }}>{f.d}</div>
                    </div>
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

/* ═══════════════ PLAN FINDER ═══════════════ */
function Finder() {
  const [goal, setGoal] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const ready = goal && diet;
  const slug = ready ? `${goal}-${diet}` : "";
  const planName = ready ? `${GOAL_NAME[goal!]}, ${DIETS.find((d) => d.key === diet)!.label}` : "";
  return (
    <section id="finder" style={{ padding: "90px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, scrollMarginTop: 70 }}>
      <div style={{ ...WRAP, maxWidth: 900 }}>
        <div style={{ background: "linear-gradient(160deg, #0f0f0f, #0a0a0a)", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(28px,5vw,52px)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
            <Eyebrow>60-second finder</Eyebrow>
            <Title style={{ fontSize: "clamp(1.9rem,4vw,2.8rem)" }}>Find your plan</Title>
          </Reveal>
          <div style={{ marginBottom: 26 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DIM, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>1 · Your goal</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px,1fr))", gap: 12 }}>
              {GOALS.map((g) => {
                const active = goal === g.key;
                return (
                  <button key={g.key} onClick={() => setGoal(g.key)} style={{ textAlign: "left", cursor: "pointer", background: active ? "rgba(132,204,22,0.1)" : "#0c0c0c", border: `1px solid ${active ? LIME : BORDER}`, borderRadius: 14, padding: "16px 18px", transition: "all .18s" }}>
                    <g.icon size={20} color={active ? LIME : DIM} />
                    <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 19, textTransform: "uppercase", color: active ? TXT : "#d4d4d4", marginTop: 10 }}>{g.label}</div>
                    <div style={{ fontSize: 12, color: DIM, marginTop: 3 }}>{g.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DIM, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>2 · Your diet</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DIETS.map((d) => {
                const active = diet === d.key;
                return (
                  <button key={d.key} onClick={() => setDiet(d.key)} style={{ cursor: "pointer", background: active ? LIME : "#0c0c0c", color: active ? "#000" : "#d4d4d4", border: `1px solid ${active ? LIME : BORDER}`, borderRadius: 10, padding: "11px 22px", fontFamily: BARLOW, fontWeight: 700, fontSize: 17, textTransform: "uppercase", letterSpacing: "0.03em", transition: "all .18s" }}>{d.label}</button>
                );
              })}
            </div>
          </div>
          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 26, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: DIM, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your match</div>
              <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 28, color: ready ? TXT : "#333", textTransform: "uppercase", marginTop: 4 }}>{ready ? planName : "Pick a goal and diet"}</div>
            </div>
            {ready ? (
              <Link href={`/plans/${slug}`} className="ff-cta" style={{ ...ctaStyle, padding: "15px 28px" }}>See my plan <ArrowRight size={16} /></Link>
            ) : (
              <span style={{ fontSize: 13, color: DIM }}>Select above to reveal your plan</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ REFER & EARN ═══════════════ */
function ReferBanner() {
  return (
    <section style={{ padding: "70px 0" }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ background: "linear-gradient(120deg, rgba(132,204,22,0.14), rgba(132,204,22,0.03))", border: "1px solid rgba(132,204,22,0.25)", borderRadius: 22, padding: "clamp(30px,5vw,48px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div style={{ maxWidth: 560 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <Gift size={18} color={LIME} />
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.18em", color: LIME_LIGHT, textTransform: "uppercase" }}>Refer & earn</span>
              </div>
              <h2 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.7rem)", textTransform: "uppercase", lineHeight: 1.05, margin: "0 0 12px", color: TXT }}>
                Give <span style={{ color: LIME }}>₹200</span>, get <span style={{ color: LIME }}>₹500</span>
              </h2>
              <p style={{ fontSize: 15, color: MUTE, lineHeight: 1.6, margin: 0 }}>
                Share your code. Your friend gets ₹200 off their first plan, you earn ₹500 in credit per signup. It stacks.
              </p>
            </div>
            <Link href="/dashboard/referrals" className="ff-cta" style={{ ...ctaStyle, flexShrink: 0 }}>Get your code <ArrowRight size={16} /></Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ VISION ═══════════════ */
function Vision() {
  const future = [
    { icon: Utensils, t: "The plate", now: true },
    { icon: Activity, t: "Movement", now: true },
    { icon: Scale, t: "Body metrics", now: true },
    { icon: Star, t: "Sleep & recovery", now: false },
    { icon: HeartPulse, t: "Wearables & HRV", now: false },
    { icon: Globe, t: "Whole-person health", now: false },
  ];
  return (
    <section style={{ padding: "90px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={{ ...WRAP, textAlign: "center", maxWidth: 820 }}>
        <Reveal>
          <Eyebrow>Where it&apos;s going</Eyebrow>
          <Title>Today, the plate.<br />Tomorrow, everything.</Title>
          <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, maxWidth: 620, margin: "18px auto 34px" }}>
            The loop that runs on food generalises to every health signal. As we grow, the same engine will take
            in sleep, recovery and verified wearable data — one operating system for your whole body.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center" }}>
            {future.map((f) => (
              <span key={f.t} style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 600, color: f.now ? TXT : DIM, background: f.now ? "rgba(132,204,22,0.08)" : "#0c0c0c", border: `1px solid ${f.now ? "rgba(132,204,22,0.25)" : BORDER}`, borderRadius: 999, padding: "10px 18px" }}>
                <f.icon size={15} color={f.now ? LIME : DIM} />
                {f.t}
                <span style={{ fontSize: 9.5, fontWeight: 800, letterSpacing: "0.08em", color: f.now ? LIME : DIM, textTransform: "uppercase" }}>{f.now ? "Live" : "Next"}</span>
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ TESTIMONIALS ═══════════════ */
function Testimonials() {
  const quotes = [
    { q: "Down 9 kg in four months without ever feeling like I was on a diet. The food is genuinely good.", n: "Rhea M.", r: "Weight Loss · Kharadi" },
    { q: "As a trainer I send clients here. The macros are dialled in and my members actually stick to it.", n: "Aditya K.", r: "Partner · Baner gym" },
    { q: "PCOS plan sorted my energy and cycles. Cooked, delivered, done. No more decision fatigue.", n: "Sneha P.", r: "PCOS · Viman Nagar" },
  ];
  return (
    <section style={{ padding: "90px 0" }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Real results</Eyebrow>
          <Title>Pune is eating better</Title>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 18 }}>
          {quotes.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.07}>
              <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "30px 28px", height: "100%" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>{[...Array(5)].map((_, k) => <Star key={k} size={15} color={LIME_LIGHT} fill={LIME_LIGHT} />)}</div>
                <p style={{ fontSize: 15.5, color: TXT, lineHeight: 1.6, margin: "0 0 22px", fontWeight: 500 }}>&ldquo;{t.q}&rdquo;</p>
                <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 17, textTransform: "uppercase", color: TXT }}>{t.n}</div>
                <div style={{ fontSize: 12.5, color: DIM, marginTop: 2 }}>{t.r}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ textAlign: "center", marginTop: 36 }}>
          <Link href="/testimonials" className="ff-ghost" style={{ ...ghostStyle, padding: "13px 24px" }}>Read more stories <ArrowRight size={15} /></Link>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══════════════ KITCHEN / TRUST ═══════════════ */
function Kitchen() {
  return (
    <section style={{ padding: "80px 0", background: "#060606", borderTop: `1px solid ${BORDER}` }}>
      <div style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px,1fr))", gap: 28 }}>
        {[
          { icon: MapPin, t: "Our own kitchen", d: "FSSAI-licensed, in Kharadi, Pune. Never outsourced." },
          { icon: Flame, t: "Fresh from 4am", d: "Cooked every morning. Never frozen, never fried." },
          { icon: Truck, t: "At your door by 8am", d: "Six days a week, tracked kitchen to doorstep." },
          { icon: ShieldCheck, t: "GST included", d: "Delivery, packaging and 5% GST — all in, no surprises." },
        ].map((x, i) => (
          <Reveal key={x.t} delay={i * 0.06}>
            <div style={{ display: "flex", gap: 14 }}>
              <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.22)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                <x.icon size={20} color={LIME} />
              </div>
              <div>
                <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 19, textTransform: "uppercase", color: TXT }}>{x.t}</div>
                <div style={{ fontSize: 13, color: MUTE, lineHeight: 1.5, marginTop: 2 }}>{x.d}</div>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══════════════ FINAL CTA ═══════════════ */
function FinalCTA() {
  return (
    <section style={{ padding: "100px 0" }}>
      <div style={{ ...WRAP, maxWidth: 820, textAlign: "center" }}>
        <Reveal>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.25)", borderRadius: 999, padding: "7px 16px", marginBottom: 28 }}>
            <span style={{ fontSize: 12, fontWeight: 600, color: LIME_LIGHT }}>Try it tomorrow · Trial day just ₹400</span>
          </div>
          <Title style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}>Join the system<br /><span style={{ color: LIME }}>that keeps you for good</span></Title>
          <p style={{ fontSize: 16.5, color: MUTE, lineHeight: 1.6, maxWidth: 540, margin: "24px auto 0" }}>
            Breakfast plus lunch delivered tomorrow. No lock-in, no commitment. See why Pune keeps ordering.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 38 }}>
            <Link href="/plans?trial=true" className="ff-cta" style={{ ...ctaStyle, padding: "17px 34px", fontSize: 14.5 }}>Start your trial day <ArrowRight size={17} /></Link>
            <Link href="/plans" className="ff-ghost" style={{ ...ghostStyle, padding: "17px 30px", fontSize: 14.5 }}>See all plans</Link>
          </div>
          <div style={{ display: "flex", gap: "10px 26px", justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}>
            {["No lock-in", "Cancel anytime", "FSSAI licensed", "Verified intake"].map((t) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: DIM }}><Check size={14} color={LIME} />{t}</span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
