"use client";
// app/supplements/SupplementsLanding.tsx
// Public marketing page — fully open, no premium gates
// All supplements visible, personalised stack preview, drives sign-in

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Zap, ChevronRight, CheckCircle2,
  ArrowRight, Sparkles, Shield, Truck, Star,
  X,
} from "lucide-react";
import {
  STACKS, GOAL_META, CATEGORY_META,
  type Supplement, type SupplementGoal, type SupplementCategory,
} from "@/lib/supplements-data";
import { NETWORK_LABEL, type SupplementBuyLink } from "@/lib/supplements-types";

// Phase 18-1: supplement may carry buy links from DB.
type SupplementWithLinks = Supplement & { links?: SupplementBuyLink[] };

const FONT = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
`;

const GOALS: SupplementGoal[] = ["muscle_gain", "weight_loss", "balanced", "performance"];

const CATEGORIES: Array<"all" | SupplementCategory> = [
  "all", "protein", "performance", "recovery", "vitamins", "minerals",
  "adaptogens", "joints", "gut", "weight", "hormones", "cognitive", "sleep",
];

// ── Supplement Detail Modal ───────────────────────────────────────────────────
function SupplementModal({ supp, onClose }: { supp: SupplementWithLinks; onClose: () => void }) {
  const catMeta = CATEGORY_META[supp.category];
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 520,
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px 24px 0 0", maxHeight: "90vh", overflowY: "auto",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
      }}>
        {/* Accent top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${supp.accent}, transparent)` }} />

        {/* Hero */}
        <div style={{
          padding: "28px 24px 20px", textAlign: "center",
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
          <div style={{ fontSize: 48, marginBottom: 12 }}>{supp.emoji}</div>
          <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: supp.accent, background: `${supp.accent}12`, border: `1px solid ${supp.accent}25`, borderRadius: 6, padding: "3px 9px", fontFamily: "DM Sans, sans-serif" }}>
            {catMeta.label}
          </span>
          <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "12px 0 6px" }}>{supp.name}</h2>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.4)", margin: 0 }}>{supp.tagline}</p>
        </div>

        <div style={{ padding: "20px 24px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>
            {supp.description}
          </p>

          {/* Benefits */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px" }}>
            <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px", fontFamily: "DM Sans, sans-serif" }}>Key Benefits</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {supp.benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <CheckCircle2 size={13} color={supp.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.5 }}>{b}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Dosage + Timing */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[
              { label: "Dosage", value: supp.dosage },
              { label: "Timing", value: supp.timing },
              { label: "Onset", value: supp.onsetTime },
              { label: "Evidence", value: `${supp.evidenceLevel.replace("_", " ")} (${supp.studyCount})` },
            ].map(({ label, value }) => (
              <div key={label} style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 12, padding: "12px 14px" }}>
                <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>{label}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.4 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Key study findings */}
          {supp.keyStudyFindings?.length > 0 && (
            <div style={{ background: `${supp.accent}06`, border: `1px solid ${supp.accent}15`, borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: supp.accent, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "DM Sans, sans-serif" }}>Research Findings</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {supp.keyStudyFindings.map((f, i) => (
                  <p key={i} style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>• {f}</p>
                ))}
              </div>
            </div>
          )}

          {/* Price + vegan */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: `${supp.accent}08`, border: `1px solid ${supp.accent}20`, borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: "0 0 2px", fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>Estimated Price</p>
              <p style={{ margin: 0, fontSize: 15, fontWeight: 700, color: supp.accent, fontFamily: "Syne, sans-serif" }}>{supp.priceRange}</p>
            </div>
            {supp.veganFriendly && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                <span style={{ fontSize: 16 }}>🌿</span>
                <span style={{ fontSize: 11, color: "rgba(163,230,53,0.7)", fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>Vegan-friendly</span>
              </div>
            )}
          </div>

          {/* Phase 18-1 — Where to buy (multi-network) */}
          {supp.links && supp.links.length > 0 && (
            <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px", fontFamily: "DM Sans, sans-serif" }}>Where to buy</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {supp.links.map((l) => (
                  <a key={l.id} href={l.clickUrl} target="_blank" rel="noopener sponsored noreferrer"
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
                      background: `${supp.accent}0a`, border: `1px solid ${supp.accent}25`,
                      borderRadius: 10, padding: "10px 14px",
                      textDecoration: "none", color: "#fff",
                      transition: "background 0.15s, border-color 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = `${supp.accent}18`; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = `${supp.accent}0a`; }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, fontFamily: "DM Sans, sans-serif" }}>
                        {l.merchantLabel || NETWORK_LABEL[l.network] || "Buy now"}
                      </span>
                      {l.notes && (
                        <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif" }}>{l.notes}</span>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      {l.priceRs ? (
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 14, fontWeight: 800, color: supp.accent, fontFamily: "Syne, sans-serif" }}>{'\u20B9'}{l.priceRs.toLocaleString("en-IN")}</div>
                          {l.mrpRs && l.mrpRs > l.priceRs && (
                            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textDecoration: "line-through" }}>{'\u20B9'}{l.mrpRs.toLocaleString("en-IN")}</div>
                          )}
                        </div>
                      ) : null}
                      <span style={{ fontSize: 16, color: supp.accent }}>{'\u2192'}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* India note */}
          {supp.indiaNote && (
            <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, color: "rgba(251,191,36,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>🇮🇳 India Note</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>{supp.indiaNote}</p>
            </div>
          )}

          {/* Warnings */}
          {supp.warnings && (
            <div style={{ background: "rgba(251,113,133,0.06)", border: "1px solid rgba(251,113,133,0.15)", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 9, fontWeight: 700, color: "rgba(251,113,133,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>⚠️ Cautions</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.6 }}>{supp.warnings}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Supplement Card ───────────────────────────────────────────────────────────
function SupplementCard({ supp, onClick }: { supp: Supplement; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const catMeta = CATEGORY_META[supp.category];

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered ? "#161616" : "#101010",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.055)"}`,
        borderRadius: 16, padding: 18, cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.18s ease", position: "relative", overflow: "hidden",
        boxShadow: hovered ? "0 10px 30px rgba(0,0,0,0.5)" : "none",
      }}
    >
      {supp.popular && (
        <div style={{
          position: "absolute", top: 10, right: 10,
          background: "rgba(251,191,36,0.12)", border: "1px solid rgba(251,191,36,0.25)",
          borderRadius: 6, padding: "2px 7px",
          fontSize: 9, fontWeight: 700, color: "#fbbf24",
          letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif",
        }}>Popular</div>
      )}
      <div style={{ fontSize: 28, marginBottom: 10 }}>{supp.emoji}</div>
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
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ fontSize: 10, color: supp.accent, fontFamily: "DM Sans, sans-serif", fontWeight: 600 }}>
          {supp.priceRange}
        </span>
        {supp.veganFriendly && <span style={{ fontSize: 11 }}>🌿</span>}
      </div>
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function SupplementsLanding({
  isLoggedIn,
  supplements,
}: {
  isLoggedIn: boolean;
  supplements: SupplementWithLinks[];
}) {
  const [activeGoal, setActiveGoal] = useState<SupplementGoal>("muscle_gain");
  const [catFilter, setCatFilter] = useState<"all" | SupplementCategory>("all");
  const [selectedSupp, setSelectedSupp] = useState<SupplementWithLinks | null>(null);

  const previewStack = STACKS[activeGoal]
    .map((id) => supplements.find((s) => s.id === id)!)
    .filter(Boolean);

  const filteredCatalogue = useMemo(() => {
    if (catFilter === "all") return supplements;
    return supplements.filter((s) => s.category === catFilter);
  }, [catFilter, supplements]);

  const goalMeta = GOAL_META[activeGoal];

  return (
    <>
      <style>{FONT}</style>
      <style>{`
        * { box-sizing: border-box; }
        @keyframes pulse-glow { 0%,100%{box-shadow:0 0 20px rgba(163,230,53,0.2)} 50%{box-shadow:0 0 40px rgba(163,230,53,0.4)} }
        ::-webkit-scrollbar { width: 4px; } ::-webkit-scrollbar-track { background: transparent; } ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div style={{ background: "#080808", minHeight: "100vh", color: "#fff" }}>

        {/* ── Hero ── */}
        <section style={{ position: "relative", padding: "120px 24px 80px", textAlign: "center", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 700, height: 500, background: "radial-gradient(ellipse, rgba(163,230,53,0.07) 0%, transparent 70%)", pointerEvents: "none" }} />

          <div style={{ maxWidth: 800, margin: "0 auto", position: "relative" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)", borderRadius: 20, padding: "6px 16px", marginBottom: 28 }}>
              <Sparkles size={13} color="#a3e635" />
              <span style={{ fontSize: 11, fontWeight: 700, color: "#a3e635", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "DM Sans, sans-serif" }}>
                Science-backed · India-specific · 50 supplements
              </span>
            </div>

            <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#fff" }}>
              Supplements built for{" "}
              <span style={{ background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                your goal
              </span>
            </h1>

            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 36px" }}>
              Stop guessing. Browse 50 science-backed supplements with clinical dosages, India-specific pricing, and personalised stack recommendations.
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
                  animation: "pulse-glow 3s ease-in-out infinite",
                }}
              >
                Get My Personalised Stack <ArrowRight size={16} />
              </Link>
              <a
                href="#catalogue"
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                  color: "rgba(255,255,255,0.7)", fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 14,
                  padding: "14px 24px", borderRadius: 14, textDecoration: "none",
                }}
              >
                Browse All 50 ↓
              </a>
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 28, marginTop: 36, flexWrap: "wrap" }}>
              {[
                { icon: <Shield size={13} />, text: "Lab-tested sources" },
                { icon: <Truck size={13} />, text: "Delivered with your meals" },
                { icon: <Star size={13} />, text: "India pricing & context" },
              ].map(({ icon, text }) => (
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "DM Sans, sans-serif" }}>
                  {icon}<span>{text}</span>
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
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>
              Personalised for what you're working toward
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0 }}>
              Sign in to take the full quiz and get a stack tuned to your diet, budget, and challenges
            </p>
          </div>

          {/* Goal tabs */}
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 36, flexWrap: "wrap" }}>
            {GOALS.map((goal) => {
              const meta = GOAL_META[goal];
              const active = goal === activeGoal;
              return (
                <button key={goal} onClick={() => setActiveGoal(goal)} style={{
                  display: "flex", alignItems: "center", gap: 8,
                  padding: "10px 18px", borderRadius: 12,
                  background: active ? meta.accent : "rgba(255,255,255,0.04)",
                  border: `1px solid ${active ? meta.accent : "rgba(255,255,255,0.08)"}`,
                  color: active ? "#000" : "rgba(255,255,255,0.4)",
                  fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  transition: "all 0.18s ease",
                }}>
                  <span>{meta.emoji}</span><span>{meta.label}</span>
                </button>
              );
            })}
          </div>

          {/* Stack cards — clickable, full detail */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 12 }}>
            {previewStack.map((supp) => (
              <SupplementCard key={supp.id} supp={supp} onClick={() => setSelectedSupp(supp)} />
            ))}
          </div>

          <div style={{ textAlign: "center", marginTop: 24 }}>
            <Link
              href={isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"}
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#a3e635", fontFamily: "DM Sans, sans-serif", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
            >
              Take the full quiz to personalise your stack <ChevronRight size={14} />
            </Link>
          </div>
        </section>

        {/* ── Full Catalogue — ALL 50, no locks ── */}
        <section id="catalogue" style={{ padding: "60px 24px 80px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ marginBottom: 32 }}>
            <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 10, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: "DM Sans, sans-serif", margin: "0 0 8px" }}>
                  Full Catalogue
                </p>
                <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
                  {filteredCatalogue.length} supplement{filteredCatalogue.length !== 1 ? "s" : ""} — tap any for full details
                </h2>
              </div>
            </div>

            {/* Category filter tabs */}
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {CATEGORIES.map((cat) => {
                const active = cat === catFilter;
                const meta = cat === "all" ? null : CATEGORY_META[cat];
                const accent = meta?.accent ?? "#a3e635";
                return (
                  <button key={cat} onClick={() => setCatFilter(cat)} style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "6px 12px", borderRadius: 8,
                    background: active ? `${accent}15` : "rgba(255,255,255,0.04)",
                    border: `1px solid ${active ? `${accent}35` : "rgba(255,255,255,0.07)"}`,
                    color: active ? accent : "rgba(255,255,255,0.35)",
                    fontFamily: "DM Sans, sans-serif", fontWeight: 500, fontSize: 11,
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}>
                    {meta && <span style={{ fontSize: 12 }}>{meta.emoji}</span>}
                    <span>{cat === "all" ? "All" : meta?.label ?? cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(185px, 1fr))", gap: 10 }}>
            {filteredCatalogue.map((supp) => (
              <SupplementCard key={supp.id} supp={supp} onClick={() => setSelectedSupp(supp)} />
            ))}
          </div>
        </section>

        {/* ── Why FitFuel Supplements ── */}
        <section style={{ padding: "40px 24px 60px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
              Why supplement with FitFuel?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { emoji: "🎯", title: "Goal-matched, not generic", body: "Your stack is built around your specific goal — muscle gain, fat loss, or peak performance. Each recommendation includes clinical dosage and timing." },
              { emoji: "🚚", title: "Delivered with your meals", body: "No extra orders. Your supplements arrive packaged with your daily FitFuel meal box — convenient, consistent, and trackable." },
              { emoji: "🔬", title: "Science-backed, no fluff", body: "Every supplement is backed by clinical research. We include study counts, effect sizes, and India-specific availability notes — so you know exactly what and why." },
              { emoji: "🇮🇳", title: "India-first pricing", body: "Every supplement includes INR pricing estimates and local availability info — widely available, available, limited, or import only." },
            ].map(({ emoji, title, body }) => (
              <div key={title} style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 18, padding: 24 }}>
                <div style={{ fontSize: 30, marginBottom: 14 }}>{emoji}</div>
                <p style={{ margin: "0 0 8px", fontSize: 15, fontWeight: 700, color: "#fff", fontFamily: "Syne, sans-serif" }}>{title}</p>
                <p style={{ margin: 0, fontSize: 13, color: "rgba(255,255,255,0.4)", fontFamily: "DM Sans, sans-serif", lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section style={{ padding: "20px 24px 80px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "linear-gradient(135deg, rgba(163,230,53,0.08) 0%, rgba(163,230,53,0.03) 100%)", border: "1px solid rgba(163,230,53,0.15)", borderRadius: 24, padding: "48px 32px" }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>⚡</div>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
              Ready to fuel smarter?
            </h2>
            <p style={{ fontFamily: "DM Sans, sans-serif", fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>
              Sign in to take the personalised quiz and get a stack built around your goal, training frequency, diet, and budget.
            </p>
            <Link
              href={isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#a3e635", color: "#000",
                fontFamily: "Syne, sans-serif", fontWeight: 700, fontSize: 14,
                padding: "14px 28px", borderRadius: 14, textDecoration: "none",
                boxShadow: "0 6px 24px rgba(163,230,53,0.25)",
              }}
            >
              {isLoggedIn ? "Go to My Dashboard" : "Sign In to Get Your Stack"} <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </div>

      {/* Detail modal */}
      {selectedSupp && (
        <SupplementModal supp={selectedSupp} onClose={() => setSelectedSupp(null)} />
      )}
    </>
  );
}