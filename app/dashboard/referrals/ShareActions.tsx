"use client";

// app/dashboard/referrals/ShareActions.tsx
//
// The only stateful part of the referrals screen: whether the link is on the
// clipboard. Everything else is server rendered, so this is deliberately small.
//
// The WhatsApp handoff is a plain link, not a brand colour. DESIGN.md §2 says
// the ramp is the only palette, so WhatsApp's green does not get to live here.
// The word carries the meaning, which §8 requires anyway.

import { useState } from "react";
import { C, label, ghostBtn, solidBtn } from "@/app/_app/theme";

export default function ShareActions({ link, code }: { link: string; code: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      // Clipboard is blocked in some in app browsers. Select it instead of
      // failing silently, so the link can still be taken by hand.
      window.prompt("Copy this link", link);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  const message =
    `Hey, I use FitFuel for meals and tracking. Use my code ${code} ` +
    `for ₹200 off your first plan: ${link}`;

  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <a
        href={`https://wa.me/?text=${encodeURIComponent(message)}`}
        target="_blank"
        rel="noopener"
        style={solidBtn({ textDecoration: "none" })}
      >
        Share on WhatsApp
      </a>
      <button type="button" onClick={copy} style={ghostBtn(copied)}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <span
        role="status"
        aria-live="polite"
        style={label(12, { alignSelf: "center", color: copied ? C.lime : "transparent" })}
      >
        {copied ? "On your clipboard" : ""}
      </span>
    </div>
  );
}
