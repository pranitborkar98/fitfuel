"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, CheckCircle, Lock } from "lucide-react";

// ─── Constants ────────────────────────────────────────────────────────────────

const EASE_OUT_EXPO = [0.16, 1, 0.3, 1] as [number, number, number, number];

// ─── Types ────────────────────────────────────────────────────────────────────

type Diet     = "veg" | "egg" | "nonveg" | "jain";
type Duration = "trial" | "weekly" | "biweekly" | "monthly_ex" | "monthly" | "two_month" | "three_month";
type Meal     = "bl" | "sd" | "all";
type Tier     = "standard" | "premium" | "luxury";

// ─── Pricing ─────────────────────────────────────────────────────────────────

const STANDARD: Record<Duration, Record<Meal, number>> = {
  trial:       { bl: 400,   sd: 400,   all: 750   },
  weekly:      { bl: 2700,  sd: 2700,  all: 4900  },
  biweekly:    { bl: 5775,  sd: 5775,  all: 9720  },
  monthly_ex:  { bl: 7560,  sd: 7560,  all: 13860 },
  monthly:     { bl: 9500,  sd: 9500,  all: 16999 },
  two_month:   { bl: 18900, sd: 18900, all: 33000 },
  three_month: { bl: 27450, sd: 27450, all: 47250 },
};

const PREMIUM: Record<Duration, Record<Meal, number>> = {
  trial:       { bl: 500,   sd: 500,   all: 950   },
  weekly:      { bl: 3375,  sd: 3375,  all: 6125  },
  biweekly:    { bl: 7200,  sd: 7200,  all: 12150 },
  monthly_ex:  { bl: 9450,  sd: 9450,  all: 17325 },
  monthly:     { bl: 11875, sd: 11875, all: 21250 },
  two_month:   { bl: 23625, sd: 23625, all: 41250 },
  three_month: { bl: 34313, sd: 34313, all: 59063 },
};

const LUXURY: Record<Duration, Record<Meal, number>> = {
  trial:       { bl: 600,   sd: 600,   all: 1125  },
  weekly:      { bl: 4050,  sd: 4050,  all: 7350  },
  biweekly:    { bl: 8663,  sd: 8663,  all: 14580 },
  monthly_ex:  { bl: 11340, sd: 11340, all: 20790 },
  monthly:     { bl: 14250, sd: 14250, all: 25499 },
  two_month:   { bl: 28350, sd: 28350, all: 49500 },
  three_month: { bl: 41175, sd: 41175, all: 70875 },
};

const PRICING: Record<Tier, Record<Duration, Record<Meal, number>>> = {
  standard: STANDARD,
  premium:  PREMIUM,
  luxury:   LUXURY,
};

function getPrice(tier: Tier, dur: Duration, meal: Meal, diet: Diet): number {
  const p = PRICING[tier][dur][meal];
  if (tier === "standard" && dur === "monthly_ex" && meal !== "all" && diet === "nonveg") return 7600;
  return p;
}

// ─── Label data ───────────────────────────────────────────────────────────────

const DURATIONS: { id: Duration; label: string; sub: string }[] = [
  { id: "trial",       label: "Trial day",                sub: "Try before you commit" },
  { id: "weekly",      label: "Weekly",                   sub: "7 days"                },
  { id: "biweekly",    label: "Bi-weekly",                sub: "15 days"               },
  { id: "monthly_ex",  label: "Monthly (excl. weekends)", sub: "~22 days"              },
  { id: "monthly",     label: "1 Month",                  sub: "Full month"            },
  { id: "two_month",   label: "2 Months",                 sub: "Best value"            },
  { id: "three_month", label: "3 Months",                 sub: "Maximum savings"       },
];

const DIETS: { id: Diet; label: string; dot: string; note?: string }[] = [
  { id: "veg",    label: "Vegetarian",     dot: "#22c55e" },
  { id: "egg",    label: "Eggetarian",     dot: "#f59e0b" },
  { id: "nonveg", label: "Non-Vegetarian", dot: "#ef4444" },
  { id: "jain",   label: "Jain",           dot: "#a78bfa", note: "Veg only" },
];

const MEALS: { id: Meal; label: string; time: string }[] = [
  { id: "bl",  label: "Breakfast + Lunch", time: "Morning"  },
  { id: "sd",  label: "Snack + Dinner",    time: "Evening"  },
  { id: "all", label: "All 4 meals",       time: "Full day" },
];

const LIFESTYLE_TAGS = [
  "PCOS", "Diabetic-friendly", "Post-surgery recovery",
  "Weight loss (clinical)", "Thyroid", "Heart health", "High-protein athletic",
];

const PREMIUM_FEATURES = [
  "Everything in Standard",
  "Supplements with meals — whey, creatine, vitamins, omega-3, pre-workout",
  "Full macro + micro nutrition tracker",
  "Exercise library + personalised workout plan",
  "Priority WhatsApp support",
  "Weekly PDF check-in report (automated via n8n)",
];

const LUXURY_FEATURES = [
  "Everything in Premium",
  "AI Personal Trainer — daily plans, form feedback, progressive overload",
  "Concierge onboarding — 1-on-1 video call with head coach",
  "Fully custom meal plan by nutritionist",
  "Wellness add-ons — massage, spa, in-home yoga (Pune partners)",
  "Quarterly body transformation report",
  "Priority delivery — first slot of the day",
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmt(n: number): string {
  return "₹" + n.toLocaleString("en-IN");
}

// ─── Section label ────────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
      <div style={{ width: 24, height: 2, background: "#84cc16", flexShrink: 0, borderRadius: 1 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.2em", color: "#84cc16", textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

// ─── Waitlist modal ───────────────────────────────────────────────────────────

function WaitlistModal({ tier, onClose }: { tier: string; onClose: () => void }) {
  const [email, setEmail] = useState("");
  const [done, setDone]   = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setDone(true);
  }

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 100,
      display: "flex", alignItems: "center", justifyContent: "center",
      background: "rgba(0,0,0,0.85)", padding: "0 16px",
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
        style={{
          width: "100%", maxWidth: 440,
          background: "#0f0f0f",
          border: "1px solid #242424",
          borderRadius: 20, padding: "28px 24px",
          boxShadow: "0 32px 80px rgba(0,0,0,0.6)",
        }}
      >
        {done ? (
          <div style={{ textAlign: "center", padding: "12px 0" }}>
            <div style={{ fontSize: 44, marginBottom: 16 }}>🎉</div>
            <h3 style={{ fontSize: 22, fontWeight: 700, color: "#f9fafb", marginBottom: 8 }}>You're on the list</h3>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, marginBottom: 28 }}>
              We'll notify you at <span style={{ color: "#f9fafb" }}>{email}</span> the moment {tier} launches.
            </p>
            <button onClick={onClose} style={{ fontSize: 13, color: "#84cc16", background: "none", border: "none", cursor: "pointer", fontWeight: 600 }}>
              Close
            </button>
          </div>
        ) : (
          <>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, background: "#84cc16", borderRadius: "50%" }} />
              <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.15em", color: "#84cc16", textTransform: "uppercase" }}>
                {tier} tier
              </span>
            </div>
            <h3 style={{ fontSize: 22, fontWeight: 800, color: "#f9fafb", marginBottom: 8, letterSpacing: "-0.02em" }}>
              Join the waitlist
            </h3>
            <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.7, marginBottom: 24 }}>
              Be the first to know when it launches. One email, no spam.
            </p>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="your@email.com"
                style={{
                  width: "100%", background: "#161616",
                  border: "1px solid #242424", borderRadius: 10,
                  padding: "13px 16px", fontSize: 14,
                  color: "#f9fafb", outline: "none",
                  marginBottom: 12, boxSizing: "border-box",
                }}
                onFocus={e => (e.target.style.borderColor = "rgba(132,204,22,0.5)")}
                onBlur={e  => (e.target.style.borderColor = "#242424")}
              />
              <button
                type="submit"
                style={{
                  width: "100%", background: "#84cc16", color: "#000",
                  fontWeight: 800, fontSize: 13, padding: "13px 0",
                  borderRadius: 10, border: "none", cursor: "pointer",
                  letterSpacing: "0.07em", textTransform: "uppercase",
                  boxShadow: "0 4px 20px rgba(132,204,22,0.35)",
                }}
              >
                Notify me
              </button>
            </form>
            <button
              onClick={onClose}
              style={{ width: "100%", marginTop: 14, fontSize: 13, color: "#4b5563", background: "none", border: "none", cursor: "pointer" }}
            >
              Cancel
            </button>
          </>
        )}
      </motion.div>
    </div>
  );
}

// ─── Locked tier card ─────────────────────────────────────────────────────────

function LockedTier({
  title, phase, multiplier, features, previewPrices, onWaitlist,
}: {
  title: string;
  phase: string;
  multiplier: string;
  accent: string;
  features: string[];
  previewPrices: { label: string; price: number }[];
  onWaitlist: () => void;
}) {
  return (
    <div style={{ position: "relative" }}>
      {/* Blurred card underneath */}
      <div style={{
        background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
        border: "1px solid #1e1e1e",
        borderRadius: 20,
        padding: "28px 24px",
        filter: "blur(3px)",
        userSelect: "none",
        pointerEvents: "none",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
          <h2 style={{
            fontFamily: "'Barlow Condensed', sans-serif",
            fontSize: "clamp(2rem, 8vw, 3rem)", fontWeight: 900, letterSpacing: "-0.01em",
            color: "#f9fafb", textTransform: "uppercase", lineHeight: 1,
          }}>
            {title}
          </h2>
          <span style={{
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            color: "#6b7280", border: "1px solid #242424",
            padding: "4px 12px", borderRadius: 999, textTransform: "uppercase",
          }}>
            {multiplier}
          </span>
        </div>
        {/* Preview prices — stack on mobile */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 24 }}>
          {previewPrices.map(p => (
            <div key={p.label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid #1e1e1e", borderRadius: 12, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, color: "#6b7280", marginBottom: 6 }}>{p.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: "#f9fafb" }}>{fmt(p.price)}</div>
            </div>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {features.slice(0, 4).map(f => (
            <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: "#6b7280" }}>
              <CheckCircle size={14} style={{ color: "#374151", flexShrink: 0, marginTop: 2 }} />
              {f}
            </div>
          ))}
        </div>
      </div>

      {/* Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        borderRadius: 20,
        background: "rgba(8,8,8,0.72)",
        backdropFilter: "blur(2px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        gap: 14, padding: "24px 16px",
        border: "1px solid #1e1e1e",
      }}>
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(255,255,255,0.04)", border: "1px solid #242424",
          borderRadius: 999, padding: "5px 16px",
          fontSize: 10, fontWeight: 700, letterSpacing: "0.18em",
          color: "#6b7280", textTransform: "uppercase",
        }}>
          <Lock size={10} />
          Coming — {phase}
        </div>

        <h2 style={{
          fontFamily: "'Barlow Condensed', sans-serif",
          fontSize: "clamp(2.5rem, 10vw, 3.5rem)", fontWeight: 900, color: "#f9fafb",
          textTransform: "uppercase", lineHeight: 1,
          letterSpacing: "-0.01em", textAlign: "center",
        }}>
          {title}
        </h2>

        <p style={{ fontSize: 13, color: "#9ca3af", textAlign: "center", maxWidth: 300, lineHeight: 1.7 }}>
          {features[1]}
        </p>

        <button
          onClick={onWaitlist}
          style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            background: "rgba(132,204,22,0.08)",
            color: "#a3e635",
            fontWeight: 800, fontSize: 13,
            padding: "11px 24px",
            borderRadius: 10,
            border: "1px solid rgba(132,204,22,0.28)",
            cursor: "pointer",
            letterSpacing: "0.07em", textTransform: "uppercase",
          }}
        >
          Join waitlist <ArrowRight size={14} />
        </button>
      </div>
    </div>
  );
}

// ─── Step label ───────────────────────────────────────────────────────────────

function StepLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
      <span style={{
        width: 24, height: 24, background: "rgba(132,204,22,0.12)",
        border: "1px solid rgba(132,204,22,0.25)", borderRadius: "50%",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontSize: 11, fontWeight: 800, color: "#84cc16", flexShrink: 0,
      }}>
        {n}
      </span>
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.16em", color: "#9ca3af", textTransform: "uppercase" }}>
        {children}
      </span>
    </div>
  );
}

// ─── Mobile pricing table — replaces <table> on small screens ────────────────

function MobilePricingRows({ dur, meal, diet }: { dur: Duration; meal: Meal; diet: Diet }) {
  const [selected, setSelected] = useState<Duration>(dur);

  return (
    <div>
      {DURATIONS.map((d, i) => {
        const active = d.id === selected;
        return (
          <div
            key={d.id}
            onClick={() => setSelected(d.id)}
            style={{
              padding: "14px 16px",
              borderBottom: i < DURATIONS.length - 1 ? "1px solid #141414" : "none",
              background: active ? "rgba(132,204,22,0.05)" : "transparent",
              cursor: "pointer",
            }}
          >
            {/* Row header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: active ? 12 : 0 }}>
              <span style={{ fontSize: 13, fontWeight: active ? 600 : 400, color: active ? "#f9fafb" : "#9ca3af" }}>
                {d.label}
              </span>
              {active && (
                <span style={{
                  fontSize: 10, fontWeight: 800,
                  background: "#84cc16", color: "#000",
                  padding: "2px 8px", borderRadius: 999,
                }}>
                  selected
                </span>
              )}
            </div>
            {/* Prices grid — always visible when active, collapsed otherwise */}
            {active && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6 }}>
                {(["bl", "sd", "all"] as Meal[]).map(m => {
                  const p  = getPrice("standard", d.id, m, diet);
                  const hi = m === meal;
                  return (
                    <div key={m} style={{
                      background: hi ? "rgba(132,204,22,0.1)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${hi ? "rgba(132,204,22,0.4)" : "#1e1e1e"}`,
                      borderRadius: 8, padding: "8px 10px",
                    }}>
                      <div style={{ fontSize: 9, color: "#6b7280", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                        {m === "bl" ? "B+L" : m === "sd" ? "S+D" : "All 4"}
                      </div>
                      <div style={{ fontSize: 13, fontWeight: hi ? 700 : 500, color: hi ? "#84cc16" : "#d1d5db" }}>
                        {fmt(p)}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            {/* Collapsed — show just the selected meal price */}
            {!active && (
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>
                {fmt(getPrice("standard", d.id, meal, diet))} · {d.sub}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function PlansPage() {
  const [diet, setDiet]         = useState<Diet>("veg");
  const [dur,  setDur]          = useState<Duration>("monthly_ex");
  const [meal, setMeal]         = useState<Meal>("sd");
  const [waitlist, setWl]       = useState<string | null>(null);
  const [lifeDone, setLifeDone] = useState(false);

  const price    = useMemo(() => getPrice("standard", dur, meal, diet), [dur, meal, diet]);
  const priceGST = useMemo(() => Math.round(price * 1.05), [price]);

  const durObj  = DURATIONS.find(d => d.id === dur)!;
  const mealObj = MEALS.find(m => m.id === meal)!;
  const dietObj = DIETS.find(d => d.id === diet)!;

  const premPreview = [
    { label: "Trial day", price: getPrice("premium", "trial",   meal, diet) },
    { label: "Weekly",    price: getPrice("premium", "weekly",  meal, diet) },
    { label: "Monthly",   price: getPrice("premium", "monthly", meal, diet) },
  ];
  const luxPreview = [
    { label: "Trial day", price: getPrice("luxury", "trial",   meal, diet) },
    { label: "Weekly",    price: getPrice("luxury", "weekly",  meal, diet) },
    { label: "Monthly",   price: getPrice("luxury", "monthly", meal, diet) },
  ];

  return (
    <div style={{ background: "#080808", minHeight: "100vh", color: "#f9fafb" }}>

      {waitlist && <WaitlistModal tier={waitlist} onClose={() => setWl(null)} />}

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section style={{ paddingTop: 120, paddingBottom: 60, textAlign: "center", paddingLeft: 16, paddingRight: 16 }}>
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.09 } } }}
        >
          <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}>
            <SectionLabel>Pune's best meal delivery</SectionLabel>
          </motion.div>
          <motion.h1
            variants={{ hidden: { opacity: 0, y: 32, filter: "blur(4px)" }, visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE_OUT_EXPO } } }}
            style={{
              fontFamily: "'Barlow Condensed', sans-serif",
              fontSize: "clamp(2.8rem, 12vw, 6rem)",
              fontWeight: 900, textTransform: "uppercase",
              lineHeight: 1, letterSpacing: "-0.01em",
              color: "#f9fafb", marginBottom: 16,
            }}
          >
            Choose Your Plan
          </motion.h1>
          <motion.p
            variants={{ hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE_OUT_EXPO } } }}
            style={{ fontSize: 15, color: "#9ca3af", lineHeight: 1.7, maxWidth: 480, margin: "0 auto" }}
          >
            Fresh, nutritionist-designed meals delivered daily. Transparent pricing — no subscriptions, no lock-in.
          </motion.p>
        </motion.div>
      </section>

      {/* Glow line */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #84cc16, transparent)", opacity: 0.3, marginBottom: 60 }} />

      {/* ── Main content ───────────────────────────────────────────────── */}
      <div style={{ width: "100%", maxWidth: 1280, marginLeft: "auto", marginRight: "auto", paddingLeft: 16, paddingRight: 16, boxSizing: "border-box" }}>

        {/* Trial nudge */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12,
          border: "1px solid rgba(132,204,22,0.22)",
          background: "rgba(132,204,22,0.04)",
          borderRadius: 14, padding: "16px 20px",
          marginBottom: 60,
        }}>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: 0 }}>
            First time? <span style={{ color: "#f9fafb", fontWeight: 600 }}>Try a single day for ₹400–₹750</span> before committing.
          </p>
          <button
            onClick={() => setDur("trial")}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              fontSize: 13, fontWeight: 700, color: "#84cc16",
              background: "none", border: "none", cursor: "pointer",
              letterSpacing: "0.05em", whiteSpace: "nowrap",
            }}
          >
            Start trial <ArrowRight size={14} />
          </button>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            STANDARD TIER
        ══════════════════════════════════════════════════════════════════ */}
        <section style={{ marginBottom: 80 }}>

          {/* Header */}
          <div style={{ marginBottom: 36 }}>
            <SectionLabel>Currently available</SectionLabel>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <h2 style={{
                fontFamily: "'Barlow Condensed', sans-serif",
                fontSize: "clamp(2rem, 8vw, 4rem)",
                fontWeight: 900, textTransform: "uppercase",
                color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
              }}>
                Standard
              </h2>
              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(132,204,22,0.09)", color: "#a3e635",
                fontSize: 10, fontWeight: 800, letterSpacing: "0.15em",
                padding: "5px 14px", borderRadius: 999,
                border: "1px solid rgba(132,204,22,0.22)", textTransform: "uppercase",
              }}>
                <span style={{ width: 6, height: 6, background: "#84cc16", borderRadius: "50%", animation: "pulse 2s infinite" }} />
                Live now
              </span>
            </div>
            <p style={{ fontSize: 14, color: "#9ca3af", marginTop: 8 }}>Core meal delivery — pick your diet, duration, and meals.</p>
          </div>

          {/* Configurator card */}
          <div style={{
            background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
            border: "1px solid #1e1e1e",
            borderRadius: 20, padding: "24px 20px",
            marginBottom: 16,
          }}>

            {/* Step 1 — Diet */}
            <div style={{ marginBottom: 28 }}>
              <StepLabel n="1">Choose your diet</StepLabel>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {DIETS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDiet(d.id)}
                    style={{
                      display: "flex", alignItems: "center", gap: 8,
                      padding: "8px 14px", borderRadius: 999,
                      border: `1px solid ${diet === d.id ? "rgba(132,204,22,0.5)" : "#242424"}`,
                      background: diet === d.id ? "rgba(132,204,22,0.08)" : "transparent",
                      fontSize: 13, fontWeight: diet === d.id ? 600 : 400,
                      color: diet === d.id ? "#f9fafb" : "#9ca3af",
                      cursor: "pointer",
                    }}
                  >
                    <span style={{ width: 7, height: 7, borderRadius: "50%", background: d.dot, flexShrink: 0 }} />
                    {d.label}
                    {d.note && <span style={{ fontSize: 10, color: "#6b7280" }}>({d.note})</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2 — Duration */}
            <div style={{ marginBottom: 28 }}>
              <StepLabel n="2">Choose your duration</StepLabel>
              {/* 2-col on mobile, auto-fill on desktop */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 8 }}>
                {DURATIONS.map(d => (
                  <button
                    key={d.id}
                    onClick={() => setDur(d.id)}
                    style={{
                      padding: "12px 14px", borderRadius: 12, textAlign: "left",
                      border: `1px solid ${dur === d.id ? "rgba(132,204,22,0.5)" : "#1e1e1e"}`,
                      background: dur === d.id ? "rgba(132,204,22,0.07)" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 12, fontWeight: 600, color: dur === d.id ? "#f9fafb" : "#d1d5db", marginBottom: 2 }}>
                      {d.label}
                    </div>
                    <div style={{ fontSize: 11, color: "#6b7280" }}>{d.sub}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 — Meals */}
            <div style={{ marginBottom: 28 }}>
              <StepLabel n="3">Choose your meals</StepLabel>
              {/* Stack to single column on very small, 3-col on wider */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
                {MEALS.map(m => (
                  <button
                    key={m.id}
                    onClick={() => setMeal(m.id)}
                    style={{
                      padding: "12px 10px", borderRadius: 12, textAlign: "left",
                      border: `${meal === m.id ? "2px" : "1px"} solid ${meal === m.id ? "#84cc16" : "#1e1e1e"}`,
                      background: meal === m.id ? "rgba(132,204,22,0.07)" : "rgba(255,255,255,0.01)",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{ fontSize: 10, color: "#6b7280", marginBottom: 4 }}>{m.time}</div>
                    <div style={{ fontSize: 12, fontWeight: 600, color: meal === m.id ? "#f9fafb" : "#d1d5db", lineHeight: 1.3 }}>{m.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Price summary */}
            <AnimatePresence mode="wait">
              <motion.div
                key={`${diet}-${dur}-${meal}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                style={{
                  background: "rgba(132,204,22,0.04)",
                  border: "1px solid rgba(132,204,22,0.18)",
                  borderRadius: 14, padding: "20px 18px",
                }}
              >
                {/* Price row */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: "clamp(2rem, 10vw, 3rem)", fontWeight: 800, color: "#84cc16", lineHeight: 1, letterSpacing: "-0.03em" }}>
                    {fmt(price)}
                  </div>
                  <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                    + 5% GST at checkout = {fmt(priceGST)}
                  </div>
                  <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 3 }}>
                    {durObj.label} · {mealObj.label} · {dietObj.label}
                  </div>
                </div>
                {/* CTA — full width on mobile */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <button
                    onClick={() => {
                      window.location.href = `/checkout?diet=${diet}&dur=${dur}&meal=${meal}&price=${price}`;
                    }}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8,
                      background: "#84cc16", color: "#000",
                      fontWeight: 900, fontSize: 13,
                      padding: "14px 0", borderRadius: 10, width: "100%",
                      border: "none", cursor: "pointer",
                      letterSpacing: "0.08em", textTransform: "uppercase",
                      boxShadow: "0 4px 20px rgba(132,204,22,0.35)",
                    }}
                  >
                    Order this plan <ArrowRight size={14} />
                  </button>
                  <span style={{ fontSize: 12, color: "#4b5563", textAlign: "center" }}>WhatsApp order also available</span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Full pricing reference */}
          <div style={{
            background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
            border: "1px solid #1e1e1e",
            borderRadius: 20,
            overflow: "hidden",
          }}>
            <div style={{ padding: "18px 20px 14px", borderBottom: "1px solid #1a1a1a" }}>
              <SectionLabel>Full pricing reference</SectionLabel>
            </div>

            {/* Desktop table */}
            <div className="pricing-table-desktop">
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1a1a1a", background: "rgba(255,255,255,0.02)" }}>
                    <th style={{ textAlign: "left", padding: "12px 24px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em", width: "40%" }}>Duration</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>B + L</th>
                    <th style={{ textAlign: "right", padding: "12px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>S + D</th>
                    <th style={{ textAlign: "right", padding: "12px 24px 12px 16px", fontSize: 11, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>All 4</th>
                  </tr>
                </thead>
                <tbody>
                  {DURATIONS.map((d, i) => {
                    const active = d.id === dur;
                    return (
                      <tr
                        key={d.id}
                        onClick={() => setDur(d.id)}
                        style={{
                          borderBottom: i < DURATIONS.length - 1 ? "1px solid #141414" : "none",
                          background: active ? "rgba(132,204,22,0.05)" : "transparent",
                          cursor: "pointer",
                        }}
                      >
                        <td style={{ padding: "13px 24px" }}>
                          <span style={{ fontWeight: active ? 600 : 400, color: active ? "#f9fafb" : "#9ca3af" }}>{d.label}</span>
                          {active && (
                            <span style={{
                              marginLeft: 10, fontSize: 10, fontWeight: 800,
                              background: "#84cc16", color: "#000",
                              padding: "2px 10px", borderRadius: 999,
                            }}>
                              selected
                            </span>
                          )}
                        </td>
                        {(["bl", "sd", "all"] as Meal[]).map((m, mi) => {
                          const p  = getPrice("standard", d.id, m, diet);
                          const hi = active && m === meal;
                          return (
                            <td key={m} style={{
                              padding: mi === 2 ? "13px 24px 13px 16px" : "13px 16px",
                              textAlign: "right",
                              fontWeight: hi ? 700 : 400,
                              color: hi ? "#84cc16" : active ? "#d1d5db" : "#6b7280",
                            } as React.CSSProperties}>
                              {fmt(p)}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile accordion rows */}
            <div className="pricing-table-mobile">
              {/* Column headers */}
              <div style={{
                display: "grid", gridTemplateColumns: "1fr repeat(3, auto)",
                padding: "10px 16px", gap: 8,
                borderBottom: "1px solid #1a1a1a",
                background: "rgba(255,255,255,0.02)",
              }}>
                <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.1em" }}>Duration</span>
                {["B+L", "S+D", "All 4"].map(h => (
                  <span key={h} style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", textAlign: "right", minWidth: 52 }}>{h}</span>
                ))}
              </div>
              {DURATIONS.map((d, i) => {
                const active = d.id === dur;
                return (
                  <div
                    key={d.id}
                    onClick={() => setDur(d.id)}
                    style={{
                      borderBottom: i < DURATIONS.length - 1 ? "1px solid #141414" : "none",
                      background: active ? "rgba(132,204,22,0.05)" : "transparent",
                      cursor: "pointer",
                    }}
                  >
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr repeat(3, auto)",
                      padding: "12px 16px", gap: 8, alignItems: "center",
                    }}>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: active ? 600 : 400, color: active ? "#f9fafb" : "#9ca3af" }}>
                          {d.label}
                          {active && (
                            <span style={{
                              marginLeft: 8, fontSize: 9, fontWeight: 800,
                              background: "#84cc16", color: "#000",
                              padding: "1px 7px", borderRadius: 999,
                            }}>
                              ✓
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: 10, color: "#4b5563", marginTop: 1 }}>{d.sub}</div>
                      </div>
                      {(["bl", "sd", "all"] as Meal[]).map(m => {
                        const p  = getPrice("standard", d.id, m, diet);
                        const hi = active && m === meal;
                        return (
                          <div key={m} style={{
                            fontSize: 12, fontWeight: hi ? 700 : 400,
                            color: hi ? "#84cc16" : active ? "#d1d5db" : "#6b7280",
                            textAlign: "right", minWidth: 52,
                          }}>
                            {fmt(p)}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ padding: "12px 20px", borderTop: "1px solid #141414", fontSize: 11, color: "#4b5563" }}>
              All prices in INR · 5% GST added at checkout · Non-Veg monthly excl. weekends B+L / S+D = ₹7,600
            </div>
          </div>
        </section>

        {/* Premium tier */}
        <section style={{ marginBottom: 32 }}>
          <LockedTier
            title="Premium"
            phase="Phase 8"
            multiplier="1.25× Standard"
            accent="#84cc16"
            features={PREMIUM_FEATURES}
            previewPrices={premPreview}
            onWaitlist={() => setWl("Premium")}
          />
        </section>

        {/* Luxury tier */}
        <section style={{ marginBottom: 80 }}>
          <LockedTier
            title="Luxury"
            phase="Phase 12"
            multiplier="1.50× Standard"
            accent="#a78bfa"
            features={LUXURY_FEATURES}
            previewPrices={luxPreview}
            onWaitlist={() => setWl("Luxury")}
          />
        </section>

        {/* Glow divider */}
        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #84cc16, transparent)", opacity: 0.2, marginBottom: 80 }} />

        {/* Lifestyle & Medical */}
        <section style={{ marginBottom: 100 }}>
          <SectionLabel>Specialised nutrition</SectionLabel>
          <div style={{
            background: "linear-gradient(145deg, #0f0f0f, #0b0b0b)",
            border: "1px solid #1e1e1e",
            borderRadius: 20, padding: "28px 20px",
          }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
              <div style={{ flex: 1, minWidth: 240 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10, flexWrap: "wrap" }}>
                  <h2 style={{
                    fontFamily: "'Barlow Condensed', sans-serif",
                    fontSize: "clamp(1.6rem, 6vw, 3rem)",
                    fontWeight: 900, textTransform: "uppercase",
                    color: "#f9fafb", lineHeight: 1, letterSpacing: "-0.01em",
                  }}>
                    Lifestyle & Medical Plans
                  </h2>
                  <span style={{
                    fontSize: 10, fontWeight: 700, letterSpacing: "0.15em",
                    color: "#6b7280", border: "1px solid #242424",
                    padding: "4px 12px", borderRadius: 999, textTransform: "uppercase",
                    whiteSpace: "nowrap",
                  }}>
                    Phase 9
                  </span>
                </div>
                <p style={{ fontSize: 14, color: "#9ca3af", lineHeight: 1.75, marginBottom: 20 }}>
                  Specialised meal plans designed with medical nutritionists for specific health conditions.
                  Standard tier pricing — exact matrix finalised in Phase 9.
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
                  {LIFESTYLE_TAGS.map(tag => (
                    <span key={tag} style={{
                      fontSize: 12, color: "#d1d5db",
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid #242424",
                      padding: "5px 12px", borderRadius: 999,
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>
                <p style={{ fontSize: 12, color: "#4b5563" }}>
                  More conditions being added. Suggest one via WhatsApp.
                </p>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {lifeDone ? (
                  <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 14, fontWeight: 600, color: "#84cc16" }}>
                    <CheckCircle size={16} />
                    You're on the list
                  </div>
                ) : (
                  <button
                    onClick={() => setLifeDone(true)}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      background: "rgba(132,204,22,0.08)", color: "#a3e635",
                      fontWeight: 800, fontSize: 13,
                      padding: "11px 20px", borderRadius: 10,
                      border: "1px solid rgba(132,204,22,0.28)",
                      cursor: "pointer",
                      letterSpacing: "0.07em", textTransform: "uppercase",
                      whiteSpace: "nowrap",
                    }}
                  >
                    Join waitlist <ArrowRight size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* Global styles */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }

        /* Desktop: show table, hide mobile rows */
        .pricing-table-desktop { display: block; }
        .pricing-table-mobile  { display: none;  }

        /* Mobile (≤ 639px) */
        @media (max-width: 639px) {
          .pricing-table-desktop { display: none;  }
          .pricing-table-mobile  { display: block; }
        }

        /* Duration grid: 2-col mobile → auto-fill desktop */
        @media (min-width: 640px) {
          .duration-grid {
            grid-template-columns: repeat(auto-fill, minmax(160px, 1fr)) !important;
          }
        }

        /* Meal buttons: always 3-col but allow text wrap */
        @media (max-width: 380px) {
          .meal-grid {
            grid-template-columns: 1fr !important;
          }
        }

        * { box-sizing: border-box; }
      `}</style>
    </div>
  );
}