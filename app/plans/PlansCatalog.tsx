// app/plans/PlansCatalog.tsx — Phase 19A (rev. configurator)
// Step 1 (diet) → Step 2 (duration) → Step 3 (meals) → Pricing matrix (3 tiers side-by-side)
// Then a browseable grid of all 126 plans, each priced for the selected configurator combo.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TIERS,
  MEALS,
  DIETS,
  DURATIONS,
  getTierPrice,
  buildCheckoutUrl,
  type Tier,
  type MealKey,
  type DietKey,
  type DurationKey,
  type PriceRow,
} from "@/lib/plan-tier-pricing";

interface Plan {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  tagline?: string | null;
  description?: string | null;
  category: "STANDARD" | "LIFESTYLE_MEDICAL" | "SPORTS" | "CORPORATE" | "DIGITAL";
  subCategory: string;
  dietaryVariant: DietKey;
  tier: "STANDARD" | "PREMIUM" | "LUXURY";
  avgCaloriesPerDay: number;
  avgProteinGrams: number;
  avgCarbsGrams: number;
  avgFatGrams: number;
  cycleLengthDays: number;
  mealsPerDay: number;
  isActive: boolean;
  imageUrl?: string | null;
  accentColor?: string | null;
}

interface Props {
  plans: Plan[];
  pricesByPlan: Record<string, PriceRow[]>;
}

const T = {
  bg: "#080808", card: "#0c0c0c", cardHover: "#111", border: "#191919",
  borderHover: "#262626", accent: "#a3e635", accentDim: "#84cc16",
  textPrimary: "#f4f3ee", textSecond: "#a3a3a3", textMuted: "#8d8d87", textFaint: "#565651",
};

const CATEGORY_LABELS: Record<Plan["category"], { label: string; desc: string }> = {
  STANDARD: { label: "Goal-based", desc: "Weight loss, muscle gain, general fitness" },
  LIFESTYLE_MEDICAL: { label: "Lifestyle & medical", desc: "PCOS, diabetes, thyroid, recovery, allergies" },
  SPORTS: { label: "Sports nutrition", desc: "Cricket, football, gym, endurance, strength" },
  CORPORATE: { label: "Corporate", desc: "Office wellness programmes" },
  DIGITAL: { label: "Digital", desc: "PDF-only plans" },
};

const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

// ─── Step label ──────────────────────────────────────────────────────────────
function StepLabel({ n, children }: { n: string; children: React.ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
      <span style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: 26, height: 26, borderRadius: "50%", background: T.accent, color: "#0a0a0a",
        fontFamily: "'Space Mono', monospace", fontSize: 12, fontWeight: 700,
      }}>{n}</span>
      <span style={{
        fontFamily: "'Space Mono', monospace", fontSize: 12, color: T.accent,
        fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
      }}>{children}</span>
    </div>
  );
}

// ─── Pill (reused) ───────────────────────────────────────────────────────────
function Pill({
  active, onClick, children, accentColor,
}: { active: boolean; onClick: () => void; children: React.ReactNode; accentColor?: string }) {
  const ac = accentColor ?? T.accent;
  return (
    <button onClick={onClick}
      style={{
        padding: "10px 16px",
        background: active ? ac : "transparent",
        color: active ? "#0a0a0a" : T.textSecond,
        border: `1px solid ${active ? ac : T.border}`,
        borderRadius: 3, fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 13, fontWeight: 600, cursor: "pointer",
        transition: "all 150ms ease", whiteSpace: "nowrap",
      }}>{children}</button>
  );
}

// ─── Selector card (for diet/duration/meal) ──────────────────────────────────
function SelectorCard({
  active, onClick, title, sub, dot,
}: { active: boolean; onClick: () => void; title: string; sub?: string; dot?: string }) {
  return (
    <button onClick={onClick}
      style={{
        flex: "1 1 130px", textAlign: "left",
        padding: "14px 16px",
        background: active ? "#101807" : "#0a0a0a",
        border: active ? `1px solid ${T.accent}` : `1px solid ${T.border}`,
        borderRadius: 4, cursor: "pointer",
        transition: "all .25s cubic-bezier(.16,1,.3,1)",
        boxShadow: active ? `0 0 0 1px ${T.accent}` : "none",
      }}
      onMouseEnter={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = "#333" }}
      onMouseLeave={(e) => { if (!active) (e.currentTarget as HTMLButtonElement).style.borderColor = T.border }}
    >
      {dot && (
        <span style={{
          display: "inline-block", width: 7, height: 7, background: dot,
          borderRadius: 999, marginRight: 8, verticalAlign: "middle",
        }} />
      )}
      <span style={{
        fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700,
        color: active ? T.accent : T.textPrimary, letterSpacing: "-0.01em",
      }}>{title}</span>
      {sub && (
        <div style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10.5,
          color: T.textFaint, marginTop: 4, letterSpacing: "0.04em",
        }}>{sub}</div>
      )}
    </button>
  );
}

// ─── Plan card (priced for current configurator combo) ───────────────────────
function PlanCard({
  plan, prices, tier, dur, meal,
}: { plan: Plan; prices: PriceRow[]; tier: Tier; dur: DurationKey; meal: MealKey }) {
  const price = getTierPrice(prices, tier, dur, meal);
  const tierMeta = TIERS.find((t) => t.key === tier)!;
  const diet = DIETS.find((d) => d.key === plan.dietaryVariant);
  const dietLabel = diet?.short ?? plan.dietaryVariant;
  const dietDot = diet?.dot ?? "#a3a3a3";

  return (
    <Link href={`/plans/${plan.slug}`}
      style={{
        display: "block", background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 4, padding: 16, textDecoration: "none", color: "inherit",
        transition: "all 180ms cubic-bezier(.16,1,.3,1)",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = T.cardHover;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = T.borderHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = T.card;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border;
      }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <span style={{ width: 6, height: 6, background: dietDot, borderRadius: 999, display: "inline-block" }} />
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          color: T.textMuted, letterSpacing: "0.05em",
        }}>{dietLabel.toUpperCase()}</span>
        <span style={{ color: T.textFaint, fontSize: 10 }}>·</span>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 10,
          color: T.textMuted, letterSpacing: "0.05em",
        }}>{plan.avgCaloriesPerDay} KCAL</span>
      </div>
      <h3 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 16, fontWeight: 700,
        margin: "0 0 6px", color: T.textPrimary, letterSpacing: "-0.01em", lineHeight: 1.25,
      }}>{plan.displayName}</h3>
      {plan.tagline && (
        <p style={{
          fontSize: 12, color: T.textSecond, margin: "0 0 12px", lineHeight: 1.4,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", minHeight: 34,
        }}>{plan.tagline}</p>
      )}
      <div style={{
        display: "flex", alignItems: "baseline", justifyContent: "space-between",
        borderTop: `1px solid ${T.border}`, paddingTop: 10,
      }}>
        <span style={{
          fontFamily: "'Space Mono', monospace", fontSize: 9.5,
          color: tierMeta.accent, fontWeight: 700, letterSpacing: "0.08em",
        }}>{tierMeta.label.toUpperCase()}</span>
        <span style={{
          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 22,
          fontWeight: 600, color: T.textPrimary, lineHeight: 1,
        }}>{price !== null ? fmt(price) : "—"}</span>
      </div>
    </Link>
  );
}

// ─── Main Catalog ────────────────────────────────────────────────────────────
export default function PlansCatalog({ plans, pricesByPlan }: Props) {
  // Configurator state
  const [diet, setDiet] = useState<DietKey>("VEG");
  const [dur, setDur]   = useState<DurationKey>("ONE_MONTH");
  const [meal, setMeal] = useState<MealKey>("ALL_FOUR");

  // Browse state
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | Plan["category"]>("ALL");

  // Waitlist modal
  const [wlTier, setWlTier] = useState<Tier | null>(null);
  const [wlEmail, setWlEmail] = useState("");
  const [wlStatus, setWlStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [wlErr, setWlErr] = useState("");

  async function submitWaitlist() {
    if (!wlTier) return;
    if (!wlEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(wlEmail)) {
      setWlErr("Enter a valid email"); setWlStatus("error"); return;
    }
    setWlStatus("submitting"); setWlErr("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: wlEmail, tier: wlTier }),
      });
      if (!res.ok) throw new Error("Request failed");
      setWlStatus("success");
    } catch {
      setWlErr("Could not submit. Try again."); setWlStatus("error");
    }
  }

  // Plans filtered to diet + search + category (the "Browse all" grid)
  const browsePlans = useMemo(() => {
    return plans.filter((p) => {
      if (p.dietaryVariant !== diet) return false;
      if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.displayName.toLowerCase().includes(q) &&
            !p.subCategory.toLowerCase().includes(q) &&
            !(p.tagline ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [plans, diet, activeCategory, search]);

  const grouped = useMemo(() => {
    const g: Record<string, Plan[]> = {};
    for (const p of browsePlans) { if (!g[p.category]) g[p.category] = []; g[p.category].push(p); }
    return g;
  }, [browsePlans]);

  const categoryOrder: Plan["category"][] = ["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS", "CORPORATE", "DIGITAL"];
  const orderedCategories = categoryOrder.filter((c) => grouped[c]);

  // Pick a representative plan to source standard prices from (any plan with same diet works,
  // since pricing is plan-agnostic within a diet). Falls back to first plan that has prices.
  const pricesForCombo = useMemo(() => {
    for (const p of plans) {
      if (p.dietaryVariant === diet) {
        const rows = pricesByPlan[p.id];
        if (rows && rows.length) return rows;
      }
    }
    // fallback to any plan with prices
    for (const p of plans) {
      const rows = pricesByPlan[p.id];
      if (rows && rows.length) return rows;
    }
    return [];
  }, [plans, pricesByPlan, diet]);

  const dietMeta = DIETS.find((d) => d.key === diet)!;
  const durMeta  = DURATIONS.find((d) => d.key === dur)!;
  const mealMeta = MEALS.find((m) => m.key === meal)!;

  // Counts per diet (for showing on diet buttons)
  const dietCounts = useMemo(() => {
    const m: Record<string, number> = {};
    for (const p of plans) m[p.dietaryVariant] = (m[p.dietaryVariant] ?? 0) + 1;
    return m;
  }, [plans]);

  return (
    <main style={{
      background: T.bg, minHeight: "100vh", color: T.textPrimary,
      padding: "48px 20px 80px", fontFamily: "'DM Sans', system-ui, sans-serif",
      WebkitFontSmoothing: "antialiased",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=Barlow+Condensed:wght@500;600;700&family=DM+Sans:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap');
      `}</style>

      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace", color: T.accent, fontSize: 11,
            fontWeight: 700, letterSpacing: "0.12em",
          }}>01 · MEAL PLANS</span>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 5.5vw, 64px)",
            fontWeight: 800, margin: "14px 0 14px", lineHeight: 0.98, letterSpacing: "-0.025em",
          }}>
            Build your plan.<br />Pick your goal.
          </h1>
          <p style={{ color: T.textSecond, fontSize: 16, maxWidth: 620, margin: "0 auto", lineHeight: 1.55 }}>
            {plans.length} meal plans. Three tiers. Daily delivery in Pune. Configure your diet, duration and meals — then choose the goal that matches.
          </p>
        </div>

        {/* ── STEP 1 — Diet ── */}
        <section style={{ marginBottom: 36 }}>
          <StepLabel n="1">Choose your diet</StepLabel>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {DIETS.map((d) => (
              <SelectorCard key={d.key}
                active={diet === d.key}
                onClick={() => setDiet(d.key)}
                title={d.label}
                sub={`${dietCounts[d.key] ?? 0} plans`}
                dot={d.dot}
              />
            ))}
          </div>
        </section>

        {/* ── STEP 2 — Duration ── */}
        <section style={{ marginBottom: 36 }}>
          <StepLabel n="2">Choose your duration</StepLabel>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {DURATIONS.map((d) => (
              <SelectorCard key={d.key}
                active={dur === d.key}
                onClick={() => setDur(d.key)}
                title={d.label}
                sub={`${d.days} ${d.days === 1 ? "day" : "days"}${d.popular ? " · popular" : ""}`}
              />
            ))}
          </div>
        </section>

        {/* ── STEP 3 — Meals ── */}
        <section style={{ marginBottom: 48 }}>
          <StepLabel n="3">Choose your meals</StepLabel>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {MEALS.map((m) => (
              <SelectorCard key={m.key}
                active={meal === m.key}
                onClick={() => setMeal(m.key)}
                title={m.label}
                sub={m.time}
              />
            ))}
          </div>
        </section>

        {/* ── PRICING MATRIX — 3 tiers side-by-side for current configurator combo ── */}
        <section style={{ marginBottom: 64, paddingTop: 32, borderTop: `1px solid ${T.border}` }}>
          <div style={{ textAlign: "center", marginBottom: 24 }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", color: T.accent,
              fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            }}>YOUR SELECTION</span>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontSize: "clamp(26px, 3.5vw, 38px)",
              fontWeight: 800, margin: "10px 0 6px", letterSpacing: "-0.02em",
            }}>
              {dietMeta.label} · {durMeta.label} · {mealMeta.label}
            </h2>
            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: 11,
              color: T.textFaint, letterSpacing: "0.06em", margin: 0,
            }}>
              {durMeta.days} {durMeta.days === 1 ? "DAY" : "DAYS"} · GST 5% INCLUDED · DELIVERED BY 8AM
            </p>
          </div>

          <div style={{
            display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
            gap: 16, alignItems: "stretch",
          }}>
            {TIERS.map((tier) => {
              const price = getTierPrice(pricesForCombo, tier.key, dur, meal);
              const perDay = price !== null ? Math.round(price / durMeta.days) : null;
              const isStandard = tier.key === "STANDARD";

              return (
                <div key={tier.key} style={{
                  background: T.card, border: `1px solid ${T.border}`,
                  borderLeft: `3px solid ${tier.accent}`, borderRadius: 4,
                  padding: 24, display: "flex", flexDirection: "column",
                  position: "relative",
                }}>
                  <div style={{ marginBottom: 18 }}>
                    <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 8 }}>
                      <h3 style={{
                        fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
                        color: tier.accent, margin: 0, letterSpacing: "-0.015em",
                      }}>{tier.label}</h3>
                      {!tier.available && (
                        <span style={{
                          fontFamily: "'Space Mono', monospace", fontSize: 9, fontWeight: 700,
                          padding: "3px 8px", borderRadius: 2,
                          background: `${tier.accent}1f`, color: tier.accent, letterSpacing: "0.08em",
                        }}>WAITLIST</span>
                      )}
                    </div>
                    <p style={{ fontSize: 13, color: T.textMuted, margin: "6px 0 0", lineHeight: 1.45 }}>
                      {tier.tagline}
                    </p>
                  </div>

                  <div style={{ marginBottom: 18 }}>
                    {price !== null ? (
                      <>
                        <div style={{
                          fontFamily: "'Barlow Condensed', sans-serif", fontSize: 42,
                          fontWeight: 700, color: T.textPrimary, lineHeight: 0.95,
                        }}>{fmt(price)}</div>
                        <div style={{
                          fontFamily: "'Space Mono', monospace", fontSize: 11,
                          color: T.textFaint, marginTop: 6, letterSpacing: "0.04em",
                        }}>
                          ₹{perDay?.toLocaleString("en-IN")}/DAY
                        </div>
                      </>
                    ) : (
                      <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 12, color: T.textFaint }}>
                        Unavailable for this combination
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "auto" }}>
                    {isStandard ? (
                      price !== null && browsePlans.length > 0 ? (
                        <Link href={`/plans/${browsePlans[0].slug}`}
                          style={{
                            display: "block", textAlign: "center",
                            padding: "13px 20px", background: tier.accent, color: "#0a0a0a",
                            border: "none", borderRadius: 3, fontSize: 13.5, fontWeight: 700,
                            textDecoration: "none", letterSpacing: "0.04em",
                          }}>
                          Pick a plan ↓
                        </Link>
                      ) : (
                        <div style={{
                          textAlign: "center", padding: "13px 20px",
                          background: "#1a1a1a", color: T.textFaint,
                          borderRadius: 3, fontSize: 13, fontWeight: 600,
                        }}>
                          No plans match
                        </div>
                      )
                    ) : (
                      <button
                        onClick={() => { setWlTier(tier.key); setWlStatus("idle"); setWlEmail(""); setWlErr(""); }}
                        style={{
                          width: "100%", padding: "13px 20px",
                          background: "transparent", color: tier.accent,
                          border: `1px solid ${tier.accent}`, borderRadius: 3,
                          fontSize: 13.5, fontWeight: 700, cursor: "pointer",
                          letterSpacing: "0.04em", fontFamily: "'DM Sans', sans-serif",
                        }}>
                        Join {tier.label} waitlist
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ── BROWSE ALL 126 PLANS — priced for selected configurator combo ── */}
        <section>
          <div style={{ marginBottom: 24 }}>
            <span style={{
              fontFamily: "'Space Mono', monospace", color: T.accent, fontSize: 11,
              fontWeight: 700, letterSpacing: "0.12em",
            }}>02 · CHOOSE YOUR GOAL</span>
            <h2 style={{
              fontFamily: "'Syne', sans-serif", fontSize: "clamp(28px, 4vw, 42px)",
              fontWeight: 800, margin: "10px 0 8px", letterSpacing: "-0.02em",
            }}>
              {browsePlans.length} {dietMeta.label.toLowerCase()} plan{browsePlans.length === 1 ? "" : "s"}
            </h2>
            <p style={{ color: T.textSecond, fontSize: 14.5, lineHeight: 1.55, margin: 0 }}>
              Prices below shown for <b style={{ color: T.textPrimary }}>{durMeta.label} · {mealMeta.label} · Standard tier</b>. Premium and Luxury available via waitlist above.
            </p>
          </div>

          {/* Browse filters */}
          <div style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
            padding: 14, marginBottom: 28,
          }}>
            <input type="text"
              placeholder="Search by goal, condition, sport — e.g. PCOS, cricket, postnatal"
              value={search} onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%", padding: "11px 14px", background: "#0a0a0a",
                border: `1px solid ${T.border}`, borderRadius: 4, color: T.textPrimary,
                fontSize: 14, outline: "none", marginBottom: 12, boxSizing: "border-box",
                fontFamily: "'DM Sans', sans-serif",
              }} />
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill active={activeCategory === "ALL"} onClick={() => setActiveCategory("ALL")}>
                All ({browsePlans.length})
              </Pill>
              {(["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const).map((c) => {
                const count = browsePlans.filter((p) => p.category === c).length;
                if (count === 0) return null;
                return (
                  <Pill key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>
                    {CATEGORY_LABELS[c].label} ({count})
                  </Pill>
                );
              })}
            </div>
          </div>

          {browsePlans.length === 0 ? (
            <div style={{
              textAlign: "center", padding: "60px 20px",
              background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
            }}>
              <p style={{ color: T.textMuted, fontSize: 14, margin: 0 }}>
                No {dietMeta.label.toLowerCase()} plans match the search.
                <br />Try a different diet in Step 1 or clear the search.
              </p>
            </div>
          ) : (
            orderedCategories.map((cat) => (
              <div key={cat} style={{ marginBottom: 44 }}>
                <div style={{
                  marginBottom: 16, display: "flex", justifyContent: "space-between",
                  alignItems: "baseline", flexWrap: "wrap", gap: 8,
                }}>
                  <div>
                    <h3 style={{
                      fontFamily: "'Syne', sans-serif", fontSize: 20, fontWeight: 700,
                      margin: "0 0 4px", letterSpacing: "-0.015em",
                    }}>{CATEGORY_LABELS[cat].label}</h3>
                    <p style={{ color: T.textMuted, fontSize: 12.5, margin: 0 }}>
                      {CATEGORY_LABELS[cat].desc}
                    </p>
                  </div>
                  <span style={{
                    fontFamily: "'Space Mono', monospace", fontSize: 10.5,
                    color: T.textFaint, letterSpacing: "0.06em",
                  }}>
                    {grouped[cat].length} PLAN{grouped[cat].length === 1 ? "" : "S"}
                  </span>
                </div>
                <div style={{
                  display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: 12,
                }}>
                  {grouped[cat].map((plan) => (
                    <PlanCard key={plan.id} plan={plan}
                      prices={pricesByPlan[plan.id] ?? []}
                      tier="STANDARD" dur={dur} meal={meal} />
                  ))}
                </div>
              </div>
            ))
          )}
        </section>

        {/* Digital plans cross-link */}
        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
          padding: "20px 24px", marginTop: 32, display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
              margin: "0 0 4px", letterSpacing: "-0.01em",
            }}>Outside Pune? Get the digital plan</h3>
            <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>
              Full 30-day PDF with recipes, macros, and grocery list. No delivery needed.
            </p>
          </div>
          <Link href="/plans/digital" style={{
            padding: "11px 20px", background: "transparent",
            border: `1px solid ${T.accent}`, color: T.accent, borderRadius: 3,
            fontSize: 13.5, fontWeight: 700, textDecoration: "none",
            whiteSpace: "nowrap", fontFamily: "'DM Sans', sans-serif",
          }}>
            See digital plans →
          </Link>
        </div>

        {/* Waitlist modal */}
        {wlTier && (
          <div onClick={() => setWlTier(null)}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 100, padding: 20, backdropFilter: "blur(6px)",
            }}>
            <div onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: 460, width: "100%", background: T.card,
                border: `1px solid #262626`,
                borderLeft: `3px solid ${TIERS.find((t) => t.key === wlTier)!.accent}`,
                borderRadius: 4, padding: 28, position: "relative",
              }}>
              <button onClick={() => setWlTier(null)}
                style={{
                  position: "absolute", top: 14, right: 14, background: "transparent",
                  border: "none", color: T.textMuted, cursor: "pointer", fontSize: 22, lineHeight: 1,
                }} aria-label="Close">×</button>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 11,
                color: TIERS.find((t) => t.key === wlTier)!.accent,
                fontWeight: 700, letterSpacing: "0.1em", marginBottom: 10,
              }}>{wlTier} · WAITLIST</div>
              <h3 style={{
                fontFamily: "'Syne', sans-serif", fontSize: 24, fontWeight: 800,
                margin: "0 0 8px", letterSpacing: "-0.02em",
              }}>Be first when we open seats.</h3>
              <p style={{ color: T.textMuted, fontSize: 13.5, lineHeight: 1.55, margin: "0 0 20px" }}>
                {TIERS.find((t) => t.key === wlTier)!.tagline} We&apos;ll email you the moment {wlTier === "PREMIUM" ? "Premium" : "Luxury"} launches.
              </p>

              {wlStatus === "success" ? (
                <div style={{
                  textAlign: "center", padding: "14px 16px",
                  background: `${TIERS.find((t) => t.key === wlTier)!.accent}1a`,
                  color: TIERS.find((t) => t.key === wlTier)!.accent,
                  borderRadius: 4, fontSize: 14, fontWeight: 600,
                }}>✓ You&apos;re on the {wlTier === "PREMIUM" ? "Premium" : "Luxury"} waitlist</div>
              ) : (
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <input type="email" placeholder="your@email.com" value={wlEmail}
                    onChange={(e) => setWlEmail(e.target.value)}
                    disabled={wlStatus === "submitting"}
                    style={{
                      flex: "1 1 200px", padding: "12px 14px", background: "#0a0a0a",
                      border: `1px solid ${T.border}`, borderRadius: 4,
                      color: T.textPrimary, fontSize: 14, outline: "none",
                      fontFamily: "'DM Sans', sans-serif",
                    }} />
                  <button onClick={submitWaitlist} disabled={wlStatus === "submitting"}
                    style={{
                      padding: "12px 22px",
                      background: TIERS.find((t) => t.key === wlTier)!.accent,
                      color: "#0a0a0a", border: "none", borderRadius: 4,
                      fontSize: 14, fontWeight: 700,
                      cursor: wlStatus === "submitting" ? "wait" : "pointer",
                      opacity: wlStatus === "submitting" ? 0.7 : 1,
                    }}>
                    {wlStatus === "submitting" ? "..." : "Join waitlist"}
                  </button>
                </div>
              )}
              {wlStatus === "error" && wlErr && (
                <p style={{ marginTop: 10, fontSize: 12, color: "#ef4444" }}>{wlErr}</p>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}