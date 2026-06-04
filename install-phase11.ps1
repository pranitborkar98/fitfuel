# Phase 11 installer -- delivery generator + window grouping + checkout toggle.
$RepoRoot = "C:\Users\VCOM\fitfuel"
$Utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# create folders (literal paths)
[System.IO.Directory]::CreateDirectory((Join-Path $RepoRoot "app/admin")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path $RepoRoot "app/api/cron/generate-deliveries")) | Out-Null
[System.IO.Directory]::CreateDirectory((Join-Path $RepoRoot "components")) | Out-Null

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

      {/* -- Delivery rows grouped by run -- */}
      <Section title="Morning run" time="7-9 AM" rows={morning} />
      <Section title="Evening run" time="6-8 PM" rows={evening} />
      <Section title="Unscheduled" rows={unscheduled} />
    </div>
  );
}
'@
[System.IO.File]::WriteAllText((Join-Path $RepoRoot "app/admin/DispatchClient.tsx"), $c, $Utf8NoBom)
Write-Host "  wrote app/admin/DispatchClient.tsx" -ForegroundColor Green

$c = @'
// app/admin/page.tsx
// Phase 10 -- the dispatch board. Loads today's deliveries + drivers server-side.

import { prisma } from "@/lib/prisma";
import DispatchClient from "./DispatchClient";

export const dynamic = "force-dynamic";

function todayWindow() {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0); // matches the driver route's date convention
  const end = new Date(start);
  end.setUTCDate(end.getUTCDate() + 1);
  return { start, end };
}

export default async function DispatchPage() {
  const { start, end } = todayWindow();

  const [deliveries, drivers] = await Promise.all([
    prisma.delivery.findMany({
      where: { deliveryDate: { gte: start, lt: end } },
      orderBy: [{ status: "asc" }, { createdAt: "asc" }],
      select: {
        id: true,
        status: true,
        mealsIncluded: true,
        deliveredAt: true,
        assignedDriverId: true,
        trackingNotes: true,
        customerConfirmedAt: true,
        deliveryWindow: true,
        order: {
          select: {
            orderNumber: true,
            totalRs: true,
            paymentMethod: true,
            user: { select: { name: true, phone: true } },
            address: {
              select: { line1: true, line2: true, area: true, city: true, pincode: true, landmark: true },
            },
          },
        },
      },
    }),
    prisma.driver.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { id: true, name: true, phone: true },
    }),
  ]);

  return <DispatchClient initialDeliveries={deliveries} drivers={drivers} />;
}
'@
[System.IO.File]::WriteAllText((Join-Path $RepoRoot "app/admin/page.tsx"), $c, $Utf8NoBom)
Write-Host "  wrote app/admin/page.tsx" -ForegroundColor Green

$c = @'
// app/api/cron/generate-deliveries/route.ts
// Phase 11 -- the delivery generator. Runs nightly (Vercel Cron, 11 PM IST).
// For every ACTIVE subscriber whose plan covers tomorrow (and didn't skip it),
// it creates ONE delivery -- all their meals together -- stamped with the
// customer's chosen window (MORNING / EVENING). Idempotent: re-running won't
// create duplicates.
//
// Manual test (with your CRON_SECRET):
//   curl -H "Authorization: Bearer <CRON_SECRET>" \
//     "https://fitfuel-eosin.vercel.app/api/cron/generate-deliveries?date=2026-06-05"

import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

// which meals go in the (single) drop, based on what they subscribed to
function mealsFor(m: string | null | undefined): string[] {
  switch (m) {
    case "BREAKFAST_LUNCH": return ["Breakfast", "Lunch"];
    case "SNACK_DINNER": return ["Snack", "Dinner"];
    case "ALL_FOUR": return ["Breakfast", "Lunch", "Snack", "Dinner"];
    default: return ["Breakfast", "Lunch", "Snack", "Dinner"];
  }
}

// target = tomorrow at UTC midnight (matches the board/driver "today" query convention).
// ?date=YYYY-MM-DD overrides, for testing.
function targetDay(override: string | null): Date {
  if (override) return new Date(`${override}T00:00:00.000Z`);
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + 1);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function sameUTCDate(a: Date, b: Date): boolean {
  return a.toISOString().slice(0, 10) === b.toISOString().slice(0, 10);
}

export async function GET(req: NextRequest) {
  // Vercel Cron sends "Authorization: Bearer <CRON_SECRET>" automatically.
  const expected = process.env.CRON_SECRET;
  if (expected && req.headers.get("authorization") !== `Bearer ${expected}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const date = targetDay(req.nextUrl.searchParams.get("date"));

  const plans = await prisma.userActivePlan.findMany({
    where: {
      status: "active",
      startDate: { lte: date },
      endDate: { gte: date },
      orderId: { not: null },
    },
    select: {
      id: true,
      orderId: true,
      mealsPerDay: true,
      deliveryWindow: true,
      skipDates: true,
    },
  });

  let created = 0;
  let skipped = 0;
  let already = 0;

  for (const plan of plans) {
    // customer skipped this date?
    if (plan.skipDates?.some(sd => sameUTCDate(new Date(sd), date))) {
      skipped++;
      continue;
    }
    // already generated (idempotent re-run)?
    const exists = await prisma.delivery.findFirst({
      where: { orderId: plan.orderId!, deliveryDate: date },
      select: { id: true },
    });
    if (exists) {
      already++;
      continue;
    }

    await prisma.delivery.create({
      data: {
        orderId: plan.orderId!,
        deliveryDate: date,
        status: "PREPARING",
        mealsIncluded: mealsFor(plan.mealsPerDay),
        deliveryWindow: plan.deliveryWindow, // MORNING / EVENING
      },
    });
    created++;
  }

  return NextResponse.json({
    date: date.toISOString().slice(0, 10),
    activePlans: plans.length,
    created,
    alreadyExisted: already,
    skipped,
  });
}
'@
[System.IO.File]::WriteAllText((Join-Path $RepoRoot "app/api/cron/generate-deliveries/route.ts"), $c, $Utf8NoBom)
Write-Host "  wrote app/api/cron/generate-deliveries/route.ts" -ForegroundColor Green

$c = @'
"use client";

// components/DeliveryWindowToggle.tsx
// Phase 11 -- customer picks their delivery run at checkout. Controlled component:
// pass value + onChange, then include `value` in your order/subscription POST so it
// lands on the UserActivePlan.deliveryWindow field.
//
// Usage in checkout:
//   const [deliveryWindow, setDeliveryWindow] = useState<"MORNING" | "EVENING">("MORNING");
//   <DeliveryWindowToggle value={deliveryWindow} onChange={setDeliveryWindow} />
//   // ...then send deliveryWindow in the body when you create the order.

const T = {
  card: "#101010", border: "#222", text: "#ffffff",
  textMuted: "#888888", accent: "#84cc16",
};

type Window = "MORNING" | "EVENING";

const OPTIONS: { value: Window; label: string; time: string }[] = [
  { value: "MORNING", label: "Morning", time: "7-9 AM" },
  { value: "EVENING", label: "Evening", time: "6-8 PM" },
];

export default function DeliveryWindowToggle({
  value,
  onChange,
}: {
  value: Window;
  onChange: (v: Window) => void;
}) {
  return (
    <div>
      <p style={{ fontSize: 13, fontWeight: 600, color: T.text, marginBottom: 8 }}>
        When should we deliver?
      </p>
      <div style={{ display: "flex", gap: 10 }}>
        {OPTIONS.map(opt => {
          const active = value === opt.value;
          return (
            <button
              key={opt.value}
              type="button"
              onClick={() => onChange(opt.value)}
              style={{
                flex: 1,
                background: active ? T.accent : T.card,
                color: active ? "#0a0a0a" : T.text,
                border: `1px solid ${active ? T.accent : T.border}`,
                borderRadius: 12,
                padding: "14px 12px",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{ display: "block", fontSize: 15, fontWeight: 800 }}>{opt.label}</span>
              <span style={{ display: "block", fontSize: 12, fontWeight: 600, color: active ? "#0a0a0a" : T.textMuted, marginTop: 2 }}>
                {opt.time}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
'@
[System.IO.File]::WriteAllText((Join-Path $RepoRoot "components/DeliveryWindowToggle.tsx"), $c, $Utf8NoBom)
Write-Host "  wrote components/DeliveryWindowToggle.tsx" -ForegroundColor Green

Write-Host "Done. Remember: edit schema.prisma, db push, add CRON_SECRET, vercel.json." -ForegroundColor Cyan
