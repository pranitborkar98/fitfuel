"use client";

import Link from "next/link";
import { FormEvent, ReactNode, useState } from "react";
import styles from "./apply.module.css";

const PARTNER_TYPES = ["GYM", "TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "CORPORATE", "RESIDENCE"] as const;
type PartnerType = (typeof PARTNER_TYPES)[number];

type FormState = {
  name: string;
  contactEmail: string;
  contactPhone: string;
  gymAddress: string;
  gymManagerName: string;
  bio: string;
  specialty: string;
  socialHandle: string;
  followerCount: string;
  qualification: string;
  registrationNumber: string;
  clinicName: string;
  hospitalAffiliation: string;
  allowedEmailDomain: string;
  hrContactName: string;
  treasurerContact: string;
  societyAddress: string;
  panNumber: string;
  bankAccountName: string;
  bankAccountNumber: string;
  bankIfsc: string;
};

const LABELS: Record<PartnerType, string> = {
  GYM: "Gym or fitness studio",
  TRAINER: "Personal trainer",
  INFLUENCER: "Creator",
  DIETICIAN: "Dietitian or nutritionist",
  DOCTOR: "Doctor",
  CORPORATE: "Company",
  RESIDENCE: "Residential society",
};

const BLURBS: Record<PartnerType, string> = {
  GYM: "Give members a welcome offer and see paid conversions from your code.",
  TRAINER: "Earn a cash reward when a referred customer places their first paid order.",
  INFLUENCER: "Share a trackable code and earn on each customer’s first paid order.",
  DIETICIAN: "Offer clients an optional cooked-meal route without replacing your advice.",
  DOCTOR: "Share a cooked-meal option for patients who ask for practical food support.",
  CORPORATE: "Arrange an employee welcome offer with clear, attributable uptake.",
  RESIDENCE: "Bring a tracked resident offer to your society or apartment community.",
};

const CASH_TYPES = new Set<PartnerType>(["TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "RESIDENCE"]);

function isPartnerType(value: string | null): value is PartnerType {
  return Boolean(value && PARTNER_TYPES.includes(value as PartnerType));
}

export default function ApplyClient({
  prefill,
  initialType,
}: {
  prefill: { name: string; email: string; phone: string };
  initialType: string | null;
}) {
  const selectedInitially = isPartnerType(initialType) ? initialType : null;
  const [type, setType] = useState<PartnerType | null>(selectedInitially);
  const [step, setStep] = useState<"select" | "form" | "done">(selectedInitially ? "form" : "select");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({
    name: prefill.name,
    contactEmail: prefill.email,
    contactPhone: prefill.phone,
    gymAddress: "",
    gymManagerName: "",
    bio: "",
    specialty: "",
    socialHandle: "",
    followerCount: "",
    qualification: "",
    registrationNumber: "",
    clinicName: "",
    hospitalAffiliation: "",
    allowedEmailDomain: "",
    hrContactName: "",
    treasurerContact: "",
    societyAddress: "",
    panNumber: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
  });

  function update(field: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function choose(nextType: PartnerType) {
    setType(nextType);
    setError(null);
    setStep("form");
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!type || busy) return;
    setError(null);
    setBusy(true);

    try {
      const response = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, form }),
      });
      const result: unknown = await response.json().catch(() => null);
      if (!response.ok) {
        const message = result && typeof result === "object" && "error" in result && typeof result.error === "string"
          ? result.error
          : "Could not submit your application. Please try again.";
        setError(message);
        return;
      }
      setStep("done");
    } catch {
      setError("Could not connect. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className={styles.shell}>
        <p className={styles.eyebrow}>Partner with FitFuel</p>
        <h1>{step === "done" ? "Application received" : step === "form" && type ? LABELS[type] : "Choose how you work with us"}</h1>
        <p className={styles.intro}>
          {step === "done"
            ? "Your application is now in the review queue."
            : "Approved partners get a shareable code, a customer welcome offer, and a dashboard showing first paid conversions."}
        </p>

        {step === "select" && (
          <div className={styles.typeGrid} aria-label="Partner type">
            {PARTNER_TYPES.map((item) => (
              <button className={styles.typeCard} key={item} onClick={() => choose(item)} type="button">
                <span className={styles.typeTopline}>
                  <strong>{LABELS[item]}</strong>
                  <span>{CASH_TYPES.has(item) ? "Cash reward" : "Partner offer"}</span>
                </span>
                <span className={styles.typeBlurb}>{BLURBS[item]}</span>
              </button>
            ))}
          </div>
        )}

        {step === "form" && type && (
          <form className={styles.formCard} onSubmit={submit}>
            <button className={styles.backButton} onClick={() => setStep("select")} type="button">
              ← Change partner type
            </button>

            <Section title="Contact details">
              <Field id="partner-name" label={type === "CORPORATE" ? "Company name" : type === "RESIDENCE" ? "Society name" : "Public name"} required>
                <Input id="partner-name" value={form.name} onChange={(value) => update("name", value)} maxLength={160} required />
              </Field>
              <div className={styles.twoColumns}>
                <Field id="partner-email" label="Email" required>
                  <Input id="partner-email" type="email" value={form.contactEmail} onChange={(value) => update("contactEmail", value)} maxLength={254} required />
                </Field>
                <Field id="partner-phone" label="Phone">
                  <Input id="partner-phone" type="tel" value={form.contactPhone} onChange={(value) => update("contactPhone", value)} maxLength={20} />
                </Field>
              </div>
            </Section>

            {type === "GYM" && (
              <Section title="Gym details">
                <Field id="gym-address" label="Address">
                  <Input id="gym-address" value={form.gymAddress} onChange={(value) => update("gymAddress", value)} maxLength={500} placeholder="Locality, Pune" />
                </Field>
                <Field id="gym-manager" label="Manager or contact name">
                  <Input id="gym-manager" value={form.gymManagerName} onChange={(value) => update("gymManagerName", value)} maxLength={120} />
                </Field>
              </Section>
            )}

            {(type === "TRAINER" || type === "INFLUENCER") && (
              <Section title="About your work">
                <Field id="specialty" label="Speciality">
                  <Input id="specialty" value={form.specialty} onChange={(value) => update("specialty", value)} maxLength={160} placeholder="Strength training, running, nutrition…" />
                </Field>
                <Field id="partner-bio" label="Short introduction">
                  <textarea id="partner-bio" rows={4} value={form.bio} onChange={(event) => update("bio", event.target.value)} maxLength={800} />
                </Field>
                <div className={styles.twoColumns}>
                  <Field id="social-handle" label="Social handle">
                    <Input id="social-handle" value={form.socialHandle} onChange={(value) => update("socialHandle", value)} maxLength={120} placeholder="@yourhandle" />
                  </Field>
                  <Field id="followers" label="Approximate followers">
                    <Input id="followers" type="number" value={form.followerCount} onChange={(value) => update("followerCount", value)} min="0" max="1000000000" />
                  </Field>
                </div>
              </Section>
            )}

            {(type === "DIETICIAN" || type === "DOCTOR") && (
              <Section title="Professional details">
                <div className={styles.twoColumns}>
                  <Field id="qualification" label="Qualification">
                    <Input id="qualification" value={form.qualification} onChange={(value) => update("qualification", value)} maxLength={200} />
                  </Field>
                  <Field id="registration" label="Registration number">
                    <Input id="registration" value={form.registrationNumber} onChange={(value) => update("registrationNumber", value)} maxLength={120} />
                  </Field>
                </div>
                <Field id="clinic" label={type === "DOCTOR" ? "Clinic or hospital" : "Practice or clinic"}>
                  <Input id="clinic" value={form.clinicName} onChange={(value) => update("clinicName", value)} maxLength={200} />
                </Field>
                {type === "DOCTOR" && (
                  <Field id="hospital" label="Hospital affiliation">
                    <Input id="hospital" value={form.hospitalAffiliation} onChange={(value) => update("hospitalAffiliation", value)} maxLength={200} />
                  </Field>
                )}
              </Section>
            )}

            {type === "CORPORATE" && (
              <Section title="Company details">
                <Field id="hr-contact" label="HR or wellness contact">
                  <Input id="hr-contact" value={form.hrContactName} onChange={(value) => update("hrContactName", value)} maxLength={120} />
                </Field>
                <Field id="company-domain" label="Company email domain">
                  <Input id="company-domain" value={form.allowedEmailDomain} onChange={(value) => update("allowedEmailDomain", value)} maxLength={254} placeholder="company.com" />
                </Field>
              </Section>
            )}

            {type === "RESIDENCE" && (
              <Section title="Society details">
                <Field id="society-address" label="Society address">
                  <Input id="society-address" value={form.societyAddress} onChange={(value) => update("societyAddress", value)} maxLength={500} />
                </Field>
                <Field id="treasurer-contact" label="Committee contact">
                  <Input id="treasurer-contact" value={form.treasurerContact} onChange={(value) => update("treasurerContact", value)} maxLength={200} />
                </Field>
              </Section>
            )}

            {CASH_TYPES.has(type) && (
              <Section title="Payout details" description="Required for monthly bank payouts. These fields are encrypted before storage and are only shown to authorized payout staff.">
                <div className={styles.twoColumns}>
                  <Field id="pan-number" label="PAN" required>
                    <Input id="pan-number" value={form.panNumber} onChange={(value) => update("panNumber", value.toUpperCase())} maxLength={10} autoComplete="off" placeholder="ABCDE1234F" required />
                  </Field>
                  <Field id="account-name" label="Bank account holder" required>
                    <Input id="account-name" value={form.bankAccountName} onChange={(value) => update("bankAccountName", value)} maxLength={160} autoComplete="off" required />
                  </Field>
                  <Field id="account-number" label="Bank account number" required>
                    <Input id="account-number" value={form.bankAccountNumber} onChange={(value) => update("bankAccountNumber", value.replace(/\D/g, ""))} maxLength={20} inputMode="numeric" autoComplete="off" required />
                  </Field>
                  <Field id="ifsc" label="IFSC" required>
                    <Input id="ifsc" value={form.bankIfsc} onChange={(value) => update("bankIfsc", value.toUpperCase())} maxLength={11} autoComplete="off" placeholder="HDFC0001234" required />
                  </Field>
                </div>
              </Section>
            )}

            <div className={styles.reviewNote}>FitFuel reviews each application before activating a code. We’ll email you when a decision is made.</div>
            {error && <div className={styles.error} role="alert">{error}</div>}
            <button className={styles.submitButton} disabled={busy} type="submit">
              {busy ? "Submitting…" : "Submit application"}
            </button>
          </form>
        )}

        {step === "done" && (
          <section className={styles.doneCard}>
            <span className={styles.doneMark} aria-hidden="true">✓</span>
            <h2>Thanks for applying</h2>
            <p>We’ll email you after the application has been reviewed. If approved, your code and conversion dashboard will become available in your account.</p>
            <Link className={styles.primaryLink} href="/dashboard">Return to dashboard</Link>
          </section>
        )}

        {step !== "done" && <p className={styles.dashboardLink}>Already approved? <Link href="/dashboard/partners">Open your partner dashboard</Link></p>}
      </div>
    </main>
  );
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <fieldset className={styles.section}>
      <legend>{title}</legend>
      {description && <p className={styles.sectionDescription}>{description}</p>}
      {children}
    </fieldset>
  );
}

function Field({ id, label, required, children }: { id: string; label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
      {children}
    </div>
  );
}

function Input({ id, value, onChange, ...props }: {
  id: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  maxLength?: number;
  required?: boolean;
  min?: string;
  max?: string;
  inputMode?: "numeric";
  autoComplete?: string;
}) {
  return <input id={id} value={value} onChange={(event) => onChange(event.target.value)} {...props} />;
}
