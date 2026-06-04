"use client";

// app/admin/drivers/DriversClient.tsx
// Phase 10 â€” driver roster. THIS is the screen that fixes "only 1 link works":
// create a driver here and the system mints their unique /driver/<token> link.

import { useState } from "react";

const T = {
  bg: "#080808", card: "#101010", border: "#222", text: "#ffffff",
  textSecond: "#bbbbbb", textMuted: "#888888", accent: "#84cc16", red: "#ef4444",
};

type Driver = {
  id: string;
  name: string;
  phone: string;
  accessToken: string;
  isActive: boolean;
  _count: { deliveries: number };
};

export default function DriversClient({ initialDrivers }: { initialDrivers: Driver[] }) {
  const [drivers, setDrivers] = useState<Driver[]>(initialDrivers);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const linkFor = (token: string) => `${origin}/driver/${token}`;

  async function createDriver() {
    if (!name.trim() || !phone.trim()) return;
    setCreating(true);
    try {
      const res = await fetch("/api/admin/drivers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), phone: phone.trim() }),
      });
      if (res.ok) {
        const { driver } = await res.json();
        setDrivers(prev => [{ ...driver, _count: { deliveries: 0 } }, ...prev]);
        setName("");
        setPhone("");
      } else {
        const e = await res.json().catch(() => ({}));
        alert(e.error ?? "Couldn't create driver.");
      }
    } finally {
      setCreating(false);
    }
  }

  async function toggleActive(id: string, isActive: boolean) {
    const res = await fetch(`/api/admin/drivers/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    if (res.ok) {
      setDrivers(prev => prev.map(d => (d.id === id ? { ...d, isActive: !isActive } : d)));
    }
  }

  async function copyLink(d: Driver) {
    try {
      await navigator.clipboard.writeText(linkFor(d.accessToken));
      setCopiedId(d.id);
      setTimeout(() => setCopiedId(c => (c === d.id ? null : c)), 1500);
    } catch {
      alert(linkFor(d.accessToken));
    }
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 800, marginBottom: 4 }}>Drivers</h1>
      <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 18 }}>
        Each driver gets a private link. Share it on WhatsApp â€” they open it on their phone, no login.
      </p>

      {/* â”€â”€ Create driver â”€â”€ */}
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, marginBottom: 22, display: "flex", gap: 10, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Driver name"
          style={{ flex: "1 1 180px", background: "#0a0a0a", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px", fontSize: 14, boxSizing: "border-box" }}
        />
        <input
          value={phone}
          onChange={e => setPhone(e.target.value)}
          placeholder="Phone"
          inputMode="tel"
          style={{ flex: "1 1 140px", background: "#0a0a0a", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "12px", fontSize: 14, boxSizing: "border-box" }}
        />
        <button
          onClick={createDriver}
          disabled={creating || !name.trim() || !phone.trim()}
          style={{ background: T.accent, color: "#0a0a0a", border: "none", borderRadius: 8, padding: "12px 20px", fontSize: 14, fontWeight: 800, cursor: "pointer", opacity: creating || !name.trim() || !phone.trim() ? 0.5 : 1 }}
        >
          {creating ? "â€¦" : "Add driver"}
        </button>
      </div>

      {/* â”€â”€ Roster â”€â”€ */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {drivers.map(d => (
          <div key={d.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, opacity: d.isActive ? 1 : 0.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{d.name}</p>
                <p style={{ fontSize: 13, color: T.textMuted }}>
                  {d.phone} Â· {d._count.deliveries} stop{d._count.deliveries === 1 ? "" : "s"} today
                </p>
              </div>
              <span style={{ fontSize: 12, fontWeight: 700, color: d.isActive ? T.accent : T.textMuted }}>
                {d.isActive ? "Active" : "Inactive"}
              </span>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12, flexWrap: "wrap" }}>
              <button
                onClick={() => copyLink(d)}
                style={{ background: "transparent", color: T.accent, border: `1px solid #2a3d10`, borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
              >
                {copiedId === d.id ? "Copied âœ“" : "Copy link"}
              </button>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`Your FitFuel delivery link: ${linkFor(d.accessToken)}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ background: "transparent", color: T.textSecond, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              >
                Send on WhatsApp
              </a>
              <button
                onClick={() => toggleActive(d.id, d.isActive)}
                style={{ background: "transparent", color: d.isActive ? T.red : T.accent, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 14px", fontSize: 13, fontWeight: 600, cursor: "pointer", marginLeft: "auto" }}
              >
                {d.isActive ? "Deactivate" : "Reactivate"}
              </button>
            </div>
          </div>
        ))}
        {drivers.length === 0 && (
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, textAlign: "center", color: T.textMuted }}>
            No drivers yet. Add your first one above.
          </div>
        )}
      </div>
    </div>
  );
}