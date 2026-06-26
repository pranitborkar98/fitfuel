"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion, AnimatePresence, useMotionValue, useSpring,
  useReducedMotion,
} from "framer-motion";
import {
  ArrowRight, CheckCircle, Activity, TrendingDown, Target, Flame,
  Utensils, Brain, Shield, Truck, ChefHat, Crown, Sparkles, LineChart,
} from "lucide-react";

/* ──────────────────────────────────────────────────────────────────
   FITFUEL — HOMEPAGE v2  ("Operating System" reposition)
   Locked tokens: bg #080808 · lime #a3e635 / #84cc16
   Type: Barlow Condensed (display + numerals), body inherits globals.
─────────────────────────────────────────────────────────────────── */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700;1,800;1,900&display=swap');`;

const LIME = "#a3e635";
const LIME_DEEP = "#84cc16";

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const fadeUp = {
  hidden:  { opacity: 0, y: 30, filter: "blur(4px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};
const stagger = { visible: { transition: { staggerChildren: 0.08 } } };
const fadeIn  = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 0.9 } } };

/* ─── The closed loop — the actual moat ─── */
const loopStages = [
  { icon: Utensils,    key: "EAT",         title: "We feed you",      desc: "Chef-cooked meals built to your exact calorie + macro target — or the plan as a PDF you cook yourself." },
  { icon: Activity,    key: "TRACK",       title: "You log",          desc: "Every gram tracked. Meals, water, workouts, weight — the system watches what's actually happening." },
  { icon: Target,      key: "SCORE",       title: "We score it",      desc: "A live 0–100 consistency score turns a messy week into one honest number you can act on." },
  { icon: TrendingDown,title: "We adapt",  key: "RECALIBRATE",        desc: "Plateau detected? Targets recalibrate automatically. The plan bends to your body, not the other way round." },
  { icon: Brain,       key: "COACH",       title: "It coaches you",   desc: "A weekly review tells you what's working and what to fix this week — like a trainer who never sleeps." },
];

/* ─── Goal entry points ─── */
const goals = [
  { name: "Weight Loss",   slug: "weight-loss",   line: "Burn fat. Keep muscle.",     accent: "#ef4444", mono: "WL" },
  { name: "Muscle Gain",   slug: "muscle-gain",   line: "Eat big. Grow strong.",      accent: "#f97316", mono: "MG", tag: "POPULAR" },
  { name: "Balanced Diet", slug: "balanced-diet", line: "Clean fuel, every day.",     accent: LIME_DEEP, mono: "BD" },
  { name: "Office Plan",   slug: "office-employee", line: "Mon–Fri. 9-to-6 fuel.",    accent: "#3b82f6", mono: "OE" },
  { name: "Jain Diet",     slug: "jain-diet",     line: "Pure. Sattvic. No roots.",   accent: "#22c55e", mono: "JD" },
  { name: "Medical Plans", slug: "medical",       line: "Thyroid · BP · Diabetes.",   accent: "#a855f7", mono: "RX", tag: "CONDITION-LED" },
];

/* ─── Tiers (ascension — never on homepage before) ─── */
const tiers = [
  {
    name: "Standard", accent: "#9ca3af", price: "From ₹400", unit: "/ day",
    line: "The meal engine.",
    feats: ["Goal-based meals, delivered", "Per-gram tracking + diary", "Consistency score", "Weekly review + recalibration"],
  },
  {
    name: "Premium", accent: LIME, price: "From ₹520", unit: "/ day", featured: true,
    line: "Meals + your supplement stack.",
    feats: ["Everything in Standard", "Supplement add-on, condition-matched", "Upgraded Morning Boost", "Priority delivery window"],
  },
  {
    name: "Luxury", accent: "#fbbf24", price: "From ₹720", unit: "/ day",
    line: "Your full-time AI trainer.",
    feats: ["Everything in Premium", "Conversational AI coach", "Concierge delivery slot", "Wearable-aware recovery (soon)"],
  },
];

/* ─── Hero console — cycling coach insights ─── */
const coachInsights = [
  { label: "WEEKLY REVIEW", text: "Protein's short — averaging 52g vs your 182g target. Let's close that gap; it protects muscle." },
  { label: "RECALIBRATED",  text: "Weight's been flat 9 days. Dropped your target 80 kcal so the trend restarts." },
  { label: "ON TRACK",      text: "4 clean days in a row. This is the streak that actually moves the scale." },
];

const stats = [
  { value: "100+", label: "Plans, incl. medical" },
  { value: "0–100", label: "Consistency engine" },
  { value: "30", label: "Day adaptive cycle" },
  { value: "4.9★", label: "Avg. rating" },
];

const testimonials = [
  { name: "Rahul M.", loc: "Kharadi", plan: "Muscle Gain · 1 Month", result: "+3kg muscle", text: "The food is genuinely good, and the app tells me when I'm slipping. The weekly review is scary accurate." },
  { name: "Priya S.", loc: "Viman Nagar", plan: "Weight Loss · Bi-Weekly", result: "−4kg in 15 days", text: "No starvation, no boiled chicken. When I plateaued it just… adjusted my target. I didn't have to figure anything out." },
  { name: "Amit K.", loc: "Kalyani Nagar", plan: "Office Plan · Monthly", result: "Quit Zomato", text: "The consistency score turned it into a game. First time I've actually stuck with a plan for a full month." },
];

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: 1280, marginLeft: "auto", marginRight: "auto",
  paddingLeft: 40, paddingRight: 40,
};

/* ─── Eyebrow / section label ─── */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 18 }}>
      <div style={{ width: 22, height: 2, background: LIME_DEEP, borderRadius: 1, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color: LIME, textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

/* ─── Magnetic CTA wrapper ─── */
function Magnetic({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });

  function onMove(e: React.MouseEvent) {
    if (reduce) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  }

  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <motion.div
        ref={ref}
        style={{ x: sx, y: sy, display: "inline-flex" }}
        onMouseMove={onMove}
        onMouseLeave={() => { x.set(0); y.set(0); }}
      >
        {children}
      </motion.div>
    </Link>
  );
}

const primaryBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 9,
  background: LIME_DEEP, color: "#000",
  fontSize: 13, fontWeight: 700,
  letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
  padding: "15px 28px", borderRadius: 10,
  boxShadow: `0 4px 30px rgba(132,204,22,0.4)`, cursor: "pointer",
};
const ghostBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", gap: 9,
  background: "transparent", color: "#9ca3af",
  fontSize: 13, fontWeight: 600,
  letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none",
  padding: "14px 22px", borderRadius: 10, border: "1px solid #2a2a2a", cursor: "pointer",
};

/* ═══════════════════════════════════════════════════════════════
   SIGNATURE — LIVE SYSTEM CONSOLE
   A compact, animating mock of the real product dashboard.
   Says "this is a system, not a menu" louder than any headline.
═══════════════════════════════════════════════════════════════ */
function SystemConsole() {
  const reduce = useReducedMotion();
  const [insight, setInsight] = useState(0);
  const [score, setScore] = useState(reduce ? 68 : 0);
  const [day, setDay] = useState(reduce ? 18 : 0);

  // Ring fill on mount
  useEffect(() => {
    if (reduce) return;
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1400, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setScore(Math.round(eased * 68));
      setDay(Math.round(eased * 18));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [reduce]);

  // Cycle coach insights
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setInsight(i => (i + 1) % coachInsights.length), 4000);
    return () => clearInterval(id);
  }, [reduce]);

  const R = 34;
  const C = 2 * Math.PI * R;
  const dash = C * (score / 100);

  return (
    <div style={{ position: "relative" }}>
      {/* Ambient glow behind console */}
      <div style={{ position: "absolute", inset: "-12%", background: `radial-gradient(closest-side, rgba(163,230,53,0.12), transparent 70%)`, filter: "blur(8px)", pointerEvents: "none" }} />

      <div style={{
        position: "relative",
        background: "linear-gradient(150deg, #0f0f0f 0%, #0a0a0a 100%)",
        border: "1px solid #1e1e1e",
        borderRadius: 22,
        boxShadow: "0 30px 80px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,255,255,0.04)",
        overflow: "hidden",
      }}>
        {/* Top accent */}
        <div style={{ height: 3, background: `linear-gradient(90deg, transparent, ${LIME_DEEP}, transparent)` }} />

        {/* Console chrome bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #161616" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ width: 22, height: 22, borderRadius: 7, background: LIME_DEEP, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
              <Flame size={13} color="#000" />
            </span>
            <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontWeight: 800, fontSize: 14, color: "#fff", letterSpacing: "-0.01em" }}>Your System</span>
          </div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 600, color: LIME, letterSpacing: "0.08em" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: LIME, animation: reduce ? "none" : "ff-pulse 1.8s ease-in-out infinite" }} />
            LIVE
          </span>
        </div>

        <div style={{ padding: "22px 20px 20px" }}>
          {/* Active plan row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.2em", color: "#6b7280", textTransform: "uppercase", marginBottom: 7 }}>Active Plan</div>
              <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 30, fontWeight: 900, lineHeight: 0.95, color: "#fff", textTransform: "uppercase" }}>Weight Loss</div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#000", background: LIME_DEEP, padding: "2px 8px", borderRadius: 5, letterSpacing: "0.05em" }}>STANDARD</span>
                <span style={{ fontSize: 11, color: "#6b7280" }}>VEG · Day {day} of 30</span>
              </div>
            </div>

            {/* Consistency ring */}
            <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
              <svg width="84" height="84" viewBox="0 0 84 84">
                <circle cx="42" cy="42" r={R} fill="none" stroke="#1c1c1c" strokeWidth="7" />
                <circle
                  cx="42" cy="42" r={R} fill="none" stroke={LIME} strokeWidth="7" strokeLinecap="round"
                  strokeDasharray={`${dash} ${C}`} transform="rotate(-90 42 42)"
                  style={{ transition: reduce ? "none" : "stroke-dasharray 0.1s linear" }}
                />
              </svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 26, fontWeight: 900, color: "#fff", lineHeight: 1 }}>{score}</span>
                <span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", marginTop: 1 }}>SCORE</span>
              </div>
            </div>
          </div>

          {/* Macro track row */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 20 }}>
            {[
              { k: "PROTEIN", v: "108", t: "182g", pct: 0.59, c: LIME },
              { k: "CARBS", v: "142", t: "165g", pct: 0.86, c: "#60a5fa" },
              { k: "CALORIES", v: "1,120", t: "1,380", pct: 0.81, c: "#f59e0b" },
            ].map(m => (
              <div key={m.k} style={{ background: "#0c0c0c", border: "1px solid #161616", borderRadius: 11, padding: "11px 12px" }}>
                <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", color: "#6b7280" }}>{m.k}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "4px 0 8px" }}>
                  <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 19, fontWeight: 800, color: "#fff", lineHeight: 1 }}>{m.v}</span>
                  <span style={{ fontSize: 10, color: "#4b5563" }}>/ {m.t}</span>
                </div>
                <div style={{ height: 4, background: "#181818", borderRadius: 99, overflow: "hidden" }}>
                  <div style={{ width: `${m.pct * 100}%`, height: "100%", background: m.c, borderRadius: 99 }} />
                </div>
              </div>
            ))}
          </div>

          {/* Coach insight — cycling */}
          <div style={{ background: "linear-gradient(135deg, rgba(163,230,53,0.07), rgba(163,230,53,0.02))", border: "1px solid rgba(163,230,53,0.18)", borderRadius: 13, padding: "14px 15px", minHeight: 92 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
              <Sparkles size={13} color={LIME} />
              <AnimatePresence mode="wait">
                <motion.span
                  key={coachInsights[insight].label}
                  initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.3 }}
                  style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: LIME }}
                >
                  {coachInsights[insight].label}
                </motion.span>
              </AnimatePresence>
            </div>
            <AnimatePresence mode="wait">
              <motion.p
                key={coachInsights[insight].text}
                initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                transition={{ duration: 0.3 }}
                style={{ fontSize: 13, lineHeight: 1.5, color: "#d1d5db", margin: 0 }}
              >
                {coachInsights[insight].text}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══ LOOP STAGE ═══ */
function LoopStage({ stage, i }: { stage: typeof loopStages[0]; i: number }) {
  const Icon = stage.icon;
  return (
    <motion.div variants={fadeUp} style={{ position: "relative" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Icon size={20} color={LIME} />
        </div>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 13, fontWeight: 800, letterSpacing: "0.18em", color: "#3f3f46" }}>
          {String(i + 1).padStart(2, "0")} · {stage.key}
        </span>
      </div>
      <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 900, textTransform: "uppercase", color: "#fff", margin: "0 0 8px", letterSpacing: "0.01em", lineHeight: 1 }}>{stage.title}</h3>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: "#9ca3af", margin: 0 }}>{stage.desc}</p>
    </motion.div>
  );
}

/* ═══ GOAL CARD ═══ */
function GoalCard({ goal }: { goal: typeof goals[0] }) {
  const [hover, setHover] = useState(false);
  return (
    <Link href={goal.slug === "medical" ? "/plans?category=medical" : `/plans/${goal.slug}`} style={{ textDecoration: "none" }}>
      <motion.div
        variants={fadeUp}
        onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
        style={{
          position: "relative", overflow: "hidden",
          background: "#0b0b0b",
          border: `1px solid ${hover ? goal.accent : "#1a1a1a"}`,
          borderRadius: 16, padding: "26px 24px",
          transition: "border-color 0.25s ease, transform 0.25s ease",
          transform: hover ? "translateY(-3px)" : "none",
          height: "100%",
        }}
      >
        {/* Ghost monogram */}
        <span style={{
          position: "absolute", right: -8, top: -22,
          fontFamily: "'Barlow Condensed',sans-serif", fontSize: 110, fontWeight: 900, fontStyle: "italic",
          color: hover ? `${goal.accent}1f` : "#101010", transition: "color 0.3s ease", pointerEvents: "none", lineHeight: 1,
        }}>{goal.mono}</span>

        {goal.tag && (
          <span style={{ display: "inline-block", fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#000", background: goal.accent, padding: "3px 8px", borderRadius: 5, marginBottom: 14 }}>{goal.tag}</span>
        )}
        <div style={{ position: "relative" }}>
          <div style={{ width: 32, height: 3, background: goal.accent, borderRadius: 2, marginBottom: 16 }} />
          <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 28, fontWeight: 900, textTransform: "uppercase", color: "#fff", margin: "0 0 6px", letterSpacing: "0.01em", lineHeight: 1 }}>{goal.name}</h3>
          <p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{goal.line}</p>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 18, color: hover ? goal.accent : "#52525b", transition: "color 0.25s ease", fontSize: 12, fontWeight: 600, letterSpacing: "0.04em" }}>
            View plans <ArrowRight size={13} />
          </div>
        </div>
      </motion.div>
    </Link>
  );
}

/* ═══ TIER CARD ═══ */
function TierCard({ tier }: { tier: typeof tiers[0] }) {
  return (
    <motion.div variants={fadeUp} style={{
      position: "relative",
      background: tier.featured ? "linear-gradient(160deg, #101206, #0a0a0a)" : "#0a0a0a",
      border: `1px solid ${tier.featured ? "rgba(163,230,53,0.4)" : "#1a1a1a"}`,
      borderRadius: 18, padding: "30px 28px", height: "100%",
      boxShadow: tier.featured ? "0 20px 60px rgba(163,230,53,0.08)" : "none",
    }}>
      {tier.featured && (
        <span style={{ position: "absolute", top: 18, right: 18, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#000", background: LIME, padding: "4px 9px", borderRadius: 6 }}>
          <Crown size={11} /> MOST PICKED
        </span>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 5 }}>
        <span style={{ width: 9, height: 9, borderRadius: "50%", background: tier.accent }} />
        <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 24, fontWeight: 900, textTransform: "uppercase", color: "#fff", margin: 0, letterSpacing: "0.01em" }}>{tier.name}</h3>
      </div>
      <p style={{ fontSize: 13, color: "#9ca3af", margin: "0 0 20px" }}>{tier.line}</p>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 22 }}>
        <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 34, fontWeight: 900, color: tier.featured ? LIME : "#fff", lineHeight: 1 }}>{tier.price}</span>
        <span style={{ fontSize: 13, color: "#6b7280" }}>{tier.unit}</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {tier.feats.map(f => (
          <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
            <CheckCircle size={15} color={tier.featured ? LIME : "#52525b"} style={{ flexShrink: 0, marginTop: 1 }} />
            <span style={{ fontSize: 13.5, color: "#d1d5db", lineHeight: 1.4 }}>{f}</span>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

/* ═══ ANIMATED STAT ═══ */
function ProofStat({ value, label }: { value: string; label: string }) {
  return (
    <div style={{ textAlign: "center" }}>
      <div style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(2.4rem,5vw,3.4rem)", fontWeight: 900, color: "#fff", lineHeight: 1, letterSpacing: "0.01em" }}>{value}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.06em", marginTop: 8, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

/* ═══════════════════════════ PAGE ═══════════════════════════ */
export default function HomePage() {
  const reduce = useReducedMotion();

  return (
    <div style={{ background: "#080808", color: "#fff", overflow: "hidden" }}>
      <style>{`
        ${FONT_IMPORT}
        @keyframes ff-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.8)} }
        @keyframes ff-drift { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        body { font-family: inherit; }

        .ff-display {
          font-family:'Barlow Condensed','Impact',sans-serif; font-weight:900;
          text-transform:uppercase; letter-spacing:0.005em; line-height:0.95;
          font-size:clamp(2.2rem,4.2vw,3.7rem); color:#f9fafb;
        }
        .ff-hero-h {
          font-family:'Barlow Condensed','Impact',sans-serif; font-weight:900;
          font-style:italic; text-transform:uppercase;
          letter-spacing:-0.005em; line-height:0.9;
          font-size:clamp(2.6rem,5vw,4.6rem); color:#fff;
        }
        .ff-hero-grid    { display:grid; grid-template-columns:1.05fr 0.95fr; gap:64px; align-items:center; }
        .ff-loop-grid    { display:grid; grid-template-columns:repeat(5,1fr); gap:28px; }
        .ff-goals-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .ff-tiers-grid   { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .ff-ways-grid    { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .ff-stats-grid   { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .ff-tg-grid      { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }

        @media(max-width:1000px){
          .ff-hero-grid  { grid-template-columns:1fr; gap:48px; }
          .ff-hero-card  { order:-1; max-width:440px; margin:0 auto; width:100%; }
          .ff-loop-grid  { grid-template-columns:repeat(2,1fr); gap:28px 24px; }
          .ff-goals-grid { grid-template-columns:repeat(2,1fr); }
          .ff-tiers-grid { grid-template-columns:1fr; }
          .ff-ways-grid  { grid-template-columns:1fr; }
          .ff-tg-grid    { grid-template-columns:1fr; }
        }
        @media(max-width:640px){
          .ff-loop-grid  { grid-template-columns:1fr; }
          .ff-goals-grid { grid-template-columns:1fr; }
          .ff-stats-grid { grid-template-columns:repeat(2,1fr); gap:32px 20px; }
          .ff-wrap-pad   { padding-left:22px !important; padding-right:22px !important; }
          .ff-cta-grid   { grid-template-columns:1fr !important; }
          .ff-cta-grid > div:first-child { border-right:none !important; border-bottom:1px solid #1a1a1a !important; }
        }
      `}</style>

      {/* ══════════════ HERO ══════════════ */}
      <section style={{ position: "relative", padding: "120px 0 100px", overflow: "hidden" }}>
        {/* noise + glow */}
        <div style={{ position: "absolute", inset: 0, backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.03'/%3E%3C/svg%3E\")", backgroundSize: "256px 256px", opacity: 0.5, pointerEvents: "none" }} />
        <div style={{ position: "absolute", top: -160, right: -120, width: 620, height: 620, background: "radial-gradient(circle, rgba(163,230,53,0.08) 0%, transparent 62%)", pointerEvents: "none" }} />

        <div style={{ ...WRAP }} className="ff-wrap-pad">
          <div className="ff-hero-grid">
            {/* Left — thesis */}
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(163,230,53,0.07)", border: "1px solid rgba(163,230,53,0.2)", borderRadius: 99, padding: "7px 15px", marginBottom: 28 }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: LIME, animation: reduce ? "none" : "ff-pulse 1.8s ease-in-out infinite" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: LIME, letterSpacing: "0.04em" }}>Goal-based meal plans + tracking · live in Pune</span>
                </div>
              </motion.div>

              <motion.h1 variants={fadeUp} className="ff-hero-h" style={{ margin: "0 0 24px" }}>
                Not a meal plan.<br />
                A <span style={{ color: LIME }}>health system.</span>
              </motion.h1>

              <motion.p variants={fadeUp} style={{ fontSize: 17, lineHeight: 1.65, color: "#9ca3af", maxWidth: 480, margin: "0 0 36px" }}>
                Tell us your body and your goal. We calculate what to eat, cook it, deliver it,
                track every gram, and adjust the plan when you plateau. The food is just the start.
              </motion.p>

              <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 30 }}>
                <Magnetic href="/plans?trial=true">
                  <span style={primaryBtn}>Start with a ₹400 trial day <ArrowRight size={15} /></span>
                </Magnetic>
                <Magnetic href="/tdee-calculator">
                  <span style={ghostBtn}>Calculate my targets</span>
                </Magnetic>
              </motion.div>

              <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 22px" }}>
                {["Cancel anytime", "FSSAI kitchen", "No app lock-in"].map(t => (
                  <span key={t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "#71717a" }}>
                    <CheckCircle size={13} color={LIME_DEEP} /> {t}
                  </span>
                ))}
              </motion.div>
            </motion.div>

            {/* Right — live console (signature) */}
            <motion.div className="ff-hero-card" initial={{ opacity: 0, y: 30, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}>
              <SystemConsole />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════ THE LOOP — the moat ══════════════ */}
      <section style={{ padding: "100px 0", background: "#060606", borderTop: "1px solid #131313", borderBottom: "1px solid #131313" }}>
        <div style={WRAP} className="ff-wrap-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>The closed loop</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 16, maxWidth: 760 }}>
              Anyone can cook you dinner.<br />Nobody else closes the loop.
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 600, margin: "0 0 56px" }}>
              Five steps that run every single day. Food goes in, data comes back, the plan
              corrects itself. This is the part competitors can't copy with a kitchen.
            </motion.p>

            <div className="ff-loop-grid">
              {loopStages.map((s, i) => <LoopStage key={s.key} stage={s} i={i} />)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ GOALS ══════════════ */}
      <section id="plans" style={{ padding: "100px 0" }}>
        <div style={WRAP} className="ff-wrap-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Find your plan</Eyebrow></motion.div>
            <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 48 }}>
              <h2 className="ff-display" style={{ margin: 0, maxWidth: 620 }}>
                100+ plans, built for your goal.
              </h2>
              <Link href="/plans" style={{ ...ghostBtn, whiteSpace: "nowrap" }}>Browse all plans <ArrowRight size={14} /></Link>
            </motion.div>

            <div className="ff-goals-grid">
              {goals.map(g => <GoalCard key={g.slug} goal={g} />)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ TIERS ══════════════ */}
      <section style={{ padding: "100px 0", background: "#060606", borderTop: "1px solid #131313", borderBottom: "1px solid #131313" }}>
        <div style={WRAP} className="ff-wrap-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Plans &amp; tiers</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 16, maxWidth: 640 }}>
              Go as deep as you want.
            </motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 560, margin: "0 0 48px" }}>
              Every tier includes the tracking and weekly review. Higher tiers add more on top.
            </motion.p>

            <div className="ff-tiers-grid">
              {tiers.map(t => <TierCard key={t.name} tier={t} />)}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ TWO WAYS IN ══════════════ */}
      <section style={{ padding: "100px 0" }}>
        <div style={WRAP} className="ff-wrap-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Two ways to start</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 48, maxWidth: 620 }}>
              Two ways to start.
            </motion.h2>

            <div className="ff-ways-grid">
              {/* Delivered */}
              <motion.div variants={fadeUp} style={{ background: "#0b0b0b", border: "1px solid #1a1a1a", borderRadius: 18, padding: "30px 28px" }}>
                <Truck size={26} color={LIME} style={{ marginBottom: 18 }} />
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>We cook & deliver</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#9ca3af", margin: "0 0 22px" }}>
                  Fresh, chef-cooked meals at your door in Kharadi & Viman Nagar. Start with a single ₹400 trial day.
                </p>
                <Link href="/plans?trial=true" style={{ ...primaryBtn, fontSize: 12 }}>Order a trial day <ArrowRight size={14} /></Link>
              </motion.div>

              {/* Digital */}
              <motion.div variants={fadeUp} style={{ background: "#0b0b0b", border: "1px solid #1a1a1a", borderRadius: 18, padding: "30px 28px" }}>
                <ChefHat size={26} color={LIME} style={{ marginBottom: 18 }} />
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>You cook it yourself</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#9ca3af", margin: "0 0 18px" }}>
                  The full 30-day plan as a PDF — every recipe, macro, and grocery list. From <span style={{ color: LIME, fontWeight: 600 }}>₹299</span>, instant download.
                </p>
                <Link href="/plans/digital" style={{ ...ghostBtn, fontSize: 12 }}>Browse digital plans <ArrowRight size={14} /></Link>
              </motion.div>

              {/* TDEE free tool */}
              <motion.div variants={fadeUp} style={{ background: "linear-gradient(160deg, #101206, #0a0a0a)", border: "1px solid rgba(163,230,53,0.25)", borderRadius: 18, padding: "30px 28px" }}>
                <LineChart size={26} color={LIME} style={{ marginBottom: 18 }} />
                <h3 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Just curious? Start free.</h3>
                <p style={{ fontSize: 14, lineHeight: 1.6, color: "#9ca3af", margin: "0 0 22px" }}>
                  Get your exact calorie + macro targets in 30 seconds. No sign-up. See which plans hit your number.
                </p>
                <Link href="/tdee-calculator" style={{ ...primaryBtn, fontSize: 12 }}>Calculate my targets <ArrowRight size={14} /></Link>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ PROOF ══════════════ */}
      <section style={{ padding: "100px 0", background: "#060606", borderTop: "1px solid #131313", borderBottom: "1px solid #131313" }}>
        <div style={WRAP} className="ff-wrap-pad">
          {/* stats */}
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} className="ff-stats-grid" style={{ marginBottom: 72 }}>
            {stats.map(s => (
              <motion.div key={s.label} variants={fadeUp}><ProofStat value={s.value} label={s.label} /></motion.div>
            ))}
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Real results</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 44, maxWidth: 560 }}>
              Real people. Real results.
            </motion.h2>

            <div className="ff-tg-grid">
              {testimonials.map(t => (
                <motion.div key={t.name} variants={fadeUp} style={{ background: "#0b0b0b", border: "1px solid #1a1a1a", borderRadius: 16, padding: "26px 24px", display: "flex", flexDirection: "column" }}>
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)", borderRadius: 7, padding: "4px 10px", marginBottom: 18 }}>
                    <Flame size={12} color={LIME} />
                    <span style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: 14, fontWeight: 800, color: LIME, letterSpacing: "0.03em" }}>{t.result}</span>
                  </div>
                  <p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#d1d5db", margin: "0 0 22px", flex: 1 }}>"{t.text}"</p>
                  <div style={{ borderTop: "1px solid #181818", paddingTop: 16 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.name} <span style={{ color: "#52525b", fontWeight: 500 }}>· {t.loc}</span></div>
                    <div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{t.plan}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════ FINAL CTA ══════════════ */}
      <section style={{ padding: "100px 0 84px" }}>
        <div style={WRAP} className="ff-wrap-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeIn}>
            <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(145deg, #0e0e0e, #0a0a0a)", border: "1px solid rgba(163,230,53,0.22)", borderRadius: 24 }}>
              <div style={{ position: "absolute", bottom: -120, right: -120, width: 560, height: 560, background: "radial-gradient(circle, rgba(163,230,53,0.08), transparent 60%)", pointerEvents: "none" }} />
              <div style={{ height: 2, background: `linear-gradient(90deg, transparent, ${LIME_DEEP}, transparent)` }} />

              <div className="ff-cta-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }}>
                <div style={{ padding: "64px 56px", borderRight: "1px solid #1a1a1a" }}>
                  <Eyebrow>No risk</Eyebrow>
                  <h2 style={{ fontFamily: "'Barlow Condensed',sans-serif", fontSize: "clamp(2.6rem,5vw,4.4rem)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 0.98, margin: "12px 0 20px", color: "#fff" }}>
                    Try the system<br />for <span style={{ color: LIME }}>₹400.</span>
                  </h2>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "#9ca3af", maxWidth: 340, margin: 0 }}>
                    One trial day. Breakfast + lunch, cooked fresh and delivered tomorrow. No subscription, no lock-in. Just exceptional food.
                  </p>
                </div>

                <div style={{ padding: "64px 56px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 30 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {["Fresh, chef-cooked meals daily", "Goal-based nutrition, not guesswork", "Cancel anytime, no questions asked"].map(item => (
                      <div key={item} style={{ display: "flex", alignItems: "center", gap: 14 }}>
                        <div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <CheckCircle size={13} color={LIME} />
                        </div>
                        <span style={{ fontSize: 14, color: "#d1d5db" }}>{item}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
                    <Magnetic href="/plans?trial=true"><span style={primaryBtn}>Order trial day <ArrowRight size={14} /></span></Magnetic>
                    <Link href="/plans" style={ghostBtn}>View all plans</Link>
                  </div>
                  <p style={{ fontSize: 12, color: "#52525b", margin: 0, display: "inline-flex", alignItems: "center", gap: 7 }}>
                    <Shield size={12} /> GST 5% applicable · Delivery in Kharadi &amp; Viman Nagar, Pune
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}