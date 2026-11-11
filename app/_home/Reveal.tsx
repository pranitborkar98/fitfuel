"use client";

// app/_home/Reveal.tsx
//
// Scroll-reveal wrapper. This is a client island, but the content it wraps
// stays on the server: children are passed through as an already-rendered
// React node, so wrapping a section in <Reveal> does not pull that
// section's markup into the client bundle.

import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { EASE } from "./theme";

export default function Reveal({
  children, delay = 0, style,
}: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.75, ease: EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}
