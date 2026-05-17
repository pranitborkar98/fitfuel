"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, User, CheckCircle, AlertCircle, Save } from "lucide-react";

const T = {
  bg: "#0a0a0a", card: "#111111", border: "#1f1f1f",
  accent: "#84cc16", text: "#f9fafb",
  textSecond: "#a3a3a3", textMuted: "#737373",
};

const DIET_OPTIONS = [
  { value: "VEGETARIAN",    label: "🥗 Vegetarian" },
  { value: "EGGETARIAN",    label: "🥚 Eggetarian" },
  { value: "NON_VEGETARIAN",label: "🍗 Non-Veg" },
];

const GOAL_OPTIONS = [
  { value: "LOSE_WEIGHT",      label: "🔥 Lose Weight" },
  { value: "GAIN_MUSCLE",      label: "💪 Gain Muscle" },
  { value: "MAINTAIN",         label: "⚖️ Maintain" },
  { value: "IMPROVE_FITNESS",  label: "🏃 Improve Fitness" },
  { value: "MANAGE_CONDITION", label: "🩺 Manage Condition" },
];

const GENDER_OPTIONS = [
  { value: "MALE",   label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER",  label: "Other" },
];

export default function ProfileClient({ user }: { user: any }) {
  const router = useRouter();

  const [name,          setName]          = useState(user?.name          ?? "");
  const [phone,         setPhone]         = useState(user?.phone         ?? "");
  const [dietPref,      setDietPref]      = useState(user?.profile?.dietPreference ?? "");
  const [fitnessGoal,   setFitnessGoal]   = useState(user?.profile?.fitnessGoal   ?? "");
  const [gender,        setGender]        = useState(user?.profile?.gender         ?? "");

  const [saving,  setSaving]  = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  async function handleSave() {
    setSaving(true);
    setSuccess(false);
    setError("");

    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, dietPreference: dietPref, fitnessGoal, gender }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? "Failed to save. Try again.");
      } else {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
        router.refresh();
      }
    } catch {
      setError("Network error. Check your connection.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 80, color: T.text }}>
      <div style={{ maxWidth: 640, margin: "0 auto", padding: "0 24px" }}>

        {/* Back + Header */}
        <div style={{ marginBottom: 32 }}>
          <Link
            href="/dashboard"
            style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, color: T.textMuted, textDecoration: "none", marginBottom: 20 }}
          >
            <ArrowLeft size={14} /> Back to Dashboard
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 48, height: 48, borderRadius: "50%", border: `2px solid ${T.border}`, overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
              {user?.image
                ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                : <User size={20} color={T.textMuted} />}
            </div>
            <div>
              <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, textTransform: "uppercase", lineHeight: 1 }}>
                Edit Profile
              </h1>
              <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Toast */}
        {success && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#0f1f05", border: `1px solid ${T.accent}`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: T.accent }}>
            <CheckCircle size={16} /> Profile saved successfully.
          </div>
        )}
        {error && (
          <div style={{ display: "flex", alignItems: "center", gap: 10, background: "#1f0505", border: "1px solid #ef4444", borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 14, color: "#ef4444" }}>
            <AlertCircle size={16} /> {error}
          </div>
        )}

        {/* Basic Info */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 28px", marginBottom: 16, position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: `linear-gradient(90deg, ${T.accent}, transparent)` }} />
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 20 }}>Basic Info</h2>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <Field label="Full Name">
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your name"
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e  => e.target.style.borderColor = T.border}
              />
            </Field>

            <Field label="Phone Number">
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="10-digit mobile number"
                maxLength={10}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = T.accent}
                onBlur={e  => e.target.style.borderColor = T.border}
              />
            </Field>

            <Field label="Email" hint="Managed by Google — cannot be changed here.">
              <input
                value={user?.email ?? ""}
                disabled
                style={{ ...inputStyle, opacity: 0.4, cursor: "not-allowed" }}
              />
            </Field>
          </div>
        </div>

        {/* Gender */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 28px", marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 20 }}>Gender</h2>
          <PillGroup options={GENDER_OPTIONS} selected={gender} onSelect={setGender} />
        </div>

        {/* Diet Preference */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 28px", marginBottom: 16 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 20 }}>Diet Preference</h2>
          <PillGroup options={DIET_OPTIONS} selected={dietPref} onSelect={setDietPref} />
        </div>

        {/* Fitness Goal */}
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 28px", marginBottom: 28 }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: T.textMuted, marginBottom: 20 }}>Fitness Goal</h2>
          <PillGroup options={GOAL_OPTIONS} selected={fitnessGoal} onSelect={setFitnessGoal} />
        </div>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            background: saving ? "#4a7a0a" : T.accent, color: "#000",
            fontWeight: 800, fontSize: 14, textTransform: "uppercase", letterSpacing: "0.07em",
            border: "none", borderRadius: 10, padding: "14px 24px", cursor: saving ? "not-allowed" : "pointer",
            transition: "all 0.2s",
          }}
        >
          <Save size={15} />
          {saving ? "Saving…" : "Save Profile"}
        </button>

      </div>
    </div>
  );
}

/* ── Helpers ── */

const inputStyle: React.CSSProperties = {
  width: "100%", background: "#0f0f0f", border: "1px solid #1f1f1f",
  borderRadius: 8, padding: "11px 14px", fontSize: 14, color: "#f9fafb",
  outline: "none", transition: "border-color 0.2s", boxSizing: "border-box",
};

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#737373", textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 }}>
        {label}
      </label>
      {children}
      {hint && <p style={{ fontSize: 11, color: "#4a4a4a", marginTop: 6 }}>{hint}</p>}
    </div>
  );
}

function PillGroup({ options, selected, onSelect }: { options: { value: string; label: string }[]; selected: string; onSelect: (v: string) => void }) {
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
      {options.map(opt => {
        const active = selected === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => onSelect(active ? "" : opt.value)}
            style={{
              padding: "9px 16px", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer",
              border: `1px solid ${active ? "#84cc16" : "#1f1f1f"}`,
              background: active ? "#0f1f05" : "#0f0f0f",
              color: active ? "#84cc16" : "#737373",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}