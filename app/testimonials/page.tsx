import Link from "next/link";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Reviews | FitFuel",
  description:
    "Real results from FitFuel members across Pune — weight loss, muscle gain and better daily eating, on plans we cook and deliver.",
  openGraph: {
    title: "FitFuel Reviews",
    description: "Real member results across Pune.",
    url: "https://fitfuel.in/testimonials",
    siteName: "FitFuel",
    type: "website",
  },
};

const C = {
  bg: "#080808",
  accent: "#a3e635",
  accent2: "#84cc16",
  text: "#ffffff",
  sub: "#a3a3a3",
  muted: "#737373",
  border: "#1f1f1f",
  card: "#111111",
};

const DISPLAY = "'Barlow Condensed', sans-serif";
const BODY = "'DM Sans', system-ui, -apple-system, sans-serif";
const MONO = "'Space Mono', ui-monospace, monospace";

const GOAL_FILTERS: { label: string; value: string | null }[] = [
  { label: "All", value: null },
  { label: "Weight Loss", value: "weight_loss" },
  { label: "Muscle Gain", value: "muscle_gain" },
  { label: "Balanced", value: "balanced" },
  { label: "Office", value: "office" },
];

function Stars({ n }: { n: number }) {
  return (
    <span style={{ color: C.accent2, fontSize: 14, letterSpacing: 1 }} aria-label={`${n} out of 5`}>
      {"★".repeat(n)}
      <span style={{ color: C.border }}>{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default async function TestimonialsPage({
  searchParams,
}: {
  searchParams: Promise<{ goal?: string }>;
}) {
  const { goal } = await searchParams;
  const activeGoal = GOAL_FILTERS.some((g) => g.value === goal) ? goal ?? null : null;

  const all = await prisma.testimonial.findMany({
    where: { isActive: true },
    orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }],
  });

  const visible = activeGoal ? all.filter((t) => t.goal === activeGoal) : all;

  const avg =
    all.length > 0
      ? (all.reduce((s, t) => s + t.rating, 0) / all.length).toFixed(1)
      : "0.0";

  return (
    <main
      style={{
        background: C.bg,
        color: C.text,
        minHeight: "100vh",
        fontFamily: BODY,
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <style>{`
        .ff-rev-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .ff-rev-card { transition:border-color .2s ease, transform .2s ease; }
        .ff-rev-card:hover { border-color:${C.accent2}55 !important; transform:translateY(-3px); }
        .ff-gpill { transition:all .15s ease; }
        .ff-gpill:hover { color:${C.text} !important; border-color:${C.accent2}66 !important; }
        @media (max-width:900px){ .ff-rev-grid { grid-template-columns:repeat(2,1fr);} }
        @media (max-width:600px){ .ff-rev-grid { grid-template-columns:1fr;} }
      `}</style>

      <div style={{ maxWidth: 1120, margin: "0 auto", padding: "120px 24px 96px" }}>
        {/* Header */}
        <div style={{ marginBottom: 38 }}>
          <div
            style={{
              fontFamily: MONO,
              fontSize: 11,
              letterSpacing: 2,
              textTransform: "uppercase",
              color: C.accent2,
              marginBottom: 14,
            }}
          >
            Results
          </div>
          <h1
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              fontSize: "clamp(38px, 6vw, 64px)",
              lineHeight: 0.98,
              textTransform: "uppercase",
              letterSpacing: "-0.01em",
              margin: 0,
            }}
          >
            Real food.
            <br />
            <span style={{ color: C.accent }}>Real results.</span>
          </h1>

          {all.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 20 }}>
              <span style={{ fontFamily: DISPLAY, fontWeight: 800, fontSize: 34, color: C.accent }}>
                {avg}★
              </span>
              <span style={{ fontFamily: MONO, fontSize: 12.5, color: C.muted }}>
                across {all.length} member reviews
              </span>
            </div>
          )}
        </div>

        {/* Goal filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 38 }}>
          {GOAL_FILTERS.map((g) => {
            const on = activeGoal === g.value;
            const href = g.value ? `/testimonials?goal=${g.value}` : "/testimonials";
            return (
              <Link
                key={g.label}
                href={href}
                className="ff-gpill"
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  textDecoration: "none",
                  padding: "8px 16px",
                  borderRadius: 999,
                  border: `1px solid ${on ? C.accent2 : C.border}`,
                  color: on ? C.accent : C.sub,
                  background: on ? `${C.accent2}14` : "transparent",
                }}
              >
                {g.label}
              </Link>
            );
          })}
        </div>

        {/* Grid */}
        {visible.length === 0 ? (
          <p style={{ color: C.muted, fontSize: 15 }}>
            No reviews in this category yet.
          </p>
        ) : (
          <div className="ff-rev-grid">
            {visible.map((t) => (
              <div
                key={t.id}
                className="ff-rev-card"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  border: `1px solid ${C.border}`,
                  borderRadius: 16,
                  background: C.card,
                  padding: "24px 22px 22px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
                  <Stars n={t.rating} />
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 11,
                      fontWeight: 700,
                      color: C.accent,
                      background: `${C.accent2}14`,
                      border: `1px solid ${C.accent2}33`,
                      borderRadius: 999,
                      padding: "4px 10px",
                    }}
                    dangerouslySetInnerHTML={{ __html: t.resultLabel }}
                  />
                </div>

                <p
                  style={{ color: C.sub, fontSize: 14.5, lineHeight: 1.7, margin: "0 0 18px", flexGrow: 1 }}
                  dangerouslySetInnerHTML={{ __html: `&ldquo;${t.quote}&rdquo;` }}
                />

                <div style={{ borderTop: `1px solid ${C.border}`, paddingTop: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: 14.5, color: C.text }}>
                    {t.name}
                    <span style={{ color: C.muted, fontWeight: 400 }}> · {t.location}</span>
                  </div>
                  <div
                    style={{ fontFamily: MONO, fontSize: 11, color: C.muted, marginTop: 4 }}
                    dangerouslySetInnerHTML={{ __html: t.planLabel }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div
          style={{
            marginTop: 48,
            padding: "34px 32px",
            borderRadius: 18,
            background: `linear-gradient(135deg, ${C.card}, #0c0c0c)`,
            border: `1px solid ${C.border}`,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: DISPLAY,
              fontWeight: 800,
              textTransform: "uppercase",
              fontSize: "clamp(24px, 3.5vw, 34px)",
              margin: "0 0 12px",
            }}
          >
            Your result is <span style={{ color: C.accent }}>next.</span>
          </h2>
          <p style={{ color: C.sub, fontSize: 15.5, lineHeight: 1.7, margin: "0 auto 22px", maxWidth: 460 }}>
            Pick a goal, we cook and deliver it, and your progress writes its own review.
          </p>
          <Link
            href="/plans"
            style={{
              display: "inline-block",
              fontFamily: MONO,
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: 0.5,
              textTransform: "uppercase",
              color: "#080808",
              background: C.accent,
              padding: "14px 28px",
              borderRadius: 999,
              textDecoration: "none",
            }}
          >
            Start your plan →
          </Link>
        </div>
      </div>
    </main>
  );
}
