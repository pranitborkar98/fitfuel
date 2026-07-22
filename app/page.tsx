"use client";

import {
  useState,
  useRef,
  useEffect,
  type CSSProperties,
  type ReactNode,
} from "react";
import Link from "next/link";
import {
  motion,
  useReducedMotion,
  useInView,
  useScroll,
  useTransform,
} from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — "BEAST MODE" art direction
   Supersedes the flat Lab-Dossier direction per owner directive.
   Zero images: every visual is code-driven (canvas / SVG / CSS).
   Animated particle constellation, drifting aurora, count-up stats,
   cursor-spotlight cards, live readout. Lime on near-black. The mono
   + Barlow identity is kept; motion and light now do the heavy work.
   No em dashes.
══════════════════════════════════════════════════════════════════ */

const BG = "#070707";
const PANEL = "#0c0c0c";
const HAIR = "#1e1e1e";
const HAIR2 = "#2a2a2a";
const TXT = "#f5f5f4";
const MUTE = "#8a8a86";
const DIM = "#5a5a57";
const LIME = "#84cc16";
const LIME_LT = "#a3e635";

const BARLOW = "'Barlow Condensed','Arial Narrow',sans-serif";
const MONO =
  "ui-monospace,'SF Mono',SFMono-Regular,Menlo,'Cascadia Mono',Consolas,monospace";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: CSSProperties = {
  width: "100%",
  maxWidth: 1180,
  margin: "0 auto",
  padding: "0 clamp(20px,4vw,40px)",
};

const mono = (size = 11, color = DIM): CSSProperties => ({
  fontFamily: MONO,
  fontSize: size,
  letterSpacing: "0.14em",
  textTransform: "uppercase",
  color,
});
const display = (size: string): CSSProperties => ({
  fontFamily: BARLOW,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 0.92,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
  color: TXT,
  margin: 0,
});

/* ─────────────────────────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────────────────────────── */

function Reveal({
  children,
  delay = 0,
  y = 20,
  style,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  style?: CSSProperties;
}) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* Index header with a lime pulse dot + animated hairline draw */
function IndexHeader({
  n,
  label,
  right,
}: {
  n: string;
  label: string;
  right?: ReactNode;
}) {
  const reduce = useReducedMotion();
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 16,
        marginBottom: 44,
      }}
    >
      <span
        className="ff-dot"
        style={{
          width: 7,
          height: 7,
          borderRadius: "50%",
          background: LIME,
          boxShadow: `0 0 12px ${LIME}`,
          flexShrink: 0,
        }}
      />
      <span style={{ ...mono(11, LIME), letterSpacing: "0.18em" }}>[ {n} ]</span>
      <span style={mono(11, MUTE)}>{label}</span>
      <motion.span
        initial={reduce ? undefined : { scaleX: 0 }}
        whileInView={reduce ? undefined : { scaleX: 1 }}
        viewport={{ once: true, margin: "-40px" }}
        transition={{ duration: 0.9, ease: EASE }}
        style={{
          flex: 1,
          height: 1,
          transformOrigin: "left",
          background: `linear-gradient(90deg, ${HAIR2}, ${HAIR} 60%, transparent)`,
        }}
      />
      {right ? <span style={mono(11, DIM)}>{right}</span> : null}
    </div>
  );
}

/* Count-up number that fires when scrolled into view */
function CountUp({
  to,
  suffix = "",
  prefix = "",
  decimals = 0,
  duration = 1500,
  style,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  duration?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);

  useEffect(() => {
    if (!inView) return;
    if (reduce) {
      setVal(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setVal(to * eased);
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);

  const shown = val.toLocaleString("en-IN", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return (
    <span ref={ref} style={style}>
      {prefix}
      {shown}
      {suffix}
    </span>
  );
}

/* Card that tracks the cursor and shows a soft lime spotlight + lift */
function SpotlightCard({
  children,
  style,
  className = "",
  as = "div",
  href,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  as?: "div" | "link";
  href?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
  };
  const inner = (
    <div
      ref={ref}
      onMouseMove={onMove}
      className={`ff-spot ${className}`}
      style={{ position: "relative", overflow: "hidden", ...style }}
    >
      <span className="ff-spot-glow" aria-hidden />
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        {children}
      </div>
    </div>
  );
  if (as === "link" && href) {
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        {inner}
      </Link>
    );
  }
  return inner;
}

/* ─────────────────────────────────────────────────────────────────
   HERO BACKDROP — animated particle constellation on <canvas>
───────────────────────────────────────────────────────────────── */
function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };

    type P = { x: number; y: number; vx: number; vy: number };
    let pts: P[] = [];

    const build = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth;
      h = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.min(90, Math.max(34, Math.floor((w * h) / 16000)));
      pts = Array.from({ length: density }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const LINK = 130;
      for (let i = 0; i < pts.length; i++) {
        const p = pts[i];
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;

        // gentle pull toward cursor
        const dxm = mouse.x - p.x;
        const dym = mouse.y - p.y;
        const dm = Math.hypot(dxm, dym);
        if (dm < 160) {
          p.x += (dxm / dm) * 0.4;
          p.y += (dym / dm) * 0.4;
        }
      }
      // links
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i];
          const b = pts[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            const o = (1 - d / LINK) * 0.5;
            ctx.strokeStyle = `rgba(132,204,22,${o})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      // nodes
      for (const p of pts) {
        const near = Math.hypot(mouse.x - p.x, mouse.y - p.y) < 160;
        ctx.beginPath();
        ctx.arc(p.x, p.y, near ? 2.4 : 1.5, 0, Math.PI * 2);
        ctx.fillStyle = near
          ? "rgba(163,230,53,0.95)"
          : "rgba(132,204,22,0.55)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };

    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left;
      mouse.y = e.clientY - r.top;
    };
    const onLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
    };

    build();
    draw();
    window.addEventListener("resize", build);
    window.addEventListener("mousemove", onMove);
    canvas.parentElement?.addEventListener("mouseleave", onLeave);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", build);
      window.removeEventListener("mousemove", onMove);
      canvas.parentElement?.removeEventListener("mouseleave", onLeave);
    };
  }, [reduce]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        opacity: 0.9,
        pointerEvents: "none",
      }}
    />
  );
}

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const GOALS = [
  { key: "weight-loss", label: "Lose fat", note: "Deficit, keeps muscle" },
  { key: "muscle-gain", label: "Build muscle", note: "High-protein surplus" },
  { key: "balanced", label: "Eat balanced", note: "Clean maintenance" },
];
const DIETS = [
  { key: "veg", label: "Veg" },
  { key: "egg", label: "Egg" },
  { key: "non-veg", label: "Non-Veg" },
  { key: "jain", label: "Jain" },
];
const GOAL_NAME: Record<string, string> = {
  "weight-loss": "Weight Loss",
  "muscle-gain": "Muscle Gain",
  balanced: "Balanced",
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div
      style={{
        background: BG,
        color: TXT,
        fontFamily: "Inter, system-ui, sans-serif",
        overflowX: "hidden",
        position: "relative",
      }}
    >
      <Hero />
      <StatBand />
      <Moat />
      <Loop />
      <Verified />
      <Instrumentation />
      <Products />
      <Coach />
      <Membership />
      <BuiltFor />
      <Franchise />
      <Finder />
      <Referral />
      <Roadmap />
      <FieldReports />
      <Kitchen />
      <Cta />

      <style>{`
        @keyframes ff-tick { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ff-ticker { animation: ff-tick 55s linear infinite; }
        .ff-ticker:hover { animation-play-state: paused; }

        @keyframes ff-pulse { 0%,100% { opacity: 1; transform: scale(1); } 50% { opacity: .45; transform: scale(.82); } }
        .ff-dot { animation: ff-pulse 2.4s ease-in-out infinite; }

        @keyframes ff-drift1 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(6%, -4%) scale(1.12); } }
        @keyframes ff-drift2 { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(-7%, 5%) scale(1.08); } }
        .ff-aurora-1 { animation: ff-drift1 18s ease-in-out infinite; }
        .ff-aurora-2 { animation: ff-drift2 22s ease-in-out infinite; }

        @keyframes ff-bar { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(.35); } }

        .ff-row { transition: background .18s ease, box-shadow .18s ease; }
        .ff-row:hover { background: #0b0b0b; box-shadow: inset 3px 0 0 ${LIME}; }

        .ff-link { color: ${LIME_LT}; text-decoration: none; border-bottom: 1px solid ${HAIR2}; padding-bottom: 2px; transition: border-color .2s, color .2s; }
        .ff-link:hover { border-color: ${LIME}; color: #fff; }

        .ff-cta { position: relative; overflow: hidden; transition: transform .2s ease, box-shadow .25s ease, background .2s; box-shadow: 0 0 0 rgba(132,204,22,0); }
        .ff-cta:hover { background: ${LIME_LT} !important; transform: translateY(-2px); box-shadow: 0 10px 34px rgba(132,204,22,.42); }
        .ff-cta::after { content:""; position:absolute; top:0; left:-120%; width:60%; height:100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); transform: skewX(-18deg); transition: left .55s ease; }
        .ff-cta:hover::after { left: 130%; }

        .ff-spot { transition: transform .3s cubic-bezier(.16,1,.3,1), border-color .3s; }
        .ff-spot:hover { transform: translateY(-4px); border-color: rgba(132,204,22,.4) !important; }
        .ff-spot-glow { position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .3s; background: radial-gradient(420px circle at var(--mx,50%) var(--my,50%), rgba(132,204,22,.14), transparent 45%); z-index:0; }
        .ff-spot:hover .ff-spot-glow { opacity:1; }

        .ff-goal:hover, .ff-diet:hover { border-color: ${HAIR2} !important; }

        .ff-gradborder { position: relative; }
        .ff-gradborder::before { content:""; position:absolute; inset:0; padding:1px; border-radius: inherit;
          background: linear-gradient(180deg, rgba(132,204,22,.35), transparent 40%); -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite: xor; mask-composite: exclude; pointer-events:none; }

        @media (max-width: 860px){ .ff-hero-grid{ grid-template-columns: 1fr !important; } }
        @media (max-width: 820px){ .ff-verify-grid{ grid-template-columns: 1fr !important; } }
        @media (max-width: 760px){ .ff-bf-desc{ display:none !important; } }

        @media (prefers-reduced-motion: reduce) {
          .ff-ticker, .ff-dot, .ff-aurora-1, .ff-aurora-2 { animation: none !important; }
          .ff-cta::after { display:none; }
        }
      `}</style>
    </div>
  );
}

/* ═══ HERO ═══ */
function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });
  const yHead = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -60]);
  const oHead = useTransform(scrollYProgress, [0, 0.8], [1, reduce ? 1 : 0.15]);

  const meta = ["FITFUEL", "VERIFIED-INTAKE HEALTH OS", "PUNE · IN", "EST. 2019"];

  return (
    <section
      ref={ref}
      style={{ paddingTop: 68, position: "relative", isolation: "isolate" }}
    >
      {/* backdrop layers */}
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          overflow: "hidden",
          zIndex: 0,
          pointerEvents: "none",
        }}
      >
        {/* aurora blobs */}
        <div
          className="ff-aurora-1"
          style={{
            position: "absolute",
            top: "-18%",
            left: "8%",
            width: 560,
            height: 560,
            background:
              "radial-gradient(circle, rgba(132,204,22,0.16), transparent 62%)",
            filter: "blur(30px)",
          }}
        />
        <div
          className="ff-aurora-2"
          style={{
            position: "absolute",
            top: "6%",
            right: "-6%",
            width: 520,
            height: 520,
            background:
              "radial-gradient(circle, rgba(56,189,248,0.09), transparent 62%)",
            filter: "blur(34px)",
          }}
        />
        {/* grid + constellation */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${HAIR} 1px, transparent 1px), linear-gradient(90deg, ${HAIR} 1px, transparent 1px)`,
            backgroundSize: "64px 64px",
            opacity: 0.35,
            maskImage:
              "radial-gradient(ellipse 90% 70% at 50% 30%, #000 20%, transparent 75%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 90% 70% at 50% 30%, #000 20%, transparent 75%)",
          }}
        />
        <Constellation />
        {/* bottom fade into page */}
        <div
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 200,
            background: `linear-gradient(180deg, transparent, ${BG})`,
          }}
        />
      </div>

      {/* masthead meta strip */}
      <div style={{ borderBottom: `1px solid ${HAIR}`, position: "relative", zIndex: 1 }}>
        <div
          style={{
            ...WRAP,
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: 8,
            padding: "13px clamp(20px,4vw,40px)",
          }}
        >
          {meta.map((m, i) => (
            <span key={m} style={mono(10.5, i === 0 ? TXT : DIM)}>
              {m}
            </span>
          ))}
        </div>
      </div>

      <div
        style={{
          ...WRAP,
          position: "relative",
          zIndex: 1,
          paddingTop: "clamp(56px,9vw,100px)",
          paddingBottom: "clamp(44px,6vw,80px)",
        }}
      >
        <div
          className="ff-hero-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "minmax(0,1.5fr) minmax(0,1fr)",
            gap: "clamp(32px,5vw,64px)",
            alignItems: "end",
          }}
        >
          <motion.div style={{ y: yHead, opacity: oHead }}>
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 14 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
            >
              <span
                style={{
                  ...mono(11, LIME),
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 9,
                  border: `1px solid ${HAIR2}`,
                  padding: "6px 12px",
                  borderRadius: 999,
                  marginBottom: 26,
                }}
              >
                <span
                  className="ff-dot"
                  style={{
                    width: 6,
                    height: 6,
                    borderRadius: "50%",
                    background: LIME,
                    boxShadow: `0 0 10px ${LIME}`,
                  }}
                />
                001 / THE THESIS
              </span>
            </motion.div>

            <h1 style={display("clamp(3rem,8.4vw,6.8rem)")}>
              <HeroLine text="We don't guess" i={0} />
              <HeroLine text="what you ate." i={1} />
              <HeroLine text="We cooked it." i={2} lime />
            </h1>

            <motion.p
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.35 }}
              style={{
                fontSize: "clamp(1rem,1.6vw,1.18rem)",
                color: MUTE,
                lineHeight: 1.6,
                maxWidth: "48ch",
                marginTop: 28,
              }}
            >
              Every app asks you to log your food and trusts you to be honest.
              FitFuel cooks each meal in its own Pune kitchen, tracks the macros
              to the gram, and recalibrates when you plateau. Intake you can
              verify, not a number you typed in.
            </motion.p>

            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 16 }}
              whileInView={reduce ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, ease: EASE, delay: 0.5 }}
              style={{
                display: "flex",
                gap: 20,
                alignItems: "center",
                flexWrap: "wrap",
                marginTop: 36,
              }}
            >
              <Link
                href="/plans"
                className="ff-cta"
                style={{
                  fontFamily: MONO,
                  fontSize: 12,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  fontWeight: 700,
                  background: LIME,
                  color: "#000",
                  textDecoration: "none",
                  padding: "15px 24px",
                  borderRadius: 8,
                }}
              >
                Explore 126 plans
              </Link>
              <a href="#loop" className="ff-link" style={{ ...mono(12, LIME_LT) }}>
                See the system ↓
              </a>
            </motion.div>
          </motion.div>

          {/* live readout instrument */}
          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 24, scale: 0.98 }}
            animate={reduce ? undefined : { opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            <Readout />
          </motion.div>
        </div>
      </div>

      <Ticker />
    </section>
  );
}

function HeroLine({ text, i, lime }: { text: string; i: number; lime?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      style={{ display: "block", color: lime ? LIME : TXT }}
      initial={reduce ? undefined : { opacity: 0, y: 28 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.75, ease: EASE, delay: 0.12 + i * 0.12 }}
    >
      {text}
    </motion.span>
  );
}

function Readout() {
  const reduce = useReducedMotion();
  const rows = [
    { k: "Intake", v: 1842, u: "kcal", bars: 9 },
    { k: "Burn", v: 410, u: "kcal", bars: 3 },
  ];
  return (
    <SpotlightCard
      className="ff-gradborder"
      style={{
        border: `1px solid ${HAIR2}`,
        background: `linear-gradient(180deg, ${PANEL}, #090909)`,
        borderRadius: 14,
        boxShadow: "0 24px 60px rgba(0,0,0,.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "13px 16px",
          borderBottom: `1px solid ${HAIR}`,
        }}
      >
        <span style={mono(10.5, MUTE)}>Daily Readout</span>
        <span
          style={{
            ...mono(10, LIME_LT),
            display: "inline-flex",
            alignItems: "center",
            gap: 7,
          }}
        >
          <span
            className="ff-dot"
            style={{ width: 6, height: 6, borderRadius: "50%", background: LIME }}
          />
          Live
        </span>
      </div>
      <div style={{ padding: "6px 16px" }}>
        {rows.map((r) => (
          <div
            key={r.k}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 0",
              borderBottom: `1px solid ${HAIR}`,
            }}
          >
            <span style={mono(11, MUTE)}>{r.k}</span>
            <span style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ display: "flex", gap: 2 }}>
                {[...Array(10)].map((_, i) => (
                  <span
                    key={i}
                    style={{
                      width: 3,
                      height: 14,
                      transformOrigin: "bottom",
                      background: i < r.bars ? LIME : "#161616",
                      animation:
                        reduce || i >= r.bars
                          ? "none"
                          : `ff-bar ${1.6 + (i % 3) * 0.25}s ease-in-out ${
                              i * 0.08
                            }s infinite`,
                    }}
                  />
                ))}
              </span>
              <span
                style={{
                  fontFamily: BARLOW,
                  fontWeight: 800,
                  fontSize: 22,
                  color: TXT,
                  minWidth: 62,
                  textAlign: "right",
                }}
              >
                <CountUp to={r.v} />
              </span>
              <span style={mono(9.5, DIM)}>{r.u}</span>
            </span>
          </div>
        ))}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "18px 0 15px",
          }}
        >
          <span style={mono(11, LIME_LT)}>Net</span>
          <span style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
            <span
              style={{
                fontFamily: BARLOW,
                fontWeight: 900,
                fontSize: 42,
                color: LIME,
                lineHeight: 1,
                textShadow: "0 0 26px rgba(132,204,22,.4)",
              }}
            >
              <CountUp to={1432} />
            </span>
            <span style={mono(10, DIM)}>/ 1,450 kcal</span>
          </span>
        </div>
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "12px 16px",
          borderTop: `1px solid ${HAIR}`,
        }}
      >
        <span style={mono(10, DIM)}>Consistency</span>
        <span style={mono(10, MUTE)}>
          <CountUp to={92} /> / 100
        </span>
      </div>
    </SpotlightCard>
  );
}

function Ticker() {
  const items = [
    "Weight Loss", "Muscle Gain", "PCOS", "Diabetic", "Thyroid", "Heart",
    "Gut Health", "Fertility", "Anti-Aging", "Cricket", "Keto Indian",
    "Hair Health", "Hypertension", "Endurance", "Quit Smoking", "Jain",
    "Anaemia", "Fatty Liver",
  ];
  const row = [...items, ...items];
  return (
    <div
      style={{
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
        overflow: "hidden",
        background: "#050505",
        position: "relative",
        zIndex: 1,
      }}
    >
      <div
        className="ff-ticker"
        style={{ display: "flex", gap: 0, width: "max-content", padding: "12px 0" }}
      >
        {row.map((it, i) => (
          <span
            key={i}
            style={{
              ...mono(10.5, i % 6 === 0 ? MUTE : DIM),
              padding: "0 22px",
              borderRight: `1px solid ${HAIR}`,
              whiteSpace: "nowrap",
              display: "inline-flex",
              alignItems: "center",
              gap: 10,
            }}
          >
            <span
              style={{
                width: 4,
                height: 4,
                borderRadius: "50%",
                background: i % 6 === 0 ? LIME : "#333",
              }}
            />
            {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══ STAT BAND (new) ═══ */
function StatBand() {
  const stats: [ReactNode, string][] = [
    [<CountUp key="a" to={126} />, "Goal + condition plans"],
    [<CountUp key="b" to={800} suffix="+" />, "Exercises in the library"],
    [<><CountUp to={4} />:<span style={{ fontFamily: BARLOW }}>00</span></>, "Kitchen fires up, daily"],
    [<CountUp key="d" to={100} suffix="%" />, "Macros measured, not typed"],
  ];
  return (
    <section style={{ borderBottom: `1px solid ${HAIR}` }}>
      <div
        style={{
          ...WRAP,
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))",
        }}
      >
        {stats.map(([v, l], i) => (
          <Reveal
            key={i}
            delay={i * 0.06}
            style={{
              padding: "clamp(28px,4vw,44px) 4px",
              borderLeft: i === 0 ? "none" : `1px solid ${HAIR}`,
            }}
          >
            <div
              style={{
                fontFamily: BARLOW,
                fontWeight: 900,
                fontSize: "clamp(2.4rem,5vw,3.6rem)",
                color: TXT,
                lineHeight: 1,
                display: "flex",
                alignItems: "baseline",
              }}
            >
              {v}
            </div>
            <div style={{ ...mono(10.5, DIM), marginTop: 12 }}>{l}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══ 002 THE MOAT ═══ */
function Moat() {
  const rows = [
    { who: "Tiffin service", owns: "Cooks the food", miss: "No macros. No tracking. No idea if it moved you." },
    { who: "Fitness app", owns: "Tracks the numbers", miss: "You self-report. Honest logging is a guess." },
    { who: "Supplement brand", owns: "Sells the pills", miss: "No plan, no context, no link to your food." },
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="002" label="The Moat" right="Verified intake" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "18ch" }}>
            The meal is the door. The <span style={{ color: LIME }}>data loop</span> is the product.
          </h2>
        </Reveal>
        <Reveal delay={0.08} style={{ marginTop: 48 }}>
          <div style={{ border: `1px solid ${HAIR}`, borderRadius: 14, overflow: "hidden" }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "minmax(120px,1fr) minmax(120px,1fr) minmax(0,2fr)",
                ...mono(10, DIM),
                background: "#050505",
                borderBottom: `1px solid ${HAIR}`,
              }}
            >
              <span style={{ padding: "12px 18px" }}>Category</span>
              <span style={{ padding: "12px 18px" }}>Owns</span>
              <span style={{ padding: "12px 18px" }}>What it misses</span>
            </div>
            {rows.map((r) => (
              <div
                key={r.who}
                className="ff-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(120px,1fr) minmax(120px,1fr) minmax(0,2fr)",
                  borderBottom: `1px solid ${HAIR}`,
                }}
              >
                <span style={{ padding: "20px 18px", fontFamily: BARLOW, fontWeight: 700, fontSize: 19, textTransform: "uppercase", color: TXT }}>{r.who}</span>
                <span style={{ padding: "20px 18px", fontSize: 14, color: MUTE, alignSelf: "center" }}>{r.owns}</span>
                <span style={{ padding: "20px 18px", fontSize: 14, color: MUTE, alignSelf: "center" }}>{r.miss}</span>
              </div>
            ))}
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                padding: "22px 18px",
                background: "linear-gradient(90deg, rgba(132,204,22,0.08), transparent)",
              }}
            >
              <span style={mono(11, LIME)}>FitFuel</span>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.1rem,2.4vw,1.7rem)", textTransform: "uppercase", color: TXT }}>Runs all three as one system.</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 003 THE DAILY LOOP ═══ */
function Loop() {
  const steps = [
    ["Onboard", "Body, goal, diet and condition. We compute exact calories and macros (Mifflin-St Jeor)."],
    ["Cook", "Your plan is cooked fresh in our Pune kitchen from 04:00, portioned to your macros."],
    ["Deliver", "Hot at your door by 08:00, six days a week. Tracked kitchen to doorstep."],
    ["Log", "Tap 'I ate this'. It auto-writes to your diary with measured macros. Nothing to count."],
    ["Train", "A workout linked to your plan, not random. Burned calories feed the net-calorie ring."],
    ["Weigh in", "Weekly weigh-in trends your weight. Flat for two weeks flags a plateau automatically."],
    ["Recalibrate", "Plateau detected. Target drops, the plan adapts. It changes as your body changes."],
    ["Score", "Meals, workouts, water and weigh-ins roll into a 0 to 100 consistency score."],
  ];
  return (
    <section
      id="loop"
      style={{
        padding: "clamp(72px,10vw,120px) 0",
        background: "#050505",
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
        scrollMarginTop: 70,
      }}
    >
      <div style={WRAP}>
        <IndexHeader n="003" label="The Daily Loop" right="Runs every day" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "16ch", marginBottom: 44 }}>The engine that runs every single day</h2>
        </Reveal>
        <div>
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 4) * 0.04}>
              <div
                className="ff-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "56px minmax(120px,220px) minmax(0,1fr)",
                  gap: "clamp(10px,2vw,28px)",
                  alignItems: "baseline",
                  padding: "22px 8px",
                  borderTop: `1px solid ${HAIR}`,
                }}
              >
                <span style={{ ...mono(13, LIME), textShadow: "0 0 14px rgba(132,204,22,.4)" }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.3rem,2.6vw,1.8rem)", textTransform: "uppercase", color: TXT }}>{t}</span>
                <span style={{ fontSize: 14.5, color: MUTE, lineHeight: 1.55 }}>{d}</span>
              </div>
            </Reveal>
          ))}
          <div style={{ borderTop: `1px solid ${HAIR}`, paddingTop: 22 }}>
            <span style={mono(12, DIM)}>↻ Then it repeats, sharper every week.</span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 004 VERIFIED VS SELF-REPORTED ═══ */
function Verified() {
  const cols = ["Tiffin", "App", "Supp.", "FitFuel"];
  const rows: [string, boolean[]][] = [
    ["Cooks your food fresh, daily", [true, false, false, true]],
    ["Tracks every gram automatically", [false, false, false, true]],
    ["Adapts targets on a plateau", [false, false, false, true]],
    ["126 condition-specific plans", [false, false, false, true]],
    ["Consistency score on real data", [false, false, false, true]],
    ["Coaches on what actually happened", [false, false, false, true]],
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="004" label="Verified vs Self-Reported" />
        <div
          className="ff-verify-grid"
          style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.3fr)", gap: "clamp(28px,5vw,60px)", alignItems: "start" }}
        >
          <Reveal>
            <h2 style={{ ...display("clamp(2rem,4.6vw,3.4rem)"), maxWidth: "14ch" }}>Measured, not typed in</h2>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginTop: 22, maxWidth: "42ch" }}>
              When we cook every meal, the macros are measured. That closed loop is the one thing a tiffin, an app or a supplement brand cannot copy. The moat is not software. It is owning the plate.
            </p>
            <a href="/how-it-works" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block", marginTop: 24 }}>Read the method →</a>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ border: `1px solid ${HAIR}`, borderRadius: 14, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) repeat(4, minmax(40px,1fr))", background: "#050505", borderBottom: `1px solid ${HAIR}` }}>
                <span />
                {cols.map((c, i) => (
                  <span key={c} style={{ ...mono(9.5, i === 3 ? "#000" : DIM), padding: "13px 4px", textAlign: "center", background: i === 3 ? LIME : "transparent", fontWeight: i === 3 ? 700 : 400 }}>{c}</span>
                ))}
              </div>
              {rows.map(([label, marks], ri) => (
                <div key={label} className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) repeat(4, minmax(40px,1fr))", borderBottom: ri < rows.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <span style={{ padding: "15px 14px", fontSize: 13, color: MUTE }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "15px 4px", textAlign: "center", ...mono(13, m ? (ci === 3 ? LIME : MUTE) : "#333"), background: ci === 3 ? "rgba(132,204,22,0.06)" : "transparent", textShadow: m && ci === 3 ? "0 0 12px rgba(132,204,22,.5)" : "none" }}>{m ? "✓" : "·"}</span>
                  ))}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ 005 INSTRUMENTATION ═══ */
function Instrumentation() {
  const tools: [string, string, string][] = [
    ["IN-01", "Meal logging", "Tap 'I ate this'. Auto-writes to your diary with exact macros."],
    ["IN-02", "Net-calorie engine", "Calories in, minus calories burned, against your target. One live ring."],
    ["IN-03", "Water intake", "Log every glass, hit your daily hydration goal beside your food."],
    ["IN-04", "Today's workout", "A session linked to your plan type, not a random routine."],
    ["IN-05", "Workout logger", "Sets, reps and weight from an 800+ exercise library. Burn feeds the ring."],
    ["IN-06", "Body metrics", "Weight, body fat, muscle, BMI and more, trended over time."],
    ["IN-07", "Progress charts", "Weight trend, macro history and consistency. Plateaus surface early."],
    ["IN-08", "Consistency score", "One 0 to 100 signal that drives your recalibration."],
    ["IN-09", "Coach + digest", "Morning preview, evening recap, and a Sunday digest of your week."],
  ];
  return (
    <section
      style={{
        padding: "clamp(72px,10vw,120px) 0",
        background: "#050505",
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <div style={WRAP}>
        <IndexHeader n="005" label="Instrumentation" right="Inside the app" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "18ch", marginBottom: 12 }}>Every gram, every rep, every glass. Tracked.</h2>
          <p style={{ fontSize: 15, color: MUTE, maxWidth: "52ch", lineHeight: 1.6, marginBottom: 44 }}>Your meals come with a full health app. Not a step counter bolted on, but a connected system where food, movement, water and weight feed one another.</p>
        </Reveal>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))",
            borderTop: `1px solid ${HAIR}`,
            borderLeft: `1px solid ${HAIR}`,
          }}
        >
          {tools.map(([code, t, d], i) => (
            <Reveal key={code} delay={(i % 3) * 0.05}>
              <SpotlightCard
                style={{
                  padding: "26px 24px",
                  borderRight: `1px solid ${HAIR}`,
                  borderBottom: `1px solid ${HAIR}`,
                  height: "100%",
                  background: "transparent",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 18 }}>
                  <span style={mono(11, DIM)}>{code}</span>
                  <span style={{ width: 6, height: 6, borderRadius: "50%", background: LIME, boxShadow: `0 0 10px ${LIME}` }} />
                </div>
                <span style={{ display: "block", fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.3rem,2.4vw,1.7rem)", textTransform: "uppercase", color: TXT, marginBottom: 10 }}>{t}</span>
                <span style={{ fontSize: 14, color: MUTE, lineHeight: 1.55 }}>{d}</span>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 30 }}>
          <a href="/how-it-works" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block" }}>See the full system →</a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 006 THREE PRODUCTS ═══ */
function Products() {
  const p = [
    { n: "01", t: "The kitchen", tag: "MEALS", specs: ["126 goal + condition plans", "Chef-cooked, macro-portioned", "Delivered daily across Pune"], href: "/plans", cta: "Meal plans" },
    { n: "02", t: "The app", tag: "MOVEMENT", specs: ["800+ exercise library", "Net-calorie + body metrics", "Progress + consistency"], href: "/how-it-works", cta: "Inside the app" },
    { n: "03", t: "The stack", tag: "NUTRABAY", specs: ["Condition-matched doses", "Educational, not a wall of pills", "Ordered via Nutrabay"], href: "/supplements", cta: "Supplements" },
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="006" label="Three Products, One System" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {p.map((x, i) => (
            <Reveal key={x.t} delay={i * 0.08}>
              <SpotlightCard
                as="link"
                href={x.href}
                className="ff-gradborder"
                style={{
                  display: "block",
                  padding: "30px 26px",
                  border: `1px solid ${HAIR}`,
                  borderRadius: 16,
                  background: `linear-gradient(180deg, ${PANEL}, #090909)`,
                  height: "100%",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
                  <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 26, color: DIM }}>{x.n}</span>
                  <span style={mono(10, LIME_LT)}>{x.tag}</span>
                </div>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.9rem,3vw,2.5rem)", textTransform: "uppercase", color: TXT, margin: "0 0 22px" }}>{x.t}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 26 }}>
                  {x.specs.map((s) => (
                    <div key={s} style={{ display: "flex", gap: 11, alignItems: "baseline" }}>
                      <span style={{ width: 5, height: 5, background: LIME, flexShrink: 0, transform: "translateY(-2px)", boxShadow: `0 0 8px ${LIME}` }} />
                      <span style={{ fontSize: 13.5, color: MUTE }}>{s}</span>
                    </div>
                  ))}
                </div>
                <span style={{ ...mono(11, LIME_LT), display: "inline-flex", alignItems: "center", gap: 6 }}>{x.cta} <ArrowUpRight size={13} /></span>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 007 THE COACH ═══ */
function Coach() {
  return (
    <section
      style={{
        padding: "clamp(72px,10vw,120px) 0",
        background: "#050505",
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <div style={WRAP}>
        <IndexHeader n="007" label="The Coach" right="Luxury · in development" />
        <div className="ff-verify-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: "clamp(28px,5vw,60px)", alignItems: "start" }}>
          <Reveal>
            <h2 style={{ ...display("clamp(2rem,4.6vw,3.4rem)"), maxWidth: "16ch" }}>An AI trainer that watched every rep and every meal</h2>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginTop: 22, maxWidth: "46ch" }}>
              Not a chatbot you have to explain yourself to. The system already logged 30 days of your meals, workouts and weigh-ins, so the coach knows where you slipped and what to fix, and it talks to you daily like a trainer who was there for all of it.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <SpotlightCard className="ff-gradborder" style={{ border: `1px solid ${HAIR}`, borderRadius: 14, background: `linear-gradient(180deg, ${PANEL}, #090909)` }}>
              {[
                ["Context", "Every logged meal and session is memory."],
                ["Proactive", "It nudges before you drift, not after."],
                ["Guarded", "Medical + body-image safety lines built in."],
                ["Status", "In development. Ships with Luxury."],
              ].map(([k, v], i, a) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 16, padding: "17px 16px", borderBottom: i < a.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <span style={mono(11, i === 3 ? LIME_LT : MUTE)}>{k}</span>
                  <span style={{ fontSize: 13, color: i === 3 ? MUTE : "#c9c9c5", textAlign: "right", maxWidth: "24ch" }}>{v}</span>
                </div>
              ))}
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ 008 MEMBERSHIP ═══ */
function Membership() {
  const tiers = [
    { name: "Free", price: "Rs 0", note: "Explore", href: "/auth/signin", cta: "Create account" },
    { name: "Standard", price: "from Rs 112 / meal", note: "The daily loop", href: "/plans", cta: "Start a plan", on: true },
    { name: "Premium", price: "Waitlist", note: "Coaching layer", href: "/plans", cta: "Join waitlist" },
    { name: "Luxury", price: "Waitlist", note: "Fully managed", href: "/plans", cta: "Join waitlist" },
  ];
  const matrix: [string, (boolean | string)[]][] = [
    ["Full menus + macros", [true, true, true, true]],
    ["Meal delivery", [false, true, true, true]],
    ["Per-gram logging + net calories", [false, true, true, true]],
    ["Body metrics + recalibration", [false, true, true, true]],
    ["Consistency score + digest", [false, true, true, true]],
    ["Linked workout schedule", [false, false, true, true]],
    ["Personalised supplement stack", [false, false, true, true]],
    ["Weekly progress PDF", [false, false, true, true]],
    ["AI trainer chat", [false, false, false, true]],
    ["Nutritionist consult", [false, false, false, true]],
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="008" label="Membership" />
        <Reveal>
          <div style={{ border: `1px solid ${HAIR}`, borderRadius: 14, overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1.6fr) repeat(4,minmax(90px,1fr))", borderBottom: `1px solid ${HAIR}` }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "18px 12px", borderLeft: `1px solid ${HAIR}`, background: t.on ? "rgba(132,204,22,0.05)" : "transparent" }}>
                    <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 22, textTransform: "uppercase", color: t.on ? LIME : TXT }}>{t.name}</div>
                    <div style={mono(9.5, DIM)}>{t.note}</div>
                    <div style={{ ...mono(10, MUTE), marginTop: 8 }}>{t.price}</div>
                  </div>
                ))}
              </div>
              {matrix.map(([label, marks]) => (
                <div key={label} className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(200px,1.6fr) repeat(4,minmax(90px,1fr))", borderBottom: `1px solid ${HAIR}` }}>
                  <span style={{ padding: "14px 16px", fontSize: 13, color: MUTE }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "14px 12px", textAlign: "center", borderLeft: `1px solid ${HAIR}`, background: ci === 1 ? "rgba(132,204,22,0.04)" : "transparent", ...mono(12, m ? (ci === 1 ? LIME : MUTE) : "#333") }}>{m ? "✓" : "·"}</span>
                  ))}
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: "minmax(200px,1.6fr) repeat(4,minmax(90px,1fr))" }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "14px 12px", borderLeft: `1px solid ${HAIR}` }}>
                    <Link
                      href={t.href}
                      className={t.on ? "ff-cta" : "ff-link"}
                      style={
                        t.on
                          ? { display: "block", textAlign: "center", background: LIME, color: "#000", ...mono(10, "#000"), fontWeight: 700, padding: "10px 6px", textDecoration: "none", borderRadius: 7 }
                          : { ...mono(10, LIME_LT), display: "block", textAlign: "center" }
                      }
                    >
                      {t.cta}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 009 BUILT FOR ═══ */
function BuiltFor() {
  const rows = [
    { tag: "IND", title: "Individuals", d: "126 goal and condition plans, cooked and tracked for you daily.", href: "/plans", cta: "Find your plan" },
    { tag: "B2B", title: "Corporate wellness", d: "Subsidised, condition-specific meal programs and reporting for Pune offices.", href: "/corporate", cta: "Enquire for your team" },
    { tag: "PARTNER", title: "Gyms + trainers", d: "Coaches and clinics earn on every member. QR onboarding, live tracking, monthly payouts.", href: "/partners/apply", cta: "Become a partner" },
    { tag: "PDF", title: "Digital plans", d: "Not in Pune? The full 30-day plan as a designed PDF: recipes, macros, grocery list, training.", href: "/plans/digital", cta: "Browse digital plans" },
  ];
  return (
    <section
      style={{
        padding: "clamp(72px,10vw,120px) 0",
        background: "#050505",
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <div style={WRAP}>
        <IndexHeader n="009" label="Built For" right="Many front doors" />
        <div style={{ borderTop: `1px solid ${HAIR}` }}>
          {rows.map((r) => (
            <Reveal key={r.title}>
              <Link
                href={r.href}
                className="ff-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "90px minmax(160px,300px) minmax(0,1fr) auto",
                  gap: "clamp(12px,2vw,26px)",
                  alignItems: "center",
                  padding: "26px 8px",
                  borderBottom: `1px solid ${HAIR}`,
                  textDecoration: "none",
                }}
              >
                <span style={mono(10.5, LIME)}>{r.tag}</span>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.4rem,2.6vw,2rem)", textTransform: "uppercase", color: TXT }}>{r.title}</span>
                <span className="ff-bf-desc" style={{ fontSize: 14, color: MUTE, lineHeight: 1.5 }}>{r.d}</span>
                <span style={{ ...mono(10.5, LIME_LT), display: "inline-flex", alignItems: "center", gap: 6, whiteSpace: "nowrap" }}>{r.cta} <ArrowRight size={13} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 010 FRANCHISE ═══ */
function Franchise() {
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="010" label="The Operating System" right="Franchise" />
        <div className="ff-verify-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.2fr) minmax(0,1fr)", gap: "clamp(28px,5vw,60px)", alignItems: "start" }}>
          <Reveal>
            <h2 style={{ ...display("clamp(2.2rem,5vw,3.8rem)"), maxWidth: "12ch" }}>A cloud kitchen in a box</h2>
            <p style={{ fontSize: 15.5, color: MUTE, lineHeight: 1.7, marginTop: 22, maxWidth: "46ch" }}>
              FitFuel is not just a brand, it is the operating system to run one. Recipe SOPs with step-by-step cooking, batch scaling, and a production dashboard that tells any outlet exactly how many portions of each dish to cook tomorrow. The system that runs our Pune kitchen is what a partner plugs into.
            </p>
            <a href="/contact" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block", marginTop: 24 }}>Talk franchise →</a>
          </Reveal>
          <Reveal delay={0.1}>
            <SpotlightCard className="ff-gradborder" style={{ border: `1px solid ${HAIR}`, borderRadius: 14, background: `linear-gradient(180deg, ${PANEL}, #090909)` }}>
              {[
                ["SOP-01", "Recipe SOPs", "Every dish, step-by-step, portion-scaled."],
                ["SOP-02", "Production board", "Tomorrow's portions per recipe, auto-computed."],
                ["SOP-03", "Dispatch + drivers", "Outlet-scoped delivery boards, ready to scale."],
              ].map(([c, t, d], i, a) => (
                <div key={c} style={{ padding: "19px 16px", borderBottom: i < a.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                    <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 18, textTransform: "uppercase", color: TXT }}>{t}</span>
                    <span style={mono(10, DIM)}>{c}</span>
                  </div>
                  <span style={{ fontSize: 13, color: MUTE }}>{d}</span>
                </div>
              ))}
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ 011 FINDER ═══ */
function Finder() {
  const [goal, setGoal] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const ready = goal && diet;
  const slug = ready ? `${goal}-${diet}` : "";
  const planName = ready
    ? `${GOAL_NAME[goal!]}, ${DIETS.find((d) => d.key === diet)!.label}`
    : "";
  return (
    <section
      id="finder"
      style={{
        padding: "clamp(72px,10vw,120px) 0",
        background: "#050505",
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
        scrollMarginTop: 70,
      }}
    >
      <div style={WRAP}>
        <IndexHeader n="011" label="Plan Finder" right="60 seconds" />
        <div className="ff-gradborder" style={{ border: `1px solid ${HAIR2}`, borderRadius: 16, background: `linear-gradient(180deg, ${PANEL}, #080808)`, position: "relative", overflow: "hidden" }}>
          <div style={{ padding: "clamp(22px,4vw,40px)", borderBottom: `1px solid ${HAIR}` }}>
            <div style={{ ...mono(10.5, DIM), marginBottom: 14 }}>01 / Goal</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 0, border: `1px solid ${HAIR}`, borderRadius: 10, overflow: "hidden" }}>
              {GOALS.map((g, i) => {
                const a = goal === g.key;
                return (
                  <button
                    key={g.key}
                    onClick={() => setGoal(g.key)}
                    className="ff-goal"
                    style={{
                      textAlign: "left",
                      cursor: "pointer",
                      background: a ? "rgba(132,204,22,0.07)" : "transparent",
                      border: "none",
                      borderRight: i < GOALS.length - 1 ? `1px solid ${HAIR}` : "none",
                      borderLeft: a ? `2px solid ${LIME}` : "2px solid transparent",
                      padding: "18px 20px",
                      transition: "background .15s, border-color .15s",
                    }}
                  >
                    <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 21, textTransform: "uppercase", color: a ? TXT : "#c9c9c5" }}>{g.label}</div>
                    <div style={mono(10, DIM)}>{g.note}</div>
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ padding: "clamp(22px,4vw,40px)", borderBottom: `1px solid ${HAIR}` }}>
            <div style={{ ...mono(10.5, DIM), marginBottom: 14 }}>02 / Diet</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {DIETS.map((d) => {
                const a = diet === d.key;
                return (
                  <button
                    key={d.key}
                    onClick={() => setDiet(d.key)}
                    className="ff-diet"
                    style={{
                      cursor: "pointer",
                      background: a ? LIME : "transparent",
                      color: a ? "#000" : "#c9c9c5",
                      border: `1px solid ${a ? LIME : HAIR}`,
                      padding: "10px 22px",
                      borderRadius: 8,
                      fontFamily: MONO,
                      fontSize: 12,
                      letterSpacing: "0.1em",
                      textTransform: "uppercase",
                      transition: "all .15s",
                      boxShadow: a ? "0 4px 18px rgba(132,204,22,.35)" : "none",
                    }}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, padding: "clamp(22px,4vw,40px)" }}>
            <div>
              <div style={mono(10, DIM)}>Match</div>
              <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.5rem,3vw,2rem)", textTransform: "uppercase", color: ready ? TXT : "#333", marginTop: 4, transition: "color .2s" }}>{ready ? planName : "Select goal + diet"}</div>
            </div>
            {ready ? (
              <Link href={`/plans/${slug}`} className="ff-cta" style={{ background: LIME, color: "#000", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "15px 26px", borderRadius: 8 }}>See my plan →</Link>
            ) : (
              <span style={mono(11, DIM)}>Awaiting input</span>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ 012 REFERRAL ═══ */
function Referral() {
  return (
    <section style={{ padding: "clamp(60px,8vw,96px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="012" label="Referral" />
        <Reveal>
          <SpotlightCard
            className="ff-gradborder"
            style={{
              border: `1px solid ${HAIR}`,
              borderRadius: 16,
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 24,
              padding: "clamp(28px,4vw,46px)",
              background: `linear-gradient(120deg, ${PANEL}, #080808)`,
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 20, flexWrap: "wrap" }}>
                <span style={display("clamp(2rem,5vw,3.2rem)")}>Give <span style={{ color: LIME }}>Rs 200</span></span>
                <span style={display("clamp(2rem,5vw,3.2rem)")}>Get <span style={{ color: LIME }}>Rs 500</span></span>
              </div>
              <p style={{ fontSize: 14.5, color: MUTE, marginTop: 12, maxWidth: "50ch" }}>Your friend gets Rs 200 off their first plan. You earn Rs 500 in credit per signup. It stacks.</p>
            </div>
            <Link href="/dashboard/referrals" className="ff-cta" style={{ background: LIME, color: "#000", fontFamily: MONO, fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", textDecoration: "none", padding: "16px 28px", whiteSpace: "nowrap", borderRadius: 8 }}>Get your code →</Link>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 013 ROADMAP ═══ */
function Roadmap() {
  const items: [string, string, boolean][] = [
    ["The plate", "Chef-cooked meals, tracked to the gram", true],
    ["Movement", "Workouts, net calories, exercise library", true],
    ["Body metrics", "Weight, composition, progress", true],
    ["Sleep + recovery", "Rest and recovery as a tracked domain", false],
    ["Wearables", "Verified HR, HRV and sleep via aggregator", false],
    ["Whole-person", "One operating system for your whole body", false],
  ];
  return (
    <section
      style={{
        padding: "clamp(72px,10vw,120px) 0",
        background: "#050505",
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <div style={WRAP}>
        <IndexHeader n="013" label="Roadmap" right="Where it goes" />
        <Reveal>
          <h2 style={{ ...display("clamp(2rem,5vw,3.6rem)"), maxWidth: "14ch", marginBottom: 44 }}>Today the plate. Tomorrow everything.</h2>
        </Reveal>
        <div style={{ borderTop: `1px solid ${HAIR}` }}>
          {items.map(([t, d, live], i) => (
            <Reveal key={t} delay={(i % 3) * 0.04}>
              <div
                className="ff-row"
                style={{
                  display: "grid",
                  gridTemplateColumns: "minmax(160px,280px) minmax(0,1fr) 80px",
                  gap: "clamp(12px,2vw,26px)",
                  alignItems: "center",
                  padding: "22px 8px",
                  borderBottom: `1px solid ${HAIR}`,
                }}
              >
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.3rem,2.6vw,1.8rem)", textTransform: "uppercase", color: live ? TXT : DIM }}>{t}</span>
                <span className="ff-bf-desc" style={{ fontSize: 14, color: MUTE }}>{d}</span>
                <span style={{ ...mono(9.5, live ? LIME : DIM), textAlign: "right", display: "inline-flex", alignItems: "center", justifyContent: "flex-end", gap: 6 }}>
                  {live && <span className="ff-dot" style={{ width: 5, height: 5, borderRadius: "50%", background: LIME }} />}[ {live ? "LIVE" : "NEXT"} ]
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ 014 FIELD REPORTS ═══ */
function FieldReports() {
  const q = [
    { q: "Down 9 kg in four months without ever feeling like I was on a diet. The food is genuinely good.", n: "Rhea M.", r: "Weight Loss · Kharadi" },
    { q: "As a trainer I send clients here. The macros are dialled in and my members actually stick to it.", n: "Aditya K.", r: "Partner · Baner" },
    { q: "The PCOS plan sorted my energy and cycles. Cooked, delivered, done. No more decision fatigue.", n: "Sneha P.", r: "PCOS · Viman Nagar" },
  ];
  return (
    <section style={{ padding: "clamp(72px,10vw,120px) 0" }}>
      <div style={WRAP}>
        <IndexHeader n="014" label="Field Reports" right="Pune members" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 18 }}>
          {q.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.08}>
              <SpotlightCard
                className="ff-gradborder"
                style={{
                  padding: "30px 26px",
                  border: `1px solid ${HAIR}`,
                  borderRadius: 16,
                  background: `linear-gradient(180deg, ${PANEL}, #090909)`,
                  height: "100%",
                }}
              >
                <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 40, color: LIME, lineHeight: 0.6, display: "block", height: 20 }}>“</span>
                <p style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.2rem,2vw,1.5rem)", lineHeight: 1.2, color: TXT, textTransform: "uppercase", margin: "0 0 24px" }}>{t.q}</p>
                <div style={mono(11, MUTE)}>{t.n}</div>
                <div style={mono(9.5, DIM)}>{t.r}</div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 28 }}>
          <a href="/testimonials" className="ff-link" style={{ ...mono(12, LIME_LT), display: "inline-block" }}>More reports →</a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ 015 KITCHEN ═══ */
function Kitchen() {
  const rows: [string, string][] = [
    ["Location", "FSSAI-licensed kitchen, Kharadi, Pune"],
    ["Cook time", "Fresh from 04:00, never frozen"],
    ["Delivery", "At your door by 08:00, six days a week"],
    ["Pricing", "Delivery, packaging and 5% GST, all in"],
    ["FSSAI Lic.", "21523035002815"],
  ];
  return (
    <section
      style={{
        padding: "clamp(72px,10vw,120px) 0",
        background: "#050505",
        borderTop: `1px solid ${HAIR}`,
        borderBottom: `1px solid ${HAIR}`,
      }}
    >
      <div style={WRAP}>
        <IndexHeader n="015" label="The Kitchen" />
        <div style={{ borderTop: `1px solid ${HAIR}`, maxWidth: 760 }}>
          {rows.map(([k, v]) => (
            <Reveal key={k}>
              <div className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(120px,200px) minmax(0,1fr)", gap: 20, padding: "20px 8px", borderBottom: `1px solid ${HAIR}` }}>
                <span style={mono(11, DIM)}>{k}</span>
                <span style={{ fontSize: 15, color: TXT }}>{v}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ CTA ═══ */
function Cta() {
  return (
    <section style={{ padding: "clamp(80px,12vw,150px) 0", position: "relative", overflow: "hidden" }}>
      <div
        aria-hidden
        className="ff-aurora-1"
        style={{
          position: "absolute",
          bottom: "-30%",
          left: "50%",
          transform: "translateX(-50%)",
          width: 720,
          height: 520,
          background: "radial-gradient(circle, rgba(132,204,22,0.12), transparent 62%)",
          filter: "blur(40px)",
          pointerEvents: "none",
        }}
      />
      <div style={{ ...WRAP, position: "relative" }}>
        <div style={{ ...mono(11, DIM), marginBottom: 24 }}>016 / START</div>
        <Reveal>
          <h2 style={display("clamp(2.8rem,8vw,6.4rem)")}>
            Start the trial day.
            <br />
            <span style={{ color: LIME, textShadow: "0 0 40px rgba(132,204,22,.35)" }}>Rs 400.</span>
          </h2>
          <p style={{ fontSize: "clamp(1rem,1.6vw,1.15rem)", color: MUTE, lineHeight: 1.6, maxWidth: "46ch", marginTop: 24 }}>
            Breakfast plus lunch delivered tomorrow. No lock-in, no commitment. See why Pune keeps ordering.
          </p>
          <div style={{ display: "flex", gap: 20, alignItems: "center", flexWrap: "wrap", marginTop: 36 }}>
            <Link href="/plans?trial=true" className="ff-cta" style={{ fontFamily: MONO, fontSize: 12.5, letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 700, background: LIME, color: "#000", textDecoration: "none", padding: "17px 30px", borderRadius: 8 }}>Start your trial day</Link>
            <Link href="/plans" className="ff-link" style={mono(12, LIME_LT)}>See all plans →</Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 28px", marginTop: 40, paddingTop: 24, borderTop: `1px solid ${HAIR}` }}>
            {["No lock-in", "Cancel anytime", "FSSAI licensed", "Verified intake"].map((t) => (
              <span key={t} style={{ ...mono(10.5, DIM), display: "inline-flex", alignItems: "center", gap: 7 }}>
                <span style={{ color: LIME }}>✓</span>
                {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
