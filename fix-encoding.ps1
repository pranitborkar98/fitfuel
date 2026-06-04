# Fix gibberish (encoding) in the 3 rendering files. Pure ASCII = safe.
$RepoRoot = "C:\Users\VCOM\fitfuel"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

$c = @'
// app/admin/layout.tsx
// Phase 10 -- command center shell. Every /admin/* page is gated here.

import { getAdminUser } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#222",
  text: "#ffffff",
  textMuted: "#888888",
  accent: "#84cc16",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/"); // not logged in, or not ADMIN/OWNER

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui, sans-serif" }}>
      <header
        style={{
          borderBottom: `1px solid ${T.border}`,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: T.bg,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.accent, letterSpacing: 1, textTransform: "uppercase" }}>
            FitFuel &middot; Ops
          </span>
          <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
            <Link href="/admin" style={{ color: T.text, textDecoration: "none", fontWeight: 600 }}>Dispatch</Link>
            <Link href="/admin/drivers" style={{ color: T.textMuted, textDecoration: "none", fontWeight: 600 }}>Drivers</Link>
          </nav>
        </div>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          {admin.name ?? admin.email} &middot; {admin.role}
        </span>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px 80px" }}>{children}</main>
    </div>
  );
}
'@
[System.IO.File]::WriteAllText((Join-Path $RepoRoot "app/admin/layout.tsx"), $c, $Utf8NoBom)
Write-Host "  fixed app/admin/layout.tsx" -ForegroundColor Green

$c = @'
"use client";

// app/admin/DispatchClient.tsx
// Phase 10 -- the daily dispatch board (the manager's command center).
// Flow: today's deliveries -> assign each to a driver -> dispatch (OUT_FOR_DELIVERY)
// -> watch status flip back live as drivers mark Delivered / Couldn't deliver.

import { useMemo, useState } from "react";

const T = {
  bg: "#080808", card: "#101010", border: "#222", text: "#ffffff",
  textSecond: "#bbbbbb", textMuted: "#888888", accent: "#84cc16",
  red: "#ef4444", amber: "#f59e0b",
};

type Status = "PREPARING" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED_DELIVERY";

type Delivery = {
  id: string;
  status: Status;
  mealsIncluded: string[];
  deliveredAt: string | Date | null;
  assignedDriverId: string | null;
  trackingNotes: string | null;
  customerConfirmedAt: string | Date | null;
  order: {
    orderNumber: string;
    totalRs: number;
    paymentMethod: "PAYU" | "CASH_ON_DELIVERY";
    user: { name: string | null; phone: string | null };
    address: {
      line1: string; line2: string | null; area: string;
      city: string; pincode: string; landmark: string | null;
    } | null;
  };
};

type Driver = { id: string; name: string; phone: string };

const STATUS_STYLE: Record<Status, { label: string; color: string }> = {
  PREPARING: { label: "Preparing", color: T.textMuted },
  PACKED: { label: "Packed", color: T.textSecond },
  OUT_FOR_DELIVERY: { label: "Out for delivery", color: T.amber },
  DELIVERED: { label: "Delivered \u2713", color: T.accent },
  FAILED_DELIVERY: { label: "Not delivered", color: T.red },
};

const isTerminal = (s: Status) => s === "DELIVERED" || s === "FAILED_DELIVERY";

export default function DispatchClient({
  initialDeliveries,
  drivers,
}: {
  initialDeliveries: Delivery[];
  drivers: Driver[];
}) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [busyId, setBusyId] = useState<string | null>(null);

  const driverById = useMemo(
    () => Object.fromEntries(drivers.map(d => [d.id, d])),
    [drivers]
  );

  // -- per-driver COD expected (cash drivers will collect today) --
  const codByDriver = useMemo(() => {
    const map: Record<string, number> = {};
    for (const d of deliveries) {
      if (d.order.paymentMethod !== "CASH_ON_DELIVERY") continue;
      if (isTerminal(d.status) && d.status === "FAILED_DELIVERY") continue;
      if (!d.assignedDriverId) continue;
      map[d.assignedDriverId] = (map[d.assignedDriverId] ?? 0) + d.order.totalRs;
    }
    return map;
  }, [deliveries]);

  const counts = useMemo(() => {
    const c = { total: deliveries.length, unassigned: 0, pending: 0, out: 0, done: 0, failed: 0 };
    for (const d of deliveries) {
      if (!d.assignedDriverId && !isTerminal(d.status)) c.unassigned++;
      if (d.status === "OUT_FOR_DELIVERY") c.out++;
      else if (d.status === "DELIVERED") c.done++;
      else if (d.status === "FAILED_DELIVERY") c.failed++;
      else c.pending++;
    }
    return c;
  }, [deliveries]);

  async function assign(deliveryId: string, driverId: string | null) {
    setBusyId(deliveryId);
    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "assign", deliveryId, driverId }),
      });
      if (res.ok) {
        setDeliveries(prev =>
          prev.map(d => (d.id === deliveryId ? { ...d, assignedDriverId: driverId } : d))
        );
      } else {
        alert("Couldn't assign -- try again.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function dispatch(deliveryId: string) {
    setBusyId(deliveryId);
    try {
      const res = await fetch("/api/admin/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "dispatch", deliveryIds: [deliveryId] }),
      });
      if (res.ok) {
        setDeliveries(prev =>
          prev.map(d => (d.id === deliveryId ? { ...d, status: "OUT_FOR_DELIVERY" } : d))
        );
      } else {
        const e = await res.json().catch(() => ({}));
        alert(e.error ?? "Couldn't dispatch.");
      }
    } finally {
      setBusyId(null);
    }
  }

  async function dispatchAllAssigned() {
    const ids = deliveries
      .filter(d => d.assignedDriverId && (d.status === "PREPARING" || d.status === "PACKED"))
      .map(d => d.id);
    if (ids.length === 0) return;
    const res = await fetch("/api/admin/deliveries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "dispatch", deliveryIds: ids }),
    });
    if (res.ok) {
      setDeliveries(prev =>
        prev.map(d => (ids.includes(d.id) ? { ...d, status: "OUT_FOR_DELIVERY" as Status } : d))
      );
    }
  }

  return (
    <div>
      {/* -- Header + summary -- */}
      <div style={{ marginBottom: 18 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800 }}>Today&apos;s dispatch</h1>
        <p style={{ fontSize: 13, color: T.textMuted, marginTop: 4 }}>
          {counts.total} stops &middot; {counts.unassigned} unassigned &middot; {counts.out} out &middot; {counts.done} delivered
          {counts.failed > 0 ? ` \u00B7 ${counts.failed} failed` : ""}
        </p>
      </div>

      {/* -- Driver COD strip -- */}
      {drivers.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 18 }}>
          {drivers.map(dr => (
            <div key={dr.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: "8px 12px", fontSize: 12 }}>
              <span style={{ fontWeight: 700 }}>{dr.name}</span>
              <span style={{ color: T.textMuted }}> &middot; COD &#8377;{(codByDriver[dr.id] ?? 0).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <button
            onClick={dispatchAllAssigned}
            style={{ marginLeft: "auto", background: T.accent, color: "#0a0a0a", border: "none", borderRadius: 10, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
          >
            Dispatch all assigned
          </button>
        </div>
      )}

      {deliveries.length === 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 28, textAlign: "center", color: T.textMuted }}>
          No deliveries scheduled for today.
        </div>
      )}

      {/* -- Delivery rows -- */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {deliveries.map(d => {
          const st = STATUS_STYLE[d.status];
          const a = d.order.address;
          const customer = d.order.user.name ?? "Customer";
          const cod = d.order.paymentMethod === "CASH_ON_DELIVERY";
          const canDispatch = !!d.assignedDriverId && (d.status === "PREPARING" || d.status === "PACKED");
          const terminal = isTerminal(d.status);
          return (
            <div key={d.id} style={{ background: T.card, border: `1px solid ${terminal ? T.border : "#2a3d10"}`, borderRadius: 14, padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6, gap: 10, flexWrap: "wrap" }}>
                <span style={{ fontSize: 12, color: T.textMuted }}>{d.order.orderNumber}</span>
                <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                  {cod && (
                    <span style={{ fontSize: 12, fontWeight: 700, color: T.amber }}>
                      COD &#8377;{d.order.totalRs.toLocaleString("en-IN")}
                    </span>
                  )}
                  <span style={{ fontSize: 12, fontWeight: 700, color: st.color }}>{st.label}</span>
                </div>
              </div>

              <p style={{ fontSize: 16, fontWeight: 700 }}>{customer}</p>
              {a && (
                <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.45 }}>
                  {a.line1}{a.line2 ? `, ${a.line2}` : ""}, {a.area}, {a.city} {a.pincode}
                  {a.landmark ? ` \u00B7 near ${a.landmark}` : ""}
                </p>
              )}
              {d.mealsIncluded?.length > 0 && (
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{d.mealsIncluded.join(" \u00B7 ")}</p>
              )}
              {d.order.user.phone && (
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 2 }}>{d.order.user.phone}</p>
              )}

              {/* assignment + dispatch controls */}
              {!terminal && (
                <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
                  <select
                    value={d.assignedDriverId ?? ""}
                    onChange={e => assign(d.id, e.target.value || null)}
                    disabled={busyId === d.id}
                    style={{ background: "#0a0a0a", color: T.text, border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontSize: 13, minWidth: 160 }}
                  >
                    <option value="">-- Assign driver --</option>
                    {drivers.map(dr => (
                      <option key={dr.id} value={dr.id}>{dr.name}</option>
                    ))}
                  </select>

                  {canDispatch && (
                    <button
                      onClick={() => dispatch(d.id)}
                      disabled={busyId === d.id}
                      style={{ background: T.accent, color: "#0a0a0a", border: "none", borderRadius: 8, padding: "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
                    >
                      {busyId === d.id ? "..." : "Dispatch \u2192"}
                    </button>
                  )}
                  {d.status === "OUT_FOR_DELIVERY" && (
                    <span style={{ fontSize: 12, color: T.textMuted }}>
                      With {d.assignedDriverId ? driverById[d.assignedDriverId]?.name ?? "driver" : "driver"} &middot; awaiting completion
                    </span>
                  )}
                </div>
              )}

              {d.status === "DELIVERED" && d.customerConfirmedAt && (
                <p style={{ fontSize: 12, color: T.accent, marginTop: 10 }}>Customer confirmed receipt &#10003;</p>
              )}
              {d.status === "FAILED_DELIVERY" && d.trackingNotes && (
                <p style={{ fontSize: 12, color: T.textMuted, marginTop: 10 }}>Note: {d.trackingNotes}</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
'@
[System.IO.File]::WriteAllText((Join-Path $RepoRoot "app/admin/DispatchClient.tsx"), $c, $Utf8NoBom)
Write-Host "  fixed app/admin/DispatchClient.tsx" -ForegroundColor Green

$c = @'
"use client";

// app/admin/drivers/DriversClient.tsx
// Phase 10 -- driver roster. THIS is the screen that fixes "only 1 link works":
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
        Each driver gets a private link. Share it on WhatsApp -- they open it on their phone, no login.
      </p>

      {/* -- Create driver -- */}
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
          {creating ? "..." : "Add driver"}
        </button>
      </div>

      {/* -- Roster -- */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {drivers.map(d => (
          <div key={d.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: 16, opacity: d.isActive ? 1 : 0.55 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 10, flexWrap: "wrap" }}>
              <div>
                <p style={{ fontSize: 16, fontWeight: 700 }}>{d.name}</p>
                <p style={{ fontSize: 13, color: T.textMuted }}>
                  {d.phone} &middot; {d._count.deliveries} stop{d._count.deliveries === 1 ? "" : "s"} today
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
                {copiedId === d.id ? "Copied \u2713" : "Copy link"}
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
'@
[System.IO.File]::WriteAllText((Join-Path $RepoRoot "app/admin/drivers/DriversClient.tsx"), $c, $Utf8NoBom)
Write-Host "  fixed app/admin/drivers/DriversClient.tsx" -ForegroundColor Green

Write-Host "Done. Now: git add -A; git commit; git push" -ForegroundColor Cyan
