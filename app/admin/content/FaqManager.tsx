"use client";

// app/admin/content/FaqManager.tsx
import { useState } from "react";
import { UI, Label, Text, Area, Check, btn, contentApi } from "./ContentClient";

type Faq = any;

function blank() {
  return { category: "", question: "", answerHtml: "", sortOrder: 0, isActive: true };
}
function toForm(f: Faq) {
  return {
    category: f.category ?? "",
    question: f.question ?? "",
    answerHtml: f.answerHtml ?? "",
    sortOrder: f.sortOrder ?? 0,
    isActive: f.isActive !== false,
  };
}

export default function FaqManager({ initial }: { initial: Faq[] }) {
  const [items, setItems] = useState<Faq[]>(initial);
  const [editing, setEditing] = useState<null | "new" | string>(null);
  const [form, setForm] = useState<any>(blank());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  function startNew() { setForm(blank()); setEditing("new"); setErr(null); }
  function startEdit(f: Faq) { setForm(toForm(f)); setEditing(f.id); setErr(null); }
  function close() { setEditing(null); setErr(null); }

  async function save() {
    setBusy(true); setErr(null);
    try {
      const action = editing === "new" ? "create" : "update";
      const id = editing === "new" ? null : (editing as string);
      const { record } = await contentApi("faq", action, id, form);
      setItems((prev) => action === "create" ? [...prev, record] : prev.map((f) => (f.id === record.id ? record : f)));
      close();
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setBusy(false); }
  }
  async function remove(f: Faq) {
    if (!confirm("Delete this FAQ?")) return;
    try { await contentApi("faq", "delete", f.id, null); setItems((p) => p.filter((x) => x.id !== f.id)); }
    catch (e: any) { alert(e?.message || "Delete failed"); }
  }

  if (editing) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing === "new" ? "New FAQ" : "Edit FAQ"}</h2>
          <button onClick={close} style={btn()}>← Back</button>
        </div>
        {err && <div style={{ color: UI.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><Label>Category</Label><Text list="faq-cats" value={form.category} onChange={(e) => set("category", e.target.value)} placeholder="Delivery & Areas" /></div>
          <div><Label>Sort order</Label><Text type="number" value={form.sortOrder} onChange={(e) => set("sortOrder", e.target.value)} /></div>
          <datalist id="faq-cats">
            {["Delivery & Areas", "Plans & Menu", "Tracking", "Dietary & Allergens", "Pricing & Payment", "Account & Subscription"].map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div style={{ marginBottom: 14 }}><Label>Question</Label><Text value={form.question} onChange={(e) => set("question", e.target.value)} /></div>
        <div style={{ marginBottom: 14 }}>
          <Label>Answer (light HTML — links allowed)</Label>
          <Area rows={5} value={form.answerHtml} onChange={(e) => set("answerHtml", e.target.value)} placeholder="Plain text or simple HTML with <a href='/...'>links</a>." />
        </div>
        <div style={{ marginBottom: 16 }}><Check checked={form.isActive} onChange={(v) => set("isActive", v)} label="Active (visible on /faq)" /></div>
        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save FAQ"}</button>
          <button onClick={close} style={btn()}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={startNew} style={btn(true)}>+ New FAQ</button>
      </div>
      {items.length === 0 ? (
        <div style={{ border: `1px solid ${UI.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: UI.muted }}>No FAQs yet.</div>
      ) : (
        <div style={{ border: `1px solid ${UI.border}`, borderRadius: 12, overflow: "hidden" }}>
          {items.map((f, i) => (
            <div key={f.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderTop: i ? `1px solid ${UI.border}` : "none", background: UI.card }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: UI.text }}>
                  {f.question}{!f.isActive && <span style={{ color: "#facc15", fontSize: 11 }}> · hidden</span>}
                </div>
                <div style={{ fontSize: 12, color: UI.muted, marginTop: 2 }}>{f.category} · #{f.sortOrder}</div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(f)} style={btn()}>Edit</button>
                <button onClick={() => remove(f)} style={{ ...btn(), color: UI.danger, borderColor: "#3a1c1c" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
