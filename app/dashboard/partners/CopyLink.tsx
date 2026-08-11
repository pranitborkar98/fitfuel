"use client";

// app/dashboard/partners/CopyLink.tsx
// The clipboard is the only state left on the partner console.

import { useState } from "react";
import { C, label, ghostBtn } from "@/app/_app/theme";

export default function CopyLink({ link }: { link: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
    } catch {
      window.prompt("Copy this link", link);
      return;
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
      <button type="button" onClick={copy} style={ghostBtn(copied)}>
        {copied ? "Link copied" : "Copy link"}
      </button>
      <span
        role="status"
        aria-live="polite"
        style={label(12, { color: copied ? C.lime : "transparent" })}
      >
        {copied ? "On your clipboard" : ""}
      </span>
    </div>
  );
}
