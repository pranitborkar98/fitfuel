"use client";

// app/_shop/Sheet.tsx
//
// The bottom sheet the dish and plan panels rise in.
//
// The prototype draws the sheet and nothing else: a scrim, a panel, an X. That
// is fine in a prototype and not shippable, because the system makes
// the overlay contract part of the design rather than a later pass — "overlay
// menus lock body scroll, move focus in, trap it, and restore it". So all four
// live here once, and the two sheets that use it cannot get any of them wrong
// individually.
//
// Escape closes. Tab cycles inside. The scrim is a real button with a label, so
// the close affordance exists for a screen reader and not only for a mouse.
// Scroll lock restores the exact scrollbar width it removed, or the page behind
// jumps sideways every time a sheet opens.

import { useCallback, useEffect, useRef } from "react";

import { C } from "./theme";
import s from "./shop.module.css";

const FOCUSABLE =
  'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

export default function Sheet({
  onClose,
  labelledBy,
  children,
}: {
  onClose: () => void;
  labelledBy: string;
  children: React.ReactNode;
}) {
  const panel = useRef<HTMLDivElement | null>(null);
  const restoreTo = useRef<HTMLElement | null>(null);

  const trap = useCallback((e: KeyboardEvent) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab" || !panel.current) return;

    const items = Array.from(panel.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null || el === document.activeElement,
    );
    if (!items.length) return;

    const first = items[0]!;
    const last = items[items.length - 1]!;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }, [onClose]);

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;

    const body = document.body;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    /* Move focus in, synchronously. The effect runs after commit so the panel
       and its controls are in the document, and .focus() needs no layout.
       This was behind a requestAnimationFrame and that was a bug: rAF does not
       fire in a tab that is not compositing, so focus stayed on <body> and the
       trap below had nothing to trap. Never put a correctness step in rAF. */
    const target = panel.current?.querySelector<HTMLElement>(FOCUSABLE);
    (target ?? panel.current)?.focus();

    document.addEventListener("keydown", trap);
    return () => {
      document.removeEventListener("keydown", trap);
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      restoreTo.current?.focus?.();
    };
  }, [trap]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby={labelledBy}
      /* zIndex 60 put the dish sheet BELOW the app header (200) and the filter bar
             (199): the modal opened behind the chrome, with the page showing
             through it and the scrim dimming nothing above it. Overlays use the
             sheet tier. */
        style={{ position: "fixed", inset: 0, zIndex: 400, background: "rgba(3,3,3,0.72)", display: "flex", alignItems: "flex-end", justifyContent: "center" }}
    >
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "transparent", border: 0, cursor: "pointer" }}
      />
      <div
        ref={panel}
        tabIndex={-1}
        className={s.sheet}
        style={{ position: "relative", width: "100%", maxWidth: 480, maxHeight: "86%", overflowY: "auto", background: C.bg, borderTop: `1px solid ${C.rule2}`, outline: "none" }}
      >
        {children}
      </div>
    </div>
  );
}

/** The X. Square, hairline, and it says what it does. The prototype draws it
 *  at 38px; 44 is the touch minimum and this is the control that dismisses the
 *  sheet, so it takes the minimum rather than the drawing. */
export function SheetClose({ onClose }: { onClose: () => void }) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close"
      style={{ flex: "none", display: "grid", placeItems: "center", width: 44, height: 44, background: C.bg, border: `1px solid ${C.rule2}`, color: C.mute, cursor: "pointer" }}
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
        <path d="M18 6 6 18M6 6l12 12" />
      </svg>
    </button>
  );
}
