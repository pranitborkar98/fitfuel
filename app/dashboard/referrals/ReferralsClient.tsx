"use client";

// app/dashboard/referrals/ReferralsClient.tsx
// Phase 17B — Customer P2P referrals UI.
// Share via WhatsApp deeplink (uses user's own WhatsApp), copy link, referees list, credit balance.

import { useEffect, useState } from "react";
import Link from "next/link";

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#1f1f1f",
  text: "#f5f5f4",
  dim: "#888",
  accent: "#a3e635",
  accent2: "#84cc16",
  ok: "#22c55e",
  warn: "#f59e0b",
};

const RUPEE = "\u20B9";

type Referee = {
  id: string;
  refereeName: string;
  orderNumber: string | null;
  rewardAmountRs: number;
  status: string;
  createdAt: string;
};

type Data = {
  code: string;
  creditsBalanceRs: number;
  referees: Referee[];
  totalEarnedRs: number;
  name: string;
};

export default function ReferralsClient({ origin }: { origin: string }) {
  const [data, setData] = useState<Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/user/referrals")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return <Pane><div style={{ color: T.dim }}>Loading…</div></Pane>;
  }
  if (!data) {
    return <Pane><div style={{ color: T.warn }}>Could not load referrals.</div></Pane>;
  }

  const shareLink = `${origin}/p/${data.code}`;
  const waMessage =
    `Hey! I've been using FitFuel for my meals + tracking. Use my code ${data.code} and get ${RUPEE}200 off your first plan: ${shareLink}`;
  const waHref = `https://wa.me/?text=${encodeURIComponent(waMessage)}`;

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Fallback: select+prompt
      window.prompt("Copy this link:", shareLink);
    }
  }

  return (
    <Pane>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Referrals</div>
          <h1 style={{ fontFamily: '"Syne", system-ui', fontSize: 32, fontWeight: 800, margin: "6px 0 0" }}>Refer friends, earn credit</h1>
          <div style={{ color: T.dim, fontSize: 14, marginTop: 8 }}>
            They get {RUPEE}200 off their first plan. You get {RUPEE}500 credit when they order.
          </div>
        </div>
        <Link href="/dashboard" style={{ color: T.accent, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>← Back to dashboard</Link>
      </div>

      {/* Stat strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 24 }}>
        <Stat label="Your credit balance" value={`${RUPEE}${data.creditsBalanceRs.toLocaleString("en-IN")}`} accent />
        <Stat label="Total earned" value={`${RUPEE}${data.totalEarnedRs.toLocaleString("en-IN")}`} />
        <Stat label="Friends signed up" value={String(data.referees.length)} />
      </div>

      {/* Share card */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>Your share link</div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center", marginBottom: 18 }}>
          <code style={{
            background: "#000", border: `1px solid ${T.border}`, padding: "10px 14px",
            borderRadius: 8, fontFamily: 'ui-monospace, monospace', fontSize: 13,
            color: T.accent, flex: "1 1 280px", overflow: "hidden", textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}>{shareLink}</code>
          <button onClick={copyLink} style={{
            background: copied ? T.ok : "transparent", color: copied ? "#000" : T.text,
            border: `1px solid ${copied ? T.ok : T.border}`, padding: "10px 16px",
            borderRadius: 8, fontWeight: 700, fontSize: 13, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{copied ? "Copied" : "Copy link"}</button>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          <a href={waHref} target="_blank" rel="noopener" style={{
            background: "#25D366", color: "#000", fontWeight: 800, fontSize: 13,
            padding: "12px 20px", borderRadius: 8, textDecoration: "none",
            textTransform: "uppercase", letterSpacing: "0.06em",
            display: "inline-flex", alignItems: "center", gap: 8,
          }}>
            <WhatsAppIcon /> Share on WhatsApp
          </a>
          <button onClick={copyLink} style={{
            background: "transparent", color: T.text, border: `1px solid ${T.border}`,
            padding: "12px 20px", borderRadius: 8, fontWeight: 700, fontSize: 13,
            cursor: "pointer", textTransform: "uppercase", letterSpacing: "0.06em",
          }}>{copied ? "Copied!" : "Copy"}</button>
        </div>

        <div style={{ marginTop: 14, fontSize: 12, color: T.dim }}>
          Your code: <strong style={{ color: T.text, fontFamily: 'ui-monospace, monospace' }}>{data.code}</strong>
        </div>
      </div>

      {/* How it works */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24, marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>How it works</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <Step n={1} t="Share your link" b="WhatsApp, message, or just copy it." />
          <Step n={2} t="Friend orders" b={`They get ${RUPEE}200 off their first plan automatically.`} />
          <Step n={3} t="You earn credit" b={`${RUPEE}500 lands in your balance when their first order is confirmed.`} />
        </div>
      </div>

      {/* Referees list */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>
        <div style={{ fontSize: 12, color: T.dim, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14 }}>Friends you've referred</div>
        {data.referees.length === 0 ? (
          <div style={{ color: T.dim, fontSize: 14, padding: "12px 0" }}>
            No referrals yet. Share your link to get started.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {data.referees.map((r) => (
              <div key={r.id} style={{
                display: "flex", justifyContent: "space-between", alignItems: "center",
                background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 10,
                padding: "12px 14px",
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{r.refereeName}</div>
                  <div style={{ fontSize: 11, color: T.dim, marginTop: 2 }}>
                    {r.orderNumber ? `Order #${r.orderNumber} · ` : ""}
                    {new Date(r.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ color: T.accent, fontWeight: 700, fontSize: 14 }}>
                    +{RUPEE}{r.rewardAmountRs.toLocaleString("en-IN")}
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
    </Pane>
  );
}

function Pane({ children }: { children: any }) {
  return (
    <div style={{ background: T.bg, minHeight: "calc(100vh - 80px)", color: T.text, padding: "72px 16px 80px" }}>
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

function Step({ n, t, b }: { n: number; t: string; b: string }) {
  return (
    <div>
      <div style={{ width: 28, height: 28, borderRadius: 99, background: "#000", border: `1px solid ${T.accent}`, color: T.accent, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 13, marginBottom: 8 }}>{n}</div>
      <div style={{ fontWeight: 700, fontSize: 14 }}>{t}</div>
      <div style={{ color: T.dim, fontSize: 12, lineHeight: 1.5, marginTop: 4 }}>{b}</div>
    </div>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.5 14.4c-.3-.1-1.7-.8-2-.9-.3-.1-.4-.1-.6.1-.2.3-.7.9-.8 1.1-.2.2-.3.2-.6.1-.3-.1-1.2-.5-2.3-1.4-.9-.8-1.4-1.7-1.6-2-.2-.3 0-.5.1-.6.1-.1.3-.3.4-.5.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5 0-.1-.6-1.5-.8-2-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2 0 1.3.9 2.5 1.1 2.7.1.2 1.9 2.8 4.5 4 .6.3 1.1.5 1.5.6.6.2 1.2.2 1.6.1.5-.1 1.7-.7 1.9-1.3.2-.6.2-1.2.1-1.3 0-.1-.2-.2-.5-.3z"/>
      <path d="M19.1 4.9C17.2 3 14.7 2 12 2 6.5 2 2 6.5 2 12c0 1.8.5 3.5 1.3 5L2 22l5.1-1.3c1.4.8 3.1 1.2 4.8 1.2h.1c5.5 0 10-4.5 10-10 0-2.7-1-5.2-2.9-7zm-7 15.4c-1.5 0-3-.4-4.3-1.2l-.3-.2-3 .8.8-2.9-.2-.3c-.8-1.3-1.3-2.9-1.3-4.5 0-4.5 3.7-8.2 8.3-8.2 2.2 0 4.3.9 5.8 2.4 1.5 1.5 2.4 3.6 2.4 5.8 0 4.5-3.7 8.3-8.2 8.3z"/>
    </svg>
  );
}