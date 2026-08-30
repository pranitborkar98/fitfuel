"use client";

// app/dashboard/notification-settings/NotificationSettingsClient.tsx
//
// The toggles and the save, and nothing else. The title and the standing
// promise moved to the server page.
//
// The old switch was 48x28. A 28px tall control is not a 44px touch target,
// and there is no exception for switches that look tidy at
// 28. The visual stays small; the hit area is padded out to 44.

import { useState } from "react";
import { C, body, label, num, solidBtn } from "@/app/_app/theme";

type Prefs = {
  weeklyDigest: boolean;
  morningPush: boolean;
  eveningRecap: boolean;
  nudges: boolean;
  marketing: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
};

type Row = { key: keyof Prefs; label: string; desc: string };

const SECTIONS: Array<{ title: string; rows: Row[] }> = [
  {
    title: "What you receive",
    rows: [
      { key: "weeklyDigest", label: "Weekly digest", desc: "Sunday recap with your consistency score and its breakdown." },
      { key: "morningPush", label: "Morning preview, 7 am", desc: "Today's meal lineup, and a nudge to log yesterday." },
      { key: "eveningRecap", label: "Evening recap, 9 pm", desc: "Tomorrow's plate, and a reminder to log today." },
      { key: "nudges", label: "Reminders", desc: "Payment pending, plan ending soon, a check in if you go quiet." },
      { key: "marketing", label: "Promotions", desc: "Offers, new plans, seasonal menus. These are rare." },
    ],
  },
  {
    title: "How you receive it",
    rows: [
      { key: "emailEnabled", label: "Email", desc: "Your primary channel." },
      { key: "whatsappEnabled", label: "WhatsApp", desc: "Delivery, meal and account updates when a template supports WhatsApp." },
    ],
  },
];

/** 44x44 hit area around a 44x26 switch. */
function Switch({ on, onToggle, name }: { on: boolean; onToggle: () => void; name: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={name}
      onClick={onToggle}
      style={{
        flex: "none", width: 52, height: 44, padding: 0, background: "transparent",
        border: 0, cursor: "pointer", display: "flex", alignItems: "center",
        justifyContent: "flex-end",
      }}
    >
      <span
        style={{
          width: 44, height: 26, padding: 3, display: "flex", alignItems: "center",
          justifyContent: on ? "flex-end" : "flex-start",
          background: on ? C.lime : "transparent",
          border: `1px solid ${on ? C.lime : C.rule2}`,
          transition: "background-color 180ms ease-out, border-color 180ms ease-out",
        }}
      >
        <span style={{ width: 18, height: 18, background: on ? C.onLime : C.dim }} />
      </span>
    </button>
  );
}

export default function NotificationSettingsClient({ initialPrefs }: { initialPrefs: Prefs }) {
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs);
  const [baseline, setBaseline] = useState<Prefs>(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const dirty = (Object.keys(prefs) as Array<keyof Prefs>).some((key) => prefs[key] !== baseline[key]);

  function toggle(key: keyof Prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
    setSaved(false);
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const r = await fetch("/api/user/notification-preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(prefs),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) setError(j.error || "That did not save. Your settings are unchanged.");
      else {
        setBaseline(prefs);
        setSaved(true);
      }
    } catch {
      setError("That did not save. Check your connection and try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {SECTIONS.map((sec) => (
        <section key={sec.title} style={{ marginTop: 26 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 16 }}>
            <span style={label(12)}>{sec.title}</span>
            <span style={{ flex: 1, height: 1, background: C.rule }} />
          </div>

          <div style={{ borderTop: `1px solid ${C.rule}` }}>
            {sec.rows.map((row) => (
              <div
                key={row.key}
                style={{
                  display: "flex", alignItems: "center", gap: 16, padding: "10px 0",
                  borderBottom: `1px solid ${C.rule}`,
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={body(14, { color: C.ink, margin: 0 })}>{row.label}</p>
                  <p style={body(13, { margin: "3px 0 0", maxWidth: "56ch" })}>{row.desc}</p>
                </div>
                <Switch on={prefs[row.key]} onToggle={() => toggle(row.key)} name={row.label} />
              </div>
            ))}
          </div>
        </section>
      ))}

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
          {saving ? "Saving" : "Save preferences"}
        </button>

        <span role="status" aria-live="polite" style={num(12, { color: error ? C.danger : C.lime })}>
          {error ? error : saved ? "Saved" : ""}
        </span>
      </div>
    </>
  );
}
