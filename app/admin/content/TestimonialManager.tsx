"use client";

// app/admin/content/TestimonialManager.tsx
import { useState } from "react";
import { UI, Label, Text, Area, Select, Check, btn, contentApi } from "./ContentClient";

type Tst = any;

const GOALS = [
  { v: "", l: "— none —" },
  { v: "weight_loss", l: "Weight loss" },
  { v: "muscle_gain", l: "Muscle gain" },
  { v: "balanced", l: "Balanced" },
  { v: "office", l: "Office" },
];

function blank() {
  return { name: "", location: "", planLabel: "", goal: "", resultLabel: "", rating: 5, quote: "", avatarUrl: "", isFeatured: false, isActive: true, sortOrder: 0 };
}
function toForm(t: Tst) {
  return {
    name: t.name ?? "", location: t.location ?? "", planLabel: t.planLabel ?? "",
    goal: t.goal ?? "", resultLabel: t.resultLabel ?? "", rating: t.rating ?? 5,
    quote: t.quote ?? "", avatarUrl: t.avatarUrl ?? "", isFeatured: !!t.isFeatured,
    isActive: t.isActive !== false, sortOrder: t.sortOrder ?? 0,
  };
}

export default function TestimonialManager({ initial }: { initial: Tst[] }) {
  const [items, setItems] = useState<Tst[]>(initial);
  const [editing, setEditing] = useState<null | "new" | string>(null);
  const [form, setForm] = useState<any>(blank());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  function startNew() { setForm(blank()); setEditing("new"); setErr(null); }
  function startEdit(t: Tst) { setForm(toForm(t)); setEditing(t.id); setErr(null); }
  function close() { setEditing(null); setErr(null); }

  async function save() {
    setBusy(true); setErr(null);
    try {
      const action = editing === "new" ? "create" : "update";
      const id = editing === "new" ? null : (editing as string);
      const { record } = await contentApi("testimonial", action, id, form);
      setItems((prev) => action === "create" ? [...prev, record] : prev.map((t) => (t.id === record.id ? record : t)));
      close();
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setBusy(false); }
  }
  async function remove(t: Tst) {
    if (!confirm(`Delete ${t.name}'s testimonial?`)) return;
    try { await contentApi("testimonial", "delete", t.id, null); setItems((p) => p.filter((x) => x.id !== t.id)); }
    catch (e: any) { alert(e?.message || "Delete failed"); }
  }

  if (editing) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing === "new" ? "New testimonial" : "Edit testimonial"}</h2>
          <button onClick={close} style={btn()}>← Back</button>
        </div>
        {err && <div style={{ color: UI.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><Label>Name</Label><Text value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Rahul M." /></div>
          <div><Label>Location</Label><Text value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="Kharadi" /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><Label>Plan label</Label><Text value={form.planLabel} onChange={(e) => set("planLabel", e.target.value)} placeholder="Weight Loss · 1 Month" /></div>
          <div><Label>Result label</Label><Text value={form.resultLabel} onChange={(e) => set("resultLabel", e.target.value)} placeholder="-4kg in 15 days" /></div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <Label>Goal tag</Label>
            <Select value={form.goal} onChange={(e) => set("goal", e.target.value)}>
              {GOALS.map((g) => <option key={g.v} value={g.v}>{g.l}</option>)}
            </Select>
          </div>
          <div>
            <Label>Rating</Label>
            <Select value={form.rating} onChange={(e) => set("rating", Number(e.target.value))}>
              {[5, 4, 3, 2, 1].map((n) => <option key={n} value={n}>{n} ★</option>)}
            </Select>
          </div>
          <div><Label>Sort order</Label><Text type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} /></div>
        </div>
        <div style={{ marginBottom: 14 }}><Label>Quote</Label><Area rows={4} value={form.quote} onChange={(e) => set("quote", e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}><Label>Avatar URL (optional)</Label><Text value={form.avatarUrl} onChange={(e) => set("avatarUrl", e.target.value)} placeholder="https://…" /></div>
        <div style={{ display: "flex", gap: 18, marginBottom: 16 }}>
          <Check checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} label="Featured (homepage candidate)" />
          <Check checked={form.isActive} onChange={(v) => set("isActive", v)} label="Active (visible on /testimonials)" />
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save"}</button>
          <button onClick={close} style={btn()}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={startNew} style={btn(true)}>+ New testimonial</button>
      </div>
      {items.length === 0 ? (
        <div style={{ border: `1px solid ${UI.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: UI.muted }}>No testimonials yet.</div>
      ) : (
        <div style={{ border: `1px solid ${UI.border}`, borderRadius: 12, overflow: "hidden" }}>
          {items.map((t, i) => (
            <div key={t.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderTop: i ? `1px solid ${UI.border}` : "none", background: UI.card }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: UI.text }}>
                  {t.name} <span style={{ color: UI.accent, fontSize: 12 }}>{"★".repeat(t.rating)}</span>
                  {t.isFeatured && <span style={{ color: UI.accent, fontSize: 11 }}> · featured</span>}
                  {!t.isActive && <span style={{ color: "#facc15", fontSize: 11 }}> · hidden</span>}
                </div>
                <div style={{ fontSize: 12, color: UI.muted, marginTop: 2 }}>{t.location} · {t.resultLabel} · {t.planLabel}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(t)} style={btn()}>Edit</button>
                <button onClick={() => remove(t)} style={{ ...btn(), color: UI.danger, borderColor: "#3a1c1c" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
