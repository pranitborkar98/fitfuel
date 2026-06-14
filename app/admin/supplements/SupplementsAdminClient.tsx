"use client";

// app/admin/supplements/SupplementsAdminClient.tsx
// Phase 18-2 — Admin UI for supplements catalog.
// Tabs: Catalog (default) | Analytics
// Catalog view: list 46+ products, expand row to manage affiliate links.

import { useEffect, useState } from "react";

const T = {
  bg: "#0a0a0a", card: "#111", border: "#1f1f1f",
  accent: "#84cc16", accent2: "#a3e635",
  text: "#fff", dim: "#888", muted: "#666",
  ok: "#22c55e", warn: "#f59e0b", err: "#ef4444",
};
const RUPEE = "\u20B9";
const NETWORKS = [
  "NUTRABAY", "HEALTHKART", "MUSCLEBLAZE", "AMAZON_IN", "FLIPKART",
  "TATA_1MG", "WELLNESS_FOREVER", "OTHER",
];
const NETWORK_LABEL: Record<string, string> = {
  NUTRABAY: "Nutrabay", HEALTHKART: "HealthKart", MUSCLEBLAZE: "MuscleBlaze",
  AMAZON_IN: "Amazon", FLIPKART: "Flipkart", TATA_1MG: "Tata 1mg",
  WELLNESS_FOREVER: "Wellness Forever", OTHER: "Other",
};

type Supplement = {
  id: string; slug: string; name: string; tagline: string | null;
  emoji: string | null; accentColor: string | null;
  categorySlug: string; categoryName: string; categoryEmoji: string | null;
  recommendedFor: string[]; isActive: boolean; isFeatured: boolean;
  sortOrder: number; linkCount: number; clickCount: number;
  priceRange: string | null;
};
type Category = { slug: string; name: string; emoji: string | null };

export default function SupplementsAdminClient() {
  const [tab, setTab] = useState<"catalog" | "analytics">("catalog");

  return (
    <div style={{ background: T.bg, minHeight: "100vh", color: T.text, padding: "24px 20px" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>

        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
          <h1 style={{ fontFamily: '"Syne", system-ui', fontSize: 28, fontWeight: 800, margin: 0 }}>Supplements</h1>
          <div style={{ fontSize: 12, color: T.dim }}>Affiliate catalog + click analytics</div>
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          <TabButton active={tab === "catalog"} onClick={() => setTab("catalog")}>Catalog</TabButton>
          <TabButton active={tab === "analytics"} onClick={() => setTab("analytics")}>Analytics</TabButton>
        </div>

        {tab === "catalog" ? <CatalogTab /> : <AnalyticsTab />}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: any }) {
  return (
    <button onClick={onClick} style={{
      background: active ? T.accent : "transparent",
      color: active ? "#000" : "#bbb",
      border: `1px solid ${active ? T.accent : "#2a2a2a"}`,
      borderRadius: 8, padding: "8px 16px", fontWeight: active ? 700 : 500,
      fontSize: 13, cursor: "pointer",
    }}>{children}</button>
  );
}

/* ────────────────── CATALOG TAB ────────────────── */

function CatalogTab() {
  const [items, setItems] = useState<Supplement[] | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [q, setQ] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [includeInactive, setIncludeInactive] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setItems(null);
    setError(null);
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (categoryFilter) params.set("category", categoryFilter);
    if (includeInactive) params.set("includeInactive", "1");
    try {
      const r = await fetch("/api/admin/supplements?" + params.toString());
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        setError(`API ${r.status}: ${text.slice(0, 200) || r.statusText}`);
        setItems([]);
        return;
      }
      const j = await r.json();
      setItems(j.supplements || []);
      setCategories(j.categories || []);
    } catch (e: any) {
      setError(`Network: ${e?.message || "failed to load"}`);
      setItems([]);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [categoryFilter, includeInactive]);

  return (
    <div>
      {/* Filters */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14, alignItems: "center" }}>
        <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={(e) => e.key === "Enter" && load()}
          placeholder="Search name or tagline…"
          style={{ background: "#0a0a0a", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13, minWidth: 240 }} />
        <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}
          style={{ background: "#0a0a0a", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 12px", fontSize: 13 }}>
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.slug} value={c.slug}>{c.emoji ? c.emoji + " " : ""}{c.name}</option>)}
        </select>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: T.dim, cursor: "pointer" }}>
          <input type="checkbox" checked={includeInactive} onChange={(e) => setIncludeInactive(e.target.checked)} />
          Include inactive
        </label>
        <button onClick={load} style={{ background: "transparent", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "8px 14px", fontSize: 13, cursor: "pointer" }}>Search</button>
      </div>

      {items === null ? (
        <div style={{ color: T.muted, padding: 24 }}>Loading{'\u2026'}</div>
      ) : error ? (
        <div style={{ background: "#1a0a0a", border: `1px solid ${T.err}`, color: T.err, padding: 16, borderRadius: 10, fontSize: 13, fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap" }}>
          {error}
        </div>
      ) : items.length === 0 ? (
        <div style={{ color: T.dim, padding: 24, textAlign: "center", background: T.card, border: `1px solid ${T.border}`, borderRadius: 10 }}>
          No supplements match this filter.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((s) => (
            <SupplementRow
              key={s.id}
              s={s}
              open={openId === s.id}
              onToggle={() => setOpenId(openId === s.id ? null : s.id)}
              onChanged={load}
            />
          ))}
        </div>
      )}

      <div style={{ marginTop: 16, fontSize: 12, color: T.dim }}>
        {items && `${items.length} supplements · ${items.reduce((sum, s) => sum + s.linkCount, 0)} affiliate links · ${items.reduce((sum, s) => sum + s.clickCount, 0)} total clicks`}
      </div>
    </div>
  );
}

function SupplementRow({ s, open, onToggle, onChanged }: {
  s: Supplement; open: boolean; onToggle: () => void; onChanged: () => void;
}) {
  return (
    <div style={{ background: T.card, border: `1px solid ${open ? s.accentColor || T.accent : T.border}`, borderRadius: 12, padding: "14px 16px" }}>
      <div onClick={onToggle} style={{ display: "flex", alignItems: "center", gap: 12, cursor: "pointer" }}>
        <div style={{ fontSize: 24 }}>{s.emoji || "\uD83D\uDC8A"}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontWeight: 700, fontSize: 14 }}>{s.name}</span>
            <span style={{ fontSize: 10, background: "#1a1a1a", border: `1px solid ${T.border}`, color: T.dim, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase", letterSpacing: 0.4, fontFamily: "ui-monospace, monospace" }}>{s.slug}</span>
            {!s.isActive && <span style={{ fontSize: 10, background: "#1a0a0a", border: `1px solid ${T.err}`, color: T.err, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Inactive</span>}
            {s.isFeatured && <span style={{ fontSize: 10, background: "#1a1505", border: `1px solid ${T.warn}`, color: T.warn, padding: "2px 8px", borderRadius: 4, textTransform: "uppercase" }}>Featured</span>}
          </div>
          <div style={{ fontSize: 12, color: T.dim }}>
            {s.categoryEmoji ? s.categoryEmoji + " " : ""}{s.categoryName}
            {s.tagline ? ` · ${s.tagline}` : ""}
          </div>
        </div>
        <div style={{ display: "flex", gap: 16, fontSize: 12, color: T.dim, textAlign: "right" }}>
          <div>
            <div style={{ fontWeight: 700, color: s.linkCount > 0 ? T.accent : T.muted, fontSize: 16 }}>{s.linkCount}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Links</div>
          </div>
          <div>
            <div style={{ fontWeight: 700, color: s.clickCount > 0 ? T.text : T.muted, fontSize: 16 }}>{s.clickCount}</div>
            <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 0.4 }}>Clicks</div>
          </div>
        </div>
        <div style={{ color: T.muted, fontSize: 18 }}>{open ? "\u2212" : "+"}</div>
      </div>

      {open && <LinkManager supplementId={s.id} accent={s.accentColor || T.accent} onChanged={onChanged} />}
    </div>
  );
}

/* ────────────────── LINK MANAGER (per supplement) ────────────────── */

type Link = {
  id: string; network: string; merchantLabel: string | null;
  affiliateUrl: string; priceRs: number | null; mrpRs: number | null;
  notes: string | null; sortOrder: number; isActive: boolean;
};

function LinkManager({ supplementId, accent, onChanged }: { supplementId: string; accent: string; onChanged: () => void }) {
  const [links, setLinks] = useState<Link[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [newLink, setNewLink] = useState<any>({ network: "NUTRABAY", affiliateUrl: "", priceRs: "", mrpRs: "", notes: "", merchantLabel: "" });
  const [editing, setEditing] = useState<string | null>(null);

  async function load() {
    const r = await fetch(`/api/admin/supplements/${supplementId}`);
    const j = await r.json();
    setLinks(j.supplement?.links || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  async function addLink() {
    if (!newLink.affiliateUrl) { alert("Affiliate URL required"); return; }
    const r = await fetch(`/api/admin/supplements/${supplementId}/links`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...newLink,
        priceRs: newLink.priceRs ? Number(newLink.priceRs) : null,
        mrpRs: newLink.mrpRs ? Number(newLink.mrpRs) : null,
      }),
    });
    const j = await r.json();
    if (!r.ok) { alert(j.error || "Failed"); return; }
    setNewLink({ network: "NUTRABAY", affiliateUrl: "", priceRs: "", mrpRs: "", notes: "", merchantLabel: "" });
    setAdding(false);
    await load();
    onChanged();
  }

  async function patchLink(id: string, patch: any) {
    const r = await fetch(`/api/admin/supplements/links/${id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!r.ok) { const j = await r.json().catch(() => ({})); alert(j.error || "Failed"); return; }
    setEditing(null);
    await load();
    onChanged();
  }

  async function deleteLink(id: string) {
    if (!confirm("Remove this link? (Click history preserved)")) return;
    await fetch(`/api/admin/supplements/links/${id}`, { method: "DELETE" });
    await load();
    onChanged();
  }

  return (
    <div style={{ marginTop: 14, paddingTop: 14, borderTop: `1px solid ${T.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: accent, textTransform: "uppercase", letterSpacing: 0.6 }}>Affiliate links</div>
        {!adding && (
          <button onClick={() => setAdding(true)} style={{ background: accent, color: "#000", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>
            + Add link
          </button>
        )}
      </div>

      {adding && (
        <div style={{ background: "#0a0a0a", border: `1px solid ${accent}`, borderRadius: 10, padding: 14, marginBottom: 10 }}>
          <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 8, marginBottom: 8 }}>
            <select value={newLink.network} onChange={(e) => setNewLink({ ...newLink, network: e.target.value })} style={inputStyle()}>
              {NETWORKS.map((n) => <option key={n} value={n}>{NETWORK_LABEL[n]}</option>)}
            </select>
            <input value={newLink.affiliateUrl} onChange={(e) => setNewLink({ ...newLink, affiliateUrl: e.target.value })}
              placeholder="https://www.nutrabay.com/product/…?ref=fitfuel" style={inputStyle()} />
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8, marginBottom: 8 }}>
            <input type="number" value={newLink.priceRs} onChange={(e) => setNewLink({ ...newLink, priceRs: e.target.value })} placeholder="Price (₹)" style={inputStyle()} />
            <input type="number" value={newLink.mrpRs} onChange={(e) => setNewLink({ ...newLink, mrpRs: e.target.value })} placeholder="MRP (₹) — for strikethrough" style={inputStyle()} />
            <input value={newLink.notes} onChange={(e) => setNewLink({ ...newLink, notes: e.target.value })} placeholder="Notes (1kg, 30 servings)" style={inputStyle()} />
          </div>
          {newLink.network === "OTHER" && (
            <input value={newLink.merchantLabel} onChange={(e) => setNewLink({ ...newLink, merchantLabel: e.target.value })} placeholder="Merchant label (e.g. iHerb)" style={{ ...inputStyle(), marginBottom: 8 }} />
          )}
          <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
            <button onClick={() => setAdding(false)} style={{ background: "transparent", color: T.dim, border: `1px solid ${T.border}`, borderRadius: 6, padding: "6px 14px", fontSize: 12, cursor: "pointer" }}>Cancel</button>
            <button onClick={addLink} style={{ background: accent, color: "#000", border: "none", borderRadius: 6, padding: "6px 14px", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>Save link</button>
          </div>
        </div>
      )}

      {links === null ? (
        <div style={{ color: T.muted, fontSize: 13 }}>Loading links{'\u2026'}</div>
      ) : links.length === 0 ? (
        <div style={{ color: T.muted, fontSize: 13, padding: 10, textAlign: "center" }}>No affiliate links yet. Add one above.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {links.map((l) => editing === l.id ? (
            <LinkEditRow key={l.id} link={l} accent={accent} onSave={(patch) => patchLink(l.id, patch)} onCancel={() => setEditing(null)} />
          ) : (
            <div key={l.id} style={{ display: "flex", alignItems: "center", gap: 10, background: l.isActive ? "#0a0a0a" : "#150505", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px" }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{l.merchantLabel || NETWORK_LABEL[l.network] || l.network}</span>
                  {!l.isActive && <span style={{ fontSize: 9, color: T.err, textTransform: "uppercase" }}>inactive</span>}
                  {l.priceRs != null && (
                    <span style={{ color: accent, fontWeight: 700, fontSize: 13 }}>
                      {RUPEE}{l.priceRs.toLocaleString("en-IN")}
                      {l.mrpRs && l.mrpRs > l.priceRs && (
                        <span style={{ color: T.muted, textDecoration: "line-through", fontSize: 11, marginLeft: 6 }}>{RUPEE}{l.mrpRs.toLocaleString("en-IN")}</span>
                      )}
                    </span>
                  )}
                  {l.notes && <span style={{ fontSize: 11, color: T.muted }}>· {l.notes}</span>}
                </div>
                <a href={l.affiliateUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 10, color: T.dim, fontFamily: "ui-monospace, monospace", textDecoration: "none", wordBreak: "break-all" }}>
                  {l.affiliateUrl.slice(0, 100)}{l.affiliateUrl.length > 100 ? "\u2026" : ""}
                </a>
              </div>
              <button onClick={() => setEditing(l.id)} style={tinyBtn()}>Edit</button>
              <button onClick={() => deleteLink(l.id)} style={{ ...tinyBtn(), color: T.err, borderColor: "#3a0a0a" }}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function LinkEditRow({ link, accent, onSave, onCancel }: { link: Link; accent: string; onSave: (patch: any) => void; onCancel: () => void }) {
  const [f, setF] = useState({
    network: link.network,
    affiliateUrl: link.affiliateUrl,
    priceRs: link.priceRs ?? "",
    mrpRs: link.mrpRs ?? "",
    notes: link.notes ?? "",
    merchantLabel: link.merchantLabel ?? "",
    isActive: link.isActive,
  });

  return (
    <div style={{ background: "#0a0a0a", border: `1px solid ${accent}`, borderRadius: 8, padding: 12 }}>
      <div style={{ display: "grid", gridTemplateColumns: "180px 1fr", gap: 6, marginBottom: 6 }}>
        <select value={f.network} onChange={(e) => setF({ ...f, network: e.target.value })} style={inputStyle()}>
          {NETWORKS.map((n) => <option key={n} value={n}>{NETWORK_LABEL[n]}</option>)}
        </select>
        <input value={f.affiliateUrl} onChange={(e) => setF({ ...f, affiliateUrl: e.target.value })} style={inputStyle()} />
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginBottom: 6 }}>
        <input type="number" value={f.priceRs as any} onChange={(e) => setF({ ...f, priceRs: e.target.value as any })} placeholder="Price" style={inputStyle()} />
        <input type="number" value={f.mrpRs as any} onChange={(e) => setF({ ...f, mrpRs: e.target.value as any })} placeholder="MRP" style={inputStyle()} />
        <input value={f.notes} onChange={(e) => setF({ ...f, notes: e.target.value })} placeholder="Notes" style={inputStyle()} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: T.dim, cursor: "pointer" }}>
          <input type="checkbox" checked={f.isActive} onChange={(e) => setF({ ...f, isActive: e.target.checked })} />
          Active
        </label>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={onCancel} style={tinyBtn()}>Cancel</button>
          <button onClick={() => onSave({ ...f, priceRs: f.priceRs === "" ? null : Number(f.priceRs), mrpRs: f.mrpRs === "" ? null : Number(f.mrpRs) })}
            style={{ ...tinyBtn(), background: accent, color: "#000", borderColor: accent }}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ────────────────── ANALYTICS TAB ────────────────── */

function AnalyticsTab() {
  const [days, setDays] = useState(7);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setData(null);
    setError(null);
    try {
      const r = await fetch(`/api/admin/supplements/clicks?days=${days}`);
      if (!r.ok) {
        const text = await r.text().catch(() => "");
        setError(`API ${r.status}: ${text.slice(0, 200) || r.statusText}`);
        return;
      }
      const j = await r.json();
      setData(j);
    } catch (e: any) {
      setError(`Network: ${e?.message || "failed to load"}`);
    }
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [days]);

  if (error) return <div style={{ background: "#1a0a0a", border: `1px solid ${T.err}`, color: T.err, padding: 16, borderRadius: 10, fontSize: 13, fontFamily: "ui-monospace, monospace", whiteSpace: "pre-wrap" }}>{error}</div>;
  if (!data) return <div style={{ color: T.muted, padding: 24 }}>Loading{'\u2026'}</div>;

  const maxDaily = Math.max(1, ...data.dailyTrend.map((d: any) => d.clicks));

  return (
    <div>
      {/* Range selector */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {[7, 14, 30, 90].map((d) => (
          <button key={d} onClick={() => setDays(d)} style={{
            background: days === d ? T.accent : "transparent",
            color: days === d ? "#000" : "#bbb",
            border: `1px solid ${days === d ? T.accent : T.border}`,
            borderRadius: 6, padding: "6px 14px", fontSize: 12, fontWeight: days === d ? 700 : 500, cursor: "pointer",
          }}>Last {d} days</button>
        ))}
      </div>

      {/* Stat row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 8, marginBottom: 20 }}>
        <Stat label="Total clicks" value={data.totalClicks} accent />
        <Stat label="Signed-in clicks" value={data.signedInClicks} />
        <Stat label="Unique users" value={data.uniqueUsers} />
        <Stat label="Top network" value={data.topNetworks[0] ? NETWORK_LABEL[data.topNetworks[0].network] || data.topNetworks[0].network : "—"} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 14 }}>

        {/* Daily trend bar chart */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 12 }}>Daily clicks</div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 140, paddingBottom: 24, position: "relative" }}>
            {data.dailyTrend.map((d: any) => (
              <div key={d.date} title={`${d.date}: ${d.clicks} clicks`} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4, minWidth: 8 }}>
                <div style={{ width: "100%", maxWidth: 36, height: `${(d.clicks / maxDaily) * 100}%`, minHeight: d.clicks > 0 ? 2 : 0, background: T.accent, borderRadius: "4px 4px 0 0" }} />
                <div style={{ fontSize: 9, color: T.muted, position: "absolute", bottom: 0 }}>{d.date.slice(8)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Top networks */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16 }}>
          <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 12 }}>By network</div>
          {data.topNetworks.length === 0 ? (
            <div style={{ color: T.muted, fontSize: 13 }}>No clicks yet.</div>
          ) : (
            data.topNetworks.map((n: any) => (
              <div key={n.network} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: `1px solid ${T.border}`, fontSize: 13 }}>
                <span>{NETWORK_LABEL[n.network] || n.network}</span>
                <span style={{ fontWeight: 700, color: T.accent }}>{n.clicks}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top products */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: 16, marginTop: 14 }}>
        <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 12 }}>Top products by clicks</div>
        {data.topProducts.length === 0 ? (
          <div style={{ color: T.muted, fontSize: 13 }}>No clicks yet. Add affiliate links to start tracking.</div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.supplementId} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 12px", background: "#0a0a0a", borderRadius: 8 }}>
                <div style={{ width: 24, fontSize: 12, color: T.muted, fontWeight: 700 }}>#{i + 1}</div>
                <div style={{ fontSize: 20 }}>{p.emoji || "\uD83D\uDC8A"}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{p.name}</div>
                  <div style={{ fontSize: 10, color: T.muted, fontFamily: "ui-monospace, monospace" }}>{p.slug}</div>
                </div>
                <div style={{ fontSize: 18, fontWeight: 800, color: p.accentColor || T.accent }}>{p.clicks}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: any; accent?: boolean }) {
  return (
    <div style={{ background: T.card, border: `1px solid ${accent ? T.accent : T.border}`, borderRadius: 12, padding: 14 }}>
      <div style={{ fontSize: 10, color: T.dim, textTransform: "uppercase", letterSpacing: 0.6, fontWeight: 700, marginBottom: 4 }}>{label}</div>
      <div style={{ fontFamily: '"Barlow Condensed", "Syne", system-ui', fontSize: 28, fontWeight: 700, color: accent ? T.accent : T.text }}>{value}</div>
    </div>
  );
}

function inputStyle(): any {
  return {
    width: "100%", background: "#0a0a0a", color: T.text,
    border: `1px solid ${T.border}`, borderRadius: 6,
    padding: "8px 10px", fontSize: 12, fontFamily: "inherit", outline: "none",
  };
}
function tinyBtn(): any {
  return {
    background: "transparent", color: T.text, border: `1px solid ${T.border}`,
    borderRadius: 6, padding: "5px 12px", fontSize: 11, cursor: "pointer",
  };
}