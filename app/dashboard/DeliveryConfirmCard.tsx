"use client";

// app/dashboard/DeliveryConfirmCard.tsx
// Phase 15C-CONFIRM — customer "received / report an issue" card.
// Self-contained: fetches the user's recent deliveries on mount and renders
// nothing if there are none. Confirming sets customerConfirmedAt; reporting an
// issue sets customerIssueNote — both surface on the admin dispatch board.

import { useEffect, useState } from "react";
import { Package, CheckCircle2, AlertTriangle, Clock } from "lucide-react";

const T = {
  card: "#111111",
  border: "#1f1f1f",
  accent: "#84cc16",
  text: "#f9fafb",
  textSecond: "#a3a3a3",
  textMuted: "#737373",
  amber: "#facc15",
  green: "#22c55e",
};

type Delivery = {
  id: string;
  deliveryDate: string;
  status: string;
  mealsIncluded: string[];
  deliveryWindow: string | null;
  deliveredAt: string | null;
  customerConfirmedAt: string | null;
  customerIssueNote: string | null;
};

function fmtDate(s: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
    timeZone: "UTC",
  }).format(new Date(s));
}

export default function DeliveryConfirmCard() {
  const [deliveries, setDeliveries] = useState<Delivery[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [issueFor, setIssueFor] = useState<string | null>(null);
  const [issueText, setIssueText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/user/deliveries")
      .then((r) => (r.ok ? r.json() : { deliveries: [] }))
      .then((d) => {
        if (alive) setDeliveries(d.deliveries ?? []);
      })
      .catch(() => alive && setDeliveries([]));
    return () => {
      alive = false;
    };
  }, []);

  async function act(deliveryId: string, action: "confirm" | "issue", note?: string) {
    setBusyId(deliveryId);
    setErr(null);
    try {
      const res = await fetch("/api/user/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, action, note }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      setDeliveries((prev) =>
        (prev ?? []).map((d) =>
          d.id === deliveryId
            ? {
                ...d,
                customerConfirmedAt: data.delivery.customerConfirmedAt ?? d.customerConfirmedAt,
                customerIssueNote: data.delivery.customerIssueNote ?? d.customerIssueNote,
              }
            : d
        )
      );
      setIssueFor(null);
      setIssueText("");
    } catch (e: any) {
      setErr(e?.message || "Something went wrong");
    } finally {
      setBusyId(null);
    }
  }

  // Render nothing until loaded, or if there are no recent deliveries.
  if (!deliveries || deliveries.length === 0) return null;

  return (
    <div
      style={{
        background: T.card,
        border: `1px solid ${T.border}`,
        borderRadius: 16,
        padding: "20px",
        marginBottom: 24,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <Package size={18} color={T.accent} />
        <h2 style={{ fontSize: 16, fontWeight: 700, color: T.text }}>Recent deliveries</h2>
      </div>

      {err && (
        <div style={{ color: "#f87171", fontSize: 13, marginBottom: 12 }}>{err}</div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {deliveries.map((d) => {
          const confirmed = !!d.customerConfirmedAt;
          const reported = !!d.customerIssueNote;
          const busy = busyId === d.id;
          return (
            <div
              key={d.id}
              style={{
                border: `1px solid ${T.border}`,
                borderRadius: 12,
                padding: "14px 16px",
                background: "#0d0d0d",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>
                    {fmtDate(d.deliveryDate)}
                    {d.deliveryWindow ? (
                      <span style={{ color: T.textMuted, fontWeight: 400 }}>
                        {" "}· {d.deliveryWindow === "EVENING" ? "Evening" : "Morning"}
                      </span>
                    ) : null}
                  </div>
                  <div style={{ fontSize: 12.5, color: T.textSecond, marginTop: 3 }}>
                    {d.mealsIncluded?.length ? d.mealsIncluded.join(", ") : "Your meals"}
                  </div>
                </div>

                {d.status === "OUT_FOR_DELIVERY" && !confirmed && !reported && (
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, color: T.amber }}>
                    <Clock size={13} /> On the way
                  </span>
                )}
              </div>

              {/* States */}
              {confirmed ? (
                <div style={{ display: "inline-flex", alignItems: "center", gap: 6, marginTop: 12, fontSize: 13, color: T.green, fontWeight: 600 }}>
                  <CheckCircle2 size={15} /> Received — thank you!
                </div>
              ) : reported ? (
                <div style={{ marginTop: 12, fontSize: 13, color: T.amber, display: "flex", alignItems: "flex-start", gap: 6 }}>
                  <AlertTriangle size={15} style={{ marginTop: 1, flexShrink: 0 }} />
                  <span>Issue reported. We&rsquo;re on it. <span style={{ color: T.textMuted }}>&ldquo;{d.customerIssueNote}&rdquo;</span></span>
                </div>
              ) : issueFor === d.id ? (
                <div style={{ marginTop: 12 }}>
                  <textarea
                    value={issueText}
                    onChange={(e) => setIssueText(e.target.value)}
                    placeholder="What went wrong? (missing meal, late, quality…)"
                    rows={2}
                    maxLength={500}
                    style={{ width: "100%", background: "#0a0a0a", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13, resize: "vertical", fontFamily: "inherit" }}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button
                      disabled={busy || !issueText.trim()}
                      onClick={() => act(d.id, "issue", issueText.trim())}
                      style={{ ...primaryBtn, opacity: busy || !issueText.trim() ? 0.5 : 1 }}
                    >
                      {busy ? "Sending…" : "Submit issue"}
                    </button>
                    <button
                      disabled={busy}
                      onClick={() => { setIssueFor(null); setIssueText(""); }}
                      style={ghostBtn}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                  <button
                    disabled={busy}
                    onClick={() => act(d.id, "confirm")}
                    style={{ ...primaryBtn, opacity: busy ? 0.6 : 1 }}
                  >
                    {busy ? "…" : "Yes, received"}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => { setIssueFor(d.id); setErr(null); }}
                    style={ghostBtn}
                  >
                    Report an issue
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: T.accent,
  color: "#080808",
  border: "none",
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 700,
  cursor: "pointer",
};

const ghostBtn: React.CSSProperties = {
  background: "transparent",
  color: T.textSecond,
  border: `1px solid ${T.border}`,
  borderRadius: 8,
  padding: "9px 16px",
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
};
