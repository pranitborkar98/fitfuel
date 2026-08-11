"use client";

// app/dashboard/DeliveryConfirmCard.tsx
// Phase 15C-CONFIRM, the customer "received / report an issue" card.
//
// Self contained: it fetches the user's recent deliveries on mount and renders
// nothing if there are none. Confirming sets customerConfirmedAt, reporting an
// issue sets customerIssueNote, and both surface on the admin dispatch board.
//
// It stays a client component because it is embedded in the dashboard client
// and every part of it is stateful. What changed is the surface: it carried an
// amber, a green and a red, a decorative lime gradient across the top, and
// 35px buttons.

import { useEffect, useState } from "react";
import { C, body, label, section, solidBtn, ghostBtn, PANEL } from "@/app/_app/theme";

type Delivery = {
  id: string;
  deliveryDate: string;
  status: string;
  mealsIncluded: string[];
  deliveryWindow: string | null;
  deliveredAt: string | null;
  customerConfirmedAt: string | null;
  customerIssueNote: string | null;
};

function fmtDate(s: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short", day: "numeric", month: "short", timeZone: "UTC",
  }).format(new Date(s));
}

export default function DeliveryConfirmCard() {
  const [deliveries, setDeliveries] = useState<Delivery[] | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [issueFor, setIssueFor] = useState<string | null>(null);
  const [issueText, setIssueText] = useState("");
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    fetch("/api/user/deliveries")
      .then((r) => (r.ok ? r.json() : { deliveries: [] }))
      .then((d) => { if (alive) setDeliveries(d.deliveries ?? []); })
      .catch(() => { if (alive) setDeliveries([]); });
    return () => { alive = false; };
  }, []);

  async function act(deliveryId: string, action: "confirm" | "issue", note?: string) {
    setBusyId(deliveryId);
    setErr(null);
    try {
      const res = await fetch("/api/user/deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryId, action, note }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "That did not go through.");
      setDeliveries((prev) =>
        (prev ?? []).map((d) =>
          d.id === deliveryId
            ? {
                ...d,
                customerConfirmedAt: data.delivery?.customerConfirmedAt ?? d.customerConfirmedAt,
                customerIssueNote: data.delivery?.customerIssueNote ?? d.customerIssueNote,
              }
            : d,
        ),
      );
      setIssueFor(null);
      setIssueText("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "That did not go through.");
    } finally {
      setBusyId(null);
    }
  }

  if (!deliveries || deliveries.length === 0) return null;

  return (
    <section style={{ ...PANEL, marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between",
                    gap: 12, padding: "14px 16px", borderBottom: `1px solid ${C.rule}` }}>
        <h2 style={section()}>Recent deliveries</h2>
        <span style={label(12)}>{deliveries.length} in the last few days</span>
      </div>

      {err && (
        <p role="status" aria-live="polite"
           style={{ ...body(13, { color: C.danger }), padding: "12px 16px 0", margin: 0 }}>
          {err}
        </p>
      )}

      {deliveries.map((d) => {
        const confirmed = !!d.customerConfirmedAt;
        const reported = !!d.customerIssueNote;
        const busy = busyId === d.id;

        return (
          <div key={d.id} style={{ padding: "14px 16px", borderBottom: `1px solid ${C.rule}` }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between",
                          gap: 10, flexWrap: "wrap" }}>
              <div style={{ minWidth: 0 }}>
                <p style={body(14, { color: C.ink, margin: 0 })}>
                  {fmtDate(d.deliveryDate)}
                  {d.deliveryWindow
                    ? `, ${d.deliveryWindow === "EVENING" ? "evening" : "morning"}`
                    : ""}
                </p>
                <p style={body(13, { margin: "3px 0 0" })}>
                  {d.mealsIncluded?.length ? d.mealsIncluded.join(", ") : "Your meals"}
                </p>
              </div>
              {d.status === "OUT_FOR_DELIVERY" && !confirmed && !reported && (
                <span style={label(12, { color: C.lime })}>On the way</span>
              )}
            </div>

            {confirmed ? (
              <p style={{ ...label(12, { color: C.lime }), margin: "12px 0 0" }}>
                Received, thank you
              </p>
            ) : reported ? (
              <div style={{ marginTop: 12, borderLeft: `2px solid ${C.rule2}`, paddingLeft: 12 }}>
                <p style={label(12, { display: "block" })}>Issue reported, we are on it</p>
                <p style={body(13, { margin: "6px 0 0" })}>{d.customerIssueNote}</p>
              </div>
            ) : issueFor === d.id ? (
              <div style={{ marginTop: 12 }}>
                <label htmlFor={`issue-${d.id}`} style={label(12, { display: "block", marginBottom: 8 })}>
                  What went wrong
                </label>
                <textarea
                  id={`issue-${d.id}`}
                  value={issueText}
                  onChange={(e) => setIssueText(e.target.value)}
                  placeholder="A missing meal, a late drop, quality"
                  rows={3}
                  maxLength={500}
                  style={{
                    width: "100%", boxSizing: "border-box", background: C.bg, color: C.ink,
                    border: `1px solid ${C.rule2}`, padding: "10px 12px", fontSize: 14,
                    lineHeight: 1.55, resize: "vertical", fontFamily: "inherit", outline: "none",
                  }}
                />
                <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                  <button
                    type="button"
                    disabled={busy || !issueText.trim()}
                    onClick={() => act(d.id, "issue", issueText.trim())}
                    style={solidBtn({
                      opacity: busy || !issueText.trim() ? 0.55 : 1,
                      cursor: busy || !issueText.trim() ? "default" : "pointer",
                    })}
                  >
                    {busy ? "Sending" : "Submit issue"}
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => { setIssueFor(null); setIssueText(""); }}
                    style={ghostBtn()}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ display: "flex", gap: 8, marginTop: 12, flexWrap: "wrap" }}>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => act(d.id, "confirm")}
                  style={solidBtn({ opacity: busy ? 0.6 : 1, cursor: busy ? "default" : "pointer" })}
                >
                  {busy ? "Saving" : "Yes, received"}
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => { setIssueFor(d.id); setErr(null); }}
                  style={ghostBtn()}
                >
                  Report an issue
                </button>
              </div>
            )}
          </div>
        );
      })}
    </section>
  );
}
