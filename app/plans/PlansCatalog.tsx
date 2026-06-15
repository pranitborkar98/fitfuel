// app/plans/PlansCatalog.tsx — Phase 19A (rev. with tier × variation matrix)
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  TIERS,
  MEALS,
  DIETS,
  getTierPrice,
  type Tier,
  type MealKey,
  type DietKey,
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

function Pill({
  active, onClick, children, disabled, accentColor,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode; disabled?: boolean; accentColor?: string;
}) {
  const ac = accentColor ?? T.accent;
  return (
    <button onClick={onClick} disabled={disabled}
      style={{
        padding: "9px 16px",
        background: active ? ac : "transparent",
        color: active ? "#0a0a0a" : T.textSecond,
        border: `1px solid ${active ? ac : T.border}`,
        borderRadius: 3,
        fontFamily: "'DM Sans', system-ui, sans-serif",
        fontSize: 13, fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        transition: "all 150ms ease",
        whiteSpace: "nowrap",
        opacity: disabled ? 0.4 : 1,
      }}>
      {children}
    </button>
  );
}

function PlanCard({
  plan, prices, variation,
}: { plan: Plan; prices: PriceRow[]; variation: MealKey }) {
  const macroTotal = plan.avgProteinGrams + plan.avgCarbsGrams + plan.avgFatGrams || 1;
  const pPct = (plan.avgProteinGrams / macroTotal) * 100;
  const cPct = (plan.avgCarbsGrams / macroTotal) * 100;
  const fPct = (plan.avgFatGrams / macroTotal) * 100;
  const diet = DIETS.find((d) => d.key === plan.dietaryVariant);
  const dietLabel = diet?.short ?? plan.dietaryVariant;
  const dietDot = diet?.dot ?? "#a3a3a3";

  return (
    <Link href={`/plans/${plan.slug}`}
      style={{
        display: "block", background: T.card, border: `1px solid ${T.border}`,
        borderRadius: 4, padding: 18, textDecoration: "none", color: "inherit",
        transition: "all 180ms cubic-bezier(.16,1,.3,1)", position: "relative", overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = T.cardHover;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = T.borderHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = T.card;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border;
      }}>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: "'Space Mono', monospace", fontSize: 10.5,
          color: T.textMuted, letterSpacing: "0.04em",
        }}>
          <span style={{ width: 6, height: 6, background: dietDot, borderRadius: 999, display: "inline-block" }} />
          {dietLabel.toUpperCase()}
        </span>
        <span style={{ color: T.textFaint, fontSize: 11 }}>·</span>
        <span style={{ fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: T.textMuted, letterSpacing: "0.04em" }}>
          {plan.cycleLengthDays}-DAY ROTATION
        </span>
      </div>

      <h3 style={{
        fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
        margin: "0 0 6px", color: T.textPrimary, letterSpacing: "-0.015em", lineHeight: 1.2,
      }}>
        {plan.displayName}
      </h3>
      {plan.tagline && (
        <p style={{
          fontSize: 12.5, color: T.textSecond, margin: "0 0 14px", lineHeight: 1.5,
          display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
          overflow: "hidden", minHeight: 38,
        }}>
          {plan.tagline}
        </p>
      )}

      <div style={{ display: "flex", height: 3, borderRadius: 999, overflow: "hidden", background: "#0a0a0a", marginBottom: 8 }}>
        <div style={{ width: `${pPct}%`, background: "#3b82f6" }} />
        <div style={{ width: `${cPct}%`, background: "#f59e0b" }} />
        <div style={{ width: `${fPct}%`, background: "#ef4444" }} />
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between",
        fontFamily: "'Space Mono', monospace", fontSize: 10.5,
        color: T.textFaint, marginBottom: 14, letterSpacing: "0.03em",
      }}>
        <span>{plan.avgCaloriesPerDay} KCAL</span>
        <span>P{plan.avgProteinGrams} · C{plan.avgCarbsGrams} · F{plan.avgFatGrams}</span>
      </div>

      <div style={{
        display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 6,
        borderTop: `1px solid ${T.border}`, paddingTop: 12,
      }}>
        {TIERS.map((t) => {
          const price = getTierPrice(prices, t.key, "ONE_MONTH", variation);
          return (
            <div key={t.key} style={{
              padding: "8px 6px",
              background: t.available ? "transparent" : "rgba(255,255,255,0.015)",
              border: `1px solid ${t.available ? "transparent" : T.border}`,
              borderRadius: 3, textAlign: "center", position: "relative",
            }}>
              <div style={{
                fontFamily: "'Space Mono', monospace", fontSize: 9,
                letterSpacing: "0.08em", color: t.accent, marginBottom: 4, fontWeight: 700,
              }}>
                {t.label.toUpperCase()}
              </div>
              <div style={{
                fontFamily: "'Barlow Condensed', sans-serif", fontSize: 18, fontWeight: 600,
                color: t.available ? T.textPrimary : T.textMuted, lineHeight: 1,
              }}>
                {price !== null ? fmt(price) : "—"}
              </div>
              {!t.available && (
                <div style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 8.5,
                  color: T.textFaint, marginTop: 3, letterSpacing: "0.04em",
                }}>
                  WAITLIST
                </div>
              )}
            </div>
          );
        })}
      </div>
    </Link>
  );
}

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<Tier>("PREMIUM");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrMsg("Enter a valid email"); setStatus("error"); return;
    }
    setStatus("submitting"); setErrMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success"); setEmail("");
    } catch {
      setErrMsg("Could not submit. Try again."); setStatus("error");
    }
  }

  const premium = TIERS.find((t) => t.key === "PREMIUM")!;
  const luxury  = TIERS.find((t) => t.key === "LUXURY")!;
  const activeTier = tier === "PREMIUM" ? premium : luxury;
  const features = tier === "PREMIUM"
    ? ["Everything in Standard", "Supplements with meals — whey, creatine, vitamins, omega-3",
       "Macro + micro nutrition tracking unlocked", "Personalised workout plan + exercise library",
       "Priority WhatsApp support", "Weekly progress reports"]
    : ["Everything in Premium", "AI Personal Trainer — daily plans, form feedback, progressive overload",
       "Concierge onboarding with the head coach", "Fully custom meal plan by nutritionist",
       "Wellness add-ons — in-home yoga, massage, spa (Pune partners)", "Priority delivery — first slot of the day",
       "Quarterly body transformation report"];

  return (
    <section id="waitlist" style={{ marginTop: 80, padding: "48px 0", borderTop: `1px solid ${T.border}` }}>
      <div style={{ textAlign: "center", marginBottom: 32 }}>
        <span style={{
          fontFamily: "'Space Mono', monospace", color: activeTier.accent,
          fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
        }}>
          PREMIUM & LUXURY · COMING SOON
        </span>
        <h2 style={{
          fontFamily: "'Syne', sans-serif", fontSize: 32, fontWeight: 800,
          margin: "12px 0 10px", letterSpacing: "-0.02em",
        }}>
          Unlock the upper tiers.
        </h2>
        <p style={{ color: T.textSecond, fontSize: 14.5, maxWidth: 580, margin: "0 auto", lineHeight: 1.55 }}>
          Same kitchen, upgraded everything. Join the waitlist and we&apos;ll notify you when we open seats.
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 24, flexWrap: "wrap" }}>
        <Pill active={tier === "PREMIUM"} onClick={() => { setTier("PREMIUM"); setStatus("idle"); }} accentColor={premium.accent}>
          Premium
        </Pill>
        <Pill active={tier === "LUXURY"} onClick={() => { setTier("LUXURY"); setStatus("idle"); }} accentColor={luxury.accent}>
          Luxury
        </Pill>
      </div>

      <div style={{
        maxWidth: 580, margin: "0 auto", background: T.card,
        border: `1px solid ${T.border}`, borderLeft: `3px solid ${activeTier.accent}`,
        borderRadius: 4, padding: 28,
      }}>
        <ul style={{ listStyle: "none", padding: 0, margin: "0 0 22px", color: T.textSecond, fontSize: 14, lineHeight: 1.9 }}>
          {features.map((f, i) => (
            <li key={i}>
              <span style={{ color: activeTier.accent, marginRight: 8 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {status === "success" ? (
          <div style={{
            textAlign: "center", padding: "14px 16px",
            background: `${activeTier.accent}1a`, color: activeTier.accent,
            borderRadius: 4, fontSize: 14, fontWeight: 600,
          }}>
            ✓ You&apos;re on the {activeTier.label} waitlist
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input type="email" placeholder="your@email.com" value={email}
              onChange={(e) => setEmail(e.target.value)} disabled={status === "submitting"}
              style={{
                flex: "1 1 200px", padding: "12px 14px", background: "#0a0a0a",
                border: `1px solid ${T.border}`, borderRadius: 4, color: T.textPrimary,
                fontSize: 14, outline: "none", fontFamily: "'DM Sans', sans-serif",
              }} />
            <button onClick={submit} disabled={status === "submitting"}
              style={{
                padding: "12px 22px", background: activeTier.accent, color: "#0a0a0a",
                border: "none", borderRadius: 4, fontSize: 14, fontWeight: 700,
                cursor: status === "submitting" ? "wait" : "pointer",
                opacity: status === "submitting" ? 0.7 : 1,
              }}>
              {status === "submitting" ? "..." : "Join waitlist"}
            </button>
          </div>
        )}
        {status === "error" && errMsg && (
          <p style={{ marginTop: 10, fontSize: 12, color: "#ef4444" }}>{errMsg}</p>
        )}
      </div>
    </section>
  );
}

export default function PlansCatalog({ plans, pricesByPlan }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | Plan["category"]>("ALL");
  const [activeDiet, setActiveDiet] = useState<"ALL" | DietKey>("ALL");
  const [variation, setVariation] = useState<MealKey>("ALL_FOUR");

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
      if (activeDiet !== "ALL" && p.dietaryVariant !== activeDiet) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!p.displayName.toLowerCase().includes(q) &&
            !p.subCategory.toLowerCase().includes(q) &&
            !(p.tagline ?? "").toLowerCase().includes(q))
          return false;
      }
      return true;
    });
  }, [plans, search, activeCategory, activeDiet]);

  const grouped = useMemo(() => {
    const g: Record<string, Plan[]> = {};
    for (const p of filtered) { if (!g[p.category]) g[p.category] = []; g[p.category].push(p); }
    return g;
  }, [filtered]);

  const categoryOrder: Plan["category"][] = ["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS", "CORPORATE", "DIGITAL"];
  const orderedCategories = categoryOrder.filter((c) => grouped[c]);

  const dietsPresent = useMemo(() => {
    const s = new Set(plans.map((p) => p.dietaryVariant));
    return DIETS.filter((d) => s.has(d.key));
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

      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span style={{
            fontFamily: "'Space Mono', monospace", color: T.accent, fontSize: 11,
            fontWeight: 700, letterSpacing: "0.12em",
          }}>
            01 · MEAL PLANS
          </span>
          <h1 style={{
            fontFamily: "'Syne', sans-serif", fontSize: "clamp(36px, 5.5vw, 64px)",
            fontWeight: 800, margin: "14px 0 14px", lineHeight: 0.98, letterSpacing: "-0.025em",
          }}>
            {plans.length} plans. Three tiers.<br />One kitchen.
          </h1>
          <p style={{ color: T.textSecond, fontSize: 16, maxWidth: 620, margin: "0 auto", lineHeight: 1.55 }}>
            Every plan ships in Standard, Premium and Luxury — three different menus for three commitment levels. Daily delivery in Pune. 30-day no-repeat rotation. Every macro logged.
          </p>
        </div>

        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <p style={{
            fontFamily: "'Space Mono', monospace", fontSize: 10.5, color: T.textFaint,
            letterSpacing: "0.1em", margin: "0 0 10px",
          }}>
            CARD PRICES SHOWN FOR · 1 MONTH
          </p>
          <div style={{ display: "inline-flex", gap: 6, flexWrap: "wrap", justifyContent: "center" }}>
            {MEALS.map((m) => (
              <Pill key={m.key} active={variation === m.key} onClick={() => setVariation(m.key)}>
                {m.short}
              </Pill>
            ))}
          </div>
        </div>

        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
          padding: 16, marginBottom: 36,
        }}>
          <input type="text"
            placeholder="Search by goal, condition, sport — e.g. PCOS, cricket, postnatal"
            value={search} onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%", padding: "12px 14px", background: "#0a0a0a",
              border: `1px solid ${T.border}`, borderRadius: 4, color: T.textPrimary,
              fontSize: 14, outline: "none", marginBottom: 16, boxSizing: "border-box",
              fontFamily: "'DM Sans', sans-serif",
            }} />

          <div style={{ marginBottom: 12 }}>
            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10, color: T.textFaint,
              fontWeight: 700, letterSpacing: "0.1em", margin: "0 0 8px",
            }}>CATEGORY</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill active={activeCategory === "ALL"} onClick={() => setActiveCategory("ALL")}>
                All ({plans.length})
              </Pill>
              {(["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const).map((c) => {
                const count = plans.filter((p) => p.category === c).length;
                if (count === 0) return null;
                return (
                  <Pill key={c} active={activeCategory === c} onClick={() => setActiveCategory(c)}>
                    {CATEGORY_LABELS[c].label} ({count})
                  </Pill>
                );
              })}
            </div>
          </div>

          <div>
            <p style={{
              fontFamily: "'Space Mono', monospace", fontSize: 10, color: T.textFaint,
              fontWeight: 700, letterSpacing: "0.1em", margin: "0 0 8px",
            }}>DIET</p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Pill active={activeDiet === "ALL"} onClick={() => setActiveDiet("ALL")}>
                Any diet
              </Pill>
              {dietsPresent.map((d) => (
                <Pill key={d.key} active={activeDiet === d.key} onClick={() => setActiveDiet(d.key)}>
                  <span style={{
                    width: 6, height: 6, background: d.dot, borderRadius: 999,
                    display: "inline-block", marginRight: 6,
                  }} />
                  {d.short} ({plans.filter((p) => p.dietaryVariant === d.key).length})
                </Pill>
              ))}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", padding: "60px 20px", color: T.textMuted, fontSize: 14 }}>
            No plans match these filters. Try clearing the search or changing diet.
          </div>
        ) : (
          orderedCategories.map((cat) => (
            <section key={cat} style={{ marginBottom: 52 }}>
              <div style={{
                marginBottom: 18, display: "flex", justifyContent: "space-between",
                alignItems: "baseline", flexWrap: "wrap", gap: 8,
              }}>
                <div>
                  <h2 style={{
                    fontFamily: "'Syne', sans-serif", fontSize: 22, fontWeight: 700,
                    margin: "0 0 4px", letterSpacing: "-0.015em",
                  }}>
                    {CATEGORY_LABELS[cat].label}
                  </h2>
                  <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>
                    {CATEGORY_LABELS[cat].desc}
                  </p>
                </div>
                <span style={{
                  fontFamily: "'Space Mono', monospace", fontSize: 11,
                  color: T.textFaint, letterSpacing: "0.05em",
                }}>
                  {grouped[cat].length} PLAN{grouped[cat].length === 1 ? "" : "S"}
                </span>
              </div>
              <div style={{
                display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(290px, 1fr))", gap: 14,
              }}>
                {grouped[cat].map((plan) => (
                  <PlanCard key={plan.id} plan={plan}
                    prices={pricesByPlan[plan.id] ?? []} variation={variation} />
                ))}
              </div>
            </section>
          ))
        )}

        <div style={{
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 4,
          padding: "20px 24px", marginTop: 16, display: "flex",
          alignItems: "center", justifyContent: "space-between", gap: 16, flexWrap: "wrap",
        }}>
          <div>
            <h3 style={{
              fontFamily: "'Syne', sans-serif", fontSize: 18, fontWeight: 700,
              margin: "0 0 4px", letterSpacing: "-0.01em",
            }}>
              Outside Pune? Get the digital plan
            </h3>
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

        <WaitlistSection />
      </div>
    </main>
  );
}
