// app/admin/partners/PartnersClient.tsx
"use client";
import { useEffect, useState } from "react";

type Partner = {
  id: string;
  type: string;
  status: string;
  name: string;
  code: string;
  contactEmail: string | null;
  contactPhone: string | null;
  rewardType: string;
  rewardValueRs: number;
  refereeDiscountRs: number;
  createdAt: string;
  _count?: { referrals: number };
  ownerUser?: { id: string; name: string | null; email: string | null } | null;
  [k: string]: any;
};

type PartnerDetail = Partner & {
  referrals: any[];
  payouts: any[];
};

const PANEL: React.CSSProperties = { background: "#0e0e0e", border: "1px solid #1f1f1f", borderRadius: 8, padding: 20 };
const INPUT: React.CSSProperties = { background: "#080808", border: "1px solid #2a2a2a", color: "#eee", borderRadius: 4, padding: "8px 10px", fontSize: 13, width: "100%", fontFamily: "inherit" };
const BTN: React.CSSProperties = { background: "#84cc16", color: "#000", border: "none", padding: "8px 14px", borderRadius: 4, fontWeight: 700, cursor: "pointer", fontSize: 13 };
const BTN_GHOST: React.CSSProperties = { background: "transparent", color: "#bbb", border: "1px solid #2a2a2a", padding: "8px 14px", borderRadius: 4, cursor: "pointer", fontSize: 13 };
const LABEL: React.CSSProperties = { display: "block", fontSize: 11, color: "#888", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 6, fontWeight: 600 };

const TYPES = ["CUSTOMER", "GYM", "TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "CORPORATE", "RESIDENCE"];
const STATUSES = ["PENDING", "ACTIVE", "PAUSED", "REJECTED", "TERMINATED"];
const REWARD_TYPES = ["CREDIT", "CASH", "MEAL_VOUCHER", "DISCOUNT_ONLY", "HYBRID"];

const TYPE_DEFAULTS: Record<string, { rewardType: string; rewardValueRs: number; refereeDiscountRs: number }> = {
  CUSTOMER:    { rewardType: "CREDIT",        rewardValueRs: 500,  refereeDiscountRs: 200 },
  GYM:         { rewardType: "MEAL_VOUCHER",  rewardValueRs: 5,    refereeDiscountRs: 200 },
  TRAINER:     { rewardType: "CASH",          rewardValueRs: 500,  refereeDiscountRs: 200 },
  INFLUENCER:  { rewardType: "CASH",          rewardValueRs: 750,  refereeDiscountRs: 200 },
  DIETICIAN:   { rewardType: "CASH",          rewardValueRs: 1000, refereeDiscountRs: 200 },
  DOCTOR:      { rewardType: "CASH",          rewardValueRs: 1500, refereeDiscountRs: 200 },
  CORPORATE:   { rewardType: "DISCOUNT_ONLY", rewardValueRs: 0,    refereeDiscountRs: 0 },
  RESIDENCE:   { rewardType: "HYBRID",        rewardValueRs: 200,  refereeDiscountRs: 200 },
};

export default function PartnersClient() {
  const [tab, setTab] = useState<"list" | "create" | "payouts">("list");
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <div style={{ padding: 24, color: "#eee" }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0, letterSpacing: -0.5 }}>Partners</h1>
        <p style={{ color: "#777", margin: "6px 0 0", fontSize: 13 }}>Manage all referral channels — customers, gyms, trainers, dieticians, doctors, corporate, residence, influencers.</p>
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab("list")} style={{ ...BTN_GHOST, background: tab === "list" ? "#84cc16" : "transparent", color: tab === "list" ? "#000" : "#bbb", border: tab === "list" ? "1px solid #84cc16" : "1px solid #2a2a2a", fontWeight: tab === "list" ? 700 : 500 }}>All partners</button>
        <button onClick={() => setTab("create")} style={{ ...BTN_GHOST, background: tab === "create" ? "#84cc16" : "transparent", color: tab === "create" ? "#000" : "#bbb", border: tab === "create" ? "1px solid #84cc16" : "1px solid #2a2a2a", fontWeight: tab === "create" ? 700 : 500 }}>+ Create partner</button>
        <button onClick={() => setTab("payouts")} style={{ ...BTN_GHOST, background: tab === "payouts" ? "#84cc16" : "transparent", color: tab === "payouts" ? "#000" : "#bbb", border: tab === "payouts" ? "1px solid #84cc16" : "1px solid #2a2a2a", fontWeight: tab === "payouts" ? 700 : 500 }}>Payouts</button>
      </div>

      {tab === "list" && <ListTab openId={openId} setOpenId={setOpenId} />}
      {tab === "create" && <CreateTab onCreated={() => setTab("list")} />}
      {tab === "payouts" && <PayoutsTab />}
    </div>
  );
}


/* ---------------- LIST ---------------- */

function ListTab({ openId, setOpenId }: { openId: string | null; setOpenId: (id: string | null) => void }) {
  const [items, setItems] = useState<Partner[] | null>(null);
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [q, setQ] = useState("");

  async function load() {
    const params = new URLSearchParams({ tab: "list" });
    if (typeFilter) params.set("type", typeFilter);
    if (statusFilter) params.set("status", statusFilter);
    if (q) params.set("q", q);
    const r = await fetch("/api/admin/partners?" + params.toString());
    const j = await r.json();
    setItems(j.partners || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  if (!items) return <div style={{ color: "#666" }}>Loading…</div>;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}>
        <select style={{ ...INPUT, width: 160 }} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
          <option value="">All types</option>
          {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select style={{ ...INPUT, width: 140 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All statuses</option>
          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <input style={{ ...INPUT, width: 240 }} placeholder="Search name / code / email" value={q} onChange={(e) => setQ(e.target.value)} />
        <button onClick={load} style={BTN}>Filter</button>
      </div>

      {items.length === 0 ? (
        <div style={{ ...PANEL, color: "#777" }}>No partners yet. Use "+ Create partner" to add one.</div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {items.map((p) => (
            <PartnerRow key={p.id} p={p} open={openId === p.id} onToggleOpen={() => setOpenId(openId === p.id ? null : p.id)} onChanged={load} />
          ))}
        </div>
      )}
    </div>
  );
}

function PartnerRow({ p, open, onToggleOpen, onChanged }: { p: Partner; open: boolean; onToggleOpen: () => void; onChanged: () => void }) {
  return (
    <div style={PANEL}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: "#fff" }}>{p.name}</div>
            <Pill>{p.type}</Pill>
            <Pill color={statusColor(p.status)}>{p.status}</Pill>
            <code style={{ fontSize: 11, color: "#84cc16", background: "#0a1505", padding: "2px 6px", borderRadius: 3 }}>{p.code}</code>
          </div>
          <div style={{ color: "#888", fontSize: 12, marginTop: 6, display: "flex", gap: 16, flexWrap: "wrap" }}>
            <span>{p._count?.referrals ?? 0} referrals</span>
            <span>{p.rewardType} · ₹{p.rewardValueRs}</span>
            {p.contactEmail && <span>{p.contactEmail}</span>}
            {p.contactPhone && <span>{p.contactPhone}</span>}
          </div>
        </div>
        <button onClick={onToggleOpen} style={BTN_GHOST}>{open ? "Close" : "View"}</button>
      </div>
      {open && <PartnerDetailView id={p.id} onChanged={onChanged} />}
    </div>
  );
}

function PartnerDetailView({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [detail, setDetail] = useState<PartnerDetail | null>(null);
  const [editing, setEditing] = useState(false);

  async function load() {
    const r = await fetch(`/api/admin/partners?tab=detail&id=${id}`);
    const j = await r.json();
    setDetail(j.partner);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  async function setStatus(status: string) {
    if (!confirm(`Set status to ${status}?`)) return;
    await fetch("/api/admin/partners", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "setStatus", data: { id, status } }),
    });
    await load();
    onChanged();
  }

  if (!detail) return <div style={{ color: "#666", marginTop: 16 }}>Loading…</div>;

  return (
    <div style={{ marginTop: 16, paddingTop: 16, borderTop: "1px solid #1f1f1f", display: "flex", flexDirection: "column", gap: 14 }}>
      {/* Action buttons */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        {detail.status === "PENDING" && (
          <button onClick={() => setStatus("ACTIVE")} style={BTN}>Approve</button>
        )}
        {detail.status === "ACTIVE" && (
          <button onClick={() => setStatus("PAUSED")} style={BTN_GHOST}>Pause</button>
        )}
        {detail.status === "PAUSED" && (
          <button onClick={() => setStatus("ACTIVE")} style={BTN}>Resume</button>
        )}
        {detail.status === "PENDING" && (
          <button onClick={() => setStatus("REJECTED")} style={{ ...BTN_GHOST, color: "#ef4444", borderColor: "#3a1010" }}>Reject</button>
        )}
        {detail.status !== "TERMINATED" && (
          <button onClick={() => setStatus("TERMINATED")} style={{ ...BTN_GHOST, color: "#ef4444", borderColor: "#3a1010" }}>Terminate</button>
        )}
        <button onClick={() => setEditing((e) => !e)} style={BTN_GHOST}>{editing ? "Close edit" : "Edit"}</button>
      </div>

      {/* Phase 17B — landing + QR poster */}
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
        <a href={`/p/${detail.code}`} target="_blank" rel="noopener" style={{ ...BTN_GHOST, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Open landing /p/{detail.code}
        </a>
        <a href={`/api/admin/partners/qr?code=${encodeURIComponent(detail.code)}&download=1`} style={{ ...BTN_GHOST, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Download QR (PNG)
        </a>
        <a href={`/api/admin/partners/qr?code=${encodeURIComponent(detail.code)}&format=svg&download=1`} style={{ ...BTN_GHOST, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Download QR (SVG)
        </a>
        <a href={`/api/admin/partners/qr?code=${encodeURIComponent(detail.code)}`} target="_blank" rel="noopener" style={{ ...BTN_GHOST, textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
          Preview QR
        </a>
      </div>

      {editing && <EditForm detail={detail} onSaved={() => { setEditing(false); load(); onChanged(); }} />}
      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8 }}>
        <Stat label="Total referrals" value={String(detail.referrals.length)} />
        <Stat label="First orders" value={String(detail.referrals.filter((r) => r.status === "FIRST_ORDER" || r.status === "REWARD_PAID").length)} />
        <Stat label="Reward type" value={detail.rewardType} />
        <Stat label="Reward / referral" value={`\u20B9${detail.rewardValueRs}`} />
      </div>

      {/* Payment info (Phase 17C-1) — only renders when any tax/bank field is populated */}
      {(detail.panNumber || detail.bankAccountName || detail.bankAccountNumber || detail.bankIfsc) && (
        <div>
          <div style={{ fontSize: 11, color: "#84cc16", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
            Payment info
          </div>
          <div style={{ ...PANEL, padding: 14, display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14, fontSize: 13 }}>
            {detail.panNumber && (
              <div>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>PAN</div>
                <div style={{ fontFamily: "ui-monospace, monospace", color: "#eee", fontSize: 13 }}>{detail.panNumber}</div>
              </div>
            )}
            {detail.bankAccountName && (
              <div>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Account holder</div>
                <div style={{ color: "#eee", fontSize: 13 }}>{detail.bankAccountName}</div>
              </div>
            )}
            {detail.bankAccountNumber && (
              <div>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>Account number</div>
                <div style={{ fontFamily: "ui-monospace, monospace", color: "#eee", fontSize: 13 }}>{detail.bankAccountNumber}</div>
              </div>
            )}
            {detail.bankIfsc && (
              <div>
                <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>IFSC</div>
                <div style={{ fontFamily: "ui-monospace, monospace", color: "#eee", fontSize: 13 }}>{detail.bankIfsc}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Referrals */}
      <div>
        <div style={{ fontSize: 11, color: "#84cc16", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Referrals</div>
        {detail.referrals.length === 0 ? (
          <div style={{ color: "#777", fontSize: 13 }}>No referrals yet.</div>
        ) : (
          <div style={{ ...PANEL, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ background: "#0a0a0a", color: "#888" }}>
                  <Th>When</Th><Th>Customer</Th><Th>Order</Th><Th>Status</Th><Th>Reward</Th>
                </tr>
              </thead>
              <tbody>
                {detail.referrals.map((r: any) => (
                  <tr key={r.id} style={{ borderTop: "1px solid #1a1a1a" }}>
                    <Td>{new Date(r.createdAt).toLocaleString()}</Td>
                    <Td>{r.refereeUser?.name || r.refereeUser?.email || "—"}</Td>
                    <Td>{r.refereeOrder?.orderNumber || "—"}</Td>
                    <Td><span style={{ color: r.status === "FIRST_ORDER" || r.status === "REWARD_PAID" ? "#84cc16" : "#888" }}>{r.status}</span></Td>
                    <Td>₹{r.rewardAmountRs}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payouts */}
      {detail.payouts.length > 0 && (
        <div>
          <div style={{ fontSize: 11, color: "#84cc16", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>Payouts</div>
          <div style={{ ...PANEL, padding: 0, overflow: "hidden" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead><tr style={{ background: "#0a0a0a", color: "#888" }}><Th>Period</Th><Th>Amount</Th><Th>Referrals</Th><Th>Status</Th><Th>Paid at</Th></tr></thead>
              <tbody>
                {detail.payouts.map((py: any) => (
                  <tr key={py.id} style={{ borderTop: "1px solid #1a1a1a" }}>
                    <Td>{py.periodYearMonth}</Td>
                    <Td>₹{py.amountRs}</Td>
                    <Td>{py.referralCount}</Td>
                    <Td><span style={{ color: py.status === "PAID" ? "#84cc16" : "#888" }}>{py.status}</span></Td>
                    <Td>{py.paidAt ? new Date(py.paidAt).toLocaleDateString() : "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------- CREATE / EDIT FORMS ---------------- */

function CreateTab({ onCreated }: { onCreated: () => void }) {
  return <PartnerForm onSaved={onCreated} />;
}

function EditForm({ detail, onSaved }: { detail: PartnerDetail; onSaved: () => void }) {
  return <PartnerForm initial={detail} onSaved={onSaved} isEdit />;
}

function PartnerForm({ initial, onSaved, isEdit }: { initial?: any; onSaved: () => void; isEdit?: boolean }) {
  const [type, setType] = useState<string>(initial?.type || "GYM");
  const [form, setForm] = useState<any>(() => {
    const base = initial || {
      type: "GYM",
      status: "ACTIVE",
      ...TYPE_DEFAULTS["GYM"],
    };
    return base;
  });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function up(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  function onTypeChange(t: string) {
    setType(t);
    const defaults = TYPE_DEFAULTS[t];
    setForm((f: any) => ({
      ...f,
      type: t,
      rewardType: defaults.rewardType,
      rewardValueRs: defaults.rewardValueRs,
      refereeDiscountRs: defaults.refereeDiscountRs,
    }));
  }

  async function save() {
    setBusy(true); setError(null);
    try {
      const action = isEdit ? "update" : "create";
      const data = isEdit ? { ...form, id: initial?.id } : { ...form, type };
      const r = await fetch("/api/admin/partners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, data }),
      });
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(j.error || "Save failed");
      } else {
        onSaved();
      }
    } finally {
      setBusy(false);
    }
  }

  const t = isEdit ? initial.type : type;

  return (
    <div style={{ ...PANEL, display: "flex", flexDirection: "column", gap: 14 }}>
      {!isEdit && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <div>
            <label style={LABEL}>Partner type</label>
            <select style={INPUT} value={type} onChange={(e) => onTypeChange(e.target.value)}>
              {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label style={LABEL}>Status</label>
            <select style={INPUT} value={form.status} onChange={(e) => up("status", e.target.value)}>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Name" value={form.name || ""} onChange={(v) => up("name", v)} />
        <Field label="Internal label (optional)" value={form.internalLabel || ""} onChange={(v) => up("internalLabel", v)} />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        <Field label="Contact email" value={form.contactEmail || ""} onChange={(v) => up("contactEmail", v)} />
        <Field label="Contact phone" value={form.contactPhone || ""} onChange={(v) => up("contactPhone", v)} />
      </div>

      {!isEdit && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Custom code (optional — auto-generated if empty)" value={form.code || ""} onChange={(v) => up("code", v)} />
          <Field label="Link to existing user (email)" value={form.ownerUserEmail || ""} onChange={(v) => up("ownerUserEmail", v)} />
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
        <div>
          <label style={LABEL}>Reward type</label>
          <select style={INPUT} value={form.rewardType} onChange={(e) => up("rewardType", e.target.value)}>
            {REWARD_TYPES.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
        <Field label="Reward value (₹ or count)" value={String(form.rewardValueRs || 0)} onChange={(v) => up("rewardValueRs", Number(v))} type="number" />
        <Field label="Referee discount (₹)" value={String(form.refereeDiscountRs || 0)} onChange={(v) => up("refereeDiscountRs", Number(v))} type="number" />
      </div>

      {/* Type-specific fields */}
      <TypeSpecificFields type={t} form={form} up={up} />

      <div>
        <label style={LABEL}>Admin notes</label>
        <textarea style={{ ...INPUT, minHeight: 60 }} value={form.adminNotes || ""} onChange={(e) => up("adminNotes", e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={save} style={BTN} disabled={busy}>{busy ? "Saving…" : isEdit ? "Save changes" : "Create partner"}</button>
        {error && <span style={{ color: "#ef4444", fontSize: 13, alignSelf: "center" }}>{error}</span>}
      </div>
    </div>
  );
}

function TypeSpecificFields({ type, form, up }: { type: string; form: any; up: (k: string, v: any) => void }) {
  if (type === "GYM") {
    return (
      <Section title="Gym details">
        <Field label="Gym address" value={form.gymAddress || ""} onChange={(v) => up("gymAddress", v)} />
        <Field label="Manager name" value={form.gymManagerName || ""} onChange={(v) => up("gymManagerName", v)} />
      </Section>
    );
  }
  if (type === "TRAINER" || type === "INFLUENCER") {
    return (
      <Section title={`${type === "TRAINER" ? "Trainer" : "Influencer"} details`}>
        <Field label="Bio" value={form.bio || ""} onChange={(v) => up("bio", v)} />
        <Field label="Specialty" value={form.specialty || ""} onChange={(v) => up("specialty", v)} />
        <Field label="Profile photo URL" value={form.profilePhotoUrl || ""} onChange={(v) => up("profilePhotoUrl", v)} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          <Field label="Social handle (@instagram)" value={form.socialHandle || ""} onChange={(v) => up("socialHandle", v)} />
          <Field label="Follower count" value={String(form.followerCount ?? "")} onChange={(v) => up("followerCount", v ? Number(v) : null)} type="number" />
        </div>
      </Section>
    );
  }
  if (type === "DIETICIAN" || type === "DOCTOR") {
    return (
      <Section title={`${type === "DIETICIAN" ? "Dietician" : "Doctor"} details`}>
        <Field label="Qualification" value={form.qualification || ""} onChange={(v) => up("qualification", v)} />
        <Field label="Registration number" value={form.registrationNumber || ""} onChange={(v) => up("registrationNumber", v)} />
        <Field label="Clinic / hospital name" value={form.clinicName || ""} onChange={(v) => up("clinicName", v)} />
        {type === "DOCTOR" && <Field label="Hospital affiliation" value={form.hospitalAffiliation || ""} onChange={(v) => up("hospitalAffiliation", v)} />}
        <Field label="Credential doc URL (upload then paste)" value={form.credentialDocUrl || ""} onChange={(v) => up("credentialDocUrl", v)} />
      </Section>
    );
  }
  if (type === "CORPORATE") {
    return (
      <Section title="Corporate details">
        <Field label="Company logo URL" value={form.companyLogoUrl || ""} onChange={(v) => up("companyLogoUrl", v)} />
        <Field label="Allowed email domain (e.g. acme.com)" value={form.allowedEmailDomain || ""} onChange={(v) => up("allowedEmailDomain", v)} />
        <Field label="HR contact name" value={form.hrContactName || ""} onChange={(v) => up("hrContactName", v)} />
      </Section>
    );
  }
  if (type === "RESIDENCE") {
    return (
      <Section title="Residence details">
        <Field label="Society / building address" value={form.societyAddress || ""} onChange={(v) => up("societyAddress", v)} />
        <Field label="Treasurer / contact" value={form.treasurerContact || ""} onChange={(v) => up("treasurerContact", v)} />
      </Section>
    );
  }
  return null;
}

/* ---------------- PRIMITIVES ---------------- */

function Field({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <label style={LABEL}>{label}</label>
      <input style={INPUT} value={value} onChange={(e) => onChange(e.target.value)} type={type} />
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ border: "1px solid #1a1a1a", borderRadius: 6, padding: 14, background: "#0a0a0a", display: "flex", flexDirection: "column", gap: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#84cc16", textTransform: "uppercase", letterSpacing: 0.6 }}>{title}</div>
      {children}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 6, padding: "10px 12px" }}>
      <div style={{ fontSize: 10, color: "#666", textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 18, color: "#fff", fontWeight: 700 }}>{value}</div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) { return <th style={{ textAlign: "left", padding: "10px 12px", fontWeight: 600, fontSize: 11, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</th>; }
function Td({ children }: { children: React.ReactNode }) { return <td style={{ padding: "10px 12px", color: "#ddd", verticalAlign: "top" }}>{children}</td>; }

function Pill({ children, color }: { children: React.ReactNode; color?: string }) {
  return <span style={{ display: "inline-block", background: color === "#84cc16" ? "#0a1505" : "#1a1a1a", color: color || "#aaa", border: `1px solid ${color === "#84cc16" ? "#1f3a08" : "#2a2a2a"}`, fontSize: 10, padding: "2px 8px", borderRadius: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: 0.5 }}>{children}</span>;
}

function statusColor(status: string): string | undefined {
  if (status === "ACTIVE") return "#84cc16";
  if (status === "REJECTED" || status === "TERMINATED") return "#ef4444";
  return undefined;
}
/* ---------------- PAYOUTS (Phase 17C-1) ---------------- */

type PayoutRow = {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerCode: string;
  partnerType: string;
  rewardType: string;
  periodYearMonth: string;
  amountRs: number;
  referralCount: number;
  status: string;
  paidAt: string | null;
  paymentRef: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  bankAccountName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  panNumber: string | null;
};

function PayoutsTab() {
  const [rows, setRows] = useState<PayoutRow[] | null>(null);
  const [status, setStatus] = useState<string>("PENDING");
  const [period, setPeriod] = useState<string>(""); // YYYY-MM

  async function load() {
    setRows(null);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (period) params.set("period", period);
    const r = await fetch("/api/admin/partners/payouts?" + params.toString());
    const j = await r.json();
    setRows(j.payouts || []);
  }
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status, period]);

  function downloadCSV() {
    const params = new URLSearchParams();
    params.set("format", "csv");
    if (status) params.set("status", status);
    if (period) params.set("period", period);
    window.location.href = "/api/admin/partners/payouts?" + params.toString();
  }

  async function setPayoutStatus(id: string, action: "markPaid" | "markProcessing" | "markFailed", paymentRef?: string) {
    const r = await fetch("/api/admin/partners/payouts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action, id, paymentRef }),
    });
    if (!r.ok) {
      const j = await r.json().catch(() => ({}));
      alert("Failed: " + (j?.error || "unknown"));
      return;
    }
    await load();
  }

  const total = (rows || []).reduce((s, r) => s + (r.amountRs || 0), 0);

  return (
    <div>
      {/* Filter row */}
      <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 14, flexWrap: "wrap" }}>
        <label style={{ color: "#888", fontSize: 12 }}>Status</label>
        <select value={status} onChange={(e) => setStatus(e.target.value)} style={{ background: "#0a0a0a", color: "#eee", border: "1px solid #2a2a2a", borderRadius: 6, padding: "8px 10px", fontSize: 13 }}>
          <option value="">All</option>
          <option value="PENDING">Pending</option>
          <option value="PROCESSING">Processing</option>
          <option value="PAID">Paid</option>
          <option value="FAILED">Failed</option>
        </select>

        <label style={{ color: "#888", fontSize: 12, marginLeft: 8 }}>Period</label>
        <input type="month" value={period} onChange={(e) => setPeriod(e.target.value)} style={{ background: "#0a0a0a", color: "#eee", border: "1px solid #2a2a2a", borderRadius: 6, padding: "8px 10px", fontSize: 13 }} />

        <button onClick={load} style={BTN_GHOST}>Refresh</button>
        <button onClick={downloadCSV} style={{ ...BTN, marginLeft: "auto" }}>Download CSV</button>
      </div>

      {/* Summary */}
      <div style={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 10, padding: "12px 16px", marginBottom: 14, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ color: "#888", fontSize: 12 }}>
          {rows ? rows.length : 0} payout{rows && rows.length === 1 ? "" : "s"} {status ? `(${status})` : "(all)"} {period ? `· ${period}` : ""}
        </div>
        <div style={{ color: "#a3e635", fontWeight: 700, fontSize: 14 }}>Total: {'\u20B9'}{total.toLocaleString("en-IN")}</div>
      </div>

      {/* Table */}
      {rows === null ? (
        <div style={{ color: "#666" }}>Loading{'\u2026'}</div>
      ) : rows.length === 0 ? (
        <div style={{ color: "#888", padding: 24, textAlign: "center", background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 10 }}>No payouts in this filter.</div>
      ) : (
        <div style={{ background: "#0a0a0a", border: "1px solid #1f1f1f", borderRadius: 10, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ background: "#101010", color: "#888" }}>
                <th style={CELL}>Period</th>
                <th style={CELL}>Partner</th>
                <th style={CELL}>Type</th>
                <th style={CELL}>Refs</th>
                <th style={CELL}>Amount</th>
                <th style={CELL}>Status</th>
                <th style={CELL}>Bank</th>
                <th style={CELL}>Action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} style={{ borderTop: "1px solid #1a1a1a" }}>
                  <td style={CELL}>{p.periodYearMonth}</td>
                  <td style={CELL}>
                    <div style={{ color: "#eee", fontWeight: 600 }}>{p.partnerName}</div>
                    <div style={{ color: "#666", fontSize: 11, fontFamily: "ui-monospace, monospace" }}>{p.partnerCode}</div>
                  </td>
                  <td style={CELL}>{p.partnerType}</td>
                  <td style={CELL}>{p.referralCount}</td>
                  <td style={{ ...CELL, color: "#a3e635", fontWeight: 700 }}>{'\u20B9'}{p.amountRs.toLocaleString("en-IN")}</td>
                  <td style={CELL}>
                    <span style={{
                      color: p.status === "PAID" ? "#22c55e" : p.status === "FAILED" ? "#ef4444" : p.status === "PROCESSING" ? "#3b82f6" : "#f59e0b",
                      fontSize: 11, fontWeight: 700, letterSpacing: 0.6,
                    }}>{p.status}</span>
                    {p.paidAt && <div style={{ fontSize: 10, color: "#666" }}>{new Date(p.paidAt).toLocaleDateString()}</div>}
                    {p.paymentRef && <div style={{ fontSize: 10, color: "#666" }}>Ref: {p.paymentRef}</div>}
                  </td>
                  <td style={{ ...CELL, fontSize: 11, color: "#888" }}>
                    {p.bankAccountNumber ? (
                      <>
                        <div>{p.bankAccountName}</div>
                        <div style={{ fontFamily: "ui-monospace, monospace" }}>{p.bankAccountNumber}</div>
                        <div style={{ fontFamily: "ui-monospace, monospace" }}>{p.bankIfsc}</div>
                      </>
                    ) : <span style={{ color: "#444" }}>{'\u2014'}</span>}
                  </td>
                  <td style={CELL}>
                    {p.status === "PENDING" && (
                      <>
                        <button onClick={() => setPayoutStatus(p.id, "markProcessing")} style={{ ...BTN_GHOST, padding: "4px 10px", fontSize: 11 }}>Mark processing</button>
                        <button onClick={() => {
                          const ref = prompt("Payment reference (UTR / UPI ref):") || "";
                          setPayoutStatus(p.id, "markPaid", ref);
                        }} style={{ ...BTN, padding: "4px 10px", fontSize: 11, marginLeft: 4 }}>Mark paid</button>
                      </>
                    )}
                    {p.status === "PROCESSING" && (
                      <>
                        <button onClick={() => {
                          const ref = prompt("Payment reference (UTR / UPI ref):") || "";
                          setPayoutStatus(p.id, "markPaid", ref);
                        }} style={{ ...BTN, padding: "4px 10px", fontSize: 11 }}>Mark paid</button>
                        <button onClick={() => setPayoutStatus(p.id, "markFailed")} style={{ ...BTN_GHOST, padding: "4px 10px", fontSize: 11, marginLeft: 4, color: "#ef4444" }}>Failed</button>
                      </>
                    )}
                    {(p.status === "PAID" || p.status === "FAILED") && <span style={{ color: "#666", fontSize: 11 }}>{'\u2014'}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

const CELL: any = { padding: "10px 12px", textAlign: "left", verticalAlign: "top" };