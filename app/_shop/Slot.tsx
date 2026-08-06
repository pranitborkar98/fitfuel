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
// A dish slot falls back to its DishGlyph: the macro fingerprint drawn from
// that dish's own protein, carbs and fat. It is generated, it is never wrong
// about the food, and it is the same fallback /menu and the plates already use.
// Every other slot falls back to a recessed well — panel-2 with an inset
// hairline, nothing else. Silence, not wallpaper.

import Image from "next/image";

import DishGlyph from "@/app/_hp/DishGlyph";
import { C } from "./theme";

export type SlotMap = Record<string, string>;

export default function Slot({
  images,
  name,
  alt,
  dish,
  sizes = "(max-width: 860px) 50vw, 300px",
  priority = false,
}: {
  /** slug → public src, resolved on the server. */
  images: SlotMap;
  /** The slug to look up. */
  name: string;
  alt: string;
  /** Present when this slot is a dish, which gives it a real fallback. */
  dish?: { name: string; kcal: number; protein: number; carbs: number; fat: number };
  sizes?: string;
  priority?: boolean;
}) {
  const src = images[name];

  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        quality={75}
        priority={priority}
        /* Food keeps its colour and takes the one unified grade, per DESIGN.md
           section 5. People and places take the lime duotone, which is applied
           by the caller that knows which it is holding. */
        style={{ objectFit: "cover", filter: "saturate(1.06) contrast(1.07)" }}
      />
    );
  }

  if (dish && dish.kcal > 0) {
    return (
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          background: C.panel2,
          overflow: "hidden",
        }}
      >
        <DishGlyph
          name={dish.name}
          kcal={dish.kcal}
          protein={dish.protein}
          carbs={dish.carbs}
          fat={dish.fat}
          size={112}
        />
      </span>
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
