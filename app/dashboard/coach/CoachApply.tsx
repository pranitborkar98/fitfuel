"use client";

// app/dashboard/coach/CoachApply.tsx
//
// The Act layer's one control. The whole page is a server component except
// this, because this is the only part with state.
//
// The route is server-authoritative: it recomputes the recalibration from the
// user's own data and applies only its own recommendation, never a number sent
// from here. So this component posts an empty body on purpose and the figures
// it shows are for the reader, not for the server.

import { useRouter } from "next/navigation";
import { useState } from "react";
import { C, body, label, num, solidBtn, ghostBtn } from "@/app/_app/theme";

type State = "idle" | "saving" | "done" | "error";

export default function CoachApply({
  canApply,
  currentTarget,
  recommendedTarget,
  deltaKcal,
}: {
  canApply: boolean;
  currentTarget: number;
  recommendedTarget: number;
  deltaKcal: number;
}) {
  const router = useRouter();
  const [state, setState] = useState<State>("idle");
  const [message, setMessage] = useState("");
  const [confirming, setConfirming] = useState(false);

  const kcal = (n: number) => Math.round(n).toLocaleString("en-IN");

  async function apply() {
    setState("saving");
    setMessage("");
    try {
      const res = await fetch("/api/coach/recalibration/apply", { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.applied) {
        setState("error");
        setMessage(data?.reason || "That did not apply. Your target is unchanged.");
        return;
      }
      setState("done");
      setMessage(`Target is now ${kcal(data.newCalorieTarget ?? recommendedTarget)} kcal.`);
      setConfirming(false);
      router.refresh();
    } catch {
      setState("error");
      setMessage("Could not reach the server. Your target is unchanged.");
    }
  }

  if (!canApply) {
    return (
      <p style={body(13, { marginTop: 16, color: C.dim })}>
        No change to apply. Your target stays at{" "}
        <span style={num(13, { color: C.mute })}>{kcal(currentTarget)}</span> kcal.
      </p>
    );
  }

  if (state === "done") {
    return (
      <p
        role="status"
        aria-live="polite"
        style={{ ...body(13), marginTop: 16, color: C.lime, display: "flex", gap: 9, alignItems: "baseline" }}
      >
        <span style={num(12, { color: C.lime })}>APPLIED</span>
        <span style={{ color: C.ink }}>{message}</span>
      </p>
    );
  }

  return (
    <div style={{ marginTop: 18 }}>
      {!confirming ? (
        <button type="button" style={solidBtn()} onClick={() => setConfirming(true)}>
          Apply {deltaKcal > 0 ? "+" : ""}{kcal(deltaKcal)} kcal
        </button>
      ) : (
        <div style={{ border: `1px solid ${C.rule2}`, background: C.panel2, padding: "16px 16px 18px" }}>
          <span style={label(12, { display: "block", marginBottom: 9 })}>Confirm</span>
          <p style={body(14, { color: C.ink, maxWidth: "52ch" })}>
            This changes your daily target from{" "}
            <span style={num(14)}>{kcal(currentTarget)}</span> to{" "}
            <span style={num(14, { color: C.lime })}>{kcal(recommendedTarget)}</span> kcal, on your
            active plan and your profile. Tomorrow&apos;s meals are sized against the new number.
          </p>
          <div style={{ display: "flex", gap: 10, marginTop: 15, flexWrap: "wrap" }}>
            <button
              type="button"
              style={solidBtn({ opacity: state === "saving" ? 0.55 : 1 })}
              onClick={apply}
              disabled={state === "saving"}
            >
              {state === "saving" ? "Applying" : "Yes, apply it"}
            </button>
            <button
              type="button"
              style={ghostBtn(false)}
              onClick={() => { setConfirming(false); setState("idle"); setMessage(""); }}
              disabled={state === "saving"}
            >
              Keep {kcal(currentTarget)}
            </button>
          </div>
        </div>
      )}

      {state === "error" && (
        <p role="alert" style={{ ...body(13), marginTop: 12, color: C.ink,
                                 borderLeft: `2px solid ${C.danger}`, paddingLeft: 11 }}>
          <span style={num(12, { color: C.danger, display: "block", marginBottom: 3 })}>NOT APPLIED</span>
          {message}
        </p>
      )}
    </div>
  );
}
