"use client";
// app/dashboard/supplements/SupplementsClient.tsx
// Phase 8 — Supplements Dashboard
// All logged-in users get full access — no premium gate

import { useState, useMemo } from "react";
import {
  X, Sparkles, CheckCircle2, RefreshCw, ChevronLeft, Star,
} from "lucide-react";
import {
  SUPPLEMENTS, STACKS, GOAL_META, CATEGORY_META,
  resolveStack, getSupplementById,
  type Supplement, type SupplementGoal, type SupplementCategory, type QuizAnswers,
} from "@/lib/supplements-data";

const FONT = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
`;

// ── Map profile goal string → SupplementGoal ──────────────────────────────────
function mapProfileGoal(raw: string | null): SupplementGoal {
  if (!raw) return "balanced";
  const r = raw.toLowerCase();
  if (r.includes("muscle") || r.includes("gain") || r.includes("bulk")) return "muscle_gain";
  if (r.includes("loss") || r.includes("cut") || r.includes("weight")) return "weight_loss";
  if (r.includes("perform") || r.includes("athletic") || r.includes("sport")) return "performance";
  return "balanced";
}

// ── Quiz config ───────────────────────────────────────────────────────────────
const QUIZ_STEPS = [
  {
    key: "goal" as const,
    question: "What's your primary goal right now?",
    emoji: "🎯",
    options: [
      { value: "muscle_gain", label: "Build Muscle",     emoji: "💪" },
      { value: "weight_loss", label: "Lose Fat",         emoji: "🔥" },
      { value: "balanced",    label: "Stay Healthy",     emoji: "⚖️" },
      { value: "performance", label: "Peak Performance", emoji: "⚡" },
    ],
  },
  {
    key: "frequency" as const,
    question: "How often do you train per week?",
    emoji: "📅",
    options: [
      { value: "low",    label: "1–2 times", emoji: "🚶" },
      { value: "medium", label: "3–4 times", emoji: "🏃" },
      { value: "high",   label: "5–7 times", emoji: "🏋️" },
    ],
  },
  {
    key: "challenge" as const,
    question: "What's your biggest challenge?",
    emoji: "💬",
    options: [
      { value: "recovery", label: "Poor recovery",    emoji: "😣" },
      { value: "energy",   label: "Low energy",       emoji: "😴" },
      { value: "strength", label: "Strength plateau", emoji: "📉" },
      { value: "weight",   label: "Stubborn weight",  emoji: "⚖️" },
      { value: "sleep",    label: "Bad sleep",        emoji: "🌙" },
    ],
  },
  {
    key: "diet" as const,
    question: "What's your diet type?",
    emoji: "🍽️",
    options: [
      { value: "nonveg", label: "Non-Vegetarian", emoji: "🍗" },
      { value: "veg",    label: "Vegetarian",     emoji: "🥗" },
      { value: "vegan",  label: "Vegan",          emoji: "🌿" },
    ],
  },
  {
    key: "budget" as const,
    question: "Monthly supplement budget?",
    emoji: "💰",
    options: [
      { value: "low",  label: "Under ₹1,000", emoji: "🪙" },
      { value: "mid",  label: "₹1,000–2,500", emoji: "💳" },
      { value: "high", label: "₹2,500+",      emoji: "🏆" },
    ],
  },
];

// ── Supplement Card ───────────────────────────────────────────────────────────
function SupplementCard({
  supp,
  highlight = false,
  onClick,
}: {
  supp: Supplement;
  highlight?: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const catMeta = CATEGORY_META[supp.category];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered ? "#161616" : "#101010",
        border: `1px solid ${highlight ? `${supp.accent}30` : hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.055)"}`,
        borderRadius: 16,
        padding: 18,
        cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.18s ease",
        position: "relative",
        overflow: "hidden",
        boxShadow: hovered ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
      }}
    >
      {highlight && (
        <div style={{ position: "absolute", top: 0, right: 0, width: 80, height: 80, background: `radial-gradient(circle, ${supp.accent}15 0%, transparent 70%)`, pointerEvents: "none" }} />
      )}
      {supp.popular && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)",
          borderRadius: 6, padding: "2px 7px",
          fontSize: 9, fontWeight: 700, color: "#fbbf24",
          letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif",
        }}>
          Popular
        </div>
      )}

      <div style={{ fontSize: 30, marginBottom: 12 }}>{supp.emoji}</div>

      <span style={{
        fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
        color: supp.accent, background: `${supp.accent}12`,
        border: `1px solid ${supp.accent}25`,
        borderRadius: 6, padding: "2px 7px", fontFamily: "DM Sans, sans-serif",
      }}>
        {catMeta.label}
      </span>

      <p style={{ margin: "10px 0 4px", fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", lineHeight: 1.3 }}>
        {supp.name}
      </p>
      <p style={{ margin: "0 0 12px", fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.4 }}>
        {supp.tagline}
      </p>
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <svg width={10} height={10} viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>{supp.dosage}</span>
      </div>
    </div>
  );
}

// ── Supplement Detail Modal ───────────────────────────────────────────────────
function SupplementModal({ supp, onClose }: { supp: Supplement; onClose: () => void }) {
  const catMeta = CATEGORY_META[supp.category];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(10px)" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 500,
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px 24px 0 0", maxHeight: "88vh", overflowY: "auto",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
      }}>
        {/* Hero */}
        <div style={{
          padding: "32px 22px 20px", textAlign: "center",
          background: `linear-gradient(135deg, ${supp.accent}08 0%, transparent 60%)`,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 16, right: 16, width: 30, height: 30, borderRadius: "50%", background: "rgba(255,255,255,0.06)", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={14} />
          </button>
          <div style={{ fontSize: 52, marginBottom: 14 }}>{supp.emoji}</div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: supp.accent, background: `${supp.accent}12`, border: `1px solid ${supp.accent}25`, borderRadius: 6, padding: "3px 9px", fontFamily: "DM Sans, sans-serif" }}>
            {catMeta.label}
          </span>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "12px 0 6px" }}>{supp.name}</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>{supp.tagline}</p>
        </div>

        <div style={{ padding: "20px 22px 32px" }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: "0 0 20px" }}>
            {supp.description}
          </p>

          {/* Benefits */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px", marginBottom: 16 }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px", fontFamily: "DM Sans, sans-serif" }}>Key Benefits</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {supp.benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <CheckCircle2 size={13} color={supp.accent} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "DM Sans, sans-serif" }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dosage + Timing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
            {[{ label: "Dosage", value: supp.dosage }, { label: "Timing", value: supp.timing }].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>{label}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)", fontFamily: "DM Sans, sans-serif" }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Price */}
          <div style={{ background: `${supp.accent}08`, border: `1px solid ${supp.accent}20`, borderRadius: 12, padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>Estimated Price</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: supp.accent, fontFamily: "Syne, sans-serif" }}>{supp.priceRange}</p>
            </div>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", fontFamily: "DM Sans, sans-serif" }}>Coming soon</span>
          </div>

          {supp.veganFriendly && (
            <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ fontSize: 12 }}>🌿</span>
              <span style={{ fontSize: 11, color: "rgba(163,230,53,0.6)", fontFamily: "DM Sans, sans-serif" }}>Vegan-friendly</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Quiz Modal ────────────────────────────────────────────────────────────────
function QuizModal({ onComplete, onClose }: { onComplete: (a: QuizAnswers) => void; onClose: () => void }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<QuizAnswers>>({});
  const current = QUIZ_STEPS[step];
  const canProceed = answers[current.key] !== undefined;
  const progress = (step / QUIZ_STEPS.length) * 100;

  function handleSelect(value: string) {
    setAnswers((prev) => ({ ...prev, [current.key]: value }));
  }

  function handleNext() {
    if (step < QUIZ_STEPS.length - 1) setStep(step + 1);
    else onComplete(answers as QuizAnswers);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }} />
      <div style={{ position: "relative", width: "100%", maxWidth: 480, background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 24, overflow: "hidden", boxShadow: "0 20px 80px rgba(0,0,0,0.9)" }}>
        {/* Progress */}
        <div style={{ height: 3, background: "rgba(255,255,255,0.06)" }}>
          <div style={{ height: "100%", width: `${progress}%`, background: "#a3e635", transition: "width 0.3s ease" }} />
        </div>

        <div style={{ padding: "28px 28px 24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif" }}>{step + 1} / {QUIZ_STEPS.length}</span>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}>
              <X size={16} />
            </button>
          </div>

          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 36, marginBottom: 14 }}>{current.emoji}</div>
            <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>{current.question}</h3>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
            {current.options.map((opt) => {
              const selected = answers[current.key] === opt.value;
              return (
                <button
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "12px 16px", borderRadius: 12,
                    background: selected ? "rgba(163,230,53,0.1)" : "rgba(255,255,255,0.04)",
                    border: `1px solid ${selected ? "rgba(163,230,53,0.35)" : "rgba(255,255,255,0.08)"}`,
                    cursor: "pointer", textAlign: "left", transition: "all 0.15s ease",
                  }}
                >
                  <span style={{ fontSize: 20 }}>{opt.emoji}</span>
                  <span style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, fontWeight: 500, color: selected ? "#a3e635" : "rgba(255,255,255,0.6)" }}>
                    {opt.label}
                  </span>
                  {selected && <CheckCircle2 size={15} color="#a3e635" style={{ marginLeft: "auto" }} />}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", cursor: "pointer", color: "rgba(255,255,255,0.5)", display: "flex", alignItems: "center", justifyContent: "center" }}
              >
                <ChevronLeft size={16} />
              </button>
            )}
            <button
              onClick={handleNext}
              disabled={!canProceed}
              style={{
                flex: 1, padding: "12px", borderRadius: 12,
                background: canProceed ? "#a3e635" : "rgba(255,255,255,0.06)",
                border: "none", cursor: canProceed ? "pointer" : "not-allowed",
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13,
                color: canProceed ? "#000" : "rgba(255,255,255,0.2)",
                transition: "all 0.15s ease",
              }}
            >
              {step === QUIZ_STEPS.length - 1 ? "Build My Stack →" : "Continue →"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────

const CATEGORIES: Array<"all" | SupplementCategory> = ["all", "protein", "performance", "recovery", "health", "weight"];

export default function SupplementsClient({
  userGoal,
  userName,
}: {
  userGoal: string | null;
  userName: string | null;
}) {
  const defaultGoal = mapProfileGoal(userGoal);
  const [quizAnswers, setQuizAnswers] = useState<QuizAnswers | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [selectedSupp, setSelectedSupp] = useState<Supplement | null>(null);
  const [catFilter, setCatFilter] = useState<"all" | SupplementCategory>("all");

  const stackIds = useMemo(() => {
    if (quizAnswers) return resolveStack(quizAnswers);
    return STACKS[defaultGoal];
  }, [quizAnswers, defaultGoal]);

  const stackSupps = stackIds.map(getSupplementById).filter(Boolean) as Supplement[];

  const filteredCatalogue = useMemo(() => {
    if (catFilter === "all") return SUPPLEMENTS;
    return SUPPLEMENTS.filter((s) => s.category === catFilter);
  }, [catFilter]);

  const activeGoal: SupplementGoal = quizAnswers?.goal ?? defaultGoal;
  const goalMeta = GOAL_META[activeGoal];

  return (
    <>
      <style>{FONT}</style>
      <style>{`* { box-sizing: border-box; }`}</style>

      <div style={{ paddingTop: 88, paddingBottom: 48, maxWidth: 1120, margin: "0 auto", minHeight: "100vh", background: "#080808", paddingLeft: 18, paddingRight: 18 }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 13, background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Sparkles size={18} color="#a3e635" />
            </div>
            <div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                Supplement Guide
              </h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                Personalised stack · 15 supplements · 5 categories
              </p>
            </div>
          </div>
        </div>

        {/* ── Your Stack ── */}
        <div style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "20px 20px 24px", marginBottom: 24, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, right: 0, width: 200, height: 200, background: `radial-gradient(circle, ${goalMeta.accent}08 0%, transparent 70%)`, pointerEvents: "none" }} />

          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18, flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                <span style={{ fontSize: 18 }}>{goalMeta.emoji}</span>
                <span style={{ fontFamily: "Syne, sans-serif", fontSize: 16, fontWeight: 700, color: "#fff" }}>Your Stack</span>
                <span style={{
                  fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase",
                  color: goalMeta.accent, background: `${goalMeta.accent}15`,
                  border: `1px solid ${goalMeta.accent}30`,
                  borderRadius: 6, padding: "2px 8px", fontFamily: "DM Sans, sans-serif",
                }}>
                  {goalMeta.label}
                </span>
              </div>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif" }}>
                {quizAnswers ? "Based on your quiz answers" : "Based on your profile goal — take the quiz to refine"}
              </p>
            </div>
            <button
              onClick={() => setShowQuiz(true)}
              style={{
                display: "flex", alignItems: "center", gap: 7,
                background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 10, padding: "8px 14px",
                fontSize: 12, color: "rgba(255,255,255,0.5)",
                cursor: "pointer", fontFamily: "DM Sans, sans-serif", fontWeight: 500,
              }}
            >
              <RefreshCw size={13} />
              {quizAnswers ? "Retake Quiz" : "Take Quiz"}
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 10 }}>
            {stackSupps.map((supp) => (
              <SupplementCard key={supp.id} supp={supp} highlight onClick={() => setSelectedSupp(supp)} />
            ))}
          </div>
        </div>

        {/* ── Full Catalogue ── */}
        <div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
            <div>
              <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 17, fontWeight: 700, color: "#fff", margin: "0 0 2px" }}>Full Catalogue</h2>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                {filteredCatalogue.length} supplement{filteredCatalogue.length !== 1 ? "s" : ""}
              </p>
            </div>
          </div>

          {/* Category tabs */}
          <div style={{ display: "flex", gap: 6, marginBottom: 18, flexWrap: "wrap" }}>
            {CATEGORIES.map((cat) => {
              const active = cat === catFilter;
              const meta = cat === "all" ? null : CATEGORY_META[cat];
              const accent = meta?.accent ?? "#a3e635";
              return (
                <button
                  key={cat}
                  onClick={() => setCatFilter(cat)}
                  style={{
                    display: "flex", alignItems: "center", gap: 6,
                    padding: "7px 14px", borderRadius: 10,
                    background: active ? `${accent}15` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? `${accent}35` : "rgba(255,255,255,0.07)"}`,
                    color: active ? accent : "rgba(255,255,255,0.35)",
                    fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 12,
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}
                >
                  {meta && <span>{meta.emoji}</span>}
                  <span>{cat === "all" ? "All" : meta?.label ?? cat}</span>
                </button>
              );
            })}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(175px, 1fr))", gap: 10 }}>
            {filteredCatalogue.map((supp) => (
              <SupplementCard key={supp.id} supp={supp} onClick={() => setSelectedSupp(supp)} />
            ))}
          </div>
        </div>

        {/* Price note */}
        <div style={{ marginTop: 28, padding: "14px 18px", background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14 }}>
          <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>
            💡 <strong style={{ color: "rgba(255,255,255,0.4)" }}>Prices are estimates</strong> — final pricing will be confirmed once our supplier partnership is live. You'll be notified first.
          </p>
        </div>
      </div>

      {showQuiz && (
        <QuizModal
          onComplete={(answers) => { setQuizAnswers(answers); setShowQuiz(false); }}
          onClose={() => setShowQuiz(false)}
        />
      )}

      {selectedSupp && (
        <SupplementModal supp={selectedSupp} onClose={() => setSelectedSupp(null)} />
      )}
    </>
  );
}