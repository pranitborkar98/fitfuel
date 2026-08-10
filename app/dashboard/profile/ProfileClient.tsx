"use client";

// app/dashboard/profile/ProfileClient.tsx
//
// This screen carried the most reject list items of the twelve: emoji standing
// in for icons on every diet and goal option, a lime gradient bar across the
// top of a card with no job other than decoration, and thirteen colours, none
// of them from the ramp.
//
// The options are now words. A goal is a word, and the emoji were doing the
// opposite of clarifying: a stethoscope for "manage condition" and a scale for
// "maintain" are guesses the reader has to decode.

import { useState } from "react";
import { useRouter } from "next/navigation";
import { C, SANS, body, label, num, solidBtn } from "@/app/_app/theme";

type Values = {
  name: string;
  phone: string;
  dietPreference: string;
  fitnessGoal: string;
  gender: string;
};

const GENDER = [
  { value: "MALE", label: "Male" },
  { value: "FEMALE", label: "Female" },
  { value: "OTHER", label: "Other" },
];

const DIET = [
  { value: "VEGETARIAN", label: "Vegetarian" },
  { value: "EGGETARIAN", label: "Eggetarian" },
  { value: "NON_VEGETARIAN", label: "Non vegetarian" },
];

const GOAL = [
  { value: "LOSE_WEIGHT", label: "Lose weight" },
  { value: "GAIN_MUSCLE", label: "Gain muscle" },
  { value: "MAINTAIN", label: "Maintain" },
  { value: "IMPROVE_FITNESS", label: "Improve fitness" },
  { value: "MANAGE_CONDITION", label: "Manage a condition" },
];

const INPUT: React.CSSProperties = {
  width: "100%", minHeight: 44, padding: "0 14px", boxSizing: "border-box",
  background: C.bg, border: `1px solid ${C.rule2}`, color: C.ink,
  fontFamily: SANS, fontSize: 14, outline: "none",
};

function Spine({ children }: { children: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "26px 0 16px" }}>
      <span style={label(12)}>{children}</span>
      <span style={{ flex: 1, height: 1, background: C.rule }} />
    </div>
  );
}

function Field({ name, hint, children }: { name: string; hint?: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <span style={label(12, { display: "block", marginBottom: 8 })}>{name}</span>
      {children}
      {hint ? <p style={body(13, { margin: "6px 0 0" })}>{hint}</p> : null}
    </div>
  );
}

/** Square options, never rounded. Selection is a lime hairline and lime text,
 *  and the label is always a word, so the state is never colour alone (§8). */
function Options({
  options, selected, onSelect, name,
}: {
  options: { value: string; label: string }[];
  selected: string;
  onSelect: (v: string) => void;
  name: string;
}) {
  return (
    <div role="group" aria-label={name} style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {options.map((o) => {
        const on = selected === o.value;
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={on}
            onClick={() => onSelect(on ? "" : o.value)}
            style={{
              minHeight: 44, padding: "0 16px", cursor: "pointer",
              background: on ? C.wash : "transparent",
              border: `1px solid ${on ? C.lime : C.rule2}`,
              color: on ? C.lime : C.mute,
              fontFamily: SANS, fontSize: 14, fontWeight: on ? 500 : 400,
              transition: "border-color 180ms ease-out, color 180ms ease-out",
            }}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

export default function ProfileClient({ initial, email }: { initial: Values; email: string }) {
  const router = useRouter();
  const [v, setV] = useState<Values>(initial);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const dirty = (Object.keys(v) as Array<keyof Values>).some((k) => v[k] !== initial[k]);

  function set<K extends keyof Values>(key: K, value: Values[K]) {
    setV((p) => ({ ...p, [key]: value }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(v),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error ?? "That did not save. Your details are unchanged.");
      } else {
        setSaved(true);
        router.refresh();
      }
    } catch {
      setError("That did not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <Spine>Basic details</Spine>
      <div style={{ maxWidth: 520 }}>
        <Field name="Full name">
          <input
            value={v.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Your name"
            style={INPUT}
          />
        </Field>
        <Field name="Phone" hint="Ten digits, the number the driver calls.">
          <input
            value={v.phone}
            onChange={(e) => set("phone", e.target.value.replace(/\D/g, ""))}
            placeholder="10 digit mobile number"
            inputMode="numeric"
            maxLength={10}
            style={INPUT}
          />
        </Field>
        <Field name="Email" hint="Comes from your Google account and cannot be changed here.">
          <input value={email} disabled style={{ ...INPUT, color: C.dim, cursor: "not-allowed" }} />
        </Field>
      </div>

      <Spine>Gender</Spine>
      <Options options={GENDER} selected={v.gender} onSelect={(x) => set("gender", x)} name="Gender" />

      <Spine>Diet</Spine>
      <Options options={DIET} selected={v.dietPreference} onSelect={(x) => set("dietPreference", x)} name="Diet preference" />

      <Spine>Goal</Spine>
      <Options options={GOAL} selected={v.fitnessGoal} onSelect={(x) => set("fitnessGoal", x)} name="Fitness goal" />

      <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap", marginTop: 26 }}>
        <button
          type="button"
          onClick={save}
          disabled={saving || !dirty}
          style={solidBtn({
            opacity: saving || !dirty ? 0.55 : 1,
            cursor: saving || !dirty ? "default" : "pointer",
          })}
        >
          {saving ? "Saving" : "Save profile"}
        </button>
        <span role="status" aria-live="polite" style={num(12, { color: error ? C.danger : C.lime })}>
          {error ? error : saved ? "Saved" : ""}
        </span>
      </div>
    </>
  );
}
