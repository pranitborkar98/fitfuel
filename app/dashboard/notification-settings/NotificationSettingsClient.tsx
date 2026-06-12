// app/dashboard/notification-settings/NotificationSettingsClient.tsx
"use client";
import { useState } from "react";
import Link from "next/link";

type Prefs = {
  weeklyDigest: boolean;
  morningPush: boolean;
  eveningRecap: boolean;
  nudges: boolean;
  marketing: boolean;
  emailEnabled: boolean;
  whatsappEnabled: boolean;
};

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#1f1f1f",
  text: "#eaeaea",
  textMuted: "#888",
  accent: "#84cc16",
};

const SECTIONS: Array<{
  title: string;
  rows: Array<{
    key: keyof Prefs;
    label: string;
    desc: string;
  }>;
}> = [
  {
    title: "What you receive",
    rows: [
      { key: "weeklyDigest", label: "Weekly digest", desc: "Sunday recap with your consistency score and breakdown." },
      { key: "morningPush", label: "Morning preview (7 AM)", desc: "Today's meal lineup + a quick nudge to log yesterday." },
      { key: "eveningRecap", label: "Evening recap (9 PM)", desc: "Tomorrow's plate + log-today reminder." },
      { key: "nudges", label: "Reminders", desc: "Payment pending, plan ending soon, occasional check-in if you go quiet." },
      { key: "marketing", label: "Promotions", desc: "Offers, new plan launches, seasonal menus. We rarely send these." },
    ],
  },
  {
    title: "How you receive it",
    rows: [
      { key: "emailEnabled", label: "Email", desc: "Currently your primary channel." },
      { key: "whatsappEnabled", label: "WhatsApp", desc: "Coming soon \u2014 enable now to opt-in early." },
    ],
  },
];

export default function NotificationSettingsClient({
  initialPrefs,
}: {
  initialPrefs: Prefs;
}) {
  const [prefs, setPrefs] = useState<Prefs>(initialPrefs);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  function toggle(key: keyof Prefs) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
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
      const j = await r.json();
      if (!r.ok || !j.ok) {
        setError(j.error || "Save failed");
      } else {
        setSavedAt(new Date());
      }
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, padding: "32px 16px" }}>
      <div style={{ maxWidth: 640, margin: "0 auto" }}>
        <div style={{ marginBottom: 8 }}>
          <Link href="/dashboard" style={{ color: T.textMuted, fontSize: 13, textDecoration: "none" }}>
            \u2190 Back to dashboard
          </Link>
        </div>

        <h1
          style={{
            fontFamily: "'Syne', system-ui, sans-serif",
            fontSize: 32,
            fontWeight: 800,
            letterSpacing: -1,
            margin: "12px 0 6px",
            color: "#fff",
          }}
        >
          Notification settings
        </h1>
        <p style={{ color: T.textMuted, margin: "0 0 28px", fontSize: 14 }}>
          Choose what we send you and how. Order confirmations and delivery updates always send.
        </p>

        {SECTIONS.map((sec) => (
          <div
            key={sec.title}
            style={{
              background: T.card,
              border: `1px solid ${T.border}`,
              borderRadius: 8,
              padding: "8px 0",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: T.accent,
                letterSpacing: 1,
                textTransform: "uppercase",
                padding: "14px 20px 8px",
              }}
            >
              {sec.title}
            </div>
            {sec.rows.map((row, i) => (
              <ToggleRow
                key={row.key}
                label={row.label}
                desc={row.desc}
                on={prefs[row.key]}
                onToggle={() => toggle(row.key)}
                isLast={i === sec.rows.length - 1}
              />
            ))}
          </div>
        ))}

        <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 8 }}>
          <button
            onClick={save}
            disabled={saving}
            style={{
              background: T.accent,
              color: "#000",
              border: "none",
              padding: "12px 28px",
              borderRadius: 6,
              fontWeight: 700,
              cursor: saving ? "default" : "pointer",
              fontSize: 14,
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving\u2026" : "Save preferences"}
          </button>
          {savedAt && (
            <span style={{ color: T.accent, fontSize: 13 }}>
              \u2713 Saved {savedAt.toLocaleTimeString()}
            </span>
          )}
          {error && <span style={{ color: "#ef4444", fontSize: 13 }}>{error}</span>}
        </div>
      </div>
    </div>
  );
}

function ToggleRow({
  label,
  desc,
  on,
  onToggle,
  isLast,
}: {
  label: string;
  desc: string;
  on: boolean;
  onToggle: () => void;
  isLast: boolean;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 16,
        padding: "16px 20px",
        borderTop: `1px solid ${T.border}`,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 13, color: T.textMuted, lineHeight: 1.5 }}>{desc}</div>
      </div>
      <button
        onClick={onToggle}
        aria-pressed={on}
        style={{
          width: 48,
          height: 28,
          minWidth: 48,
          borderRadius: 14,
          background: on ? T.accent : "#2a2a2a",
          border: "none",
          position: "relative",
          cursor: "pointer",
          transition: "background 0.15s",
          padding: 0,
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 2,
            left: on ? 22 : 2,
            width: 24,
            height: 24,
            borderRadius: "50%",
            background: on ? "#000" : "#fff",
            transition: "left 0.15s",
          }}
        />
      </button>
    </div>
  );
}
