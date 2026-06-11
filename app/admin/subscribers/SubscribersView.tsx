"use client";

// app/admin/subscribers/SubscribersView.tsx
import { useState } from "react";

const T = {
  card: "#101010", border: "#222", text: "#ffffff", muted: "#888888",
  accent: "#84cc16", soft: "#0c0c0c", amber: "#facc15", red: "#f87171", blue: "#60a5fa",
};
const pretty = (e: string) => (e || "").replace(/_/g, " ").toLowerCase();
const inputStyle: React.CSSProperties = { background: T.soft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13.5, boxSizing: "border-box" };
const d = (x: any) => (x ? new Date(x).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "2-digit" }) : "—");

function statusColor(s: string) {
  if (s === "active") return T.accent;
  if (s === "paused") return T.amber;
  if (s === "cancelled") return T.red;
  return T.muted; // completed
}

type Sub = any;

export default function SubscribersView({ subs }: { subs: Sub[] }) {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState(""); // "", "digital", "physical"
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = subs.reduce((m: Record<string, number>, s) => { m[s.status] = (m[s.status] || 0) + 1; return m; }, {});

  const filtered = subs.filter((s) => {
    if (status && s.status !== status) return false;
    if (kind === "digital" && !s.isDigital) return false;
    if (kind === "physical" && s.isDigital) return false;
    if (q) {
      const hay = `${s.user?.name ?? ""} ${s.user?.email ?? ""} ${s.user?.phone ?? ""} ${s.mealPlan?.displayName ?? ""}`.toLowerCase();
      if (!hay.includes(q.toLowerCase())) return false;
    }
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Subscribers</h1>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 16 }}>
        {subs.length} active-plan records ·{" "}
        <span style={{ color: T.accent }}>{counts["active"] || 0} active</span>
        {counts["paused"] ? <> · <span style={{ color: T.amber }}>{counts["paused"]} paused</span></> : null}
        {counts["completed"] ? <> · {counts["completed"]} completed</> : null}
        {counts["cancelled"] ? <> · <span style={{ color: T.red }}>{counts["cancelled"]} cancelled</span></> : null}
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, phone, plan…" style={{ ...inputStyle, flex: 1, minWidth: 240 }} />
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          {["", "active", "paused", "completed", "cancelled"].map((s) => <option key={s} value={s}>{s === "" ? "All statuses" : s}</option>)}
        </select>
        <select value={kind} onChange={(e) => setKind(e.target.value)} style={{ ...inputStyle, cursor: "pointer" }}>
          <option value="">All types</option>
          <option value="physical">Meal delivery</option>
          <option value="digital">Digital plan</option>
        </select>
      </div>

      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1.4fr 0.8fr 1.3fr 0.8fr 0.5fr", gap: 8, padding: "10px 14px", background: "#161616", fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
          <div>Customer</div><div>Plan</div><div>Status</div><div>Window</div><div>Day</div><div></div>
        </div>
        {filtered.length === 0 && <div style={{ padding: 20, color: T.muted, fontSize: 13 }}>No subscribers match.</div>}
        {filtered.map((s, i) => (
          <div key={s.id}>
            <div
              onClick={() => setExpanded(expanded === s.id ? null : s.id)}
              style={{ display: "grid", gridTemplateColumns: "1.6fr 1.4fr 0.8fr 1.3fr 0.8fr 0.5fr", gap: 8, padding: "11px 14px", borderTop: i ? `1px solid ${T.border}` : "none", background: T.card, alignItems: "center", cursor: "pointer", fontSize: 13 }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ color: T.text }}>{s.user?.name ?? "—"}</div>
                <div style={{ color: T.muted, fontSize: 11, overflow: "hidden", textOverflow: "ellipsis" }}>{s.user?.email}</div>
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ color: T.text }}>{s.mealPlan?.displayName ?? "—"}</div>
                <div style={{ color: T.muted, fontSize: 11 }}>{s.isDigital ? "digital" : "meal delivery"}{s.mealsPerDay ? ` · ${pretty(s.mealsPerDay)}` : ""}</div>
              </div>
              <div style={{ color: statusColor(s.status), fontWeight: 600 }}>{s.status}</div>
              <div style={{ color: T.muted }}>{d(s.startDate)} → {d(s.endDate)}</div>
              <div style={{ color: T.muted }}>{s.isDigital ? "—" : `Day ${s.currentDay}`}</div>
              <div style={{ color: T.muted, textAlign: "right" }}>{expanded === s.id ? "▲" : "▼"}</div>
            </div>
            {expanded === s.id && (
              <div style={{ padding: "14px 18px", borderTop: `1px solid ${T.border}`, background: T.soft, fontSize: 13 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
                  <div>
                    <Cap>Plan</Cap>
                    <div style={{ color: T.text }}>{s.mealPlan?.displayName} <span style={{ color: T.muted }}>(/{s.mealPlan?.slug})</span></div>
                    <div style={{ color: T.muted, marginTop: 3 }}>{s.duration ? pretty(s.duration) : "—"} · {s.mealsPerDay ? pretty(s.mealsPerDay) : "—"} · bundle {pretty(s.bundle)}</div>
                    {!s.isDigital && <div style={{ color: T.muted, marginTop: 3 }}>Delivery window: {pretty(s.deliveryWindow)}</div>}
                    <Cap>Contact</Cap>
                    <div style={{ color: T.muted }}>{s.user?.phone ?? "—"} · {s.user?.email}</div>
                  </div>
                  <div>
                    <Cap>Targets (personalised)</Cap>
                    {s.calorieTarget || s.proteinTarget ? (
                      <div style={{ color: T.muted }}>{s.calorieTarget ?? "—"} kcal · P {s.proteinTarget ?? "—"} · C {s.carbTarget ?? "—"} · F {s.fatTarget ?? "—"}</div>
                    ) : <div style={{ color: T.muted }}>Using plan defaults</div>}
                    <Cap>Linked order</Cap>
                    <div style={{ color: T.muted, fontFamily: "ui-monospace, monospace", fontSize: 12 }}>{s.orderId ?? "—"}</div>
                    <Cap>Created</Cap>
                    <div style={{ color: T.muted }}>{d(s.createdAt)}</div>
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

const Cap = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: T.accent, fontWeight: 700, margin: "10px 0 5px" }}>{children}</div>;
