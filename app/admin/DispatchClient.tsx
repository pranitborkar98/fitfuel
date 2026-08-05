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

type Window = "MORNING" | "EVENING" | null;

type Delivery = {
  id: string;
  status: Status;
  mealsIncluded: string[];
  deliveredAt: string | Date | null;
  assignedDriverId: string | null;
  trackingNotes: string | null;
  customerConfirmedAt: string | Date | null;
  deliveryWindow: Window;
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

  // one delivery card (reused inside each run group)
  function renderRow(d: Delivery) {
    const st = STATUS_STYLE[d.status];
    const a = d.order.address;
    const customer = d.order.user.name ?? "Customer";
    const cod = d.order.paymentMethod === "CASH_ON_DELIVERY";
    const canDispatch = !!d.assignedDriverId && (d.status === "PREPARING" || d.status === "PACKED");
    const terminal = isTerminal(d.status);
    return (
      <div key={d.id} style={{ background: T.card, border: `1px solid ${terminal ? T.border : "#2a3d10"}`, borderRadius: 0, padding: 16 }}>
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

        {!terminal && (
          <div style={{ display: "flex", gap: 10, marginTop: 12, alignItems: "center", flexWrap: "wrap" }}>
            <select
              value={d.assignedDriverId ?? ""}
              onChange={e => assign(d.id, e.target.value || null)}
              disabled={busyId === d.id}
              style={{ background: "#0a0a0a", color: T.text, border: `1px solid ${T.border}`, borderRadius: 0, padding: "10px 12px", fontSize: 13, minWidth: 160 }}
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
                style={{ background: T.accent, color: "#0a0a0a", border: "none", borderRadius: 0, padding: "10px 16px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
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
  }

  const morning = deliveries.filter(d => d.deliveryWindow === "MORNING");
  const evening = deliveries.filter(d => d.deliveryWindow === "EVENING");
  const unscheduled = deliveries.filter(d => d.deliveryWindow !== "MORNING" && d.deliveryWindow !== "EVENING");

  function Section({ title, time, rows }: { title: string; time?: string; rows: Delivery[] }) {
    if (rows.length === 0) return null;
    return (
      <div style={{ marginBottom: 22 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 10 }}>
          <h2 style={{ fontSize: 15, fontWeight: 800, color: T.accent }}>{title}</h2>
          {time && <span style={{ fontSize: 12, color: T.textMuted }}>{time}</span>}
          <span style={{ fontSize: 12, color: T.textMuted, marginLeft: "auto" }}>{rows.length} stop{rows.length === 1 ? "" : "s"}</span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>{rows.map(renderRow)}</div>
      </div>
    );
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
            <div key={dr.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 0, padding: "8px 12px", fontSize: 12 }}>
              <span style={{ fontWeight: 700 }}>{dr.name}</span>
              <span style={{ color: T.textMuted }}> &middot; COD &#8377;{(codByDriver[dr.id] ?? 0).toLocaleString("en-IN")}</span>
            </div>
          ))}
          <button
            onClick={dispatchAllAssigned}
            style={{ marginLeft: "auto", background: T.accent, color: "#0a0a0a", border: "none", borderRadius: 0, padding: "8px 14px", fontSize: 13, fontWeight: 800, cursor: "pointer" }}
          >
            Dispatch all assigned
          </button>
        </div>
      )}

      {deliveries.length === 0 && (
        <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 0, padding: 28, textAlign: "center", color: T.textMuted }}>
          No deliveries scheduled for today.
        </div>
      )}

      {/* -- Delivery rows grouped by run -- */}
      <Section title="Morning run" time="7-9 AM" rows={morning} />
      <Section title="Evening run" time="6-8 PM" rows={evening} />
      <Section title="Unscheduled" rows={unscheduled} />
    </div>
  );
}