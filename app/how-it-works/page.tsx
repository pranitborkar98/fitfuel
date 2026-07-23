import Link from "next/link";
import { type ReactNode } from "react";

export const metadata = {
  alternates: { canonical: "/how-it-works" },
  title: "How It Works",
  description: "From your goal to your door: how FitFuel personalises, cooks, delivers and tracks your nutrition every day.",
};

const C = { bg: "#080808", accent: "#a3e635", accent2: "#84cc16", text: "#ffffff", sub: "#a3a3a3", muted: "#9a9a94", border: "#1f1f1f", card: "#111111" };
const link = { color: C.accent, textDecoration: "none", borderBottom: `1px solid ${C.accent}40` };

const steps = [
  { n: "01", t: "Tell us about you", d: "Share your body, goal, dietary preference and any health condition. It takes two minutes and powers everything that follows." },
  { n: "02", t: "We build your plan", d: "We calculate your exact calorie and macro targets and match you to a 30-day rotating menu personalised to your goal." },
  { n: "03", t: "We cook fresh, daily", d: "Prepared every morning in our Pune kitchen. No deep frying, fresh-sourced ingredients, cooked the same day it reaches you." },
  { n: "04", t: "Delivered to your door", d: "One bundled delivery a day in your chosen Morning or Evening window, in eco-conscious packaging." },
  { n: "05", t: "Track every gram", d: "Tap \"I ate this\" and your meal auto-logs its macros. Watch your calories, protein and progress update in real time." },
  { n: "06", t: "Adjust and evolve", d: "Rate meals, request swaps, and let the system recalibrate your targets as your body changes. The plan grows with you." },
];

const moat = [
  { t: "Track every gram", d: "Per-gram macro logging, not guesswork." },
  { t: "No dish repeats in 30 days", d: "A full rotating month of variety." },
  { t: "Personalised to your body", d: "Targets built from your metrics, not a template." },
];

function H2({ children }: { children: ReactNode }) {
  return <h2 style={{ fontFamily: "var(--ff-cond)", fontWeight: 800, fontSize: 28, color: C.text, margin: "0 0 28px", letterSpacing: "-0.02em" }}>{children}</h2>;
}

export default function HowItWorksPage() {
  return (
    <main style={{ background: C.bg, color: C.text, minHeight: "100vh", fontFamily: "inherit", WebkitFontSmoothing: "antialiased" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto", padding: "120px 24px 96px" }}>
        <p style={{ fontFamily: "var(--ff-cond)", textTransform: "uppercase", letterSpacing: "0.18em", fontSize: 13, color: C.accent, margin: "0 0 14px" }}>How It Works</p>
        <h1 style={{ fontFamily: "var(--ff-cond)", fontWeight: 800, fontSize: "clamp(34px,6vw,56px)", lineHeight: 1.04, margin: "0 0 18px", letterSpacing: "-0.025em" }}>
          Your goal to your door<span style={{ color: C.accent }}>.</span>
        </h1>
        <p style={{ color: C.sub, fontSize: 17, lineHeight: 1.7, maxWidth: 620, margin: "0 0 64px" }}>
          FitFuel is not just a meal box. It is a system that learns your body, feeds it right, and tracks every step. Here is exactly how it runs, every single day.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 80 }}>
          {steps.map((s) => (
            <div key={s.n} style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 16, padding: "26px 24px" }}>
              <div style={{ fontFamily: "var(--ff-cond)", fontSize: 34, fontWeight: 800, color: C.accent, lineHeight: 1, marginBottom: 14 }}>{s.n}</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.t}</div>
              <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.65, margin: 0 }}>{s.d}</p>
            </div>
          ))}
        </div>

        <H2>What makes us different</H2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 72 }}>
          {moat.map((m) => (
            <div key={m.t} style={{ borderLeft: `2px solid ${C.accent}`, paddingLeft: 18 }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: C.text, marginBottom: 6 }}>{m.t}</div>
              <p style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.6, margin: 0 }}>{m.d}</p>
            </div>
          ))}
        </div>

        <div style={{ background: "linear-gradient(145deg, #111, #0e0e0e)", border: `1px solid ${C.accent}33`, borderRadius: 18, padding: "36px 32px", textAlign: "center" }}>
          <div style={{ fontFamily: "var(--ff-cond)", fontSize: 24, fontWeight: 800, color: C.text, marginBottom: 10 }}>Start eating right tomorrow.</div>
          <p style={{ color: C.sub, fontSize: 15, margin: "0 0 22px" }}>Not next Monday. See the plan and try a single trial day, no lock-in.</p>
          <Link href="/plans/weight-loss-veg" style={{ display: "inline-block", background: C.accent2, color: "#000", fontWeight: 800, fontSize: 14, padding: "13px 30px", borderRadius: 10, textDecoration: "none", letterSpacing: "0.04em" }}>VIEW THE PLAN</Link>
        </div>

        <div style={{ marginTop: 36 }}><Link href="/" style={link}>&larr; Back to home</Link></div>
      </div>
    </main>
  );
}
