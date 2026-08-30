"use client";

// app/admin/recipes/RecipeEditor.tsx
// Phase 15E-2 — edit one recipe: fields + cooking steps (the SOP) + ingredients.

import { useEffect, useState } from "react";
import { T, Text, Area, Select, Check, Label, btn } from "./ui";
import ImageUpload from "@/components/ImageUpload";
import type { RecipeSummary } from "./RecipesClient";

type FoodOption = { id: string; name: string; category: string | null };
type RecipeStepRecord = {
  id: string;
  stepNumber: number;
  title: string;
  instruction: string;
  durationMins: number | null;
  temperatureC: number | null;
  technique: string | null;
  kitchenNote: string | null;
};
type RecipeIngredientRecord = {
  id: string;
  foodItemId: string;
  quantityGrams: number | string;
  cookedWeightFactor: number | string;
  prepNote: string | null;
  isOptional: boolean;
  orderInRecipe: number;
  foodItem: FoodOption;
};
type RecipeDetail = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  cuisineType: string;
  mealType: "BREAKFAST" | "LUNCH" | "SNACK" | "DINNER";
  servingSizeGrams: number;
  prepTimeMins: number;
  cookTimeMins: number;
  difficulty: "easy" | "medium" | "hard";
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string | null;
  caloriesPerServing: number;
  proteinGrams: number | string;
  carbsGrams: number | string;
  fatGrams: number | string;
  fibreGrams: number | string;
  ingredients: RecipeIngredientRecord[];
  steps: RecipeStepRecord[];
};
type RecipeForm = {
  name: string;
  shortDescription: string;
  description: string;
  cuisineType: string;
  mealType: RecipeDetail["mealType"];
  servingSizeGrams: string;
  prepTimeMins: string;
  cookTimeMins: string;
  difficulty: RecipeDetail["difficulty"];
  caloriesPerServing: string;
  proteinGrams: string;
  carbsGrams: string;
  fatGrams: string;
  fibreGrams: string;
  isActive: boolean;
  isFeatured: boolean;
  imageUrl: string;
};
type StepFormData = {
  title: string;
  instruction: string;
  technique: string;
  durationMins: string;
  temperatureC: string;
  kitchenNote: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function api<T>(payload: Record<string, unknown>): Promise<T> {
  const res = await fetch("/api/admin/recipes", {
    method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
  });
  const body: unknown = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(isRecord(body) && typeof body.error === "string" ? body.error : "Recipe request failed.");
  return body as T;
}

const Sec = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div style={{ marginBottom: 24 }}>
    <div style={{ fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: T.accent, fontWeight: 700, marginBottom: 12 }}>{title}</div>
    {children}
  </div>
);

export default function RecipeEditor({ recipeId, onClose, onSummary }: { recipeId: string; onClose: () => void; onSummary: (patch: Partial<RecipeSummary>) => void }) {
  const [recipe, setRecipe] = useState<RecipeDetail | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch(`/api/admin/recipes?id=${recipeId}`)
      .then((r) => r.json())
      .then((value: unknown) => {
        if (!alive) return;
        const data = isRecord(value) ? value : {};
        if (isRecord(data.recipe)) setRecipe(data.recipe as RecipeDetail);
        else setErr(typeof data.error === "string" ? data.error : "Recipe not found.");
      })
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
        onChange={(steps) => { setRecipe((currentRecipe) => currentRecipe ? { ...currentRecipe, steps } : currentRecipe); pushCounts(steps.length, recipe.ingredients.length); }}
      />

      <IngredientsEditor
        recipeId={recipe.id}
        ingredients={recipe.ingredients}
        onChange={(ingredients) => { setRecipe((currentRecipe) => currentRecipe ? { ...currentRecipe, ingredients } : currentRecipe); pushCounts(recipe.steps.length, ingredients.length); }}
      />
    </div>
  );
}

// ── Recipe fields ──
function RecipeFields({ recipe, setRecipe, onSummary }: {
  recipe: RecipeDetail;
  setRecipe: React.Dispatch<React.SetStateAction<RecipeDetail | null>>;
  onSummary: (patch: Partial<RecipeSummary>) => void;
}) {
  const [f, setF] = useState<RecipeForm>({
    name: recipe.name ?? "", shortDescription: recipe.shortDescription ?? "", description: recipe.description ?? "",
    cuisineType: recipe.cuisineType ?? "", mealType: recipe.mealType ?? "BREAKFAST",
    servingSizeGrams: String(recipe.servingSizeGrams ?? 0), prepTimeMins: String(recipe.prepTimeMins ?? 0), cookTimeMins: String(recipe.cookTimeMins ?? 0),
    difficulty: recipe.difficulty ?? "easy",
    caloriesPerServing: String(recipe.caloriesPerServing ?? 0), proteinGrams: String(recipe.proteinGrams ?? 0),
    carbsGrams: String(recipe.carbsGrams ?? 0), fatGrams: String(recipe.fatGrams ?? 0), fibreGrams: String(recipe.fibreGrams ?? 0),
    isActive: !!recipe.isActive, isFeatured: !!recipe.isFeatured, imageUrl: recipe.imageUrl ?? "",
  });
  const [busy, setBusy] = useState(false);
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof RecipeForm>(key: K, value: RecipeForm[K]) => setF((current) => ({ ...current, [key]: value }));

  async function save() {
    setBusy(true); setErr(null);
    try {
      const { recipe: savedRecipe } = await api<{ recipe: RecipeDetail }>({ action: "updateRecipe", id: recipe.id, data: f });
      setRecipe((currentRecipe) => currentRecipe ? { ...currentRecipe, ...savedRecipe } : currentRecipe);
      onSummary({ name: savedRecipe.name, isActive: savedRecipe.isActive, mealType: savedRecipe.mealType, cuisineType: savedRecipe.cuisineType });
      setOk(true); setTimeout(() => setOk(false), 1600);
    } catch (error: unknown) { setErr(error instanceof Error ? error.message : "Save failed"); }
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
        <div><Label>Meal</Label><Select value={f.mealType} onChange={(e) => set("mealType", e.target.value as RecipeForm["mealType"])}>{["BREAKFAST", "LUNCH", "SNACK", "DINNER"].map((m) => <option key={m} value={m}>{m[0] + m.slice(1).toLowerCase()}</option>)}</Select></div>
        <div><Label>Difficulty</Label><Select value={f.difficulty} onChange={(e) => set("difficulty", e.target.value as RecipeForm["difficulty"])}>{["easy", "medium", "hard"].map((m) => <option key={m} value={m}>{m}</option>)}</Select></div>
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
      <div style={{ marginBottom: 14 }}><ImageUpload label="Image" value={f.imageUrl} onChange={(url) => set("imageUrl", url)} folder="recipes" /></div>
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
const blankStep = (): StepFormData => ({ title: "", instruction: "", technique: "", durationMins: "", temperatureC: "", kitchenNote: "" });

function StepsEditor({ recipeId, steps, onChange }: { recipeId: string; steps: RecipeStepRecord[]; onChange: (steps: RecipeStepRecord[]) => void }) {
  const [editId, setEditId] = useState<null | "new" | string>(null);
  const [form, setForm] = useState<StepFormData>(blankStep());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const set = <K extends keyof StepFormData>(key: K, value: StepFormData[K]) => setForm((current) => ({ ...current, [key]: value }));

  function startNew() { setForm(blankStep()); setEditId("new"); setErr(null); }
  function startEdit(step: RecipeStepRecord) {
    setForm({
      title: step.title,
      instruction: step.instruction,
      technique: step.technique ?? "",
      durationMins: step.durationMins === null ? "" : String(step.durationMins),
      temperatureC: step.temperatureC === null ? "" : String(step.temperatureC),
      kitchenNote: step.kitchenNote ?? "",
    });
    setEditId(step.id);
    setErr(null);
  }

  async function save() {
    setBusy(true); setErr(null);
    try {
      const { step } = await api<{ step: RecipeStepRecord }>({ action: "saveStep", recipeId, id: editId === "new" ? undefined : editId, data: form });
      const next = editId === "new" ? [...steps, step] : steps.map((savedStep) => (savedStep.id === step.id ? step : savedStep));
      next.sort((a, b) => a.stepNumber - b.stepNumber);
      onChange(next);
      setEditId(null);
    } catch (error: unknown) { setErr(error instanceof Error ? error.message : "Save failed"); }
    finally { setBusy(false); }
  }
  async function del(step: RecipeStepRecord) {
    if (!confirm("Delete this step?")) return;
    try {
      await api<{ ok: true }>({ action: "deleteStep", id: step.id });
      onChange(steps.filter((savedStep) => savedStep.id !== step.id));
    } catch (error: unknown) {
      setErr(error instanceof Error ? error.message : "Step could not be removed.");
    }
  }
  async function move(idx: number, dir: -1 | 1) {
    const j = idx + dir;
    if (j < 0 || j >= steps.length) return;
    const next = [...steps];
    [next[idx], next[j]] = [next[j], next[idx]];
    const renumbered = next.map((s, k) => ({ ...s, stepNumber: k + 1 }));
    onChange(renumbered);
    try {
      await api<{ ok: true }>({ action: "reorderSteps", recipeId, orderedIds: renumbered.map((step) => step.id) });
    } catch (error: unknown) {
      onChange(steps);
      setErr(error instanceof Error ? error.message : "Step order could not be saved.");
    }
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
              <div style={{ display: "flex", gap: 12, padding: "12px 14px", border: `1px solid ${T.border}`, borderRadius: 0, background: T.card }}>
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

function StepForm({ form, set, err, busy, onSave, onCancel }: {
  form: StepFormData;
  set: <K extends keyof StepFormData>(key: K, value: StepFormData[K]) => void;
  err: string | null;
  busy: boolean;
  onSave: () => void;
  onCancel: () => void;
}) {
  return (
    <div style={{ border: `1px solid ${T.accent}55`, borderRadius: 0, padding: 14, background: T.soft }}>
      {err && <div style={{ color: T.danger, fontSize: 13, marginBottom: 8 }}>{err}</div>}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", gap: 10, marginBottom: 10 }}>
        <div><Label>Title</Label><Text value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="Marinate the paneer" /></div>
        <div><Label>Technique</Label><Text value={form.technique} onChange={(e) => set("technique", e.target.value)} placeholder="saute" /></div>
        <div><Label>Duration (min)</Label><Text type="number" value={form.durationMins} onChange={(e) => set("durationMins", e.target.value)} /></div>
        <div><Label>Temp (°C)</Label><Text type="number" value={form.temperatureC} onChange={(e) => set("temperatureC", e.target.value)} /></div>
      </div>
      <div style={{ marginBottom: 10 }}><Label>Instruction</Label><Area rows={2} value={form.instruction} onChange={(e) => set("instruction", e.target.value)} /></div>
      <div style={{ marginBottom: 10 }}><Label>Kitchen note (staff only, optional)</Label><Text value={form.kitchenNote} onChange={(e) => set("kitchenNote", e.target.value)} /></div>
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={onSave} disabled={busy} style={{ ...btn(true), opacity: busy ? 0.6 : 1 }}>{busy ? "Saving…" : "Save step"}</button>
        <button onClick={onCancel} style={btn()}>Cancel</button>
      </div>
    </div>
  );
}

// ── Ingredients ──
function IngredientsEditor({ recipeId, ingredients, onChange }: { recipeId: string; ingredients: RecipeIngredientRecord[]; onChange: (ingredients: RecipeIngredientRecord[]) => void }) {
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function del(ingredient: RecipeIngredientRecord) {
    if (!confirm(`Remove ${ingredient.foodItem.name}?`)) return;
    try {
      await api<{ ok: true }>({ action: "deleteIngredient", id: ingredient.id });
      onChange(ingredients.filter((savedIngredient) => savedIngredient.id !== ingredient.id));
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "Ingredient could not be removed.");
    }
  }
  function saved(ingredient: RecipeIngredientRecord, isNew: boolean) {
    onChange(isNew ? [...ingredients, ingredient] : ingredients.map((savedIngredient) => (savedIngredient.id === ingredient.id ? ingredient : savedIngredient)));
    setAdding(false); setEditId(null);
  }

  return (
    <Sec title={`Ingredients (${ingredients.length})`}>
      {error ? <div style={{ color: T.danger, fontSize: 13, marginBottom: 10 }}>{error}</div> : null}
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 0, overflow: "hidden", marginBottom: 12 }}>
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

function IngredientForm({ recipeId, initial, onSaved, onCancel }: { recipeId: string; initial?: RecipeIngredientRecord; onSaved: (ingredient: RecipeIngredientRecord) => void; onCancel: () => void; top: boolean }) {
  const [food, setFood] = useState<FoodOption | null>(initial?.foodItem ?? null);
  const [qty, setQty] = useState(initial ? String(initial.quantityGrams) : "");
  const [factor, setFactor] = useState(initial ? String(initial.cookedWeightFactor ?? 1) : "1");
  const [prep, setPrep] = useState(initial?.prepNote ?? "");
  const [optional, setOptional] = useState(!!initial?.isOptional);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    if (!food) { setErr("Pick an ingredient first"); return; }
    setBusy(true); setErr(null);
    try {
      const { ingredient } = await api<{ ingredient: RecipeIngredientRecord }>({
        action: "saveIngredient", recipeId, id: initial?.id,
        data: { foodItemId: food.id, quantityGrams: qty, cookedWeightFactor: factor, prepNote: prep, isOptional: optional },
      });
      onSaved(ingredient);
    } catch (error: unknown) { setErr(error instanceof Error ? error.message : "Save failed"); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ border: `1px solid ${T.accent}55`, borderRadius: 0, padding: 14, background: T.soft }}>
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
        <div><Label>Raw weight (g) / serving</Label><Text type="number" value={qty} onChange={(e) => setQty(e.target.value)} /></div>
        <div><Label>Cooked/raw factor</Label><Text type="number" value={factor} onChange={(e) => setFactor(e.target.value)} /></div>
        <div><Label>Prep note</Label><Text value={prep} onChange={(e) => setPrep(e.target.value)} placeholder="finely chopped" /></div>
      </div>
      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        <Check checked={optional} onChange={setOptional} label="Optional" />
        <button onClick={save} disabled={busy || !food} style={{ ...btn(true), opacity: busy || !food ? 0.6 : 1 }}>{busy ? "Saving…" : "Save ingredient"}</button>
        <button onClick={onCancel} style={btn()}>Cancel</button>
      </div>
    </div>
  );
}

function FoodPicker({ onPick }: { onPick: (food: FoodOption) => void }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState<FoodOption[] | null>(null);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newCat, setNewCat] = useState("");

  async function search() {
    if (!q.trim()) return;
    setSearching(true);
    try {
      const res = await fetch(`/api/admin/recipes?foodq=${encodeURIComponent(q.trim())}`);
      const body: unknown = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(isRecord(body) && typeof body.error === "string" ? body.error : "Search failed.");
      const items = isRecord(body) && Array.isArray(body.items) ? body.items : [];
      setResults(items.filter((item): item is FoodOption =>
        isRecord(item) && typeof item.id === "string" && typeof item.name === "string"
      ));
    } finally { setSearching(false); }
  }
  async function create() {
    if (!newName.trim()) return;
    const { item } = await api<{ item: FoodOption }>({ action: "createFoodItem", data: { name: newName.trim(), category: newCat.trim() } });
    onPick(item);
  }

  return (
    <div style={{ marginBottom: 12, padding: 10, border: `1px dashed ${T.border}`, borderRadius: 0 }}>
      <Label>Find ingredient</Label>
      <div style={{ display: "flex", gap: 8 }}>
        <Text value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") void search(); }} placeholder="Search food items…" />
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
            <Text value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New ingredient name" style={{ maxWidth: 200 }} />
            <Text value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="category (optional)" style={{ maxWidth: 160 }} />
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

const miniBtn: React.CSSProperties = { background: "transparent", color: T.muted, border: `1px solid ${T.border}`, borderRadius: 0, padding: "4px 7px", fontSize: 11, cursor: "pointer" };
