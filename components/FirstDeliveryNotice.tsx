"use client";

// components/FirstDeliveryNotice.tsx
//
// "When do I actually get food?" — answered at checkout, live, before paying.
//
// This is the customer-facing half of the 21:00 IST cutoff. The server half
// (lib/order-cutoff.ts, used by the two activation routes) decides the real
// start date; this component quotes the SAME functions, so the date shown here
// is by construction the date the kitchen will cook for. There is no second
// copy of the rule to drift.
//
// HYDRATION. The output depends on the current time, so a server-rendered
// value would not match the client's first paint. It renders the rule with no
// countdown until mounted, then fills in. That also means the static shell is
// still truthful if JS never runs.
//
// The countdown ticks once a second, and when it crosses the cutoff the whole
// notice flips to the next day on its own — a customer who sat on the page
// through 21:00 is never quoted a delivery date we cannot honour.

import { useSyncExternalStore } from "react";
import { Clock } from "lucide-react";

import {
  cutoffLabel,
  deliveryDateLabel,
  firstDeliveryDateFor,
  msUntilCutoff,
} from "@/lib/order-cutoff";

const T = {
  card: "#111111",
  border: "#1f1f1f",
  accent: "#84cc16",
  text: "#ffffff",
  muted: "#9a9a94",
};

/** "3h 12m" / "48m" / "51s" — coarse above an hour, precise near the wire. */
function countdown(ms: number): string {
  const total = Math.floor(ms / 1000);
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${String(s).padStart(2, "0")}s`;
  return `${s}s`;
}

/* IST calendar date of a UTC-midnight delivery stamp minus today's, in days.
   1 = tomorrow, 2 = the day after. Used only to choose the wording. */
function daysAway(delivery: Date, now: Date): number {
  const IST_OFFSET_MS = 330 * 60_000;
  const dayKey = (d: Date) => Math.floor((d.getTime() + IST_OFFSET_MS) / 86_400_000);
  return dayKey(delivery) - dayKey(now);
}

/* A one-second clock as an external store.
 *
 * useSyncExternalStore rather than useState-in-an-effect: the current time IS an
 * external, mutable source, and this is the API built for one. It also gives a
 * real server snapshot, so hydration is correct by construction instead of by a
 * null-check that happens to run in the right order. getSnapshot must return a
 * STABLE value between ticks — returning `Date.now()` directly would change on
 * every read and spin React forever — hence the module-level `tick`.
 *
 * One interval is shared by every mounted instance and is torn down when the
 * last one unmounts. */
let tick = 0;
const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  if (timer === null) {
    tick = Date.now();
    timer = setInterval(() => {
      tick = Date.now();
      listeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer !== null) {
      clearInterval(timer);
      timer = null;
    }
  };
}

const getSnapshot = () => tick;
/* 0 means "no clock yet" — the server, and the hydrating first paint, both
   render the plain rule rather than a countdown that cannot match. */
const getServerSnapshot = () => 0;

export default function FirstDeliveryNotice() {
  const tickMs = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const now = tickMs === 0 ? null : new Date(tickMs);

  const cutoff = cutoffLabel();

  let line: React.ReactNode;
  let urgent = false;

  if (!now) {
    // Pre-hydration and no-JS: the rule, which is always true.
    line = (
      <>
        Order by <strong style={{ color: T.accent }}>{cutoff}</strong> and your first
        delivery is the next morning by 8am.
      </>
    );
  } else {
    const delivery = firstDeliveryDateFor(now);
    const away = daysAway(delivery, now);
    const left = msUntilCutoff(now);
    // Under two hours is when "later tonight" stops being a safe assumption.
    urgent = away === 1 && left <= 2 * 3600_000;

    line =
      away <= 1 ? (
        <>
          Order within{" "}
          <strong style={{ color: T.accent, fontVariantNumeric: "tabular-nums" }}>
            {countdown(left)}
          </strong>{" "}
          and your first delivery is{" "}
          <strong style={{ color: T.text }}>tomorrow, {deliveryDateLabel(delivery)}</strong>, by
          8am.
        </>
      ) : (
        <>
          Tonight&rsquo;s {cutoff} cutoff has passed. Your first delivery is{" "}
          <strong style={{ color: T.text }}>{deliveryDateLabel(delivery)}</strong>, by 8am.
          You can still order now.
        </>
      );
  }

  return (
    <div
      role="status"
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        background: T.card,
        border: `1px solid ${urgent ? T.accent : T.border}`,
        borderRadius: 14,
        padding: "14px 16px",
        marginBottom: 20,
      }}
    >
      <Clock size={17} style={{ color: T.accent, flex: "none", marginTop: 2 }} aria-hidden="true" />
      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.55, color: T.muted }}>{line}</p>
    </div>
  );
}
