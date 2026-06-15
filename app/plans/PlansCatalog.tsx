// app/plans/PlansCatalog.tsx — Phase 19A
// Client-side filter UI + responsive card grid + Premium/Luxury waitlist footer.
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Plan {
  id: string;
  slug: string;
  name: string;
  displayName: string;
  tagline?: string | null;
  description?: string | null;
  category: "STANDARD" | "LIFESTYLE_MEDICAL" | "SPORTS" | "CORPORATE" | "DIGITAL";
  subCategory: string;
  dietaryVariant: "VEG" | "EGG" | "NON_VEG" | "JAIN" | "VEGAN";
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
  entryPriceByPlan: Record<string, { priceRs: number; combo: string }>;
}

// ─── Theme ───────────────────────────────────────────────────────────────────
const T = {
  bg: "#0a0a0a",
  card: "#111111",
  cardHover: "#161616",
  border: "#1f1f1f",
  borderHover: "#2a2a2a",
  accent: "#84cc16",
  accentLight: "#a3e635",
  textPrimary: "#fff",
  textSecond: "#a3a3a3",
  textMuted: "#737373",
};

// ─── Labels ───────────────────────────────────────────────────────────────────
const CATEGORY_LABELS: Record<Plan["category"], { label: string; desc: string }> = {
  STANDARD: { label: "Standard goals", desc: "Weight loss, muscle gain, healthy eating" },
  LIFESTYLE_MEDICAL: { label: "Lifestyle & medical", desc: "PCOS, diabetes, thyroid, recovery" },
  SPORTS: { label: "Sports nutrition", desc: "Cricket, football, gym, endurance" },
  CORPORATE: { label: "Corporate", desc: "Office wellness" },
  DIGITAL: { label: "Digital", desc: "PDF-only plans" },
};

const DIET_LABELS: Record<Plan["dietaryVariant"], { label: string; dot: string }> = {
  VEG: { label: "Veg", dot: "#22c55e" },
  EGG: { label: "Egg", dot: "#f59e0b" },
  NON_VEG: { label: "Non-veg", dot: "#ef4444" },
  JAIN: { label: "Jain", dot: "#a78bfa" },
  VEGAN: { label: "Vegan", dot: "#10b981" },
};

const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

// ─── Filters Bar ─────────────────────────────────────────────────────────────
function FilterPill({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "8px 14px",
        background: active ? T.accent : "transparent",
        color: active ? "#0a0a0a" : T.textSecond,
        border: `1px solid ${active ? T.accent : T.border}`,
        borderRadius: 999,
        fontSize: 13,
        fontWeight: 600,
        cursor: "pointer",
        transition: "all 120ms ease",
        whiteSpace: "nowrap",
      }}
    >
      {children}
    </button>
  );
}

// ─── Plan Card ───────────────────────────────────────────────────────────────
function PlanCard({
  plan,
  entryPrice,
}: {
  plan: Plan;
  entryPrice?: { priceRs: number; combo: string };
}) {
  const macroTotal = plan.avgProteinGrams + plan.avgCarbsGrams + plan.avgFatGrams || 1;
  const pPct = (plan.avgProteinGrams / macroTotal) * 100;
  const cPct = (plan.avgCarbsGrams / macroTotal) * 100;
  const fPct = (plan.avgFatGrams / macroTotal) * 100;
  const diet = DIET_LABELS[plan.dietaryVariant];

  return (
    <Link
      href={`/plans/${plan.slug}`}
      style={{
        display: "block",
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 14,
        padding: 20,
        textDecoration: "none",
        color: "inherit",
        transition: "all 150ms ease",
        position: "relative",
        overflow: "hidden",
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = T.cardHover;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = T.borderHover;
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLAnchorElement).style.background = T.card;
        (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border;
      }}
    >
      {!plan.isActive && (
        <span
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            background: "rgba(163,163,163,0.12)",
            color: T.textMuted,
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 8px",
            borderRadius: 999,
            letterSpacing: "0.05em",
          }}
        >
          PREVIEW
        </span>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
        <span
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 11,
            color: T.textMuted,
            fontWeight: 600,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              background: diet.dot,
              borderRadius: 999,
              display: "inline-block",
            }}
          />
          {diet.label}
        </span>
        <span style={{ color: T.textMuted, fontSize: 11 }}>·</span>
        <span style={{ fontSize: 11, color: T.textMuted, fontWeight: 600 }}>
          {plan.cycleLengthDays}-day rotation
        </span>
      </div>

      <h3
        style={{
          fontSize: 17,
          fontWeight: 700,
          margin: "0 0 6px",
          color: T.textPrimary,
          lineHeight: 1.3,
        }}
      >
        {plan.displayName}
      </h3>
      {plan.tagline && (
        <p
          style={{
            fontSize: 13,
            color: T.textSecond,
            margin: "0 0 16px",
            lineHeight: 1.5,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {plan.tagline}
        </p>
      )}

      {/* Macros bar */}
      <div
        style={{
          display: "flex",
          height: 4,
          borderRadius: 999,
          overflow: "hidden",
          background: "#0a0a0a",
          marginBottom: 10,
        }}
      >
        <div style={{ width: `${pPct}%`, background: "#3b82f6" }} />
        <div style={{ width: `${cPct}%`, background: "#f59e0b" }} />
        <div style={{ width: `${fPct}%`, background: "#ef4444" }} />
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 11,
          color: T.textMuted,
          marginBottom: 16,
        }}
      >
        <span>{plan.avgCaloriesPerDay} kcal/day</span>
        <span>
          P {plan.avgProteinGrams}g · C {plan.avgCarbsGrams}g · F {plan.avgFatGrams}g
        </span>
      </div>

      {/* Price */}
      <div
        style={{
          borderTop: `1px solid ${T.border}`,
          paddingTop: 14,
          display: "flex",
          alignItems: "baseline",
          justifyContent: "space-between",
        }}
      >
        {entryPrice ? (
          <>
            <div>
              <span style={{ fontSize: 11, color: T.textMuted, marginRight: 6 }}>from</span>
              <span style={{ fontSize: 20, fontWeight: 800, color: T.accentLight }}>
                {fmt(entryPrice.priceRs)}
              </span>
            </div>
            <span style={{ fontSize: 11, color: T.textMuted }}>{entryPrice.combo}</span>
          </>
        ) : (
          <span style={{ fontSize: 12, color: T.textMuted }}>Pricing on request</span>
        )}
      </div>
    </Link>
  );
}

// ─── Waitlist Footer (Premium / Luxury) ──────────────────────────────────────
const PREMIUM_FEATURES = [
  "Everything in Standard",
  "Supplements with meals — whey, creatine, vitamins, omega-3",
  "Full macro + micro nutrition tracker",
  "Exercise library + personalised workout plan",
  "Priority WhatsApp support",
  "Weekly progress report",
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

function WaitlistSection() {
  const [email, setEmail] = useState("");
  const [tier, setTier] = useState<"PREMIUM" | "LUXURY">("PREMIUM");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  async function submit() {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrMsg("Enter a valid email");
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrMsg("");
    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, tier }),
      });
      if (!res.ok) throw new Error("Request failed");
      setStatus("success");
      setEmail("");
    } catch {
      setErrMsg("Could not submit. Try again.");
      setStatus("error");
    }
  }

  const features = tier === "PREMIUM" ? PREMIUM_FEATURES : LUXURY_FEATURES;

  return (
    <section
      style={{
        marginTop: 80,
        padding: "48px 0",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 36 }}>
        <span
          style={{
            color: T.accent,
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          Coming soon
        </span>
        <h2 style={{ fontSize: 28, fontWeight: 800, margin: "10px 0 8px" }}>
          Premium & Luxury tiers
        </h2>
        <p style={{ color: T.textSecond, fontSize: 14, maxWidth: 560, margin: "0 auto" }}>
          Same delivery, upgraded menus and services. Join the waitlist and we&apos;ll let you
          know the moment it launches.
        </p>
      </div>

      {/* Tier toggle */}
      <div
        style={{
          display: "flex",
          gap: 8,
          justifyContent: "center",
          marginBottom: 28,
          flexWrap: "wrap",
        }}
      >
        <FilterPill active={tier === "PREMIUM"} onClick={() => setTier("PREMIUM")}>
          Premium
        </FilterPill>
        <FilterPill active={tier === "LUXURY"} onClick={() => setTier("LUXURY")}>
          Luxury
        </FilterPill>
      </div>

      <div
        style={{
          maxWidth: 560,
          margin: "0 auto",
          background: T.card,
          border: `1px solid ${T.border}`,
          borderRadius: 14,
          padding: 28,
        }}
      >
        <ul
          style={{
            listStyle: "none",
            padding: 0,
            margin: "0 0 24px",
            color: T.textSecond,
            fontSize: 14,
            lineHeight: 1.9,
          }}
        >
          {features.map((f, i) => (
            <li key={i}>
              <span style={{ color: T.accent, marginRight: 8 }}>✓</span>
              {f}
            </li>
          ))}
        </ul>

        {status === "success" ? (
          <div
            style={{
              textAlign: "center",
              padding: "14px 16px",
              background: "rgba(132,204,22,0.1)",
              color: T.accentLight,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 600,
            }}
          >
            ✓ You&apos;re on the {tier === "PREMIUM" ? "Premium" : "Luxury"} waitlist
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <input
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={status === "submitting"}
              style={{
                flex: "1 1 200px",
                padding: "12px 14px",
                background: "#0a0a0a",
                border: `1px solid ${T.border}`,
                borderRadius: 10,
                color: T.textPrimary,
                fontSize: 14,
                outline: "none",
              }}
            />
            <button
              onClick={submit}
              disabled={status === "submitting"}
              style={{
                padding: "12px 22px",
                background: T.accent,
                color: "#0a0a0a",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: status === "submitting" ? "wait" : "pointer",
                opacity: status === "submitting" ? 0.7 : 1,
              }}
            >
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

// ─── Main Catalog ────────────────────────────────────────────────────────────
export default function PlansCatalog({ plans, entryPriceByPlan }: Props) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<"ALL" | Plan["category"]>("ALL");
  const [activeDiet, setActiveDiet] = useState<"ALL" | Plan["dietaryVariant"]>("ALL");

  const filtered = useMemo(() => {
    return plans.filter((p) => {
      if (activeCategory !== "ALL" && p.category !== activeCategory) return false;
      if (activeDiet !== "ALL" && p.dietaryVariant !== activeDiet) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !p.displayName.toLowerCase().includes(q) &&
          !p.subCategory.toLowerCase().includes(q) &&
          !(p.tagline ?? "").toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [plans, search, activeCategory, activeDiet]);

  // Group filtered plans by category
  const grouped = useMemo(() => {
    const g: Record<string, Plan[]> = {};
    for (const p of filtered) {
      if (!g[p.category]) g[p.category] = [];
      g[p.category].push(p);
    }
    return g;
  }, [filtered]);

  const categoriesPresent = Object.keys(grouped) as Plan["category"][];
  const categoryOrder: Plan["category"][] = [
    "STANDARD",
    "LIFESTYLE_MEDICAL",
    "SPORTS",
    "CORPORATE",
    "DIGITAL",
  ];
  const orderedCategories = categoryOrder.filter((c) => categoriesPresent.includes(c));

  // Distinct diet variants present in the unfiltered set (for showing diet pills)
  const dietsPresent = useMemo(() => {
    const s = new Set(plans.map((p) => p.dietaryVariant));
    return Array.from(s);
  }, [plans]);

  return (
    <main
      style={{
        background: T.bg,
        minHeight: "100vh",
        color: T.textPrimary,
        padding: "48px 20px 80px",
      }}
    >
      <div style={{ maxWidth: 1180, margin: "0 auto" }}>
        {/* Hero */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <span
            style={{
              color: T.accent,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Meal plans
          </span>
          <h1
            style={{
              fontSize: 36,
              fontWeight: 800,
              margin: "12px 0 12px",
              lineHeight: 1.15,
            }}
          >
            {plans.length} plans, one kitchen.
          </h1>
          <p
            style={{
              color: T.textSecond,
              fontSize: 16,
              maxWidth: 600,
              margin: "0 auto",
              lineHeight: 1.5,
            }}
          >
            Built around your goal and your diet. Daily delivery in Pune, 30-day no-repeat
            rotation, every macro logged.
          </p>
        </div>

        {/* Filter bar */}
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: 16,
            marginBottom: 32,
          }}
        >
          <input
            type="text"
            placeholder="Search by goal, condition, or diet — e.g. PCOS, cricket, vegan"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              background: "#0a0a0a",
              border: `1px solid ${T.border}`,
              borderRadius: 10,
              color: T.textPrimary,
              fontSize: 14,
              outline: "none",
              marginBottom: 14,
              boxSizing: "border-box",
            }}
          />

          <div style={{ marginBottom: 10 }}>
            <p
              style={{
                fontSize: 11,
                color: T.textMuted,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}
            >
              Category
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <FilterPill active={activeCategory === "ALL"} onClick={() => setActiveCategory("ALL")}>
                All ({plans.length})
              </FilterPill>
              {(["STANDARD", "LIFESTYLE_MEDICAL", "SPORTS"] as const).map((c) => {
                const count = plans.filter((p) => p.category === c).length;
                if (count === 0) return null;
                return (
                  <FilterPill
                    key={c}
                    active={activeCategory === c}
                    onClick={() => setActiveCategory(c)}
                  >
                    {CATEGORY_LABELS[c].label} ({count})
                  </FilterPill>
                );
              })}
            </div>
          </div>

          <div>
            <p
              style={{
                fontSize: 11,
                color: T.textMuted,
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}
            >
              Diet
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <FilterPill active={activeDiet === "ALL"} onClick={() => setActiveDiet("ALL")}>
                Any diet
              </FilterPill>
              {dietsPresent.map((d) => (
                <FilterPill key={d} active={activeDiet === d} onClick={() => setActiveDiet(d)}>
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      background: DIET_LABELS[d].dot,
                      borderRadius: 999,
                      display: "inline-block",
                      marginRight: 6,
                    }}
                  />
                  {DIET_LABELS[d].label}
                </FilterPill>
              ))}
            </div>
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "60px 20px",
              color: T.textMuted,
              fontSize: 14,
            }}
          >
            No plans match these filters. Try clearing the search or changing diet.
          </div>
        ) : (
          orderedCategories.map((cat) => (
            <section key={cat} style={{ marginBottom: 48 }}>
              <div style={{ marginBottom: 18 }}>
                <h2 style={{ fontSize: 20, fontWeight: 700, margin: "0 0 4px" }}>
                  {CATEGORY_LABELS[cat].label}
                </h2>
                <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>
                  {CATEGORY_LABELS[cat].desc} · {grouped[cat].length} plans
                </p>
              </div>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: 16,
                }}
              >
                {grouped[cat].map((plan) => (
                  <PlanCard
                    key={plan.id}
                    plan={plan}
                    entryPrice={entryPriceByPlan[plan.id]}
                  />
                ))}
              </div>
            </section>
          ))
        )}

        {/* Digital plans link */}
        <div
          style={{
            background: T.card,
            border: `1px solid ${T.border}`,
            borderRadius: 14,
            padding: "20px 24px",
            marginTop: 16,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: "0 0 4px" }}>
              Outside Pune? Get the digital plan
            </h3>
            <p style={{ color: T.textMuted, fontSize: 13, margin: 0 }}>
              Full 30-day PDF with recipes, macros, and grocery list. No delivery needed.
            </p>
          </div>
          <Link
            href="/plans/digital"
            style={{
              padding: "10px 18px",
              background: "transparent",
              border: `1px solid ${T.accent}`,
              color: T.accent,
              borderRadius: 10,
              fontSize: 14,
              fontWeight: 700,
              textDecoration: "none",
              whiteSpace: "nowrap",
            }}
          >
            See digital plans →
          </Link>
        </div>

        <WaitlistSection />
      </div>
    </main>
  );
}
