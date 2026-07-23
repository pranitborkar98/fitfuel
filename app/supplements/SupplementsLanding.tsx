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
// Phase 18-3: also surface DB-only fields (imageUrl, brandName, isFeatured)
type SupplementWithLinks = Supplement & {
  links?: SupplementBuyLink[];
  imageUrl?: string | null;
  brandName?: string | null;
  isFeatured?: boolean;
};

const GOALS: SupplementGoal[] = ["muscle_gain", "weight_loss", "balanced", "performance"];

const CATEGORIES: Array<"all" | SupplementCategory> = [
  "all", "protein", "performance", "recovery", "vitamins", "minerals",
  "adaptogens", "joints", "gut", "weight", "hormones", "cognitive", "sleep",
];

// ── Supplement Detail Modal ───────────────────────────────────────────────────
function SupplementModal({ supp, onClose }: { supp: SupplementWithLinks; onClose: () => void }) {
  const catMeta = CATEGORY_META[supp.category];

  const primary = supp.links && supp.links.length > 0 ? supp.links[0] : null;
  const livePrice = primary?.priceRs ?? null;
  const liveMrp = primary?.mrpRs ?? null;
  const discount = livePrice && liveMrp && liveMrp > livePrice
    ? Math.round(((liveMrp - livePrice) / liveMrp) * 100) : 0;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      <div onClick={onClose} style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(10px)" }} />
      <div style={{
        position: "relative", width: "100%", maxWidth: 560,
        background: "#0d0d0d", border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px 24px 0 0", maxHeight: "92vh", overflowY: "auto",
        boxShadow: "0 -20px 60px rgba(0,0,0,0.8)",
      }}>
        {/* Accent top bar */}
        <div style={{ height: 3, background: `linear-gradient(90deg, ${supp.accent}, transparent)` }} />

        {/* Hero — image + meta + BUY CTA */}
        <div style={{
          padding: "24px 24px 20px",
          background: `linear-gradient(135deg, ${supp.accent}10 0%, transparent 70%)`,
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          position: "relative",
        }}>
          <button
            onClick={onClose}
            style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", background: "rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.1)", cursor: "pointer", color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}
          >
            <X size={14} />
          </button>

          <div style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: primary ? 16 : 0 }}>
            {/* Image / emoji block */}
            <div style={{
              width: 96, height: 96, flexShrink: 0,
              background: supp.imageUrl ? "#000" : `linear-gradient(135deg, ${supp.accent}25, ${supp.accent}08)`,
              border: `1px solid ${supp.accent}30`, borderRadius: 14,
              display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden",
            }}>
              {supp.imageUrl ? (
                <img src={supp.imageUrl} alt={supp.name} style={{ width: "100%", height: "100%", objectFit: "contain", padding: 8 }} />
              ) : (
                <div style={{ fontSize: 44 }}>{supp.emoji}</div>
              )}
            </div>

            <div style={{ flex: 1, minWidth: 0, paddingRight: 30 }}>
              <span style={{ fontSize: 12, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: supp.accent, background: `${supp.accent}15`, border: `1px solid ${supp.accent}30`, borderRadius: 6, padding: "3px 9px", fontFamily: "inherit" }}>
                {catMeta.label}
              </span>
              <h2 style={{ fontFamily: "var(--ff-cond)", fontSize: 22, fontWeight: 700, color: "#fff", margin: "10px 0 4px", lineHeight: 1.2 }}>{supp.name}</h2>
              <p style={{ fontFamily: "inherit", fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0, lineHeight: 1.5 }}>{supp.tagline}</p>
            </div>
          </div>

          {/* BUY CTA — top, big, prominent */}
          {primary && (
            <a
              href={primary.clickUrl}
              target="_blank"
              rel="noopener sponsored noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                background: supp.accent, color: "#000",
                textDecoration: "none", borderRadius: 12, padding: "14px 18px",
                fontFamily: "inherit", fontWeight: 800,
                transition: "filter 0.15s",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.08)"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1)"; }}
            >
              <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <span style={{ fontSize: 12, opacity: 0.65, letterSpacing: "0.05em" }}>Buy on Nutrabay</span>
                {livePrice != null ? (
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span style={{ fontFamily: "var(--ff-cond)", fontSize: 22, fontWeight: 800 }}>
                      {'\u20B9'}{livePrice.toLocaleString("en-IN")}
                    </span>
                    {liveMrp && liveMrp > livePrice && (
                      <>
                        <span style={{ fontSize: 12, opacity: 0.5, textDecoration: "line-through" }}>
                          {'\u20B9'}{liveMrp.toLocaleString("en-IN")}
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 800, background: "#000", color: supp.accent, padding: "2px 6px", borderRadius: 4 }}>
                          {discount}% OFF
                        </span>
                      </>
                    )}
                  </div>
                ) : (
                  <span style={{ fontFamily: "var(--ff-cond)", fontSize: 16 }}>View product {'\u2192'}</span>
                )}
                {primary.notes && (
                  <span style={{ fontSize: 12, opacity: 0.65 }}>{primary.notes}</span>
                )}
              </div>
              <span style={{ fontSize: 22 }}>{'\u2192'}</span>
            </a>
          )}
        </div>

        <div style={{ padding: "20px 24px 36px", display: "flex", flexDirection: "column", gap: 16 }}>
          <p style={{ fontFamily: "inherit", fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.7, margin: 0 }}>
            {supp.description}
          </p>

          {/* Benefits */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 14, padding: "14px 16px" }}>
            <p style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 12px", fontFamily: "inherit" }}>Key Benefits</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {supp.benefits.map((b) => (
                <div key={b} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                  <CheckCircle2 size={13} color={supp.accent} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", fontFamily: "inherit", lineHeight: 1.5 }}>{b}</span>
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
                <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit" }}>{label}</p>
                <p style={{ margin: 0, fontSize: 12, fontWeight: 500, color: "rgba(255,255,255,0.7)", fontFamily: "inherit", lineHeight: 1.4 }}>{value}</p>
              </div>
            ))}
          </div>

          {/* Key study findings */}
          {supp.keyStudyFindings?.length > 0 && (
            <div style={{ background: `${supp.accent}06`, border: `1px solid ${supp.accent}15`, borderRadius: 14, padding: "14px 16px" }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: supp.accent, letterSpacing: "0.15em", textTransform: "uppercase", margin: "0 0 10px", fontFamily: "inherit" }}>Research Findings</p>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {supp.keyStudyFindings.map((f, i) => (
                  <p key={i} style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "inherit", lineHeight: 1.6 }}>• {f}</p>
                ))}
              </div>
            </div>
          )}

          {/* Estimated price range + vegan badge */}
          <div style={{ display: "flex", gap: 10 }}>
            <div style={{ flex: 1, background: `${supp.accent}08`, border: `1px solid ${supp.accent}20`, borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: "0 0 2px", fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit" }}>Typical Range</p>
              <p style={{ margin: 0, fontSize: 14, fontWeight: 700, color: supp.accent, fontFamily: "var(--ff-cond)" }}>{supp.priceRange}</p>
            </div>
            {supp.veganFriendly && (
              <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(163,230,53,0.06)", border: "1px solid rgba(163,230,53,0.15)", borderRadius: 12, padding: "12px 16px" }}>
                <span style={{ fontSize: 16 }}>🌿</span>
                <span style={{ fontSize: 12, color: "rgba(163,230,53,0.7)", fontFamily: "inherit", fontWeight: 600 }}>Vegan-friendly</span>
              </div>
            )}
          </div>

          {/* Bottom BUY CTA — repeat for users who scrolled */}
          {primary && (
            <a
              href={primary.clickUrl}
              target="_blank"
              rel="noopener sponsored noreferrer"
              style={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                background: supp.accent, color: "#000",
                textDecoration: "none", borderRadius: 12, padding: "14px 18px",
                fontFamily: "inherit", fontWeight: 800, fontSize: 14,
                letterSpacing: "0.04em",
              }}
            >
              {livePrice != null ? (
                <>Buy on Nutrabay {'\u2014'} {'\u20B9'}{livePrice.toLocaleString("en-IN")} {'\u2192'}</>
              ) : (
                <>View on Nutrabay {'\u2192'}</>
              )}
            </a>
          )}

          {/* India note */}
          {supp.indiaNote && (
            <div style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "rgba(251,191,36,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit" }}>🇮🇳 India Note</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.5)", fontFamily: "inherit", lineHeight: 1.6 }}>{supp.indiaNote}</p>
            </div>
          )}

          {/* Warnings */}
          {supp.warnings && (
            <div style={{ background: "rgba(251,113,133,0.06)", border: "1px solid rgba(251,113,133,0.15)", borderRadius: 12, padding: "12px 16px" }}>
              <p style={{ margin: "0 0 4px", fontSize: 12, fontWeight: 700, color: "rgba(251,113,133,0.6)", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "inherit" }}>⚠️ Cautions</p>
              <p style={{ margin: 0, fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "inherit", lineHeight: 1.6 }}>{supp.warnings}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Supplement Card ───────────────────────────────────────────────────────────
function SupplementCard({ supp, onClick }: { supp: SupplementWithLinks; onClick: () => void }) {
  const [hovered, setHovered] = useState(false);
  const catMeta = CATEGORY_META[supp.category];

  // Phase 18-3 — surface real price from active link when available.
  const primary = supp.links && supp.links.length > 0 ? supp.links[0] : null;
  const livePrice = primary?.priceRs ?? null;
  const liveMrp = primary?.mrpRs ?? null;
  const hasBuy = !!primary;

  function buyClick(e: React.MouseEvent) {
    // Don't open the modal — go straight to checkout.
    e.stopPropagation();
    e.preventDefault();
    if (!primary) return;
    window.open(primary.clickUrl, "_blank", "noopener,sponsored");
  }

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: "#0f0f0f",
        border: `1px solid ${hovered ? `${supp.accent}40` : "rgba(255,255,255,0.06)"}`,
        borderRadius: 16, cursor: "pointer",
        transform: hovered ? "translateY(-3px)" : "none",
        transition: "all 0.18s ease", position: "relative", overflow: "hidden",
        boxShadow: hovered ? `0 12px 32px rgba(0,0,0,0.5), 0 0 0 1px ${supp.accent}15` : "none",
        display: "flex", flexDirection: "column",
      }}
    >
      {/* Image / emoji hero block */}
      <div style={{
        position: "relative",
        background: supp.imageUrl
          ? "#000"
          : `linear-gradient(135deg, ${supp.accent}18, ${supp.accent}05)`,
        height: 160,
        display: "flex", alignItems: "center", justifyContent: "center",
        borderBottom: `1px solid rgba(255,255,255,0.04)`,
      }}>
        {supp.imageUrl ? (
          <img
            src={supp.imageUrl}
            alt={supp.name}
            style={{ width: "100%", height: "100%", objectFit: "contain", padding: 16 }}
            onError={(e) => {
              // Fallback to emoji if image fails to load
              (e.currentTarget as HTMLImageElement).style.display = "none";
              const next = (e.currentTarget.nextSibling as HTMLElement);
              if (next) next.style.display = "block";
            }}
          />
        ) : null}
        {!supp.imageUrl && (
          <div style={{ fontSize: 64, opacity: 0.9 }}>{supp.emoji}</div>
        )}

        {/* Popular badge. Was amber #fbbf24, the last off-palette hue on a
            public surface. Lime is the only accent (DESIGN.md). */}
        {supp.popular && (
          <div style={{
            position: "absolute", top: 10, right: 10,
            background: "rgba(0,0,0,0.72)",
            border: "1px solid rgba(163,230,53,0.4)",
            borderRadius: 0, padding: "4px 8px",
            fontSize: 12, fontWeight: 800, color: "#a3e635",
            letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--ff-cond)",
          }}>Popular</div>
        )}

        {/* Category badge (overlay on image) */}
        <div style={{
          position: "absolute", bottom: 10, left: 10,
          background: "rgba(0,0,0,0.75)", backdropFilter: "blur(4px)",
          border: `1px solid ${supp.accent}40`,
          borderRadius: 6, padding: "3px 8px",
          fontSize: 12, fontWeight: 700, color: supp.accent,
          letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "inherit",
        }}>
          {catMeta.label}
        </div>

        {/* Vegan icon */}
        {supp.veganFriendly && (
          <div style={{
            position: "absolute", bottom: 10, right: 10,
            background: "rgba(0,0,0,0.7)", borderRadius: "50%",
            width: 24, height: 24, display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 12,
          }} title="Vegan-friendly">🌿</div>
        )}
      </div>

      {/* Content block */}
      <div style={{ padding: "14px 16px 16px", display: "flex", flexDirection: "column", flex: 1 }}>
        <p style={{ margin: "0 0 4px", fontSize: 14, fontWeight: 700, color: "#fff", fontFamily: "inherit", lineHeight: 1.3 }}>
          {supp.name}
        </p>
        <p style={{ margin: "0 0 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", fontFamily: "inherit", lineHeight: 1.45, minHeight: 30 }}>
          {supp.tagline}
        </p>

        {/* Price block */}
        <div style={{ marginBottom: 12, marginTop: "auto" }}>
          {livePrice != null ? (
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: supp.accent, fontFamily: "var(--ff-cond)" }}>
                {'\u20B9'}{livePrice.toLocaleString("en-IN")}
              </span>
              {liveMrp && liveMrp > livePrice && (
                <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", textDecoration: "line-through" }}>
                  {'\u20B9'}{liveMrp.toLocaleString("en-IN")}
                </span>
              )}
              {liveMrp && liveMrp > livePrice && (
                <span style={{
                  fontSize: 12, fontWeight: 700, color: "#22c55e",
                  background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.25)",
                  borderRadius: 4, padding: "1px 6px", letterSpacing: "0.05em",
                }}>
                  {Math.round(((liveMrp - livePrice) / liveMrp) * 100)}% OFF
                </span>
              )}
            </div>
          ) : (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", fontFamily: "inherit", fontWeight: 500 }}>
              {supp.priceRange}
            </span>
          )}
        </div>

        {/* Buy CTA (only renders when an active link exists) */}
        {hasBuy ? (
          <button
            onClick={buyClick}
            style={{
              width: "100%", background: supp.accent, color: "#000",
              border: "none", borderRadius: 10, padding: "11px 14px",
              fontSize: 13, fontWeight: 800, cursor: "pointer",
              fontFamily: "inherit", letterSpacing: "0.04em",
              transition: "filter 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1.1)"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.filter = "brightness(1)"; }}
          >
            Buy on Nutrabay {'\u2192'}
          </button>
        ) : (
          <div style={{
            width: "100%", background: "transparent", color: "rgba(255,255,255,0.4)",
            border: `1px dashed ${supp.accent}30`, borderRadius: 10, padding: "10px 14px",
            fontSize: 12, fontWeight: 600, textAlign: "center",
            fontFamily: "inherit", letterSpacing: "0.04em",
          }}>
            View details {'\u2192'}
          </div>
        )}
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
              <span style={{ fontSize: 12, fontWeight: 700, color: "#a3e635", letterSpacing: "0.15em", textTransform: "uppercase", fontFamily: "inherit" }}>
                Science-backed · India-specific · 50 supplements
              </span>
            </div>

            <h1 style={{ fontFamily: "var(--ff-cond)", fontSize: "clamp(2.4rem, 6vw, 4.5rem)", fontWeight: 800, lineHeight: 1.05, letterSpacing: "-0.03em", margin: "0 0 20px", color: "#fff" }}>
              Supplements built for{" "}
              <span style={{ background: "linear-gradient(135deg, #a3e635 0%, #84cc16 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                your goal
              </span>
            </h1>

            <p style={{ fontFamily: "inherit", fontSize: 17, color: "rgba(255,255,255,0.45)", lineHeight: 1.7, maxWidth: 540, margin: "0 auto 36px" }}>
              Stop guessing. Browse 50 science-backed supplements with clinical dosages, India-specific pricing, and personalised stack recommendations.
            </p>

            <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
              <Link
                href={isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 8,
                  background: "#a3e635", color: "#000",
                  fontFamily: "var(--ff-cond)", fontWeight: 700, fontSize: 14,
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
                  color: "rgba(255,255,255,0.7)", fontFamily: "inherit", fontWeight: 500, fontSize: 14,
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
                <div key={text} style={{ display: "flex", alignItems: "center", gap: 6, color: "rgba(255,255,255,0.3)", fontSize: 12, fontFamily: "inherit" }}>
                  {icon}<span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Goal-based stack preview ── */}
        <section style={{ padding: "60px 24px", maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: "inherit", marginBottom: 12 }}>
              Your Goal · Your Stack
            </p>
            <h2 style={{ fontFamily: "var(--ff-cond)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 700, color: "#fff", margin: "0 0 10px" }}>
              Personalised for what you're working toward
            </h2>
            <p style={{ fontFamily: "inherit", fontSize: 14, color: "rgba(255,255,255,0.35)", margin: 0 }}>
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
                  fontFamily: "var(--ff-cond)", fontWeight: 700, fontSize: 13, cursor: "pointer",
                  transition: "all 0.18s ease",
                }}>
                  <span>{meta.label}</span>
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
              style={{ display: "inline-flex", alignItems: "center", gap: 8, color: "#a3e635", fontFamily: "inherit", fontWeight: 600, fontSize: 13, textDecoration: "none" }}
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
                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.25)", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 700, fontFamily: "inherit", margin: "0 0 8px" }}>
                  Full Catalogue
                </p>
                <h2 style={{ fontFamily: "var(--ff-cond)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
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
                    fontFamily: "inherit", fontWeight: 500, fontSize: 12,
                    cursor: "pointer", transition: "all 0.15s ease",
                  }}>
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
            <h2 style={{ fontFamily: "var(--ff-cond)", fontSize: "clamp(1.4rem, 2.5vw, 2rem)", fontWeight: 700, color: "#fff", margin: 0 }}>
              Why supplement with FitFuel?
            </h2>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {/* Emoji icons removed: DESIGN.md rejects them on sight, and a
                🎯/🚚/🔬 row on top of a 3-up card grid is the exact template
                the house style exists to avoid. A numbered rule carries the
                same structure without the decoration. */}
            {[
              { title: "Goal-matched, not generic", body: "Your stack is built around your specific goal: muscle gain, fat loss, or peak performance. Each recommendation includes clinical dosage and timing." },
              { title: "Delivered with your meals", body: "No extra orders. Your supplements arrive packaged with your daily FitFuel meal box, so they are convenient, consistent and trackable." },
              { title: "Science-backed, no fluff", body: "Every supplement is backed by clinical research. We include study counts, effect sizes and India-specific availability, so you know exactly what and why." },
              { title: "India-first pricing", body: "Every supplement includes INR pricing estimates and local availability: widely available, available, limited, or import only." },
            ].map(({ title, body }, i) => (
              <div key={title} style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 0, padding: 24 }}>
                <div aria-hidden style={{ fontFamily: "var(--ff-cond)", fontWeight: 800, fontSize: 12.5, letterSpacing: "0.28em", color: "#a3e635", marginBottom: 14 }}>
                  {String(i + 1).padStart(2, "0")}
                </div>
                <p style={{ margin: "0 0 8px", fontSize: 17, fontWeight: 800, color: "#fff", fontFamily: "var(--ff-cond)", textTransform: "uppercase", letterSpacing: "-0.01em" }}>{title}</p>
                <p style={{ margin: 0, fontSize: 13.5, color: "#9a9a94", fontFamily: "inherit", lineHeight: 1.7 }}>{body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section style={{ padding: "20px 24px 80px", maxWidth: 700, margin: "0 auto", textAlign: "center" }}>
          <div style={{ background: "rgba(163,230,53,0.05)", border: "1px solid rgba(163,230,53,0.15)", borderRadius: 0, padding: "48px 32px" }}>
            <h2 style={{ fontFamily: "var(--ff-cond)", fontSize: "clamp(1.4rem, 3vw, 2rem)", fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>
              Ready to fuel smarter?
            </h2>
            <p style={{ fontFamily: "inherit", fontSize: 14, color: "rgba(255,255,255,0.4)", margin: "0 0 28px", lineHeight: 1.6 }}>
              Sign in to take the personalised quiz and get a stack built around your goal, training frequency, diet, and budget.
            </p>
            <Link
              href={isLoggedIn ? "/dashboard/supplements" : "/auth/signin?callbackUrl=/dashboard/supplements"}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                background: "#a3e635", color: "#000",
                fontFamily: "var(--ff-cond)", fontWeight: 700, fontSize: 14,
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