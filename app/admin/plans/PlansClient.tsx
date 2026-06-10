"use client";

// app/admin/plans/PlansClient.tsx
// Phase 15E-1 — plans + pricing manager.

import { useState } from "react";

const T = {
  card: "#101010", border: "#222", text: "#ffffff", muted: "#888888",
  accent: "#84cc16", soft: "#0c0c0c", danger: "#f87171", amber: "#facc15",
};
const inputStyle: React.CSSProperties = {
  width: "100%", background: T.soft, color: T.text, border: `1px solid ${T.border}`,
  borderRadius: 8, padding: "9px 11px", fontSize: 13.5, fontFamily: "inherit", boxSizing: "border-box",
};
const Text = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} style={{ ...inputStyle, ...(p.style || {}) }} />;
const Area = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} style={{ ...inputStyle, resize: "vertical", ...(p.style || {}) }} />;
const Label = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 12, color: T.muted, marginBottom: 5, fontWeight: 600 }}>{children}</div>;
const Check = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5, color: T.text }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: T.accent }} />
    {label}
  </label>
);
const btn = (primary = false): React.CSSProperties => ({
  background: primary ? T.accent : "transparent", color: primary ? "#080808" : T.text,
  border: `1px solid ${primary ? T.accent : T.border}`, borderRadius: 8, padding: "8px 15px",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
});
const pretty = (e: string) => (e || "").replace(/_/g, " ").toLowerCase();
const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 22 }}>
    <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: T.accent, fontWeight: 700, marginBottom: 12 }}>{title}</div>
    {children}
  </div>
);

async function api(action: string, id: string, data: any) {
  const res = await fetch("/api/admin/plans", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, id, data }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Save failed");
  return j;
}

type Plan = any;

function toForm(p: Plan) {
  return {
    displayName: p.displayName ?? "", tagline: p.tagline ?? "", description: p.description ?? "",
    longDescription: p.longDescription ?? "", whoIsItFor: p.whoIsItFor ?? "",
    keyPrinciples: (p.keyPrinciples ?? []).join("\n"), whatIsAvoided: (p.whatIsAvoided ?? []).join("\n"),
    avgCaloriesPerDay: p.avgCaloriesPerDay ?? 0, avgProteinGrams: p.avgProteinGrams ?? 0,
    avgCarbsGrams: p.avgCarbsGrams ?? 0, avgFatGrams: p.avgFatGrams ?? 0,
    nutritionistName: p.nutritionistName ?? "", nutritionistCred: p.nutritionistCred ?? "",
    nutritionistBio: p.nutritionistBio ?? "", medicalDisclaimer: p.medicalDisclaimer ?? "",
    isActive: !!p.isActive, isFeatured: !!p.isFeatured, sortOrder: p.sortOrder ?? 0,
    imageUrl: p.imageUrl ?? "", accentColor: p.accentColor ?? "",
  };
}

export default function PlansClient({ initial }: { initial: Plan[] }) {
  const [plans, setPlans] = useState<Plan[]>(initial);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<any>({});
  const [prices, setPrices] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savedFlash, setSavedFlash] = useState(false);

  const current = plans.find((p) => p.id === editing);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  function startEdit(p: Plan) {
    setForm(toForm(p));
    setPrices(p.planPrices ?? []);
    setEditing(p.id);
    setErr(null);
  }
  function close() { setEditing(null); setErr(null); }

  async function savePlan() {
    if (!current) return;
    setBusy(true); setErr(null);
    try {
      const { record } = await api("updatePlan", current.id, form);
      setPlans((prev) => prev.map((p) => (p.id === record.id ? { ...p, ...record } : p)));
      setSavedFlash(true); setTimeout(() => setSavedFlash(false), 1800);
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setBusy(false); }
  }

  async function quickToggle(p: Plan, field: "isActive" | "isFeatured") {
    try {
      const data = { ...toForm(p), [field]: !p[field] };
      const { record } = await api("updatePlan", p.id, data);
      setPlans((prev) => prev.map((x) => (x.id === record.id ? { ...x, ...record } : x)));
    } catch (e: any) { alert(e?.message || "Failed"); }
  }

  // ── EDIT VIEW ──
  if (current) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800 }}>{current.displayName}</h2>
          <button onClick={close} style={btn()}>← All plans</button>
        </div>
        <div style={{ fontSize: 12.5, color: T.muted, marginBottom: 20 }}>
          /{current.slug} · {pretty(current.category)} · {pretty(current.tier)} · {pretty(current.dietaryVariant)} · {current.cycleLengthDays}-day cycle · {current.mealsPerDay} meals/day
          <span style={{ color: T.muted }}> (structural fields aren&rsquo;t editable here)</span>
        </div>
        {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <Section title="Status & ordering">
          <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
            <Check checked={form.isActive} onChange={(v) => set("isActive", v)} label="Active (sellable — shows on site)" />
            <Check checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} label="Featured" />
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: T.muted }}>Sort order</span>
              <Text type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} style={{ width: 90 }} />
            </div>
          </div>
        </Section>

        <Section title="Sales copy">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><Label>Display name</Label><Text value={form.displayName} onChange={(e) => set("displayName", e.target.value)} /></div>
            <div><Label>Tagline</Label><Text value={form.tagline} onChange={(e) => set("tagline", e.target.value)} /></div>
          </div>
          <div style={{ marginBottom: 14 }}><Label>Short description</Label><Area rows={2} value={form.description} onChange={(e) => set("description", e.target.value)} /></div>
          <div style={{ marginBottom: 14 }}><Label>Long description (sales page)</Label><Area rows={5} value={form.longDescription} onChange={(e) => set("longDescription", e.target.value)} /></div>
          <div style={{ marginBottom: 14 }}><Label>Who is it for</Label><Area rows={2} value={form.whoIsItFor} onChange={(e) => set("whoIsItFor", e.target.value)} /></div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><Label>Key principles (one per line)</Label><Area rows={5} value={form.keyPrinciples} onChange={(e) => set("keyPrinciples", e.target.value)} /></div>
            <div><Label>What&rsquo;s avoided (one per line)</Label><Area rows={5} value={form.whatIsAvoided} onChange={(e) => set("whatIsAvoided", e.target.value)} /></div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
            <div><Label>Image URL</Label><Text value={form.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" /></div>
            <div><Label>Accent color (hex)</Label><Text value={form.accentColor} onChange={(e) => set("accentColor", e.target.value)} placeholder="#84cc16" /></div>
          </div>
        </Section>

        <Section title="Average macros / day">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14 }}>
            <div><Label>Calories</Label><Text type="number" value={form.avgCaloriesPerDay} onChange={(e) => set("avgCaloriesPerDay", e.target.value)} /></div>
            <div><Label>Protein (g)</Label><Text type="number" value={form.avgProteinGrams} onChange={(e) => set("avgProteinGrams", e.target.value)} /></div>
            <div><Label>Carbs (g)</Label><Text type="number" value={form.avgCarbsGrams} onChange={(e) => set("avgCarbsGrams", e.target.value)} /></div>
            <div><Label>Fat (g)</Label><Text type="number" value={form.avgFatGrams} onChange={(e) => set("avgFatGrams", e.target.value)} /></div>
          </div>
        </Section>

        <Section title="Nutritionist & disclaimer">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
            <div><Label>Nutritionist name</Label><Text value={form.nutritionistName} onChange={(e) => set("nutritionistName", e.target.value)} /></div>
            <div><Label>Credentials</Label><Text value={form.nutritionistCred} onChange={(e) => set("nutritionistCred", e.target.value)} placeholder="MSc Nutrition, RD" /></div>
          </div>
          <div style={{ marginBottom: 14 }}><Label>Nutritionist bio</Label><Area rows={2} value={form.nutritionistBio} onChange={(e) => set("nutritionistBio", e.target.value)} /></div>
          <div><Label>Medical disclaimer (lifestyle/medical plans)</Label><Area rows={2} value={form.medicalDisclaimer} onChange={(e) => set("medicalDisclaimer", e.target.value)} /></div>
        </Section>

        <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 30 }}>
          <button onClick={savePlan} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save plan"}</button>
          <button onClick={close} style={btn()}>Done</button>
          {savedFlash && <span style={{ color: T.accent, fontSize: 13 }}>✓ Saved</span>}
        </div>

        {/* Pricing */}
        <Section title="Pricing">
          {prices.length === 0 ? (
            <div style={{ color: T.muted, fontSize: 13 }}>No price rows linked to this plan.</div>
          ) : (
            <PriceTable rows={prices} onRowSaved={(r) => setPrices((prev) => prev.map((x) => (x.id === r.id ? { ...x, ...r } : x)))} />
          )}
        </Section>
      </div>
    );
  }

  // ── LIST VIEW ──
  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Plans &amp; pricing</h1>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 20 }}>
        Toggle a plan Active to sell it. Edit copy, macros and prices. Showing {plans.length} plans.
      </p>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
        {plans.map((p, idx) => (
          <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderTop: idx ? `1px solid ${T.border}` : "none", background: T.card }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text }}>
                {p.displayName}
                {p.isFeatured && <span style={{ color: T.accent, fontSize: 11 }}> · ★</span>}
              </div>
              <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                /{p.slug} · {pretty(p.tier)} · {pretty(p.dietaryVariant)} · {(p.planPrices ?? []).length} prices
              </div>
            </div>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexShrink: 0 }}>
              <button
                onClick={() => quickToggle(p, "isActive")}
                style={{ ...btn(p.isActive), padding: "6px 11px", fontSize: 12, background: p.isActive ? T.accent : "transparent", color: p.isActive ? "#080808" : T.amber, borderColor: p.isActive ? T.accent : "#5c4a12" }}
                title="Toggle sellable"
              >
                {p.isActive ? "Active" : "Hidden"}
              </button>
              <button onClick={() => startEdit(p)} style={btn()}>Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PriceTable({ rows, onRowSaved }: { rows: any[]; onRowSaved: (r: any) => void }) {
  return (
    <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.9fr 0.9fr 0.7fr 0.8fr", gap: 8, padding: "10px 12px", background: "#161616", fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
        <div>Plan / bundle</div><div>Duration</div><div>Meals</div><div>Price ₹</div><div>MRP ₹</div><div>GST %</div><div>Active</div>
      </div>
      {rows.map((r, i) => <PriceRow key={r.id} row={r} top={i > 0} onSaved={onRowSaved} />)}
    </div>
  );
}

function PriceRow({ row, top, onSaved }: { row: any; top: boolean; onSaved: (r: any) => void }) {
  const [priceRs, setPriceRs] = useState(row.priceRs ?? 0);
  const [mrpRs, setMrpRs] = useState(row.mrpRs ?? "");
  const [gstPercent, setGst] = useState(row.gstPercent ?? 5);
  const [isActive, setActive] = useState(row.isActive !== false);
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);

  const dirty =
    Number(priceRs) !== Number(row.priceRs) ||
    String(mrpRs) !== String(row.mrpRs ?? "") ||
    Number(gstPercent) !== Number(row.gstPercent) ||
    isActive !== (row.isActive !== false);

  async function save() {
    setBusy(true);
    try {
      const { record } = await api("updatePrice", row.id, { priceRs, mrpRs, gstPercent, isActive });
      onSaved(record);
      setOk(true); setTimeout(() => setOk(false), 1500);
    } catch (e: any) { alert(e?.message || "Failed"); }
    finally { setBusy(false); }
  }

  const cell: React.CSSProperties = { ...inputStyle, padding: "6px 8px", fontSize: 12.5 };
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 0.9fr 0.9fr 0.7fr 0.8fr", gap: 8, padding: "9px 12px", borderTop: top ? `1px solid ${T.border}` : "none", background: T.card, alignItems: "center" }}>
      <div style={{ fontSize: 12, color: T.text }}>
        {pretty(row.bundle)}{row.isDigital ? " · digital" : ""}
        <div style={{ color: T.muted, fontSize: 11 }}>{pretty(row.diet)}</div>
      </div>
      <div style={{ fontSize: 12, color: T.muted }}>{pretty(row.duration)}</div>
      <div style={{ fontSize: 12, color: T.muted }}>{pretty(row.mealsPerDay)}</div>
      <input value={priceRs} onChange={(e) => setPriceRs(e.target.value as any)} style={cell} />
      <input value={mrpRs} onChange={(e) => setMrpRs(e.target.value as any)} placeholder="—" style={cell} />
      <input value={gstPercent} onChange={(e) => setGst(e.target.value as any)} style={cell} />
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <input type="checkbox" checked={isActive} onChange={(e) => setActive(e.target.checked)} style={{ accentColor: T.accent }} />
        {dirty && <button onClick={save} disabled={busy} style={{ ...btn(true), padding: "4px 8px", fontSize: 11 }}>{busy ? "…" : "Save"}</button>}
        {ok && <span style={{ color: T.accent, fontSize: 12 }}>✓</span>}
      </div>
    </div>
  );
}
