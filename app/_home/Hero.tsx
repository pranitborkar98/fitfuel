"use client";

// app/_home/Hero.tsx
//
// Client island: owns the scroll-linked parallax on the background frame
// and the entrance animation on the headline. Everything below the fold is
// server-rendered.

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import Frame from "./Frame";
import { WRAP, RULE, LIME, INK, DIM, COND, EASE, huge, copy, tag } from "./theme";

export default function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  return (
    <section ref={ref} style={{ position: "relative", paddingTop: 68 }}>
      <div className="ff-hero-stage" style={{ position: "relative", minHeight: "min(94vh,940px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", inset: "-6% 0 0", y }}>
          <Frame src="/images/hero-bowl.jpg" alt="A FitFuel bowl of fresh vegetables, chickpeas and avocado" sizes="100vw" priority />
        </motion.div>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,7,.82) 0%, rgba(7,7,7,.34) 34%, rgba(7,7,7,.86) 76%, #070707 100%)" }} />

        <div style={{ ...WRAP, position: "relative", paddingBottom: "clamp(28px,4vw,52px)", paddingTop: 120 }}>
          <motion.h1
            initial={reduce ? undefined : { opacity: 0, y: 34 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            className="ff-hero-h1"
            style={huge("clamp(3.6rem,13.5vw,11.5rem)")}
          >
            We cook it.<br />We weigh it.<br /><span style={{ color: LIME }}>We track it.</span>
          </motion.h1>

          <div className="ff-2col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "clamp(20px,4vw,60px)", alignItems: "end", marginTop: "clamp(28px,4vw,48px)" }}>
            <p style={{ ...copy(16.5), maxWidth: "50ch" }}>
              Chef-cooked meals delivered across Pune, a full training and body-metrics app, and a supplement stack that matches your condition. One operating system for what you eat, burn and weigh.
            </p>
            {/* Trial is the primary action: it is the lowest-friction offer
                and the thing the whole page closes on. */}
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/plans?trial=true" className="ff-btn">Start trial day, Rs 400</Link>
              <Link href="/plans" className="ff-a">All plans <ArrowRight size={17} /></Link>
            </div>
          </div>
        </div>

        {/* readout welded to the bottom edge, square, not a floating card */}
        <div style={{ position: "relative", borderTop: `1px solid ${RULE}`, background: "rgba(7,7,7,.9)", backdropFilter: "blur(10px)" }}>
          <div style={{ ...WRAP, display: "flex", flexWrap: "wrap", alignItems: "center", gap: "clamp(18px,4vw,54px)", padding: "16px clamp(18px,4vw,56px)" }}>
            <span style={tag(LIME)}>Today, verified</span>
            {[["Intake", "1,842"], ["Burn", "410"], ["Net", "1,432"], ["Target", "1,450"]].map(([k, v], i) => (
              <span key={k} style={{ display: "inline-flex", alignItems: "baseline", gap: 9 }}>
                <span style={{ ...copy(13), color: DIM }}>{k}</span>
                <span style={{ fontFamily: COND, fontWeight: 900, fontSize: 27, color: i === 2 ? LIME : INK }}>{v}</span>
              </span>
            ))}
            <span className="ff-hide" style={{ ...copy(13), color: DIM, marginLeft: "auto" }}>Consistency 92 / 100</span>
          </div>
        </div>
      </div>
    </section>
  );
}
