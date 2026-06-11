"use client";

// app/admin/content/BlogManager.tsx
import { useState } from "react";
import { UI, Label, Text, Area, Select, Check, btn, contentApi } from "./ContentClient";
import ImageUpload from "@/components/ImageUpload";

const CATEGORIES = ["Nutrition", "Training", "Recipes", "FitFuel News", "Guides"];

type Post = any;

function blank() {
  return {
    title: "",
    slug: "",
    excerpt: "",
    category: "Guides",
    tags: "",
    authorName: "Team FitFuel",
    readMinutes: 5,
    status: "PUBLISHED",
    isFeatured: false,
    coverImageUrl: "",
    contentHtml: "",
  };
}

function toForm(p: Post) {
  return {
    title: p.title ?? "",
    slug: p.slug ?? "",
    excerpt: p.excerpt ?? "",
    category: p.category ?? "Guides",
    tags: Array.isArray(p.tags) ? p.tags.join(", ") : "",
    authorName: p.authorName ?? "Team FitFuel",
    readMinutes: p.readMinutes ?? 5,
    status: p.status ?? "PUBLISHED",
    isFeatured: !!p.isFeatured,
    coverImageUrl: p.coverImageUrl ?? "",
    contentHtml: p.contentHtml ?? "",
  };
}

export default function BlogManager({ initial }: { initial: Post[] }) {
  const [items, setItems] = useState<Post[]>(initial);
  const [editing, setEditing] = useState<null | "new" | string>(null);
  const [form, setForm] = useState<any>(blank());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  function startNew() { setForm(blank()); setEditing("new"); setErr(null); }
  function startEdit(p: Post) { setForm(toForm(p)); setEditing(p.id); setErr(null); }
  function close() { setEditing(null); setErr(null); }
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save() {
    setBusy(true); setErr(null);
    try {
      const data = { ...form, tags: form.tags.split(",").map((t: string) => t.trim()).filter(Boolean) };
      const action = editing === "new" ? "create" : "update";
      const id = editing === "new" ? null : (editing as string);
      const { record } = await contentApi("blog", action, id, data);
      setItems((prev) => action === "create" ? [record, ...prev] : prev.map((p) => (p.id === record.id ? record : p)));
      close();
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setBusy(false); }
  }

  async function remove(p: Post) {
    if (!confirm(`Delete "${p.title}"? This can't be undone.`)) return;
    try {
      await contentApi("blog", "delete", p.id, null);
      setItems((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e: any) { alert(e?.message || "Delete failed"); }
  }

  if (editing) {
    return (
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>{editing === "new" ? "New post" : "Edit post"}</h2>
          <button onClick={close} style={btn()}>← Back</button>
        </div>
        {err && <div style={{ color: UI.danger, fontSize: 13, marginBottom: 12 }}>{err}</div>}

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><Label>Title</Label><Text value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="How to…" /></div>
          <div><Label>Slug (URL) — leave blank to auto-generate</Label><Text value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from title" /></div>
        </div>

        <div style={{ marginBottom: 14 }}><Label>Excerpt (card teaser + SEO description)</Label><Area rows={2} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} /></div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div>
            <Label>Category</Label>
            <Select value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </Select>
          </div>
          <div><Label>Read minutes</Label><Text type="number" value={form.readMinutes} onChange={(e) => set("readMinutes", e.target.value)} /></div>
          <div>
            <Label>Status</Label>
            <Select value={form.status} onChange={(e) => set("status", e.target.value)}>
              <option value="PUBLISHED">Published</option>
              <option value="DRAFT">Draft</option>
            </Select>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          <div><Label>Tags (comma-separated)</Label><Text value={form.tags} onChange={(e) => set("tags", e.target.value)} placeholder="protein, vegetarian" /></div>
          <div><Label>Author</Label><Text value={form.authorName} onChange={(e) => set("authorName", e.target.value)} /></div>
        </div>

        <div style={{ marginBottom: 14 }}><ImageUpload label="Cover image (optional)" value={form.coverImageUrl} onChange={(url) => set("coverImageUrl", url)} folder="blog" /></div>

        <div style={{ marginBottom: 8 }}><Check checked={form.isFeatured} onChange={(v) => set("isFeatured", v)} label="Feature this post (hero on /blog)" /></div>

        <Label>Body (HTML)</Label>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
          <Area rows={16} value={form.contentHtml} onChange={(e) => set("contentHtml", e.target.value)} placeholder="<p>Write in HTML: &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;&lt;li&gt;, &lt;strong&gt;, &lt;a href&gt;…</p>" style={{ fontFamily: "ui-monospace, monospace", fontSize: 12.5 }} />
          <div style={{ border: `1px solid ${UI.border}`, borderRadius: 8, padding: "14px 16px", background: UI.soft, overflow: "auto", maxHeight: 380 }}>
            <div style={{ fontSize: 11, color: UI.muted, marginBottom: 8, textTransform: "uppercase", letterSpacing: 1 }}>Live preview</div>
            <div style={{ color: "#cfcfcf", fontSize: 14, lineHeight: 1.6 }} dangerouslySetInnerHTML={{ __html: form.contentHtml || "<p style='color:#666'>Nothing yet…</p>" }} />
          </div>
        </div>

        <div style={{ display: "flex", gap: 10 }}>
          <button onClick={save} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save post"}</button>
          <button onClick={close} style={btn()}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
        <button onClick={startNew} style={btn(true)}>+ New post</button>
      </div>
      {items.length === 0 ? (
        <Empty label="No posts yet." />
      ) : (
        <div style={{ border: `1px solid ${UI.border}`, borderRadius: 12, overflow: "hidden" }}>
          {items.map((p, i) => (
            <div key={p.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderTop: i ? `1px solid ${UI.border}` : "none", background: UI.card }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600, color: UI.text }}>
                  {p.title}{" "}
                  {p.isFeatured && <span style={{ color: UI.accent, fontSize: 11 }}>★ featured</span>}
                </div>
                <div style={{ fontSize: 12, color: UI.muted, marginTop: 2 }}>
                  {p.category} · {p.status === "DRAFT" ? <span style={{ color: "#facc15" }}>Draft</span> : "Published"} · /{p.slug}
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                <button onClick={() => startEdit(p)} style={btn()}>Edit</button>
                <button onClick={() => remove(p)} style={{ ...btn(), color: UI.danger, borderColor: "#3a1c1c" }}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function Empty({ label }: { label: string }) {
  return <div style={{ border: `1px solid ${UI.border}`, borderRadius: 12, padding: "32px", textAlign: "center", color: UI.muted, fontSize: 14 }}>{label}</div>;
}
