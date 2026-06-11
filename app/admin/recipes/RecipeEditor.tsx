"use client";

// app/admin/recipes/RecipeEditor.tsx
// Phase 15E-2 — edit one recipe: fields + cooking steps (the SOP) + ingredients.

import { useEffect, useState } from "react";
import { T, Text, Area, Select, Check, Label, btn } from "./ui";

async function api(payload: any) {
  const res = await fetch("/api/admin/recipes", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const j = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(j?.error || "Failed");
  return j;
}

const Sec = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: T.accent, fontWeight: 700, marginBottom: 12 }}>{title}</div>
    {children}
  </div>
);

export default function RecipeEditor({ recipeId, onClose, onSummary }: { recipeId: string; onClose: () => void; onSummary: (patch: any) => void }) {
  const [recipe, setRecipe] = useState<any>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/recipes?id=${recipeId}`)
      .then((r) => r.json())
      .then((d) => { if (alive) { if (d.recipe) setRecipe(d.recipe); else setErr(d.error || "Not found"); } })
      .catch(() => alive && setErr("Failed to load"));
    return () => { alive = false; };
  }, [recipeId]);

  function pushCounts(steps: number, ingredients: number) {
    onSummary({ _count: { steps, ingredients } });
  }

  if (err) return <div><button onClick={onClose} style={btn()}>← Back</button><p style={{ color: T.danger, marginTop: 16 }}>{err}</p></div>;
  if (!recipe) return <div><button onClick={onClose} style={btn()}>← Back</button><p style={{ color: T.muted, marginTop: 16 }}>Loading…</p></div>;

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800 }}>{recipe.name}</h2>
        <button onClick={onClose} style={btn()}>← All recipes</button>
      </div>

      <RecipeFields recipe={recipe} setRecipe={setRecipe} onSummary={onSummary} />

      <StepsEditor
        recipeId={recipe.id}
        steps={recipe.steps}
        onChange={(steps) => { setRecipe((r: any) => ({ ...r, steps })); pushCounts(steps.length, recipe.ingredients.length); }}
      />

      <IngredientsEditor
        recipeId={recipe.id}
        ingredients={recipe.ingredients}
        onChange={(ings) => { setRecipe((r: any) => ({ ...r, ingredients: ings })); pushCounts(recipe.steps.length, ings.length); }}
      />
    </div>
  );
}

// ── Recipe fields ──
function RecipeFields({ recipe, setRecipe, onSummary }: any) {
  const [f, setF] = useState({
    name: recipe.name ?? "", shortDescription: recipe.shortDescription ?? "", description: recipe.description ?? "",
    cuisineType: recipe.cuisineType ?? "", mealType: recipe.mealType ?? "BREAKFAST",
    servingSizeGrams: recipe.servingSizeGrams ?? 0, prepTimeMins: recipe.prepTimeMins ?? 0, cookTimeMins: recipe.cookTimeMins ?? 0,
    difficulty: recipe.difficulty ?? "easy",
    caloriesPerServing: recipe.caloriesPerServing ?? 0, proteinGrams: Number(recipe.proteinGrams ?? 0),
    carbsGrams: Number(recipe.carbsGrams ?? 0), fatGrams: Number(recipe.fatGrams ?? 0), fibreGrams: Number(recipe.fibreGrams ?? 0),
    isActive: !!recipe.isActive, isFeatured: !!recipe.isFeatured, imageUrl: recipe.imageUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: any) => setF((x) => ({ ...x, [k]: v }));

  async function save() {
    setBusy(true); setErr(null);
    try {
      const { recipe: rec } = await api({ action: "updateRecipe", id: recipe.id, data: f });
      setRecipe((r: any) => ({ ...r, ...rec }));
      onSummary({ name: rec.name, isActive: rec.isActive, mealType: rec.mealType, cuisineType: rec.cuisineType });
      setOk(true); setTimeout(() => setOk(false), 1600);
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setBusy(false); }
  }

  return (
    <Sec title="Recipe details">
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div><Label>Name</Label><Text value={f.name} onChange={(e) => set("name", e.target.value)} /></div>
        <div><Label>Cuisine</Label><Text value={f.cuisineType} onChange={(e) => set("cuisineType", e.target.value)} placeholder="NorthIndian" /></div>
      </div>
      <div style={{ marginBottom: 14 }}><Label>Short description (card tagline)</Label><Text value={f.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} /></div>
      <div style={{ marginBottom: 14 }}><Label>Description</Label><Area rows={2} value={f.description} onChange={(e) => set("description", e.target.value)} /></div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: 14, marginBottom: 14 }}>
        <div><Label>Meal</Label><Select value={f.mealType} onChange={(e) => set("mealType", e.target.value)}>{["BREAKFAST", "LUNCH", "SNACK", "DINNER"].map((m) => <option key={m} value={m}>{m[0] + m.slice(1).toLowerCase()}</option>)}</Select></div>
        <div><Label>Difficulty</Label><Select value={f.difficulty} onChange={(e) => set("difficulty", e.target.value)}>{["easy", "medium", "hard"].map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
        <div><Label>Prep (min)</Label><Text type="number" value={f.prepTimeMins} onChange={(e) => set("prepTimeMins", e.target.value)} /></div>
        <div><Label>Cook (min)</Label><Text type="number" value={f.cookTimeMins} onChange={(e) => set("cookTimeMins", e.target.value)} /></div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(6,1fr)", gap: 12, marginBottom: 14 }}>
        <div><Label>Serving g</Label><Text type="number" value={f.servingSizeGrams} onChange={(e) => set("servingSizeGrams", e.target.value)} /></div>
        <div><Label>kcal</Label><Text type="number" value={f.caloriesPerServing} onChange={(e) => set("caloriesPerServing", e.target.value)} /></div>
        <div><Label>Protein</Label><Text type="number" value={f.proteinGrams} onChange={(e) => set("proteinGrams", e.target.value)} /></div>
        <div><Label>Carbs</Label><Text type="number" value={f.carbsGrams} onChange={(e) => set("carbsGrams", e.target.value)} /></div>
        <div><Label>Fat</Label><Text type="number" value={f.fatGrams} onChange={(e) => set("fatGrams", e.target.value)} /></div>
        <div><Label>Fibre</Label><Text type="number" value={f.fibreGrams} onChange={(e) => set("fibreGrams", e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 14 }}><Label>Image URL</Label><Text value={f.imageUrl} onChange={(e) => set("imageUrl", e.target.value)} placeholder="https://…" /></div>
      <div style={{ display: "flex", gap: 20, alignItems: "center", marginBottom: 14 }}>
        <Check checked={f.isActive} onChange={(v) => set("isActive", v)} label="Active" />
        <Check checked={f.isFeatured} onChange={(v) => set("isFeatured", v)} label="Featured" />
        <button onClick={save} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save details"}</button>
        {ok && <span style={{ color: T.accent, fontSize: 13 }}>✓ Saved</span>}
      </div>
    </Sec>
  );
}

// ── Steps ──
const blankStep = () => ({ title: "", instruction: "", technique: "", durationMins: "", temperatureC: "", kitchenNote: "" });

function StepsEditor({ recipeId, steps, onChange }: { recipeId: string; steps: any[]; onChange: (s: any[]) => void }) {
  const [editId, setEditId] = useState<null | "new" | string>(null);
  const [form, setForm] = useState<any>(blankStep());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = (k: string, v: any) => setForm((x: any) => ({ ...x, [k]: v }));

  function startNew() { setForm(blankStep()); setEditId("new"); setErr(null); }
  function startEdit(st: any) { setForm({ title: st.title, instruction: st.instruction, technique: st.technique ?? "", durationMins: st.durationMins ?? "", temperatureC: st.temperatureC ?? "", kitchenNote: st.kitchenNote ?? "" }); setEditId(st.id); setErr(null); }

  async function save() {
    setBusy(true); setErr(null);
    try {
      const { step } = await api({ action: "saveStep", recipeId, id: editId === "new" ? undefined : editId, data: form });
      const next = editId === "new" ? [...steps, step] : steps.map((s) => (s.id === step.id ? step : s));
      next.sort((a, b) => a.stepNumber - b.stepNumber);
      onChange(next);
      setEditId(null);
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setBusy(false); }
  }
  async function del(st: any) {
    if (!confirm("Delete this step?")) return;
    await api({ action: "deleteStep", id: st.id });
    onChange(steps.filter((s) => s.id !== st.id));
  }
  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[idx], next[j]] = [next[j], next[idx]];
    const renumbered = next.map((s, k) => ({ ...s, stepNumber: k + 1 }));
    onChange(renumbered);
    await api({ action: "reorderSteps", orderedIds: renumbered.map((s) => s.id) });
  }

  return (
    <Sec title={`Cooking method (${steps.length} steps)`}>
      {steps.length === 0 && <div style={{ color: T.amber, fontSize: 13, marginBottom: 10 }}>No steps yet — add the cooking method so it appears on the kitchen SOP.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {steps.map((st, idx) => (
          <div key={st.id}>
            {editId === st.id ? (
              <StepForm form={form} set={set} err={err} busy={busy} onSave={save} onCancel={() => setEditId(null)} />
            ) : (
              <div style={{ display: "flex", gap: 12, padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: 10, background: T.card }}>
                <div style={{ color: T.accent, fontWeight: 800, fontSize: 15, minWidth: 22 }}>{st.stepNumber}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{st.title}{st.durationMins ? <span style={{ color: T.muted, fontWeight: 400 }}> · {st.durationMins} min</span> : null}{st.technique ? <span style={{ color: T.muted, fontWeight: 400 }}> · {st.technique}</span> : null}</div>
                  <div style={{ color: T.muted, fontSize: 13, marginTop: 2 }}>{st.instruction}</div>
                  {st.kitchenNote && <div style={{ color: T.accent, fontSize: 12, marginTop: 3 }}>⚑ {st.kitchenNote}</div>}
                </div>
                <div style={{ display: "flex", gap: 4, alignItems: "flex-start" }}>
                  <button onClick={() => move(idx, -1)} style={miniBtn} title="Up">▲</button>
                  <button onClick={() => move(idx, 1)} style={miniBtn} title="Down">▼</button>
                  <button onClick={() => startEdit(st)} style={btn()}>Edit</button>
                  <button onClick={() => del(st)} style={{ ...btn(), color: T.danger, borderColor: "#3a1c1c" }}>✕</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      {editId === "new" ? (
        <StepForm form={form} set={set} err={err} busy={busy} onSave={save} onCancel={() => setEditId(null)} />
      ) : (
        <button onClick={startNew} style={btn(true)}>+ Add step</button>
      )}
    </Sec>
  );
}

function StepForm({ form, set, err, busy, onSave, onCancel }: any) {
  return (
    <div style={{ border: `1px solid ${T.accent}55`, borderRadius: 10, padding: 14, background: T.soft }}>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 8 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div><Label>Title</Label><Text value={form.title} onChange={(e: any) => set("title", e.target.value)} placeholder="Marinate the paneer" /></div>
        <div><Label>Technique</Label><Text value={form.technique} onChange={(e: any) => set("technique", e.target.value)} placeholder="saute" /></div>
        <div><Label>Duration (min)</Label><Text type="number" value={form.durationMins} onChange={(e: any) => set("durationMins", e.target.value)} /></div>
        <div><Label>Temp (°C)</Label><Text type="number" value={form.temperatureC} onChange={(e: any) => set("temperatureC", e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 10 }}><Label>Instruction</Label><Area rows={2} value={form.instruction} onChange={(e: any) => set("instruction", e.target.value)} /></div>
      <div style={{ marginBottom: 10 }}><Label>Kitchen note (staff only, optional)</Label><Text value={form.kitchenNote} onChange={(e: any) => set("kitchenNote", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save step"}</button>
        <button onClick={onCancel} style={btn()}>Cancel</button>
      </div>
    </div>
  );
}

// ── Ingredients ──
function IngredientsEditor({ recipeId, ingredients, onChange }: { recipeId: string; ingredients: any[]; onChange: (i: any[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  async function del(ing: any) {
    if (!confirm(`Remove ${ing.foodItem?.name}?`)) return;
    await api({ action: "deleteIngredient", id: ing.id });
    onChange(ingredients.filter((x) => x.id !== ing.id));
  }
  function saved(ing: any, isNew: boolean) {
    onChange(isNew ? [...ingredients, ing] : ingredients.map((x) => (x.id === ing.id ? ing : x)));
    setAdding(false); setEditId(null);
  }

  return (
    <Sec title={`Ingredients (${ingredients.length})`}>
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 10, overflow: "hidden", marginBottom: 12 }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.4fr 0.8fr 0.9fr", gap: 8, padding: "9px 12px", background: "#161616", fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", color: T.muted }}>
          <div>Ingredient</div><div>Raw g</div><div>Prep</div><div>Optional</div><div></div>
        </div>
        {ingredients.length === 0 && <div style={{ padding: 14, color: T.muted, fontSize: 13 }}>No ingredients yet.</div>}
        {ingredients.map((ing, i) =>
          editId === ing.id ? (
            <IngredientForm key={ing.id} recipeId={recipeId} initial={ing} onSaved={(r) => saved(r, false)} onCancel={() => setEditId(null)} top={i > 0} />
          ) : (
            <div key={ing.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.4fr 0.8fr 0.9fr", gap: 8, padding: "10px 12px", borderTop: i ? `1px solid ${T.border}` : "none", background: T.card, alignItems: "center", fontSize: 13 }}>
              <div style={{ color: T.text }}>{ing.foodItem?.name}<span style={{ color: T.muted, fontSize: 11 }}>{ing.foodItem?.category ? ` · ${ing.foodItem.category}` : ""}</span></div>
              <div style={{ color: T.muted }}>{Number(ing.quantityGrams)} g</div>
              <div style={{ color: T.muted }}>{ing.prepNote ?? "—"}</div>
              <div style={{ color: T.muted }}>{ing.isOptional ? "yes" : "—"}</div>
              <div style={{ display: "flex", gap: 6, justifyContent: "flex-end" }}>
                <button onClick={() => setEditId(ing.id)} style={btn()}>Edit</button>
                <button onClick={() => del(ing)} style={{ ...btn(), color: T.danger, borderColor: "#3a1c1c" }}>✕</button>
              </div>
            </div>
          )
        )}
      </div>
      {adding ? (
        <IngredientForm recipeId={recipeId} onSaved={(r) => saved(r, true)} onCancel={() => setAdding(false)} top={false} />
      ) : (
        <button onClick={() => setAdding(true)} style={btn(true)}>+ Add ingredient</button>
      )}
    </Sec>
  );
}

function IngredientForm({ recipeId, initial, onSaved, onCancel }: { recipeId: string; initial?: any; onSaved: (r: any) => void; onCancel: () => void; top: boolean }) {
  const [food, setFood] = useState<any>(initial?.foodItem ?? null);
  const [qty, setQty] = useState(initial ? Number(initial.quantityGrams) : "");
  const [factor, setFactor] = useState(initial ? Number(initial.cookedWeightFactor ?? 1) : 1);
  const [prep, setPrep] = useState(initial?.prepNote ?? "");
  const [optional, setOptional] = useState(!!initial?.isOptional);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!food) { setErr("Pick an ingredient first"); return; }
    setBusy(true); setErr(null);
    try {
      const { ingredient } = await api({
        action: "saveIngredient", recipeId, id: initial?.id,
        data: { foodItemId: food.id, quantityGrams: qty, cookedWeightFactor: factor, prepNote: prep, isOptional: optional },
      });
      onSaved(ingredient);
    } catch (e: any) { setErr(e?.message || "Save failed"); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ border: `1px solid ${T.accent}55`, borderRadius: 10, padding: 14, background: T.soft }}>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 8 }}>{err}</div>}
      {food ? (
        <div style={{ marginBottom: 10, fontSize: 13 }}>
          Ingredient: <strong style={{ color: T.text }}>{food.name}</strong>{food.category ? <span style={{ color: T.muted }}> · {food.category}</span> : null}
          {!initial && <button onClick={() => setFood(null)} style={{ ...btn(), marginLeft: 10, padding: "3px 9px", fontSize: 11 }}>change</button>}
        </div>
      ) : (
        <FoodPicker onPick={setFood} />
      )}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 10, marginBottom: 10 }}>
        <div><Label>Raw weight (g) / serving</Label><Text type="number" value={qty} onChange={(e: any) => setQty(e.target.value)} /></div>
        <div><Label>Cooked/raw factor</Label><Text type="number" value={factor} onChange={(e: any) => setFactor(e.target.value)} /></div>
        <div><Label>Prep note</Label><Text value={prep} onChange={(e: any) => setPrep(e.target.value)} placeholder="finely chopped" /></div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Check checked={optional} onChange={setOptional} label="Optional" />
        <button onClick={save} disabled={busy || !food} style={{ ...btn(true), opacity: busy || !food ? 0.6 : 1 }}>{busy ? "Saving…" : "Save ingredient"}</button>
        <button onClick={onCancel} style={btn()}>Cancel</button>
      </div>
    </div>
  );
}

function FoodPicker({ onPick }: { onPick: (f: any) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<any[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("");

  async function search() {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/recipes?foodq=${encodeURIComponent(q.trim())}`);
      const d = await res.json();
      setResults(d.items ?? []);
    } finally { setSearching(false); }
  }
  async function create() {
    if (!newName.trim()) return;
    const { item } = await api({ action: "createFoodItem", data: { name: newName.trim(), category: newCat.trim() } });
    onPick(item);
  }

  return (
    <div style={{ marginBottom: 12, padding: 10, border: `1px dashed ${T.border}`, borderRadius: 8 }}>
      <Label>Find ingredient</Label>
      <div style={{ display: "flex", gap: 8 }}>
        <Text value={q} onChange={(e: any) => setQ(e.target.value)} onKeyDown={(e: any) => e.key === "Enter" && search()} placeholder="Search food items…" />
        <button onClick={search} disabled={searching} style={btn()}>{searching ? "…" : "Search"}</button>
      </div>
      {results && (
        <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
          {results.length === 0 ? <span style={{ color: T.muted, fontSize: 12 }}>No matches.</span> :
            results.map((it) => (
              <button key={it.id} onClick={() => onPick(it)} style={{ ...btn(), padding: "5px 10px", fontSize: 12 }}>
                {it.name}{it.category ? <span style={{ color: T.muted }}> · {it.category}</span> : null}
              </button>
            ))}
        </div>
      )}
      <div style={{ marginTop: 10 }}>
        {creating ? (
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            <Text value={newName} onChange={(e: any) => setNewName(e.target.value)} placeholder="New ingredient name" style={{ maxWidth: 200 }} />
            <Text value={newCat} onChange={(e: any) => setNewCat(e.target.value)} placeholder="category (optional)" style={{ maxWidth: 160 }} />
            <button onClick={create} style={btn(true)}>Create &amp; use</button>
            <button onClick={() => setCreating(false)} style={btn()}>Cancel</button>
          </div>
        ) : (
          <button onClick={() => setCreating(true)} style={{ ...btn(), fontSize: 12, padding: "5px 10px" }}>+ Create new ingredient</button>
        )}
      </div>
    </div>
  );
}

const miniBtn: React.CSSProperties = { background: "transparent", color: T.muted, border: `1px solid ${T.border}`, borderRadius: 6, padding: "4px 7px", fontSize: 11, cursor: "pointer" };
