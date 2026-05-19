"use client";
// app/supplements/SupplementsLanding.tsx
// Public marketing page — visible to all
// Teases personalised stack, locks premium features, drives upgrades

import { useState } from "react";
import Link from "next/link";
import {
  Lock, Zap, ChevronRight, Star, CheckCircle2,
  ArrowRight, Sparkles, Shield, Truck,
} from "lucide-react";
import {
  SUPPLEMENTS, STACKS, GOAL_META, CATEGORY_META,
  type SupplementGoal,
} from "@/lib/supplements-data";

const FONT = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
`;

const GOALS: SupplementGoal[] = ["muscle_gain", "weight_loss", "balanced", "performance"];

export default function SupplementsLanding({ isLoggedIn }: { isLoggedIn: boolean }) {
  const [activeGoal, setActiveGoal] = useState<SupplementGoal>("muscle_gain");

  const previewStack = STACKS[activeGoal].map(
    (id) => SUPPLEMENTS.find((s) => s.id === id)!
  ).filter(Boolean);

  // Show first 4 supplements in catalogue, lock the rest
  const cataloguePreview = SUPPLEMENTS.slice(0, 8);

  return (
    <>
      <style>{FONT}</style>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes shimmer { 0%{opacity:.4} 50%{opacity:.7} 100%{opacity:.4} }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(163,230,53,0.2)} 50%{box-shadow:0 0 40px rgba(163,230,53,0.4)} }
      `}</style>

      <div style={{ background: "#080808", minHeight: "100vh", color: "#fff" }}>

        {/* ── Hero ── */}
        <section style={{
          position: "relative",
          padding: "120px 24px 80px",
          textAlign: "center",
          overflow: "hidden",
        }}>
          {/* Background glow */}
          <div style={{
            position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
            width: 600, height: 400,
            background: "radial-gradient(ellipse, rgba(163,230,53,0.08) 0%, transparent 70%)",
            pointerEvents: "none",
          }} />

          <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
            {/* Badge */}
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(163,230,53,0.08)",
              border: "1px solid rgba(163,230,53,0.2)",
              borderRadius: 20, padding: "6px 16px",
              marginBottom: 28,
            }}>
              <Sparkles size={13} color="#a3e635" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a3e635", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>
                FitFuel Premium — Now Live
              </span>
            </div>

            <h1 style={{
              fontFamily: "Syne, sans-serif",
              fontSize: "clamp(2.4rem, 6vw, 4.5rem)",
              fontWeight: 800,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              margin: "0 0 20px",
              color: "#fff",
            }}>
              Supplements built for{" "}
              <span style={{
                background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}>
                your goal
              </span>
            </h1>

            <p style={{
              fontFamily: "DM Sans, sans-serif",
              fontSize: 17,
              color: "rgba(255,255,255,0.45)",
              lineHeight: 1.7,
              maxWidth: 520,
              margin: "0 auto 36px",
            }}>
              Stop guessing. Get a personalised supplement stack based on your goal, training frequency, and diet — delivered with your FitFuel meals.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href={isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#a3e635", color: "#000",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                  padding: "14px 28px", borderRadius: 14, textDecoration: "none",
                  letterSpacing: "0.03em",
                  boxShadow: "0 8px 30px rgba(163,230,53,0.3)",
                  animation: "pulse-glow 3s ease-in-out infinite",
                }}
              >
                Get My Stack <ArrowRight size={16} />
              </Link>
              <Link
                href="/plans"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)",
                  fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 14,
                  padding: "14px 24px", borderRadius: 14, textDecoration: "none",
                }}
              >
                View Plans
              </Link>
            </div>

            {/* Trust row */}
            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 36, flexWrap: "wrap" }}>
              {[
                { icon: <Shield size={13} />, text: "Lab-tested quality" },
                { icon: <Truck size={13} />, text: "Delivered with your meals" },
                { icon: <Star size={13} />, text: "Premium subscribers only" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>
                  {icon}
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Goal-based stack preview ── */}
        <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: "DM Sans, sans-serif", marginBottom: 12 }}>
              Your Goal · Your Stack
            </p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
              Personalised for what you're working toward
            </h2>
          </div>

          {/* Goal tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 40, flexWrap: "wrap" }}>
            {GOALS.map((goal) => {
              const meta = GOAL_META[goal];
              const active = goal === activeGoal;
              return (
                <button
                  key={goal}
                  onClick={() => setActiveGoal(goal)}
                  style={{
                    display: "flex", alignItems: "center", gap: 8,
                    padding: "10px 18px", borderRadius: 12,
                    background: active ? meta.accent : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? meta.accent : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#000" : "rgba(255,255,255,0.4)",
                    fontFamily: active ? "Syne, sans-serif" : "DM Sans, sans-serif",
                    fontWeight: 700, fontSize: 13, cursor: "pointer",
                    transition: "all 0.18s ease",
                  }}
                >
                  <span>{meta.emoji}</span>
                  <span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stack cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
            {previewStack.map((supp, i) => {
              const meta = CATEGORY_META[supp.category];
              return (
                <div
                  key={supp.id}
                  style={{
                    background: "#101010",
                    border: `1px solid ${supp.accent}20`,
                    borderRadius: 16,
                    padding: 18,
                    position: "relative",
                    overflow: "hidden",
                  }}
                >
                  <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${supp.accent}12 0%, transparent 70%)` }} />
                  <div style={{ fontSize: 28, marginBottom: 10 }}>{supp.emoji}</div>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                    color: supp.accent, background: `${supp.accent}15`,
                    border: `1px solid ${supp.accent}30`,
                    borderRadius: 6, padding: "2px 7px", fontFamily: "DM Sans, sans-serif",
                  }}>
                    {meta.label}
                  </span>
                  <p style={{ margin: "10px 0 4px", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", lineHeight: 1.3 }}>
                    {supp.name}
                  </p>
                  <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif" }}>
                    {supp.tagline}
                  </p>
                  <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                    <Clock size={10} color="rgba(255,255,255,0.2)" />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>{supp.timing}</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div style={{ textAlign: "center", marginTop: 28 }}>
            <Link
              href={isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                color: "#a3e635", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13,
                textDecoration: "none",
              }}
            >
              Get your personalised stack <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── Catalogue preview (locked) ── */}
        <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: "DM Sans, sans-serif", marginBottom: 12 }}>
              Full Catalogue
            </p>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>
              15 supplements across 5 categories
            </h2>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif", margin: 0 }}>
              Premium members get full access + personalised recommendations
            </p>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 12, position: "relative" }}>
            {cataloguePreview.map((supp, i) => {
              const locked = i >= 4;
              return (
                <div
                  key={supp.id}
                  style={{
                    background: "#101010",
                    border: "1px solid rgba(255,255,255,0.06)",
                    borderRadius: 16,
                    padding: 18,
                    filter: locked ? "blur(3px)" : "none",
                    opacity: locked ? 0.5 : 1,
                    pointerEvents: locked ? "none" : "auto",
                    transition: "all 0.18s",
                  }}
                >
                  <div style={{ fontSize: 24, marginBottom: 10 }}>{supp.emoji}</div>
                  <p style={{ margin: "0 0 4px", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif" }}>
                    {supp.name}
                  </p>
                  <p style={{ margin: "0 0 10px", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif" }}>
                    {supp.tagline}
                  </p>
                  <span style={{
                    fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    color: CATEGORY_META[supp.category].accent,
                    background: `${CATEGORY_META[supp.category].accent}12`,
                    borderRadius: 6, padding: "2px 7px", fontFamily: "DM Sans, sans-serif",
                  }}>
                    {CATEGORY_META[supp.category].label}
                  </span>
                </div>
              );
            })}

            {/* Lock overlay */}
            <div style={{
              position: "absolute",
              bottom: 0, left: 0, right: 0, height: "55%",
              background: "linear-gradient(to bottom, transparent, #080808)",
              display: "flex", alignItems: "flex-end", justifyContent: "center",
              paddingBottom: 24,
            }}>
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", gap: 12,
                background: "#0d0d0d",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 18, padding: "20px 32px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.8)",
              }}>
                <div style={{ width: 40, height: 40, borderRadius: "50%", background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Lock size={18} color="#a3e635" />
                </div>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "Syne, sans-serif" }}>
                  11 more supplements unlocked with Premium
                </p>
                <Link
                  href="/plans"
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 8,
                    background: "#a3e635", color: "#000",
                    fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
                    padding: "10px 22px", borderRadius: 10, textDecoration: "none",
                  }}
                >
                  Upgrade to Premium <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ── Why FitFuel Supplements ── */}
        <section style={{ padding: "60px 24px 40px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.2rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
              Why supplement with FitFuel?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { emoji: "🎯", title: "Goal-matched, not generic", body: "Your stack is built around your specific goal — not a one-size-fits-all product push. Muscle gain, fat loss, performance — each stack is different." },
              { emoji: "🚚", title: "Delivered with your meals", body: "No extra orders. No separate delivery. Your supplements arrive packaged with your daily FitFuel meal box — convenient and consistent." },
              { emoji: "🔬", title: "Science-backed, no fluff", body: "Every supplement in our catalogue is backed by clinical research. We include the dosage, timing, and reasoning — so you know exactly what you're taking and why." },
            ].map(({ emoji, title, body }) => (
              <div key={title} style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 24 }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{emoji}</div>
                <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "Syne, sans-serif" }}>{title}</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section style={{ padding: "40px 24px 80px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{
            background: "linear-gradient(135deg, rgba(163,230,53,0.08) 0%, rgba(163,230,53,0.03) 100%)",
            border: "1px solid rgba(163,230,53,0.15)",
            borderRadius: 24, padding: "48px 32px",
          }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
              Ready to fuel smarter?
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>
              Upgrade to Premium and get your personalised stack with the next meal delivery.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href="/plans"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#a3e635", color: "#000",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
                  padding: "12px 24px", borderRadius: 12, textDecoration: "none",
                  boxShadow: "0 6px 24px rgba(163,230,53,0.25)",
                }}
              >
                View Premium Plans <ArrowRight size={14} />
              </Link>
              <Link
                href={isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.6)",
                  fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 13,
                  padding: "12px 22px", borderRadius: 12, textDecoration: "none",
                }}
              >
                Already Premium? Sign In
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

// Inline Clock component (avoid import issues)
function Clock({ size, color }: { size: number; color: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
