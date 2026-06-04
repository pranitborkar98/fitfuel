"use client";

// app/driver/[token]/DriverClient.tsx
// Phase 10 — mobile-first driver delivery list. Big tap targets (used at the doorstep).

import { useEffect, useState } from "react";

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#222",
  text: "#ffffff",
  textSecond: "#bbbbbb",
  textMuted: "#888888",
  accent: "#84cc16",
  red: "#ef4444",
  amber: "#f59e0b",
};

type Delivery = {
  id: string;
  status: "PREPARING" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED_DELIVERY";
  mealsIncluded: string[];
  deliveredAt: string | null;
  customerConfirmedAt: string | null;
  customerIssueNote: string | null;
  trackingNotes: string | null;
  order: {
    orderNumber: string;
    user: { name: string | null; email: string | null; phone: string | null };
    address: {
      line1: string; line2: string | null; area: string;
      city: string; pincode: string; landmark: string | null;
    } | null;
  };
};

const STATUS_STYLE: Record<Delivery["status"], { label: string; color: string }> = {
  PREPARING: { label: "Preparing", color: T.textMuted },
  PACKED: { label: "Packed", color: T.textMuted },
  OUT_FOR_DELIVERY: { label: "Out for delivery", color: T.amber },
  DELIVERED: { label: "Delivered ✓", color: T.accent },
  FAILED_DELIVERY: { label: "Not delivered", color: T.red },
};

export default function DriverClient({ token, driverName }: { token: string; driverName: string }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failingId, setFailingId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetch(`/api/driver/${token}/deliveries`)
      .then(r => r.json())
      .then(d => { if (Array.isArray(d.deliveries)) setDeliveries(d.deliveries); })
      .finally(() => setLoading(false));
  }, [token]);

  async function mark(deliveryId: string, result: "delivered" | "failed", noteText?: string) {
    setBusyId(deliveryId);
    try {
      const res = await fetch(`/api/driver/${token}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, result, note: noteText }),
      });
      if (res.ok) {
        const { delivery } = await res.json();
        setDeliveries(prev =>
          prev.map(d =>
            d.id === deliveryId
              ? { ...d, status: delivery.status, deliveredAt: delivery.deliveredAt, trackingNotes: noteText ?? d.trackingNotes }
              : d
          )
        );
        setFailingId(null);
        setNote("");
      }
    } finally {
      setBusyId(null);
    }
  }

  const pending = deliveries.filter(d => d.status !== "DELIVERED" && d.status !== "FAILED_DELIVERY").length;

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui, sans-serif", padding: "20px 14px 60px", maxWidth: 560, margin: "0 auto" }}>
      <div style={{ marginBottom: 18 }}>
        <p style={{ fontSize: 12, color: T.accent, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>FitFuel · Driver</p>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginTop: 4 }}>Hi {driverName}</h1>
        <p style={{ fontSize: 13, color: T.textMuted, marginTop: 2 }}>
          {loading ? "Loading today's stops…" : `${deliveries.length} stop${deliveries.length === 1 ? "" : "s"} today · ${pending} pending`}
        </p>
      </div>

      {!loading && deliveries.length === 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 24, textAlign: "center", color: T.textMuted, fontSize: 14 }}>
          No deliveries assigned to you today.
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {deliveries.map(d => {
          const st = STATUS_STYLE[d.status];
          const a = d.order.address;
          const done = d.status === "DELIVERED" || d.status === "FAILED_DELIVERY";
          const customer = d.order.user.name ?? d.order.user.email ?? "Customer";
          return (
            <div key={d.id} style={{ background: T.card, border: `1px solid ${done ? T.border : "#2a3d10"}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{d.order.orderNumber}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: st.color }}>{st.label}</span>
              </div>

              <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 2 }}>{customer}</p>
              {a && (
                <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.45, marginBottom: 2 }}>
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.area}, {a.city} {a.pincode}
                  {a.landmark ? ` · near ${a.landmark}` : ""}
                </p>
              )}

              {d.mealsIncluded?.length > 0 && (
                <p style={{ fontSize: 12, color: T.textMuted, marginBottom: 10 }}>{d.mealsIncluded.join(" · ")}</p>
              )}

              {d.order.user.phone && (
                <a href={`tel:${d.order.user.phone}`} style={{ display: "inline-block", fontSize: 13, fontWeight: 600, color: T.accent, marginBottom: done ? 0 : 12, textDecoration: "none" }}>
                  📞 Call {d.order.user.phone}
                </a>
              )}

              {!done && failingId !== d.id && (
                <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
                  <button onClick={() => mark(d.id, "delivered")} disabled={busyId === d.id}
                    style={{ flex: 1, background: T.accent, color: "#0a0a0a", border: "none", borderRadius: 10, padding: "14px", fontSize: 15, fontWeight: 800, cursor: "pointer" }}>
                    {busyId === d.id ? "…" : "Delivered ✓"}
                  </button>
                  <button onClick={() => { setFailingId(d.id); setNote(""); }} disabled={busyId === d.id}
                    style={{ background: "transparent", color: T.textSecond, border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", fontSize: 14, fontWeight: 600, cursor: "pointer" }}>
                    Couldn&apos;t deliver
                  </button>
                </div>
              )}

              {!done && failingId === d.id && (
                <div style={{ marginTop: 12 }}>
                  <input value={note} onChange={e => setNote(e.target.value)} placeholder="What happened? (e.g. customer not home)"
                    style={{ width: "100%", background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px", fontSize: 13, color: T.text, marginBottom: 10, boxSizing: "border-box" }} />
                  <div style={{ display: "flex", gap: 10 }}>
                    <button onClick={() => mark(d.id, "failed", note || undefined)} disabled={busyId === d.id}
                      style={{ flex: 1, background: T.red, color: "#fff", border: "none", borderRadius: 10, padding: "13px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
                      {busyId === d.id ? "…" : "Confirm not delivered"}
                    </button>
                    <button onClick={() => setFailingId(null)}
                      style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 10, padding: "13px 16px", fontSize: 14, cursor: "pointer" }}>
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {d.status === "DELIVERED" && d.customerConfirmedAt && (
                <p style={{ fontSize: 12, color: T.accent, marginTop: 10 }}>Customer confirmed receipt ✓</p>
              )}
              {d.status === "FAILED_DELIVERY" && d.trackingNotes && (
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 10 }}>Note: {d.trackingNotes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
