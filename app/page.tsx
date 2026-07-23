"use client";

import { useState, useRef, useEffect, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE — editorial, image-led. Photography carries the
   page; text is spare. Represents the whole business: kitchen, app,
   Nutrabay supplements, corporate wellness, gym + trainer partners,
   digital plans and franchise. Real licensed photography in /public.
   No em dashes.
══════════════════════════════════════════════════════════════════ */

const BG = "#070707";
const PANEL = "#0e0e0e";
const HAIR = "#1e1e1e";
const TXT = "#f6f6f4";
const MUTE = "#a5a5a0";
const DIM = "#6f6f6b";
const LIME = "#84cc16";
const LIME_LT = "#a3e635";

const BARLOW = "'Barlow Condensed','Arial Narrow',sans-serif";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: CSSProperties = { width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 clamp(22px,5vw,48px)" };
const display = (size: string): CSSProperties => ({ fontFamily: BARLOW, fontWeight: 800, fontSize: size, lineHeight: 0.95, letterSpacing: "-0.01em", textTransform: "uppercase", color: TXT, margin: 0 });
const body = (size = 17): CSSProperties => ({ fontSize: size, color: MUTE, lineHeight: 1.6 });
const kicker = (color = LIME): CSSProperties => ({ fontFamily: BARLOW, fontWeight: 700, fontSize: 15, letterSpacing: "0.2em", textTransform: "uppercase", color });

/* ── motion primitives ── */
function Reveal({ children, delay = 0, y = 26, style }: { children: ReactNode; delay?: number; y?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div initial={{ opacity: 0, y }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-90px" }} transition={{ duration: 0.75, ease: EASE, delay }} style={style}>
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = "", style }: { to: number; suffix?: string; style?: CSSProperties }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(to);
    let raf = 0; const s = performance.now();
    const tick = (n: number) => { const t = Math.min(1, (n - s) / 1500); setV(to * (1 - Math.pow(1 - t, 3))); if (t < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);
  return <span ref={ref} style={style}>{Math.round(v).toLocaleString("en-IN")}{suffix}</span>;
}

/* Cover image with a slow zoom-on-hover, using next/image fill. */
function Cover({ src, alt, sizes, priority, style, imgClass }: { src: string; alt: string; sizes: string; priority?: boolean; style?: CSSProperties; imgClass?: string }) {
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden", ...style }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} className={imgClass} style={{ objectFit: "cover" }} />
    </div>
  );
}

/* ── data ── */
const GOALS = [{ key: "weight-loss", label: "Lose fat" }, { key: "muscle-gain", label: "Build muscle" }, { key: "balanced", label: "Eat balanced" }];
const DIETS = [{ key: "veg", label: "Veg" }, { key: "egg", label: "Egg" }, { key: "non-veg", label: "Non-Veg" }, { key: "jain", label: "Jain" }];
const GOAL_NAME: Record<string, string> = { "weight-loss": "Weight Loss", "muscle-gain": "Muscle Gain", balanced: "Balanced" };

const SECTION: CSSProperties = { padding: "clamp(84px,11vw,140px) 0" };

/* ═══════════════════════════════════════════════════════════════════ */
export default function Home() {
  return (
    <div style={{ background: BG, color: TXT, fontFamily: "Inter, system-ui, sans-serif", overflowX: "hidden" }}>
      <Hero />
      <FoodMarquee />
      <Moat />
      <Products />
      <Loop />
      <AppLayer />
      <BuiltFor />
      <Membership />
      <Franchise />
      <Finder />
      <Results />
      <Referral />
      <FinalCta />

      <style>{`
        @keyframes ff-slide { from { transform: translateX(0); } to { transform: translateX(-50%); } }
        .ff-marquee { animation: ff-slide 45s linear infinite; }
        .ff-marquee:hover { animation-play-state: paused; }
        @keyframes ff-pulse { 0%,100% { opacity: 1; } 50% { opacity: .4; } }
        .ff-dot { animation: ff-pulse 2.6s ease-in-out infinite; }
        .ff-zoom img { transition: transform 1.1s cubic-bezier(.16,1,.3,1); }
        .ff-zoom:hover img { transform: scale(1.06); }
        .ff-card { transition: transform .4s cubic-bezier(.16,1,.3,1), border-color .4s; }
        .ff-card:hover { transform: translateY(-6px); border-color: rgba(132,204,22,.4) !important; }
        .ff-cta { position: relative; overflow: hidden; transition: transform .2s, box-shadow .25s, background .2s; }
        .ff-cta:hover { background: ${LIME_LT} !important; transform: translateY(-2px); box-shadow: 0 14px 40px rgba(132,204,22,.35); }
        .ff-cta::after { content:""; position:absolute; top:0; left:-120%; width:55%; height:100%; background: linear-gradient(100deg, transparent, rgba(255,255,255,.55), transparent); transform: skewX(-18deg); transition: left .6s ease; }
        .ff-cta:hover::after { left: 130%; }
        .ff-link { color: ${LIME_LT}; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; font-weight: 600; transition: gap .2s, color .2s; }
        .ff-link:hover { gap: 13px; color: #fff; }
        .ff-choice:hover { border-color: #3a3a3a !important; }
        .ff-row { transition: background .2s; }
        .ff-row:hover { background: #0b0b0b; }
        @media (max-width: 940px){ .ff-hero{ grid-template-columns: 1fr !important; } .ff-hero-img{ min-height: 420px !important; } .ff-split{ grid-template-columns: 1fr !important; } }
        @media (max-width: 680px){ .ff-hide-sm{ display:none !important; } }
        @media (prefers-reduced-motion: reduce){ .ff-marquee,.ff-dot{ animation: none !important; } .ff-cta::after{ display:none; } .ff-zoom:hover img{ transform:none; } }
      `}</style>
    </div>
  );
}

/* ═══ HERO ═══ */
function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const yImg = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 60]);

  return (
    <section ref={ref} style={{ paddingTop: 68, position: "relative" }}>
      <div className="ff-hero" style={{ display: "grid", gridTemplateColumns: "1.04fr 0.96fr", minHeight: "min(88vh, 860px)" }}>
        {/* left: copy */}
        <div style={{ display: "flex", alignItems: "center", position: "relative", background: BG }}>
          {/* soft lime glow, not a particle field */}
          <div aria-hidden style={{ position: "absolute", top: "12%", left: "-8%", width: 460, height: 460, background: "radial-gradient(circle, rgba(132,204,22,0.14), transparent 62%)", filter: "blur(50px)", pointerEvents: "none" }} />
          <div style={{ ...WRAP, position: "relative", paddingTop: 56, paddingBottom: 56 }}>
            <motion.div initial={reduce ? undefined : { opacity: 0, y: 12 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.6, ease: EASE }} style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 28 }}>
              <span className="ff-dot" style={{ width: 7, height: 7, borderRadius: "50%", background: LIME, boxShadow: `0 0 12px ${LIME}` }} />
              <span style={kicker(MUTE)}>Cooked in Pune. Tracked to the gram.</span>
            </motion.div>

            <h1 style={display("clamp(3rem,7vw,6rem)")}>
              <HeroLine text="Food that" i={0} />
              <HeroLine text="knows your" i={1} />
              <HeroLine text="numbers." i={2} lime />
            </h1>

            <motion.p initial={reduce ? undefined : { opacity: 0 }} animate={reduce ? undefined : { opacity: 1 }} transition={{ duration: 0.8, ease: EASE, delay: 0.5 }} style={{ ...body(18.5), maxWidth: "42ch", marginTop: 28 }}>
              We cook every meal, weigh every macro, and adjust when you plateau. A full health app comes with it. Intake you can verify, not a number you typed in.
            </motion.p>

            <motion.div initial={reduce ? undefined : { opacity: 0 }} animate={reduce ? undefined : { opacity: 1 }} transition={{ duration: 0.8, ease: EASE, delay: 0.62 }} style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 38 }}>
              <Link href="/plans" className="ff-cta" style={{ fontSize: 15.5, fontWeight: 800, background: LIME, color: "#000", textDecoration: "none", padding: "17px 32px", borderRadius: 12 }}>Explore plans</Link>
              <Link href="/plans?trial=true" className="ff-link" style={{ fontSize: 15.5 }}>Trial day, Rs 400 <ArrowRight size={16} /></Link>
            </motion.div>

            <div style={{ display: "flex", gap: "clamp(20px,4vw,44px)", marginTop: 52, flexWrap: "wrap" }}>
              {[[<CountUp key="p" to={126} />, "Plans"], [<CountUp key="e" to={800} suffix="+" />, "Exercises"], [<span key="k">04:00</span>, "Cooked from"]].map(([v, l], i) => (
                <div key={i}>
                  <div style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: "clamp(2rem,3.5vw,2.7rem)", color: TXT, lineHeight: 1 }}>{v}</div>
                  <div style={{ ...kicker(DIM), fontSize: 12, marginTop: 6 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right: hero image + floating live macro card */}
        <div className="ff-hero-img" style={{ position: "relative", minHeight: 480, overflow: "hidden" }}>
          <motion.div style={{ position: "absolute", inset: "-8% 0", y: yImg }}>
            <Cover src="/images/hero-bowl.jpg" alt="A colourful FitFuel bowl of fresh vegetables, chickpeas and avocado" sizes="(max-width: 940px) 100vw, 50vw" priority />
          </motion.div>
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,7,7,0.85), transparent 22%, transparent 70%, rgba(7,7,7,0.35))" }} />
          <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(7,7,7,0.5), transparent 30%)" }} />
          <MacroCard />
        </div>
      </div>
    </section>
  );
}

function HeroLine({ text, i, lime }: { text: string; i: number; lime?: boolean }) {
  const reduce = useReducedMotion();
  return (
    <motion.span style={{ display: "block", color: lime ? LIME : TXT }} initial={reduce ? undefined : { opacity: 0, y: 28 }} animate={reduce ? undefined : { opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: EASE, delay: 0.14 + i * 0.11 }}>
      {text}
    </motion.span>
  );
}

/* Floating glass card over the hero image: today's net calories. */
function MacroCard() {
  const reduce = useReducedMotion();
  const pct = 1432 / 1450;
  return (
    <motion.div
      initial={reduce ? undefined : { opacity: 0, y: 24 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
      style={{ position: "absolute", left: "clamp(18px,4vw,36px)", bottom: "clamp(18px,4vw,36px)", width: "min(300px, 78%)", background: "rgba(10,10,10,0.72)", backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 16, padding: "18px 20px", boxShadow: "0 24px 60px rgba(0,0,0,.5)" }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <span style={{ ...kicker(MUTE), fontSize: 12 }}>Today, verified</span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, ...kicker(LIME_LT), fontSize: 12 }}><span className="ff-dot" style={{ width: 6, height: 6, borderRadius: "50%", background: LIME }} /> Live</span>
      </div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 46, color: LIME, lineHeight: 1 }}><CountUp to={1432} /></span>
        <span style={{ ...body(13), color: MUTE }}>/ 1,450 kcal net</span>
      </div>
      <div style={{ height: 5, background: "rgba(255,255,255,0.1)", borderRadius: 3, marginTop: 14, overflow: "hidden" }}>
        <motion.div initial={{ width: 0 }} whileInView={{ width: `${pct * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.2, ease: EASE }} style={{ height: "100%", background: `linear-gradient(90deg, ${LIME}, ${LIME_LT})` }} />
      </div>
    </motion.div>
  );
}

/* ═══ FOOD MARQUEE ═══ */
function FoodMarquee() {
  const imgs = [
    ["/images/salad-bowl.jpg", "Protein tofu bowl"],
    ["/images/meal-spread.jpg", "Plated meals"],
    ["/images/salmon-plate.jpg", "Seared salmon"],
    ["/images/produce.jpg", "Fresh produce"],
    ["/images/chef-hands.jpg", "Prep board"],
    ["/images/hero-bowl.jpg", "Rainbow bowl"],
  ];
  const row = [...imgs, ...imgs];
  return (
    <div style={{ borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, overflow: "hidden", background: "#050505", padding: "18px 0" }}>
      <div className="ff-marquee" style={{ display: "flex", gap: 16, width: "max-content" }}>
        {row.map(([src, alt], i) => (
          <div key={i} style={{ position: "relative", width: "clamp(220px,26vw,320px)", height: "clamp(150px,17vw,210px)", borderRadius: 14, overflow: "hidden", flexShrink: 0, border: `1px solid ${HAIR}` }}>
            <Image src={src} alt={alt} fill sizes="320px" style={{ objectFit: "cover" }} />
          </div>
        ))}
      </div>
    </div>
  );
}

/* ═══ MOAT / statement ═══ */
function Moat() {
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Reveal>
          <span style={kicker()}>The difference</span>
          <h2 style={{ ...display("clamp(2.3rem,5.5vw,4.2rem)"), maxWidth: "20ch", marginTop: 24 }}>
            Every app trusts you to log honestly. <span style={{ color: LIME }}>We cook it, so it is measured.</span>
          </h2>
          <p style={{ ...body(18), maxWidth: "60ch", marginTop: 28 }}>
            A tiffin cooks but never tracks. An app tracks but only what you type. A supplement brand sells pills with no plan. FitFuel runs all three as one system, so what you eat, burn and weigh feed one loop.
          </p>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ THREE PRODUCTS ═══ */
function Products() {
  const p = [
    { img: "/images/salad-bowl.jpg", t: "The kitchen", d: "Chef-cooked, macro-portioned meals delivered daily across Pune.", href: "/plans", cta: "See meal plans" },
    { img: "/images/training.jpg", t: "The app", d: "Net calories, an 800+ exercise library, body metrics and progress.", href: "/how-it-works", cta: "Inside the app" },
    { img: "/images/supplements.jpg", t: "The supplements", d: "Condition-matched doses, ordered through Nutrabay. Not a wall of pills.", href: "/supplements", cta: "Browse the stack" },
  ];
  return (
    <section style={{ ...SECTION, background: "#050505", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <Reveal><span style={kicker()}>One system</span><h2 style={{ ...display("clamp(2.2rem,5vw,3.6rem)"), marginTop: 22, maxWidth: "16ch" }}>Three products, one loop</h2></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(300px,1fr))", gap: 20, marginTop: 52 }}>
          {p.map((x, i) => (
            <Reveal key={x.t} delay={i * 0.09}>
              <Link href={x.href} className="ff-card ff-zoom" style={{ display: "block", border: `1px solid ${HAIR}`, borderRadius: 20, overflow: "hidden", background: PANEL, textDecoration: "none", height: "100%" }}>
                <div style={{ position: "relative", height: 230 }}>
                  <Cover src={x.img} alt={x.t} sizes="(max-width: 900px) 100vw, 33vw" />
                  <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(14,14,14,0.9), transparent 55%)" }} />
                </div>
                <div style={{ padding: "24px 26px 28px" }}>
                  <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.7rem,2.6vw,2.1rem)", textTransform: "uppercase", color: TXT, margin: "0 0 12px" }}>{x.t}</h3>
                  <p style={{ ...body(15), marginBottom: 20 }}>{x.d}</p>
                  <span className="ff-link" style={{ fontSize: 14 }}>{x.cta} <ArrowUpRight size={15} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ DAILY LOOP (compact flow) ═══ */
function Loop() {
  const steps = ["Onboard", "Cook", "Deliver", "Log", "Train", "Weigh in", "Recalibrate", "Score"];
  return (
    <section id="loop" style={{ ...SECTION, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <div className="ff-split" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(30px,5vw,64px)", alignItems: "center" }}>
          <Reveal>
            <span style={kicker()}>Every day</span>
            <h2 style={{ ...display("clamp(2.2rem,5vw,3.6rem)"), marginTop: 22, maxWidth: "14ch" }}>The loop that runs your day</h2>
            <p style={{ ...body(17), marginTop: 24, maxWidth: "44ch" }}>
              Eight steps, one closed loop. Detect a plateau, drop the target, adapt the plan. It sharpens every week without you counting a thing.
            </p>
            <Link href="/how-it-works" className="ff-link" style={{ fontSize: 15, marginTop: 26 }}>See the full method <ArrowRight size={15} /></Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              {steps.map((s, i) => (
                <div key={s} className="ff-row" style={{ display: "flex", alignItems: "center", gap: 14, padding: "16px 18px", border: `1px solid ${HAIR}`, borderRadius: 12, background: PANEL }}>
                  <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 20, color: LIME, minWidth: 26 }}>{String(i + 1).padStart(2, "0")}</span>
                  <span style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "clamp(1.1rem,2vw,1.35rem)", textTransform: "uppercase", color: TXT }}>{s}</span>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

/* ═══ APP LAYER (image + features) ═══ */
function AppLayer() {
  const feats = [
    ["Meal logging", "One tap writes exact macros to your diary."],
    ["Net calories", "Calories in minus out, against your target, live."],
    ["Workouts", "Sessions linked to your plan, 800+ exercises."],
    ["Body metrics", "Weight, body fat and muscle, trended."],
    ["Progress", "Charts that surface a plateau early."],
    ["Consistency", "One score, zero to a hundred, drives it all."],
  ];
  return (
    <section style={{ ...SECTION, background: "#050505", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <div className="ff-split" style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: "clamp(30px,5vw,64px)", alignItems: "center" }}>
          <Reveal>
            <div className="ff-zoom" style={{ position: "relative", aspectRatio: "4 / 5", borderRadius: 22, overflow: "hidden", border: `1px solid ${HAIR}` }}>
              <Cover src="/images/training.jpg" alt="An athlete training, tracked by the FitFuel app" sizes="(max-width: 940px) 100vw, 42vw" />
              <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(5,5,5,0.6), transparent 45%)" }} />
            </div>
          </Reveal>
          <div>
            <Reveal><span style={kicker()}>Inside the app</span><h2 style={{ ...display("clamp(2.2rem,5vw,3.6rem)"), marginTop: 22, maxWidth: "15ch" }}>Every gram, every rep, tracked</h2></Reveal>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0, marginTop: 40, borderTop: `1px solid ${HAIR}`, borderLeft: `1px solid ${HAIR}` }}>
              {feats.map(([t, d], i) => (
                <Reveal key={t} delay={(i % 2) * 0.06}>
                  <div className="ff-row" style={{ padding: "22px 22px", borderRight: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, height: "100%" }}>
                    <div style={{ fontFamily: BARLOW, fontWeight: 700, fontSize: "1.35rem", textTransform: "uppercase", color: TXT, marginBottom: 7 }}>{t}</div>
                    <div style={body(14)}>{d}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══ BUILT FOR (business lines) ═══ */
function BuiltFor() {
  const cards = [
    { img: "/images/produce.jpg", tall: true, t: "Individuals", d: "126 goal and condition plans, cooked and tracked for you every day.", href: "/plans", cta: "Find your plan" },
    { img: "/images/corporate.jpg", t: "Corporate wellness", d: "Subsidised, condition-specific meal programs and reporting for Pune offices.", href: "/corporate", cta: "For your team" },
    { img: "/images/gym.jpg", t: "Gyms and trainers", d: "Coaches earn on every member. QR onboarding, live tracking, monthly payouts.", href: "/partners/apply", cta: "Become a partner" },
    { img: "/images/salmon-plate.jpg", t: "Digital plans", d: "Not in Pune? The full 30-day plan as a designed PDF, anywhere.", href: "/plans/digital", cta: "Browse digital" },
  ];
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Reveal><span style={kicker()}>Built for</span><h2 style={{ ...display("clamp(2.2rem,5vw,3.6rem)"), marginTop: 22, maxWidth: "16ch" }}>Many front doors, one kitchen</h2></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 20, marginTop: 52 }}>
          {cards.map((c, i) => (
            <Reveal key={c.t} delay={i * 0.07} style={c.tall ? { gridRow: "span 1" } : undefined}>
              <Link href={c.href} className="ff-card ff-zoom" style={{ display: "block", position: "relative", borderRadius: 20, overflow: "hidden", border: `1px solid ${HAIR}`, minHeight: 340, height: "100%", textDecoration: "none" }}>
                <Cover src={c.img} alt={c.t} sizes="(max-width: 900px) 100vw, 25vw" />
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(5,5,5,0.92) 8%, rgba(5,5,5,0.35) 55%, rgba(5,5,5,0.15))" }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "26px 24px" }}>
                  <h3 style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.6rem,2.4vw,2rem)", textTransform: "uppercase", color: TXT, margin: "0 0 10px" }}>{c.t}</h3>
                  <p style={{ ...body(14), color: "#cfcfca", marginBottom: 16 }}>{c.d}</p>
                  <span className="ff-link" style={{ fontSize: 13.5 }}>{c.cta} <ArrowRight size={14} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
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
  const gt = "minmax(200px,1.6fr) repeat(4,minmax(88px,1fr))";
  return (
    <section style={{ ...SECTION, background: "#050505", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}` }}>
      <div style={WRAP}>
        <Reveal><span style={kicker()}>Membership</span><h2 style={{ ...display("clamp(2.2rem,5vw,3.6rem)"), marginTop: 22 }}>Pick your level</h2></Reveal>
        <Reveal delay={0.05} style={{ marginTop: 44 }}>
          <div style={{ border: `1px solid ${HAIR}`, borderRadius: 18, overflowX: "auto", background: PANEL }}>
            <div style={{ minWidth: 660 }}>
              <div style={{ display: "grid", gridTemplateColumns: gt, borderBottom: `1px solid ${HAIR}` }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "22px 14px", borderLeft: `1px solid ${HAIR}`, background: t.on ? "rgba(132,204,22,0.06)" : "transparent" }}>
                    <div style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 25, textTransform: "uppercase", color: t.on ? LIME : TXT }}>{t.name}</div>
                    <div style={{ ...body(12.5), color: DIM, marginTop: 6 }}>{t.price}</div>
                  </div>
                ))}
              </div>
              {matrix.map(([label, marks]) => (
                <div key={label} className="ff-row" style={{ display: "grid", gridTemplateColumns: gt, borderBottom: `1px solid ${HAIR}` }}>
                  <span style={{ ...body(13.5), padding: "15px 18px" }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "15px 12px", textAlign: "center", borderLeft: `1px solid ${HAIR}`, background: ci === 1 ? "rgba(132,204,22,0.04)" : "transparent", fontSize: 15, color: m ? (ci === 1 ? LIME : MUTE) : "#333" }}>{m ? "✓" : "·"}</span>
                  ))}
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: gt }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "16px 12px", borderLeft: `1px solid ${HAIR}` }}>
                    <Link href={t.href} className={t.on ? "ff-cta" : "ff-link"} style={t.on ? { display: "block", textAlign: "center", background: LIME, color: "#000", fontSize: 12.5, fontWeight: 800, padding: "11px 6px", textDecoration: "none", borderRadius: 9 } : { fontSize: 12.5, justifyContent: "center" }}>{t.cta}</Link>
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

/* ═══ FRANCHISE ═══ */
function Franchise() {
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <div className="ff-split" style={{ display: "grid", gridTemplateColumns: "1.1fr 0.9fr", gap: "clamp(30px,5vw,64px)", alignItems: "center" }}>
          <Reveal>
            <span style={kicker()}>Franchise</span>
            <h2 style={{ ...display("clamp(2.3rem,5.2vw,4rem)"), marginTop: 22, maxWidth: "11ch" }}>A cloud kitchen in a box</h2>
            <p style={{ ...body(17.5), marginTop: 26, maxWidth: "46ch" }}>
              FitFuel is also the operating system to run one. Recipe SOPs, batch scaling, and a production board that tells any outlet exactly how much to cook tomorrow. The system that runs our Pune kitchen is what a partner plugs into.
            </p>
            <Link href="/contact" className="ff-cta" style={{ display: "inline-block", marginTop: 30, fontSize: 15, fontWeight: 800, background: LIME, color: "#000", textDecoration: "none", padding: "16px 30px", borderRadius: 12 }}>Talk franchise</Link>
          </Reveal>
          <Reveal delay={0.1}>
            <div className="ff-zoom" style={{ position: "relative", aspectRatio: "3 / 4", borderRadius: 22, overflow: "hidden", border: `1px solid ${HAIR}` }}>
              <Cover src="/images/kitchen.jpg" alt="A chef plating dishes in the FitFuel kitchen" sizes="(max-width: 940px) 100vw, 42vw" />
              <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(5,5,5,0.5), transparent 50%)" }} />
            </div>
          </Reveal>
        </div>
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
  const btn = (active: boolean, big: boolean): CSSProperties => ({ cursor: "pointer", background: active ? LIME : "transparent", color: active ? "#000" : "#cbcbc6", border: `1px solid ${active ? LIME : "#2a2a2a"}`, padding: big ? "14px 26px" : "12px 24px", borderRadius: 11, fontFamily: BARLOW, fontWeight: 700, fontSize: big ? 21 : 18, textTransform: "uppercase", transition: "all .18s", boxShadow: active ? "0 8px 22px rgba(132,204,22,.32)" : "none" });
  return (
    <section id="finder" style={{ ...SECTION, background: "#050505", borderTop: `1px solid ${HAIR}`, borderBottom: `1px solid ${HAIR}`, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <Reveal><span style={kicker()}>Plan finder</span><h2 style={{ ...display("clamp(2.2rem,5vw,3.6rem)"), marginTop: 22, maxWidth: "16ch" }}>Find your plan in a minute</h2></Reveal>
        <Reveal delay={0.05} style={{ marginTop: 44 }}>
          <div style={{ border: `1px solid #2a2a2a`, borderRadius: 20, background: PANEL, padding: "clamp(26px,4vw,46px)" }}>
            <div style={{ ...kicker(DIM), fontSize: 12, marginBottom: 16 }}>Goal</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 34 }}>
              {GOALS.map((g) => <button key={g.key} onClick={() => setGoal(g.key)} className="ff-choice" style={btn(goal === g.key, true)}>{g.label}</button>)}
            </div>
            <div style={{ ...kicker(DIM), fontSize: 12, marginBottom: 16 }}>Diet</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
              {DIETS.map((d) => <button key={d.key} onClick={() => setDiet(d.key)} className="ff-choice" style={btn(diet === d.key, false)}>{d.label}</button>)}
            </div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 18, marginTop: 40, paddingTop: 30, borderTop: `1px solid ${HAIR}` }}>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: "clamp(1.6rem,3vw,2.3rem)", textTransform: "uppercase", color: ready ? TXT : "#3a3a3a", transition: "color .2s" }}>{ready ? planName : "Choose a goal and diet"}</span>
              {ready ? <Link href={`/plans/${slug}`} className="ff-cta" style={{ background: LIME, color: "#000", fontSize: 15, fontWeight: 800, textDecoration: "none", padding: "15px 30px", borderRadius: 11, whiteSpace: "nowrap" }}>See my plan <ArrowRight size={15} style={{ verticalAlign: "-2px" }} /></Link> : null}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ RESULTS ═══ */
function Results() {
  const q = [
    { q: "Down 9 kg in four months and never felt like I was on a diet. The food is genuinely good.", n: "Rhea M.", r: "Weight Loss, Kharadi" },
    { q: "As a trainer I send clients here. The macros are dialled in and my members actually stick to it.", n: "Aditya K.", r: "Partner, Baner" },
    { q: "The PCOS plan sorted my energy and cycles. Cooked, delivered, done.", n: "Sneha P.", r: "PCOS, Viman Nagar" },
  ];
  return (
    <section style={SECTION}>
      <div style={WRAP}>
        <Reveal><span style={kicker()}>Results</span><h2 style={{ ...display("clamp(2.2rem,5vw,3.6rem)"), marginTop: 22 }}>What Pune says</h2></Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: 20, marginTop: 52 }}>
          {q.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.09}>
              <div className="ff-card" style={{ padding: "32px 30px", border: `1px solid ${HAIR}`, borderRadius: 20, background: PANEL, height: "100%", display: "flex", flexDirection: "column" }}>
                <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 52, color: LIME, lineHeight: 0.5, height: 26 }}>“</span>
                <p style={{ fontSize: 18.5, lineHeight: 1.5, color: TXT, margin: "0 0 24px", flex: 1 }}>{t.q}</p>
                <div style={{ ...body(14.5), color: TXT, fontWeight: 600 }}>{t.n}</div>
                <div style={{ ...body(13), color: DIM }}>{t.r}</div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 40 }}><a href="/testimonials" className="ff-link" style={{ fontSize: 15 }}>Read more reviews <ArrowRight size={15} /></a></Reveal>
      </div>
    </section>
  );
}

/* ═══ REFERRAL ═══ */
function Referral() {
  return (
    <section style={{ ...SECTION, paddingTop: 0 }}>
      <div style={WRAP}>
        <Reveal>
          <div className="ff-card" style={{ border: `1px solid ${HAIR}`, borderRadius: 22, display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 28, padding: "clamp(32px,5vw,52px)", background: "linear-gradient(120deg, #0f0f0f, #080808)" }}>
            <div>
              <div style={{ display: "flex", alignItems: "baseline", gap: 22, flexWrap: "wrap" }}>
                <span style={display("clamp(2.1rem,5vw,3.2rem)")}>Give <span style={{ color: LIME }}>Rs 200</span></span>
                <span style={display("clamp(2.1rem,5vw,3.2rem)")}>Get <span style={{ color: LIME }}>Rs 500</span></span>
              </div>
              <p style={{ ...body(15.5), marginTop: 14, maxWidth: "48ch" }}>Your friend gets Rs 200 off their first plan. You earn Rs 500 in credit per signup. It stacks.</p>
            </div>
            <Link href="/dashboard/referrals" className="ff-cta" style={{ background: LIME, color: "#000", fontSize: 15, fontWeight: 800, textDecoration: "none", padding: "16px 32px", whiteSpace: "nowrap", borderRadius: 12 }}>Get your code</Link>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ FINAL CTA (full-bleed) ═══ */
function FinalCta() {
  return (
    <section style={{ position: "relative", overflow: "hidden" }}>
      <div style={{ position: "relative", minHeight: "min(70vh, 640px)", display: "flex", alignItems: "center" }}>
        <Cover src="/images/produce.jpg" alt="Fresh vegetables ready for the kitchen" sizes="100vw" style={{ inset: 0 }} imgClass="ff-cta-bg" />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(5,5,5,0.94), rgba(5,5,5,0.72) 45%, rgba(5,5,5,0.5))" }} />
        <div style={{ ...WRAP, position: "relative", padding: "clamp(60px,9vw,110px) clamp(22px,5vw,48px)" }}>
          <Reveal>
            <span style={kicker()}>Start today</span>
            <h2 style={{ ...display("clamp(2.8rem,8vw,6.4rem)"), marginTop: 22 }}>Start the trial day.<br /><span style={{ color: LIME }}>Rs 400.</span></h2>
            <p style={{ ...body(18.5), maxWidth: "42ch", marginTop: 24 }}>Breakfast plus lunch delivered tomorrow. No lock-in, no commitment.</p>
            <div style={{ display: "flex", gap: 16, alignItems: "center", flexWrap: "wrap", marginTop: 38 }}>
              <Link href="/plans?trial=true" className="ff-cta" style={{ fontSize: 16, fontWeight: 800, background: LIME, color: "#000", textDecoration: "none", padding: "18px 36px", borderRadius: 12 }}>Start your trial day</Link>
              <Link href="/plans" className="ff-link" style={{ fontSize: 15.5 }}>See all plans <ArrowRight size={16} /></Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 30px", marginTop: 42, paddingTop: 26, borderTop: "1px solid rgba(255,255,255,0.12)" }}>
              {["No lock-in", "Cancel anytime", "FSSAI licensed", "Verified intake"].map((t) => (
                <span key={t} style={{ ...body(13.5), color: "#cfcfca", display: "inline-flex", alignItems: "center", gap: 8 }}><span style={{ color: LIME }}>✓</span> {t}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
