"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import styles from "./supplements-admin.module.css";

const NETWORKS = [
  "NUTRABAY", "HEALTHKART", "MUSCLEBLAZE", "AMAZON_IN", "FLIPKART",
  "TATA_1MG", "WELLNESS_FOREVER", "OTHER",
] as const;
const GOALS = ["MUSCLE_GAIN", "WEIGHT_LOSS", "BALANCED", "PERFORMANCE"] as const;
const NETWORK_LABEL: Record<string, string> = {
  NUTRABAY: "Nutrabay", HEALTHKART: "HealthKart", MUSCLEBLAZE: "MuscleBlaze",
  AMAZON_IN: "Amazon", FLIPKART: "Flipkart", TATA_1MG: "Tata 1mg",
  WELLNESS_FOREVER: "Wellness Forever", OTHER: "Other merchant",
};
const GOAL_LABEL: Record<string, string> = {
  MUSCLE_GAIN: "Build muscle", WEIGHT_LOSS: "Lose weight", BALANCED: "General health", PERFORMANCE: "Performance",
};
const money = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

type Network = typeof NETWORKS[number];
type Goal = typeof GOALS[number];
type Category = { slug: string; name: string; emoji: string | null };
type SupplementSummary = {
  id: string;
  slug: string;
  name: string;
  tagline: string | null;
  emoji: string | null;
  accentColor: string | null;
  categorySlug: string;
  categoryName: string;
  categoryEmoji: string | null;
  recommendedFor: Goal[];
  isActive: boolean;
  isFeatured: boolean;
  sortOrder: number;
  linkCount: number;
  clickCount: number;
  priceRange: string | null;
};
type BuyingLink = {
  id: string;
  network: Network;
  merchantLabel: string | null;
  affiliateUrl: string;
  priceRs: number | null;
  mrpRs: number | null;
  notes: string | null;
  sortOrder: number;
  isActive: boolean;
};
type SupplementDetail = {
  id: string;
  name: string;
  slug: string;
  category: { slug: string; name: string; isActive: boolean };
  tagline: string | null;
  description: string | null;
  mechanism: string | null;
  benefits: string[];
  dosage: string | null;
  timing: string | null;
  warnings: string | null;
  sideEffects: string[];
  genderNotes: string | null;
  ageNotes: string | null;
  evidenceLevel: string | null;
  studyCount: string | null;
  keyStudyFindings: string[];
  priceRange: string | null;
  valueRating: string | null;
  indiaAvailability: string | null;
  indiaNote: string | null;
  imageUrl: string | null;
  brandName: string | null;
  isFeatured: boolean;
  popular: boolean;
  veganFriendly: boolean;
  isActive: boolean;
  sortOrder: number;
  recommendedFor: Goal[];
  links: BuyingLink[];
};
type EditorForm = {
  name: string; categorySlug: string; brandName: string; tagline: string; description: string;
  mechanism: string; benefits: string; dosage: string; timing: string; warnings: string;
  sideEffects: string; genderNotes: string; ageNotes: string; evidenceLevel: string;
  studyCount: string; keyStudyFindings: string; priceRange: string; valueRating: string;
  indiaAvailability: string; indiaNote: string; imageUrl: string; isFeatured: boolean;
  popular: boolean; veganFriendly: boolean; isActive: boolean; sortOrder: string;
  recommendedFor: Goal[];
};
type AnalyticsData = {
  days: number;
  totalClicks: number;
  signedInClicks: number;
  uniqueUsers: number;
  topProducts: Array<{ supplementId: string; name: string; slug: string | null; clicks: number }>;
  topNetworks: Array<{ network: Network; clicks: number }>;
  dailyTrend: Array<{ date: string; clicks: number }>;
};

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const payload = (await response.json().catch(() => null)) as (T & { error?: string }) | null;
  if (!response.ok || !payload) throw new Error(payload?.error ?? "The request failed.");
  return payload;
}

function nullable(value: string) {
  return value.trim() || null;
}

function lines(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 100);
}

function toEditorForm(detail: SupplementDetail): EditorForm {
  return {
    name: detail.name,
    categorySlug: detail.category.slug,
    brandName: detail.brandName ?? "",
    tagline: detail.tagline ?? "",
    description: detail.description ?? "",
    mechanism: detail.mechanism ?? "",
    benefits: detail.benefits.join("\n"),
    dosage: detail.dosage ?? "",
    timing: detail.timing ?? "",
    warnings: detail.warnings ?? "",
    sideEffects: detail.sideEffects.join("\n"),
    genderNotes: detail.genderNotes ?? "",
    ageNotes: detail.ageNotes ?? "",
    evidenceLevel: detail.evidenceLevel ?? "",
    studyCount: detail.studyCount ?? "",
    keyStudyFindings: detail.keyStudyFindings.join("\n"),
    priceRange: detail.priceRange ?? "",
    valueRating: detail.valueRating ?? "",
    indiaAvailability: detail.indiaAvailability ?? "",
    indiaNote: detail.indiaNote ?? "",
    imageUrl: detail.imageUrl ?? "",
    isFeatured: detail.isFeatured,
    popular: detail.popular,
    veganFriendly: detail.veganFriendly,
    isActive: detail.isActive,
    sortOrder: String(detail.sortOrder),
    recommendedFor: detail.recommendedFor,
  };
}

export default function SupplementsAdminClient() {
  const [tab, setTab] = useState<"catalog" | "analytics">("catalog");

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Evidence commerce</p>
          <h1>Supplement marketplace</h1>
          <p>Control what FitFuel recommends, the India-specific evidence customers see, and where each verified buying link sends them.</p>
        </div>
      </header>

      <div className={styles.tabs} role="tablist" aria-label="Supplement marketplace sections">
        <button type="button" role="tab" aria-selected={tab === "catalog"} onClick={() => setTab("catalog")}>Catalogue</button>
        <button type="button" role="tab" aria-selected={tab === "analytics"} onClick={() => setTab("analytics")}>Buying-link analytics</button>
      </div>

      {tab === "catalog" ? <CatalogTab /> : <AnalyticsTab />}
    </main>
  );
}

function CatalogTab() {
  const [items, setItems] = useState<SupplementSummary[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [includeInactive, setIncludeInactive] = useState(true);
  const [openId, setOpenId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category) params.set("category", category);
    if (includeInactive) params.set("includeInactive", "1");
    try {
      const data = await requestJson<{ supplements: SupplementSummary[]; categories: Category[] }>(`/api/admin/supplements?${params}`);
      setItems(data.supplements);
      setCategories(data.categories);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The supplement catalogue could not be loaded.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    requestJson<{ supplements: SupplementSummary[]; categories: Category[] }>("/api/admin/supplements?includeInactive=1")
      .then((data) => {
        if (cancelled) return;
        setItems(data.supplements);
        setCategories(data.categories);
      })
      .catch((caught: unknown) => {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "The supplement catalogue could not be loaded.");
        setItems([]);
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const summary = useMemo(() => ({
    live: items?.filter((item) => item.isActive).length ?? 0,
    missingLinks: items?.filter((item) => item.isActive && item.linkCount === 0).length ?? 0,
    clicks: items?.reduce((sum, item) => sum + item.clickCount, 0) ?? 0,
  }), [items]);

  return (
    <section className={styles.catalogPanel} role="tabpanel">
      <div className={styles.metrics}>
        <Metric label="Live entries" value={summary.live} note="Visible to customers" />
        <Metric label="Live without sellers" value={summary.missingLinks} note="No buying path yet" warning={summary.missingLinks > 0} />
        <Metric label="Tracked clicks" value={summary.clicks} note="Across the loaded view" />
      </div>

      <div className={styles.catalogTools}>
        <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); void load(); }}>
          <label className={styles.searchField}>
            <span>Search catalogue</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, slug or customer-facing copy" />
          </label>
          <label>
            <span>Category</span>
            <select value={category} onChange={(event) => setCategory(event.target.value)}>
              <option value="">All categories</option>
              {categories.map((item) => <option value={item.slug} key={item.slug}>{item.name}</option>)}
            </select>
          </label>
          <label className={styles.checkLabel}>
            <input type="checkbox" checked={includeInactive} onChange={(event) => setIncludeInactive(event.target.checked)} />
            <span>Include drafts</span>
          </label>
          <button type="submit" disabled={loading}>{loading ? "Loading…" : "Apply filters"}</button>
        </form>
        <button className={styles.primaryButton} type="button" onClick={() => setCreating((value) => !value)}>
          {creating ? "Close new entry" : "Add supplement"}
        </button>
      </div>

      {creating ? (
        <CreateSupplement
          categories={categories}
          onCreated={(id) => { setCreating(false); setOpenId(id); void load(); }}
          onCancel={() => setCreating(false)}
        />
      ) : null}

      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {items === null ? <Loading label="Loading supplement catalogue…" /> : items.length === 0 ? (
        <div className={styles.empty}><strong>No matching supplements</strong><span>Change the filters or create the first entry.</span></div>
      ) : (
        <div className={styles.supplementList}>
          {items.map((supplement) => (
            <SupplementRow
              supplement={supplement}
              categories={categories}
              open={openId === supplement.id}
              onToggle={() => setOpenId(openId === supplement.id ? null : supplement.id)}
              onChanged={() => { void load(); }}
              key={supplement.id}
            />
          ))}
        </div>
      )}
    </section>
  );
}

function Metric({ label, value, note, warning = false }: { label: string; value: number; note: string; warning?: boolean }) {
  return <article className={warning ? styles.metricWarning : undefined}><span>{label}</span><strong>{value}</strong><small>{note}</small></article>;
}

function CreateSupplement({ categories, onCreated, onCancel }: { categories: Category[]; onCreated: (id: string) => void; onCancel: () => void }) {
  const [form, setForm] = useState({ name: "", slug: "", categorySlug: categories[0]?.slug ?? "", tagline: "" });
  const [slugEdited, setSlugEdited] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    try {
      const data = await requestJson<{ supplement: { id: string } }>("/api/admin/supplements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          slug: form.slug,
          name: form.name,
          categorySlug: form.categorySlug,
          tagline: nullable(form.tagline),
        }),
      });
      onCreated(data.supplement.id);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The supplement could not be created.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.createForm} onSubmit={submit}>
      <div className={styles.sectionTitle}><div><h2>Start a draft</h2><p>Drafts stay private until the evidence, safety and India context are complete.</p></div></div>
      <div className={styles.formGrid}>
        <Field label="Supplement name"><input required maxLength={160} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value, ...(!slugEdited ? { slug: slugify(event.target.value) } : {}) }))} /></Field>
        <Field label="URL slug"><input required maxLength={100} pattern="[a-z0-9]+(?:-[a-z0-9]+)*" value={form.slug} onChange={(event) => { setSlugEdited(true); setForm((current) => ({ ...current, slug: event.target.value })); }} /></Field>
        <Field label="Category"><select required value={form.categorySlug} onChange={(event) => setForm((current) => ({ ...current, categorySlug: event.target.value }))}>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></Field>
        <Field label="Short promise"><input maxLength={300} value={form.tagline} onChange={(event) => setForm((current) => ({ ...current, tagline: event.target.value }))} placeholder="What a customer should understand in one line" /></Field>
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.formActions}><button type="button" onClick={onCancel}>Cancel</button><button className={styles.primaryButton} disabled={saving}>{saving ? "Creating…" : "Create private draft"}</button></div>
    </form>
  );
}

function SupplementRow({ supplement, categories, open, onToggle, onChanged }: {
  supplement: SupplementSummary; categories: Category[]; open: boolean; onToggle: () => void; onChanged: () => void;
}) {
  const detailId = `supplement-${supplement.id}`;
  return (
    <article className={open ? `${styles.supplementRow} ${styles.supplementRowOpen}` : styles.supplementRow}>
      <button className={styles.supplementSummary} type="button" onClick={onToggle} aria-expanded={open} aria-controls={detailId}>
        <span className={styles.initial} aria-hidden="true">{supplement.name.slice(0, 1).toUpperCase()}</span>
        <span className={styles.supplementName}><strong>{supplement.name}</strong><small>{supplement.categoryName}{supplement.tagline ? ` · ${supplement.tagline}` : ""}</small></span>
        <span className={supplement.isActive ? styles.liveStatus : styles.draftStatus}>{supplement.isActive ? "Live" : "Draft"}</span>
        <span className={styles.rowStat}><strong>{supplement.linkCount}</strong><small>sellers</small></span>
        <span className={styles.rowStat}><strong>{supplement.clickCount}</strong><small>clicks</small></span>
        <span className={styles.expandIcon} aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open ? <SupplementEditor supplementId={supplement.id} categories={categories} onChanged={onChanged} id={detailId} /> : null}
    </article>
  );
}

function SupplementEditor({ supplementId, categories, onChanged, id }: { supplementId: string; categories: Category[]; onChanged: () => void; id: string }) {
  const [detail, setDetail] = useState<SupplementDetail | null>(null);
  const [form, setForm] = useState<EditorForm | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setLoading(true);
    try {
      const data = await requestJson<{ supplement: SupplementDetail }>(`/api/admin/supplements/${supplementId}`);
      setDetail(data.supplement);
      setForm(toEditorForm(data.supplement));
      setError(null);
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The supplement could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    requestJson<{ supplement: SupplementDetail }>(`/api/admin/supplements/${supplementId}`)
      .then((data) => {
        if (cancelled) return;
        setDetail(data.supplement);
        setForm(toEditorForm(data.supplement));
      })
      .catch((caught: unknown) => {
        if (!cancelled) setError(caught instanceof Error ? caught.message : "The supplement could not be loaded.");
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [supplementId]);

  function update<K extends keyof EditorForm>(key: K, value: EditorForm[K]) {
    setForm((current) => current ? { ...current, [key]: value } : current);
  }

  async function save() {
    if (!form || !detail) return;
    if (!detail.isActive && form.isActive && !window.confirm("Publish this supplement to the customer catalogue? The server will reject it if evidence or safety context is incomplete.")) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      await requestJson(`/api/admin/supplements/${supplementId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          categorySlug: form.categorySlug,
          brandName: nullable(form.brandName),
          tagline: nullable(form.tagline),
          description: nullable(form.description),
          mechanism: nullable(form.mechanism),
          benefits: lines(form.benefits),
          dosage: nullable(form.dosage),
          timing: nullable(form.timing),
          warnings: nullable(form.warnings),
          sideEffects: lines(form.sideEffects),
          genderNotes: nullable(form.genderNotes),
          ageNotes: nullable(form.ageNotes),
          evidenceLevel: nullable(form.evidenceLevel),
          studyCount: nullable(form.studyCount),
          keyStudyFindings: lines(form.keyStudyFindings),
          priceRange: nullable(form.priceRange),
          valueRating: nullable(form.valueRating),
          indiaAvailability: nullable(form.indiaAvailability),
          indiaNote: nullable(form.indiaNote),
          imageUrl: nullable(form.imageUrl),
          isFeatured: form.isFeatured,
          popular: form.popular,
          veganFriendly: form.veganFriendly,
          isActive: form.isActive,
          sortOrder: Number(form.sortOrder),
          recommendedFor: form.recommendedFor,
        }),
      });
      setMessage(form.isActive ? "Customer-facing supplement saved." : "Private draft saved.");
      await reload();
      onChanged();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The supplement could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  if (loading && !form) return <div className={styles.editor} id={id}><Loading label="Loading evidence and buying links…" /></div>;
  if (!form || !detail) return <div className={styles.editor} id={id}>{error ? <p className={styles.error}>{error}</p> : null}</div>;

  return (
    <div className={styles.editor} id={id}>
      <div className={styles.editorGrid}>
        <section>
          <SectionHeading title="Customer-facing entry" note="Plain language first; research context must support the recommendation." />
          <div className={styles.formGrid}>
            <Field label="Name"><input value={form.name} onChange={(event) => update("name", event.target.value)} /></Field>
            <Field label="Category"><select value={form.categorySlug} onChange={(event) => update("categorySlug", event.target.value)}>{categories.map((item) => <option key={item.slug} value={item.slug}>{item.name}</option>)}</select></Field>
            <Field label="Brand, if relevant"><input value={form.brandName} onChange={(event) => update("brandName", event.target.value)} /></Field>
            <Field label="Image URL"><input value={form.imageUrl} onChange={(event) => update("imageUrl", event.target.value)} placeholder="HTTPS or /images/…" /></Field>
            <Field label="Tagline" wide><input value={form.tagline} onChange={(event) => update("tagline", event.target.value)} /></Field>
            <Field label="Description" wide><textarea rows={4} value={form.description} onChange={(event) => update("description", event.target.value)} /></Field>
            <Field label="How it works" wide><textarea rows={4} value={form.mechanism} onChange={(event) => update("mechanism", event.target.value)} /></Field>
            <Field label="Benefits · one per line" wide><textarea rows={4} value={form.benefits} onChange={(event) => update("benefits", event.target.value)} /></Field>
          </div>

          <SectionHeading title="Evidence and safety" note="Do not publish a confidence label without study context and a clear warning." />
          <div className={styles.formGrid}>
            <Field label="Evidence level"><select value={form.evidenceLevel} onChange={(event) => update("evidenceLevel", event.target.value)}><option value="">Choose</option><option value="very_high">Very high</option><option value="high">High</option><option value="moderate">Moderate</option><option value="low">Low</option><option value="preliminary">Preliminary</option></select></Field>
            <Field label="Study context"><input value={form.studyCount} onChange={(event) => update("studyCount", event.target.value)} placeholder="e.g. 25+ human trials" /></Field>
            <Field label="Dosage"><input value={form.dosage} onChange={(event) => update("dosage", event.target.value)} /></Field>
            <Field label="Timing"><input value={form.timing} onChange={(event) => update("timing", event.target.value)} /></Field>
            <Field label="Evidence findings · one per line" wide><textarea rows={5} value={form.keyStudyFindings} onChange={(event) => update("keyStudyFindings", event.target.value)} /></Field>
            <Field label="Safety warning" wide><textarea rows={4} value={form.warnings} onChange={(event) => update("warnings", event.target.value)} /></Field>
            <Field label="Possible side effects · one per line" wide><textarea rows={3} value={form.sideEffects} onChange={(event) => update("sideEffects", event.target.value)} /></Field>
            <Field label="Age-specific notes"><textarea rows={3} value={form.ageNotes} onChange={(event) => update("ageNotes", event.target.value)} /></Field>
            <Field label="Gender-specific notes"><textarea rows={3} value={form.genderNotes} onChange={(event) => update("genderNotes", event.target.value)} /></Field>
          </div>
        </section>

        <aside>
          <SectionHeading title="India and merchandising" note="Separate guidance from the external seller relationship." />
          <div className={styles.asideFields}>
            <Field label="Typical India price"><input value={form.priceRange} onChange={(event) => update("priceRange", event.target.value)} placeholder="₹800–₹1,200 per month" /></Field>
            <Field label="Availability"><select value={form.indiaAvailability} onChange={(event) => update("indiaAvailability", event.target.value)}><option value="">Choose</option><option value="widely_available">Widely available</option><option value="available">Available</option><option value="limited">Limited</option><option value="import_only">Import only</option></select></Field>
            <Field label="India buying context"><textarea rows={4} value={form.indiaNote} onChange={(event) => update("indiaNote", event.target.value)} /></Field>
            <Field label="Value rating"><select value={form.valueRating} onChange={(event) => update("valueRating", event.target.value)}><option value="">Choose</option><option value="exceptional">Exceptional</option><option value="good">Good</option><option value="moderate">Moderate</option><option value="expensive">Expensive</option></select></Field>
            <Field label="Sort order"><input type="number" value={form.sortOrder} onChange={(event) => update("sortOrder", event.target.value)} /></Field>
          </div>

          <fieldset className={styles.goalPicker}>
            <legend>Recommended goals</legend>
            {GOALS.map((goal) => <Check key={goal} label={GOAL_LABEL[goal]} checked={form.recommendedFor.includes(goal)} onChange={(checked) => update("recommendedFor", checked ? [...form.recommendedFor, goal] : form.recommendedFor.filter((item) => item !== goal))} />)}
          </fieldset>
          <div className={styles.toggleList}>
            <Check label="Vegan friendly" checked={form.veganFriendly} onChange={(value) => update("veganFriendly", value)} />
            <Check label="Popular" checked={form.popular} onChange={(value) => update("popular", value)} />
            <Check label="Featured placement" checked={form.isFeatured} onChange={(value) => update("isFeatured", value)} />
            <Check label="Published to customers" checked={form.isActive} onChange={(value) => update("isActive", value)} />
          </div>

          {form.imageUrl ? (
            <div className={styles.imagePreview}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={form.imageUrl} alt={`${form.name} product preview`} />
            </div>
          ) : null}
        </aside>
      </div>

      {message ? <p className={styles.success} role="status">{message}</p> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.stickySave}><span>{form.isActive ? "Changes affect the live catalogue." : "This entry is private."}</span><button className={styles.primaryButton} type="button" disabled={saving} onClick={() => void save()}>{saving ? "Saving…" : "Save supplement"}</button></div>

      <BuyingLinks supplementId={supplementId} active={detail.isActive} links={detail.links} onChanged={async () => { await reload(); onChanged(); }} />
    </div>
  );
}

function BuyingLinks({ supplementId, active, links: buyingLinks, onChanged }: { supplementId: string; active: boolean; links: BuyingLink[]; onChanged: () => Promise<void> }) {
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<BuyingLink | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function remove(link: BuyingLink) {
    if (!window.confirm(`Remove ${link.merchantLabel || NETWORK_LABEL[link.network]}? Click history will be preserved.`)) return;
    setError(null);
    try {
      await requestJson(`/api/admin/supplements/links/${link.id}`, { method: "DELETE" });
      await onChanged();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The buying link could not be removed.");
    }
  }

  return (
    <section className={styles.linksSection}>
      <SectionHeading title="Verified buying links" note="Only active HTTPS destinations are sent to customers. Click tracking never exposes the raw URL." />
      <div className={styles.linksHeader}>
        <p>{buyingLinks.filter((link) => link.isActive).length} active seller{buyingLinks.filter((link) => link.isActive).length === 1 ? "" : "s"}</p>
        <button type="button" className={styles.primaryButton} disabled={!active || adding} onClick={() => setAdding(true)}>Add seller</button>
      </div>
      {!active ? <p className={styles.notice}>Publish and save the supplement before adding a buying link.</p> : null}
      {adding ? <BuyingLinkForm supplementId={supplementId} onSaved={async () => { setAdding(false); await onChanged(); }} onCancel={() => setAdding(false)} /> : null}
      {editing ? <BuyingLinkForm supplementId={supplementId} existing={editing} onSaved={async () => { setEditing(null); await onChanged(); }} onCancel={() => setEditing(null)} /> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.linkList}>
        {buyingLinks.length === 0 ? <div className={styles.emptyCompact}>No seller links yet.</div> : buyingLinks.map((link) => (
          <article className={!link.isActive ? styles.linkInactive : undefined} key={link.id}>
            <div><strong>{link.merchantLabel || NETWORK_LABEL[link.network]}</strong><small>{link.notes || "No pack details"}</small><a href={link.affiliateUrl} target="_blank" rel="noopener noreferrer">Open destination ↗</a></div>
            <div className={styles.linkPrice}><strong>{link.priceRs ? money.format(link.priceRs) : "Price not set"}</strong>{link.mrpRs && link.priceRs && link.mrpRs > link.priceRs ? <small>MRP {money.format(link.mrpRs)}</small> : null}</div>
            <span className={link.isActive ? styles.liveStatus : styles.draftStatus}>{link.isActive ? "Active" : "Inactive"}</span>
            <div className={styles.linkActions}><button type="button" onClick={() => setEditing(link)}>Edit</button><button type="button" className={styles.dangerText} onClick={() => void remove(link)}>Remove</button></div>
          </article>
        ))}
      </div>
    </section>
  );
}

function BuyingLinkForm({ supplementId, existing, onSaved, onCancel }: { supplementId: string; existing?: BuyingLink; onSaved: () => Promise<void>; onCancel: () => void }) {
  const [form, setForm] = useState({
    network: existing?.network ?? "NUTRABAY" as Network,
    affiliateUrl: existing?.affiliateUrl ?? "",
    merchantLabel: existing?.merchantLabel ?? "",
    priceRs: existing?.priceRs ? String(existing.priceRs) : "",
    mrpRs: existing?.mrpRs ? String(existing.mrpRs) : "",
    notes: existing?.notes ?? "",
    isActive: existing?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      network: form.network,
      affiliateUrl: form.affiliateUrl,
      merchantLabel: nullable(form.merchantLabel),
      priceRs: form.priceRs ? Number(form.priceRs) : null,
      mrpRs: form.mrpRs ? Number(form.mrpRs) : null,
      notes: nullable(form.notes),
      ...(existing ? { isActive: form.isActive } : {}),
    };
    try {
      await requestJson(existing ? `/api/admin/supplements/links/${existing.id}` : `/api/admin/supplements/${supplementId}/links`, {
        method: existing ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      await onSaved();
    } catch (caught: unknown) {
      setError(caught instanceof Error ? caught.message : "The buying link could not be saved.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className={styles.linkForm} onSubmit={submit}>
      <div className={styles.formGrid}>
        <Field label="Seller"><select value={form.network} onChange={(event) => setForm((current) => ({ ...current, network: event.target.value as Network }))}>{NETWORKS.map((network) => <option value={network} key={network}>{NETWORK_LABEL[network]}</option>)}</select></Field>
        <Field label="HTTPS affiliate URL" wide><input type="url" required value={form.affiliateUrl} onChange={(event) => setForm((current) => ({ ...current, affiliateUrl: event.target.value }))} placeholder="https://…" /></Field>
        {form.network === "OTHER" ? <Field label="Merchant name"><input required value={form.merchantLabel} onChange={(event) => setForm((current) => ({ ...current, merchantLabel: event.target.value }))} /></Field> : null}
        <Field label="Selling price"><input type="number" min="1" value={form.priceRs} onChange={(event) => setForm((current) => ({ ...current, priceRs: event.target.value }))} /></Field>
        <Field label="MRP"><input type="number" min="1" value={form.mrpRs} onChange={(event) => setForm((current) => ({ ...current, mrpRs: event.target.value }))} /></Field>
        <Field label="Pack or seller notes"><input value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="1 kg · 30 servings" /></Field>
      </div>
      {existing ? <Check label="Active buying link" checked={form.isActive} onChange={(value) => setForm((current) => ({ ...current, isActive: value }))} /> : null}
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <div className={styles.formActions}><button type="button" onClick={onCancel}>Cancel</button><button className={styles.primaryButton} disabled={saving}>{saving ? "Saving…" : existing ? "Save seller" : "Add seller"}</button></div>
    </form>
  );
}

function AnalyticsTab() {
  const [days, setDays] = useState(30);
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    requestJson<AnalyticsData>(`/api/admin/supplements/clicks?days=${days}`)
      .then((result) => { if (!cancelled) { setData(result); setError(null); } })
      .catch((caught: unknown) => { if (!cancelled) setError(caught instanceof Error ? caught.message : "Analytics could not be loaded."); });
    return () => { cancelled = true; };
  }, [days]);

  const maxDaily = Math.max(1, ...(data?.dailyTrend.map((day) => day.clicks) ?? [1]));
  return (
    <section className={styles.analytics} role="tabpanel">
      <div className={styles.rangePicker} aria-label="Analytics period">
        {[7, 14, 30, 90].map((range) => <button type="button" aria-pressed={days === range} onClick={() => { setData(null); setDays(range); }} key={range}>{range} days</button>)}
      </div>
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      {!data ? <Loading label="Loading buying-link analytics…" /> : (
        <>
          <div className={styles.metrics}>
            <Metric label="Seller clicks" value={data.totalClicks} note={`Last ${data.days} days`} />
            <Metric label="Signed-in clicks" value={data.signedInClicks} note="Known FitFuel customers" />
            <Metric label="Unique signed-in users" value={data.uniqueUsers} note="Not raw IP estimates" />
          </div>
          <div className={styles.analyticsGrid}>
            <section className={styles.chartPanel}>
              <SectionHeading title="Daily interest" note="A directional click signal, not completed retailer sales." />
              <div className={styles.barChart}>
                {data.dailyTrend.map((day) => <div className={styles.barColumn} key={day.date} title={`${day.date}: ${day.clicks} clicks`}><span>{day.clicks || ""}</span><i style={{ height: `${Math.max(day.clicks ? 5 : 0, (day.clicks / maxDaily) * 100)}%` }} /><small>{day.date.slice(5)}</small></div>)}
              </div>
            </section>
            <section className={styles.networkPanel}>
              <SectionHeading title="Seller split" note="Which destination customers choose." />
              {data.topNetworks.length === 0 ? <div className={styles.emptyCompact}>No clicks yet.</div> : data.topNetworks.map((network) => <div className={styles.rankRow} key={network.network}><span>{NETWORK_LABEL[network.network]}</span><strong>{network.clicks}</strong></div>)}
            </section>
          </div>
          <section className={styles.productsPanel}>
            <SectionHeading title="Most-clicked supplements" note="Use this with margin and retailer conversion data before changing recommendations." />
            {data.topProducts.length === 0 ? <div className={styles.emptyCompact}>No tracked supplement clicks yet.</div> : data.topProducts.map((product, index) => <div className={styles.productRank} key={product.supplementId}><span>{index + 1}</span><div><strong>{product.name}</strong><small>{product.slug ?? "Removed entry"}</small></div><strong>{product.clicks}</strong></div>)}
          </section>
        </>
      )}
    </section>
  );
}

function SectionHeading({ title, note }: { title: string; note: string }) {
  return <div className={styles.sectionTitle}><div><h2>{title}</h2><p>{note}</p></div></div>;
}

function Field({ label, wide = false, children }: { label: string; wide?: boolean; children: ReactNode }) {
  return <label className={wide ? styles.wideField : undefined}><span>{label}</span>{children}</label>;
}

function Check({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return <label className={styles.checkLabel}><input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} /><span>{label}</span></label>;
}

function Loading({ label }: { label: string }) {
  return <div className={styles.loading} role="status"><span />{label}</div>;
}
