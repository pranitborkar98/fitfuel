"use client";

// app/admin/orders/OrdersView.tsx
import { useMemo, useState } from "react";

const T = {
  card: "#101010", border: "#222", text: "#ffffff", muted: "#888888",
  accent: "#84cc16", soft: "#0c0c0c", amber: "#facc15", red: "#f87171", blue: "#60a5fa",
};
const R = "\u20B9";
const pretty = (e: string) => (e || "").replace(/_/g, " ").toLowerCase();
const inputStyle: React.CSSProperties = { background: T.soft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, boxSizing: "border-box" };
const btn = (primary = false): React.CSSProperties => ({ background: primary ? T.accent : "transparent", color: primary ? "#080808" : T.text, border: `1px solid ${primary ? T.accent : T.border}`, borderRadius: 8, padding: "6px 12px", fontSize: 12, fontWeight: 700, cursor: "pointer" });

function payColor(s: string) {
  if (s === "SUCCESS") return T.accent;
  if (s === "PENDING") return T.amber;
  if (s === "FAILED" || s === "REFUNDED") return T.red;
  return T.muted;
}

async function api(payload: any) {
  const res = await fetch("/api/admin/orders", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Failed");
  return j;
}

type Order = any;

export default function OrdersView({ orders }: { orders: Order[] }) {
  const [list, setList] = useState<Order[]>(orders);
  const [q, setQ] = useState("");
  const [pay, setPay] = useState("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const payStatuses = useMemo(() => Array.from(new Set(list.map((o) => o.paymentStatus))).filter(Boolean), [list]);

  function applyUpdate(updated: { id: string; paymentStatus: string; status: string }) {
    setList((prev) => prev.map((o) => (o.id === updated.id ? { ...o, paymentStatus: updated.paymentStatus, status: updated.status } : o)));
  }

  const filtered = list.filter((o) => {
    if (pay && o.paymentStatus !== pay) return false;
    if (q) {
      const hay = `${o.orderNumber} ${o.user?.name ?? ""} ${o.user?.email ?? ""} ${o.user?.phone ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  const revenue = filtered.filter((o) => o.paymentStatus === "SUCCESS").reduce((a, o) => a + (o.totalRs || 0), 0);

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Orders</h1>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 18 }}>
        Last {list.length} orders · {filtered.length} shown · paid revenue (filtered): <span style={{ color: T.accent }}>{R}{revenue.toLocaleString("en-IN")}</span>
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search order #, name, email, phone…" style={{ ...inputStyle, flex: 1, minWidth: 240 }} />
        <select value={pay} onChange={(e) => setPay(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">All payments</option>
          {payStatuses.map((p) => <option key={p as string} value={p as string}>{pretty(p as string)}</option>)}
        </select>
      </div>

      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1fr 1fr 0.9fr 0.5fr", gap: 8, padding: "10px 14px", background: "#161616", fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
          <div>Order</div><div>Customer</div><div>Payment</div><div>Status</div><div>Total</div><div></div>
        </div>
        {filtered.length === 0 && <div style={{ padding: 20, color: T.muted, fontSize: 13 }}>No orders match.</div>}
        {filtered.map((o, i) => (
          <div key={o.id}>
            <div
              onClick={() => setExpanded(expanded === o.id ? null : o.id)}
              style={{ display: "grid", gridTemplateColumns: "1.2fr 1.6fr 1fr 1fr 0.9fr 0.5fr", gap: 8, padding: "11px 14px", borderTop: i ? `1px solid ${T.border}` : "none", background: T.card, alignItems: "center", cursor: "pointer", fontSize: 13 }}
            >
              <div>
                <div style={{ color: T.text, fontWeight: 600 }}>{o.orderNumber}</div>
                <div style={{ color: T.muted, fontSize: 11 }}>{new Date(o.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" })}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: T.text }}>{o.user?.name ?? "—"}</div>
                <div style={{ color: T.muted, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>{o.user?.email}</div>
              </div>
              <div style={{ color: payColor(o.paymentStatus), fontWeight: 600 }}>{pretty(o.paymentStatus)}<div style={{ color: T.muted, fontSize: 11, fontWeight: 400 }}>{pretty(o.paymentMethod)}</div></div>
              <div style={{ color: T.muted }}>{pretty(o.status)}</div>
              <div style={{ color: T.text, fontWeight: 600 }}>{R}{(o.totalRs || 0).toLocaleString("en-IN")}</div>
              <div style={{ color: T.muted, textAlign: "right" }}>{expanded === o.id ? "▲" : "▼"}</div>
            </div>
            {expanded === o.id && (
              <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.border}`, background: T.soft, fontSize: 13 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div>
                    <Cap>Items</Cap>
                    {(o.items ?? []).length === 0 ? <div style={{ color: T.muted }}>—</div> : (o.items ?? []).map((it: any, k: number) => (
                      <div key={k} style={{ color: T.text, marginBottom: 3 }}>
                        {pretty(it.diet)} · {pretty(it.duration)} · {pretty(it.mealsPerDay)} {it.quantity > 1 ? `× ${it.quantity}` : ""} <span style={{ color: T.muted }}>— {R}{(it.totalRs || 0).toLocaleString("en-IN")}</span>
                      </div>
                    ))}
                    <Cap>Deliver to</Cap>
                    <div style={{ color: T.muted }}>{o.address ? `${o.address.area ?? ""}, ${o.address.city ?? ""} ${o.address.pincode ?? ""}` : "—"}</div>
                  </div>
                  <div>
                    <Cap>Amounts</Cap>
                    <Row k="Subtotal" v={`${R}${(o.subtotalRs || 0).toLocaleString("en-IN")}`} />
                    {o.discountRs ? <Row k={`Discount${o.couponCode ? ` (${o.couponCode})` : ""}`} v={`-${R}${o.discountRs.toLocaleString("en-IN")}`} /> : null}
                    <Row k="GST" v={`${R}${(o.gstRs || 0).toLocaleString("en-IN")}`} />
                    <Row k="Total" v={`${R}${(o.totalRs || 0).toLocaleString("en-IN")}`} strong />
                    <Cap>Payment ref</Cap>
                    <div style={{ color: T.muted, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{o.payuTxnId ?? "—"}</div>
                    <Cap>Mark payment</Cap>
                    <PaymentControl order={o} onUpdated={applyUpdate} />
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function PaymentControl({ order, onUpdated }: { order: Order; onUpdated: (u: any) => void }) {
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const options: { v: string; label: string }[] = [
    { v: "SUCCESS", label: "Paid" },
    { v: "PENDING", label: "Pending" },
    { v: "FAILED", label: "Failed" },
    { v: "REFUNDED", label: "Refunded" },
  ];

  async function setStatus(v: string) {
    if (v === order.paymentStatus) return;
    const confirmMsg = v === "SUCCESS" ? "Mark this order as PAID? (also confirms it if unpaid)" : `Set payment to ${v}?`;
    if (!confirm(confirmMsg)) return;
    setBusy(v); setErr(null);
    try {
      const { order: updated } = await api({ action: "setPaymentStatus", id: order.id, paymentStatus: v });
      onUpdated(updated);
    } catch (e: any) { setErr(e?.message || "Failed"); }
    finally { setBusy(null); }
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {options.map((o) => {
          const active = order.paymentStatus === o.v;
          return (
            <button key={o.v} onClick={() => setStatus(o.v)} disabled={active || busy !== null}
              style={{ ...btn(active && o.v === "SUCCESS"), opacity: active ? 1 : busy ? 0.6 : 1, borderColor: active ? T.accent : T.border, color: active ? (o.v === "SUCCESS" ? "#080808" : T.accent) : T.text, cursor: active ? "default" : "pointer" }}>
              {busy === o.v ? "…" : active ? `✓ ${o.label}` : o.label}
            </button>
          );
        })}
      </div>
      {err && <div style={{ color: T.red, fontSize: 12, marginTop: 6 }}>{err}</div>}
      <div style={{ color: T.muted, fontSize: 11, marginTop: 6 }}>Records payment for reconciliation. Doesn&rsquo;t re-run checkout automation.</div>
    </div>
  );
}

const Cap = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: T.accent, fontWeight: 700, margin: "10px 0 5px" }}>{children}</div>;
const Row = ({ k, v, strong }: { k: string; v: string; strong?: boolean }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", color: strong ? T.text : T.muted, fontWeight: strong ? 700 : 400 }}>
    <span>{k}</span><span>{v}</span>
  </div>
);
