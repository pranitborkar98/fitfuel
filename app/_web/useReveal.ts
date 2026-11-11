"use client";

// app/_web/useReveal.ts
//
// THE ENTRANCE SYSTEM FOR THE BANDS BELOW THE CATALOG.
//
// One hook, one IntersectionObserver, four opt-in attributes. A section marks
// what it wants and never touches an observer itself:
//
//   data-reveal="up|left|scale"  fade + travel in, staggered in fours
//   data-rail="100%"             a progress rail that grows to its own width
//   data-count="952"             a figure that counts up once, on arrival
//   data-tilt                    pointer-tracked parallax on a photo card
//
// FOUR THINGS THIS GETS RIGHT THAT THE OBVIOUS VERSION DOES NOT:
//
// 1. It bails ENTIRELY under prefers-reduced-motion — before anything is set to
//    opacity 0. A reveal system that hides content first and then checks is one
//    broken observer away from a blank page.
// 2. An element scrolled PAST between frames (a fast flick, or a restored
//    scroll position on reload) is shown immediately rather than left hidden.
//    That is the `boundingClientRect.top > 0` test.
// 3. A 4-second failsafe shows hidden items at or near the current viewport.
//    Farther content stays observed so a phone still gets motion on scroll.
// 4. Tilt attaches only on a fine pointer. A phone never runs any of it.
//
// The observed set is re-scanned after every render because the catalog above
// re-renders on each keystroke; a WeakSet keeps already-wired nodes from being
// wired twice without holding them alive.

import { useEffect, useRef } from "react";

const EASE = "cubic-bezier(.22,.61,.36,1)";
const TILT_TRANSITION = `transform 320ms ${EASE}, border-color 200ms ease`;

export function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root || typeof window.matchMedia !== "function") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const seen = {
      reveal: new WeakSet<Element>(),
      rail: new WeakSet<Element>(),
      count: new WeakSet<Element>(),
      tilt: new WeakSet<Element>(),
    };
    const cleanups: (() => void)[] = [];

    const countUp = (el: HTMLElement) => {
      const target = parseFloat(el.dataset.count ?? "");
      if (!isFinite(target)) return;
      const t0 = performance.now();
      const step = (t: number) => {
        const k = Math.min(1, (t - t0) / 900);
        const eased = 1 - Math.pow(1 - k, 3);
        el.textContent = Math.round(target * eased).toLocaleString("en-IN");
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const show = (el: HTMLElement, delay: number) => {
      io.unobserve(el);
      window.setTimeout(() => {
        el.style.transition = `opacity 620ms ${EASE}, transform 620ms ${EASE}`;
        el.style.opacity = "1";
        if (el.dataset.reveal) el.style.transform = "none";
        if (el.dataset.rail) el.style.width = el.dataset.rail;
        if (el.dataset.count) countUp(el);
        if (!el.hasAttribute("data-tilt")) {
          window.setTimeout(() => {
            el.style.removeProperty("transform");
            el.style.removeProperty("will-change");
          }, 700);
        }
      }, delay);
    };

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          const el = e.target as HTMLElement;
          /* top < 0 means it was scrolled past between frames — a fast flick or
             a restored scroll position must never leave content hidden. */
          if (!e.isIntersecting && e.boundingClientRect.top > 0) continue;
          show(el, e.isIntersecting ? parseFloat(el.dataset.revealDelay ?? "0") : 0);
        }
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.12 },
    );

    /* Last-resort net for the current reading area. Offscreen nodes remain
       observed, otherwise every mobile entrance would finish before the
       customer could scroll from the hero to the catalogue. */
    const failsafe = window.setTimeout(() => {
      root
        .querySelectorAll<HTMLElement>("[data-reveal],[data-rail],[data-count]")
        .forEach((el) => {
          const hidden = el.style.opacity === "0" || el.style.width === "0%";
          if (hidden && el.getBoundingClientRect().top < window.innerHeight * 1.5) {
            show(el, 0);
          }
        });
    }, 4000);

    const wire = () => {
      root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((el, i) => {
        if (seen.reveal.has(el)) return;
        seen.reveal.add(el);
        const dir = el.dataset.reveal;
        el.style.opacity = "0";
        el.style.transform =
          dir === "left"
            ? "translateX(-18px)"
            : dir === "scale"
              ? "scale(.965)"
              : "translateY(18px)";
        el.style.willChange = "opacity, transform";
        if (!el.dataset.revealDelay) el.dataset.revealDelay = String((i % 4) * 70);
        io.observe(el);
      });

      root.querySelectorAll<HTMLElement>("[data-rail]").forEach((el) => {
        if (seen.rail.has(el)) return;
        seen.rail.add(el);
        el.style.width = "0%";
        el.style.transition = `width 1400ms ${EASE}`;
        io.observe(el);
      });

      root.querySelectorAll<HTMLElement>("[data-count]").forEach((el) => {
        if (seen.count.has(el)) return;
        seen.count.add(el);
        io.observe(el);
      });

      /* Tilt is desktop-only: a coarse pointer gets the flat card. */
      if (!window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

      root.querySelectorAll<HTMLElement>("[data-tilt]").forEach((el) => {
        if (seen.tilt.has(el)) return;
        seen.tilt.add(el);
        const art = el.querySelector("img");
        /* MEASURED: every tilt card is also a reveal card, and show() writes
           `transition: opacity 620ms, transform 620ms` over whatever was there
           — so the pointer tilt inherited the entrance easing and trailed the
           cursor by half a second. The tilt timing is (re)claimed on the first
           pointer event after a reveal, once, behind a flag rather than a
           string compare on every pointermove. */
        let owned = false;
        const move = (ev: PointerEvent) => {
          /* Hovering a card that has not revealed yet reveals it — otherwise
             the pointer sits on an invisible target. */
          if (el.style.opacity === "0") {
            show(el, 0);
            owned = false;
          }
          if (!owned) {
            el.style.transition = TILT_TRANSITION;
            owned = true;
          }
          const r = el.getBoundingClientRect();
          if (!r.width || !r.height) return;
          const x = (ev.clientX - r.left) / r.width - 0.5;
          const y = (ev.clientY - r.top) / r.height - 0.5;
          el.style.transform =
            `perspective(900px) rotateX(${(-y * 5).toFixed(2)}deg)` +
            ` rotateY(${(x * 6).toFixed(2)}deg) translateY(-4px)`;
          if (art) {
            art.style.transform =
              `scale(1.07) translate(${(-x * 14).toFixed(1)}px,${(-y * 12).toFixed(1)}px)`;
          }
        };
        const leave = () => {
          el.style.transform = "perspective(900px) rotateX(0) rotateY(0) translateY(0)";
          if (art) art.style.transform = "scale(1) translate(0,0)";
        };
        el.style.transition = TILT_TRANSITION;
        el.style.transformStyle = "preserve-3d";
        if (art) art.style.transition = `transform 420ms ${EASE}`;
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        cleanups.push(() => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        });
      });

      /* Marks in the DOM that the effect engaged, so "is the motion live?" is a
         question the page can answer directly rather than one that needs a
         video of a scroll. */
      root.dataset.reveal_ = "on";
    };

    wire();
    /* The catalog above re-renders on every keystroke and the FAQ swaps its
       open panel, so new nodes appear after mount. Cheap: querySelectorAll over
       one subtree, and the WeakSets make re-wiring a no-op. */
    const mo = new MutationObserver(() => wire());
    mo.observe(root, { childList: true, subtree: true });

    return () => {
      mo.disconnect();
      io.disconnect();
      window.clearTimeout(failsafe);
      cleanups.forEach((f) => f());
      delete root.dataset.reveal_;
    };
  }, []);

  return ref;
}
