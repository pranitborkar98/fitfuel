"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import styles from "./coupons.module.css";

type DiscountType = "PERCENT" | "FLAT" | "FREE_DELIVERY";
type Coupon = {
  id: string;
  code: string;
  discountType: DiscountType;
  value: number;
  maxDiscountRs: number | null;
  minOrderRs: number | null;
  appliesTo: string;
  firstOrderOnly: boolean;
  usageLimitGlobal: number | null;
  usageLimitPerUser: number | null;
  validFrom: string | null;
  validUntil: string | null;
  source: string;
  isActive: boolean;
  redemptions: number;
  createdAt: string;
};

type CouponForm = {
  code: string;
  discountType: DiscountType;
  value: string;
  maxDiscountRs: string;
  minOrderRs: string;
  appliesTo: string;
  firstOrderOnly: boolean;
  usageLimitGlobal: string;
  usageLimitPerUser: string;
  validFrom: string;
  validUntil: string;
};

type Message = { kind: "success" | "error"; text: string } | null;

const EMPTY_FORM: CouponForm = {
  code: "",
  discountType: "PERCENT",
  value: "",
  maxDiscountRs: "",
  minOrderRs: "",
  appliesTo: "ALL",
  firstOrderOnly: false,
  usageLimitGlobal: "",
  usageLimitPerUser: "1",
  validFrom: "",
  validUntil: "",
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function errorMessage(value: unknown, fallback: string): string {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}

function isCoupon(value: unknown): value is Coupon {
  if (!isRecord(value)) return false;
  return typeof value.id === "string"
    && typeof value.code === "string"
    && ["PERCENT", "FLAT", "FREE_DELIVERY"].includes(String(value.discountType))
    && typeof value.value === "number"
    && typeof value.appliesTo === "string"
    && typeof value.isActive === "boolean"
    && typeof value.redemptions === "number";
}

function dateInput(value: string | null): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function formFromCoupon(coupon: Coupon): CouponForm {
  return {
    code: coupon.code,
    discountType: coupon.discountType,
    value: coupon.discountType === "FREE_DELIVERY" ? "" : String(coupon.value),
    maxDiscountRs: coupon.maxDiscountRs === null ? "" : String(coupon.maxDiscountRs),
    minOrderRs: coupon.minOrderRs === null ? "" : String(coupon.minOrderRs),
    appliesTo: coupon.appliesTo,
    firstOrderOnly: coupon.firstOrderOnly,
    usageLimitGlobal: coupon.usageLimitGlobal === null ? "" : String(coupon.usageLimitGlobal),
    usageLimitPerUser: coupon.usageLimitPerUser === null ? "" : String(coupon.usageLimitPerUser),
    validFrom: dateInput(coupon.validFrom),
    validUntil: dateInput(coupon.validUntil),
  };
}

function money(value: number): string {
  return `₹${value.toLocaleString("en-IN")}`;
}

function humanDate(value: string | null): string {
  if (!value) return "No end date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Invalid date";
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

function discountLabel(coupon: Coupon): string {
  if (coupon.discountType === "PERCENT") {
    return `${coupon.value}% off${coupon.maxDiscountRs ? `, up to ${money(coupon.maxDiscountRs)}` : ""}`;
  }
  if (coupon.discountType === "FLAT") return `${money(coupon.value)} off`;
  return "Free delivery";
}

async function request(payload?: Record<string, unknown>): Promise<Record<string, unknown>> {
  const response = await fetch("/api/admin/coupons", payload ? {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  } : undefined);
  const data: unknown = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(errorMessage(data, "Coupon request failed."));
  return isRecord(data) ? data : {};
}

export default function CouponsClient() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<CouponForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [workingId, setWorkingId] = useState<string | null>(null);
  const [message, setMessage] = useState<Message>(null);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"ALL" | "ACTIVE" | "PAUSED" | "EXPIRED">("ALL");
  const [now, setNow] = useState(0);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await request();
      const list = Array.isArray(data.coupons) ? data.coupons.filter(isCoupon) : [];
      setCoupons(list);
      setNow(Date.now());
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Coupons could not be loaded." });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => void load());
  }, [load]);

  const metrics = useMemo(() => ({
    active: coupons.filter((coupon) => coupon.isActive && (!coupon.validUntil || new Date(coupon.validUntil).getTime() >= now)).length,
    redemptions: coupons.reduce((sum, coupon) => sum + coupon.redemptions, 0),
    paused: coupons.filter((coupon) => !coupon.isActive).length,
  }), [coupons, now]);

  const visibleCoupons = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return coupons.filter((coupon) => {
      const expired = Boolean(coupon.validUntil && new Date(coupon.validUntil).getTime() < now);
      const statusMatch = status === "ALL"
        || (status === "ACTIVE" && coupon.isActive && !expired)
        || (status === "PAUSED" && !coupon.isActive)
        || (status === "EXPIRED" && expired);
      const queryMatch = !needle || `${coupon.code} ${coupon.appliesTo} ${discountLabel(coupon)}`.toLowerCase().includes(needle);
      return statusMatch && queryMatch;
    });
  }, [coupons, now, query, status]);

  function setField<K extends keyof CouponForm>(key: K, value: CouponForm[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function openCreate() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setMessage(null);
    setShowForm(true);
  }

  function openEdit(coupon: Coupon) {
    setEditingId(coupon.id);
    setForm(formFromCoupon(coupon));
    setMessage(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function closeForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setShowForm(false);
  }

  async function save() {
    setSaving(true);
    setMessage(null);
    try {
      await request({
        action: editingId ? "update" : "create",
        ...(editingId ? { id: editingId } : { code: form.code }),
        discountType: form.discountType,
        value: form.discountType === "FREE_DELIVERY" ? 0 : form.value,
        maxDiscountRs: form.maxDiscountRs || null,
        minOrderRs: form.minOrderRs || null,
        appliesTo: form.appliesTo,
        firstOrderOnly: form.firstOrderOnly,
        usageLimitGlobal: form.usageLimitGlobal || null,
        usageLimitPerUser: form.usageLimitPerUser || null,
        validFrom: form.validFrom || null,
        validUntil: form.validUntil || null,
        stackable: false,
      });
      const savedCode = form.code.toUpperCase();
      closeForm();
      setMessage({ kind: "success", text: `${savedCode} ${editingId ? "updated" : "created"}.` });
      await load();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Coupon could not be saved." });
    } finally {
      setSaving(false);
    }
  }

  async function setActive(coupon: Coupon, isActive: boolean) {
    setWorkingId(coupon.id);
    setMessage(null);
    try {
      await request({ action: "toggle", id: coupon.id, isActive });
      setMessage({ kind: "success", text: `${coupon.code} ${isActive ? "resumed" : "paused"}.` });
      await load();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Status could not be changed." });
    } finally {
      setWorkingId(null);
    }
  }

  async function remove(coupon: Coupon) {
    const wording = coupon.redemptions > 0 ? "deactivate" : "permanently remove";
    if (!window.confirm(`Do you want to ${wording} ${coupon.code}?`)) return;
    setWorkingId(coupon.id);
    setMessage(null);
    try {
      const result = await request({ action: "delete", id: coupon.id });
      setMessage({
        kind: "success",
        text: result.deactivated === true
          ? `${coupon.code} has order history, so it was safely deactivated.`
          : `${coupon.code} removed.`,
      });
      await load();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Coupon could not be removed." });
    } finally {
      setWorkingId(null);
    }
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Promotions</p>
          <h1>Coupons</h1>
          <p>Create offers customers can actually understand, and see the usage limits before a campaign gets away from you.</p>
        </div>
        <button type="button" className={styles.newButton} onClick={openCreate}>Create coupon</button>
      </header>

      {message ? (
        <p className={message.kind === "success" ? styles.success : styles.error} role={message.kind === "error" ? "alert" : "status"}>
          {message.text}
        </p>
      ) : null}

      <section className={styles.metrics} aria-label="Coupon summary">
        <article><span>Live offers</span><strong>{metrics.active}</strong><small>Available now</small></article>
        <article><span>Redemptions</span><strong>{metrics.redemptions.toLocaleString("en-IN")}</strong><small>Across all coupons</small></article>
        <article><span>Paused</span><strong>{metrics.paused}</strong><small>Kept for reporting</small></article>
      </section>

      {showForm ? (
        <section className={styles.form} aria-labelledby="coupon-form-title">
          <div className={styles.formHeader}>
            <div>
              <h2 id="coupon-form-title">{editingId ? "Edit coupon" : "New coupon"}</h2>
              <p>Discounts are calculated before GST. If a referral is worth more, the customer automatically gets the better offer.</p>
            </div>
            {editingId ? <span className={styles.codePreview}>{form.code}</span> : null}
          </div>

          <div className={styles.formGrid}>
            <label>
              Coupon code
              <input
                value={form.code}
                disabled={Boolean(editingId)}
                maxLength={40}
                autoCapitalize="characters"
                placeholder="PUNE20"
                onChange={(event) => setField("code", event.target.value.toUpperCase().replace(/\s/g, ""))}
              />
            </label>
            <label>
              Offer type
              <select value={form.discountType} onChange={(event) => setField("discountType", event.target.value as DiscountType)}>
                <option value="PERCENT">Percentage off</option>
                <option value="FLAT">Flat amount off</option>
                <option value="FREE_DELIVERY">Free delivery</option>
              </select>
            </label>
            <label>
              {form.discountType === "PERCENT" ? "Percentage" : "Discount amount"}
              <input
                type="number"
                min="1"
                max={form.discountType === "PERCENT" ? "100" : undefined}
                disabled={form.discountType === "FREE_DELIVERY"}
                value={form.value}
                placeholder={form.discountType === "PERCENT" ? "20" : "500"}
                onChange={(event) => setField("value", event.target.value)}
              />
            </label>
            <label>
              Maximum discount
              <input type="number" min="1" value={form.maxDiscountRs} placeholder="No cap" onChange={(event) => setField("maxDiscountRs", event.target.value)} />
            </label>
            <label>
              Minimum order
              <input type="number" min="0" value={form.minOrderRs} placeholder="No minimum" onChange={(event) => setField("minOrderRs", event.target.value)} />
            </label>
            <label>
              Applies to
              <input list="coupon-scopes" value={form.appliesTo} placeholder="ALL or a plan slug" onChange={(event) => setField("appliesTo", event.target.value)} />
              <datalist id="coupon-scopes">
                <option value="ALL" />
                <option value="PHYSICAL" />
                <option value="DIGITAL" />
              </datalist>
            </label>
            <label>
              Uses per customer
              <input type="number" min="1" value={form.usageLimitPerUser} placeholder="No limit" onChange={(event) => setField("usageLimitPerUser", event.target.value)} />
            </label>
            <label>
              Total uses
              <input type="number" min="1" value={form.usageLimitGlobal} placeholder="No limit" onChange={(event) => setField("usageLimitGlobal", event.target.value)} />
            </label>
            <label className={styles.checkboxField}>
              <input type="checkbox" checked={form.firstOrderOnly} onChange={(event) => setField("firstOrderOnly", event.target.checked)} />
              First paid order only
            </label>
            <label>
              Starts on
              <input type="date" value={form.validFrom} onChange={(event) => setField("validFrom", event.target.value)} />
            </label>
            <label>
              Ends after
              <input type="date" value={form.validUntil} onChange={(event) => setField("validUntil", event.target.value)} />
            </label>
          </div>

          <p className={styles.formNote}>The selected end date includes the full day in India. Coupons never combine with referral discounts; checkout gives the customer whichever single offer is better.</p>
          <div className={styles.formActions}>
            <span>{editingId ? "The code stays fixed so old orders remain easy to audit." : "New coupons become active immediately unless the start date is later."}</span>
            <div>
              <button type="button" onClick={closeForm} disabled={saving}>Cancel</button>
              <button type="button" className={styles.primaryButton} onClick={() => void save()} disabled={saving || !form.code || (form.discountType !== "FREE_DELIVERY" && !form.value)}>
                {saving ? "Saving…" : editingId ? "Save changes" : "Create coupon"}
              </button>
            </div>
          </div>
        </section>
      ) : null}

      <section className={styles.filters} aria-label="Filter coupons">
        <label>
          Search
          <input type="search" value={query} placeholder="Code, scope or offer" onChange={(event) => setQuery(event.target.value)} />
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => setStatus(event.target.value as typeof status)}>
            <option value="ALL">All coupons</option>
            <option value="ACTIVE">Live now</option>
            <option value="PAUSED">Paused</option>
            <option value="EXPIRED">Expired</option>
          </select>
        </label>
      </section>

      {loading ? (
        <div className={styles.loading}>Loading coupons…</div>
      ) : visibleCoupons.length === 0 ? (
        <div className={styles.empty}>
          <strong>No coupons match</strong>
          <span>Change the filters or create a new offer.</span>
        </div>
      ) : (
        <section className={styles.couponList} aria-label="Coupons">
          {visibleCoupons.map((coupon) => {
            const expired = Boolean(coupon.validUntil && new Date(coupon.validUntil).getTime() < now);
            const statusLabel = expired ? "Expired" : coupon.isActive ? "Live" : "Paused";
            const statusClass = expired ? styles.statusExpired : coupon.isActive ? styles.statusActive : styles.statusPaused;
            return (
              <article className={styles.couponCard} key={coupon.id}>
                <div className={styles.identity}>
                  <div><strong>{coupon.code}</strong><span className={`${styles.status} ${statusClass}`}>{statusLabel}</span></div>
                  <small>{coupon.source === "MANUAL" ? "Created by your team" : coupon.source.toLowerCase().replaceAll("_", " ")}</small>
                </div>
                <div className={styles.details}>
                  <div className={styles.discount}>
                    {discountLabel(coupon)}
                    {coupon.minOrderRs ? <span> · minimum {money(coupon.minOrderRs)}</span> : null}
                  </div>
                  <div className={styles.facts}>
                    <span>{coupon.appliesTo === "ALL" ? "All orders" : coupon.appliesTo}</span>
                    <span>{coupon.redemptions}{coupon.usageLimitGlobal ? ` of ${coupon.usageLimitGlobal}` : ""} used</span>
                    <span>{coupon.usageLimitPerUser ? `${coupon.usageLimitPerUser} per customer` : "No customer limit"}</span>
                    {coupon.firstOrderOnly ? <span>First order only</span> : null}
                    <span>Ends: {humanDate(coupon.validUntil)}</span>
                  </div>
                </div>
                <div className={styles.cardActions}>
                  <button type="button" onClick={() => openEdit(coupon)} disabled={workingId === coupon.id}>Edit</button>
                  <button type="button" className={styles.pauseButton} onClick={() => void setActive(coupon, !coupon.isActive)} disabled={workingId === coupon.id || expired}>
                    {coupon.isActive ? "Pause" : "Resume"}
                  </button>
                  <button type="button" className={styles.dangerButton} onClick={() => void remove(coupon)} disabled={workingId === coupon.id}>
                    {coupon.redemptions > 0 ? "Deactivate" : "Remove"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}
