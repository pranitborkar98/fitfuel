// app/plans/digital/page.tsx — Starter vs Pro value tiers (bundle-driven).
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const T = { bg: "#0a0a0a", card: "#111111", cardBorder: "#1f1f1f", accent: "#84cc16", accentLight: "#a3e635", textPrimary: "#fff", textSecond: "#a3a3a3", textMuted: "#9a9a94" };
const DUR_KEY: Record<string, string> = { ONE_MONTH: "monthly", TWO_MONTH: "two_month", THREE_MONTH: "three_month" };
const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

const COPY: Record<string, { tag: string; label: string; bullets: string[]; popular: boolean }> = {
  STARTER: { tag: "STARTER", label: "Digital Starter", popular: false, bullets: ["Full 30-day recipe book (PDF)", "Per-meal macros + daily totals", "Consolidated grocery list", "Meal logging on your dashboard"] },
  PRO:     { tag: "PRO",     label: "Digital Pro",     popular: true,  bullets: ["Everything in Starter", "30-day training plan (PDF) — sets, reps, rest & weekly split", "Workout calorie targets per day", "Progress & body-metrics tracking", "Free plan updates"] },
};

export const metadata = {
  title: "Digital Meal Plans (PDF)",
  description:
    "A 30-day recipe book, per-meal macros, a grocery list and a training plan, " +
    "delivered as a PDF. For anyone outside our Pune delivery radius.",
  alternates: { canonical: "/plans/digital" },
};

export const dynamic = "force-dynamic";

export default async function DigitalPlansPage() {
  const prices = await (prisma as any).planPrice.findMany({ where: { isDigital: true, isActive: true }, include: { mealPlan: true } });
  // one card per bundle (lowest price per bundle wins if multiple durations exist)
  const order = ["STARTER", "PRO"];
  prices.sort((a: any, b: any) => order.indexOf(a.bundle) - order.indexOf(b.bundle));

  return (
    <main style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, padding: "64px 20px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ color: T.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>Digital Meal Plans</span>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "12px 0 10px" }}>Cook it yourself. Anywhere in India.</h1>
          <p style={{ color: T.textSecond, fontSize: 16, maxWidth: 560, margin: "0 auto" }}>The full 30-day plan as a downloadable PDF — recipes, macros, grocery list, and (on Pro) a complete training plan. No delivery, no city limits.</p>
        </div>

        {prices.length === 0 ? <p style={{ textAlign: "center", color: T.textMuted }}>No digital plans available yet.</p> : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20, alignItems: "start" }}>
            {prices.map((p: any) => {
              const c = COPY[p.bundle] ?? COPY.STARTER;
              const mrp = p.mrpRs ?? p.priceRs;
              const off = mrp > p.priceRs ? Math.round((1 - p.priceRs / mrp) * 100) : 0;
              const href = `/checkout/digital?planSlug=${p.mealPlan.slug}&dur=${DUR_KEY[p.duration] ?? "monthly"}&bundle=${p.bundle}&sale=${p.priceRs}&mrp=${mrp}&name=${encodeURIComponent(p.mealPlan.displayName)}&tier=${encodeURIComponent(c.label)}`;
              return (
                <div key={p.id} style={{ background: T.card, border: `1px solid ${c.popular ? "rgba(132,204,22,0.5)" : T.cardBorder}`, borderRadius: 16, padding: 28, position: "relative", boxShadow: c.popular ? "0 0 30px rgba(132,204,22,0.08)" : "none" }}>
                  {c.popular && <span style={{ position: "absolute", top: -11, left: 28, background: T.accent, color: "#0a0a0a", fontSize: 12, fontWeight: 800, padding: "4px 12px", borderRadius: 999, letterSpacing: "0.05em" }}>MOST POPULAR</span>}
                  {off > 0 && <span style={{ position: "absolute", top: 18, right: 18, background: "rgba(132,204,22,0.12)", color: T.accentLight, fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>{off}% OFF</span>}
                  <p style={{ color: T.accent, fontSize: 12, fontWeight: 800, letterSpacing: "0.08em", marginBottom: 4 }}>{c.tag}</p>
                  <h3 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>{c.label}</h3>
                  <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 18 }}>{p.mealPlan.displayName} · 30-day · PDF</p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 34, fontWeight: 800, color: T.accentLight }}>{fmt(p.priceRs)}</span>
                    {off > 0 && <span style={{ fontSize: 16, color: T.textMuted, textDecoration: "line-through" }}>{fmt(mrp)}</span>}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", color: T.textSecond, fontSize: 14, lineHeight: 1.9 }}>
                    {c.bullets.map((b, i) => <li key={i}>✓ {b}</li>)}
                  </ul>
                  <Link href={href} style={{ display: "block", textAlign: "center", background: c.popular ? T.accent : "transparent", color: c.popular ? "#0a0a0a" : T.accent, border: `1px solid ${T.accent}`, fontWeight: 700, padding: "13px 0", borderRadius: 10, textDecoration: "none" }}>
                    Get {c.label}
                  </Link>
                </div>
              );
            })}
          </div>
        )}
        <p style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: 36 }}>Prices include 18% GST. Download from your dashboard after payment.</p>
      </div>
    </main>
  );
}
