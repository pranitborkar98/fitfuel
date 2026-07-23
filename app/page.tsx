"use client";

import { useState, useRef, useEffect, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useReducedMotion, useInView, useScroll, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE

   Anti-slop constraints, held deliberately:
   · Body type is Archivo (set in layout), never Inter.
   · Square corners. Radius 0. No rounded-card grids.
   · Extreme type scale: display runs to 11rem against 15px body.
     Weights are 900 or 400, never the lukewarm middle.
   · No "kicker label + headline + paragraph + three cards" rhythm.
     Every block is structured differently on purpose.
   · Photography is art-directed full-bleed with one unified grade
     (food keeps colour for appetite, people/places take a lime
     duotone) so it reads as designed, not as stock dropped in slots.
   · Every service the business runs is on this page and linked.
   No em dashes.
══════════════════════════════════════════════════════════════════ */

const BG = "#070707";
const INK = "#f7f7f5";
const MUTE = "#9a9a94";
const DIM = "#63635f";
const RULE = "#232320";
const LIME = "#84cc16";

const COND = "'Barlow Condensed','Arial Narrow',sans-serif";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const WRAP: CSSProperties = { width: "100%", maxWidth: 1400, margin: "0 auto", padding: "0 clamp(18px,4vw,56px)" };

/* extreme scale: 900 display vs 400 body, nothing in between */
const huge = (size: string): CSSProperties => ({ fontFamily: COND, fontWeight: 900, fontSize: size, lineHeight: 0.83, letterSpacing: "-0.02em", textTransform: "uppercase", color: INK, margin: 0 });
const mid = (size: string): CSSProperties => ({ fontFamily: COND, fontWeight: 800, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.01em", textTransform: "uppercase", color: INK, margin: 0 });
const copy = (size = 15): CSSProperties => ({ fontSize: size, fontWeight: 400, color: MUTE, lineHeight: 1.62 });
const tag = (color = DIM): CSSProperties => ({ fontFamily: COND, fontWeight: 700, fontSize: 12.5, letterSpacing: "0.28em", textTransform: "uppercase", color });

function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const reduce = useReducedMotion();
  if (reduce) return <div style={style}>{children}</div>;
  return (
    <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-90px" }} transition={{ duration: 0.75, ease: EASE, delay }} style={style}>
      {children}
    </motion.div>
  );
}

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [v, setV] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) return setV(to);
    let raf = 0; const s = performance.now();
    const tick = (n: number) => { const t = Math.min(1, (n - s) / 1400); setV(to * (1 - Math.pow(1 - t, 3))); if (t < 1) raf = requestAnimationFrame(tick); };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, to, reduce]);
  return <span ref={ref}>{Math.round(v).toLocaleString("en-IN")}{suffix}</span>;
}

/* Art-directed frame. `duo` applies the lime duotone grade. */
function Frame({ src, alt, sizes, priority, duo, className }: { src: string; alt: string; sizes: string; priority?: boolean; duo?: boolean; className?: string }) {
  return (
    <div className={`ff-frame ${duo ? "ff-duo" : "ff-food"} ${className ?? ""}`} style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <Image src={src} alt={alt} fill sizes={sizes} priority={priority} style={{ objectFit: "cover" }} />
      {duo ? <span className="ff-tint" aria-hidden /> : null}
      <span className="ff-grain" aria-hidden />
    </div>
  );
}

const GOALS = [{ key: "weight-loss", label: "Lose fat" }, { key: "muscle-gain", label: "Build muscle" }, { key: "balanced", label: "Eat balanced" }];
const DIETS = [{ key: "veg", label: "Veg" }, { key: "egg", label: "Egg" }, { key: "non-veg", label: "Non-Veg" }, { key: "jain", label: "Jain" }];
const GOAL_NAME: Record<string, string> = { "weight-loss": "Weight Loss", "muscle-gain": "Muscle Gain", balanced: "Balanced" };

export default function Home() {
  return (
    <div style={{ background: BG, color: INK, overflowX: "hidden" }}>
      <Hero />
      <Pillars />
      <Statement />
      <ServiceMap />
      <Loop />
      <Kitchen />
      <AppBlock />
      <Supplements />
      <Partners />
      <Franchise />
      <Membership />
      <Finder />
      <Voices />
      <Close />

      <style>{`
        /* one unified grade so photography reads art-directed, not stock */
        .ff-frame img { transition: transform 1.4s cubic-bezier(.16,1,.3,1); }
        .ff-food img { filter: saturate(1.06) contrast(1.07) brightness(.94); }
        .ff-duo  img { filter: grayscale(1) contrast(1.22) brightness(.72); }
        .ff-tint { position:absolute; inset:0; background:${LIME}; mix-blend-mode:color; opacity:.5; pointer-events:none; }
        .ff-grain { position:absolute; inset:0; pointer-events:none; opacity:.14; mix-blend-mode:overlay;
          background-image:url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
        .ff-hov:hover .ff-frame img { transform: scale(1.05); }

        .ff-btn { position:relative; overflow:hidden; display:inline-block; background:${LIME}; color:#000; font-family:${COND}; font-weight:800; font-size:19px; letter-spacing:.06em; text-transform:uppercase; padding:17px 34px; text-decoration:none; border-radius:0; transition:background .2s; }
        .ff-btn:hover { background:#a3e635; }
        .ff-btn::after { content:""; position:absolute; top:0; left:-120%; width:55%; height:100%; background:linear-gradient(100deg,transparent,rgba(255,255,255,.6),transparent); transform:skewX(-18deg); transition:left .6s ease; }
        .ff-btn:hover::after { left:130%; }

        .ff-a { color:${INK}; text-decoration:none; display:inline-flex; align-items:center; gap:9px; font-family:${COND}; font-weight:700; font-size:19px; letter-spacing:.05em; text-transform:uppercase; border-bottom:2px solid ${LIME}; padding-bottom:3px; transition:gap .2s,color .2s; }
        .ff-a:hover { gap:15px; color:${LIME}; }

        /* service directory */
        .ff-svc { display:block; padding:9px 0; border-bottom:1px solid ${RULE}; color:${MUTE}; text-decoration:none; font-size:14.5px; transition:color .18s, padding-left .18s, border-color .18s; }
        .ff-svc:hover { color:${INK}; padding-left:10px; border-color:${LIME}; }

        .ff-choice { cursor:pointer; border-radius:0; font-family:${COND}; font-weight:800; text-transform:uppercase; transition:all .18s; }
        .ff-choice:hover { border-color:#4a4a45 !important; }

        .ff-strip:hover { background:#0c0c0a; }

        @media (max-width:1000px){ .ff-2col{ grid-template-columns:1fr !important; } .ff-bleed{ min-height:520px !important; } }
        @media (max-width:760px){ .ff-4col{ grid-template-columns:1fr 1fr !important; } .ff-hide{ display:none !important; } }
        @media (prefers-reduced-motion:reduce){ .ff-btn::after{ display:none; } .ff-hov:hover .ff-frame img{ transform:none; } }
      `}</style>
    </div>
  );
}

/* ═══ HERO: full-bleed, giant type, integrated readout bar ═══ */
function Hero() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90]);

  return (
    <section ref={ref} style={{ position: "relative", paddingTop: 68 }}>
      <div style={{ position: "relative", minHeight: "min(94vh,940px)", display: "flex", flexDirection: "column", justifyContent: "flex-end", overflow: "hidden" }}>
        <motion.div style={{ position: "absolute", inset: "-6% 0 0", y }}>
          <Frame src="/images/hero-bowl.jpg" alt="A FitFuel bowl of fresh vegetables, chickpeas and avocado" sizes="100vw" priority />
        </motion.div>
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(7,7,7,.82) 0%, rgba(7,7,7,.34) 34%, rgba(7,7,7,.86) 76%, #070707 100%)" }} />

        <div style={{ ...WRAP, position: "relative", paddingBottom: "clamp(28px,4vw,52px)", paddingTop: 120 }}>
          <motion.h1
            initial={reduce ? undefined : { opacity: 0, y: 34 }}
            animate={reduce ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE }}
            style={huge("clamp(3.6rem,13.5vw,11.5rem)")}
          >
            We cook it.<br />We weigh it.<br /><span style={{ color: LIME }}>We track it.</span>
          </motion.h1>

          <div className="ff-2col" style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: "clamp(20px,4vw,60px)", alignItems: "end", marginTop: "clamp(28px,4vw,48px)" }}>
            <p style={{ ...copy(16.5), maxWidth: "50ch" }}>
              Chef-cooked meals delivered across Pune, a full training and body-metrics app, and a supplement stack that matches your condition. One operating system for what you eat, burn and weigh.
            </p>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/plans" className="ff-btn">Explore plans</Link>
              <Link href="/plans?trial=true" className="ff-a">Trial day Rs 400 <ArrowRight size={17} /></Link>
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

/* ═══ PILLARS: four hard columns ═══ */
function Pillars() {
  const p = [
    ["Kitchen", "126 plans cooked daily", "/plans"],
    ["App", "800+ exercises, full tracking", "/how-it-works"],
    ["Supplements", "Matched stacks via Nutrabay", "/supplements"],
    ["Partners", "Gyms, offices, franchise", "/partners/apply"],
  ];
  return (
    <section style={{ borderBottom: `1px solid ${RULE}` }}>
      <div style={{ ...WRAP, display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: 0 }} className="ff-4col">
        {p.map(([t, d, href], i) => (
          <Link key={t} href={href} className="ff-strip" style={{ display: "block", padding: "clamp(26px,3.4vw,44px) clamp(16px,2vw,32px)", borderLeft: i === 0 ? "none" : `1px solid ${RULE}`, textDecoration: "none", transition: "background .2s" }}>
            <div style={mid("clamp(1.7rem,3vw,2.5rem)")}>{t}</div>
            <div style={{ ...copy(13.5), marginTop: 9 }}>{d}</div>
          </Link>
        ))}
      </div>
    </section>
  );
}

/* ═══ STATEMENT: asymmetric, type only ═══ */
function Statement() {
  return (
    <section style={{ padding: "clamp(80px,11vw,150px) 0" }}>
      <div style={WRAP}>
        <Reveal>
          <h2 style={{ ...huge("clamp(2.4rem,7.5vw,6.4rem)"), maxWidth: "17ch" }}>
            Every app trusts you to log it. <span style={{ color: LIME }}>We already know.</span>
          </h2>
        </Reveal>
        <Reveal delay={0.08}>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "clamp(28px,4vw,54px)" }}>
            <p style={{ ...copy(16.5), maxWidth: "46ch" }}>
              A tiffin cooks but never tracks. An app tracks only what you type in. A supplement brand sells pills with no plan. We run all three, so the macros are measured in our kitchen, not guessed at by you.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ SERVICE MAP: everything the business runs, linked ═══ */
function ServiceMap() {
  const cols: [string, [string, string][]][] = [
    ["Eat", [
      ["All 126 meal plans", "/plans"],
      ["Weight loss", "/plans/weight-loss-veg"],
      ["Muscle gain", "/plans/muscle-gain-veg"],
      ["Balanced maintenance", "/plans/balanced-veg"],
      ["Medical and lifestyle", "/plans?category=LIFESTYLE_MEDICAL"],
      ["Sports nutrition", "/plans?category=SPORTS"],
      ["Digital PDF plans", "/plans/digital"],
      ["Trial day, Rs 400", "/plans?trial=true"],
    ]],
    ["Track", [
      ["How the system works", "/how-it-works"],
      ["Your dashboard", "/dashboard"],
      ["Nutrition diary", "/dashboard/nutrition"],
      ["Exercise library", "/dashboard/exercises"],
      ["Body metrics", "/dashboard/body-metrics"],
      ["Progress charts", "/dashboard/progress"],
      ["TDEE calculator, free", "/tdee-calculator"],
      ["Member results", "/results"],
    ]],
    ["Supplement", [
      ["The supplement stack", "/supplements"],
      ["Ordered via Nutrabay", "/supplements"],
      ["Your stack", "/dashboard/supplements"],
      ["Our ingredients", "/our-ingredients"],
      ["Allergen policy", "/allergen-policy"],
      ["Medical disclaimer", "/medical-disclaimer"],
    ]],
    ["Partner", [
      ["Corporate wellness", "/corporate"],
      ["Gyms and trainers", "/partners/apply"],
      ["Partner dashboard", "/dashboard/partners"],
      ["Franchise enquiry", "/contact"],
      ["Refer and earn Rs 500", "/dashboard/referrals"],
      ["Blog", "/blog"],
    ]],
    ["Operate", [
      ["Our kitchen", "/our-kitchen"],
      ["Our team", "/our-team"],
      ["Delivery areas in Pune", "/locations"],
      ["About FitFuel", "/about"],
      ["Reviews", "/testimonials"],
      ["FAQ", "/faq"],
      ["Contact us", "/contact"],
    ]],
  ];
  return (
    <section style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <Reveal>
          <h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "20ch" }}>Everything we run, end to end</h2>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(190px,1fr))", gap: "clamp(24px,3vw,44px)", marginTop: "clamp(36px,5vw,64px)" }}>
          {cols.map(([head, items], i) => (
            <Reveal key={head} delay={i * 0.05}>
              <div style={{ ...tag(LIME), paddingBottom: 12, borderBottom: `2px solid ${LIME}`, marginBottom: 6 }}>{head}</div>
              {items.map(([label, href]) => (
                <Link key={label + href} href={href} className="ff-svc">{label}</Link>
              ))}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══ LOOP: eight steps as a hard band ═══ */
function Loop() {
  const steps = ["Onboard", "Cook", "Deliver", "Log", "Train", "Weigh in", "Recalibrate", "Score"];
  return (
    <section id="loop" style={{ padding: "clamp(70px,9vw,120px) 0", scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <Reveal>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
            <h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "14ch" }}>The loop that runs your day</h2>
            <Link href="/how-it-works" className="ff-a">The full method <ArrowRight size={17} /></Link>
          </div>
        </Reveal>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", marginTop: "clamp(32px,4vw,54px)", borderTop: `1px solid ${RULE}` }}>
          {steps.map((s, i) => (
            <Reveal key={s} delay={(i % 4) * 0.05}>
              <div className="ff-strip" style={{ padding: "22px 18px 26px", borderBottom: `1px solid ${RULE}`, borderRight: `1px solid ${RULE}`, height: "100%", transition: "background .2s" }}>
                <div style={{ ...tag(LIME), fontSize: 11.5 }}>{String(i + 1).padStart(2, "0")}</div>
                <div style={{ ...mid("clamp(1.35rem,2.2vw,1.85rem)"), marginTop: 12 }}>{s}</div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

/* Reusable full-bleed editorial block. Alternates side, no cards. */
function Bleed({ src, alt, duo, flip, title, body, href, cta, points }: {
  src: string; alt: string; duo?: boolean; flip?: boolean; title: string; body: string; href: string; cta: string; points?: string[];
}) {
  return (
    <section className="ff-hov" style={{ borderTop: `1px solid ${RULE}` }}>
      <div className="ff-2col" style={{ display: "grid", gridTemplateColumns: flip ? "1fr 1.1fr" : "1.1fr 1fr", direction: flip ? "rtl" : "ltr" }}>
        <div className="ff-bleed" style={{ position: "relative", minHeight: "clamp(360px,46vw,620px)", direction: "ltr" }}>
          <Frame src={src} alt={alt} sizes="(max-width:1000px) 100vw, 52vw" duo={duo} />
        </div>
        <div style={{ direction: "ltr", display: "flex", alignItems: "center", padding: "clamp(38px,6vw,84px) clamp(20px,4vw,64px)", background: BG }}>
          <div style={{ maxWidth: 540 }}>
            <Reveal>
              <h2 style={huge("clamp(2.1rem,5.4vw,4.2rem)")}>{title}</h2>
              <p style={{ ...copy(16), marginTop: 22 }}>{body}</p>
              {points ? (
                <div style={{ marginTop: 28, borderTop: `1px solid ${RULE}` }}>
                  {points.map((p) => (
                    <div key={p} style={{ display: "flex", gap: 14, padding: "11px 0", borderBottom: `1px solid ${RULE}` }}>
                      <span style={{ color: LIME, fontFamily: COND, fontWeight: 900, fontSize: 15 }}>/</span>
                      <span style={copy(14.5)}>{p}</span>
                    </div>
                  ))}
                </div>
              ) : null}
              <div style={{ marginTop: 30 }}><Link href={href} className="ff-a">{cta} <ArrowRight size={17} /></Link></div>
            </Reveal>
          </div>
        </div>
      </div>
    </section>
  );
}

function Kitchen() {
  return <Bleed src="/images/kitchen.jpg" alt="A chef plating meals in the FitFuel kitchen" title="The kitchen"
    body="Cooked from 04:00 in our FSSAI-licensed Kharadi kitchen and at your door by 08:00, six days a week. Every portion is weighed to your macros before it is sealed."
    points={["126 goal and condition plans", "Veg, egg, non-veg and Jain", "Delivery, packaging and GST included"]}
    href="/our-kitchen" cta="Inside our kitchen" />;
}

function AppBlock() {
  return <Bleed src="/images/training.jpg" alt="An athlete training, tracked in the FitFuel app" duo flip title="The app"
    body="Your meals arrive already logged. Add a workout from an 800+ exercise library and the burn feeds one net-calorie figure, against a target that moves when you plateau."
    points={["Net calories, water and body metrics", "Progress charts that flag a plateau", "One consistency score, zero to a hundred"]}
    href="/how-it-works" cta="See the system" />;
}

function Supplements() {
  return <Bleed src="/images/supplements.jpg" alt="Preparing a protein shake" title="The supplements"
    body="A stack matched to your plan and your condition, not a wall of pills. We explain what each one does and why it fits you, then you order it through Nutrabay at their price."
    points={["Condition-matched doses", "Educational, never pushy", "Ordered via Nutrabay"]}
    href="/supplements" cta="Browse the stack" />;
}

function Partners() {
  return (
    <section style={{ borderTop: `1px solid ${RULE}`, padding: "clamp(70px,9vw,120px) 0" }}>
      <div style={WRAP}>
        <Reveal><h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "16ch" }}>We also feed teams and gyms</h2></Reveal>
        <div className="ff-2col" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2, marginTop: "clamp(34px,4vw,56px)" }}>
          {[
            { src: "/images/corporate.jpg", alt: "A team at work in a Pune office", t: "Corporate wellness", d: "Subsidised, condition-specific meal programs for Pune offices, with reporting your HR team can actually use.", href: "/corporate", cta: "For your team" },
            { src: "/images/gym.jpg", alt: "A gym floor with dumbbells", t: "Gyms and trainers", d: "Your members eat to their macros and you earn on every one. QR onboarding, live client tracking and monthly payouts.", href: "/partners/apply", cta: "Become a partner" },
          ].map((c, i) => (
            <Reveal key={c.t} delay={i * 0.08}>
              <Link href={c.href} className="ff-hov" style={{ display: "block", position: "relative", minHeight: "clamp(360px,38vw,480px)", height: "100%", textDecoration: "none" }}>
                <Frame src={c.src} alt={c.alt} sizes="(max-width:1000px) 100vw, 50vw" duo />
                <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(5,5,4,.94) 6%, rgba(5,5,4,.3) 62%)" }} />
                <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, padding: "clamp(24px,3vw,40px)" }}>
                  <h3 style={mid("clamp(1.7rem,3.2vw,2.6rem)")}>{c.t}</h3>
                  <p style={{ ...copy(14.5), color: "#c6c6c0", marginTop: 12, maxWidth: "42ch" }}>{c.d}</p>
                  <span className="ff-a" style={{ marginTop: 20, fontSize: 16 }}>{c.cta} <ArrowRight size={15} /></span>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Franchise() {
  return <Bleed src="/images/chef-hands.jpg" alt="Fresh ingredients on a prep board" flip title="Franchise the whole system"
    body="FitFuel is also the operating system to run a cloud kitchen. Recipe SOPs, batch scaling and a production board that tells any outlet exactly how much to cook tomorrow."
    points={["Recipe SOPs, portion-scaled", "Production board, auto-computed", "Outlet dispatch and driver boards"]}
    href="/contact" cta="Talk franchise" />;
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
  const gt = "minmax(190px,1.7fr) repeat(4,minmax(84px,1fr))";
  return (
    <section style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <Reveal><h2 style={huge("clamp(2.2rem,6vw,4.6rem)")}>Pick your level</h2></Reveal>
        <Reveal delay={0.05} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          <div style={{ overflowX: "auto", borderTop: `1px solid ${RULE}` }}>
            <div style={{ minWidth: 680 }}>
              <div style={{ display: "grid", gridTemplateColumns: gt, borderBottom: `1px solid ${RULE}` }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "20px 12px", borderLeft: `1px solid ${RULE}`, background: t.on ? "rgba(132,204,22,.07)" : "transparent" }}>
                    <div style={{ ...mid("1.7rem"), color: t.on ? LIME : INK }}>{t.name}</div>
                    <div style={{ ...copy(12.5), color: DIM, marginTop: 5 }}>{t.price}</div>
                  </div>
                ))}
              </div>
              {matrix.map(([label, marks]) => (
                <div key={label} className="ff-strip" style={{ display: "grid", gridTemplateColumns: gt, borderBottom: `1px solid ${RULE}`, transition: "background .2s" }}>
                  <span style={{ ...copy(14), padding: "14px 16px 14px 0" }}>{label}</span>
                  {marks.map((m, ci) => (
                    <span key={ci} style={{ padding: "14px 12px", textAlign: "center", borderLeft: `1px solid ${RULE}`, background: ci === 1 ? "rgba(132,204,22,.04)" : "transparent", color: m ? (ci === 1 ? LIME : MUTE) : "#2e2e2b", fontSize: 15 }}>{m ? "✓" : "·"}</span>
                  ))}
                </div>
              ))}
              <div style={{ display: "grid", gridTemplateColumns: gt }}>
                <span />
                {tiers.map((t) => (
                  <div key={t.name} style={{ padding: "16px 10px", borderLeft: `1px solid ${RULE}` }}>
                    {t.on
                      ? <Link href={t.href} className="ff-btn" style={{ display: "block", textAlign: "center", fontSize: 14, padding: "12px 8px" }}>{t.cta}</Link>
                      : <Link href={t.href} style={{ display: "block", textAlign: "center", ...tag(MUTE), fontSize: 12, textDecoration: "none" }}>{t.cta}</Link>}
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

/* ═══ FINDER ═══ */
function Finder() {
  const [goal, setGoal] = useState<string | null>(null);
  const [diet, setDiet] = useState<string | null>(null);
  const ready = goal && diet;
  const planName = ready ? `${GOAL_NAME[goal!]}, ${DIETS.find((d) => d.key === diet)!.label}` : "";
  const bs = (a: boolean, big: boolean): CSSProperties => ({ background: a ? LIME : "transparent", color: a ? "#000" : "#d0d0ca", border: `1px solid ${a ? LIME : "#33332f"}`, padding: big ? "15px 30px" : "12px 26px", fontSize: big ? 23 : 19 });
  return (
    <section id="finder" style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, scrollMarginTop: 70 }}>
      <div style={WRAP}>
        <Reveal><h2 style={{ ...huge("clamp(2.2rem,6vw,4.6rem)"), maxWidth: "15ch" }}>Find your plan in a minute</h2></Reveal>
        <Reveal delay={0.06} style={{ marginTop: "clamp(30px,4vw,52px)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 18 }}>
            {GOALS.map((g) => <button key={g.key} onClick={() => setGoal(g.key)} className="ff-choice" style={bs(goal === g.key, true)}>{g.label}</button>)}
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
            {DIETS.map((d) => <button key={d.key} onClick={() => setDiet(d.key)} className="ff-choice" style={bs(diet === d.key, false)}>{d.label}</button>)}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20, marginTop: 40, paddingTop: 28, borderTop: `1px solid ${RULE}` }}>
            <span style={{ ...huge("clamp(1.9rem,4.5vw,3.4rem)"), color: ready ? INK : "#2e2e2b" }}>{ready ? planName : "Choose a goal and diet"}</span>
            {ready ? <Link href={`/plans/${goal}-${diet}`} className="ff-btn">See my plan</Link> : null}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ═══ VOICES ═══ */
function Voices() {
  const q = [
    { q: "Down 9 kg in four months and never felt like I was on a diet.", n: "Rhea M.", r: "Weight Loss, Kharadi" },
    { q: "As a trainer I send clients here. The macros are dialled in and my members stick to it.", n: "Aditya K.", r: "Partner, Baner" },
    { q: "The PCOS plan sorted my energy and my cycles. Cooked, delivered, done.", n: "Sneha P.", r: "PCOS, Viman Nagar" },
  ];
  return (
    <section style={{ padding: "clamp(70px,9vw,120px) 0", borderTop: `1px solid ${RULE}`, background: "#050504" }}>
      <div style={WRAP}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", borderTop: `1px solid ${RULE}` }}>
          {q.map((t, i) => (
            <Reveal key={t.n} delay={i * 0.08}>
              <div style={{ padding: "clamp(26px,3vw,40px) clamp(18px,2vw,32px)", borderRight: `1px solid ${RULE}`, borderBottom: `1px solid ${RULE}`, height: "100%", display: "flex", flexDirection: "column" }}>
                <p style={{ ...mid("clamp(1.35rem,2.2vw,1.8rem)"), lineHeight: 1.12, flex: 1 }}>{t.q}</p>
                <div style={{ marginTop: 26 }}>
                  <div style={{ ...copy(14), color: INK }}>{t.n}</div>
                  <div style={{ ...tag(DIM), fontSize: 11, marginTop: 4 }}>{t.r}</div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
        <Reveal style={{ marginTop: 34 }}><Link href="/testimonials" className="ff-a">All reviews <ArrowRight size={17} /></Link></Reveal>
      </div>
    </section>
  );
}

/* ═══ CLOSE ═══ */
function Close() {
  return (
    <section style={{ position: "relative", overflow: "hidden", borderTop: `1px solid ${RULE}` }}>
      <div style={{ position: "relative", minHeight: "min(78vh,700px)", display: "flex", alignItems: "center" }}>
        <Frame src="/images/produce.jpg" alt="Fresh vegetables prepared for the kitchen" sizes="100vw" />
        <div aria-hidden style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg, rgba(7,7,7,.95) 12%, rgba(7,7,7,.6) 62%, rgba(7,7,7,.4))" }} />
        <div style={{ ...WRAP, position: "relative", padding: "clamp(60px,9vw,110px) clamp(18px,4vw,56px)" }}>
          <Reveal>
            <h2 style={huge("clamp(3rem,10vw,8.5rem)")}>Start the trial day.<br /><span style={{ color: LIME }}>Rs 400.</span></h2>
            <p style={{ ...copy(17), maxWidth: "42ch", marginTop: 26 }}>Breakfast plus lunch, delivered tomorrow. No lock-in, no commitment.</p>
            <div style={{ display: "flex", gap: 22, alignItems: "center", flexWrap: "wrap", marginTop: 36 }}>
              <Link href="/plans?trial=true" className="ff-btn">Start your trial day</Link>
              <Link href="/plans" className="ff-a">All plans <ArrowRight size={17} /></Link>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px 30px", marginTop: 44, paddingTop: 24, borderTop: "1px solid rgba(255,255,255,.14)" }}>
              {[[<CountUp key="a" to={126} />, "Plans"], [<CountUp key="b" to={800} suffix="+" />, "Exercises"], [<span key="c">04:00</span>, "Cooked from"], [<span key="d">08:00</span>, "At your door"]].map(([v, l], i) => (
                <span key={i} style={{ display: "inline-flex", alignItems: "baseline", gap: 9 }}>
                  <span style={{ fontFamily: COND, fontWeight: 900, fontSize: 26, color: INK }}>{v}</span>
                  <span style={{ ...tag(DIM), fontSize: 11 }}>{l}</span>
                </span>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
