// app/plans/digital/page.tsx  (Phase 13 — Digital Plans listing)
// Server component: lists every isDigital PlanPrice as a card. Matches the dark/lime design system.
import { prisma } from "@/lib/prisma";
import Link from "next/link";

const T = {
  bg: "#0a0a0a", card: "#111111", cardBorder: "#1f1f1f",
  accent: "#84cc16", accentLight: "#a3e635",
  textPrimary: "#ffffff", textSecond: "#a3a3a3", textMuted: "#737373",
};

const DUR_LABEL: Record<string, string> = {
  ONE_MONTH: "1 Month", TWO_MONTH: "2 Months", THREE_MONTH: "3 Months",
};
// reverse of the PayU digital route's DUR_MAP, so checkout receives the client key
const DUR_KEY: Record<string, string> = {
  ONE_MONTH: "monthly", TWO_MONTH: "two_month", THREE_MONTH: "three_month",
};
const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

export const dynamic = "force-dynamic";

export default async function DigitalPlansPage() {
  const prices = await (prisma as any).planPrice.findMany({
    where: { isDigital: true, isActive: true },
    include: { mealPlan: true },
    orderBy: { priceRs: "asc" },
  });

  return (
    <main style={{ background: T.bg, minHeight: "100vh", color: T.textPrimary, padding: "64px 20px" }}>
      <div style={{ maxWidth: 1040, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <span style={{ color: T.accent, fontSize: 13, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
            Digital Meal Plans
          </span>
          <h1 style={{ fontSize: 40, fontWeight: 800, margin: "12px 0 10px" }}>
            Cook it yourself. Anywhere in India.
          </h1>
          <p style={{ color: T.textSecond, fontSize: 16, maxWidth: 560, margin: "0 auto" }}>
            The full 30-day plan as a downloadable PDF — every recipe, macros, and a complete grocery
            list. No delivery, no city limits. Log your meals and let FitFuel keep you on track.
          </p>
        </div>

        {prices.length === 0 ? (
          <p style={{ textAlign: "center", color: T.textMuted }}>No digital plans available yet.</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20 }}>
            {prices.map((p: any) => {
              const mrp = p.mrpRs ?? p.priceRs;
              const off = mrp > p.priceRs ? Math.round((1 - p.priceRs / mrp) * 100) : 0;
              const href = `/checkout/digital?planSlug=${p.mealPlan.slug}&dur=${DUR_KEY[p.duration] ?? "monthly"}&sale=${p.priceRs}&mrp=${mrp}&name=${encodeURIComponent(p.mealPlan.displayName)}`;
              return (
                <div key={p.id} style={{ background: T.card, border: `1px solid ${T.cardBorder}`, borderRadius: 16, padding: 28, position: "relative" }}>
                  {off > 0 && (
                    <span style={{ position: "absolute", top: 18, right: 18, background: T.accent, color: "#0a0a0a", fontSize: 12, fontWeight: 800, padding: "4px 10px", borderRadius: 999 }}>
                      {off}% OFF
                    </span>
                  )}
                  <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>{p.mealPlan.displayName}</h3>
                  <p style={{ color: T.textMuted, fontSize: 13, marginBottom: 18 }}>
                    {DUR_LABEL[p.duration] ?? p.duration} · all meals · PDF
                  </p>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 20 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: T.accentLight }}>{fmt(p.priceRs)}</span>
                    {off > 0 && <span style={{ fontSize: 16, color: T.textMuted, textDecoration: "line-through" }}>{fmt(mrp)}</span>}
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", color: T.textSecond, fontSize: 14, lineHeight: 1.9 }}>
                    <li>✓ Full 30-day recipe book (PDF)</li>
                    <li>✓ Per-meal macros + day totals</li>
                    <li>✓ Consolidated grocery list</li>
                    <li>✓ Meal logging on your dashboard</li>
                  </ul>
                  <Link href={href} style={{ display: "block", textAlign: "center", background: T.accent, color: "#0a0a0a", fontWeight: 700, padding: "13px 0", borderRadius: 10, textDecoration: "none" }}>
                    Get this plan
                  </Link>
                </div>
              );
            })}
          </div>
        )}

        <p style={{ textAlign: "center", color: T.textMuted, fontSize: 13, marginTop: 36 }}>
          Prices include 18% GST. Download from your dashboard after payment.
        </p>
      </div>
    </main>
  );
}
