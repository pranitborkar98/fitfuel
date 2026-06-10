"use client";

// app/admin/content/ContentClient.tsx
// Phase 15D — tabbed content manager. Holds the three lists + a shared API
// caller, and shared input primitives used by the managers.

import { useState } from "react";
import BlogManager from "./BlogManager";
import FaqManager from "./FaqManager";
import TestimonialManager from "./TestimonialManager";

export const UI = {
  card: "#101010",
  border: "#222",
  text: "#ffffff",
  muted: "#888888",
  accent: "#84cc16",
  soft: "#0c0c0c",
  danger: "#f87171",
};

export type ContentType = "blog" | "faq" | "testimonial";

export async function contentApi(
  type: ContentType,
  action: "create" | "update" | "delete",
  id: string | null,
  data: any
) {
  const res = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ type, action, id, data }),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Save failed");
  return j;
}

// ── shared input primitives ──
export function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: 12, color: UI.muted, marginBottom: 5, fontWeight: 600 }}>{children}</div>;
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: UI.soft,
  color: UI.text,
  border: `1px solid ${UI.border}`,
  borderRadius: 8,
  padding: "9px 11px",
  fontSize: 13.5,
  fontFamily: "inherit",
  boxSizing: "border-box",
};

export function Text(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={{ ...inputStyle, ...(props.style || {}) }} />;
}
export function Area(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} style={{ ...inputStyle, resize: "vertical", ...(props.style || {}) }} />;
}
export function Select(props: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} style={{ ...inputStyle, cursor: "pointer", ...(props.style || {}) }} />;
}
export function Check({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5, color: UI.text }}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: UI.accent }} />
      {label}
    </label>
  );
}

export function btn(primary = false): React.CSSProperties {
  return {
    background: primary ? UI.accent : "transparent",
    color: primary ? "#080808" : UI.text,
    border: `1px solid ${primary ? UI.accent : UI.border}`,
    borderRadius: 8,
    padding: "8px 15px",
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
  };
}

const TABS: { key: ContentType; label: string }[] = [
  { key: "blog", label: "Blog" },
  { key: "faq", label: "FAQ" },
  { key: "testimonial", label: "Testimonials" },
];

export default function ContentClient({
  posts,
  faqs,
  testimonials,
}: {
  posts: any[];
  faqs: any[];
  testimonials: any[];
}) {
  const [tab, setTab] = useState<ContentType>("blog");
  const counts = { blog: posts.length, faq: faqs.length, testimonial: testimonials.length };

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Content</h1>
      <p style={{ color: UI.muted, fontSize: 13.5, marginBottom: 20 }}>
        Publish and edit your blog, FAQs and testimonials — changes go live immediately.
      </p>

      <div style={{ display: "flex", gap: 8, marginBottom: 22, borderBottom: `1px solid ${UI.border}`, paddingBottom: 12 }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={{
              ...btn(tab === t.key),
              borderColor: tab === t.key ? UI.accent : UI.border,
            }}
          >
            {t.label} <span style={{ opacity: 0.7 }}>({counts[t.key]})</span>
          </button>
        ))}
      </div>

      {tab === "blog" && <BlogManager initial={posts} />}
      {tab === "faq" && <FaqManager initial={faqs} />}
      {tab === "testimonial" && <TestimonialManager initial={testimonials} />}
    </div>
  );
}
