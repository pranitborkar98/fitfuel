"use client";

// app/dashboard/partners/PartnerDashboardClient.tsx
// Phase 17B — B2B partner dashboard UI (gym, trainer, influencer, etc.)

import { useEffect, useState } from "react";
import Link from "next/link";

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#1f1f1f",
  text: "#f5f5f4",
  dim: "#888",
  accent: "#a3e635",
  ok: "#22c55e",
  warn: "#f59e0b",
  pending: "#f59e0b",
};
const RUPEE = "\u20B9";

type Partner = {
  id: string; type: string; status: string; name: string; code: string;
  rewardType: string; rewardValueRs: number; refereeDiscountRs: number;
  profilePhotoUrl: string | null; approvedAt: string | null;
};
type Stats = { totalConversions: number; totalEarnedRs: number; pendingPayoutRs: number; paidPayoutRs: number };
type Referral = {
  id: string; refereeName: string; orderNumber: string | null;
  orderTotal: number; rewardType: string; rewardAmountRs: number;
  status: string; createdAt: string;
};
type Payout = {
  id: string; periodYearMonth: string; amountRs: number;
  referralCount: number; status: string; paidAt: string | null; paymentRef: string | null;
};
type Data = { partner: Partner; stats: Stats; referrals: Referral[]; payouts: Payout[] };

export default function PartnerDashboardClient({ origin }: { origin: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/user/partner")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Pane><div style={{ color: T.dim }}>Loading…</div></Pane>;
  if (!data?.partner) return <Pane><div style={{ color: T.warn }}>No partner account.</div></Pane>;

  const p = data.partner;
  const shareLink = `${origin}/p/${p.code}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { window.prompt("Copy this link:", shareLink); }
  }

  return (
    <Pane>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>
            {p.type} partner · <StatusPill s={p.status} />
          </div>
          <h1 style={{ fontFamily: '"Syne", system-ui', fontSize: 32, fontWeight: 800, margin: "6px 0 0" }}>{p.name}</h1>
          <div style={{ color: T.dim, fontSize: 13, marginTop: 6 }}>
            Reward: {rewardLabel(p.rewardType, p.rewardValueRs)} per conversion · Referee discount: {RUPEE}{p.refereeDiscountRs}
          </div>
        </div>
        <Link href="/dashboard" style={{ color: T.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← Back to dashboard</Link>
      </div>

      {/* Status banner */}
      {p.status !== "ACTIVE" && (
        <div style={{ background: "#1a1505", border: `1px solid ${T.warn}`, color: T.warn, padding: "12px 16px", borderRadius: 10, marginBottom: 24, fontSize: 13 }}>
          {p.status === "PENDING" && "Your partner account is under review. You'll be notified once approved."}
          {p.status === "PAUSED" && "Your partner account is currently paused. Contact us to reactivate."}
          {p.status === "REJECTED" && "Your partner application was not approved. Contact us for details."}
          {p.status === "TERMINATED" && "Your partner account has been terminated."}
        </div>
      )}

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <Stat label="Conversions" value={String(data.stats.totalConversions)} />
        <Stat label="Total earned" value={`${RUPEE}${data.stats.totalEarnedRs.toLocaleString("en-IN")}`} accent />
        <Stat label="Pending payout" value={`${RUPEE}${data.stats.pendingPayoutRs.toLocaleString("en-IN")}`} />
        <Stat label="Paid out" value={`${RUPEE}${data.stats.paidPayoutRs.toLocaleString("en-IN")}`} />
      </div>

      {/* Share link */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Your tracking link</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}>
          <code style={{
            background: "#000", border: `1px solid ${T.border}`, padding: "10px 14px",
            borderRadius: 8, fontFamily: 'ui-monospace, monospace', fontSize: 13,
            color: T.accent, flex: "1 1 280px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>{shareLink}</code>
          <button onClick={copyLink} style={{
            background: copied ? T.ok : "transparent", color: copied ? "#000" : T.text,
            border: `1px solid ${copied ? T.ok : T.border}`, padding: "10px 16px",
            borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{copied ? "Copied" : "Copy link"}</button>
        </div>
        <div style={{ marginTop: 12, fontSize: 12, color: T.dim }}>
          Code: <strong style={{ color: T.text, fontFamily: 'ui-monospace, monospace' }}>{p.code}</strong>
          {" · "}For printable QR posters, contact FitFuel admin.
        </div>
      </div>

      {/* Conversions table */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Conversions</div>
        {data.referrals.length === 0 ? (
          <div style={{ color: T.dim, fontSize: 14 }}>No conversions yet. Share your link to start earning.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.referrals.map((r) => (
              <div key={r.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.refereeName}</div>
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>
                    {r.orderNumber ? `Order #${r.orderNumber} · ${RUPEE}${r.orderTotal.toLocaleString("en-IN")} · ` : ""}
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.accent, fontWeight: 700, fontSize: 14 }}>
                    +{rewardLabel(r.rewardType, r.rewardAmountRs)}
                  </div>
                  <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
                    {r.status.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Payouts */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 12, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Payouts (monthly)</div>
        {data.payouts.length === 0 ? (
          <div style={{ color: T.dim, fontSize: 14 }}>
            {p.rewardType === "CASH"
              ? "No payouts yet. Cash payouts are processed monthly."
              : p.rewardType === "MEAL_VOUCHER"
                ? "Meal vouchers are distributed out-of-band — your conversion count is what counts."
                : "No payouts applicable for this reward type."}
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.payouts.map((py) => (
              <div key={py.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 10, padding: "12px 14px" }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{formatPeriod(py.periodYearMonth)}</div>
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>
                    {py.referralCount} conversion{py.referralCount === 1 ? "" : "s"}
                    {py.paymentRef ? ` · Ref ${py.paymentRef}` : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.text, fontWeight: 700, fontSize: 14 }}>{RUPEE}{py.amountRs.toLocaleString("en-IN")}</div>
                  <PayoutPill s={py.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Pane>
  );
}

function rewardLabel(rt: string, v: number) {
  if (rt === "MEAL_VOUCHER") return `${v} meal voucher${v === 1 ? "" : "s"}`;
  if (rt === "DISCOUNT_ONLY") return "Referee discount only";
  if (rt === "HYBRID") return `${RUPEE}${v} + discount`;
  return `${RUPEE}${v}`;
}

function formatPeriod(ym: string) {
  if (!/^\d{4}-\d{2}$/.test(ym)) return ym;
  const [y, m] = ym.split("-");
  const d = new Date(Number(y), Number(m) - 1, 1);
  return d.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

function Pane({ children }: { children: any }) {
  return (
    <div style={{ background: T.bg, minHeight: "calc(100vh - 80px)", color: T.text, padding: "32px 16px 64px" }}>
      <div style={{ maxWidth: 880, margin: "0 auto" }}>{children}</div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${accent ? T.accent : T.border}`, borderRadius: 12, padding: 16 }}>
      <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>{label}</div>
      <div style={{ fontFamily: '"Barlow Condensed", "Syne", system-ui', fontSize: 30, fontWeight: 700, color: accent ? T.accent : T.text }}>{value}</div>
    </div>
  );
}

function StatusPill({ s }: { s: string }) {
  const c = s === "ACTIVE" ? T.ok : s === "PENDING" ? T.warn : "#ef4444";
  return <span style={{ color: c }}>{s}</span>;
}

function PayoutPill({ s }: { s: string }) {
  const c = s === "PAID" ? T.ok : s === "PROCESSING" ? "#3b82f6" : s === "FAILED" ? "#ef4444" : T.warn;
  return (
    <div style={{ fontSize: 10, color: c, textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 2 }}>
      {s}
    </div>
  );
}
