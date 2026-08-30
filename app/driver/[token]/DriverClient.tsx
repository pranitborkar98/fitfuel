"use client";

import { Check, CircleAlert, MapPin, Phone, Truck } from "lucide-react";
import { useEffect, useState } from "react";
import styles from "./driver.module.css";

type DeliveryStatus =
  | "PREPARING"
  | "PACKED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED_DELIVERY";

type Delivery = {
  id: string;
  status: DeliveryStatus;
  mealsIncluded: string[];
  deliveredAt: string | null;
  customerConfirmedAt: string | null;
  customerIssueNote: string | null;
  trackingNotes: string | null;
  deliveryWindow: "MORNING" | "EVENING" | null;
  order: {
    orderNumber: string;
    totalRs: number;
    paymentMethod: "PAYU" | "CASH_ON_DELIVERY";
    paymentStatus: "PENDING" | "SUCCESS" | "FAILED" | "REFUNDED";
    user: { name: string | null; email: string | null; phone: string | null };
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

const STATUS: Record<DeliveryStatus, { label: string; tone: string }> = {
  PREPARING: { label: "Kitchen is preparing", tone: styles.neutral },
  PACKED: { label: "Packed", tone: styles.neutral },
  OUT_FOR_DELIVERY: { label: "Ready for you", tone: styles.live },
  DELIVERED: { label: "Delivered", tone: styles.done },
  FAILED_DELIVERY: { label: "Not delivered", tone: styles.failed },
};

function parseError(value: unknown): string {
  if (value && typeof value === "object" && "error" in value && typeof value.error === "string") {
    return value.error;
  }
  return "That did not go through. Please try again.";
}

export default function DriverClient({ token, driverName }: { token: string; driverName: string }) {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [failingId, setFailingId] = useState<string | null>(null);
  const [note, setNote] = useState("");

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/driver/${token}/deliveries`, { signal: controller.signal })
      .then(async (response) => {
        const data: unknown = await response.json().catch(() => ({}));
        if (!response.ok) throw new Error(parseError(data));
        if (!data || typeof data !== "object" || !("deliveries" in data) || !Array.isArray(data.deliveries)) {
          throw new Error("Today’s route could not be loaded.");
        }
        setDeliveries(data.deliveries as Delivery[]);
        setLoadError(null);
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") return;
        setLoadError(error instanceof Error ? error.message : "Today’s route could not be loaded.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [token]);

  async function mark(delivery: Delivery, result: "delivered" | "failed", noteText?: string) {
    const isCod = delivery.order.paymentMethod === "CASH_ON_DELIVERY" && delivery.order.paymentStatus !== "SUCCESS";
    if (
      result === "delivered" &&
      isCod &&
      !window.confirm(
        `Confirm the meals were handed over and ₹${delivery.order.totalRs.toLocaleString("en-IN")} was collected in cash.`,
      )
    ) return;

    setBusyId(delivery.id);
    setActionError(null);
    try {
      const response = await fetch(`/api/driver/${token}/deliver`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId: delivery.id, result, note: noteText }),
      });
      const data: unknown = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(parseError(data));
      if (!data || typeof data !== "object" || !("delivery" in data)) {
        throw new Error("The stop changed but could not be refreshed.");
      }
      const updated = data.delivery as Pick<Delivery, "status" | "deliveredAt" | "trackingNotes">;
      setDeliveries((previous) =>
        previous.map((item) =>
          item.id === delivery.id
            ? {
                ...item,
                status: updated.status,
                deliveredAt: updated.deliveredAt,
                trackingNotes: updated.trackingNotes,
                order: {
                  ...item.order,
                  paymentStatus: isCod && result === "delivered" ? "SUCCESS" : item.order.paymentStatus,
                },
              }
            : item,
        ),
      );
      setFailingId(null);
      setNote("");
    } catch (error: unknown) {
      setActionError(error instanceof Error ? error.message : "That did not go through. Please try again.");
    } finally {
      setBusyId(null);
    }
  }

  const pending = deliveries.filter((delivery) => delivery.status === "OUT_FOR_DELIVERY").length;
  const finished = deliveries.filter(
    (delivery) => delivery.status === "DELIVERED" || delivery.status === "FAILED_DELIVERY",
  ).length;

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}><Truck size={18} aria-hidden="true" /> FitFuel delivery</div>
        <h1>Hi {driverName}</h1>
        <p>
          {loading
            ? "Loading today’s route…"
            : `${deliveries.length} stop${deliveries.length === 1 ? "" : "s"} · ${pending} ready · ${finished} finished`}
        </p>
      </header>

      {loadError && (
        <div className={styles.error} role="alert">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{loadError}</span>
        </div>
      )}
      {actionError && (
        <div className={styles.error} role="alert" aria-live="polite">
          <CircleAlert size={18} aria-hidden="true" />
          <span>{actionError}</span>
        </div>
      )}

      {loading && <div className={styles.empty}>Getting the latest stop status…</div>}
      {!loading && !loadError && deliveries.length === 0 && (
        <div className={styles.empty}>No stops are assigned to you today.</div>
      )}

      <div className={styles.list}>
        {deliveries.map((delivery, index) => {
          const status = STATUS[delivery.status];
          const address = delivery.order.address;
          const active = delivery.status === "OUT_FOR_DELIVERY";
          const done = delivery.status === "DELIVERED" || delivery.status === "FAILED_DELIVERY";
          const customer = delivery.order.user.name ?? delivery.order.user.email ?? "Customer";
          const codDue =
            delivery.order.paymentMethod === "CASH_ON_DELIVERY" && delivery.order.paymentStatus !== "SUCCESS";

          return (
            <article key={delivery.id} className={`${styles.card} ${active ? styles.activeCard : ""}`}>
              <div className={styles.cardTop}>
                <span className={styles.stopNumber}>Stop {index + 1}</span>
                <span className={`${styles.status} ${status.tone}`}>{status.label}</span>
              </div>
              <p className={styles.orderNumber}>{delivery.order.orderNumber}</p>
              <h2>{customer}</h2>

              {address && (
                <div className={styles.address}>
                  <MapPin size={18} aria-hidden="true" />
                  <p>
                    {address.line1}{address.line2 ? `, ${address.line2}` : ""}, {address.area}, {address.city} {address.pincode}
                    {address.landmark ? <span>Near {address.landmark}</span> : null}
                  </p>
                </div>
              )}

              <div className={styles.meta}>
                <span>{delivery.deliveryWindow === "EVENING" ? "Evening run" : "Morning run"}</span>
                {delivery.mealsIncluded.length > 0 && <span>{delivery.mealsIncluded.join(", ")}</span>}
              </div>

              {codDue && (
                <div className={styles.cod}>
                  <span>Collect cash</span>
                  <strong>₹{delivery.order.totalRs.toLocaleString("en-IN")}</strong>
                </div>
              )}

              {delivery.customerIssueNote && (
                <div className={styles.customerIssue}>
                  <CircleAlert size={18} aria-hidden="true" />
                  <div><strong>Customer reported an issue</strong><p>{delivery.customerIssueNote}</p></div>
                </div>
              )}

              {delivery.order.user.phone && (
                <a className={styles.call} href={`tel:${delivery.order.user.phone}`}>
                  <Phone size={18} aria-hidden="true" /> Call customer
                </a>
              )}

              {active && failingId !== delivery.id && (
                <div className={styles.actions}>
                  <button
                    type="button"
                    className={styles.primary}
                    onClick={() => mark(delivery, "delivered")}
                    disabled={busyId === delivery.id}
                  >
                    <Check size={18} aria-hidden="true" />
                    {busyId === delivery.id
                      ? "Saving…"
                      : codDue
                        ? `Delivered · ₹${delivery.order.totalRs.toLocaleString("en-IN")} collected`
                        : "Mark delivered"}
                  </button>
                  <button
                    type="button"
                    className={styles.secondary}
                    onClick={() => { setFailingId(delivery.id); setNote(""); setActionError(null); }}
                    disabled={busyId === delivery.id}
                  >
                    Couldn’t deliver
                  </button>
                </div>
              )}

              {active && failingId === delivery.id && (
                <div className={styles.failureForm}>
                  <label htmlFor={`failure-${delivery.id}`}>Why could this not be delivered?</label>
                  <textarea
                    id={`failure-${delivery.id}`}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    placeholder="For example: customer unavailable or address not found"
                    maxLength={500}
                    rows={3}
                    autoFocus
                  />
                  <div className={styles.actions}>
                    <button
                      type="button"
                      className={styles.danger}
                      onClick={() => mark(delivery, "failed", note.trim())}
                      disabled={busyId === delivery.id || note.trim().length < 3}
                    >
                      {busyId === delivery.id ? "Saving…" : "Confirm not delivered"}
                    </button>
                    <button
                      type="button"
                      className={styles.secondary}
                      onClick={() => { setFailingId(null); setNote(""); }}
                      disabled={busyId === delivery.id}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {!active && !done && <p className={styles.waiting}>Waiting for dispatch to release this stop.</p>}
              {delivery.status === "DELIVERED" && (
                <p className={styles.completion}>
                  <Check size={17} aria-hidden="true" />
                  {delivery.customerConfirmedAt ? "Delivered · customer confirmed" : "Delivered"}
                </p>
              )}
              {delivery.status === "FAILED_DELIVERY" && (
                <p className={styles.failureNote}><strong>Reason:</strong> {delivery.trackingNotes || "No reason recorded"}</p>
              )}
            </article>
          );
        })}
      </div>
    </main>
  );
}
