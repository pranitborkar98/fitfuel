"use client";

import { useState, useRef, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight, Check, Flame, Leaf, Dumbbell, HeartPulse, Trophy,
  ChefHat, Truck, LineChart, ShieldCheck, Star, Building2, Users,
  Pill, FileText, Gift, Clock, MapPin, Sparkles,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — marketing rebuild (2026-07)
   Clean, benefit-led, surfaces every business line: meal plans,
   corporate, gym/trainer partners, supplements (Nutrabay), digital
   plans, referrals. Tokens: bg #080808 · lime #84cc16/#a3e635 ·
   Barlow Condensed display (preloaded in layout). Pune, English.
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

const rise = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: EASE } },
};

function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div
      variants={rise}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-80px" }}
      transition={{ delay }}
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

function SectionTitle({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return (
    <h2 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(2.1rem,4.6vw,3.4rem)", lineHeight: 1.02, color: TXT, textTransform: "uppercase", letterSpacing: "-0.01em", margin: 0, ...style }}>
      {children}
    </h2>
  );
}

/* ─────────────────────────── Plan finder data ─────────────────────────── */
const GOALS = [
  { key: "weight-loss", label: "Lose fat",      note: "Sustainable deficit, keeps muscle",   icon: Flame },
  { key: "muscle-gain", label: "Build muscle",  note: "High protein, progressive surplus",   icon: Dumbbell },
  { key: "balanced",    label: "Eat balanced",  note: "Clean maintenance fuel",              icon: Leaf },
];
const DIETS = [
  { key: "veg", label: "Veg" },
  { key: "egg", label: "Egg" },
  { key: "non-veg", label: "Non-Veg" },
  { key: "jain", label: "Jain" },
];
const GOAL_NAME: Record<string, string> = { "weight-loss": "Weight Loss", "muscle-gain": "Muscle Gain", "balanced": "Balanced" };

/* ─────────────────────────── page ─────────────────────────── */
export default function Home() {
  return (
    <div style={{ background: BG, color: TXT, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>
      <Hero />
      <TrustBar />
      <ConditionMarquee />
      <HowItWorks />
      <GoalPlans />
      <Finder />
      <BusinessLines />
      <WhyFitFuel />
      <ReferBanner />
      <Testimonials />
      <FinalCTA />
      <style>{`
        @keyframes ff-marq { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        @keyframes ff-glow { 0%,100% { opacity: 0.5; } 50% { opacity: 0.9; } }
        .ff-marq-track { animation: ff-marq 44s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .ff-marq-track { animation: none; } }
        .ff-card-hover { transition: border-color .2s, transform .2s, background .2s; }
        .ff-card-hover:hover { border-color: #333 !important; transform: translateY(-3px); }
        .ff-cta:hover { background: ${LIME_LIGHT} !important; transform: translateY(-2px); box-shadow: 0 8px 34px rgba(132,204,22,0.45) !important; }
        .ff-ghost:hover { border-color: #3a3a3a !important; color: #fff !important; }
        .ff-chip:hover { background: rgba(255,255,255,0.05) !important; }
      `}</style>
    </div>
  );
}

/* ═══════════════ HERO ═══════════════ */
function Hero() {
  return (
    <section style={{ position: "relative", paddingTop: 150, paddingBottom: 90, overflow: "hidden" }}>
      {/* calm gradient wash — replaces the old WebGL noise */}
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", background: "radial-gradient(90% 60% at 75% 15%, rgba(132,204,22,0.16), transparent 60%), radial-gradient(70% 60% at 10% 90%, rgba(132,204,22,0.05), transparent 55%)" }} />
      <div aria-hidden style={{ position: "absolute", inset: 0, pointerEvents: "none", opacity: 0.4, backgroundImage: "linear-gradient(#ffffff05 1px, transparent 1px), linear-gradient(90deg, #ffffff05 1px, transparent 1px)", backgroundSize: "64px 64px", maskImage: "radial-gradient(70% 60% at 50% 0%, #000, transparent 75%)", WebkitMaskImage: "radial-gradient(70% 60% at 50% 0%, #000, transparent 75%)" }} />

      <div style={{ ...WRAP, position: "relative" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", textAlign: "center" }}>
          <Reveal>
            <div className="ff-chip" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(132,204,22,0.08)", border: "1px solid rgba(132,204,22,0.25)", borderRadius: 999, padding: "7px 16px", marginBottom: 30 }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: LIME_LIGHT }}>Fresh, chef-cooked meals · Delivered daily in Pune</span>
            </div>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(3.1rem,8vw,6rem)", lineHeight: 0.95, letterSpacing: "-0.02em", textTransform: "uppercase", margin: 0 }}>
              Eat for your goal.<br />
              <span style={{ color: LIME }}>We cook it. We deliver it.</span>
            </h1>
          </Reveal>

          <Reveal delay={0.12}>
            <p style={{ fontSize: "clamp(1.05rem,2vw,1.3rem)", color: MUTE, lineHeight: 1.6, maxWidth: 620, margin: "26px auto 0" }}>
              126 goal and condition-specific meal plans, cooked fresh in our own Pune kitchen
              and delivered to your door. Real food that hits your macros, so you actually see results.
            </p>
          </Reveal>

          <Reveal delay={0.18}>
            <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 38 }}>
              <Link href="/plans" className="ff-cta" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: LIME, color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "16px 30px", borderRadius: 11, boxShadow: "0 6px 30px rgba(132,204,22,0.4)", transition: "all .2s" }}>
                Explore meal plans <ArrowRight size={17} />
              </Link>
              <a href="#finder" className="ff-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(255,255,255,0.02)", color: MUTE, fontSize: 14, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "16px 26px", borderRadius: 11, border: `1px solid ${BORDER}`, transition: "all .2s" }}>
                Find my plan
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.24}>
            <div style={{ display: "flex", gap: "10px 26px", justifyContent: "center", flexWrap: "wrap", marginTop: 40 }}>
              {[
                { icon: <Star size={14} color={LIME_LIGHT} fill={LIME_LIGHT} />, t: "4.8/5 from Pune members" },
                { icon: <ShieldCheck size={14} color={LIME_LIGHT} />, t: "FSSAI licensed kitchen" },
                { icon: <Clock size={14} color={LIME_LIGHT} />, t: "At your door by 8am" },
              ].map((x) => (
                <span key={x.t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: DIM, fontWeight: 500 }}>
                  {x.icon}{x.t}
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ TRUST / STATS BAR ═══════════════ */
function TrustBar() {
  const stats = [
    { n: "126", l: "Condition-specific plans" },
    { n: "4am", l: "Cooked fresh, every day" },
    { n: "6", l: "Days a week, doorstep delivery" },
    { n: "5%", l: "GST in, no hidden charges" },
  ];
  return (
    <section style={{ borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}`, background: "#060606" }}>
      <div style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 1, padding: 0 }}>
        {stats.map((s, i) => (
          <div key={s.l} style={{ padding: "34px 24px", textAlign: "center", borderRight: i < stats.length - 1 ? `1px solid ${BORDER}` : "none" }}>
            <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "2.6rem", lineHeight: 1, color: LIME }}>{s.n}</div>
            <div style={{ fontSize: 12.5, color: DIM, marginTop: 8, letterSpacing: "0.02em" }}>{s.l}</div>
          </div>
        ))}
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
    <section style={{ padding: "40px 0" }}>
      <p style={{ textAlign: "center", fontSize: 12.5, color: DIM, letterSpacing: "0.16em", textTransform: "uppercase", marginBottom: 24 }}>
        One plan for every body and every goal
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

/* ═══════════════ HOW IT WORKS ═══════════════ */
function HowItWorks() {
  const steps = [
    { icon: ChefHat, t: "Pick your plan", d: "Choose a goal or condition plan, or take the 60-second finder. Set your diet, duration and meals.", n: "01" },
    { icon: Flame, t: "We cook it fresh", d: "Our Pune kitchen starts at 4am. Chef-cooked, portioned to your macros, never frozen, never fried.", n: "02" },
    { icon: Truck, t: "Delivered by 8am", d: "Hot meals at your door, six days a week. Track your box from kitchen to doorstep.", n: "03" },
  ];
  return (
    <section style={{ padding: "80px 0" }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 56 }}>
          <Eyebrow>How it works</Eyebrow>
          <SectionTitle>Three steps to done-for-you nutrition</SectionTitle>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {steps.map((s, i) => (
            <Reveal key={s.t} delay={i * 0.08}>
              <div style={{ background: CARD, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "34px 28px", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 22 }}>
                  <div style={{ width: 50, height: 50, borderRadius: 13, background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <s.icon size={22} color={LIME} />
                  </div>
                  <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 40, color: "#191919" }}>{s.n}</span>
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 24, textTransform: "uppercase", margin: "0 0 10px", color: TXT }}>{s.t}</h3>
                <p style={{ fontSize: 14.5, color: MUTE, lineHeight: 1.65, margin: 0 }}>{s.d}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ GOAL PLANS SHOWCASE ═══════════════ */
function GoalPlans() {
  const plans = [
    { name: "Weight Loss", slug: "weight-loss-veg", icon: Flame, accent: LIME_LIGHT, note: "Sustainable deficit that protects muscle.", tag: "Most popular" },
    { name: "Muscle Gain", slug: "muscle-gain-veg", icon: Dumbbell, accent: LIME_LIGHT, note: "High-protein surplus with progressive fuel." },
    { name: "Balanced", slug: "balanced-veg", icon: Leaf, accent: LIME_LIGHT, note: "Clean maintenance calories, done for you." },
    { name: "Medical & Lifestyle", slug: "", href: "/plans?category=LIFESTYLE_MEDICAL", icon: HeartPulse, accent: "#2dd4bf", note: "PCOS, diabetic, thyroid, heart and more." },
    { name: "Sports Nutrition", slug: "", href: "/plans?category=SPORTS", icon: Trophy, accent: "#c084fc", note: "Cricket, endurance, combat and prep." },
    { name: "All 126 Plans", slug: "", href: "/plans", icon: Sparkles, accent: LIME_LIGHT, note: "Browse the full catalogue and compare.", cta: true },
  ];
  return (
    <section style={{ padding: "80px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <Reveal style={{ marginBottom: 48, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 20 }}>
          <div>
            <Eyebrow>Meal plans</Eyebrow>
            <SectionTitle>Built around your goal</SectionTitle>
          </div>
          <p style={{ fontSize: 15, color: MUTE, maxWidth: 340, margin: 0 }}>
            Every plan is chef-cooked, macro-portioned and adapts as you progress.
            From <b style={{ color: TXT }}>₹112 per meal</b>.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 18 }}>
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 0.05}>
              <Link href={p.href ?? `/plans/${p.slug}`} className="ff-card-hover" style={{ display: "block", background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "28px 26px", textDecoration: "none", height: "100%", position: "relative" }}>
                {p.tag && (
                  <span style={{ position: "absolute", top: 20, right: 20, fontSize: 10, fontWeight: 800, color: "#000", background: p.accent, padding: "4px 10px", borderRadius: 6, textTransform: "uppercase", letterSpacing: "0.06em" }}>{p.tag}</span>
                )}
                <div style={{ width: 46, height: 46, borderRadius: 12, background: `${p.accent}18`, border: `1px solid ${p.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                  <p.icon size={22} color={p.accent} />
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 25, textTransform: "uppercase", margin: "0 0 8px", color: TXT }}>{p.name}</h3>
                <p style={{ fontSize: 14, color: MUTE, lineHeight: 1.6, margin: "0 0 18px" }}>{p.note}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, fontWeight: 700, color: p.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {p.cta ? "Browse all" : "View plan"} <ArrowRight size={14} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
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
    <section id="finder" style={{ padding: "90px 0", scrollMarginTop: 80 }}>
      <div style={{ ...WRAP, maxWidth: 900 }}>
        <div style={{ background: "linear-gradient(160deg, #0f0f0f, #0a0a0a)", border: `1px solid ${BORDER}`, borderRadius: 24, padding: "clamp(28px,5vw,52px)", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
          <Reveal style={{ textAlign: "center", marginBottom: 36 }}>
            <Eyebrow>60-second finder</Eyebrow>
            <SectionTitle style={{ fontSize: "clamp(1.9rem,4vw,2.8rem)" }}>Find your plan</SectionTitle>
          </Reveal>

          <div style={{ marginBottom: 28 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DIM, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>1 · What's your goal?</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px,1fr))", gap: 12 }}>
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

          <div style={{ marginBottom: 30 }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: DIM, letterSpacing: "0.14em", textTransform: "uppercase", marginBottom: 14 }}>2 · Your diet?</p>
            <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
              {DIETS.map((d) => {
                const active = diet === d.key;
                return (
                  <button key={d.key} onClick={() => setDiet(d.key)} style={{ cursor: "pointer", background: active ? LIME : "#0c0c0c", color: active ? "#000" : "#d4d4d4", border: `1px solid ${active ? LIME : BORDER}`, borderRadius: 10, padding: "11px 22px", fontFamily: BARLOW, fontWeight: 700, fontSize: 17, textTransform: "uppercase", letterSpacing: "0.03em", transition: "all .18s" }}>
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ borderTop: `1px solid ${BORDER}`, paddingTop: 26, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
            <div>
              <div style={{ fontSize: 12, color: DIM, textTransform: "uppercase", letterSpacing: "0.1em" }}>Your match</div>
              <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 28, color: ready ? TXT : "#333", textTransform: "uppercase", marginTop: 4 }}>
                {ready ? planName : "Pick a goal and diet"}
              </div>
            </div>
            {ready ? (
              <Link href={`/plans/${slug}`} className="ff-cta" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: LIME, color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "15px 28px", borderRadius: 11, transition: "all .2s" }}>
                See my plan <ArrowRight size={16} />
              </Link>
            ) : (
              <span style={{ fontSize: 13, color: DIM }}>Select above to reveal your plan</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ BUSINESS LINES — corporate, gym, supplements, digital ═══════════════ */
function BusinessLines() {
  const lines = [
    {
      icon: Building2, accent: "#38bdf8", tag: "For companies",
      title: "Corporate Wellness",
      body: "Feed your team right. Subsidised meal programs, condition-specific plans and wellness reporting for offices across Pune.",
      href: "/corporate", cta: "Enquire for your office",
    },
    {
      icon: Users, accent: "#c084fc", tag: "For gyms & coaches",
      title: "Partner Program",
      body: "Gyms, trainers, dieticians and clinics earn on every member you refer. QR onboarding, live tracking and monthly payouts.",
      href: "/partners/apply", cta: "Become a partner",
    },
    {
      icon: Pill, accent: "#a78bfa", tag: "Powered by Nutrabay",
      title: "Supplements",
      body: "A focused, condition-matched stack with real doses, not a wall of 40 products. Educational first, order through our Nutrabay link.",
      href: "/supplements", cta: "Browse supplements",
    },
    {
      icon: FileText, accent: "#fbbf24", tag: "Anywhere in India",
      title: "Digital Plans",
      body: "Not in Pune? Get the full 30-day plan as a designed PDF, with every recipe, macro, grocery list and training plan. Cook it yourself.",
      href: "/plans/digital", cta: "Browse digital plans",
    },
  ];
  return (
    <section style={{ padding: "80px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 52 }}>
          <Eyebrow>More than meals</Eyebrow>
          <SectionTitle>A whole nutrition operating system</SectionTitle>
          <p style={{ fontSize: 15.5, color: MUTE, maxWidth: 560, margin: "18px auto 0", lineHeight: 1.6 }}>
            FitFuel is built for individuals, offices, gyms and anyone across India who wants results.
          </p>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 18 }}>
          {lines.map((l, i) => (
            <Reveal key={l.title} delay={i * 0.06}>
              <Link href={l.href} className="ff-card-hover" style={{ display: "flex", flexDirection: "column", gap: 0, background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 20, padding: "32px 30px", textDecoration: "none", height: "100%" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 13, background: `${l.accent}18`, border: `1px solid ${l.accent}33`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <l.icon size={24} color={l.accent} />
                  </div>
                  <span style={{ fontSize: 10.5, fontWeight: 800, color: l.accent, textTransform: "uppercase", letterSpacing: "0.12em", background: `${l.accent}14`, border: `1px solid ${l.accent}30`, padding: "5px 11px", borderRadius: 999 }}>{l.tag}</span>
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 30, textTransform: "uppercase", margin: "0 0 12px", color: TXT }}>{l.title}</h3>
                <p style={{ fontSize: 14.5, color: MUTE, lineHeight: 1.65, margin: "0 0 22px", flex: 1 }}>{l.body}</p>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 700, color: l.accent, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {l.cta} <ArrowRight size={15} />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ WHY FITFUEL ═══════════════ */
function WhyFitFuel() {
  const points = [
    { icon: ChefHat, t: "We control the plate", d: "We cook every meal, so your macros are measured, not self-reported. That's the difference between guessing and knowing." },
    { icon: LineChart, t: "It adapts to you", d: "Weekly weigh-ins, a consistency score and auto-recalibration. When you plateau, your targets adjust automatically." },
    { icon: MapPin, t: "Cooked in our own kitchen", d: "An FSSAI-licensed kitchen in Kharadi, Pune. Fresh daily from 4am, never frozen, never outsourced." },
  ];
  return (
    <section style={{ padding: "90px 0" }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px,1fr))", gap: 44, alignItems: "center" }}>
          <Reveal>
            <Eyebrow>Why it works</Eyebrow>
            <SectionTitle style={{ marginBottom: 18 }}>Verified intake,<br />not self-reported</SectionTitle>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginBottom: 26 }}>
              Apps ask you to log what you ate and hope you're honest. Tiffin services just feed you.
              FitFuel is the only one that cooks your food and tracks every gram, so your results are real.
            </p>
            <Link href="/how-it-works" className="ff-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: MUTE, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "14px 24px", borderRadius: 11, border: `1px solid ${BORDER}`, transition: "all .2s" }}>
              See how it works <ArrowRight size={15} />
            </Link>
          </Reveal>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {points.map((p, i) => (
              <Reveal key={p.t} delay={i * 0.08}>
                <div style={{ display: "flex", gap: 18, background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "22px 24px" }}>
                  <div style={{ width: 44, height: 44, borderRadius: 11, background: "rgba(132,204,22,0.1)", border: "1px solid rgba(132,204,22,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <p.icon size={20} color={LIME} />
                  </div>
                  <div>
                    <h3 style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 20, textTransform: "uppercase", margin: "0 0 5px", color: TXT }}>{p.t}</h3>
                    <p style={{ fontSize: 13.5, color: MUTE, lineHeight: 1.6, margin: 0 }}>{p.d}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════ REFER & EARN ═══════════════ */
function ReferBanner() {
  return (
    <section style={{ padding: "20px 0 90px" }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(120deg, rgba(132,204,22,0.14), rgba(132,204,22,0.03))", border: "1px solid rgba(132,204,22,0.25)", borderRadius: 22, padding: "clamp(30px,5vw,50px)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div style={{ maxWidth: 560 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 16 }}>
                <Gift size={18} color={LIME} />
                <span style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: "0.18em", color: LIME_LIGHT, textTransform: "uppercase" }}>Refer & earn</span>
              </div>
              <h2 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.7rem)", textTransform: "uppercase", lineHeight: 1.05, margin: "0 0 12px", color: TXT }}>
                Give <span style={{ color: LIME }}>₹200</span>, get <span style={{ color: LIME }}>₹500</span>
              </h2>
              <p style={{ fontSize: 15, color: MUTE, lineHeight: 1.6, margin: 0 }}>
                Share your code. Your friend gets ₹200 off their first plan, and you earn ₹500 in FitFuel credit for every signup. It stacks.
              </p>
            </div>
            <Link href="/dashboard/referrals" className="ff-cta" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: LIME, color: "#000", fontSize: 14, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "16px 30px", borderRadius: 11, boxShadow: "0 6px 30px rgba(132,204,22,0.35)", transition: "all .2s", flexShrink: 0 }}>
              Get your code <ArrowRight size={16} />
            </Link>
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
    <section style={{ padding: "80px 0", background: "#060606", borderTop: `1px solid ${BORDER}`, borderBottom: `1px solid ${BORDER}` }}>
      <div style={WRAP}>
        <Reveal style={{ textAlign: "center", marginBottom: 48 }}>
          <Eyebrow>Real results</Eyebrow>
          <SectionTitle>Pune is eating better</SectionTitle>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px,1fr))", gap: 18 }}>
          {quotes.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.07}>
              <div style={{ background: CARD2, border: `1px solid ${BORDER}`, borderRadius: 18, padding: "30px 28px", height: "100%" }}>
                <div style={{ display: "flex", gap: 3, marginBottom: 18 }}>
                  {[...Array(5)].map((_, k) => <Star key={k} size={15} color={LIME_LIGHT} fill={LIME_LIGHT} />)}
                </div>
                <p style={{ fontSize: 15.5, color: TXT, lineHeight: 1.6, margin: "0 0 22px", fontWeight: 500 }}>&ldquo;{t.q}&rdquo;</p>
                <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 17, textTransform: "uppercase", color: TXT }}>{t.n}</div>
                <div style={{ fontSize: 12.5, color: DIM, marginTop: 2 }}>{t.r}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ textAlign: "center", marginTop: 36 }}>
          <Link href="/testimonials" className="ff-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: MUTE, fontSize: 13, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "13px 24px", borderRadius: 11, border: `1px solid ${BORDER}`, transition: "all .2s" }}>
            Read more stories <ArrowRight size={15} />
          </Link>
        </Reveal>
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
          <SectionTitle style={{ fontSize: "clamp(2.4rem,6vw,4.4rem)" }}>
            Your first meal is<br /><span style={{ color: LIME }}>one tap away</span>
          </SectionTitle>
          <p style={{ fontSize: 16.5, color: MUTE, lineHeight: 1.6, maxWidth: 540, margin: "24px auto 0" }}>
            Breakfast plus lunch delivered tomorrow. No lock-in, no commitment. See why Pune keeps ordering.
          </p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap", marginTop: 38 }}>
            <Link href="/plans?trial=true" className="ff-cta" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: LIME, color: "#000", fontSize: 14.5, fontWeight: 800, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "17px 34px", borderRadius: 12, boxShadow: "0 6px 30px rgba(132,204,22,0.4)", transition: "all .2s" }}>
              Start your trial day <ArrowRight size={17} />
            </Link>
            <Link href="/plans" className="ff-ghost" style={{ display: "inline-flex", alignItems: "center", gap: 9, color: MUTE, fontSize: 14.5, fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", textDecoration: "none", padding: "17px 30px", borderRadius: 12, border: `1px solid ${BORDER}`, transition: "all .2s" }}>
              See all plans
            </Link>
          </div>
          <div style={{ display: "flex", gap: "10px 26px", justifyContent: "center", flexWrap: "wrap", marginTop: 34 }}>
            {["No lock-in", "Cancel anytime", "FSSAI licensed", "GST included"].map((t) => (
              <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: DIM }}>
                <Check size={14} color={LIME} />{t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
