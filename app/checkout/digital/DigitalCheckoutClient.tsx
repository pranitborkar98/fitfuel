"use client";

import { FormEvent, useEffect, useId, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Check, ChevronDown, LockKeyhole, TicketPercent } from "lucide-react";

import styles from "./digital-checkout.module.css";

export type DigitalCheckoutOffer = {
  planSlug: string;
  planName: string;
  durationKey: string;
  durationLabel: string;
  bundle: "STARTER" | "PRO";
  bundleName: string;
  cycleLengthDays: number;
  taxableRs: number;
  gstRs: number;
  gstPercent: number;
  totalRs: number;
};

type FieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  autoComplete?: string;
  inputMode?: "decimal" | "email" | "numeric" | "search" | "tel" | "text" | "url";
  required?: boolean;
  min?: number;
  max?: number;
};

function formatRs(value: number) {
  return `₹${Math.max(0, Math.round(value)).toLocaleString("en-IN")}`;
}

function Field({ label, value, onChange, placeholder, type = "text", autoComplete, inputMode, required, min, max }: FieldProps) {
  const id = useId();
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}{required ? <span aria-hidden="true"> *</span> : null}</label>
      <input
        id={id}
        type={type}
        value={value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        required={required}
        min={min}
        max={max}
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  );
}

export default function DigitalCheckoutClient({ offer }: { offer: DigitalCheckoutOffer }) {
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [heightCm, setHeightCm] = useState("");
  const [weightKg, setWeightKg] = useState("");
  const [targetWeightKg, setTargetWeightKg] = useState("");
  const [age, setAge] = useState("");
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountRs: number; totalRs: number } | null>(null);
  const [couponMessage, setCouponMessage] = useState<{ ok: boolean; text: string } | null>(null);
  const [couponBusy, setCouponBusy] = useState(false);
  const [creditBalance, setCreditBalance] = useState(0);
  const [creditApplicable, setCreditApplicable] = useState(0);
  const [useCredit, setUseCredit] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [serverTotalRs, setServerTotalRs] = useState<number | null>(null);
  const [referralDiscountRs, setReferralDiscountRs] = useState(0);
  const [payuData, setPayuData] = useState<Record<string, unknown> | null>(null);

  const totalAfterCoupon = appliedCoupon?.totalRs ?? offer.totalRs;
  const effectiveCredit = useCredit ? creditApplicable : 0;
  const calculatedTotal = Math.max(1, totalAfterCoupon - effectiveCredit);
  const payableTotal = serverTotalRs ?? calculatedTotal;

  useEffect(() => {
    if (!payuData) return;
    const form = document.getElementById("digital-payu-form") as HTMLFormElement | null;
    form?.submit();
  }, [payuData]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/checkout/credit-preview?subtotal=${totalAfterCoupon}`, { signal: controller.signal })
      .then((response) => response.json())
      .then((data) => {
        if (!data.signedIn || data.balanceRs <= 0) {
          setCreditBalance(0);
          setCreditApplicable(0);
          return;
        }
        setCreditBalance(data.balanceRs);
        setCreditApplicable(data.applicableRs);
        if (data.email) setEmail((current) => current || data.email);
      })
      .catch((requestError) => {
        if (requestError?.name !== "AbortError") {
          setCreditBalance(0);
          setCreditApplicable(0);
        }
      });
    return () => controller.abort();
  }, [totalAfterCoupon]);

  function invalidatePricePreview() {
    setServerTotalRs(null);
    setReferralDiscountRs(0);
    setError("");
  }

  async function applyCoupon() {
    const code = couponCode.trim().toUpperCase();
    if (!code) {
      setCouponMessage({ ok: false, text: "Enter a coupon code first." });
      return;
    }

    setCouponBusy(true);
    setCouponMessage(null);
    setServerTotalRs(null);
    try {
      const response = await fetch("/api/coupon/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          planSlug: offer.planSlug,
          dur: offer.durationKey,
          bundle: offer.bundle,
          email: email.trim() || undefined,
          isDigital: true,
        }),
      });
      const data = await response.json();
      if (!data.ok) {
        setAppliedCoupon(null);
        setCouponMessage({ ok: false, text: data.reason || "That coupon cannot be used here." });
        return;
      }
      setAppliedCoupon({ code, discountRs: data.discountRs, totalRs: data.totalRs });
      setCouponMessage({ ok: true, text: `${code} applied. You save ${formatRs(data.discountRs)}.` });
    } catch {
      setAppliedCoupon(null);
      setCouponMessage({ ok: false, text: "We could not check that code. Please try again." });
    } finally {
      setCouponBusy(false);
    }
  }

  async function startPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/payments/payu/digital", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstname,
          lastname,
          email,
          phone,
          planSlug: offer.planSlug,
          dur: offer.durationKey,
          bundle: offer.bundle,
          couponCode: appliedCoupon?.code,
          heightCm,
          weightKg,
          targetWeightKg,
          age,
          useCredit: useCredit && creditApplicable > 0,
          expectedTotalRs: payableTotal,
        }),
      });
      const data = await response.json();
      if (!response.ok || !data.hash) {
        if (response.status === 409 && Number.isFinite(data.totalRs)) {
          setServerTotalRs(data.totalRs);
          const referralSaving = Number(data.referralDiscountRs || 0);
          setReferralDiscountRs(referralSaving);
          if (referralSaving > (appliedCoupon?.discountRs ?? 0)) setAppliedCoupon(null);
        }
        setError(data.error || "We could not start payment. Please try again.");
        setBusy(false);
        return;
      }
      setPayuData(data);
    } catch {
      setError("We could not connect to payment. Check your connection and try again.");
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      {payuData && (
        <form id="digital-payu-form" method="POST" action={String(payuData.payuUrl)} hidden>
          {Object.entries(payuData).map(([key, value]) =>
            key !== "payuUrl" && key !== "creditAppliedRs" ? <input key={key} type="hidden" name={key} value={String(value)} /> : null,
          )}
        </form>
      )}

      <div className={styles.wrap}>
        <Link className={styles.backLink} href="/plans/digital">
          <ArrowLeft aria-hidden="true" size={17} /> Change digital plan
        </Link>
        <div className={styles.heading}>
          <p>Digital checkout</p>
          <h1>Get your plan.</h1>
          <span>No delivery address needed. Your download is attached to the email used below.</span>
        </div>

        <form className={styles.checkoutGrid} onSubmit={startPayment}>
          <div className={styles.formColumn}>
            <section className={styles.formCard} aria-labelledby="contact-heading">
              <div className={styles.cardHead}>
                <span>1</span>
                <div><h2 id="contact-heading">Your details</h2><p>Use the email you want on your FitFuel account.</p></div>
              </div>
              <div className={styles.twoFields}>
                <Field label="First name" value={firstname} onChange={setFirstname} placeholder="Your first name" autoComplete="given-name" required />
                <Field label="Last name" value={lastname} onChange={setLastname} placeholder="Your last name" autoComplete="family-name" />
              </div>
              <Field label="Email" value={email} onChange={(value) => { setEmail(value); setAppliedCoupon(null); setCouponMessage(null); invalidatePricePreview(); }} placeholder="you@example.com" type="email" inputMode="email" autoComplete="email" required />
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="98765 43210" type="tel" inputMode="tel" autoComplete="tel" required />
            </section>

            <details className={styles.personalise}>
              <summary>
                <span><strong>Personalise the opening page</strong><small>Optional</small></span>
                <ChevronDown aria-hidden="true" size={20} />
              </summary>
              <div className={styles.personaliseBody}>
                <p>Add these only if you want your PDF to open with calculated BMI, calorie context and a goal-weight projection. You can add them later in your dashboard.</p>
                <div className={styles.twoFields}>
                  <Field label="Height in cm" value={heightCm} onChange={setHeightCm} placeholder="175" type="number" inputMode="numeric" min={100} max={250} />
                  <Field label="Age" value={age} onChange={setAge} placeholder="28" type="number" inputMode="numeric" min={10} max={100} />
                  <Field label="Current weight in kg" value={weightKg} onChange={setWeightKg} placeholder="82" type="number" inputMode="decimal" min={20} max={300} />
                  <Field label="Goal weight in kg" value={targetWeightKg} onChange={setTargetWeightKg} placeholder="74" type="number" inputMode="decimal" min={20} max={300} />
                </div>
              </div>
            </details>
          </div>

          <aside className={styles.summary} aria-labelledby="summary-heading">
            <div className={styles.summaryTop}>
              <p>{offer.bundleName} · {offer.durationLabel}</p>
              <h2 id="summary-heading">{offer.planName}</h2>
              <span>{offer.cycleLengthDays} planned days with recipes, macros and a grocery list.</span>
            </div>

            <div className={styles.receipt}>
              <div><span>Plan before tax</span><strong>{formatRs(offer.taxableRs)}</strong></div>
              <div><span>GST ({offer.gstPercent}%)</span><strong>{formatRs(offer.gstRs)}</strong></div>
              {appliedCoupon && <div className={styles.saving}><span>Coupon {appliedCoupon.code}</span><strong>− {formatRs(appliedCoupon.discountRs)}</strong></div>}
              {referralDiscountRs > 0 && <div className={styles.saving}><span>Referral welcome</span><strong>− {formatRs(referralDiscountRs)}</strong></div>}
              {effectiveCredit > 0 && <div className={styles.saving}><span>FitFuel credit</span><strong>− {formatRs(effectiveCredit)}</strong></div>}
              <div className={styles.total}><span>{serverTotalRs === null ? "Total" : "Updated total"}</span><strong>{formatRs(payableTotal)}</strong></div>
            </div>

            <div className={styles.coupon}>
              <label htmlFor="digital-coupon"><TicketPercent aria-hidden="true" size={18} /> Coupon code</label>
              <div>
                <input
                  id="digital-coupon"
                  value={couponCode}
                  maxLength={40}
                  autoCapitalize="characters"
                  autoComplete="off"
                  placeholder="Enter code"
                  onChange={(event) => { setCouponCode(event.target.value.toUpperCase()); setAppliedCoupon(null); setCouponMessage(null); invalidatePricePreview(); }}
                />
                <button type="button" onClick={applyCoupon} disabled={couponBusy}>{couponBusy ? "Checking…" : "Apply"}</button>
              </div>
              {couponMessage && <p className={couponMessage.ok ? styles.success : styles.error} role="status">{couponMessage.text}</p>}
            </div>

            {creditApplicable > 0 && (
              <label className={styles.creditChoice}>
                <input type="checkbox" checked={useCredit} onChange={(event) => { setUseCredit(event.target.checked); invalidatePricePreview(); }} />
                <span><strong>Use {formatRs(creditApplicable)} FitFuel credit</strong><small>{formatRs(creditBalance)} available in your account</small></span>
              </label>
            )}

            <ul className={styles.includes} aria-label="Included with this purchase">
              <li><Check aria-hidden="true" size={16} /> Dashboard download after confirmed payment</li>
              <li><Check aria-hidden="true" size={16} /> Server-checked price and coupon</li>
              <li><Check aria-hidden="true" size={16} /> Secure payment handled by PayU</li>
            </ul>

            {error && <p className={styles.paymentError} role="alert">{error}</p>}
            <button className={styles.payButton} type="submit" disabled={busy}>
              <LockKeyhole aria-hidden="true" size={18} />
              {busy ? "Opening PayU…" : `Continue to pay ${formatRs(payableTotal)}`}
            </button>
            <p className={styles.finalNote}>The price, coupon eligibility and available credit are checked once more before PayU opens.</p>
          </aside>
        </form>
      </div>
    </main>
  );
}
