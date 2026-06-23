// app/admin/coupons/CouponsClient.tsx
// R-PRICE-c (#193) — coupon management UI. Create / toggle / delete + live list.
"use client";

import { useEffect, useState, useCallback } from "react";

const T = {
  bg: "#0a0a0a", card: "#111", border: "#1f1f1f", accent: "#84cc16",
  text: "#fff", dim: "#a3a3a3", muted: "#737373", danger: "#ef4444",
};

const fmt = (n: number) => "\u20B9" + n.toLocaleString("en-IN");

type Coupon = {
  id: string; code: string; discountType: "PERCENT" | "FLAT" | "FREE_DELIVERY";
  value: number; maxDiscountRs: number | null; minOrderRs: number | null;
  appliesTo: string; firstOrderOnly: boolean; usageLimitGlobal: number | null;
  usageLimitPerUser: number | null; validUntil: string | null; stackable: boolean;
  source: string; isActive: boolean; redemptions: number;
};

const EMPTY = {
  code: "", discountType: "PERCENT" as Coupon["discountType"], value: "",
  maxDiscountRs: "", minOrderRs: "", appliesTo: "ALL", firstOrderOnly: false,
  usageLimitGlobal: "", usageLimitPerUser: "1", validUntil: "", stackable: false,
};

const inputStyle: React.CSSProperties = {
  background: "#161616", border: `1px solid ${T.border}`, borderRadius: 8,
  padding: "9px 12px", color: T.text, fontSize: 13, outline: "none", width: "100%", boxSizing: "border-box",
};
const labelStyle: React.CSSProperties = {
  fontSize: 11, fontWeight: 600, color: T.dim, textTransform: "uppercase",
  letterSpacing: "0.05em", marginBottom: 4, display: "block",
};

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<typeof EMPTY>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ kind: "ok" | "err"; text: string } | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/coupons");
      const d = await r.json();
      setCoupons(d.coupons ?? []);
    } catch {
      setMsg({ kind: "err", text: "Failed to load coupons." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  function set<K extends keyof typeof EMPTY>(k: K, v: (typeof EMPTY)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function post(payload: Record<string, unknown>) {
    const r = await fetch("/api/admin/coupons", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const d = await r.json();
    if (!r.ok) throw new Error(d.error || "Request failed");
    return d;
  }

  async function create() {
    setSaving(true); setMsg(null);
    try {
      await post({ action: "create", ...form });
      setMsg({ kind: "ok", text: `Coupon ${form.code.toUpperCase()} created.` });
      setForm(EMPTY);
      await load();
    } catch (e: any) {
      setMsg({ kind: "err", text: e.message });
    } finally {
      setSaving(false);
    }
  }

  async function toggle(id: string) {
    try { await post({ action: "toggle", id }); await load(); }
    catch (e: any) { setMsg({ kind: "err", text: e.message }); }
  }

  async function remove(id: string, code: string) {
    if (!confirm(`Delete coupon ${code}? (If it has redemptions it will be deactivated instead.)`)) return;
    try {
      const d = await post({ action: "delete", id });
      setMsg({ kind: "ok", text: d.deactivated ? `${code} had redemptions — deactivated.` : `${code} deleted.` });
      await load();
    } catch (e: any) { setMsg({ kind: "err", text: e.message }); }
  }

  function describe(c: Coupon): string {
    if (c.discountType === "PERCENT") return `${c.value}% off` + (c.maxDiscountRs ? ` (max ${fmt(c.maxDiscountRs)})` : "");
    if (c.discountType === "FLAT") return `${fmt(c.value)} off`;
    return "Free delivery";
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, padding: "24px 20px" }}>
      <div style={{ maxWidth: 1000, margin: "0 auto" }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 4 }}>Coupons</h1>
        <p style={{ fontSize: 13, color: T.muted, marginBottom: 24 }}>
          Create and manage discount codes. Codes are validated live at checkout via the coupon engine.
        </p>

        {msg && (
          <div style={{
            background: msg.kind === "ok" ? "rgba(132,204,22,0.08)" : "rgba(239,68,68,0.08)",
            border: `1px solid ${msg.kind === "ok" ? "rgba(132,204,22,0.3)" : "rgba(239,68,68,0.3)"}`,
            color: msg.kind === "ok" ? T.accent : T.danger,
            borderRadius: 10, padding: "10px 14px", fontSize: 13, marginBottom: 18,
          }}>{msg.text}</div>
        )}

        {/* Create form */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 20, marginBottom: 28 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>New coupon</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 14 }}>
            <div>
              <label style={labelStyle}>Code</label>
              <input style={inputStyle} value={form.code} placeholder="LAUNCH20"
                onChange={(e) => set("code", e.target.value.toUpperCase())} maxLength={40} />
            </div>
            <div>
              <label style={labelStyle}>Type</label>
              <select style={inputStyle} value={form.discountType}
                onChange={(e) => set("discountType", e.target.value as Coupon["discountType"])}>
                <option value="PERCENT">Percent %</option>
                <option value="FLAT">Flat ₹</option>
                <option value="FREE_DELIVERY">Free delivery</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>{form.discountType === "PERCENT" ? "Percent" : "Amount ₹"}</label>
              <input style={inputStyle} type="number" value={form.value}
                disabled={form.discountType === "FREE_DELIVERY"}
                onChange={(e) => set("value", e.target.value)} placeholder={form.discountType === "PERCENT" ? "20" : "500"} />
            </div>
            <div>
              <label style={labelStyle}>Max discount ₹</label>
              <input style={inputStyle} type="number" value={form.maxDiscountRs}
                onChange={(e) => set("maxDiscountRs", e.target.value)} placeholder="optional" />
            </div>
            <div>
              <label style={labelStyle}>Min order ₹</label>
              <input style={inputStyle} type="number" value={form.minOrderRs}
                onChange={(e) => set("minOrderRs", e.target.value)} placeholder="optional" />
            </div>
            <div>
              <label style={labelStyle}>Applies to</label>
              <select style={inputStyle} value={form.appliesTo} onChange={(e) => set("appliesTo", e.target.value)}>
                <option value="ALL">All</option>
                <option value="PHYSICAL">Physical</option>
                <option value="DIGITAL">Digital</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Per-user limit</label>
              <input style={inputStyle} type="number" value={form.usageLimitPerUser}
                onChange={(e) => set("usageLimitPerUser", e.target.value)} placeholder="1" />
            </div>
            <div>
              <label style={labelStyle}>Global limit</label>
              <input style={inputStyle} type="number" value={form.usageLimitGlobal}
                onChange={(e) => set("usageLimitGlobal", e.target.value)} placeholder="optional" />
            </div>
            <div>
              <label style={labelStyle}>Valid until</label>
              <input style={inputStyle} type="date" value={form.validUntil}
                onChange={(e) => set("validUntil", e.target.value)} />
            </div>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.dim, alignSelf: "end", paddingBottom: 9 }}>
              <input type="checkbox" checked={form.firstOrderOnly} onChange={(e) => set("firstOrderOnly", e.target.checked)} style={{ accentColor: T.accent }} />
              First order only
            </label>
            <label style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.dim, alignSelf: "end", paddingBottom: 9 }}>
              <input type="checkbox" checked={form.stackable} onChange={(e) => set("stackable", e.target.checked)} style={{ accentColor: T.accent }} />
              Stackable
            </label>
            <div style={{ alignSelf: "end" }}>
              <button onClick={create} disabled={saving || !form.code}
                style={{
                  width: "100%", background: saving || !form.code ? "rgba(132,204,22,0.4)" : T.accent,
                  color: "#000", fontWeight: 800, fontSize: 13, padding: "10px 0", borderRadius: 8,
                  border: "none", cursor: saving || !form.code ? "not-allowed" : "pointer",
                }}>
                {saving ? "Creating..." : "Create coupon"}
              </button>
            </div>
          </div>
        </div>

        {/* List */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, overflow: "hidden" }}>
          {loading ? (
            <div style={{ padding: 24, color: T.muted, fontSize: 13 }}>Loading…</div>
          ) : coupons.length === 0 ? (
            <div style={{ padding: 24, color: T.muted, fontSize: 13 }}>No coupons yet. Create one above.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ color: T.muted, textAlign: "left", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  <th style={{ padding: "12px 16px" }}>Code</th>
                  <th style={{ padding: "12px 16px" }}>Discount</th>
                  <th style={{ padding: "12px 16px" }}>Scope</th>
                  <th style={{ padding: "12px 16px" }}>Used</th>
                  <th style={{ padding: "12px 16px" }}>Status</th>
                  <th style={{ padding: "12px 16px" }}></th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} style={{ borderTop: `1px solid ${T.border}` }}>
                    <td style={{ padding: "12px 16px", fontWeight: 700, fontFamily: "monospace" }}>
                      {c.code}
                      {c.firstOrderOnly && <span style={{ marginLeft: 6, fontSize: 10, color: T.muted }}>1st</span>}
                    </td>
                    <td style={{ padding: "12px 16px", color: T.dim }}>
                      {describe(c)}
                      {c.minOrderRs ? <span style={{ color: T.muted }}> · min {fmt(c.minOrderRs)}</span> : null}
                    </td>
                    <td style={{ padding: "12px 16px", color: T.muted }}>{c.appliesTo}</td>
                    <td style={{ padding: "12px 16px", color: T.muted }}>
                      {c.redemptions}{c.usageLimitGlobal ? ` / ${c.usageLimitGlobal}` : ""}
                    </td>
                    <td style={{ padding: "12px 16px" }}>
                      <button onClick={() => toggle(c.id)} style={{
                        background: c.isActive ? "rgba(132,204,22,0.12)" : "rgba(115,115,115,0.15)",
                        color: c.isActive ? T.accent : T.muted, border: "none", borderRadius: 6,
                        padding: "4px 10px", fontSize: 12, fontWeight: 700, cursor: "pointer",
                      }}>{c.isActive ? "Active" : "Inactive"}</button>
                    </td>
                    <td style={{ padding: "12px 16px", textAlign: "right" }}>
                      <button onClick={() => remove(c.id, c.code)} style={{
                        background: "transparent", color: T.danger, border: `1px solid rgba(239,68,68,0.3)`,
                        borderRadius: 6, padding: "4px 10px", fontSize: 12, cursor: "pointer",
                      }}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
