"use client";

import { useMemo, useState } from "react";
import styles from "./subscribers.module.css";

export type SubscriberRecord = {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  currentDay: number;
  isDigital: boolean;
  mealsPerDay: string | null;
  duration: string | null;
  bundle: string;
  deliveryWindow: string;
  calorieTarget: number | null;
  proteinTarget: number | null;
  carbTarget: number | null;
  fatTarget: number | null;
  orderId: string | null;
  createdAt: string;
  user: { name: string | null; email: string | null; phone: string | null };
  mealPlan: { displayName: string; slug: string };
};

type KindFilter = "" | "physical" | "digital";

function words(value: string | null) {
  if (!value) return "—";
  return value.replace(/_/g, " ").toLowerCase();
}

function dateLabel(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function statusTone(status: string) {
  if (status === "active") return styles.active;
  if (status === "paused") return styles.paused;
  if (status === "cancelled") return styles.cancelled;
  return styles.completed;
}

export default function SubscribersView({ subscribers }: { subscribers: SubscriberRecord[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [kind, setKind] = useState<KindFilter>("");
  const [expanded, setExpanded] = useState<string | null>(null);

  const counts = useMemo(
    () => subscribers.reduce<Record<string, number>>((result, subscriber) => {
      result[subscriber.status] = (result[subscriber.status] ?? 0) + 1;
      return result;
    }, {}),
    [subscribers],
  );

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return subscribers.filter((subscriber) => {
      if (status && subscriber.status !== status) return false;
      if (kind === "digital" && !subscriber.isDigital) return false;
      if (kind === "physical" && subscriber.isDigital) return false;
      if (!needle) return true;
      const searchable = [
        subscriber.user.name,
        subscriber.user.email,
        subscriber.user.phone,
        subscriber.mealPlan.displayName,
      ].filter(Boolean).join(" ").toLowerCase();
      return searchable.includes(needle);
    });
  }, [kind, query, status, subscribers]);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>Customer operations</p>
          <h1>Subscribers</h1>
          <p>See who is eating with FitFuel, what they bought and where they are in their plan.</p>
        </div>
        <div className={styles.total} aria-label={`${subscribers.length} plan records`}>
          <strong>{subscribers.length}</strong>
          <span>Plan records</span>
        </div>
      </header>

      <section className={styles.metrics} aria-label="Subscriber summary">
        <Metric label="Active now" value={counts.active ?? 0} tone="green" />
        <Metric label="Paused" value={counts.paused ?? 0} tone="amber" />
        <Metric label="Completed" value={counts.completed ?? 0} />
        <Metric label="Cancelled" value={counts.cancelled ?? 0} tone="red" />
      </section>

      <section className={styles.panel}>
        <div className={styles.filters}>
          <label className={styles.searchField}>
            <span className="sr-only">Search subscribers</span>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search customer, phone or plan"
            />
          </label>
          <label>
            <span className="sr-only">Filter by status</span>
            <select value={status} onChange={(event) => setStatus(event.target.value)}>
              <option value="">Every status</option>
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by plan format</span>
            <select value={kind} onChange={(event) => setKind(event.target.value as KindFilter)}>
              <option value="">Every format</option>
              <option value="physical">Meal delivery</option>
              <option value="digital">Digital plan</option>
            </select>
          </label>
        </div>

        <p className={styles.resultCount} aria-live="polite">
          Showing {filtered.length} of {subscribers.length}
        </p>

        {filtered.length === 0 ? (
          <div className={styles.empty}>
            <strong>No matching subscribers</strong>
            <span>Try a different name, status or plan format.</span>
          </div>
        ) : (
          <div className={styles.list}>
            {filtered.map((subscriber) => {
              const isOpen = expanded === subscriber.id;
              const detailId = `subscriber-${subscriber.id}`;
              return (
                <article className={styles.card} key={subscriber.id}>
                  <button
                    type="button"
                    className={styles.summary}
                    onClick={() => setExpanded(isOpen ? null : subscriber.id)}
                    aria-expanded={isOpen}
                    aria-controls={detailId}
                  >
                    <span className={styles.customer}>
                      <strong>{subscriber.user.name || "Unnamed customer"}</strong>
                      <small>{subscriber.user.email || subscriber.user.phone || "No contact saved"}</small>
                    </span>
                    <span className={styles.plan}>
                      <strong>{subscriber.mealPlan.displayName}</strong>
                      <small>{subscriber.isDigital ? "Digital plan" : "Meal delivery"}</small>
                    </span>
                    <span className={`${styles.status} ${statusTone(subscriber.status)}`}>{words(subscriber.status)}</span>
                    <span className={styles.dates}>
                      <small>Plan dates</small>
                      {dateLabel(subscriber.startDate)} – {dateLabel(subscriber.endDate)}
                    </span>
                    <span className={styles.progress}>
                      <small>{subscriber.isDigital ? "Access" : "Progress"}</small>
                      {subscriber.isDigital ? words(subscriber.bundle) : `Day ${subscriber.currentDay}`}
                    </span>
                    <span className={styles.chevron} aria-hidden="true">{isOpen ? "−" : "+"}</span>
                  </button>

                  {isOpen && (
                    <div className={styles.details} id={detailId}>
                      <Detail label="Plan setup">
                        <strong>{subscriber.mealPlan.displayName}</strong>
                        <span>{words(subscriber.duration)} · {words(subscriber.mealsPerDay)}</span>
                        {!subscriber.isDigital && <span>Delivery: {words(subscriber.deliveryWindow)}</span>}
                      </Detail>
                      <Detail label="Contact">
                        <span>{subscriber.user.phone || "No phone saved"}</span>
                        <span>{subscriber.user.email || "No email saved"}</span>
                      </Detail>
                      <Detail label="Personal targets">
                        {subscriber.calorieTarget || subscriber.proteinTarget ? (
                          <span>
                            {subscriber.calorieTarget ?? "—"} kcal · {subscriber.proteinTarget ?? "—"}g protein · {subscriber.carbTarget ?? "—"}g carbs · {subscriber.fatTarget ?? "—"}g fat
                          </span>
                        ) : <span>Using the plan defaults</span>}
                      </Detail>
                      <Detail label="Purchase record">
                        <span>{subscriber.orderId ? `Order ${subscriber.orderId}` : "No linked order"}</span>
                        <span>Added {dateLabel(subscriber.createdAt)}</span>
                      </Detail>
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}

function Metric({ label, value, tone }: { label: string; value: number; tone?: "green" | "amber" | "red" }) {
  return (
    <div className={`${styles.metric} ${tone ? styles[tone] : ""}`}>
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}

function Detail({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className={styles.detail}>
      <small>{label}</small>
      {children}
    </div>
  );
}
