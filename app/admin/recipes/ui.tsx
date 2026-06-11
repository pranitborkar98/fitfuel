"use client";

// app/admin/recipes/ui.tsx
// Shared UI primitives for the recipes admin. Kept in their own module so that
// RecipesClient and RecipeEditor both import from here (no circular import).

export const T = {
  card: "#101010", border: "#222", text: "#ffffff", muted: "#888888",
  accent: "#84cc16", soft: "#0c0c0c", danger: "#f87171", amber: "#facc15",
};

export const inputStyle: React.CSSProperties = {
  width: "100%", background: T.soft, color: T.text, border: `1px solid ${T.border}`,
  borderRadius: 8, padding: "9px 11px", fontSize: 13.5, fontFamily: "inherit", boxSizing: "border-box",
};

export const Text = (p: React.InputHTMLAttributes<HTMLInputElement>) => <input {...p} style={{ ...inputStyle, ...(p.style || {}) }} />;
export const Area = (p: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => <textarea {...p} style={{ ...inputStyle, resize: "vertical", ...(p.style || {}) }} />;
export const Select = (p: React.SelectHTMLAttributes<HTMLSelectElement>) => <select {...p} style={{ ...inputStyle, cursor: "pointer", ...(p.style || {}) }} />;
export const Label = ({ children }: { children: React.ReactNode }) => <div style={{ fontSize: 12, color: T.muted, marginBottom: 5, fontWeight: 600 }}>{children}</div>;
export const Check = ({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) => (
  <label style={{ display: "inline-flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13.5, color: T.text }}>
    <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} style={{ width: 16, height: 16, accentColor: T.accent }} />
    {label}
  </label>
);
export const btn = (primary = false): React.CSSProperties => ({
  background: primary ? T.accent : "transparent", color: primary ? "#080808" : T.text,
  border: `1px solid ${primary ? T.accent : T.border}`, borderRadius: 8, padding: "8px 15px",
  fontSize: 13, fontWeight: 700, cursor: "pointer",
});
