"use client";

// app/_home/CountUp.tsx — animates a number once it scrolls into view.

import { useState, useRef, useEffect } from "react";
import { useInView, useReducedMotion } from "framer-motion";

export default function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  // Start at the final value so the server-rendered HTML and the no-JS /
  // reduced-motion cases show the real number rather than a zero that a
  // crawler would read as the actual claim.
  const [v, setV] = useState(to);

  useEffect(() => {
    if (reduce) return;
    setV(0);
  }, [reduce]);

  useEffect(() => {
    if (!inView || reduce) return;
    let raf = 0;
    const s = performance.now();
    const tick = (n: number) => {
      const t = Math.min(1, (n - s) / 1400);
      setV(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);

  return <span ref={ref}>{Math.round(v).toLocaleString("en-IN")}{suffix}</span>;
}
