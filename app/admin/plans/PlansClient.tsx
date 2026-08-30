"use client";

import { useMemo, useState } from "react";

import ImageUpload from "@/components/ImageUpload";
import styles from "./plans.module.css";

export type PlanPriceRecord = {
  id: string;
  bundle: string;
  isDigital: boolean;
  diet: string;
  duration: string;
  mealsPerDay: string;
  priceRs: number;
  mrpRs: number | null;
  gstPercent: number;
  isActive: boolean;
};

export type PlanAdminRecord = {
  id: string;
  slug: string;
  displayName: string;
  tagline: string;
  description: string;
  longDescription: string;
  whoIsItFor: string;
  keyPrinciples: string[];
  whatIsAvoided: string[];
  avgCaloriesPerDay: number;
  avgProteinGrams: number;
  avgCarbsGrams: number;
  avgFatGrams: number;
  nutritionistName: string | null;
  nutritionistCred: string | null;
  nutritionistBio: string | null;
  medicalDisclaimer: string | null;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  imageUrl: string | null;
  accentColor: string | null;
  category: string;
  tier: string;
  dietaryVariant: string;
  cycleLengthDays: number;
  mealsPerDay: number;
  _count: { scheduleSlots: number };
  planPrices: PlanPriceRecord[];
};

type PlanForm = {
  displayName: string;
  tagline: string;
  description: string;
  longDescription: string;
  whoIsItFor: string;
  keyPrinciples: string;
  whatIsAvoided: string;
  avgCaloriesPerDay: string;
  avgProteinGrams: string;
  avgCarbsGrams: string;
  avgFatGrams: string;
  nutritionistName: string;
  nutritionistCred: string;
  nutritionistBio: string;
  medicalDisclaimer: string;
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: string;
  imageUrl: string;
  accentColor: string;
};

type Message = { kind: "success" | "error"; text: string } | null;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

async function saveRequest(action: "updatePlan" | "updatePrice", id: string, data: Record<string, unknown>) {
  const response = await fetch("/api/admin/plans", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, id, data }),
  });
  const body: unknown = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(isRecord(body) && typeof body.error === "string" ? body.error : "Plan save failed.");
  }
}

function pretty(value: string): string {
  return value.replaceAll("_", " ").toLowerCase().replace(/^./, (letter) => letter.toUpperCase());
}

function lines(value: string): string[] {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function toForm(plan: PlanAdminRecord): PlanForm {
  return {
    displayName: plan.displayName,
    tagline: plan.tagline,
    description: plan.description,
    longDescription: plan.longDescription,
    whoIsItFor: plan.whoIsItFor,
    keyPrinciples: plan.keyPrinciples.join("\n"),
    whatIsAvoided: plan.whatIsAvoided.join("\n"),
    avgCaloriesPerDay: String(plan.avgCaloriesPerDay),
    avgProteinGrams: String(plan.avgProteinGrams),
    avgCarbsGrams: String(plan.avgCarbsGrams),
    avgFatGrams: String(plan.avgFatGrams),
    nutritionistName: plan.nutritionistName ?? "",
    nutritionistCred: plan.nutritionistCred ?? "",
    nutritionistBio: plan.nutritionistBio ?? "",
    medicalDisclaimer: plan.medicalDisclaimer ?? "",
    isActive: plan.isActive,
    isFeatured: plan.isFeatured,
    sortOrder: String(plan.sortOrder),
    imageUrl: plan.imageUrl ?? "",
    accentColor: plan.accentColor ?? "",
  };
}

function formPayload(form: PlanForm): Record<string, unknown> {
  return {
    ...form,
    keyPrinciples: lines(form.keyPrinciples),
    whatIsAvoided: lines(form.whatIsAvoided),
  };
}

function applyForm(plan: PlanAdminRecord, form: PlanForm): PlanAdminRecord {
  return {
    ...plan,
    displayName: form.displayName.trim(),
    tagline: form.tagline.trim(),
    description: form.description.trim(),
    longDescription: form.longDescription.trim(),
    whoIsItFor: form.whoIsItFor.trim(),
    keyPrinciples: lines(form.keyPrinciples),
    whatIsAvoided: lines(form.whatIsAvoided),
    avgCaloriesPerDay: Number(form.avgCaloriesPerDay),
    avgProteinGrams: Number(form.avgProteinGrams),
    avgCarbsGrams: Number(form.avgCarbsGrams),
    avgFatGrams: Number(form.avgFatGrams),
    nutritionistName: form.nutritionistName.trim() || null,
    nutritionistCred: form.nutritionistCred.trim() || null,
    nutritionistBio: form.nutritionistBio.trim() || null,
    medicalDisclaimer: form.medicalDisclaimer.trim() || null,
    isActive: form.isActive,
    isFeatured: form.isFeatured,
    sortOrder: Number(form.sortOrder),
    imageUrl: form.imageUrl.trim() || null,
    accentColor: form.accentColor.trim() || null,
  };
}

function planReady(plan: PlanAdminRecord): boolean {
  return plan._count.scheduleSlots >= plan.cycleLengthDays * plan.mealsPerDay
    && plan.planPrices.some((price) => price.isActive);
}

export default function PlansClient({ initial }: { initial: PlanAdminRecord[] }) {
  const [plans, setPlans] = useState(initial);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PlanForm | null>(null);
  const [prices, setPrices] = useState<PlanPriceRecord[]>([]);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"ALL" | "LIVE" | "HIDDEN" | "NOT_READY">("ALL");
  const [busy, setBusy] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);

  const current = editingId ? plans.find((plan) => plan.id === editingId) ?? null : null;
  const metrics = useMemo(() => ({
    live: plans.filter((plan) => plan.isActive).length,
    ready: plans.filter(planReady).length,
    missingPrices: plans.filter((plan) => !plan.planPrices.some((price) => price.isActive)).length,
  }), [plans]);
  const visiblePlans = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return plans.filter((plan) => {
      const matchesQuery = !needle || `${plan.displayName} ${plan.slug} ${plan.dietaryVariant}`.toLowerCase().includes(needle);
      const ready = planReady(plan);
      const matchesFilter = filter === "ALL"
        || (filter === "LIVE" && plan.isActive)
        || (filter === "HIDDEN" && !plan.isActive)
        || (filter === "NOT_READY" && !ready);
      return matchesQuery && matchesFilter;
    });
  }, [filter, plans, query]);

  function setField<K extends keyof PlanForm>(key: K, value: PlanForm[K]) {
    setForm((currentForm) => currentForm ? { ...currentForm, [key]: value } : currentForm);
  }

  function startEdit(plan: PlanAdminRecord) {
    setEditingId(plan.id);
    setForm(toForm(plan));
    setPrices(plan.planPrices);
    setMessage(null);
  }

  function closeEditor() {
    setEditingId(null);
    setForm(null);
    setPrices([]);
    setMessage(null);
  }

  async function savePlan() {
    if (!current || !form) return;
    setBusy(true);
    setMessage(null);
    try {
      await saveRequest("updatePlan", current.id, formPayload(form));
      setPlans((all) => all.map((plan) => plan.id === current.id ? applyForm(plan, form) : plan));
      setMessage({ kind: "success", text: "Plan changes saved." });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Plan could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  async function toggleLive(plan: PlanAdminRecord) {
    setWorkingId(plan.id);
    setMessage(null);
    const nextForm = { ...toForm(plan), isActive: !plan.isActive };
    try {
      await saveRequest("updatePlan", plan.id, formPayload(nextForm));
      setPlans((all) => all.map((item) => item.id === plan.id ? { ...item, isActive: nextForm.isActive } : item));
      setMessage({ kind: "success", text: `${plan.displayName} is now ${nextForm.isActive ? "live" : "hidden"}.` });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Plan status could not be changed." });
    } finally {
      setWorkingId(null);
    }
  }

  function savePriceLocally(saved: PlanPriceRecord) {
    setPrices((all) => all.map((price) => price.id === saved.id ? saved : price));
    setPlans((all) => all.map((plan) => plan.id === editingId
      ? { ...plan, planPrices: plan.planPrices.map((price) => price.id === saved.id ? saved : price) }
      : plan
    ));
  }

  if (current && form) {
    const expectedSlots = current.cycleLengthDays * current.mealsPerDay;
    return (
      <div className={styles.page}>
        <header className={styles.editorHeader}>
          <div>
            <p className={styles.eyebrow}>Plan editor</p>
            <h1>{current.displayName}</h1>
            <p>/{current.slug} · {pretty(current.category)} · {pretty(current.tier)} · {pretty(current.dietaryVariant)}</p>
          </div>
          <button type="button" className={styles.backButton} onClick={closeEditor}>Back to all plans</button>
        </header>

        {message ? <p className={message.kind === "error" ? styles.error : styles.success} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}
        {!planReady({ ...current, planPrices: prices }) ? (
          <p className={styles.notice}>Not ready to sell: {current._count.scheduleSlots} of {expectedSlots} menu slots are filled, with {prices.filter((price) => price.isActive).length} active price rows.</p>
        ) : null}

        <section className={styles.section}>
          <div className={styles.sectionHeader}><div><h2>Status and ordering</h2><p>A live plan appears to customers. The server will block activation until its menu and pricing are complete.</p></div></div>
          <div className={styles.toggleRow}>
            <label className={styles.toggle}><input type="checkbox" checked={form.isActive} onChange={(event) => setField("isActive", event.target.checked)} />Live and sellable</label>
            <label className={styles.toggle}><input type="checkbox" checked={form.isFeatured} onChange={(event) => setField("isFeatured", event.target.checked)} />Featured</label>
          </div>
          <div className={styles.formGrid}>
            <label>Sort order<input type="number" value={form.sortOrder} onChange={(event) => setField("sortOrder", event.target.value)} /></label>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}><div><h2>Customer-facing copy</h2><p>Write in ordinary sentence case. The storefront uses these fields directly.</p></div></div>
          <div className={styles.formGrid}>
            <label>Display name<input value={form.displayName} onChange={(event) => setField("displayName", event.target.value)} /></label>
            <label>Tagline<input value={form.tagline} onChange={(event) => setField("tagline", event.target.value)} /></label>
            <label className={styles.full}>Short description<textarea rows={3} value={form.description} onChange={(event) => setField("description", event.target.value)} /></label>
            <label className={styles.full}>Long description<textarea rows={6} value={form.longDescription} onChange={(event) => setField("longDescription", event.target.value)} /></label>
            <label className={styles.full}>Who this is for<textarea rows={3} value={form.whoIsItFor} onChange={(event) => setField("whoIsItFor", event.target.value)} /></label>
            <label>Key principles, one per line<textarea rows={6} value={form.keyPrinciples} onChange={(event) => setField("keyPrinciples", event.target.value)} /></label>
            <label>What the plan avoids, one per line<textarea rows={6} value={form.whatIsAvoided} onChange={(event) => setField("whatIsAvoided", event.target.value)} /></label>
            <div className={styles.imageField}><ImageUpload label="Plan image" value={form.imageUrl} onChange={(url) => setField("imageUrl", url)} folder="plans" /></div>
            <label>Accent colour<input value={form.accentColor} onChange={(event) => setField("accentColor", event.target.value)} placeholder="#84cc16" /></label>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}><div><h2>Average daily nutrition</h2><p>These numbers drive recommendations and portion personalisation.</p></div></div>
          <div className={styles.macroGrid}>
            <label>Calories<input type="number" min="0" value={form.avgCaloriesPerDay} onChange={(event) => setField("avgCaloriesPerDay", event.target.value)} /></label>
            <label>Protein (g)<input type="number" min="0" value={form.avgProteinGrams} onChange={(event) => setField("avgProteinGrams", event.target.value)} /></label>
            <label>Carbs (g)<input type="number" min="0" value={form.avgCarbsGrams} onChange={(event) => setField("avgCarbsGrams", event.target.value)} /></label>
            <label>Fat (g)<input type="number" min="0" value={form.avgFatGrams} onChange={(event) => setField("avgFatGrams", event.target.value)} /></label>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}><div><h2>Nutritionist and safety copy</h2><p>Only name a professional whose attribution you are authorised to publish.</p></div></div>
          <div className={styles.formGrid}>
            <label>Nutritionist name<input value={form.nutritionistName} onChange={(event) => setField("nutritionistName", event.target.value)} /></label>
            <label>Credentials<input value={form.nutritionistCred} onChange={(event) => setField("nutritionistCred", event.target.value)} placeholder="MSc Nutrition, RD" /></label>
            <label className={styles.full}>Nutritionist bio<textarea rows={3} value={form.nutritionistBio} onChange={(event) => setField("nutritionistBio", event.target.value)} /></label>
            <label className={styles.full}>Medical disclaimer<textarea rows={3} value={form.medicalDisclaimer} onChange={(event) => setField("medicalDisclaimer", event.target.value)} /></label>
          </div>
        </section>

        <div className={styles.formActions}>
          <span>Structural fields such as diet, tier and cycle length stay locked to protect existing orders.</span>
          <div className={styles.actions}>
            <button type="button" onClick={closeEditor} disabled={busy}>Done</button>
            <button type="button" className={styles.primary} onClick={() => void savePlan()} disabled={busy}>{busy ? "Saving…" : "Save plan"}</button>
          </div>
        </div>

        <section className={styles.section}>
          <div className={styles.sectionHeader}><div><h2>Pricing</h2><p>Amounts are whole rupees. MRP cannot be below the selling price.</p></div></div>
          {prices.length === 0 ? (
            <div className={styles.empty}><strong>No price rows</strong><span>This plan cannot go live until pricing exists.</span></div>
          ) : (
            <div className={styles.priceList}>
              {prices.map((price) => <PriceEditor key={price.id} row={price} onSaved={savePriceLocally} />)}
            </div>
          )}
        </section>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div><p className={styles.eyebrow}>Catalogue</p><h1>Plans and pricing</h1><p>See which plans are genuinely ready, then control their sales copy, nutrition targets and checkout prices.</p></div>
      </header>
      {message ? <p className={message.kind === "error" ? styles.error : styles.success} role={message.kind === "error" ? "alert" : "status"}>{message.text}</p> : null}
      <section className={styles.metrics} aria-label="Plan summary">
        <article><span>Live plans</span><strong>{metrics.live}</strong><small>Visible and sellable</small></article>
        <article><span>Ready plans</span><strong>{metrics.ready}</strong><small>Menu and price complete</small></article>
        <article><span>Missing prices</span><strong>{metrics.missingPrices}</strong><small>Cannot be activated</small></article>
      </section>
      <section className={styles.filters} aria-label="Filter plans">
        <label>Search<input type="search" value={query} placeholder="Name, slug or diet" onChange={(event) => setQuery(event.target.value)} /></label>
        <label>Status<select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="ALL">All plans</option><option value="LIVE">Live</option><option value="HIDDEN">Hidden</option><option value="NOT_READY">Not ready</option></select></label>
      </section>
      {visiblePlans.length === 0 ? (
        <div className={styles.empty}><strong>No plans match</strong><span>Change the search or status filter.</span></div>
      ) : (
        <section className={styles.planList} aria-label="Meal plans">
          {visiblePlans.map((plan) => {
            const ready = planReady(plan);
            const expected = plan.cycleLengthDays * plan.mealsPerDay;
            return (
              <article key={plan.id} className={styles.planCard}>
                <div className={styles.identity}>
                  <div><strong>{plan.displayName}</strong><span className={`${styles.status} ${plan.isActive ? styles.live : styles.hidden}`}>{plan.isActive ? "Live" : "Hidden"}</span>{!ready ? <span className={`${styles.status} ${styles.attention}`}>Not ready</span> : null}</div>
                  <small>/{plan.slug} · {pretty(plan.tier)} · {pretty(plan.dietaryVariant)}</small>
                </div>
                <div className={styles.readiness}>
                  <strong>{plan._count.scheduleSlots} of {expected} menu slots · {plan.planPrices.filter((price) => price.isActive).length} active prices</strong>
                  <small>{plan.avgCaloriesPerDay.toLocaleString("en-IN")} kcal · {plan.avgProteinGrams}g protein</small>
                </div>
                <div className={styles.actions}>
                  <button type="button" className={plan.isActive ? styles.pause : styles.primary} onClick={() => void toggleLive(plan)} disabled={workingId === plan.id}>{plan.isActive ? "Hide" : "Make live"}</button>
                  <button type="button" onClick={() => startEdit(plan)} disabled={workingId === plan.id}>Edit</button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

function PriceEditor({ row, onSaved }: { row: PlanPriceRecord; onSaved: (row: PlanPriceRecord) => void }) {
  const [priceRs, setPriceRs] = useState(String(row.priceRs));
  const [mrpRs, setMrpRs] = useState(row.mrpRs === null ? "" : String(row.mrpRs));
  const [gstPercent, setGstPercent] = useState(String(row.gstPercent));
  const [isActive, setIsActive] = useState(row.isActive);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<Message>(null);
  const dirty = Number(priceRs) !== row.priceRs
    || (mrpRs === "" ? null : Number(mrpRs)) !== row.mrpRs
    || Number(gstPercent) !== row.gstPercent
    || isActive !== row.isActive;

  async function save() {
    setBusy(true);
    setMessage(null);
    try {
      await saveRequest("updatePrice", row.id, { priceRs, mrpRs, gstPercent, isActive });
      onSaved({ ...row, priceRs: Number(priceRs), mrpRs: mrpRs === "" ? null : Number(mrpRs), gstPercent: Number(gstPercent), isActive });
      setMessage({ kind: "success", text: "Saved" });
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Price could not be saved." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className={styles.priceCard}>
      <div className={styles.priceIdentity}><strong>{pretty(row.bundle)}{row.isDigital ? " digital" : " meal plan"}</strong><small>{pretty(row.duration)} · {pretty(row.mealsPerDay)} · {pretty(row.diet)}</small></div>
      <div className={styles.priceFields}>
        <label>Price<input type="number" min="1" value={priceRs} onChange={(event) => setPriceRs(event.target.value)} /></label>
        <label>MRP<input type="number" min="1" value={mrpRs} placeholder="None" onChange={(event) => setMrpRs(event.target.value)} /></label>
        <label>GST %<input type="number" min="0" max="28" value={gstPercent} onChange={(event) => setGstPercent(event.target.value)} /></label>
      </div>
      <div className={styles.priceActions}>
        <label><input type="checkbox" checked={isActive} onChange={(event) => setIsActive(event.target.checked)} />Active</label>
        <button type="button" className={styles.primary} onClick={() => void save()} disabled={!dirty || busy}>{busy ? "Saving…" : "Save"}</button>
        {message ? <span className={message.kind === "error" ? styles.error : styles.success} role={message.kind === "error" ? "alert" : "status"}>{message.text}</span> : null}
      </div>
    </article>
  );
}
