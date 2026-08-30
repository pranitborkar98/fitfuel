"use client";

import { CalendarDays, Check } from "lucide-react";
import { useEffect, useState } from "react";

import s from "./dashboard.module.css";

type DeliveryDay = {
  date: string;
  label: string;
  skipped: boolean;
  canChange: boolean;
  cutoff: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseDays(value: unknown): DeliveryDay[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!isRecord(entry)) return [];
    if (
      typeof entry.date !== "string" ||
      typeof entry.label !== "string" ||
      typeof entry.skipped !== "boolean" ||
      typeof entry.canChange !== "boolean" ||
      typeof entry.cutoff !== "string"
    ) return [];
    return [{
      date: entry.date,
      label: entry.label,
      skipped: entry.skipped,
      canChange: entry.canChange,
      cutoff: entry.cutoff,
    }];
  });
}

function errorMessage(value: unknown, fallback: string) {
  return isRecord(value) && typeof value.error === "string" ? value.error : fallback;
}

export default function DeliveryScheduleCard() {
  const [days, setDays] = useState<DeliveryDay[]>([]);
  const [cutoff, setCutoff] = useState("9pm");
  const [loading, setLoading] = useState(true);
  const [busyDate, setBusyDate] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    fetch("/api/user/active-plan/delivery-days")
      .then(async (response) => {
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) throw new Error(errorMessage(body, "Delivery dates could not be loaded."));
        if (!active || !isRecord(body)) return;
        setDays(parseDays(body.days));
        if (typeof body.cutoffLabel === "string") setCutoff(body.cutoffLabel);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Delivery dates could not be loaded.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  async function changeDay(day: DeliveryDay) {
    if (!day.canChange || busyDate) return;
    setBusyDate(day.date);
    setError(null);
    try {
      const response = await fetch("/api/user/active-plan/delivery-days", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date: day.date, skipped: !day.skipped }),
      });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(errorMessage(body, "The delivery change could not be saved."));
      setDays((current) => current.map((item) => item.date === day.date ? { ...item, skipped: !day.skipped } : item));
    } catch (reason: unknown) {
      setError(reason instanceof Error ? reason.message : "The delivery change could not be saved.");
    } finally {
      setBusyDate(null);
    }
  }

  return (
    <section className={`${s.card} ${s.deliverySchedule}`} aria-labelledby="delivery-schedule-title">
      <div className={s.deliveryScheduleIntro}>
        <span className={s.deliveryScheduleIcon}><CalendarDays aria-hidden="true" size={20} /></span>
        <div>
          <h2 id="delivery-schedule-title">Upcoming deliveries</h2>
          <p>Need a day off? Change it before {cutoff} on the previous evening. Skipped days do not extend the plan.</p>
        </div>
      </div>

      {loading ? (
        <div className={s.deliveryLoading} aria-busy="true">Loading delivery dates…</div>
      ) : days.length === 0 ? (
        <div className={s.deliveryLoading}>No upcoming delivery dates.</div>
      ) : (
        <div className={s.deliveryDays}>
          {days.map((day) => {
            const busy = busyDate === day.date;
            return (
              <div className={`${s.deliveryDay} ${day.skipped ? s.deliveryDaySkipped : ""}`} key={day.date}>
                <div>
                  <time dateTime={day.date}>{day.label}</time>
                  <span>{day.skipped ? <><Check aria-hidden="true" size={14} /> Skipped</> : "Delivery scheduled"}</span>
                </div>
                <button
                  type="button"
                  disabled={!day.canChange || Boolean(busyDate)}
                  onClick={() => void changeDay(day)}
                  aria-label={`${day.skipped ? "Restore" : "Skip"} delivery on ${day.label}`}
                >
                  {busy ? "Saving…" : !day.canChange ? "Closed" : day.skipped ? "Restore" : "Skip day"}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {error ? <p className={s.deliveryError} role="alert">{error}</p> : null}
    </section>
  );
}
