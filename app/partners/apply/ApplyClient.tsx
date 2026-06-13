"use client";

// app/partners/apply/ApplyClient.tsx
// Phase 17C-1 — Self-onboarding form for non-CUSTOMER partner types.
// Trainer / Influencer / Dietician / Doctor → cash payout (PAN + bank required).
// Gym / Corporate / Residence → no tax/bank info required (DISCOUNT_ONLY or vouchers).

import { useState } from "react";
import Link from "next/link";

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#1f1f1f",
  text: "#f5f5f4",
  dim: "#888",
  accent: "#a3e635",
  accent2: "#84cc16",
  ok: "#22c55e",
  warn: "#f59e0b",
  err: "#ef4444",
};
const RUPEE = "\u20B9";

type PartnerType = "GYM" | "TRAINER" | "INFLUENCER" | "DIETICIAN" | "DOCTOR" | "CORPORATE" | "RESIDENCE";

const TYPE_LABEL: Record<PartnerType, string> = {
  GYM: "Gym / Fitness Studio",
  TRAINER: "Personal Trainer",
  INFLUENCER: "Creator / Influencer",
  DIETICIAN: "Dietician / Nutritionist",
  DOCTOR: "Doctor",
  CORPORATE: "Corporate / Company",
  RESIDENCE: "Residential Society",
};

const CASH_TYPES: PartnerType[] = ["TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR"];

const TYPE_BLURB: Record<PartnerType, string> = {
  GYM: "Get meal vouchers for your trainers. Members get exclusive discounts.",
  TRAINER: "Earn cash per signup. Your followers get a welcome discount.",
  INFLUENCER: "Cash per conversion. Your audience gets a special offer.",
  DIETICIAN: "Refer your clients to FitFuel and earn cash per signup.",
  DOCTOR: "Recommend FitFuel meal plans clinically aligned to your patients' needs.",
  CORPORATE: "Provide FitFuel as an employee wellness benefit.",
  RESIDENCE: "Bring fresh meals to your apartment community.",
};

export default function ApplyClient({ prefill }: { prefill: { name: string; email: string; phone: string } }) {
  const [type, setType] = useState<PartnerType | null>(null);
  const [step, setStep] = useState<"select" | "form" | "done">("select");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState<any>({
    name: prefill.name,
    contactEmail: prefill.email,
    contactPhone: prefill.phone,
    // type-specific
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
    // tax / payout (cash types only)
    panNumber: "",
    bankAccountName: "",
    bankAccountNumber: "",
    bankIfsc: "",
  });

  function up(k: string, v: any) { setForm((f: any) => ({ ...f, [k]: v })); }

  function pickType(t: PartnerType) {
    setType(t);
    // Auto-suggest the partner display name from the user's name unless they already typed something
    if (!form.name && prefill.name) up("name", prefill.name);
    setStep("form");
  }

  async function submit() {
    if (!type) return;
    setError(null);
    setBusy(true);
    try {
      const res = await fetch("/api/partners/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, form }),
      });
      const j = await res.json();
      if (!res.ok) {
        setError(j?.error || "Could not submit application.");
      } else {
        setStep("done");
      }
    } catch (e: any) {
      setError(e?.message || "Network error.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ background: T.bg, minHeight: "calc(100vh - 80px)", color: T.text, padding: "72px 16px 80px" }}>
      <div style={{ maxWidth: 720, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ marginBottom: 28 }}>
          <div style={{ fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700 }}>Partner with FitFuel</div>
          <h1 style={{ fontFamily: '"Syne", system-ui', fontSize: 34, fontWeight: 800, margin: "8px 0 0", lineHeight: 1.1 }}>
            {step === "select" && "Apply to become a partner"}
            {step === "form" && `${TYPE_LABEL[type as PartnerType]}`}
            {step === "done" && "Application received"}
          </h1>
          {step === "select" && <div style={{ color: T.dim, fontSize: 14, marginTop: 8 }}>Earn from every customer you bring in. Your audience gets an exclusive welcome discount.</div>}
        </div>

        {step === "select" && <SelectType onPick={pickType} />}
        {step === "form" && type && (
          <FormSection
            type={type}
            form={form}
            up={up}
            onBack={() => setStep("select")}
            onSubmit={submit}
            busy={busy}
            error={error}
          />
        )}
        {step === "done" && <DonePane />}

        {step !== "done" && (
          <div style={{ marginTop: 24, fontSize: 12, color: T.dim, textAlign: "center" }}>
            Already a partner? <Link href="/dashboard/partners" style={{ color: T.accent }}>Go to your dashboard →</Link>
          </div>
        )}
      </div>
    </div>
  );
}

function SelectType({ onPick }: { onPick: (t: PartnerType) => void }) {
  const types: PartnerType[] = ["GYM", "TRAINER", "INFLUENCER", "DIETICIAN", "DOCTOR", "CORPORATE", "RESIDENCE"];
  return (
    <div style={{ display: "grid", gap: 10 }}>
      {types.map((t) => (
        <button key={t} onClick={() => onPick(t)} style={{
          textAlign: "left",
          background: T.card, border: `1px solid ${T.border}`, borderRadius: 12,
          padding: 18, cursor: "pointer", color: T.text,
          transition: "border-color 0.15s",
        }}
          onMouseEnter={(e) => (e.currentTarget.style.borderColor = T.accent2)}
          onMouseLeave={(e) => (e.currentTarget.style.borderColor = T.border)}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 12 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>{TYPE_LABEL[t]}</div>
            <div style={{ color: T.accent, fontSize: 12, fontWeight: 700 }}>{CASH_TYPES.includes(t) ? "Cash payout" : t === "GYM" ? "Meal vouchers" : "Custom"}</div>
          </div>
          <div style={{ color: T.dim, fontSize: 13, marginTop: 6 }}>{TYPE_BLURB[t]}</div>
        </button>
      ))}
    </div>
  );
}

function FormSection({
  type, form, up, onBack, onSubmit, busy, error,
}: {
  type: PartnerType; form: any; up: (k: string, v: any) => void;
  onBack: () => void; onSubmit: () => void; busy: boolean; error: string | null;
}) {
  const isCash = CASH_TYPES.includes(type);

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: 24 }}>

      <button onClick={onBack} style={{ background: "transparent", color: T.dim, border: "none", fontSize: 12, cursor: "pointer", marginBottom: 16, padding: 0 }}>
        {'\u2190'} Change type
      </button>

      <SectionTitle>Basics</SectionTitle>
      <Field label={type === "CORPORATE" ? "Company name" : type === "RESIDENCE" ? "Society name" : "Display name"}>
        <Input value={form.name} onChange={(v) => up("name", v)} placeholder="Public-facing name on your landing page" />
      </Field>
      <Row>
        <Field label="Email"><Input value={form.contactEmail} onChange={(v) => up("contactEmail", v)} type="email" /></Field>
        <Field label="Phone"><Input value={form.contactPhone} onChange={(v) => up("contactPhone", v)} /></Field>
      </Row>

      {/* GYM */}
      {type === "GYM" && (<>
        <SectionTitle>Gym details</SectionTitle>
        <Field label="Address"><Input value={form.gymAddress} onChange={(v) => up("gymAddress", v)} placeholder="Locality, Pune" /></Field>
        <Field label="Manager / contact name"><Input value={form.gymManagerName} onChange={(v) => up("gymManagerName", v)} /></Field>
      </>)}

      {/* TRAINER / INFLUENCER */}
      {(type === "TRAINER" || type === "INFLUENCER") && (<>
        <SectionTitle>About you</SectionTitle>
        <Field label="Specialty"><Input value={form.specialty} onChange={(v) => up("specialty", v)} placeholder={type === "TRAINER" ? "Strength training, fat loss, etc." : "Fitness, nutrition, lifestyle"} /></Field>
        <Field label="Short bio"><Textarea value={form.bio} onChange={(v) => up("bio", v)} placeholder="2-3 lines for your landing page" /></Field>
        <Row>
          <Field label="Instagram / social handle"><Input value={form.socialHandle} onChange={(v) => up("socialHandle", v)} placeholder="@yourhandle" /></Field>
          <Field label="Follower count (approx)"><Input value={form.followerCount} onChange={(v) => up("followerCount", v)} type="number" /></Field>
        </Row>
      </>)}

      {/* DIETICIAN / DOCTOR */}
      {(type === "DIETICIAN" || type === "DOCTOR") && (<>
        <SectionTitle>Credentials</SectionTitle>
        <Field label="Qualification"><Input value={form.qualification} onChange={(v) => up("qualification", v)} placeholder={type === "DOCTOR" ? "MBBS, MD" : "RD, MSc Nutrition"} /></Field>
        <Field label="Registration number"><Input value={form.registrationNumber} onChange={(v) => up("registrationNumber", v)} placeholder="State medical council / IDA number" /></Field>
        <Row>
          <Field label={type === "DOCTOR" ? "Hospital / Clinic" : "Practice / Clinic"}><Input value={form.clinicName} onChange={(v) => up("clinicName", v)} /></Field>
          {type === "DOCTOR" && <Field label="Hospital affiliation"><Input value={form.hospitalAffiliation} onChange={(v) => up("hospitalAffiliation", v)} /></Field>}
        </Row>
      </>)}

      {/* CORPORATE */}
      {type === "CORPORATE" && (<>
        <SectionTitle>Company details</SectionTitle>
        <Field label="HR / wellness contact"><Input value={form.hrContactName} onChange={(v) => up("hrContactName", v)} /></Field>
        <Field label="Allowed email domain"><Input value={form.allowedEmailDomain} onChange={(v) => up("allowedEmailDomain", v)} placeholder="@yourcompany.com" /></Field>
      </>)}

      {/* RESIDENCE */}
      {type === "RESIDENCE" && (<>
        <SectionTitle>Society details</SectionTitle>
        <Field label="Society address"><Input value={form.societyAddress} onChange={(v) => up("societyAddress", v)} /></Field>
        <Field label="Treasurer / committee contact"><Input value={form.treasurerContact} onChange={(v) => up("treasurerContact", v)} placeholder="Name + phone" /></Field>
      </>)}

      {/* Tax / payout — cash types only */}
      {isCash && (<>
        <SectionTitle>Payout details</SectionTitle>
        <div style={{ color: T.dim, fontSize: 12, marginTop: -8, marginBottom: 12 }}>
          Required for cash payouts. We pay via UPI bank transfer every month.
        </div>
        <Field label="PAN number" required>
          <Input value={form.panNumber} onChange={(v) => up("panNumber", v.toUpperCase())} placeholder="ABCDE1234F" maxLength={10} />
        </Field>
        <Field label="Bank account holder name" required>
          <Input value={form.bankAccountName} onChange={(v) => up("bankAccountName", v)} />
        </Field>
        <Row>
          <Field label="Bank account number" required>
            <Input value={form.bankAccountNumber} onChange={(v) => up("bankAccountNumber", v.replace(/[^0-9]/g, ""))} />
          </Field>
          <Field label="IFSC code" required>
            <Input value={form.bankIfsc} onChange={(v) => up("bankIfsc", v.toUpperCase())} maxLength={11} placeholder="HDFC0001234" />
          </Field>
        </Row>
      </>)}

      {/* Notice */}
      <div style={{ background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 10, padding: 14, marginTop: 18, fontSize: 12, color: T.dim, lineHeight: 1.6 }}>
        Your application will be reviewed by FitFuel within 2{'\u20133'} business days. You{'\u2019'}ll receive an email once approved, then you can start sharing your code.
      </div>

      {error && (
        <div style={{ background: "#1a0a0a", border: `1px solid ${T.err}`, borderRadius: 10, padding: 12, marginTop: 12, color: T.err, fontSize: 13 }}>
          {error}
        </div>
      )}

      <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
        <button onClick={onSubmit} disabled={busy || !form.name || !form.contactEmail} style={{
          background: T.accent, color: "#000", fontWeight: 800, fontSize: 14,
          padding: "14px 28px", borderRadius: 8, border: "none",
          cursor: busy ? "not-allowed" : "pointer", opacity: busy ? 0.6 : 1,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>{busy ? "Submitting\u2026" : "Submit application"}</button>
      </div>
    </div>
  );
}

function DonePane() {
  return (
    <div style={{ background: T.card, border: `1px solid ${T.accent}`, borderRadius: 16, padding: 32, textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u2713'}</div>
      <h2 style={{ fontFamily: '"Syne", system-ui', fontSize: 24, fontWeight: 800, margin: 0 }}>Thanks for applying</h2>
      <div style={{ color: T.dim, fontSize: 14, marginTop: 10, lineHeight: 1.6 }}>
        We{'\u2019'}ll review your application and email you within 2{'\u20133'} business days. Once approved, your partner dashboard becomes active and you can start sharing your code.
      </div>
      <div style={{ marginTop: 22 }}>
        <Link href="/dashboard" style={{ color: T.accent, fontSize: 13, fontWeight: 700, textDecoration: "none", textTransform: "uppercase", letterSpacing: "0.06em" }}>
          {'\u2190'} Back to dashboard
        </Link>
      </div>
    </div>
  );
}

/* ── form primitives ── */
function SectionTitle({ children }: { children: any }) {
  return <div style={{ fontSize: 11, color: T.accent, textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 700, marginTop: 20, marginBottom: 10 }}>{children}</div>;
}
function Field({ label, required, children }: { label: string; required?: boolean; children: any }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <label style={{ display: "block", fontSize: 11, color: T.dim, textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600, marginBottom: 6 }}>
        {label}{required && <span style={{ color: T.err, marginLeft: 4 }}>*</span>}
      </label>
      {children}
    </div>
  );
}
function Row({ children }: { children: any }) {
  return <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>{children}</div>;
}
function Input({ value, onChange, type = "text", placeholder, maxLength }: any) {
  return (
    <input
      type={type} value={value || ""} onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder} maxLength={maxLength}
      style={{
        width: "100%", background: "#000", color: T.text,
        border: `1px solid ${T.border}`, borderRadius: 8,
        padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
        outline: "none",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = T.accent2)}
      onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
    />
  );
}
function Textarea({ value, onChange, placeholder }: any) {
  return (
    <textarea
      value={value || ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder}
      rows={3}
      style={{
        width: "100%", background: "#000", color: T.text,
        border: `1px solid ${T.border}`, borderRadius: 8,
        padding: "10px 12px", fontSize: 14, fontFamily: "inherit",
        outline: "none", resize: "vertical",
      }}
      onFocus={(e) => (e.currentTarget.style.borderColor = T.accent2)}
      onBlur={(e) => (e.currentTarget.style.borderColor = T.border)}
    />
  );
}
