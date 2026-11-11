"use client";

// app/_hp/v2/Home.tsx
//
// design/FitFuel Homepage v2.dc.html, implemented.
//
// This is the prototype as drawn: its own header with the scroll-progress rule,
// the hero with the pointer tilt and the tumbling box, the welded readout, the
// counts strip with its tally fields, the plates, the thirty-day band and the
// week picker, the plan finder, the price builder, the day as a rotating drum,
// the coach console and its dock, the four checks, the coverage map, the nine
// products, the FAQ panel, the close, the footer and the sticky order bar.
//
// It is one client component because the prototype is one stateful component
// and every one of those parts reads the same state. Data that the database can
// serve is fetched in app/page.tsx and passed down; the prototype's own figures
// are the fallback, so the page renders exactly as designed either way.
//
// Two implementation notes, both from the round 2 review:
// the three faces load once through next/font in app/layout.tsx rather than
// from fonts.googleapis.com, and everything here is a CSS Module rather than a
// <style> block. Nothing else about the design is changed.

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

import s from "./home.module.css";
import { Ring, Marks, PuneMap, BandChart, bandActiveLeft, barcodeBars } from "./graphics";
import {
  FinderSection, PriceSection, FilmSection, CoachSection, ChecksSection,
  CoverageSection, MoreSection, FaqSection, AiDock, ImageSlot,
} from "./Sections";
import {
  ACTS, AREA_TICKS, DIETS, FLOOR, FOOD, GOAL_ADJ as ADJ, GOAL_RATE, KCAL_PER_KG,
  MAX_SWING, PLATE_ACCENT, PUNE_PLACES, SLOTS, TARGET, WEIGH_INS,
  decompose, replyFor, type Door, type Faq,
} from "./data";

const c = (...names: (string | false | undefined)[]) =>
  names.filter(Boolean).map((n) => s[n as string] ?? "").join(" ");

/* components/Navbar.tsx: a 68px inner row plus its 1px bottom hairline. The
   navbar is position:fixed, so the hero has to reserve exactly this or the bar
   lands on the photo stamp. Measured, not guessed. */
const NAV_H = 69;

const MONO = "var(--font-mono), monospace";
const COND = "var(--fk-display), Georgia, serif";
const SANS = "var(--font-archivo), sans-serif";

export type Dish = {
  slot: string; name: string; blurb: string; cuisine: string;
  kcal: number; protein: number; carbs: number; fat: number; fibre: number;
};
export type Day = { d: number; dishes: Dish[]; kcal: number; protein: number; fibre: number };

export type HomeProps = {
  days: Day[];
  band: number[];
  counts: Record<string, number>;
  coupons: { code: string; headline: string; terms: string }[];
  durations: [string, number, number, string][];
  doors: Door[];
  faqs: Faq[];
  waHref: string;
  licence: string;
};

export default function Home(props: HomeProps) {
  const { days, band, counts, coupons, durations, doors, faqs, waHref, licence } = props;

  const [day, setDay] = useState(0);
  const [door, setDoor] = useState(0);
  const [dur, setDur] = useState(0);
  /* No scrollPct here: the prototype's header drew the progress rule and the
     site navbar now draws its own. showBar is still ours, for the order bar. */
  const [showBar, setShowBar] = useState(false);
  const [now, setNow] = useState<number | null>(null);
  const [rev, setRev] = useState(0);
  const [cnt, setCnt] = useState(1);
  const [sex, setSex] = useState("m");
  const [wt, setWt] = useState(78);
  const [ht, setHt] = useState(174);
  const [age, setAge] = useState(31);
  const [act, setAct] = useState(2);
  const [diet, setDiet] = useState(0);
  const [hour, setHour] = useState(0);
  const [aiOpen, setAiOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const [faqCat, setFaqCat] = useState("all");
  const [faqQuery, setFaqQuery] = useState("");
  const [faqOpen, setFaqOpen] = useState(0);
  const [armed, setArmed] = useState(false);
  const [chat, setChat] = useState<{ who: string; text: string; figures?: string[] }[]>([
    { who: "you", text: "I have not lost anything for two weeks. Am I doing something wrong?" },
    {
      who: "coach",
      text: "No. Four weigh-ins say 78.4, 78.2, 78.3, 78.2 kg, so your actual rate is 0.05 kg a week against the 0.50 your goal needs. Through 7,700 kcal per kg that gap is 495 kcal a day, which the ±300 cap holds at 300. Your target moves from 1,800 to 1,690 kcal if you accept it.",
      figures: ["−0.45 kg/wk gap", "cap: ±300 kcal", "1,800 → 1,690"],
    },
  ]);

  const heroRef = useRef<HTMLElement | null>(null);
  const stageRef = useRef<HTMLDivElement | null>(null);
  const stripRef = useRef<HTMLDivElement | null>(null);
  const hovering = useRef(false);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  /* eases a 0→1 progress, stepped at ~14fps so counting never fights layout */
  const ramp = useCallback((set: (n: number) => void, ms: number) => {
    const t0 = performance.now();
    let last = 0;
    let raf = 0;
    const step = () => {
      const t = performance.now();
      const k = Math.min(1, (t - t0) / ms);
      if (t - last > 70 || k === 1) {
        last = t;
        set(1 - Math.pow(1 - k, 3));
      }
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    /* rAF is throttled in background tabs: guarantee the final value lands. */
    const end = setTimeout(() => set(1), ms + 700);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(end);
    };
  }, []);

  useEffect(() => {
    const onScroll = () => {
      const el = document.scrollingElement || document.documentElement;
      const y = window.scrollY;
      setShowBar(y > window.innerHeight * 0.7 && y + window.innerHeight < el.scrollHeight - 260);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* The countdown renders as placeholder dashes on the server and takes its
       first real value on the next frame, so the markup React hydrates against
       cannot disagree with the clock. Set from a rAF callback rather than the
       effect body: a synchronous setState here cascades a second render. */
    const tick = setInterval(() => setNow(Date.now()), 1000);
    const firstTick = requestAnimationFrame(() => setNow(Date.now()));

    /* The drum turns itself, but only while it is on screen and unhovered. */
    const hourTimer = setInterval(() => {
      const stage = stageRef.current;
      if (!stage || hovering.current || document.visibilityState !== "visible") return;
      const r = stage.getBoundingClientRect();
      if (r.bottom < 60 || r.top > window.innerHeight - 60) return;
      setHour((h) => (h + 1) % 7);
    }, 6000);

    const stage = stageRef.current;
    const onEnter = () => { hovering.current = true; };
    const onLeave = () => { hovering.current = false; };
    if (stage) {
      stage.addEventListener("mouseenter", onEnter);
      stage.addEventListener("mouseleave", onLeave);
    }

    let stopRev: (() => void) | undefined;
    let stopCnt: (() => void) | undefined;
    let io: IntersectionObserver | undefined;
    let reducedRaf = 0;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      stopRev = ramp(setRev, 1500);
      if (stripRef.current && "IntersectionObserver" in window) {
        io = new IntersectionObserver(
          (es) => {
            if (es.some((e) => e.isIntersecting)) {
              io?.disconnect();
              setCnt(0);
              stopCnt = ramp(setCnt, 1400);
            }
          },
          { threshold: 0.25 },
        );
        io.observe(stripRef.current);
      }
    } else {
      /* Reduced motion: both counters jump straight to their final value. Set
         from a frame callback rather than the effect body, same reason as the
         clock above. */
      reducedRaf = requestAnimationFrame(() => {
        setRev(1);
        setCnt(1);
      });
    }

    /* Only arm the reveals when the document is actually being painted: in a
       hidden tab the animation clock sits at 0 and any fill-mode from-state
       would render as blank. */
    const arm = () => {
      if (document.visibilityState !== "visible") return;
      setArmed(true);
      document.removeEventListener("visibilitychange", arm);
    };
    arm();
    document.addEventListener("visibilitychange", arm);

    /* Infinite decorative motion only runs while its own section is on screen. */
    let loops: IntersectionObserver | undefined;
    if ("IntersectionObserver" in window) {
      loops = new IntersectionObserver(
        (es) => es.forEach((e) => e.target.classList.toggle(s["v2-idle"]!, !e.isIntersecting)),
        { rootMargin: "80px" },
      );
      document
        .querySelectorAll(`.${s["v2-hero"]}, .${s["v2-readout"]}, .${s["v2-stage"]}, .${s["v2-ai"]}, .${s["v2-proof"]}`)
        .forEach((el) => {
          el.classList.add(s["v2-idle"]!);
          loops!.observe(el);
        });
    }

    const hero = heroRef.current;
    let pending: number | null = null;
    const onMove = (e: PointerEvent) => {
      if (pending || !hero) return;
      const x = e.clientX;
      const y = e.clientY;
      pending = requestAnimationFrame(() => {
        pending = null;
        const r = hero.getBoundingClientRect();
        hero.style.setProperty("--mx", (((x - r.left) / r.width) * 2 - 1).toFixed(3));
        hero.style.setProperty("--my", (((y - r.top) / r.height) * 2 - 1).toFixed(3));
      });
    };
    hero?.addEventListener("pointermove", onMove);

    return () => {
      window.removeEventListener("scroll", onScroll);
      clearInterval(tick);
      cancelAnimationFrame(firstTick);
      clearInterval(hourTimer);
      if (stage) {
        stage.removeEventListener("mouseenter", onEnter);
        stage.removeEventListener("mouseleave", onLeave);
      }
      stopRev?.();
      stopCnt?.();
      cancelAnimationFrame(reducedRaf);
      io?.disconnect();
      loops?.disconnect();
      document.removeEventListener("visibilitychange", arm);
      hero?.removeEventListener("pointermove", onMove);
      if (replyTimer.current) clearTimeout(replyTimer.current);
    };
  }, [ramp]);

  const ask = (q: string) => {
    const question = String(q || "").trim();
    if (!question) return;
    const a = replyFor(question);
    setChat((prev) => prev.concat([{ who: "you", text: question }]));
    setDraft("");
    setThinking(true);
    if (replyTimer.current) clearTimeout(replyTimer.current);
    replyTimer.current = setTimeout(() => {
      setChat((prev) => prev.concat([{ who: "coach", text: a.text, figures: a.figures }]));
      setThinking(false);
    }, 850);
  };

  /* ── the week ── */
  const active = days[day] ?? days[0]!;
  const peak = Math.max(...days.map((x) => x.kcal));
  const floorK = Math.min(...days.map((x) => x.kcal)) - 150;

  /* ── the coach ── */
  const w = WEIGH_INS;
  const actualRate = (w[1]! - w[3]!) / 2;
  const plateau = Math.abs(w[1]! - w[3]!) < 0.5;
  const raw = Math.round(((GOAL_RATE - actualRate) * KCAL_PER_KG) / 7);
  const capped = Math.max(-MAX_SWING, Math.min(MAX_SWING, raw));
  const capBit = Math.abs(raw) > MAX_SWING;
  const proposed = Math.max(FLOOR, Math.round(TARGET - capped));
  const floorBit = Math.round(TARGET - capped) < FLOOR;
  const sign = (n: number) => (n > 0 ? "−" : "+") + Math.abs(n);

  /* ── the 9pm IST cut-off, live ── */
  const countdown = useMemo(() => {
    if (now === null) return "--:--:--";
    const nowIst = new Date(now + (5.5 * 60 + new Date().getTimezoneOffset()) * 60000);
    let ms = (21 - nowIst.getHours()) * 3600000 - nowIst.getMinutes() * 60000 - nowIst.getSeconds() * 1000;
    if (ms < 0) ms += 86400000;
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(Math.floor(ms / 3600000))}:${pad(Math.floor(ms / 60000) % 60)}:${pad(Math.floor(ms / 1000) % 60)}`;
  }, [now]);

  /* ── the price builder ── */
  const [dName, dCount, dSub, dBlurb] = durations[dur]!;
  const p = decompose(dSub, dCount);

  const activeDoor = doors[door]!;
  const count = (n: number) => Math.round(n * cnt).toLocaleString("en-IN");

  /* ── the finder ── */
  const plan = useMemo(() => {
    const bmr = Math.round(10 * wt + 6.25 * ht - 5 * age + (sex === "m" ? 5 : -161));
    const mult = ACTS[act]![1];
    const tdee = Math.round(bmr * mult);
    const adj = ADJ[door] ?? 0;
    const swing = Math.round(tdee * adj);
    const rawT = tdee + swing;
    const target = Math.max(FLOOR, Math.round(rawT / 10) * 10);
    const kpg: Record<string, number> = { Protein: 4, Carbohydrate: 4, Fat: 9 };
    const shares = days[0]!.dishes.map((d) => d.kcal);
    const shareSum = shares.reduce((a, b) => a + b, 0);
    return {
      accent: activeDoor.accent,
      name: activeDoor.goal + " (" + DIETS[diet] + ")",
      matches: activeDoor.count,
      target: target.toLocaleString("en-IN"),
      rate: adj < 0 ? "a held deficit" : adj > 0 ? "a finishable surplus" : "maintenance",
      macros: activeDoor.split.map(([name, v, pct, color]) => ({
        name, v, color, pct, g: Math.round((target * pct) / 100 / (kpg[name] || 4)),
      })),
      ledger: [
        { k: "Resting energy, Mifflin St Jeor", v: bmr.toLocaleString("en-IN") + " kcal", fg: "var(--fk-ink-2)", vfg: "var(--fk-ink)" },
        { k: ACTS[act]![0] + " week, × " + mult.toFixed(3), v: tdee.toLocaleString("en-IN") + " kcal", fg: "var(--fk-ink-2)", vfg: "var(--fk-ink)" },
        {
          k: adj === 0 ? "No goal adjustment on maintenance" : (adj < 0 ? "Deficit for " + activeDoor.goal.toLowerCase() : "Surplus for " + activeDoor.goal.toLowerCase()) + ", " + Math.round(Math.abs(adj) * 100) + "%",
          v: (swing > 0 ? "+" : swing < 0 ? "−" : "") + Math.abs(swing).toLocaleString("en-IN") + " kcal",
          fg: "var(--fk-ink-2)", vfg: swing === 0 ? "var(--fk-ink-3)" : activeDoor.accent,
        },
        { k: rawT < FLOOR ? "Held at the 1,200 kcal floor" : "Above the 1,200 kcal floor", v: rawT < FLOOR ? "floor applied" : "no floor needed", fg: "var(--fk-ink-3)", vfg: rawT < FLOOR ? "#f59e0b" : "var(--fk-ink-3)" },
        { k: "Your target, rounded to ten", v: target.toLocaleString("en-IN") + " kcal", fg: "var(--fk-ink)", vfg: activeDoor.accent },
      ],
      meals: SLOTS.map((name, i) => ({
        name, share: shares[i]!,
        kcal: Math.round((target * shares[i]!) / shareSum),
        bg: ["var(--fk-green-wash)", "var(--fk-green-wash)", "var(--fk-green-deep)", "var(--fk-green)"][i]!, fg: "var(--fk-paper)",
      })),
    };
  }, [wt, ht, age, sex, act, door, diet, activeDoor, days]);

  /* ── the faq ── */
  const faqQ = faqQuery.trim().toLowerCase();
  const faqList = faqs.filter(
    (f) => (faqCat === "all" || f.cat === faqCat) && (!faqQ || (f.q + " " + f.a).toLowerCase().includes(faqQ)),
  );

  const barcode = useMemo(() => barcodeBars(), []);
  const glyphs = useMemo(
    () => ({
      plans: <Marks count={counts.plans ?? 126} per={1} cols={14} accent="var(--fk-green-deep)" className={c("v2-wipe")} />,
      conditions: <Marks count={counts.conditions ?? 38} per={1} cols={8} accent="#2dd4bf" className={c("v2-wipe")} />,
      exercises: <Marks count={counts.exercises ?? 952} per={8} cols={14} accent="#f59e0b" className={c("v2-wipe")} />,
      supplements: <Marks count={counts.supplements ?? 46} per={1} cols={8} accent="#38bdf8" className={c("v2-wipe")} />,
      foods: <Marks count={counts.foods ?? 154} per={1} cols={16} accent="var(--fk-green)" className={c("v2-wipe")} />,
      prices: <Marks count={counts.prices ?? 3614} per={32} cols={14} accent="var(--fk-ink-2)" className={c("v2-wipe")} />,
    }),
    [counts],
  );
  const bandChart = useMemo(() => <BandChart k={band} />, [band]);
  const map = useMemo(() => <PuneMap places={PUNE_PLACES} />, []);

  const ticker = [
    { n: count(counts.plans ?? 126), l: "plans", accent: "var(--fk-green-deep)", glyph: glyphs.plans, scale: "one mark each" },
    { n: count(counts.conditions ?? 38), l: "conditions", accent: "#2dd4bf", glyph: glyphs.conditions, scale: "one mark each" },
    { n: count(counts.exercises ?? 952), l: "exercises", accent: "#f59e0b", glyph: glyphs.exercises, scale: "one mark = 8" },
    { n: count(counts.supplements ?? 46), l: "supplements", accent: "#38bdf8", glyph: glyphs.supplements, scale: "one mark each" },
    { n: count(counts.foods ?? 154), l: "foods", accent: "var(--fk-green)", glyph: glyphs.foods, scale: "one mark each" },
    { n: count(counts.prices ?? 3614), l: "published prices", accent: "var(--fk-ink)", glyph: glyphs.prices, scale: "one mark = 32" },
  ];

  const label12 = { fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none" as const, color: "var(--fk-ink-3)" };
  const h2 = (max: string) => ({
    fontFamily: COND, fontWeight: 600, fontSize: "clamp(2.4rem,6.6vw,5.4rem)", lineHeight: 1.06,
    letterSpacing: "-0.03em", textTransform: "none" as const, color: "var(--fk-ink)", margin: 0, maxWidth: max,
  });
  const deck = { fontFamily: SANS, fontSize: 16.5, lineHeight: 1.62, color: "var(--fk-ink-2)", margin: 0, maxWidth: "48ch" };
  const WRAP = { width: "100%", maxWidth: 1240, margin: "0 auto", padding: "0 clamp(18px,4vw,40px)" } as const;
  const RULE = { height: 1, background: "var(--fk-line)", margin: "14px 0 clamp(26px,4vw,44px)" } as const;

  return (
    <div
      id="v2-top"
      className={c("root", armed && "v2-on")}
      style={{ position: "relative", background: "var(--fk-paper)", color: "var(--fk-ink)", minHeight: "100vh", overflowX: "clip", fontFamily: SANS }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "fixed", inset: 0, zIndex: 3, pointerEvents: "none", opacity: 0.055, mixBlendMode: "overlay",
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='180' height='180' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />

      {/* ══ NAV ══
          The site navbar (components/Navbar.tsx) is the header on this page,
          as it is on every other. The prototype drew its own, and the two are
          the same object: logo left, links centre, a priced order button
          right, and a lime scroll-progress rule along the bottom edge. Yours
          additionally knows whether you are signed in, carries the Plans and
          Company dropdowns, and has a mobile overlay, so keeping both would
          have meant two fixed bars and 134px of chrome above the hero.

          What went with it are the five section anchors (Tomorrow, The week,
          Find your plan, Price, The coach). On a page this long they are
          worth having; say the word and they come back as a slim strip under
          the navbar rather than inside it. */}

      {/* ══ HERO ══ */}
      <section ref={heroRef as React.RefObject<HTMLElement>} aria-labelledby="v2-h1" className={c("v2-hero")} style={{ position: "relative", paddingTop: NAV_H, borderBottom: "1px solid var(--fk-line)", overflow: "hidden" }}>
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(var(--fk-surface) 1px,transparent 1px),linear-gradient(90deg,var(--fk-surface) 1px,transparent 1px)", backgroundSize: "88px 88px", opacity: 0.75, pointerEvents: "none" }} />
        <div aria-hidden="true" className={c("v2-loop", "aScan9")} style={{ position: "absolute", left: 0, right: 0, top: 0, height: "9%", background: "linear-gradient(180deg,transparent,var(--fk-green-wash),transparent)", willChange: "transform", pointerEvents: "none" }} />

        <div className={c("v2-hero-grid")} style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0,1.05fr) minmax(0,0.95fr)", alignItems: "stretch", minHeight: `calc(100svh - ${NAV_H}px)` }}>
          <div style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(44px,8vh,96px) clamp(24px,3.4vw,56px) clamp(36px,6vh,64px) max(clamp(18px,4vw,40px),calc((100vw - 1240px) / 2))" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: "clamp(20px,3vh,32px)" }}>
              <span aria-hidden="true" className={c("v2-loop", "aFloat24")} style={{ width: 7, height: 7, background: "var(--fk-green)" }} />
              <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.22em", textTransform: "none", color: "var(--fk-ink-3)" }}>Kharadi kitchen · cooking now</span>
              <span aria-hidden="true" style={{ flex: 1, height: 1, background: "var(--fk-line)", maxWidth: 120 }} />
            </div>

            <h1 id="v2-h1" style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(3rem,6.4vw,6.8rem)", lineHeight: 1.06, letterSpacing: "-0.035em", textTransform: "none", color: "var(--fk-ink)", margin: 0 }}>
              <span className={c("v2-line")}><span style={{ animationDelay: ".05s" }}>Never decide </span></span>
              <span className={c("v2-line")}><span style={{ animationDelay: ".16s" }}>what to eat </span></span>
              <span className={c("v2-line")} style={{ color: "var(--fk-green)" }}><span style={{ animationDelay: ".27s" }}>again.</span></span>
            </h1>

            <p className={c("v2-in")} style={{ fontFamily: SANS, fontSize: "clamp(16px,1.4vw,18.5px)", lineHeight: 1.62, color: "var(--fk-ink-2)", margin: "clamp(22px,3vh,32px) 0 0", maxWidth: "44ch", animationDelay: ".42s" }}>
              Four chef-cooked meals, weighed to your macros on a scale, at your door by{" "}
              <b style={{ color: "var(--fk-ink)", fontWeight: 600 }}>08:00</b>, six mornings a week. No cooking, no counting, no 7pm Swiggy decision.
            </p>

            <div className={c("v2-in")} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 18, marginTop: "clamp(24px,3.6vh,36px)", animationDelay: ".54s" }}>
              <Link href="/plans?trial=true" className={c("v2-btn")} style={{ display: "inline-flex", alignItems: "center", background: "var(--fk-green)", color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 17, letterSpacing: "0", textTransform: "none", padding: "17px 30px", minHeight: 52, border: "1px solid var(--fk-green)" }}>
                <span>Start with one day, ₹{decompose(400, 1).total}</span>
              </Link>
              <a href="#v2-plates" className={c("v2-underline")} style={{ display: "inline-block", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-green)", paddingBottom: 3 }}>See tomorrow&rsquo;s four meals</a>
            </div>

            <div className={c("v2-in")} style={{ display: "flex", alignItems: "baseline", gap: 14, flexWrap: "wrap", marginTop: "clamp(26px,4vh,40px)", paddingTop: 20, borderTop: "1px solid var(--fk-line)", animationDelay: ".66s" }}>
              <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>Cut-off for tomorrow</span>
              <span suppressHydrationWarning style={{ fontFamily: MONO, fontWeight: 700, fontSize: "clamp(18px,2.2vw,24px)", color: "var(--fk-ink)", fontVariantNumeric: "tabular-nums", letterSpacing: "0.02em" }}>{countdown}</span>
              <span style={{ fontFamily: SANS, fontSize: 13.5, color: "var(--fk-ink-2)" }}>order by 9pm, eat at 8am</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid var(--fk-line)", minHeight: "52vh" }}>
            <figure style={{ position: "relative", margin: 0, flex: 1, minHeight: "38vh", overflow: "hidden", background: "var(--fk-surface)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero-bowl.jpg" alt="A FitFuel plate, cooked and weighed this morning in Kharadi" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: "76% 54%", filter: FOOD }} />
              <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(200deg,rgba(7,7,7,0) 40%,rgba(7,7,7,0.72))" }} />
              <figcaption style={{ position: "absolute", left: 0, top: 0, display: "flex", alignItems: "center", gap: 9, background: "var(--fk-paper)", borderRight: "1px solid var(--fk-line)", borderBottom: "1px solid var(--fk-line)", padding: "10px 14px", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>
                <span aria-hidden="true" style={{ width: 6, height: 6, background: "var(--fk-green)" }} />Weighed at 06:31 today
              </figcaption>
            </figure>

            <div className={c("v2-hero-deck")} style={{ position: "relative", display: "grid", gridTemplateColumns: "minmax(0,1fr) auto", gap: "clamp(16px,2.4vw,32px)", alignItems: "center", background: "var(--fk-paper)", borderTop: "1px solid var(--fk-line)", padding: "clamp(18px,2.4vw,30px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "clamp(14px,1.8vw,22px)" }}>
                <div style={{ position: "relative", width: "clamp(88px,8.4vw,124px)", aspectRatio: "1", display: "grid", placeItems: "center" }}>
                  <Ring kcal={days[0]!.kcal} protein={81} carbs={218} fat={41} sw={9} pal={["var(--fk-ink)", "var(--fk-ink-2)", "var(--fk-line-2)"]} />
                  <b style={{ position: "relative", fontFamily: COND, fontWeight: 600, fontSize: "clamp(22px,2.2vw,31px)", lineHeight: 1, letterSpacing: "-0.03em", color: "var(--fk-ink)", fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(days[0]!.kcal * (0.06 + 0.94 * rev)).toLocaleString("en-IN")}
                  </b>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>Tomorrow</span>
                  <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.1em", textTransform: "none", color: "var(--fk-ink)" }}>kcal · {Math.round(days[0]!.protein)}g protein</span>
                  <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.1em", color: "var(--fk-ink-3)" }}>4 meals, weighed</span>
                </div>
              </div>

              <div className={c("v2-hide-sm")} aria-hidden="true" style={{ width: "clamp(150px,15vw,214px)", height: "clamp(126px,12vw,168px)", perspective: "760px", display: "grid", placeItems: "center" }}>
                <div className={c("v2-tilt")} style={{ width: "100%", height: "100%", display: "grid", placeItems: "center" }}>
                  <div className={c("v2-loop", "aFloat8")}>
                    <div className={c("v2-box")} style={{ position: "relative", width: 150, height: 44 }}>
                      <div className={c("v2-box-face")} style={{ width: 150, height: 44, transform: "translateZ(56px)" }} />
                      <div className={c("v2-box-face")} style={{ width: 150, height: 44, transform: "rotateY(180deg) translateZ(56px)", background: "var(--fk-paper)" }} />
                      <div className={c("v2-box-face")} style={{ width: 112, height: 44, left: 19, transform: "rotateY(90deg) translateZ(75px)", background: "var(--fk-surface)" }} />
                      <div className={c("v2-box-face")} style={{ width: 112, height: 44, left: 19, transform: "rotateY(-90deg) translateZ(75px)", background: "var(--fk-paper)" }} />
                      <div className={c("v2-box-face")} style={{ width: 150, height: 112, top: -34, transform: "rotateX(90deg) translateZ(22px)", background: "var(--fk-surface)", display: "grid", gridTemplateColumns: "1fr 1fr", gridTemplateRows: "1fr 1fr", gap: 1, padding: 6 }}>
                        <span style={{ background: "var(--fk-green)" }} />
                        <span style={{ background: "var(--fk-green-deep)" }} />
                        <span style={{ background: "var(--fk-green-deep)" }} />
                        <span style={{ background: "var(--fk-warm)" }} />
                      </div>
                      <div className={c("v2-box-face")} style={{ width: 150, height: 112, top: -34, transform: "rotateX(-90deg) translateZ(22px)", background: "var(--fk-paper)" }} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══ READOUT, WELDED TO THE HERO ══ */}
      <div className={c("v2-readout")} style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", background: "var(--fk-surface)", borderBottom: "1px solid var(--fk-line)", padding: "0 max(clamp(18px,4vw,40px),calc((100vw - 1240px) / 2))" }}>
        <div className={c("v2-cell")} style={{ padding: "clamp(18px,2.4vw,28px) clamp(14px,2.2vw,26px)", borderLeft: "1px solid var(--fk-line)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.4rem)", lineHeight: 1.06, letterSpacing: "-0.04em", color: "var(--fk-ink)", fontVariantNumeric: "tabular-nums" }}>08:00</div>
          <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "var(--fk-ink-2)" }}>at your door, six mornings a week</div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            <div aria-hidden="true" style={{ position: "relative", height: 18, borderLeft: "1px solid var(--fk-line-2)", borderRight: "1px solid var(--fk-line-2)" }}>
              <span style={{ position: "absolute", left: 0, right: 0, top: 8, height: 1, background: "var(--fk-line)" }} />
              <span className={c("aGrow9")} style={{ position: "absolute", left: "16.7%", width: "16.6%", top: 3, height: 12, background: "var(--fk-green)", transformOrigin: "left", animationDelay: ".2s" }} />
              <span className={c("v2-loop", "aTravel6")} aria-hidden="true" style={{ position: "absolute", top: 1, left: "16.7%", width: "16.6%", height: 16, willChange: "transform" }}>
                <span style={{ display: "block", width: 6, height: 16, background: "var(--fk-ink)" }} />
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, letterSpacing: "0.12em", textTransform: "none", color: "var(--fk-ink-3)" }}>
              <span>00:00</span><span style={{ color: "var(--fk-ink)" }}>04:00 cook</span><span style={{ color: "var(--fk-ink)" }}>08:00 door</span><span>24:00</span>
            </div>
          </div>
        </div>

        <div className={c("v2-cell")} style={{ padding: "clamp(18px,2.4vw,28px) clamp(14px,2.2vw,26px)", borderLeft: "1px solid var(--fk-line)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.4rem)", lineHeight: 1.06, letterSpacing: "-0.04em", color: "var(--fk-ink)", fontVariantNumeric: "tabular-nums" }}>₹{decompose(400, 1).total}</div>
          <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "var(--fk-ink-2)" }}>one full day, four meals, all in, nothing to cancel</div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            <div aria-hidden="true" style={{ display: "flex", height: 12, gap: 1 }}>
              {[["71.4%", "var(--fk-ink)", ".1s"], ["11.9%", "var(--fk-green-deep)", ".22s"], ["11.9%", "var(--fk-ink-3)", ".34s"], ["4.8%", "var(--fk-line-2)", ".46s"]].map(([wd, bg, d], i) => (
                <span key={i} className={c("aGrow7")} style={{ width: wd, background: bg, transformOrigin: "left", animationDelay: d }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", gap: 8, fontFamily: SANS, fontSize: 12, letterSpacing: "0.12em", textTransform: "none", color: "var(--fk-ink-3)" }}>
              <span>food 300</span><span>del 50</span><span>pack 50</span><span>gst 20</span>
            </div>
          </div>
        </div>

        <div className={c("v2-cell")} style={{ padding: "clamp(18px,2.4vw,28px) clamp(14px,2.2vw,26px)", borderLeft: "1px solid var(--fk-line)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.4rem)", lineHeight: 1.06, letterSpacing: "-0.04em", color: "var(--fk-ink)", fontVariantNumeric: "tabular-nums" }}>15</div>
          <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "var(--fk-ink-2)" }}>areas of east Pune, from one kitchen in Kharadi</div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            <div aria-hidden="true" style={{ display: "flex", alignItems: "flex-end", gap: 3, height: 18 }}>
              <span style={{ flex: 1, height: 18, background: "var(--fk-ink)" }} />
              {AREA_TICKS.map((h, i) => (
                <span key={i} className={c("aMark5")} style={{ flex: 1, height: h, background: "var(--fk-line-2)", transformOrigin: "bottom", animationDelay: `${240 + i * 45}ms` }} />
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, letterSpacing: "0.12em", textTransform: "none", color: "var(--fk-ink-3)" }}>
              <span style={{ color: "var(--fk-ink)" }}>Kharadi, the kitchen</span><span>14 delivered</span>
            </div>
          </div>
        </div>

        <div className={c("v2-cell")} style={{ padding: "clamp(18px,2.4vw,28px) clamp(14px,2.2vw,26px)", borderLeft: "1px solid var(--fk-line)", display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.5rem,3vw,2.4rem)", lineHeight: 1.06, letterSpacing: "-0.04em", color: "var(--fk-ink)", fontVariantNumeric: "tabular-nums" }}>FSSAI</div>
          <div style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "var(--fk-ink-2)" }}>our own licence, not a rented shift</div>
          <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: 7 }}>
            <div aria-hidden="true" style={{ display: "flex", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)" }}>
              {licence.split("").map((d, i) => (
                <span key={i} style={{ flex: 1, textAlign: "center", padding: "3px 0", background: "var(--fk-paper)", fontFamily: SANS, fontSize: 12, color: "var(--fk-ink)", overflow: "hidden" }}>
                  <span className={c("aFlip4")} style={{ display: "block", animationDelay: `${200 + i * 42}ms` }}>{d}</span>
                </span>
              ))}
            </div>
            <span className="sr-only">FSSAI licence {licence}</span>
            <div style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.12em", textTransform: "none", color: "var(--fk-ink-3)" }}>verified against the FSSAI register</div>
          </div>
        </div>
      </div>

      {/* ══ THE COUNTS ══ */}
      <div ref={stripRef} className={c("v2-strip")} style={{ display: "grid", gridTemplateColumns: "repeat(6,minmax(0,1fr))", background: "var(--fk-surface)", borderBottom: "1px solid var(--fk-line)" }}>
        {ticker.map((t) => (
          <div key={t.l} className={c("v2-cell")} style={{ display: "flex", flexDirection: "column", borderLeft: "1px solid var(--fk-line)" }}>
            <div style={{ position: "relative", aspectRatio: "16/10", background: "var(--fk-paper)", borderBottom: "1px solid var(--fk-line)", padding: "clamp(12px,1.6vw,20px)" }}>
              <div style={{ position: "absolute", inset: "clamp(12px,1.6vw,20px)" }}>{t.glyph}</div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "clamp(16px,2vw,24px) clamp(12px,1.8vw,20px)" }}>
              <b style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.7rem,3.4vw,2.9rem)", lineHeight: 1.06, letterSpacing: "-0.035em", color: t.accent, fontVariantNumeric: "tabular-nums" }}>{t.n}</b>
              <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>{t.l}</span>
              <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>{t.scale}</span>
            </div>
          </div>
        ))}
      </div>

      {/* ══ TOMORROW: THE FOUR PLATES ══ */}
      <section id="v2-plates" aria-labelledby="v2-plates-h" style={{ padding: "clamp(56px,7vw,96px) 0" }}>
        <div style={WRAP}>
          <div aria-hidden="true" style={RULE} />
          <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
            <div className={c("v2-rise")}>
              <h2 id="v2-plates-h" style={h2("14ch")}>This is what turns up tomorrow morning</h2>
            </div>
            <div className={c("v2-rise")}>
              <p style={deck}>Four real dishes from the Weight Loss (Veg) schedule, with the macros the kitchen weighs them to. Protein, carbohydrate and fat are the dish&rsquo;s own weighed figures, not a plan average.</p>
              <div style={{ display: "flex", gap: "clamp(18px,3vw,36px)", flexWrap: "wrap", marginTop: 24 }}>
                {([[Math.round(days[0]!.kcal).toLocaleString("en-IN"), "kcal across the day", "var(--fk-green)"], [Math.round(days[0]!.protein) + "g", "protein, weighed", "var(--fk-ink)"], ["04:00", "cook starts", "var(--fk-ink)"]] as [string, string, string][]).map(([n, l, col]) => (
                  <div key={l}>
                    <b style={{ display: "block", fontFamily: COND, fontWeight: 600, fontSize: "clamp(26px,3.6vw,40px)", lineHeight: 1.06, letterSpacing: "-0.03em", color: col, fontVariantNumeric: "tabular-nums" }}>{n}</b>
                    <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>{l}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className={c("v2-plates")} style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1fr", gap: 1, background: "var(--fk-line)", border: "1px solid var(--fk-line)", marginTop: "clamp(30px,4vw,52px)" }}>
            {days[0]!.dishes.map((d, i) => {
              const t = d.protein + d.carbs + d.fat;
              const accent = PLATE_ACCENT[i]!;
              const bars = [
                { name: "Protein", v: Math.round(d.protein) + "g", pct: Math.round((d.protein / t) * 100), color: accent, delay: 200 + i * 90 },
                { name: "Carbs", v: Math.round(d.carbs) + "g", pct: Math.round((d.carbs / t) * 100), color: "var(--fk-ink-2)", delay: 290 + i * 90 },
                { name: "Fat", v: Math.round(d.fat) + "g", pct: Math.round((d.fat / t) * 100), color: "var(--fk-ink-3)", delay: 380 + i * 90 },
              ];
              return (
                <article key={d.slot} className={c("v2-plate", "v2-in")} style={{ position: "relative", background: "var(--fk-paper)", display: "flex", flexDirection: "column", border: "1px solid transparent", animationDelay: `${60 + i * 90}ms` }}>
                  <span aria-hidden="true" className={c("v2-rule")} style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: accent, transform: "scaleX(0.18)", transformOrigin: "left", transition: "transform .4s cubic-bezier(.16,1,.3,1)", zIndex: 2 }} />
                  <div style={{ position: "relative", aspectRatio: "4/3", overflow: "hidden", background: "var(--fk-paper)" }}>
                    <ImageSlot placeholder={d.name} />
                    <span aria-hidden="true" className={c("v2-scan")} style={{ top: "-34%" }} />
                    <span style={{ position: "absolute", top: 0, left: 0, pointerEvents: "none", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-paper)", background: accent, padding: "7px 11px", zIndex: 2 }}>{d.slot}</span>
                    <b aria-hidden="true" className={c("v2-idx")} style={{ position: "absolute", right: 10, bottom: 2, pointerEvents: "none", fontFamily: COND, fontWeight: 600, fontSize: "clamp(3.4rem,6vw,5.4rem)", lineHeight: 1.06, letterSpacing: "-0.04em", color: accent, opacity: 0.28, zIndex: 2 }}>{String(i + 1).padStart(2, "0")}</b>
                  </div>
                  <div style={{ padding: "clamp(18px,2vw,24px)", display: "flex", flexDirection: "column", flex: 1 }}>
                    <span style={{ display: "block", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: accent, marginBottom: 9 }}>{d.cuisine}</span>
                    <h3 style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.1rem,1.7vw,1.35rem)", lineHeight: 1, letterSpacing: "-0.01em", textTransform: "none", color: "var(--fk-ink)", margin: 0 }}>{d.name}</h3>
                    <p style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: "var(--fk-ink-2)", margin: "10px 0 0" }}>{d.blurb}</p>
                    <div style={{ marginTop: "auto", paddingTop: 20, display: "flex", flexDirection: "column", gap: 9 }}>
                      {bars.map((b) => (
                        <div key={b.name}>
                          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: SANS, fontSize: 12, letterSpacing: "0.12em", textTransform: "none", color: "var(--fk-ink-3)", marginBottom: 5 }}>
                            <span>{b.name}</span><span style={{ color: "var(--fk-ink)" }}>{b.v}</span>
                          </div>
                          <div style={{ height: 4, background: "var(--fk-warm)" }}>
                            <span className={c("v2-bar")} style={{ display: "block", height: "100%", width: `${b.pct}%`, background: b.color, animationDelay: `${b.delay}ms` }} />
                          </div>
                        </div>
                      ))}
                      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, paddingTop: 13, borderTop: "1px solid var(--fk-line)" }}>
                        <span style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                          <b style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.5rem,2.4vw,2rem)", lineHeight: 1.06, letterSpacing: "-0.03em", color: accent, fontVariantNumeric: "tabular-nums" }}>{d.kcal}</b>
                          <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>kcal</span>
                        </span>
                        <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0.1em", textTransform: "none", color: "var(--fk-ink-3)" }}>{Math.round(d.fibre)}g fibre</span>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══ THE WEEK ══ */}
      <section id="v2-week" aria-labelledby="v2-week-h" style={{ padding: "clamp(72px,10vw,150px) 0", background: "var(--fk-surface)", borderTop: "1px solid var(--fk-line)" }}>
        <div style={WRAP}>
          <div aria-hidden="true" style={RULE} />
          <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1.1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end" }}>
            <div className={c("v2-rise")}><h2 id="v2-week-h" style={h2("13ch")}>Pick a day. See exactly what you eat.</h2></div>
            <p className={c("v2-rise")} style={deck}>Seven days, twenty-six distinct dishes, an average of {Math.round(band.reduce((a, b) => a + b, 0) / band.length).toLocaleString("en-IN")} kcal. The bars are real calories: tap one and the day below changes. Thirty days publish on the plan page.</p>
          </div>

          <figure style={{ margin: "clamp(30px,4vw,52px) 0 0", border: "1px solid var(--fk-line)", background: "var(--fk-paper)" }}>
            <figcaption style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "clamp(14px,1.8vw,20px) clamp(14px,2vw,22px)", borderBottom: "1px solid var(--fk-line)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>
              <span style={{ color: "var(--fk-ink)" }}>Thirty-day rotation, kcal per day</span>
              <span>low {Math.min(...band).toLocaleString("en-IN")} · average <b style={{ color: "var(--fk-green)", fontWeight: 700 }}>{Math.round(band.reduce((a, b) => a + b, 0) / band.length).toLocaleString("en-IN")}</b> · peak {Math.max(...band).toLocaleString("en-IN")}</span>
            </figcaption>
            <div style={{ padding: "clamp(10px,1.4vw,16px) clamp(6px,1vw,12px) 0" }}>
              <div style={{ position: "relative", lineHeight: 0 }}>
                {bandChart}
                <span aria-hidden="true" style={{ position: "absolute", top: "6.9%", bottom: "13%", width: 1, background: "var(--fk-green)", left: bandActiveLeft(day), transition: "left .3s cubic-bezier(.16,1,.3,1)" }} />
              </div>
            </div>
          </figure>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(12px,2vw,26px)", marginTop: "clamp(18px,2.4vw,28px)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>
            {(["var(--fk-green-wash)", "var(--fk-green-wash)", "var(--fk-green-deep)", "var(--fk-green)"] as const).map((col, i) => (
              <span key={col} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span aria-hidden="true" style={{ width: 11, height: 11, background: col }} />{SLOTS[i]}
              </span>
            ))}
            <span style={{ marginLeft: "auto", color: "var(--fk-ink-3)" }}>Columns scaled from {floorK.toLocaleString("en-IN")} kcal, not from zero</span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: "clamp(6px,1vw,14px)", alignItems: "end", height: "clamp(170px,19vw,250px)", marginTop: "clamp(14px,1.8vw,22px)" }}>
            {days.map((x) => {
              const on = x.d === day;
              return (
                <button key={x.d} type="button" onClick={() => setDay(x.d)} aria-pressed={on} style={{ display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%", gap: 8, background: "transparent", border: 0, padding: 0, cursor: "pointer", textAlign: "left" }}>
                  <span style={{ flex: "1 1 auto", display: "flex", alignItems: "flex-end", width: "100%", minHeight: 0 }}>
                    <span className={c("v2-col")} style={{ flex: "none", display: "flex", flexDirection: "column", width: "100%", height: `${Math.round(((x.kcal - floorK) / (peak - floorK)) * 100)}%`, minHeight: 26, gap: 1, borderTop: `3px solid ${on ? "var(--fk-green-deep)" : "var(--fk-green)"}`, transition: "transform .28s cubic-bezier(.16,1,.3,1)" }}>
                      {x.dishes.map((dish, i) => (
                        <span key={dish.slot} title={dish.slot} style={{ display: "block", minHeight: 4, flexGrow: dish.kcal, background: on ? ["var(--fk-green-wash)", "var(--fk-green-wash)", "var(--fk-green-deep)", "var(--fk-green)"][i] : ["var(--fk-line-2)", "var(--fk-line-2)", "var(--fk-line-2)", "var(--fk-warm)"][i] }} />
                      ))}
                    </span>
                  </span>
                  <b style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(14px,1.5vw,19px)", letterSpacing: "-0.02em", fontVariantNumeric: "tabular-nums", color: on ? "var(--fk-green-deep)" : "var(--fk-ink)" }}>{Math.round(x.kcal)}</b>
                  <span className={c("v2-bar-label")} style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: on ? "var(--fk-ink)" : "var(--fk-ink-3)" }}>Day {x.d + 1}</span>
                </button>
              );
            })}
          </div>

          <div style={{ border: "1px solid var(--fk-line)", background: "var(--fk-paper)", marginTop: "clamp(20px,2.6vw,30px)" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 16, flexWrap: "wrap", padding: "clamp(16px,2vw,22px) clamp(16px,2.2vw,26px)", borderBottom: "1px solid var(--fk-line)" }}>
              <h3 style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.4rem,2.6vw,2.1rem)", lineHeight: 1, letterSpacing: "-0.02em", textTransform: "none", color: "var(--fk-ink)", margin: 0 }}>
                Day {day + 1} · {active.dishes.map((d) => d.cuisine).filter((v, i, a) => a.indexOf(v) === i).slice(0, 3).join(" · ")}
              </h3>
              <div style={{ display: "flex", gap: "clamp(14px,2.4vw,28px)", fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>
                <span><b style={{ color: "var(--fk-green)", fontWeight: 700 }}>{Math.round(active.kcal).toLocaleString("en-IN")}</b> kcal</span>
                <span><b style={{ color: "var(--fk-ink)", fontWeight: 700 }}>{Math.round(active.protein)}g</b> protein</span>
                <span><b style={{ color: "var(--fk-ink)", fontWeight: 700 }}>{Math.round(active.fibre)}g</b> fibre</span>
              </div>
            </div>
            <div>
              {active.dishes.map((dish) => (
                <div key={dish.slot} className={c("v2-row", "v2-dir-row")} style={{ display: "grid", gridTemplateColumns: "104px minmax(0,1fr) minmax(0,1.35fr) auto", gap: "clamp(12px,2vw,26px)", alignItems: "baseline", background: "var(--fk-paper)", padding: "clamp(16px,1.8vw,22px) clamp(16px,2.2vw,26px)", borderTop: "1px solid var(--fk-line)", borderLeft: "2px solid transparent" }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, letterSpacing: "0", textTransform: "none", color: "var(--fk-ink-3)" }}>{dish.slot}</span>
                  <h4 style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(1.05rem,1.6vw,1.28rem)", lineHeight: 1.05, letterSpacing: "-0.01em", textTransform: "none", color: "var(--fk-ink)", margin: 0 }}>{dish.name}</h4>
                  <p className={c("v2-hide-sm")} style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: "var(--fk-ink-2)", margin: 0 }}>{dish.blurb}</p>
                  <div style={{ display: "flex", gap: 14, justifyContent: "flex-end", fontFamily: MONO, fontSize: 12, letterSpacing: "0", color: "var(--fk-ink-3)", fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
                    <span style={{ color: "var(--fk-ink)" }}>{dish.kcal} kcal</span><span>{Math.round(dish.protein)}g P</span><span>{Math.round(dish.carbs)}g C</span><span>{Math.round(dish.fat)}g F</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <FinderSection
        doors={doors} door={door} setDoor={setDoor} plan={plan} activeDoor={activeDoor}
        sex={sex} setSex={setSex} wt={wt} setWt={setWt} ht={ht} setHt={setHt} age={age} setAge={setAge}
        act={act} setAct={setAct} diet={diet} setDiet={setDiet} wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      <PriceSection
        durations={durations} dur={dur} setDur={setDur} p={p} dName={dName} dCount={dCount} dBlurb={dBlurb}
        coupons={coupons} wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      <FilmSection hour={hour} setHour={setHour} stageRef={stageRef} wrap={WRAP} rule={RULE} deck={deck} />

      <CoachSection
        chat={chat} thinking={thinking} draft={draft} setDraft={setDraft} ask={ask}
        engine={{ plateau, actualRate, raw, capped, capBit, proposed, floorBit, sign }}
        wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      <ChecksSection barcode={barcode} licence={licence} wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      <CoverageSection map={map} wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      <MoreSection wrap={WRAP} rule={RULE} h2={h2} deck={deck} />

      <FaqSection
        faqList={faqList} faqs={faqs} faqCat={faqCat} setFaqCat={setFaqCat} faqQuery={faqQuery}
        setFaqQuery={setFaqQuery} faqOpen={faqOpen} setFaqOpen={setFaqOpen} openAi={() => setAiOpen(true)}
        waHref={waHref} wrap={WRAP} rule={RULE} h2={h2} deck={deck}
      />

      {/* ══ CLOSE ══ */}
      <section id="v2-close" aria-labelledby="v2-close-h" style={{ position: "relative", overflow: "hidden", borderTop: "1px solid var(--fk-line)" }}>
        <span aria-hidden="true" style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg,var(--fk-paper) 0%,rgba(7,7,7,0.72) 40%,var(--fk-paper) 100%)" }} />
        <div style={{ position: "relative", ...WRAP, padding: "clamp(70px,10vw,140px) clamp(18px,4vw,40px)" }}>
          <span style={{ ...label12, display: "block" }}>One day · ₹{decompose(400, 1).total} · tomorrow morning</span>
          <h2 id="v2-close-h" style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(2.8rem,9vw,7.5rem)", lineHeight: 1.06, letterSpacing: "-0.035em", textTransform: "none", color: "var(--fk-ink)", margin: "20px 0 0", maxWidth: "14ch" }}>
            <span>Stop guessing </span><span>what you ate</span>
          </h2>
          <div className={c("v2-split")} style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) minmax(0,1fr)", gap: "clamp(24px,4vw,56px)", alignItems: "end", marginTop: "clamp(28px,4vw,48px)" }}>
            <p style={{ fontFamily: SANS, fontSize: "clamp(16px,1.6vw,18.5px)", lineHeight: 1.62, color: "var(--fk-ink-2)", margin: 0, maxWidth: "46ch" }}>
              Four meals, cooked from 04:00, weighed to your macros and at your door by 08:00. It logs itself, it watches the week, and it moves your target when you stall. If it is not for you, that is the end of it: there is nothing to cancel.
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
              <Link href="/plans?trial=true" className={c("v2-btn")} style={{ display: "inline-flex", alignItems: "center", background: "var(--fk-green)", color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 17, letterSpacing: "0", textTransform: "none", padding: "17px 30px", minHeight: 52, border: "1px solid var(--fk-green)" }}><span>Book your trial day</span></Link>
              <a href={waHref} target="_blank" rel="noopener noreferrer" className={c("v2-ghost")} style={{ display: "inline-flex", alignItems: "center", gap: 10, color: "var(--fk-ink)", fontFamily: COND, fontWeight: 700, fontSize: 16, letterSpacing: "0", textTransform: "none", padding: "16px 26px", minHeight: 52, border: "1px solid var(--fk-line-2)" }}>Order on WhatsApp</a>
            </div>
          </div>
        </div>
      </section>

      {/* The site footer (components/Footer.tsx) closes this page, same as the
          navbar opens it. The prototype's own four-column footer would have
          stacked directly on top of it. SiteFooter is still exported from
          Sections.tsx if the design's version is ever wanted instead. */}

      <AiDock
        open={aiOpen} toggle={() => setAiOpen((v) => !v)} chat={chat} draft={draft} setDraft={setDraft} ask={ask}
      />

      {/* ══ STICKY ORDER BAR ══ */}
      <div style={{ position: "fixed", left: 0, right: 0, bottom: 0, zIndex: 60, transform: `translateY(${showBar ? "0%" : "110%"})`, transition: "transform .34s cubic-bezier(.16,1,.3,1)", background: "var(--fk-paper)", borderTop: "1px solid var(--fk-line)" }}>
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "11px clamp(14px,4vw,40px)", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 14 }}>
          <div className={c("v2-hide-sm")} style={{ display: "flex", alignItems: "baseline", gap: 14, minWidth: 0 }}>
            <span style={{ fontFamily: COND, fontWeight: 600, fontSize: "clamp(18px,2vw,24px)", letterSpacing: "-0.02em", textTransform: "none", color: "var(--fk-ink)", whiteSpace: "nowrap" }}>Trial day ₹{decompose(400, 1).total}</span>
            <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.12em", textTransform: "none", color: "var(--fk-ink-3)", whiteSpace: "nowrap" }}>cut-off in <b suppressHydrationWarning style={{ color: "var(--fk-ink)", fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>{countdown}</b></span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "1 1 auto", justifyContent: "flex-end" }}>
            <a href={waHref} target="_blank" rel="noopener noreferrer" style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "#25d366", color: "var(--fk-ink)", fontFamily: COND, fontWeight: 600, fontSize: 14, letterSpacing: "0", textTransform: "none", padding: "12px 18px", minHeight: 48, border: "1px solid #25d366" }}>
              <svg viewBox="0 0 24 24" width="17" height="17" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
              WhatsApp
            </a>
            <Link href="/plans?trial=true" className={c("v2-btn")} style={{ display: "inline-flex", alignItems: "center", background: "var(--fk-green)", color: "var(--fk-paper)", fontFamily: COND, fontWeight: 600, fontSize: 14, letterSpacing: "0", textTransform: "none", padding: "12px 22px", minHeight: 48, border: "1px solid var(--fk-green)" }}><span>Order now</span></Link>
          </div>
        </div>
      </div>
    </div>
  );
}
