"use client";

import { AlertTriangle, Check, Clock3, MapPin, Phone, RefreshCw, Truck, UserRoundCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { DELIVERY_WINDOWS } from "@/lib/delivery-windows";
import styles from "./dispatch.module.css";

type Status = "PREPARING" | "PACKED" | "OUT_FOR_DELIVERY" | "DELIVERED" | "FAILED_DELIVERY";
type Window = "MORNING" | "EVENING" | null;

type Delivery = {
  id: string;
  deliveryDate: string | Date;
  status: Status;
  mealsIncluded: string[];
  deliveredAt: string | Date | null;
  assignedDriverId: string | null;
  trackingNotes: string | null;
  customerConfirmedAt: string | Date | null;
  customerIssueNote: string | null;
  deliveryWindow: Window;
  order: {
    orderNumber: string;
    totalRs: number;
    paymentMethod: "PAYU" | "CASH_ON_DELIVERY";
    paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
    user: { name: string | null; phone: string | null };
    address: {
      line1: string;
      line2: string | null;
      area: string;
      city: string;
      pincode: string;
      landmark: string | null;
    } | null;
  };
};

type Driver = { id: string; name: string; phone: string };
type PostResponse = {
  error?: string;
  delivery?: { id: string; assignedDriverId: string | null };
  dispatchedIds?: string[];
  notificationFailures?: number;
};

const STATUS: Record<Status, { label: string; className: string }> = {
  PREPARING: { label: "Preparing", className: styles.neutral },
  PACKED: { label: "Packed", className: styles.packed },
  OUT_FOR_DELIVERY: { label: "Out for delivery", className: styles.out },
  DELIVERED: { label: "Delivered", className: styles.done },
  FAILED_DELIVERY: { label: "Not delivered", className: styles.failed },
};

const isTerminal = (status: Status) => status === "DELIVERED" || status === "FAILED_DELIVERY";

async function postDelivery(payload: object): Promise<PostResponse> {
  const response = await fetch("/api/admin/deliveries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await response.json().catch(() => ({}))) as PostResponse;
  if (!response.ok) throw new Error(data.error || "The delivery could not be updated.");
  return data;
}

export default function DispatchClient({
  initialDeliveries,
  drivers,
}: {
  initialDeliveries: Delivery[];
  drivers: Driver[];
}) {
  const [deliveries, setDeliveries] = useState<Delivery[]>(initialDeliveries);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [dispatchingAll, setDispatchingAll] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (signal?: AbortSignal) => {
    setRefreshing(true);
    try {
      const response = await fetch("/api/admin/deliveries", { cache: "no-store", signal });
      const data = (await response.json().catch(() => ({}))) as { deliveries?: Delivery[]; error?: string };
      if (!response.ok || !Array.isArray(data.deliveries)) {
        throw new Error(data.error || "Could not refresh dispatch status.");
      }
      setDeliveries(data.deliveries);
      setLastUpdated(new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" }));
      setError(null);
    } catch (refreshError: unknown) {
      if (refreshError instanceof DOMException && refreshError.name === "AbortError") return;
      setError(refreshError instanceof Error ? refreshError.message : "Could not refresh dispatch status.");
    } finally {
      if (!signal?.aborted) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void refresh();
    }, 20_000);
    return () => window.clearInterval(interval);
  }, [refresh]);

  const driverById = useMemo(
    () => new Map(drivers.map((driver) => [driver.id, driver])),
    [drivers],
  );

  const codByDriver = useMemo(() => {
    const amounts = new Map<string, number>();
    for (const delivery of deliveries) {
      if (
        delivery.order.paymentMethod !== "CASH_ON_DELIVERY" ||
        delivery.order.paymentStatus === "SUCCESS" ||
        isTerminal(delivery.status) ||
        !delivery.assignedDriverId
      ) continue;
      amounts.set(
        delivery.assignedDriverId,
        (amounts.get(delivery.assignedDriverId) ?? 0) + delivery.order.totalRs,
      );
    }
    return amounts;
  }, [deliveries]);

  const counts = useMemo(() => {
    const next = { total: deliveries.length, unassigned: 0, ready: 0, out: 0, done: 0, failed: 0, issues: 0 };
    for (const delivery of deliveries) {
      if (!delivery.assignedDriverId && !isTerminal(delivery.status)) next.unassigned += 1;
      if (delivery.status === "OUT_FOR_DELIVERY") next.out += 1;
      else if (delivery.status === "DELIVERED") next.done += 1;
      else if (delivery.status === "FAILED_DELIVERY") next.failed += 1;
      else next.ready += 1;
      if (delivery.customerIssueNote) next.issues += 1;
    }
    return next;
  }, [deliveries]);

  async function assign(deliveryId: string, driverId: string | null) {
    setBusyId(deliveryId);
    setError(null);
    try {
      const data = await postDelivery({ action: "assign", deliveryId, driverId });
      const assignedDriverId = data.delivery?.assignedDriverId ?? null;
      setDeliveries((previous) =>
        previous.map((delivery) =>
          delivery.id === deliveryId ? { ...delivery, assignedDriverId } : delivery,
        ),
      );
    } catch (assignError: unknown) {
      setError(assignError instanceof Error ? assignError.message : "The driver could not be assigned.");
    } finally {
      setBusyId(null);
    }
  }

  async function dispatch(ids: string[]) {
    if (!ids.length) return;
    setError(null);
    const data = await postDelivery({ action: "dispatch", deliveryIds: ids });
    const dispatched = new Set(data.dispatchedIds ?? []);
    setDeliveries((previous) =>
      previous.map((delivery) =>
        dispatched.has(delivery.id) ? { ...delivery, status: "OUT_FOR_DELIVERY" } : delivery,
      ),
    );
    if (data.notificationFailures) {
      setError(`${data.notificationFailures} driver alert${data.notificationFailures === 1 ? "" : "s"} failed. The route is still available from each driver link.`);
    }
  }

  async function dispatchOne(deliveryId: string) {
    setBusyId(deliveryId);
    try {
      await dispatch([deliveryId]);
    } catch (dispatchError: unknown) {
      setError(dispatchError instanceof Error ? dispatchError.message : "The stop could not be dispatched.");
    } finally {
      setBusyId(null);
    }
  }

  async function dispatchAllAssigned() {
    const ids = deliveries
      .filter(
        (delivery) =>
          delivery.assignedDriverId &&
          (delivery.status === "PREPARING" || delivery.status === "PACKED"),
      )
      .map((delivery) => delivery.id);
    if (!ids.length) return;
    setDispatchingAll(true);
    try {
      await dispatch(ids);
    } catch (dispatchError: unknown) {
      setError(dispatchError instanceof Error ? dispatchError.message : "The assigned stops could not be dispatched.");
    } finally {
      setDispatchingAll(false);
    }
  }

  const morning = deliveries.filter((delivery) => delivery.deliveryWindow === "MORNING");
  const evening = deliveries.filter((delivery) => delivery.deliveryWindow === "EVENING");
  const unscheduled = deliveries.filter(
    (delivery) => delivery.deliveryWindow !== "MORNING" && delivery.deliveryWindow !== "EVENING",
  );
  const dispatchable = deliveries.filter(
    (delivery) =>
      delivery.assignedDriverId &&
      (delivery.status === "PREPARING" || delivery.status === "PACKED"),
  ).length;

  function renderDelivery(delivery: Delivery) {
    const status = STATUS[delivery.status];
    const address = delivery.order.address;
    const customer = delivery.order.user.name ?? "Customer";
    const codDue =
      delivery.order.paymentMethod === "CASH_ON_DELIVERY" && delivery.order.paymentStatus !== "SUCCESS";
    const canDispatch =
      Boolean(delivery.assignedDriverId) &&
      (delivery.status === "PREPARING" || delivery.status === "PACKED");

    return (
      <article key={delivery.id} className={`${styles.card} ${delivery.customerIssueNote ? styles.issueCard : ""}`}>
        <div className={styles.cardTop}>
          <div>
            <p className={styles.orderNumber}>{delivery.order.orderNumber}</p>
            <h3>{customer}</h3>
          </div>
          <div className={styles.badges}>
            {codDue && <span className={styles.cod}>Collect ₹{delivery.order.totalRs.toLocaleString("en-IN")}</span>}
            <span className={`${styles.status} ${status.className}`}>{status.label}</span>
          </div>
        </div>

        {address && (
          <div className={styles.address}>
            <MapPin size={17} aria-hidden="true" />
            <p>
              {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.area}, {address.city} {address.pincode}
              {address.landmark ? <span>Near {address.landmark}</span> : null}
            </p>
          </div>
        )}
        <div className={styles.meta}>
          {delivery.mealsIncluded.length > 0 && <span>{delivery.mealsIncluded.join(", ")}</span>}
          {delivery.order.user.phone && (
            <a href={`tel:${delivery.order.user.phone}`}><Phone size={15} aria-hidden="true" /> {delivery.order.user.phone}</a>
          )}
        </div>

        {delivery.customerIssueNote && (
          <div className={styles.issue}>
            <AlertTriangle size={18} aria-hidden="true" />
            <div><strong>Customer issue</strong><p>{delivery.customerIssueNote}</p></div>
          </div>
        )}

        {!isTerminal(delivery.status) && (
          <div className={styles.controls}>
            <label>
              <span className={styles.srOnly}>Driver for {customer}</span>
              <select
                value={delivery.assignedDriverId ?? ""}
                onChange={(event) => assign(delivery.id, event.target.value || null)}
                disabled={busyId === delivery.id}
              >
                <option value="">Assign a driver</option>
                {drivers.map((driver) => <option key={driver.id} value={driver.id}>{driver.name}</option>)}
              </select>
            </label>
            {canDispatch && (
              <button type="button" onClick={() => dispatchOne(delivery.id)} disabled={busyId === delivery.id}>
                <Truck size={17} aria-hidden="true" /> {busyId === delivery.id ? "Dispatching…" : "Dispatch stop"}
              </button>
            )}
            {delivery.status === "OUT_FOR_DELIVERY" && (
              <span className={styles.withDriver}>
                With {delivery.assignedDriverId ? driverById.get(delivery.assignedDriverId)?.name ?? "driver" : "driver"}
              </span>
            )}
          </div>
        )}

        {delivery.status === "DELIVERED" && (
          <p className={styles.outcome}><Check size={16} aria-hidden="true" /> {delivery.customerConfirmedAt ? "Delivered · customer confirmed" : "Driver marked delivered"}</p>
        )}
        {delivery.status === "FAILED_DELIVERY" && (
          <p className={`${styles.outcome} ${styles.failureOutcome}`}><AlertTriangle size={16} aria-hidden="true" /> {delivery.trackingNotes || "No reason recorded"}</p>
        )}
      </article>
    );
  }

  function renderSection(title: string, time: string | undefined, rows: Delivery[]) {
    if (!rows.length) return null;
    return (
      <section className={styles.run}>
        <div className={styles.runHeader}>
          <div><h2>{title}</h2>{time && <p>{time}</p>}</div>
          <span>{rows.length} stop{rows.length === 1 ? "" : "s"}</span>
        </div>
        <div className={styles.cards}>{rows.map(renderDelivery)}</div>
      </section>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Daily operations</p>
          <h1>Today’s dispatch</h1>
          <p>{counts.total} stops across the morning and evening runs.</p>
        </div>
        <button type="button" className={styles.refresh} onClick={() => refresh()} disabled={refreshing}>
          <RefreshCw size={17} aria-hidden="true" className={refreshing ? styles.spinning : ""} />
          {refreshing ? "Refreshing…" : lastUpdated ? `Updated ${lastUpdated}` : "Refresh"}
        </button>
      </header>

      {error && <div className={styles.error} role="alert" aria-live="polite"><AlertTriangle size={18} aria-hidden="true" /> {error}</div>}

      <div className={styles.summary}>
        <Summary icon={<Clock3 size={18} />} label="Preparing" value={counts.ready} />
        <Summary icon={<Truck size={18} />} label="On the road" value={counts.out} />
        <Summary icon={<Check size={18} />} label="Delivered" value={counts.done} />
        <Summary icon={<UserRoundCheck size={18} />} label="Unassigned" value={counts.unassigned} />
        {counts.issues > 0 && <Summary icon={<AlertTriangle size={18} />} label="Customer issues" value={counts.issues} alert />}
      </div>

      <div className={styles.toolbar}>
        <div className={styles.driverCash}>
          {drivers.map((driver) => (
            <span key={driver.id}><strong>{driver.name}</strong> · cash due ₹{(codByDriver.get(driver.id) ?? 0).toLocaleString("en-IN")}</span>
          ))}
        </div>
        <button type="button" onClick={dispatchAllAssigned} disabled={!dispatchable || dispatchingAll}>
          <Truck size={17} aria-hidden="true" />
          {dispatchingAll ? "Dispatching…" : `Dispatch ${dispatchable || "all"} assigned`}
        </button>
      </div>

      {!deliveries.length && <div className={styles.empty}>No deliveries are scheduled for today.</div>}
      {renderSection("Morning run", DELIVERY_WINDOWS.MORNING.time, morning)}
      {renderSection("Evening run", DELIVERY_WINDOWS.EVENING.time, evening)}
      {renderSection("Unscheduled", undefined, unscheduled)}
    </div>
  );
}

function Summary({ icon, label, value, alert }: { icon: React.ReactNode; label: string; value: number; alert?: boolean }) {
  return (
    <div className={`${styles.summaryCard} ${alert ? styles.summaryAlert : ""}`}>
      <span>{icon}</span><div><strong>{value}</strong><p>{label}</p></div>
    </div>
  );
}
