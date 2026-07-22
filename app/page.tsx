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
   FITFUEL HOMEPAGE — confident, spacious, subtracted.
   Design rule here: one label per section, big type, whitespace does
   the work. No per-item codes / eyebrows / unit captions / fake
   instrument panels. Mono is used sparingly (section eyebrows + real
   numbers only). Motion is restrained. Zero images. No em dashes.
══════════════════════════════════════════════════════════════════ */

const BG = "#070707";
const PANEL = "#0d0d0d";
const HAIR = "#1c1c1c";
const HAIR2 = "#2a2a2a";
const TXT = "#f5f5f4";
const MUTE = "#9b9b96";
const DIM = "#6a6a66";
const LIME = "#84cc16";
const LIME_LT = "#a3e635";

const BARLOW = "'Barlow Condensed','Arial Narrow',sans-serif";
const MONO =
  "ui-monospace,'SF Mono',SFMono-Regular,Menlo,'Cascadia Mono',Consolas,monospace";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: CSSProperties = {
  width: "100%",
  maxWidth: 1160,
  margin: "0 auto",
  padding: "0 clamp(22px,5vw,44px)",
};

const eyebrow = (color = LIME): CSSProperties => ({
  fontFamily: MONO,
  fontSize: 11,
  letterSpacing: "0.22em",
  textTransform: "uppercase",
  color,
});
const display = (size: string): CSSProperties => ({
  fontFamily: BARLOW,
  fontWeight: 800,
  fontSize: size,
  lineHeight: 0.94,
  letterSpacing: "-0.005em",
  textTransform: "uppercase",
  color: TXT,
  margin: 0,
});
const body = (size = 16.5): CSSProperties => ({
  fontSize: size,
  color: MUTE,
  lineHeight: 1.65,
});

/* ─────────────────────────────────────────────────────────────────
   PRIMITIVES
───────────────────────────────────────────────────────────────── */
function Reveal({
  children,
  delay = 0,
  y = 22,
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
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, ease: EASE, delay }}
      style={style}
    >
      {children}
    </motion.div>
  );
}

/* One quiet lime eyebrow. That is the whole section label. */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 13, marginBottom: 26 }}>
      <span style={{ width: 26, height: 1.5, background: LIME }} />
      <span style={eyebrow()}>{children}</span>
    </div>
  );
}

/* Section heading block: eyebrow + big headline + optional lede. */
function Head({
  eyebrow: eb,
  title,
  lede,
  size = "clamp(2.1rem,5vw,3.7rem)",
  maxTitle = "20ch",
}: {
  eyebrow: string;
  title: ReactNode;
  lede?: ReactNode;
  size?: string;
  maxTitle?: string;
}) {
  return (
    <Reveal>
      <Eyebrow>{eb}</Eyebrow>
      <h2 style={{ ...display(size), maxWidth: maxTitle }}>{title}</h2>
      {lede ? (
        <p style={{ ...body(), marginTop: 22, maxWidth: "52ch" }}>{lede}</p>
      ) : null}
    </Reveal>
  );
}

function CountUp({
  to,
  suffix = "",
  prefix = "",
  duration = 1600,
  style,
}: {
  to: number;
  suffix?: string;
  prefix?: string;
  duration?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setVal(to);
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setVal(to * (1 - Math.pow(1 - t, 3)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, to, duration, reduce]);
  return (
    <span ref={ref} style={style}>
      {prefix}
      {Math.round(val).toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}

/* Card that lifts and shows a soft lime spotlight following the cursor. */
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
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>{children}</div>
    </div>
  );
  if (as === "link" && href)
    return (
      <Link href={href} style={{ textDecoration: "none", display: "block", height: "100%" }}>
        {inner}
      </Link>
    );
  return inner;
}

/* Animated particle constellation for the hero. */
function Constellation() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  useEffect(() => {
    if (reduce) return;
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let raf = 0, w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
    const mouse = { x: -9999, y: -9999 };
    type P = { x: number; y: number; vx: number; vy: number };
    let pts: P[] = [];
    const build = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      w = parent.clientWidth; h = parent.clientHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr; canvas.height = h * dpr;
      canvas.style.width = w + "px"; canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.min(70, Math.max(28, Math.floor((w * h) / 20000)));
      pts = Array.from({ length: density }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.22, vy: (Math.random() - 0.5) * 0.22,
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      const LINK = 140;
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > w) p.vx *= -1;
        if (p.y < 0 || p.y > h) p.vy *= -1;
        const dx = mouse.x - p.x, dy = mouse.y - p.y, dm = Math.hypot(dx, dy);
        if (dm < 150) { p.x += (dx / dm) * 0.35; p.y += (dy / dm) * 0.35; }
      }
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < LINK) {
            ctx.strokeStyle = `rgba(132,204,22,${(1 - d / LINK) * 0.4})`;
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      for (const p of pts) {
        const near = Math.hypot(mouse.x - p.x, mouse.y - p.y) < 150;
        ctx.beginPath(); ctx.arc(p.x, p.y, near ? 2.2 : 1.4, 0, Math.PI * 2);
        ctx.fillStyle = near ? "rgba(163,230,53,0.9)" : "rgba(132,204,22,0.45)";
        ctx.fill();
      }
      raf = requestAnimationFrame(draw);
    };
    const onMove = (e: MouseEvent) => {
      const r = canvas.getBoundingClientRect();
      mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top;
    };
    const onLeave = () => { mouse.x = -9999; mouse.y = -9999; };
    build(); draw();
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
    <canvas ref={ref} aria-hidden style={{ position: "absolute", inset: 0, width: "100%", height: "100%", opacity: 0.75, pointerEvents: "none" }} />
  );
}

/* ─────────────────────────────────────────────────────────────────
   DATA
───────────────────────────────────────────────────────────────── */
const GOALS = [
  { key: "weight-loss", label: "Lose fat" },
  { key: "muscle-gain", label: "Build muscle" },
  { key: "balanced", label: "Eat balanced" },
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

const SECTION: CSSProperties = { padding: "clamp(88px,12vw,150px) 0" };
const SECTION_ALT: CSSProperties = {
  ...SECTION,
  background: "#050505",
  borderTop: `1px solid ${HAIR}`,
  borderBottom: `1px solid ${HAIR}`,
};

/* ═══════════════════════════════════════════════════════════════════
   PAGE
═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div style={{ background: BG, color: TXT, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>
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
        .ff-ticker { animation: ff-tick 60s linear infinite; }
        .ff-ticker:hover { animation-play-state: paused; }
        @keyframes ff-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
        .ff-dot { animation: ff-pulse 2.6s ease-in-out infinite; }
        @keyframes ff-drift { 0%,100% { transform: translate(0,0) scale(1); } 50% { transform: translate(5%,-4%) scale(1.1); } }
        .ff-aurora { animation: ff-drift 22s ease-in-out infinite; }

        .ff-row { transition: background .2s ease; }
        .ff-row:hover { background: #0b0b0b; }

        .ff-link { color: ${LIME_LT}; text-decoration: none; display: inline-flex; align-items: center; gap: 7px; transition: gap .2s, color .2s; }
        .ff-link:hover { gap: 11px; color: #fff; }

        .ff-cta { position: relative; overflow: hidden; transition: transform .2s ease, box-shadow .25s ease, background .2s; }
        .ff-cta:hover { background: ${LIME_LT} !important; transform: translateY(-2px); box-shadow: 0 12px 34px rgba(132,204,22,.32); }
        .ff-cta::after { content:""; position:absolute; top:0; left:-120%; width:55%; height:100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.5), transparent); transform: skewX(-18deg); transition: left .6s ease; }
        .ff-cta:hover::after { left: 130%; }

        .ff-spot { transition: transform .35s cubic-bezier(.16,1,.3,1), border-color .35s; }
        .ff-spot:hover { transform: translateY(-5px); border-color: rgba(132,204,22,.32) !important; }
        .ff-spot-glow { position:absolute; inset:0; pointer-events:none; opacity:0; transition:opacity .35s; background: radial-gradient(460px circle at var(--mx,50%) var(--my,50%), rgba(132,204,22,.1), transparent 42%); z-index:0; }
        .ff-spot:hover .ff-spot-glow { opacity:1; }

        .ff-choice:hover { border-color: ${HAIR2} !important; color: #fff !important; }

        @media (max-width: 900px){ .ff-hero-grid{ grid-template-columns: 1fr !important; } }
        @media (max-width: 820px){ .ff-split{ grid-template-columns: 1fr !important; } }
        @media (max-width: 720px){ .ff-hide-sm{ display:none !important; } }
        @media (prefers-reduced-motion: reduce) {
          .ff-ticker, .ff-dot, .ff-aurora { animation: none !important; }
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
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -50]);
  const o = useTransform(scrollYProgress, [0, 0.85], [1, reduce ? 1 : 0.2]);

  return (
    <section ref={ref} style={{ paddingTop: 68, position: "relative", isolation: "isolate" }}>
      <div aria-hidden style={{ position: "absolute", inset: 0, overflow: "hidden", zIndex: 0, pointerEvents: "none" }}>
        <div className="ff-aurora" style={{ position: "absolute", top: "-20%", left: "18%", width: 620, height: 620, background: "radial-gradient(circle, rgba(132,204,22,0.13), transparent 62%)", filter: "blur(40px)" }} />
        <div style={{ position: "absolute", inset: 0, backgroundImage: `linear-gradient(${HAIR} 1px, transparent 1px), linear-gradient(90deg, ${HAIR} 1px, transparent 1px)`, backgroundSize: "72px 72px", opacity: 0.28, maskImage: "radial-gradient(ellipse 85% 65% at 50% 25%, #000 25%, transparent 72%)", WebkitMaskImage: "radial-gradient(ellipse 85% 65% at 50% 25%, #000 25%, transparent 72%)" }} />
        <Constellation />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 220, background: `linear-gradient(180deg, transparent, ${BG})` }} />
      </div>

      <motion.div style={{ ...WRAP, position: "relative", zIndex: 1, paddingTop: "clamp(64px,10vw,120px)", paddingBottom: "clamp(56px,7vw,90px)", y, opacity: o }}>
        <div className="ff-hero-grid" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.55fr) minmax(0,1fr)", gap: "clamp(36px,5vw,72px)", alignItems: "center" }}>
          <div>
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 12 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: EASE }}
              style={{ display: "inline-flex", alignItems: "center", gap: 9, marginBottom: 30 }}
            >
              <span className="ff-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: LIME, boxShadow: `0 0 12px ${LIME}` }} />
              <span style={eyebrow(MUTE)}>Verified-intake health OS</span>
            </motion.div>

            <h1 style={display("clamp(3.2rem,8.5vw,7rem)")}>
              <HeroLine text="We don't guess" i={0} />
              <HeroLine text="what you ate." i={1} />
              <HeroLine text="We cooked it." i={2} lime />
            </h1>

            <motion.p
              initial={reduce ? undefined : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.5 }}
              style={{ ...body(18), maxWidth: "46ch", marginTop: 30 }}
            >
              We cook every meal in our Pune kitchen, track the macros to the gram, and
              recalibrate when you plateau. Intake you can verify, not a number you typed in.
            </motion.p>

            <motion.div
              initial={reduce ? undefined : { opacity: 0 }}
              animate={reduce ? undefined : { opacity: 1 }}
              transition={{ duration: 0.8, ease: EASE, delay: 0.62 }}
              style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginTop: 40 }}
            >
              <Link href="/plans" className="ff-cta" style={{ fontSize: 15, fontWeight: 800, background: LIME, color: "#000", textDecoration: "none", padding: "16px 30px", borderRadius: 10, letterSpacing: "0.01em" }}>
                Explore plans
              </Link>
              <a href="#loop" className="ff-link" style={{ fontSize: 15, fontWeight: 600 }}>
                See how it works <ArrowRight size={15} />
              </a>
            </motion.div>
          </div>

          <motion.div
            initial={reduce ? undefined : { opacity: 0, y: 26 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.85, ease: EASE, delay: 0.35 }}
          >
            <Readout />
          </motion.div>
        </div>
      </motion.div>

      <Ticker />
    </section>
  );
}

function HeroLine({ text, i, lime }: { text: string; i: number; lime?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.span
      style={{ display: "block", color: lime ? LIME : TXT }}
      initial={reduce ? undefined : { opacity: 0, y: 30 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.14 + i * 0.12 }}
    >
      {text}
    </motion.span>
  );
}

/* Calm readout: three numbers and a single target bar. No fake gauges. */
function Readout() {
  const pct = 1432 / 1450;
  return (
    <SpotlightCard style={{ border: `1px solid ${HAIR2}`, background: PANEL, borderRadius: 16, padding: "26px 26px 24px", boxShadow: "0 30px 70px rgba(0,0,0,.5)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
        <span style={eyebrow(MUTE)}>Today</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 7, ...eyebrow(LIME_LT) }}>
          <span className="ff-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: LIME }} /> Live
        </span>
      </div>

      {[
        { k: "Intake", v: 1842 },
        { k: "Burn", v: 410 },
      ].map((r) => (
        <div key={r.k} style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${HAIR}` }}>
          <span style={{ ...body(14.5), color: MUTE }}>{r.k}</span>
          <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 26, color: TXT }}>
            <CountUp to={r.v} /> <span style={{ ...eyebrow(DIM), fontSize: 10 }}>kcal</span>
          </span>
        </div>
      ))}

      <div style={{ paddingTop: 22 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <span style={{ ...eyebrow(LIME_LT) }}>Net today</span>
          <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 44, color: LIME, lineHeight: 1 }}>
            <CountUp to={1432} />
          </span>
        </div>
        <div style={{ height: 4, background: "#191919", borderRadius: 3, marginTop: 14, overflow: "hidden" }}>
          <motion.div
            initial={{ width: 0 }}
            whileInView={{ width: `${pct * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.2, ease: EASE }}
            style={{ height: "100%", background: `linear-gradient(90deg, ${LIME}, ${LIME_LT})`, borderRadius: 3 }}
          />
        </div>
        <div style={{ ...body(12.5), color: DIM, marginTop: 10, display: "flex", justifyContent: "space-between" }}>
          <span>Target 1,450 kcal</span>
          <span>Consistency 92 / 100</span>
        </div>
      </div>
    </SpotlightCard>
  );
}

function Ticker() {
  const items = ["Weight Loss", "Muscle Gain", "PCOS", "Diabetic", "Thyroid", "Heart", "Gut Health", "Fertility", "Anti-Aging", "Cricket", "Keto Indian", "Hair Health", "Hypertension", "Endurance", "Quit Smoking", "Jain", "Anaemia", "Fatty Liver"];
  const row = [...items, ...items];
  return (
    <div style={{ borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, overflow: "hidden", background: "#050505", position: "relative", zIndex: 1 }}>
      <div className="ff-ticker" style={{ display: "flex", width: "max-content", padding: "15px 0" }}>
        {row.map((it, i) => (
          <span key={i} style={{ ...eyebrow(i % 3 === 0 ? MUTE : DIM), letterSpacing: "0.14em", padding: "0 26px", whiteSpace: "nowrap", display: "inline-flex", alignItems: "center", gap: 11 }}>
            <span style={{ width: 3, height: 3, borderRadius: "50%", background: LIME }} /> {it}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ═══ STAT BAND ═══ */
function StatBand() {
  const stats: [ReactNode, string][] = [
    [<CountUp key="a" to={126} />, "Goal and condition plans"],
    [<CountUp key="b" to={800} suffix="+" />, "Exercises in the app"],
    [<span key="c">04:00</span>, "Kitchen fires up, daily"],
    [<CountUp key="d" to={100} suffix="%" />, "Macros measured, not typed"],
  ];
  return (
    <section style={{ borderBottom: `1px solid ${HAIR}` }}>
      <div style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
        {stats.map(([v, l], i) => (
          <Reveal key={i} delay={i * 0.07} style={{ padding: "clamp(34px,5vw,56px) clamp(4px,2vw,28px)", borderLeft: i === 0 ? "none" : `1px solid ${HAIR}` }}>
            <div style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: "clamp(2.8rem,5.5vw,4rem)", color: TXT, lineHeight: 1 }}>{v}</div>
            <div style={{ ...body(14.5), color: DIM, marginTop: 14 }}>{l}</div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/* ═══ THE MOAT ═══ */
function Moat() {
  const rows = [
    { who: "Tiffin service", miss: "Cooks the food, but no macros and no tracking." },
    { who: "Fitness app", miss: "Tracks numbers you self-report. Honest logging is a guess." },
    { who: "Supplement brand", miss: "Sells the pills, with no plan and no link to your food." },
  ];
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Head
          eyebrow="The moat"
          title={<>The meal is the door. The <span style={{ color: LIME }}>data loop</span> is the product.</>}
          maxTitle="17ch"
        />
        <Reveal delay={0.05} style={{ marginTop: 56 }}>
          <div style={{ borderTop: `1px solid ${HAIR}` }}>
            {rows.map((r) => (
              <div key={r.who} className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(150px,1fr) minmax(0,2fr)", gap: "clamp(16px,4vw,48px)", alignItems: "baseline", padding: "26px 8px", borderBottom: `1px solid ${HAIR}` }}>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.3rem,2.4vw,1.7rem)", textTransform: "uppercase", color: TXT }}>{r.who}</span>
                <span style={body(15.5)}>{r.miss}</span>
              </div>
            ))}
            <div style={{ display: "grid", gridTemplateColumns: "minmax(150px,1fr) minmax(0,2fr)", gap: "clamp(16px,4vw,48px)", alignItems: "baseline", padding: "26px 8px" }}>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.3rem,2.4vw,1.7rem)", textTransform: "uppercase", color: LIME }}>FitFuel</span>
              <span style={{ ...body(16.5), color: TXT }}>Runs all three as one system, so intake is measured end to end.</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ THE DAILY LOOP ═══ */
function Loop() {
  const steps = [
    ["Onboard", "Body, goal, diet and condition. We compute your exact calories and macros."],
    ["Cook", "Your plan is cooked fresh in our Pune kitchen from 04:00, portioned to your macros."],
    ["Deliver", "Hot at your door by 08:00, six days a week."],
    ["Log", "Tap once. It writes to your diary with measured macros. Nothing to count."],
    ["Train", "A workout linked to your plan feeds the net-calorie total."],
    ["Weigh in", "Weekly weigh-ins trend your weight and flag a plateau automatically."],
    ["Recalibrate", "Plateau detected, target drops, the plan adapts as your body changes."],
    ["Score", "Meals, workouts, water and weigh-ins roll into one consistency score."],
  ];
  return (
    <section id="loop" style={{ ...SECTION_ALT, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <Head eyebrow="The daily loop" title="The engine that runs every single day" maxTitle="15ch" />
        <div style={{ marginTop: 56 }}>
          {steps.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 4) * 0.05}>
              <div className="ff-row" style={{ display: "grid", gridTemplateColumns: "58px minmax(130px,220px) minmax(0,1fr)", gap: "clamp(12px,2vw,32px)", alignItems: "baseline", padding: "24px 8px", borderTop: `1px solid ${HAIR}` }}>
                <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 24, color: LIME }}>{String(i + 1).padStart(2, "0")}</span>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.4rem,2.6vw,1.9rem)", textTransform: "uppercase", color: TXT }}>{t}</span>
                <span style={body(15.5)}>{d}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ VERIFIED VS SELF-REPORTED ═══ */
function Verified() {
  const cols = ["Tiffin", "App", "Supp.", "FitFuel"];
  const rows: [string, boolean[]][] = [
    ["Cooks your food fresh, daily", [true, false, false, true]],
    ["Tracks every gram automatically", [false, false, false, true]],
    ["Adapts targets on a plateau", [false, false, false, true]],
    ["Condition-specific plans", [false, false, false, true]],
    ["Consistency score on real data", [false, false, false, true]],
    ["Coaches on what actually happened", [false, false, false, true]],
  ];
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <div className="ff-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1.25fr)", gap: "clamp(36px,6vw,72px)", alignItems: "center" }}>
          <Head
            eyebrow="Measured vs typed"
            title="Measured, not typed in"
            lede="When we cook every meal, the macros are measured. That closed loop is the one thing a tiffin, an app or a supplement brand cannot copy."
            size="clamp(2.1rem,4.6vw,3.4rem)"
            maxTitle="13ch"
          />
          <Reveal delay={0.1}>
            <div style={{ border: `1px solid ${HAIR}`, borderRadius: 16, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) repeat(4, minmax(38px,1fr))", background: "#040404", borderBottom: `1px solid ${HAIR}` }}>
                <span />
                {cols.map((c, i) => (
                  <span key={c} style={{ ...eyebrow(i === 3 ? "#000" : DIM), fontSize: 10, letterSpacing: "0.1em", padding: "14px 4px", textAlign: "center", background: i === 3 ? LIME : "transparent", fontWeight: 700 }}>{c}</span>
                ))}
              </div>
              {rows.map(([label, marks], ri) => (
                <div key={label} className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.7fr) repeat(4, minmax(38px,1fr))", borderBottom: ri < rows.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <span style={{ ...body(13.5), padding: "16px 16px" }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "16px 4px", textAlign: "center", fontSize: 15, color: m ? (ci === 3 ? LIME : MUTE) : "#333", background: ci === 3 ? "rgba(132,204,22,0.05)" : "transparent" }}>{m ? "✓" : "·"}</span>
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

/* ═══ INSTRUMENTATION ═══ */
function Instrumentation() {
  const tools: [string, string][] = [
    ["Meal logging", "Tap once. Your diary fills with exact macros."],
    ["Net-calorie engine", "Calories in minus out, against your target, live."],
    ["Water intake", "Log every glass beside your food."],
    ["Today's workout", "A session linked to your plan, not a random routine."],
    ["Workout logger", "Sets, reps and weight from an 800+ exercise library."],
    ["Body metrics", "Weight, body fat, muscle and BMI, trended over time."],
    ["Progress charts", "Weight trend, macros and consistency. Plateaus surface early."],
    ["Consistency score", "One signal, zero to a hundred, that drives recalibration."],
    ["Coach and digest", "Morning preview, evening recap, weekly digest."],
  ];
  return (
    <section style={SECTION_ALT}>
      <div style={WRAP}>
        <Head
          eyebrow="Inside the app"
          title="Every gram, every rep, every glass"
          lede="Your meals come with a full health app, a connected system where food, movement, water and weight feed one another."
          maxTitle="16ch"
        />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 16, marginTop: 56 }}>
          {tools.map(([t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 0.06}>
              <SpotlightCard style={{ padding: "28px 26px", border: `1px solid ${HAIR}`, borderRadius: 14, background: PANEL, height: "100%" }}>
                <span style={{ display: "block", fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.4rem,2.4vw,1.75rem)", textTransform: "uppercase", color: TXT, marginBottom: 12 }}>{t}</span>
                <span style={body(15)}>{d}</span>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 40 }}>
          <a href="/how-it-works" className="ff-link" style={{ fontSize: 15, fontWeight: 600 }}>See the full system <ArrowRight size={15} /></a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ THREE PRODUCTS ═══ */
function Products() {
  const p = [
    { t: "The kitchen", specs: ["Goal and condition meal plans", "Chef-cooked, macro-portioned", "Delivered daily across Pune"], href: "/plans", cta: "Meal plans" },
    { t: "The app", specs: ["800+ exercise library", "Net calories and body metrics", "Progress and consistency"], href: "/how-it-works", cta: "Inside the app" },
    { t: "The stack", specs: ["Condition-matched doses", "Educational, not a wall of pills", "Ordered via Nutrabay"], href: "/supplements", cta: "Supplements" },
  ];
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Head eyebrow="Three products, one system" title="One loop, three ways in" maxTitle="16ch" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 56 }}>
          {p.map((x, i) => (
            <Reveal key={x.t} delay={i * 0.09}>
              <SpotlightCard as="link" href={x.href} style={{ display: "block", padding: "34px 30px", border: `1px solid ${HAIR}`, borderRadius: 18, background: PANEL, height: "100%" }}>
                <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(2rem,3vw,2.6rem)", textTransform: "uppercase", color: TXT, margin: "0 0 26px" }}>{x.t}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 13, marginBottom: 30 }}>
                  {x.specs.map((s) => (
                    <div key={s} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
                      <span style={{ width: 5, height: 5, background: LIME, flexShrink: 0, transform: "translateY(-2px)", borderRadius: 1 }} />
                      <span style={body(14.5)}>{s}</span>
                    </div>
                  ))}
                </div>
                <span className="ff-link" style={{ fontSize: 14, fontWeight: 600 }}>{x.cta} <ArrowUpRight size={14} /></span>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ THE COACH ═══ */
function Coach() {
  return (
    <section style={SECTION_ALT}>
      <div style={WRAP}>
        <div className="ff-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.3fr) minmax(0,1fr)", gap: "clamp(36px,6vw,72px)", alignItems: "center" }}>
          <Head
            eyebrow="The coach"
            title="A trainer that watched every rep and every meal"
            lede="Not a chatbot you have to explain yourself to. It already logged 30 days of your meals, workouts and weigh-ins, so it knows where you slipped and what to fix, and it talks to you daily."
            size="clamp(2.1rem,4.6vw,3.4rem)"
            maxTitle="16ch"
          />
          <Reveal delay={0.1}>
            <SpotlightCard style={{ border: `1px solid ${HAIR}`, borderRadius: 16, background: PANEL }}>
              {[
                ["Context", "Every logged meal and session is memory."],
                ["Proactive", "It nudges before you drift, not after."],
                ["Guarded", "Medical and body-image safety built in."],
                ["Ships with", "Luxury. In development now."],
              ].map(([k, v], i, a) => (
                <div key={k} style={{ display: "flex", justifyContent: "space-between", gap: 18, padding: "20px 22px", borderBottom: i < a.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <span style={{ ...body(14), color: i === 3 ? LIME_LT : TXT, fontWeight: 600 }}>{k}</span>
                  <span style={{ ...body(13.5), textAlign: "right", maxWidth: "26ch" }}>{v}</span>
                </div>
              ))}
            </SpotlightCard>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ MEMBERSHIP ═══ */
function Membership() {
  const tiers = [
    { name: "Free", price: "Rs 0", href: "/auth/signin", cta: "Create account" },
    { name: "Standard", price: "from Rs 112 / meal", href: "/plans", cta: "Start a plan", on: true },
    { name: "Premium", price: "Waitlist", href: "/plans", cta: "Join waitlist" },
    { name: "Luxury", price: "Waitlist", href: "/plans", cta: "Join waitlist" },
  ];
  const matrix: [string, boolean[]][] = [
    ["Full menus and macros", [true, true, true, true]],
    ["Meal delivery", [false, true, true, true]],
    ["Per-gram logging and net calories", [false, true, true, true]],
    ["Body metrics and recalibration", [false, true, true, true]],
    ["Consistency score and digest", [false, true, true, true]],
    ["Linked workout schedule", [false, false, true, true]],
    ["Personalised supplement stack", [false, false, true, true]],
    ["Weekly progress PDF", [false, false, true, true]],
    ["AI trainer chat", [false, false, false, true]],
    ["Nutritionist consult", [false, false, false, true]],
  ];
  const gt = "minmax(200px,1.6fr) repeat(4,minmax(90px,1fr))";
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Head eyebrow="Membership" title="Pick your level" maxTitle="14ch" />
        <Reveal delay={0.05} style={{ marginTop: 48 }}>
          <div style={{ border: `1px solid ${HAIR}`, borderRadius: 16, overflowX: "auto" }}>
            <div style={{ minWidth: 640 }}>
              <div style={{ display: "grid", gridTemplateColumns: gt, borderBottom: `1px solid ${HAIR}` }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "22px 14px", borderLeft: `1px solid ${HAIR}`, background: t.on ? "rgba(132,204,22,0.05)" : "transparent" }}>
                    <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 24, textTransform: "uppercase", color: t.on ? LIME : TXT }}>{t.name}</div>
                    <div style={{ ...body(12.5), color: DIM, marginTop: 6 }}>{t.price}</div>
                  </div>
                ))}
              </div>
              {matrix.map(([label, marks]) => (
                <div key={label} className="ff-row" style={{ display: "grid", gridTemplateColumns: gt, borderBottom: `1px solid ${HAIR}` }}>
                  <span style={{ ...body(13.5), padding: "15px 16px" }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "15px 12px", textAlign: "center", borderLeft: `1px solid ${HAIR}`, background: ci === 1 ? "rgba(132,204,22,0.04)" : "transparent", fontSize: 14, color: m ? (ci === 1 ? LIME : MUTE) : "#333" }}>{m ? "✓" : "·"}</span>
                  ))}
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: gt }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "16px 12px", borderLeft: `1px solid ${HAIR}` }}>
                    <Link href={t.href} className={t.on ? "ff-cta" : "ff-link"} style={t.on ? { display: "block", textAlign: "center", background: LIME, color: "#000", fontSize: 12.5, fontWeight: 800, padding: "11px 6px", textDecoration: "none", borderRadius: 8 } : { fontSize: 12.5, fontWeight: 600, justifyContent: "center" }}>{t.cta}</Link>
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

/* ═══ BUILT FOR ═══ */
function BuiltFor() {
  const rows = [
    { title: "Individuals", d: "Goal and condition plans, cooked and tracked for you daily.", href: "/plans", cta: "Find your plan" },
    { title: "Corporate wellness", d: "Subsidised, condition-specific meal programs for Pune offices.", href: "/corporate", cta: "Enquire for your team" },
    { title: "Gyms and trainers", d: "Coaches earn on every member. QR onboarding, live tracking, monthly payouts.", href: "/partners/apply", cta: "Become a partner" },
    { title: "Digital plans", d: "Not in Pune? The full 30-day plan as a designed PDF: recipes, macros, training.", href: "/plans/digital", cta: "Browse digital plans" },
  ];
  return (
    <section style={SECTION_ALT}>
      <div style={WRAP}>
        <Head eyebrow="Built for" title="Many front doors, one system" maxTitle="16ch" />
        <div style={{ marginTop: 56, borderTop: `1px solid ${HAIR}` }}>
          {rows.map((r) => (
            <Reveal key={r.title}>
              <Link href={r.href} className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(180px,340px) minmax(0,1fr) auto", gap: "clamp(16px,3vw,40px)", alignItems: "center", padding: "28px 8px", borderBottom: `1px solid ${HAIR}`, textDecoration: "none" }}>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.5rem,2.6vw,2.1rem)", textTransform: "uppercase", color: TXT }}>{r.title}</span>
                <span className="ff-hide-sm" style={body(14.5)}>{r.d}</span>
                <span className="ff-link" style={{ fontSize: 13.5, fontWeight: 600, whiteSpace: "nowrap" }}>{r.cta} <ArrowRight size={13} /></span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ FRANCHISE ═══ */
function Franchise() {
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <div className="ff-split" style={{ display: "grid", gridTemplateColumns: "minmax(0,1.15fr) minmax(0,1fr)", gap: "clamp(36px,6vw,72px)", alignItems: "center" }}>
          <Head
            eyebrow="Franchise"
            title="A cloud kitchen in a box"
            lede="FitFuel is also the operating system to run one. Recipe SOPs, batch scaling, and a production board that tells any outlet exactly how much to cook tomorrow. The system that runs our Pune kitchen is what a partner plugs into."
            size="clamp(2.2rem,5vw,3.7rem)"
            maxTitle="11ch"
          />
          <Reveal delay={0.1}>
            <SpotlightCard style={{ border: `1px solid ${HAIR}`, borderRadius: 16, background: PANEL }}>
              {[
                ["Recipe SOPs", "Every dish, step by step, portion-scaled."],
                ["Production board", "Tomorrow's portions per recipe, auto-computed."],
                ["Dispatch and drivers", "Outlet-scoped delivery boards, ready to scale."],
              ].map(([t, d], i, a) => (
                <div key={t} style={{ padding: "22px 22px", borderBottom: i < a.length - 1 ? `1px solid ${HAIR}` : "none" }}>
                  <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: 20, textTransform: "uppercase", color: TXT, marginBottom: 5 }}>{t}</div>
                  <span style={body(14)}>{d}</span>
                </div>
              ))}
            </SpotlightCard>
          </Reveal>
        </div>
        <Reveal style={{ marginTop: 34 }}>
          <a href="/contact" className="ff-link" style={{ fontSize: 15, fontWeight: 600 }}>Talk franchise <ArrowRight size={15} /></a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ FINDER ═══ */
function Finder() {
  const [goal, setGoal] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const ready = goal && diet;
  const slug = ready ? `${goal}-${diet}` : "";
  const planName = ready ? `${GOAL_NAME[goal!]}, ${DIETS.find((d) => d.key === diet)!.label}` : "";
  return (
    <section id="finder" style={{ ...SECTION_ALT, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <Head eyebrow="Plan finder" title="Find your plan in a minute" maxTitle="16ch" />
        <Reveal delay={0.05} style={{ marginTop: 48 }}>
          <div style={{ border: `1px solid ${HAIR2}`, borderRadius: 18, background: PANEL, padding: "clamp(26px,4vw,44px)" }}>
            <div style={{ ...body(13.5), color: DIM, marginBottom: 16 }}>Goal</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 36 }}>
              {GOALS.map((g) => {
                const a = goal === g.key;
                return (
                  <button key={g.key} onClick={() => setGoal(g.key)} className="ff-choice" style={{ cursor: "pointer", background: a ? LIME : "transparent", color: a ? "#000" : "#c9c9c5", border: `1px solid ${a ? LIME : HAIR2}`, padding: "13px 24px", borderRadius: 10, fontFamily: BARLOW, fontWeight: 700, fontSize: 20, textTransform: "uppercase", transition: "all .18s", boxShadow: a ? "0 6px 20px rgba(132,204,22,.3)" : "none" }}>{g.label}</button>
                );
              })}
            </div>
            <div style={{ ...body(13.5), color: DIM, marginBottom: 16 }}>Diet</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {DIETS.map((d) => {
                const a = diet === d.key;
                return (
                  <button key={d.key} onClick={() => setDiet(d.key)} className="ff-choice" style={{ cursor: "pointer", background: a ? LIME : "transparent", color: a ? "#000" : "#c9c9c5", border: `1px solid ${a ? LIME : HAIR2}`, padding: "11px 24px", borderRadius: 10, fontFamily: BARLOW, fontWeight: 700, fontSize: 18, textTransform: "uppercase", transition: "all .18s", boxShadow: a ? "0 6px 20px rgba(132,204,22,.3)" : "none" }}>{d.label}</button>
                );
              })}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginTop: 40, paddingTop: 30, borderTop: `1px solid ${HAIR}` }}>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.6rem,3vw,2.2rem)", textTransform: "uppercase", color: ready ? TXT : "#3a3a3a", transition: "color .2s" }}>{ready ? planName : "Choose a goal and diet"}</span>
              {ready ? (
                <Link href={`/plans/${slug}`} className="ff-cta" style={{ background: LIME, color: "#000", fontSize: 14.5, fontWeight: 800, textDecoration: "none", padding: "15px 28px", borderRadius: 10, whiteSpace: "nowrap" }}>See my plan <ArrowRight size={15} style={{ verticalAlign: "-2px" }} /></Link>
              ) : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ REFERRAL ═══ */
function Referral() {
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Reveal>
          <SpotlightCard style={{ border: `1px solid ${HAIR}`, borderRadius: 20, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 28, padding: "clamp(34px,5vw,56px)", background: PANEL }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 22, flexWrap: "wrap" }}>
                <span style={display("clamp(2.2rem,5vw,3.4rem)")}>Give <span style={{ color: LIME }}>Rs 200</span></span>
                <span style={display("clamp(2.2rem,5vw,3.4rem)")}>Get <span style={{ color: LIME }}>Rs 500</span></span>
              </div>
              <p style={{ ...body(15), marginTop: 16, maxWidth: "48ch" }}>Your friend gets Rs 200 off their first plan. You earn Rs 500 in credit per signup. It stacks.</p>
            </div>
            <Link href="/dashboard/referrals" className="ff-cta" style={{ background: LIME, color: "#000", fontSize: 14.5, fontWeight: 800, textDecoration: "none", padding: "16px 30px", whiteSpace: "nowrap", borderRadius: 10 }}>Get your code</Link>
          </SpotlightCard>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ ROADMAP ═══ */
function Roadmap() {
  const items: [string, boolean][] = [
    ["The plate", true],
    ["Movement", true],
    ["Body metrics", true],
    ["Sleep and recovery", false],
    ["Wearables", false],
    ["Whole-person OS", false],
  ];
  return (
    <section style={SECTION_ALT}>
      <div style={WRAP}>
        <Head eyebrow="Roadmap" title="Today the plate. Tomorrow everything." maxTitle="14ch" />
        <div style={{ marginTop: 56, borderTop: `1px solid ${HAIR}` }}>
          {items.map(([t, live], i) => (
            <Reveal key={t} delay={(i % 3) * 0.05}>
              <div className="ff-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "24px 8px", borderBottom: `1px solid ${HAIR}` }}>
                <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.5rem,2.8vw,2rem)", textTransform: "uppercase", color: live ? TXT : DIM }}>{t}</span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 8, ...eyebrow(live ? LIME : DIM) }}>
                  {live && <span className="ff-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: LIME }} />}
                  {live ? "Live" : "Next"}
                </span>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ FIELD REPORTS ═══ */
function FieldReports() {
  const q = [
    { q: "Down 9 kg in four months without ever feeling like I was on a diet. The food is genuinely good.", n: "Rhea M.", r: "Weight Loss, Kharadi" },
    { q: "As a trainer I send clients here. The macros are dialled in and my members actually stick to it.", n: "Aditya K.", r: "Partner, Baner" },
    { q: "The PCOS plan sorted my energy and cycles. Cooked, delivered, done. No more decision fatigue.", n: "Sneha P.", r: "PCOS, Viman Nagar" },
  ];
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Head eyebrow="From members" title="What Pune says" maxTitle="14ch" />
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 16, marginTop: 56 }}>
          {q.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.09}>
              <SpotlightCard style={{ padding: "32px 30px", border: `1px solid ${HAIR}`, borderRadius: 18, background: PANEL, height: "100%", display: "flex", flexDirection: "column" }}>
                <p style={{ fontSize: 18, lineHeight: 1.5, color: TXT, margin: "0 0 26px", flex: 1 }}>{t.q}</p>
                <div style={{ ...body(14), color: TXT, fontWeight: 600 }}>{t.n}</div>
                <div style={{ ...body(13), color: DIM }}>{t.r}</div>
              </SpotlightCard>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 40 }}>
          <a href="/testimonials" className="ff-link" style={{ fontSize: 15, fontWeight: 600 }}>Read more reviews <ArrowRight size={15} /></a>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ KITCHEN ═══ */
function Kitchen() {
  const rows: [string, string][] = [
    ["Location", "FSSAI-licensed kitchen, Kharadi, Pune"],
    ["Cook time", "Fresh from 04:00, never frozen"],
    ["Delivery", "At your door by 08:00, six days a week"],
    ["Pricing", "Delivery, packaging and GST, all in"],
    ["FSSAI licence", "21523035002815"],
  ];
  return (
    <section style={SECTION_ALT}>
      <div style={WRAP}>
        <Head eyebrow="The kitchen" title="Where it all comes from" maxTitle="14ch" />
        <div style={{ marginTop: 48, borderTop: `1px solid ${HAIR}`, maxWidth: 780 }}>
          {rows.map(([k, v]) => (
            <Reveal key={k}>
              <div className="ff-row" style={{ display: "grid", gridTemplateColumns: "minmax(130px,220px) minmax(0,1fr)", gap: 24, padding: "22px 8px", borderBottom: `1px solid ${HAIR}` }}>
                <span style={{ ...body(14), color: DIM }}>{k}</span>
                <span style={{ ...body(16), color: TXT }}>{v}</span>
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
    <section style={{ ...SECTION, position: "relative", overflow: "hidden" }}>
      <div aria-hidden className="ff-aurora" style={{ position: "absolute", bottom: "-35%", left: "50%", transform: "translateX(-50%)", width: 760, height: 560, background: "radial-gradient(circle, rgba(132,204,22,0.1), transparent 62%)", filter: "blur(46px)", pointerEvents: "none" }} />
      <div style={{ ...WRAP, position: "relative" }}>
        <Reveal>
          <Eyebrow>Start today</Eyebrow>
          <h2 style={display("clamp(3rem,8.5vw,7rem)")}>
            Start the trial day.
            <br />
            <span style={{ color: LIME }}>Rs 400.</span>
          </h2>
          <p style={{ ...body(18), maxWidth: "44ch", marginTop: 26 }}>
            Breakfast plus lunch delivered tomorrow. No lock-in, no commitment.
          </p>
          <div style={{ display: "flex", gap: 18, alignItems: "center", flexWrap: "wrap", marginTop: 40 }}>
            <Link href="/plans?trial=true" className="ff-cta" style={{ fontSize: 15.5, fontWeight: 800, background: LIME, color: "#000", textDecoration: "none", padding: "18px 34px", borderRadius: 10 }}>Start your trial day</Link>
            <Link href="/plans" className="ff-link" style={{ fontSize: 15, fontWeight: 600 }}>See all plans <ArrowRight size={15} /></Link>
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 30px", marginTop: 44, paddingTop: 28, borderTop: `1px solid ${HAIR}` }}>
            {["No lock-in", "Cancel anytime", "FSSAI licensed", "Verified intake"].map((t) => (
              <span key={t} style={{ ...body(13.5), color: DIM, display: "inline-flex", alignItems: "center", gap: 8 }}>
                <span style={{ color: LIME }}>✓</span> {t}
              </span>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
