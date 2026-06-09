"use client";

// app/admin/staff/StaffClient.tsx
// Phase 15-STAFF — list staff + change roles, and search any user by email to
// grant them a staff role. Owner-only (page is gated).

import { useState } from "react";

const T = {
  card: "#101010",
  border: "#222",
  text: "#ffffff",
  muted: "#888888",
  accent: "#84cc16",
  soft: "#0c0c0c",
};

type StaffUser = {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
  role: string;
};

const ROLES = ["OWNER", "ADMIN", "DISPATCH", "KITCHEN", "CUSTOMER"];
const ROLE_NOTE: Record<string, string> = {
  OWNER: "Full access",
  ADMIN: "Full access",
  DISPATCH: "Dispatch + drivers only",
  KITCHEN: "Production SOP only",
  CUSTOMER: "No admin access",
};

export default function StaffClient({ initialStaff, meId }: { initialStaff: StaffUser[]; meId: string }) {
  const [staff, setStaff] = useState<StaffUser[]>(initialStaff);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<StaffUser[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);

  async function setRole(userId: string, role: string) {
    setBusy(userId);
    setErr(null);
    try {
      const res = await fetch("/api/admin/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed");
      const u: StaffUser = data.user;
      // update both lists
      setStaff((prev) => {
        const without = prev.filter((s) => s.id !== u.id);
        return u.role === "CUSTOMER" ? without : [...without, u].sort((a, b) => a.role.localeCompare(b.role));
      });
      setResults((prev) => (prev ? prev.map((r) => (r.id === u.id ? u : r)) : prev));
    } catch (e: any) {
      setErr(e?.message || "Failed");
    } finally {
      setBusy(null);
    }
  }

  async function search() {
    if (!q.trim()) return;
    setSearching(true);
    setErr(null);
    try {
      const res = await fetch(`/api/admin/staff?q=${encodeURIComponent(q.trim())}`);
      const data = await res.json();
      setResults(data.users ?? []);
    } catch {
      setErr("Search failed");
    } finally {
      setSearching(false);
    }
  }

  const Row = ({ u }: { u: StaffUser }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, padding: "12px 14px", borderTop: `1px solid ${T.border}`, flexWrap: "wrap" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
        <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a1a1a", border: `1px solid ${T.border}`, overflow: "hidden", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", color: T.muted, fontSize: 13 }}>
          {u.image ? <img src={u.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : (u.name ?? u.email ?? "?").slice(0, 1).toUpperCase()}
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{u.name ?? "—"}</div>
          <div style={{ fontSize: 12.5, color: T.muted, overflow: "hidden", textOverflow: "ellipsis" }}>{u.email}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ fontSize: 11, color: T.muted }}>{ROLE_NOTE[u.role]}</span>
        <select
          value={u.role}
          disabled={busy === u.id || u.id === meId}
          onChange={(e) => setRole(u.id, e.target.value)}
          title={u.id === meId ? "You can't change your own role" : ""}
          style={{ background: T.soft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "7px 10px", fontSize: 13, fontWeight: 600, cursor: u.id === meId ? "not-allowed" : "pointer" }}
        >
          {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div>
      <h1 style={{ fontSize: 28, fontWeight: 800, marginBottom: 4 }}>Staff &amp; roles</h1>
      <p style={{ color: T.muted, fontSize: 13.5, marginBottom: 22 }}>
        KITCHEN sees only the production SOP. DISPATCH sees only the dispatch board + drivers. OWNER/ADMIN see everything.
      </p>

      {err && <div style={{ color: "#f87171", fontSize: 13, marginBottom: 14 }}>{err}</div>}

      {/* Current staff */}
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, background: T.card, marginBottom: 26 }}>
        <div style={{ padding: "13px 14px", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: T.accent, fontWeight: 700 }}>
          Current staff ({staff.length})
        </div>
        {staff.length === 0 ? (
          <div style={{ padding: "14px", color: T.muted, fontSize: 13, borderTop: `1px solid ${T.border}` }}>No staff yet — search below to grant a role.</div>
        ) : (
          staff.map((u) => <Row key={u.id} u={u} />)
        )}
      </div>

      {/* Find & promote */}
      <div style={{ border: `1px solid ${T.border}`, borderRadius: 14, background: T.card }}>
        <div style={{ padding: "13px 14px", fontSize: 12, letterSpacing: 1, textTransform: "uppercase", color: T.accent, fontWeight: 700 }}>
          Add staff — find a signed-up user
        </div>
        <div style={{ padding: "0 14px 14px", borderTop: `1px solid ${T.border}` }}>
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && search()}
              placeholder="Search by email or name…"
              style={{ flex: 1, background: T.soft, color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "9px 11px", fontSize: 13 }}
            />
            <button onClick={search} disabled={searching || !q.trim()} style={{ background: T.accent, color: "#080808", border: "none", borderRadius: 8, padding: "9px 16px", fontSize: 13, fontWeight: 700, cursor: "pointer", opacity: searching || !q.trim() ? 0.6 : 1 }}>
              {searching ? "…" : "Search"}
            </button>
          </div>
          <p style={{ color: T.muted, fontSize: 12, marginTop: 8 }}>
            The person must sign in once (Google) so they exist here — then grant them KITCHEN or DISPATCH.
          </p>
        </div>
        {results && (
          <div style={{ borderTop: `1px solid ${T.border}` }}>
            {results.length === 0 ? (
              <div style={{ padding: "14px", color: T.muted, fontSize: 13 }}>No users match &ldquo;{q}&rdquo;.</div>
            ) : (
              results.map((u) => <Row key={u.id} u={u} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
