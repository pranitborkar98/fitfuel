"use client";

import { useCallback, useEffect, useState } from "react";
import styles from "./partners.module.css";

const PARTNER_TYPES = ["CUSTOMER", "GYM", "TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "CORPORATE", "RESIDENCE"] as const;
const PARTNER_STATUSES = ["PENDING", "ACTIVE", "PAUSED", "REJECTED", "TERMINATED"] as const;
const REWARD_TYPES = ["CREDIT", "CASH", "MEAL_VOUCHER", "DISCOUNT_ONLY", "HYBRID"] as const;
const PAYOUT_STATUSES = ["PENDING", "PROCESSING", "PAID", "FAILED"] as const;

type PartnerType = (typeof PARTNER_TYPES)[number];
type PartnerStatus = (typeof PARTNER_STATUSES)[number];
type RewardType = (typeof REWARD_TYPES)[number];
type PayoutStatus = (typeof PAYOUT_STATUSES)[number];
type Tab = "network" | "create" | "payouts";
type UserSummary = { id: string; name: string | null; email: string | null };

type Partner = {
  id: string; type: PartnerType; status: PartnerStatus; name: string; code: string;
  contactEmail: string | null; contactPhone: string | null; rewardType: RewardType;
  rewardValueRs: number; refereeDiscountRs: number; internalLabel: string | null;
  createdAt: string; ownerUser: UserSummary | null; _count?: { referrals: number };
};

type Referral = {
  id: string; status: "CLICKED" | "SIGNED_UP" | "FIRST_ORDER" | "REWARD_PAID" | "CANCELLED";
  rewardType: RewardType; rewardAmountRs: number; createdAt: string; rewardEarnedAt: string | null;
  refereeUser: UserSummary | null;
  refereeOrder: { id: string; orderNumber: string; totalRs: number } | null;
};

type PartnerPayout = {
  id: string; periodYearMonth: string; amountRs: number; referralCount: number;
  status: PayoutStatus; paidAt: string | null; paymentRef: string | null; createdAt: string;
};

type PartnerDetail = Partner & {
  customLandingSlug: string | null; gymAddress: string | null; gymManagerName: string | null;
  bio: string | null; specialty: string | null; profilePhotoUrl: string | null;
  socialHandle: string | null; followerCount: number | null; qualification: string | null;
  registrationNumber: string | null; clinicName: string | null; credentialDocUrl: string | null;
  hospitalAffiliation: string | null; companyLogoUrl: string | null; allowedEmailDomain: string | null;
  hrContactName: string | null; treasurerContact: string | null; societyAddress: string | null;
  adminNotes: string | null; panNumber: string | null; bankAccountName: string | null;
  bankAccountNumber: string | null; bankIfsc: string | null; referrals: Referral[]; payouts: PartnerPayout[];
};

type Payout = {
  id: string; partnerId: string; partnerName: string; partnerCode: string; partnerType: PartnerType;
  rewardType: RewardType; periodYearMonth: string; amountRs: number; referralCount: number;
  status: PayoutStatus; paidAt: string | null; paymentRef: string | null; createdAt: string;
  contactEmail: string | null; contactPhone: string | null; bankAccountName: string | null;
  bankAccountNumber: string | null; bankIfsc: string | null; panNumber: string | null;
};

type PartnerFormState = {
  type: PartnerType; status: PartnerStatus; name: string; code: string; ownerUserEmail: string;
  contactEmail: string; contactPhone: string; customLandingSlug: string; rewardType: RewardType;
  rewardValueRs: number; refereeDiscountRs: number; gymAddress: string; gymManagerName: string;
  bio: string; specialty: string; profilePhotoUrl: string; socialHandle: string; followerCount: number | "";
  qualification: string; registrationNumber: string; clinicName: string; credentialDocUrl: string;
  hospitalAffiliation: string; companyLogoUrl: string; allowedEmailDomain: string; hrContactName: string;
  treasurerContact: string; societyAddress: string; adminNotes: string; internalLabel: string;
};

const TYPE_DEFAULTS: Record<PartnerType, Pick<PartnerFormState, "rewardType" | "rewardValueRs" | "refereeDiscountRs">> = {
  CUSTOMER: { rewardType: "CREDIT", rewardValueRs: 500, refereeDiscountRs: 200 },
  GYM: { rewardType: "MEAL_VOUCHER", rewardValueRs: 5, refereeDiscountRs: 200 },
  TRAINER: { rewardType: "CASH", rewardValueRs: 500, refereeDiscountRs: 200 },
  INFLUENCER: { rewardType: "CASH", rewardValueRs: 750, refereeDiscountRs: 200 },
  DIETICIAN: { rewardType: "CASH", rewardValueRs: 1_000, refereeDiscountRs: 200 },
  DOCTOR: { rewardType: "CASH", rewardValueRs: 1_500, refereeDiscountRs: 200 },
  CORPORATE: { rewardType: "DISCOUNT_ONLY", rewardValueRs: 0, refereeDiscountRs: 0 },
  RESIDENCE: { rewardType: "HYBRID", rewardValueRs: 200, refereeDiscountRs: 200 },
};

const TYPE_LABELS: Record<PartnerType, string> = {
  CUSTOMER: "Customer advocate", GYM: "Gym", TRAINER: "Trainer", INFLUENCER: "Creator",
  DIETICIAN: "Dietitian", DOCTOR: "Doctor", CORPORATE: "Company", RESIDENCE: "Housing society",
};

const REWARD_LABELS: Record<RewardType, string> = {
  CREDIT: "FitFuel credit", CASH: "Cash", MEAL_VOUCHER: "Meal vouchers",
  DISCOUNT_ONLY: "Customer discount only", HYBRID: "Cash and credit",
};

function blankForm(type: PartnerType = "GYM"): PartnerFormState {
  return {
    type, status: "PENDING", name: "", code: "", ownerUserEmail: "", contactEmail: "", contactPhone: "",
    customLandingSlug: "", ...TYPE_DEFAULTS[type], gymAddress: "", gymManagerName: "", bio: "",
    specialty: "", profilePhotoUrl: "", socialHandle: "", followerCount: "", qualification: "",
    registrationNumber: "", clinicName: "", credentialDocUrl: "", hospitalAffiliation: "",
    companyLogoUrl: "", allowedEmailDomain: "", hrContactName: "", treasurerContact: "",
    societyAddress: "", adminNotes: "", internalLabel: "",
  };
}

function detailForm(detail: PartnerDetail): PartnerFormState {
  return {
    ...blankForm(detail.type), type: detail.type, status: detail.status, name: detail.name,
    contactEmail: detail.contactEmail ?? "", contactPhone: detail.contactPhone ?? "",
    customLandingSlug: detail.customLandingSlug ?? "", rewardType: detail.rewardType,
    rewardValueRs: detail.rewardValueRs, refereeDiscountRs: detail.refereeDiscountRs,
    gymAddress: detail.gymAddress ?? "", gymManagerName: detail.gymManagerName ?? "",
    bio: detail.bio ?? "", specialty: detail.specialty ?? "", profilePhotoUrl: detail.profilePhotoUrl ?? "",
    socialHandle: detail.socialHandle ?? "", followerCount: detail.followerCount ?? "",
    qualification: detail.qualification ?? "", registrationNumber: detail.registrationNumber ?? "",
    clinicName: detail.clinicName ?? "", credentialDocUrl: detail.credentialDocUrl ?? "",
    hospitalAffiliation: detail.hospitalAffiliation ?? "", companyLogoUrl: detail.companyLogoUrl ?? "",
    allowedEmailDomain: detail.allowedEmailDomain ?? "", hrContactName: detail.hrContactName ?? "",
    treasurerContact: detail.treasurerContact ?? "", societyAddress: detail.societyAddress ?? "",
    adminNotes: detail.adminNotes ?? "", internalLabel: detail.internalLabel ?? "",
  };
}

async function requestJson<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) {
    const message = body && typeof body === "object" && "error" in body && typeof body.error === "string"
      ? body.error : "The request could not be completed.";
    throw new Error(message);
  }
  return body as T;
}

function money(value: number): string {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(value);
}

function readable(value: string): string {
  return value.toLowerCase().replaceAll("_", " ").replace(/^./, (letter) => letter.toUpperCase());
}

function shortDate(value: string | null): string {
  return value ? new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(new Date(value)) : "—";
}

function rewardSummary(partner: Pick<Partner, "rewardType" | "rewardValueRs">): string {
  if (partner.rewardType === "DISCOUNT_ONLY") return "No partner reward";
  if (partner.rewardType === "MEAL_VOUCHER") return `${partner.rewardValueRs} meal voucher${partner.rewardValueRs === 1 ? "" : "s"}`;
  return `${money(partner.rewardValueRs)} ${REWARD_LABELS[partner.rewardType].toLowerCase()}`;
}

function statusClass(status: PartnerStatus | PayoutStatus | Referral["status"]): string {
  if (status === "ACTIVE" || status === "PAID" || status === "REWARD_PAID" || status === "FIRST_ORDER") return styles.statusGood;
  if (status === "PENDING" || status === "PROCESSING" || status === "SIGNED_UP") return styles.statusWaiting;
  if (status === "FAILED" || status === "REJECTED" || status === "TERMINATED" || status === "CANCELLED") return styles.statusBad;
  return styles.statusQuiet;
}

function StatusPill({ value }: { value: PartnerStatus | PayoutStatus | Referral["status"] }) {
  return <span className={`${styles.status} ${statusClass(value)}`}>{readable(value)}</span>;
}

export default function PartnersClient() {
  const [tab, setTab] = useState<Tab>("network");
  const [networkVersion, setNetworkVersion] = useState(0);
  return (
    <main className={styles.page}>
      <header className={styles.header}><div><p className={styles.eyebrow}>Referral operations</p><h1>Partner network</h1><p>Approve advocates, tune each offer, follow referred orders, and reconcile payouts without losing the audit trail.</p></div></header>
      <nav className={styles.tabs} aria-label="Partner sections" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "network"} onClick={() => setTab("network")}>Network</button>
        <button type="button" role="tab" aria-selected={tab === "create"} onClick={() => setTab("create")}>Add partner</button>
        <button type="button" role="tab" aria-selected={tab === "payouts"} onClick={() => setTab("payouts")}>Payouts</button>
      </nav>
      {tab === "network" && <NetworkTab version={networkVersion} />}
      {tab === "create" && <PartnerForm onSaved={() => { setNetworkVersion((value) => value + 1); setTab("network"); }} />}
      {tab === "payouts" && <PayoutsTab />}
    </main>
  );
}

function NetworkTab({ version }: { version: number }) {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [openId, setOpenId] = useState<string | null>(null);
  const [type, setType] = useState<PartnerType | "">("");
  const [status, setStatus] = useState<PartnerStatus | "">("");
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState({ type: "", status: "", query: "" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      const params = new URLSearchParams({ tab: "list" });
      if (filters.type) params.set("type", filters.type);
      if (filters.status) params.set("status", filters.status);
      if (filters.query) params.set("q", filters.query);
      try {
        const result = await requestJson<{ partners: Partner[] }>(`/api/admin/partners?${params}`);
        if (active) setPartners(result.partners);
      } catch (caught: unknown) {
        if (active) setError(caught instanceof Error ? caught.message : "Partners could not be loaded.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [filters, reloadKey, version]);

  const referralCount = partners.reduce((total, partner) => total + (partner._count?.referrals ?? 0), 0);
  const pendingCount = partners.filter((partner) => partner.status === "PENDING").length;
  return (
    <section className={styles.section} aria-labelledby="network-title">
      <h2 id="network-title" className={styles.visuallyHidden}>Partner network</h2>
      <div className={styles.metrics}>
        <article><span>Partners shown</span><strong>{partners.length}</strong><small>Up to 200 recent records</small></article>
        <article className={pendingCount ? styles.metricAttention : undefined}><span>Waiting for review</span><strong>{pendingCount}</strong><small>Approve only after verification</small></article>
        <article><span>Referrals</span><strong>{referralCount}</strong><small>Across the filtered network</small></article>
      </div>
      <form className={styles.filters} onSubmit={(event) => { event.preventDefault(); setFilters({ type, status, query: query.trim() }); setOpenId(null); }}>
        <label className={styles.searchField}>Search<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Name, code, email or phone" maxLength={100} /></label>
        <label>Partner type<select value={type} onChange={(event) => setType(event.target.value as PartnerType | "")}><option value="">All types</option>{PARTNER_TYPES.map((value) => <option key={value} value={value}>{TYPE_LABELS[value]}</option>)}</select></label>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as PartnerStatus | "")}><option value="">All statuses</option>{PARTNER_STATUSES.map((value) => <option key={value} value={value}>{readable(value)}</option>)}</select></label>
        <button type="submit">Apply filters</button>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {loading ? <div className={styles.loading}><span aria-hidden="true" />Loading partner network…</div> : partners.length === 0 ? (
        <div className={styles.empty}><strong>No partners match</strong><span>Try a broader filter or add the first partner.</span></div>
      ) : (
        <div className={styles.partnerList}>
          <div className={styles.columnHead} aria-hidden="true"><span>Partner</span><span>Offer</span><span>Referrals</span><span>Status</span><span /></div>
          {partners.map((partner) => {
            const open = openId === partner.id;
            return <article className={`${styles.partnerRow} ${open ? styles.partnerRowOpen : ""}`} key={partner.id}>
              <button type="button" className={styles.partnerSummary} aria-expanded={open} onClick={() => setOpenId(open ? null : partner.id)}>
                <span className={styles.partnerIdentity}><strong>{partner.name}</strong><small>{TYPE_LABELS[partner.type]} · {partner.code}</small></span>
                <span className={styles.reward}>{rewardSummary(partner)}<small>{money(partner.refereeDiscountRs)} customer discount</small></span>
                <span className={styles.referralCount}>{partner._count?.referrals ?? 0}</span><StatusPill value={partner.status} />
                <span className={styles.chevron} aria-hidden="true">{open ? "−" : "+"}</span>
              </button>
              {open && <PartnerDetailView id={partner.id} onChanged={() => setReloadKey((value) => value + 1)} />}
            </article>;
          })}
        </div>
      )}
    </section>
  );
}

function PartnerDetailView({ id, onChanged }: { id: string; onChanged: () => void }) {
  const [detail, setDetail] = useState<PartnerDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [editing, setEditing] = useState(false);
  const [busyAction, setBusyAction] = useState<PartnerStatus | "">("");
  const [showBank, setShowBank] = useState(false);
  const [detailVersion, setDetailVersion] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError("");
      try {
        const result = await requestJson<{ partner: PartnerDetail }>(`/api/admin/partners?tab=detail&id=${encodeURIComponent(id)}`);
        if (active) setDetail(result.partner);
      } catch (caught: unknown) {
        if (active) setError(caught instanceof Error ? caught.message : "Partner details could not be loaded.");
      } finally { if (active) setLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, [id, detailVersion]);

  const changeStatus = async (status: PartnerStatus) => {
    if (!detail || !window.confirm(`${readable(status)} ${detail.name}? This change is recorded immediately.`)) return;
    setBusyAction(status); setError(""); setNotice("");
    try {
      await requestJson<{ ok: true }>("/api/admin/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "setStatus", data: { id, status } }) });
      setNotice(`Partner is now ${readable(status).toLowerCase()}.`); setDetailVersion((value) => value + 1); onChanged();
    } catch (caught: unknown) { setError(caught instanceof Error ? caught.message : "Status could not be changed."); }
    finally { setBusyAction(""); }
  };

  const copyLink = async () => {
    if (!detail) return;
    const url = new URL(`/p/${detail.customLandingSlug || detail.code}`, window.location.origin).toString();
    try { await navigator.clipboard.writeText(url); setNotice("Referral link copied."); }
    catch { setError("The referral link could not be copied. Open it and copy the address instead."); }
  };

  if (loading) return <div className={styles.loading}><span aria-hidden="true" />Loading partner details…</div>;
  if (!detail) return <div className={styles.detail}><p className={styles.error} role="alert">{error || "Partner details are unavailable."}</p></div>;
  const firstOrders = detail.referrals.filter((referral) => referral.status === "FIRST_ORDER" || referral.status === "REWARD_PAID").length;
  const hasBankDetails = Boolean(detail.panNumber || detail.bankAccountName || detail.bankAccountNumber || detail.bankIfsc);
  return (
    <div className={styles.detail}>
      <div className={styles.detailActions}>
        <div>
          {detail.status === "PENDING" && <button type="button" className={styles.primaryButton} disabled={Boolean(busyAction)} onClick={() => void changeStatus("ACTIVE")}>Approve partner</button>}
          {detail.status === "PENDING" && <button type="button" className={styles.dangerButton} disabled={Boolean(busyAction)} onClick={() => void changeStatus("REJECTED")}>Reject</button>}
          {detail.status === "ACTIVE" && <button type="button" disabled={Boolean(busyAction)} onClick={() => void changeStatus("PAUSED")}>Pause referrals</button>}
          {detail.status === "PAUSED" && <button type="button" className={styles.primaryButton} disabled={Boolean(busyAction)} onClick={() => void changeStatus("ACTIVE")}>Resume referrals</button>}
          {detail.status !== "TERMINATED" && <button type="button" className={styles.dangerButton} disabled={Boolean(busyAction)} onClick={() => void changeStatus("TERMINATED")}>Terminate</button>}
          {detail.status !== "TERMINATED" && <button type="button" onClick={() => setEditing((value) => !value)}>{editing ? "Close editor" : "Edit details"}</button>}
        </div>
        <div><button type="button" onClick={() => void copyLink()}>Copy referral link</button><a href={`/p/${detail.customLandingSlug || detail.code}`} target="_blank" rel="noreferrer">Open landing page</a><a href={`/api/admin/partners/qr?code=${encodeURIComponent(detail.code)}&download=1`}>Download QR</a></div>
      </div>
      {error && <p className={styles.error} role="alert">{error}</p>}{notice && <p className={styles.success} role="status">{notice}</p>}
      {editing && <PartnerForm initial={detail} onSaved={() => { setEditing(false); setNotice("Partner details saved."); setDetailVersion((value) => value + 1); onChanged(); }} />}
      <div className={styles.detailMetrics}>
        <article><span>Total referrals</span><strong>{detail.referrals.length}</strong></article><article><span>First orders</span><strong>{firstOrders}</strong></article>
        <article><span>Partner reward</span><strong>{rewardSummary(detail)}</strong></article><article><span>Customer offer</span><strong>{money(detail.refereeDiscountRs)}</strong></article>
      </div>
      <div className={styles.detailGrid}>
        <section><div className={styles.sectionTitle}><div><h3>Referral activity</h3><p>The latest 100 referrals, newest first.</p></div></div>
          {detail.referrals.length === 0 ? <p className={styles.emptyCompact}>No referrals yet.</p> : <div className={styles.activityList}>{detail.referrals.map((referral) => <article key={referral.id}>
            <div><strong>{referral.refereeUser?.name || referral.refereeUser?.email || "Unlinked visitor"}</strong><small>{shortDate(referral.createdAt)}{referral.refereeOrder ? ` · Order ${referral.refereeOrder.orderNumber}` : ""}</small></div>
            <div className={styles.activityEnd}><StatusPill value={referral.status} /><small>{referral.rewardAmountRs > 0 ? money(referral.rewardAmountRs) : REWARD_LABELS[referral.rewardType]}</small></div>
          </article>)}</div>}
        </section>
        <aside>
          <section className={styles.contactCard}><div className={styles.sectionTitle}><div><h3>Partner contact</h3><p>{TYPE_LABELS[detail.type]} · Joined {shortDate(detail.createdAt)}</p></div></div><dl>
            <div><dt>Email</dt><dd>{detail.contactEmail || detail.ownerUser?.email || "Not provided"}</dd></div><div><dt>Phone</dt><dd>{detail.contactPhone || "Not provided"}</dd></div>
            <div><dt>Account</dt><dd>{detail.ownerUser ? detail.ownerUser.name || detail.ownerUser.email : "No owner account linked"}</dd></div><div><dt>Code</dt><dd>{detail.code}</dd></div>
          </dl></section>
          {hasBankDetails && <section className={styles.bankCard}><div className={styles.sectionTitle}><div><h3>Payout details</h3><p>Hidden by default because these are sensitive records.</p></div><button type="button" onClick={() => setShowBank((value) => !value)}>{showBank ? "Hide" : "Reveal"}</button></div><dl aria-live="polite">
            <div><dt>Account holder</dt><dd>{showBank ? detail.bankAccountName || "—" : "••••••••"}</dd></div><div><dt>Account number</dt><dd>{showBank ? detail.bankAccountNumber || "—" : "••••••••"}</dd></div>
            <div><dt>IFSC</dt><dd>{showBank ? detail.bankIfsc || "—" : "••••••••"}</dd></div><div><dt>PAN</dt><dd>{showBank ? detail.panNumber || "—" : "••••••••"}</dd></div>
          </dl></section>}
          <section className={styles.contactCard}><div className={styles.sectionTitle}><div><h3>Payout history</h3><p>Recorded settlements for this partner.</p></div></div>
            {detail.payouts.length === 0 ? <p className={styles.emptyCompact}>No payouts generated.</p> : <div className={styles.miniPayoutList}>{detail.payouts.map((payout) => <div key={payout.id}><span><strong>{payout.periodYearMonth}</strong><small>{payout.referralCount} referrals</small></span><span><strong>{money(payout.amountRs)}</strong><StatusPill value={payout.status} /></span></div>)}</div>}
          </section>
        </aside>
      </div>
    </div>
  );
}

function PartnerForm({ initial, onSaved }: { initial?: PartnerDetail; onSaved: () => void }) {
  const [form, setForm] = useState<PartnerFormState>(() => initial ? detailForm(initial) : blankForm());
  const [busy, setBusy] = useState(false); const [error, setError] = useState(""); const editing = Boolean(initial);
  const update = <K extends keyof PartnerFormState>(key: K, value: PartnerFormState[K]) => setForm((current) => ({ ...current, [key]: value }));
  const changeType = (type: PartnerType) => setForm((current) => ({ ...current, type, ...TYPE_DEFAULTS[type] }));
  const editableData = {
    name: form.name, contactEmail: form.contactEmail, contactPhone: form.contactPhone, customLandingSlug: form.customLandingSlug,
    rewardType: form.rewardType, rewardValueRs: form.rewardType === "DISCOUNT_ONLY" ? 0 : form.rewardValueRs, refereeDiscountRs: form.refereeDiscountRs,
    gymAddress: form.gymAddress, gymManagerName: form.gymManagerName, bio: form.bio, specialty: form.specialty,
    profilePhotoUrl: form.profilePhotoUrl, socialHandle: form.socialHandle, followerCount: form.followerCount,
    qualification: form.qualification, registrationNumber: form.registrationNumber, clinicName: form.clinicName,
    credentialDocUrl: form.credentialDocUrl, hospitalAffiliation: form.hospitalAffiliation, companyLogoUrl: form.companyLogoUrl,
    allowedEmailDomain: form.allowedEmailDomain, hrContactName: form.hrContactName, treasurerContact: form.treasurerContact,
    societyAddress: form.societyAddress, adminNotes: form.adminNotes, internalLabel: form.internalLabel,
  };
  const save = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setBusy(true); setError("");
    try {
      const data = editing ? { id: initial?.id, ...editableData } : { ...editableData, type: form.type, status: form.status, code: form.code, ownerUserEmail: form.ownerUserEmail };
      await requestJson<{ ok: true }>("/api/admin/partners", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: editing ? "update" : "create", data }) });
      onSaved();
    } catch (caught: unknown) { setError(caught instanceof Error ? caught.message : "Partner details could not be saved."); }
    finally { setBusy(false); }
  };
  const professional = form.type === "DIETICIAN" || form.type === "DOCTOR";
  const creator = form.type === "TRAINER" || form.type === "INFLUENCER";
  return (
    <form className={`${styles.partnerForm} ${editing ? styles.embeddedForm : ""}`} onSubmit={(event) => void save(event)}>
      <div className={styles.sectionTitle}><div><h2>{editing ? "Edit partner" : "Add a partner"}</h2><p>{editing ? "The partner type, owner account, and referral code stay fixed." : "New records start pending unless you deliberately activate them."}</p></div></div>
      {error && <p className={styles.error} role="alert">{error}</p>}
      {!editing && <fieldset className={styles.formSection}><legend>Partnership</legend><div className={styles.formGrid}>
        <SelectField label="Partner type" value={form.type} onChange={(value) => changeType(value as PartnerType)} options={PARTNER_TYPES.map((value) => ({ value, label: TYPE_LABELS[value] }))} />
        <SelectField label="Starting status" value={form.status} onChange={(value) => update("status", value as PartnerStatus)} options={PARTNER_STATUSES.map((value) => ({ value, label: readable(value) }))} help="Pending is safest when credentials still need review." />
        <TextField label="Referral code" value={form.code} onChange={(value) => update("code", value)} placeholder="Leave blank to generate" maxLength={64} />
        <TextField label="Owner account email" value={form.ownerUserEmail} onChange={(value) => update("ownerUserEmail", value)} type="email" placeholder="Optional existing FitFuel account" maxLength={254} />
      </div></fieldset>}
      <fieldset className={styles.formSection}><legend>Identity and contact</legend><div className={styles.formGrid}>
        <TextField label="Partner name" value={form.name} onChange={(value) => update("name", value)} required maxLength={160} />
        <TextField label="Internal label" value={form.internalLabel} onChange={(value) => update("internalLabel", value)} placeholder="Visible to staff only" maxLength={160} />
        <TextField label="Contact email" value={form.contactEmail} onChange={(value) => update("contactEmail", value)} type="email" maxLength={254} />
        <TextField label="Contact phone" value={form.contactPhone} onChange={(value) => update("contactPhone", value)} type="tel" maxLength={20} />
        <TextField label="Custom landing slug" value={form.customLandingSlug} onChange={(value) => update("customLandingSlug", value)} placeholder="healthy-lunch-at-acme" pattern="[a-z0-9]+(?:-[a-z0-9]+)*" maxLength={80} help="Lowercase letters, numbers, and hyphens." />
      </div></fieldset>
      <fieldset className={styles.formSection}><legend>Commercial offer</legend><div className={styles.formGrid}>
        <SelectField label="Partner reward" value={form.rewardType} onChange={(value) => update("rewardType", value as RewardType)} options={REWARD_TYPES.map((value) => ({ value, label: REWARD_LABELS[value] }))} />
        <NumberField label={form.rewardType === "MEAL_VOUCHER" ? "Vouchers per referral" : "Reward per referral (₹)"} value={form.rewardValueRs} onChange={(value) => update("rewardValueRs", value as number)} min={0} max={1_000_000} disabled={form.rewardType === "DISCOUNT_ONLY"} />
        <NumberField label="New customer discount (₹)" value={form.refereeDiscountRs} onChange={(value) => update("refereeDiscountRs", value as number)} min={0} max={100_000} />
      </div></fieldset>
      {form.type === "GYM" && <fieldset className={styles.formSection}><legend>Gym details</legend><div className={styles.formGrid}><TextField label="Manager name" value={form.gymManagerName} onChange={(value) => update("gymManagerName", value)} maxLength={120} /><TextAreaField label="Gym address" value={form.gymAddress} onChange={(value) => update("gymAddress", value)} maxLength={500} /></div></fieldset>}
      {creator && <fieldset className={styles.formSection}><legend>Profile</legend><div className={styles.formGrid}>
        <TextField label="Specialty" value={form.specialty} onChange={(value) => update("specialty", value)} maxLength={200} /><TextField label="Social handle" value={form.socialHandle} onChange={(value) => update("socialHandle", value)} maxLength={120} />
        <TextField label="Profile photo URL" value={form.profilePhotoUrl} onChange={(value) => update("profilePhotoUrl", value)} type="url" maxLength={2048} /><NumberField label="Follower count" value={form.followerCount} onChange={(value) => update("followerCount", value)} min={0} max={2_000_000_000} allowBlank />
        <TextAreaField label="Public bio" value={form.bio} onChange={(value) => update("bio", value)} maxLength={2_000} wide />
      </div></fieldset>}
      {professional && <fieldset className={styles.formSection}><legend>Professional credentials</legend><div className={styles.formGrid}>
        <TextField label="Qualification" value={form.qualification} onChange={(value) => update("qualification", value)} maxLength={300} /><TextField label="Registration number" value={form.registrationNumber} onChange={(value) => update("registrationNumber", value)} maxLength={160} />
        <TextField label="Clinic name" value={form.clinicName} onChange={(value) => update("clinicName", value)} maxLength={240} /><TextField label="Hospital affiliation" value={form.hospitalAffiliation} onChange={(value) => update("hospitalAffiliation", value)} maxLength={300} />
        <TextField label="Credential document URL" value={form.credentialDocUrl} onChange={(value) => update("credentialDocUrl", value)} type="url" maxLength={2048} wide />
      </div></fieldset>}
      {form.type === "CORPORATE" && <fieldset className={styles.formSection}><legend>Company programme</legend><div className={styles.formGrid}>
        <TextField label="HR contact" value={form.hrContactName} onChange={(value) => update("hrContactName", value)} maxLength={160} /><TextField label="Allowed email domain" value={form.allowedEmailDomain} onChange={(value) => update("allowedEmailDomain", value)} placeholder="company.com" maxLength={254} />
        <TextField label="Company logo URL" value={form.companyLogoUrl} onChange={(value) => update("companyLogoUrl", value)} type="url" maxLength={2048} wide />
      </div></fieldset>}
      {form.type === "RESIDENCE" && <fieldset className={styles.formSection}><legend>Housing society</legend><div className={styles.formGrid}><TextField label="Treasurer or committee contact" value={form.treasurerContact} onChange={(value) => update("treasurerContact", value)} maxLength={200} /><TextAreaField label="Society address" value={form.societyAddress} onChange={(value) => update("societyAddress", value)} maxLength={500} /></div></fieldset>}
      <fieldset className={styles.formSection}><legend>Staff notes</legend><div className={styles.formGrid}><TextAreaField label="Internal notes" value={form.adminNotes} onChange={(value) => update("adminNotes", value)} maxLength={4_000} wide /></div></fieldset>
      <div className={styles.formActions}><span>{editing ? "Status changes are handled separately." : "The referral code cannot be changed after creation."}</span><button type="submit" className={styles.primaryButton} disabled={busy}>{busy ? "Saving…" : editing ? "Save partner" : "Create partner"}</button></div>
    </form>
  );
}

function PayoutsTab() {
  const [payouts, setPayouts] = useState<Payout[]>([]); const [status, setStatus] = useState<PayoutStatus | "">(""); const [period, setPeriod] = useState("");
  const [filters, setFilters] = useState({ status: "", period: "" }); const [loading, setLoading] = useState(true); const [error, setError] = useState(""); const [notice, setNotice] = useState("");
  const [busyId, setBusyId] = useState(""); const [paymentRefs, setPaymentRefs] = useState<Record<string, string>>({}); const [revealed, setRevealed] = useState<Record<string, boolean>>({}); const [reloadKey, setReloadKey] = useState(0);
  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true); setError(""); const params = new URLSearchParams(); if (filters.status) params.set("status", filters.status); if (filters.period) params.set("period", filters.period);
      try { const result = await requestJson<{ payouts: Payout[] }>(`/api/admin/partners/payouts?${params}`); if (active) setPayouts(result.payouts); }
      catch (caught: unknown) { if (active) setError(caught instanceof Error ? caught.message : "Payouts could not be loaded."); }
      finally { if (active) setLoading(false); }
    };
    void load(); return () => { active = false; };
  }, [filters, reloadKey]);
  const updatePayout = useCallback(async (payout: Payout, action: "markProcessing" | "markFailed" | "markPaid") => {
    const paymentRef = paymentRefs[payout.id]?.trim() ?? "";
    if (action === "markPaid" && paymentRef.length < 3) { setError("Enter the bank or UPI payment reference before marking a payout paid."); return; }
    if (!window.confirm(`${action === "markPaid" ? "Mark paid" : action === "markFailed" ? "Mark failed" : "Start processing"}: ${payout.partnerName} for ${money(payout.amountRs)}?`)) return;
    setBusyId(payout.id); setError(""); setNotice("");
    try {
      await requestJson<{ ok: true }>("/api/admin/partners/payouts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action, id: payout.id, ...(action === "markPaid" ? { paymentRef } : {}) }) });
      setNotice(`${payout.partnerName}'s payout was updated.`); setReloadKey((value) => value + 1);
    } catch (caught: unknown) { setError(caught instanceof Error ? caught.message : "Payout could not be updated."); }
    finally { setBusyId(""); }
  }, [paymentRefs]);
  const exportParams = new URLSearchParams({ format: "csv" }); if (filters.status) exportParams.set("status", filters.status); if (filters.period) exportParams.set("period", filters.period);
  const outstanding = payouts.filter((payout) => payout.status !== "PAID");
  return (
    <section className={styles.section} aria-labelledby="payouts-title">
      <div className={styles.sectionTitle}><div><h2 id="payouts-title">Payout reconciliation</h2><p>Move a payout through processing, record the bank reference, then close it as paid. Recording it here does not move money at the bank.</p></div></div>
      <div className={styles.metrics}><article><span>Payouts shown</span><strong>{payouts.length}</strong><small>For the current filters</small></article><article className={outstanding.length ? styles.metricAttention : undefined}><span>Not settled</span><strong>{outstanding.length}</strong><small>Pending, processing or failed</small></article><article><span>Outstanding value</span><strong>{money(outstanding.reduce((sum, payout) => sum + payout.amountRs, 0))}</strong><small>Must be paid outside FitFuel</small></article></div>
      <form className={styles.payoutFilters} onSubmit={(event) => { event.preventDefault(); setFilters({ status, period }); }}>
        <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as PayoutStatus | "")}><option value="">All statuses</option>{PAYOUT_STATUSES.map((value) => <option value={value} key={value}>{readable(value)}</option>)}</select></label>
        <label>Month<input type="month" min="2024-01" max="2099-12" value={period} onChange={(event) => setPeriod(event.target.value)} /></label><button type="submit">Apply filters</button><a href={`/api/admin/partners/payouts?${exportParams}`}>Download CSV</a>
      </form>
      {error && <p className={styles.error} role="alert">{error}</p>}{notice && <p className={styles.success} role="status">{notice}</p>}
      {loading ? <div className={styles.loading}><span aria-hidden="true" />Loading payouts…</div> : payouts.length === 0 ? <div className={styles.empty}><strong>No payouts match</strong><span>Change the filters or wait for the next payout run.</span></div> : <div className={styles.payoutList}>{payouts.map((payout) => {
        const isBusy = busyId === payout.id; const showDetails = Boolean(revealed[payout.id]); const hasPaymentDetails = Boolean(payout.bankAccountName || payout.bankAccountNumber || payout.bankIfsc || payout.panNumber);
        return <article key={payout.id} className={styles.payoutCard}><header><div><strong>{payout.partnerName}</strong><small>{TYPE_LABELS[payout.partnerType]} · {payout.partnerCode} · {payout.periodYearMonth}</small></div><div><strong>{money(payout.amountRs)}</strong><StatusPill value={payout.status} /></div></header>
          <div className={styles.payoutFacts}><span><small>Eligible referrals</small><strong>{payout.referralCount}</strong></span><span><small>Reward format</small><strong>{REWARD_LABELS[payout.rewardType]}</strong></span><span><small>Contact</small><strong>{payout.contactEmail || payout.contactPhone || "Not provided"}</strong></span><span><small>Paid on</small><strong>{shortDate(payout.paidAt)}</strong></span></div>
          {hasPaymentDetails && <div className={styles.sensitivePanel}><button type="button" onClick={() => setRevealed((current) => ({ ...current, [payout.id]: !showDetails }))}>{showDetails ? "Hide payout details" : "Reveal payout details"}</button><dl><div><dt>Account holder</dt><dd>{showDetails ? payout.bankAccountName || "—" : "••••••••"}</dd></div><div><dt>Account number</dt><dd>{showDetails ? payout.bankAccountNumber || "—" : "••••••••"}</dd></div><div><dt>IFSC</dt><dd>{showDetails ? payout.bankIfsc || "—" : "••••••••"}</dd></div><div><dt>PAN</dt><dd>{showDetails ? payout.panNumber || "—" : "••••••••"}</dd></div></dl></div>}
          {payout.status === "PAID" ? <p className={styles.paidReference}>Paid reference: <strong>{payout.paymentRef || "Missing reference"}</strong></p> : <div className={styles.payoutActions}>{(payout.status === "PENDING" || payout.status === "PROCESSING") && <label>Bank or UPI reference<input value={paymentRefs[payout.id] ?? ""} onChange={(event) => setPaymentRefs((current) => ({ ...current, [payout.id]: event.target.value }))} maxLength={200} placeholder="Required to close as paid" /></label>}<div>
            {(payout.status === "PENDING" || payout.status === "FAILED") && <button type="button" disabled={isBusy} onClick={() => void updatePayout(payout, "markProcessing")}>{payout.status === "FAILED" ? "Retry processing" : "Start processing"}</button>}
            {(payout.status === "PENDING" || payout.status === "PROCESSING") && <button type="button" className={styles.primaryButton} disabled={isBusy} onClick={() => void updatePayout(payout, "markPaid")}>Mark paid</button>}
            {payout.status === "PROCESSING" && <button type="button" className={styles.dangerButton} disabled={isBusy} onClick={() => void updatePayout(payout, "markFailed")}>Mark failed</button>}
          </div></div>}
        </article>;
      })}</div>}
    </section>
  );
}

type FieldProps = { label: string; value: string; onChange: (value: string) => void; help?: string; wide?: boolean };
function TextField({ label, value, onChange, help, wide, ...inputProps }: FieldProps & Pick<React.InputHTMLAttributes<HTMLInputElement>, "type" | "placeholder" | "required" | "maxLength" | "pattern">) {
  return <label className={wide ? styles.wideField : undefined}>{label}<input {...inputProps} value={value} onChange={(event) => onChange(event.target.value)} />{help && <small>{help}</small>}</label>;
}
function TextAreaField({ label, value, onChange, help, wide, maxLength }: FieldProps & { maxLength: number }) {
  return <label className={wide ? styles.wideField : undefined}>{label}<textarea value={value} onChange={(event) => onChange(event.target.value)} maxLength={maxLength} />{help && <small>{help}</small>}</label>;
}
function NumberField({ label, value, onChange, min, max, disabled, allowBlank }: { label: string; value: number | ""; onChange: (value: number | "") => void; min: number; max: number; disabled?: boolean; allowBlank?: boolean }) {
  return <label>{label}<input type="number" value={value} min={min} max={max} disabled={disabled} required={!allowBlank && !disabled} onChange={(event) => onChange(event.target.value === "" ? "" : Number(event.target.value))} /></label>;
}
function SelectField({ label, value, onChange, options, help }: { label: string; value: string; onChange: (value: string) => void; options: { value: string; label: string }[]; help?: string }) {
  return <label>{label}<select value={value} onChange={(event) => onChange(event.target.value)}>{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select>{help && <small>{help}</small>}</label>;
}
