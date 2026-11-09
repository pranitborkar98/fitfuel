"use client";

// app/_shop/Slot.tsx
//
// The prototype's <image-slot>, as it has to work on a real site.
//
// In the design tool a slot is a drop zone: you drag a JPEG onto it and a
// sidecar remembers it. Here the drop zone is public/images/, resolved at BUILD
// time by lib/site-images.ts on the server and handed down as a plain
// slug → src map, because this half of the shop is a client component and
// node:fs cannot cross that line.
//
// WHAT A SLOT DOES WHEN THE PHOTOGRAPH DOES NOT EXIST, which today is almost
// always: eight photographs exist against a hundred-odd slots. It does NOT
// render an empty grey box, and it does not borrow an unrelated stock shot —
// lib/site-images.ts explains at length why a doorstep illustrated with a bowl
// of vegetables is worse than no picture at all.
//
// A slot with no photograph falls back to a recessed well: panel-2 with an
// inset hairline, nothing else. Silence, not wallpaper. It used to fall back
// to a DishGlyph macro diagram for dishes; that branch was removed 2026-11-09
// (piece 6) because the sheet mounts this component on a surface where
// someone is choosing what to eat, and AGENTS.md bans a macro ring, a glyph
// or a typographic stand-in there. The small MacroSplit ring in the card body
// beside the name and price is a different question (piece 5, question 6, for
// the owner) and is untouched by this change.
//
// A photograph that EXISTS at build time but fails to load at runtime (a
// file dropped from the deploy, a bad cache) falls back to the same well via
// onError, never a broken-image icon.

import { useState } from "react";
import Image from "next/image";

import { C } from "./theme";

export type SlotMap = Record<string, string>;

export default function Slot({
  images,
  name,
  alt,
  sizes = "(max-width: 860px) 50vw, 300px",
  priority = false,
}: {
  /** slug → public src, resolved on the server. */
  images: SlotMap;
  /** The slug to look up. */
  name: string;
  alt: string;
  sizes?: string;
  priority?: boolean;
}) {
  /* A resolved src that fails to load at runtime renders the well, exactly as
     if no file existed. The state is per slot: one bad file must not blank
     every other photograph on the page. */
  const [failed, setFailed] = useState(false);
  const src = failed ? undefined : images[name];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={75}
        priority={priority}
        onError={() => setFailed(true)}
        /* Food keeps its colour and takes the one unified grade. People and
           places take the lime duotone, which is applied
           by the caller that knows which it is holding. */
        style={{ objectFit: "cover", filter: "saturate(1.06) contrast(1.07)" }}
      />
    );
  }

  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        background: C.panel2,
        border: `1px solid ${C.rule}`,
      }}
    />
  );
}
