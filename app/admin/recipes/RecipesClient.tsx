"use client";

// app/admin/recipes/RecipesClient.tsx
// Phase 15E-2 — recipe list + search/filters. "Needs steps" surfaces the recipes
// with no cooking method (the SOP gaps the production sheet flagged).

import { useState } from "react";
import RecipeEditor from "./RecipeEditor";

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

const MEALS = ["", "BREAKFAST", "LUNCH", "SNACK", "DINNER"];

type Recipe = any;

export default function RecipesClient({ initial }: { initial: Recipe[] }) {
  const [recipes, setRecipes] = useState<Recipe[]>(initial);
  const [q, setQ] = useState("");
  const [meal, setMeal] = useState("");
  const [needsSteps, setNeedsSteps] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);

  const needsCount = recipes.filter((r) => (r._count?.steps ?? 0) === 0).length;

  function patchSummary(id: string, patch: any) {
    setRecipes((prev) => prev.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  }

  if (editing) {
    return (
      <RecipeEditor
        recipeId={editing}
        onClose={() => setEditing(null)}
        onSummary={(patch) => patchSummary(editing, patch)}
      />
    );
  }

  const filtered = recipes.filter((r) => {
    if (q && !r.name.toLowerCase().includes(q.toLowerCase())) return false;
    if (meal && r.mealType !== meal) return false;
    if (needsSteps && (r._count?.steps ?? 0) !== 0) return false;
    return true;
  });

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Recipes</h1>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 18 }}>
        Edit recipe details, cooking method and ingredients. {recipes.length} recipes.
        {needsCount > 0 && <span style={{ color: T.amber }}> · {needsCount} missing cooking steps</span>}
      </p>

      <div style={{ display: "flex", gap: 10, marginBottom: 18, flexWrap: "wrap", alignItems: "center" }}>
        <Text value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search recipes…" style={{ maxWidth: 280 }} />
        <Select value={meal} onChange={(e) => setMeal(e.target.value)} style={{ maxWidth: 160 }}>
          {MEALS.map((m) => <option key={m} value={m}>{m === "" ? "All meals" : m[0] + m.slice(1).toLowerCase()}</option>)}
        </Select>
        <Check checked={needsSteps} onChange={setNeedsSteps} label="Needs cooking steps" />
      </div>

      {filtered.length === 0 ? (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, padding: 32, textAlign: "center", color: T.muted }}>No recipes match.</div>
      ) : (
        <div style={{ border: `1px solid ${T.border}`, borderRadius: 12, overflow: "hidden" }}>
          {filtered.map((r, idx) => {
            const noSteps = (r._count?.steps ?? 0) === 0;
            return (
              <div key={r.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderTop: idx ? `1px solid ${T.border}` : "none", background: T.card }}>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 14.5, fontWeight: 600, color: T.text }}>
                    {r.name}{!r.isActive && <span style={{ color: T.amber, fontSize: 11 }}> · hidden</span>}
                  </div>
                  <div style={{ fontSize: 12, color: T.muted, marginTop: 2 }}>
                    {r.mealType?.[0] + r.mealType?.slice(1).toLowerCase()} · {r.cuisineType} ·{" "}
                    <span style={{ color: noSteps ? T.amber : T.muted }}>{r._count?.steps ?? 0} steps</span> · {r._count?.ingredients ?? 0} ingredients
                  </div>
                </div>
                <button onClick={() => setEditing(r.id)} style={btn()}>Edit</button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
