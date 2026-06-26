"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion, AnimatePresence, useMotionValue, useSpring, useTransform,
  useReducedMotion, useScroll, useInView,
} from "framer-motion";
import {
  ArrowRight, ArrowLeft, Check, CheckCircle, Minus, Flame, Sparkles,
  Shield, Star, Clock, Leaf, Activity, Scale, TrendingDown,
  Dumbbell, Pill, ShoppingCart, Mail, Truck, FileText, ChefHat,
  UserPlus, Calculator, RefreshCw, Crown, HeartPulse, Bell, Building2,
  Boxes, ClipboardList, Network, ArrowUpRight,
} from "lucide-react";

/* ══════════════════════════════════════════════════════════════════
   FITFUEL HOMEPAGE (flagship)
   Moat: the only health coach that CONTROLS THE PLATE. Verified intake,
   not self-reported. 126 condition plans, a closed data loop, cooked in
   an owned Pune kitchen, and a franchise-ready operating system.
   Tokens: bg #080808 · lime #a3e635 / #84cc16 · Barlow Condensed display.
   Tier accents: Standard #a3e635 · Premium #f59e0b · Luxury #e879f9.
   No em dashes anywhere. Mobile-first.
══════════════════════════════════════════════════════════════════ */

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,500;0,600;0,700;0,800;0,900;1,800;1,900&display=swap');`;

const LIME = "#a3e635";
const LIME_DEEP = "#84cc16";
const AMBER = "#f59e0b";
const FUCHSIA = "#e879f9";
const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];
const BARLOW = "'Barlow Condensed','Impact',sans-serif";

const fadeUp = {
  hidden: { opacity: 0, y: 30, filter: "blur(5px)" },
  visible: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.7, ease: EASE } },
};
const stagger = { visible: { transition: { staggerChildren: 0.07 } } };
const fadeIn = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { duration: 1 } } };

const WRAP: React.CSSProperties = { width: "100%", maxWidth: 1240, margin: "0 auto" };

/* ════════ WEBGL AURORA BACKGROUND (zero deps, graceful fallback) ════════ */
function Aurora() {
  const ref = useRef<HTMLCanvasElement>(null);
  const reduce = useReducedMotion();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let raf = 0; let gl: WebGLRenderingContext | null = null;
    try {
      gl = (canvas.getContext("webgl", { antialias: true, alpha: true }) ||
            canvas.getContext("experimental-webgl")) as WebGLRenderingContext | null;
      if (!gl) { setFailed(true); return; }

      const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.0,1.0); }`;
      const fs = `
        precision highp float;
        uniform float u_time; uniform vec2 u_res; uniform vec2 u_mouse;
        float hash(vec2 p){ p=fract(p*vec2(123.34,456.21)); p+=dot(p,p+45.32); return fract(p.x*p.y); }
        float noise(vec2 p){ vec2 i=floor(p), f=fract(p);
          float a=hash(i), b=hash(i+vec2(1.,0.)), c=hash(i+vec2(0.,1.)), d=hash(i+vec2(1.,1.));
          vec2 u=f*f*(3.-2.*f); return mix(a,b,u.x)+(c-a)*u.y*(1.-u.x)+(d-b)*u.x*u.y; }
        float fbm(vec2 p){ float v=0.,a=0.5; for(int i=0;i<5;i++){ v+=a*noise(p); p*=2.0; a*=0.5; } return v; }
        void main(){
          vec2 uv = gl_FragCoord.xy / u_res.xy;
          vec2 asp = vec2(u_res.x/u_res.y, 1.0);
          vec2 p = uv * asp * 2.6;
          float t = u_time * 0.05;
          vec2 m = (u_mouse / u_res - 0.5) * 0.6;
          vec2 q = vec2(fbm(p + t + m), fbm(p + vec2(5.2,1.3) - t));
          float n = fbm(p + q*2.2 + t);
          vec3 dark = vec3(0.031);
          vec3 deep = vec3(0.10,0.20,0.04);
          vec3 lime = vec3(0.639,0.902,0.208);
          vec3 col = mix(dark, deep, smoothstep(0.30,0.85,n));
          col = mix(col, lime, smoothstep(0.68,0.98,n)*0.45);
          float d = distance(uv, vec2(0.72,0.42));
          col *= mix(1.05, 0.55, smoothstep(0.1,0.95,d));
          col *= 0.85;
          gl_FragColor = vec4(col, 1.0);
        }`;

      const mk = (type: number, src: string) => {
        const sh = gl!.createShader(type)!;
        gl!.shaderSource(sh, src); gl!.compileShader(sh);
        if (!gl!.getShaderParameter(sh, gl!.COMPILE_STATUS)) throw new Error(gl!.getShaderInfoLog(sh) || "shader");
        return sh;
      };
      const prog = gl.createProgram()!;
      gl.attachShader(prog, mk(gl.VERTEX_SHADER, vs));
      gl.attachShader(prog, mk(gl.FRAGMENT_SHADER, fs));
      gl.linkProgram(prog);
      if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
      gl.useProgram(prog);

      const buf = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
      const loc = gl.getAttribLocation(prog, "p");
      gl.enableVertexAttribArray(loc);
      gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

      const uTime = gl.getUniformLocation(prog, "u_time");
      const uRes = gl.getUniformLocation(prog, "u_res");
      const uMouse = gl.getUniformLocation(prog, "u_mouse");
      const mouse = { x: 0, y: 0 };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.6);
        const w = canvas.clientWidth * dpr, h = canvas.clientHeight * dpr;
        if (canvas.width !== w || canvas.height !== h) { canvas.width = w; canvas.height = h; gl!.viewport(0, 0, w, h); }
        gl!.uniform2f(uRes, w, h);
      };
      const onMove = (e: PointerEvent) => { const r = canvas.getBoundingClientRect(); mouse.x = (e.clientX - r.left) * (canvas.width / r.width); mouse.y = (r.height - (e.clientY - r.top)) * (canvas.height / r.height); };
      window.addEventListener("resize", resize);
      window.addEventListener("pointermove", onMove);
      resize();

      const start = performance.now();
      const draw = (now: number) => {
        resize();
        gl!.uniform1f(uTime, (now - start) / 1000);
        gl!.uniform2f(uMouse, mouse.x, mouse.y);
        gl!.drawArrays(gl!.TRIANGLES, 0, 3);
        if (!reduce) raf = requestAnimationFrame(draw);
      };
      if (reduce) { gl.uniform1f(uTime, 8); gl.uniform2f(uMouse, canvas.width * 0.7, canvas.height * 0.5); resize(); gl.drawArrays(gl.TRIANGLES, 0, 3); }
      else raf = requestAnimationFrame(draw);

      return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); window.removeEventListener("pointermove", onMove); };
    } catch {
      setFailed(true);
      return () => cancelAnimationFrame(raf);
    }
  }, [reduce]);

  if (failed) {
    return <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 72% 35%, rgba(163,230,53,0.14), transparent 55%), radial-gradient(80% 70% at 20% 80%, rgba(132,204,22,0.06), transparent 60%), #080808", pointerEvents: "none" }} />;
  }
  return <canvas ref={ref} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", display: "block", pointerEvents: "none" }} />;
}

/* ════════ atoms ════════ */
function Eyebrow({ children, color = LIME }: { children: React.ReactNode; color?: string }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 11, marginBottom: 16 }}>
      <div style={{ width: 22, height: 2, background: color, borderRadius: 1, flexShrink: 0 }} />
      <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.22em", color, textTransform: "uppercase" }}>{children}</span>
    </div>
  );
}
function Magnetic({ children, href }: { children: React.ReactNode; href: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const x = useMotionValue(0); const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 300, damping: 20 });
  const sy = useSpring(y, { stiffness: 300, damping: 20 });
  function onMove(e: React.MouseEvent) {
    if (reduce) return;
    const el = ref.current; if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - r.left - r.width / 2) * 0.3);
    y.set((e.clientY - r.top - r.height / 2) * 0.3);
  }
  const isHash = href.startsWith("#");
  const inner = (
    <motion.div ref={ref} style={{ x: sx, y: sy, display: "inline-flex" }} onMouseMove={onMove} onMouseLeave={() => { x.set(0); y.set(0); }}>{children}</motion.div>
  );
  if (isHash) return <a href={href} style={{ textDecoration: "none" }}>{inner}</a>;
  return <Link href={href} style={{ textDecoration: "none" }}>{inner}</Link>;
}
const primaryBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 9, background: LIME_DEEP, color: "#000", fontSize: 13, fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", padding: "15px 28px", borderRadius: 10, boxShadow: "0 4px 30px rgba(132,204,22,0.4)", cursor: "pointer", border: "none" };
const ghostBtn: React.CSSProperties = { display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(10,10,10,0.6)", backdropFilter: "blur(6px)", color: "#d1d5db", fontSize: 13, fontWeight: 600, letterSpacing: "0.06em", textTransform: "uppercase", textDecoration: "none", padding: "14px 22px", borderRadius: 10, border: "1px solid #2a2a2a", cursor: "pointer" };

const lbl: React.CSSProperties = { fontSize: 9.5, fontWeight: 700, letterSpacing: "0.16em", color: "#6b7280", textTransform: "uppercase" };
const num = (size: number): React.CSSProperties => ({ fontFamily: BARLOW, fontSize: size, fontWeight: 900, color: "#fff", lineHeight: 1 });
function panel(): React.CSSProperties { return { position: "relative", background: "linear-gradient(150deg,#0f0f0f 0%,#0a0a0a 100%)", border: "1px solid #1d1d1d", borderRadius: 18, boxShadow: "0 24px 60px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.03)", overflow: "hidden" }; }
const bar = (c: string) => <div style={{ height: 3, background: `linear-gradient(90deg,transparent,${c},transparent)` }} />;
function chrome(title: string, accent: string, right?: React.ReactNode) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "13px 18px", borderBottom: "1px solid #161616" }}>
      <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 15, color: "#fff", letterSpacing: "0.02em", textTransform: "uppercase" }}>{title}</span>
      {right ?? <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: accent, letterSpacing: "0.1em" }}><span style={{ width: 6, height: 6, borderRadius: "50%", background: accent }} />LIVE</span>}
    </div>
  );
}

/* animated count-up stat */
function CountStat({ value, label }: { value: string; label: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const reduce = useReducedMotion();
  const m = value.match(/^(\D*)(\d[\d,]*)(.*)$/);
  const [shown, setShown] = useState(reduce ? value : (m ? `${m[1]}0${m[3]}` : value));
  useEffect(() => {
    if (!inView || reduce || !m) { if (reduce) setShown(value); return; }
    const target = parseInt(m[2].replace(/,/g, ""), 10);
    const start = performance.now(); let raf = 0;
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1100, 1); const e = 1 - Math.pow(1 - p, 3);
      setShown(`${m[1]}${Math.round(e * target).toLocaleString()}${m[3]}`);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [inView, reduce]);
  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div style={{ fontFamily: BARLOW, fontWeight: 900, color: "#fff", lineHeight: 1, fontSize: "clamp(2.4rem,5vw,3.6rem)" }}>{shown}</div>
      <div style={{ fontSize: 12, fontWeight: 600, color: "#6b7280", letterSpacing: "0.06em", marginTop: 8, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

/* infinite condition marquee */
const marqueeItems: { n: string; c: string }[] = [
  { n: "Weight Loss", c: LIME }, { n: "Muscle Gain", c: LIME }, { n: "PCOS", c: "#f472b6" }, { n: "Diabetic", c: "#2dd4bf" },
  { n: "Thyroid", c: "#a78bfa" }, { n: "Heart Health", c: "#fb7185" }, { n: "Gut Health", c: "#34d399" }, { n: "Menopause", c: "#f9a8d4" },
  { n: "Fertility", c: "#f9a8d4" }, { n: "Anti-Aging", c: "#fbbf24" }, { n: "Hair Health", c: "#fbbf24" }, { n: "Quit Smoking", c: "#4ade80" },
  { n: "Cricket", c: "#c084fc" }, { n: "Martial Arts", c: "#c084fc" }, { n: "Endurance", c: "#c084fc" }, { n: "Keto Indian", c: LIME },
  { n: "Navratri", c: "#f97316" }, { n: "Ramadan", c: "#f97316" }, { n: "Kidney Health", c: "#38bdf8" }, { n: "Anaemia", c: "#fb7185" },
];
function Marquee() {
  const row = [...marqueeItems, ...marqueeItems];
  return (
    <div style={{ position: "relative", overflow: "hidden", padding: "18px 0", maskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)", WebkitMaskImage: "linear-gradient(90deg,transparent,#000 8%,#000 92%,transparent)" }}>
      <div className="ff-marquee" style={{ display: "flex", gap: 12, width: "max-content" }}>
        {row.map((it, i) => (
          <span key={i} style={{ flexShrink: 0, fontFamily: BARLOW, fontSize: 17, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.02em", color: it.c, background: `${it.c}12`, border: `1px solid ${it.c}30`, padding: "9px 16px", borderRadius: 10, whiteSpace: "nowrap" }}>{it.n}</span>
        ))}
      </div>
    </div>
  );
}

/* ════════ 3D-TILT DASHBOARD CONSOLE (hero) ════════ */
const coachInsights = [
  { label: "WEEKLY REVIEW", text: "Protein is short, averaging 52g against your 182g target. Let's close that gap; it protects muscle." },
  { label: "RECALIBRATED", text: "Weight has been flat for 9 days, so we dropped your target 80 kcal to restart the trend." },
  { label: "VERIFIED INTAKE", text: "We cooked all 4 of today's meals, so your macros are measured, not a guess." },
];
function Console() {
  const reduce = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0); const ry = useMotionValue(0);
  const srx = useSpring(rx, { stiffness: 150, damping: 18 });
  const sry = useSpring(ry, { stiffness: 150, damping: 18 });
  const [insight, setInsight] = useState(0);
  const [score, setScore] = useState(reduce ? 68 : 0);
  const [day, setDay] = useState(reduce ? 18 : 0);

  useEffect(() => {
    if (reduce) return;
    let raf = 0; const start = performance.now();
    const tick = (t: number) => {
      const p = Math.min((t - start) / 1400, 1); const e = 1 - Math.pow(1 - p, 3);
      setScore(Math.round(e * 68)); setDay(Math.round(e * 18));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf);
  }, [reduce]);
  useEffect(() => {
    if (reduce) return;
    const id = setInterval(() => setInsight(i => (i + 1) % coachInsights.length), 3800);
    return () => clearInterval(id);
  }, [reduce]);

  function onMove(e: React.MouseEvent) {
    if (reduce) return;
    const el = wrapRef.current; if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    ry.set(px * 14); rx.set(-py * 12);
  }
  const R = 34, C = 2 * Math.PI * R, dash = C * (score / 100);

  return (
    <div ref={wrapRef} onMouseMove={onMove} onMouseLeave={() => { rx.set(0); ry.set(0); }} style={{ position: "relative", perspective: 1100 }}>
      <div style={{ position: "absolute", inset: "-14%", background: "radial-gradient(closest-side,rgba(163,230,53,0.16),transparent 70%)", filter: "blur(10px)", pointerEvents: "none" }} />
      <motion.div className="ff-float" style={{ rotateX: srx, rotateY: sry, transformStyle: "preserve-3d" }}>
        <div style={panel()}>
          {bar(LIME_DEEP)}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #161616" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ width: 22, height: 22, borderRadius: 7, background: LIME_DEEP, display: "inline-flex", alignItems: "center", justifyContent: "center" }}><Flame size={13} color="#000" /></span>
              <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 15, color: "#fff", textTransform: "uppercase" }}>Your Dashboard</span>
            </div>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: LIME, letterSpacing: "0.08em" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: LIME, animation: reduce ? "none" : "ff-pulse 1.8s ease-in-out infinite" }} />LIVE</span>
          </div>
          <div style={{ padding: "22px 20px 20px" }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 16, marginBottom: 22 }}>
              <div>
                <div style={{ ...lbl, marginBottom: 7 }}>Active Plan</div>
                <div style={{ ...num(30), textTransform: "uppercase" }}>Weight Loss</div>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8 }}>
                  <span style={{ fontSize: 10, fontWeight: 700, color: "#000", background: LIME_DEEP, padding: "2px 8px", borderRadius: 5, letterSpacing: "0.05em" }}>STANDARD</span>
                  <span style={{ fontSize: 11, color: "#6b7280" }}>VEG, Day {day} of 30</span>
                </div>
              </div>
              <div style={{ position: "relative", width: 84, height: 84, flexShrink: 0 }}>
                <svg width="84" height="84" viewBox="0 0 84 84"><circle cx="42" cy="42" r={R} fill="none" stroke="#1c1c1c" strokeWidth="7" /><circle cx="42" cy="42" r={R} fill="none" stroke={LIME} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${dash} ${C}`} transform="rotate(-90 42 42)" style={{ transition: reduce ? "none" : "stroke-dasharray 0.1s linear" }} /></svg>
                <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={num(26)}>{score}</span><span style={{ fontSize: 8, fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em", marginTop: 1 }}>SCORE</span></div>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 9, marginBottom: 20 }}>
              {[{ k: "PROTEIN", v: "108", t: "182g", p: 0.59, c: LIME }, { k: "CARBS", v: "142", t: "165g", p: 0.86, c: "#60a5fa" }, { k: "CALORIES", v: "1,120", t: "1,380", p: 0.81, c: AMBER }].map(mm => (
                <div key={mm.k} style={{ background: "#0c0c0c", border: "1px solid #161616", borderRadius: 11, padding: "11px 12px" }}>
                  <div style={{ ...lbl, fontSize: 9 }}>{mm.k}</div>
                  <div style={{ display: "flex", alignItems: "baseline", gap: 4, margin: "4px 0 8px" }}><span style={num(19)}>{mm.v}</span><span style={{ fontSize: 10, color: "#4b5563" }}>/ {mm.t}</span></div>
                  <div style={{ height: 4, background: "#181818", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${mm.p * 100}%`, height: "100%", background: mm.c, borderRadius: 99 }} /></div>
                </div>
              ))}
            </div>
            <div style={{ background: "linear-gradient(135deg,rgba(163,230,53,0.07),rgba(163,230,53,0.02))", border: "1px solid rgba(163,230,53,0.18)", borderRadius: 13, padding: "14px 15px", minHeight: 96 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 9 }}>
                <Sparkles size={13} color={LIME} />
                <AnimatePresence mode="wait"><motion.span key={coachInsights[insight].label} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }} style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.16em", color: LIME }}>{coachInsights[insight].label}</motion.span></AnimatePresence>
              </div>
              <AnimatePresence mode="wait"><motion.p key={coachInsights[insight].text} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }} transition={{ duration: 0.3 }} style={{ fontSize: 13, lineHeight: 1.5, color: "#d1d5db", margin: 0 }}>{coachInsights[insight].text}</motion.p></AnimatePresence>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ════════ FULL DASHBOARD SNAPSHOT ════════ */
function FullDashboard() {
  const reduce = useReducedMotion();
  const meals: [string, string, number, boolean][] = [
    ["Breakfast", "Ragi porridge, almonds", 320, true],
    ["Lunch", "Grilled tofu beetroot bowl", 480, true],
    ["Snack", "Greek yogurt parfait", 210, false],
    ["Dinner", "Paneer tikka, quinoa", 370, false],
  ];
  const wk = [{ d: "M", on: true }, { d: "T", on: true }, { d: "W", on: true }, { d: "T", on: false }, { d: "F", on: false }, { d: "S", on: false }, { d: "S", on: false }];
  const Rc = 30, Cc = 2 * Math.PI * Rc;
  return (
    <div style={{ ...panel(), maxWidth: 1000, margin: "0 auto" }}>
      {bar(LIME_DEEP)}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 22px", borderBottom: "1px solid #161616", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ width: 38, height: 38, borderRadius: 11, background: "#161616", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: BARLOW, fontWeight: 900, color: LIME, fontSize: 18 }}>P</span>
          <div><div style={{ ...lbl, marginBottom: 2 }}>Welcome back</div><div style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 20, color: "#fff", textTransform: "uppercase", lineHeight: 1 }}>Pranit</div></div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "#000", background: LIME_DEEP, padding: "5px 11px", borderRadius: 7 }}>WEIGHT LOSS, STANDARD</span>
          <span style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: 18, color: LIME }}>DAY 18<span style={{ color: "#52525b", fontSize: 13 }}> / 30</span></span>
        </div>
      </div>
      <div className="ff-dash-grid" style={{ display: "grid", gridTemplateColumns: "0.85fr 1.15fr 0.9fr", gap: 1, background: "#161616" }}>
        {/* col 1: rings */}
        <div style={{ background: "#0a0a0a", padding: "20px 20px" }}>
          <div style={{ ...lbl, marginBottom: 14 }}>Consistency</div>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
            <div style={{ position: "relative", width: 120, height: 120 }}>
              <svg width="120" height="120" viewBox="0 0 120 120"><circle cx="60" cy="60" r="46" fill="none" stroke="#1c1c1c" strokeWidth="9" /><circle cx="60" cy="60" r="46" fill="none" stroke={LIME} strokeWidth="9" strokeLinecap="round" strokeDasharray={`${2 * Math.PI * 46 * 0.68} ${2 * Math.PI * 46}`} transform="rotate(-90 60 60)" /></svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}><span style={num(40)}>68</span><span style={{ fontSize: 9, fontWeight: 700, color: "#6b7280", letterSpacing: "0.1em" }}>OF 100</span></div>
            </div>
          </div>
          <div style={{ ...lbl, marginBottom: 12 }}>Net calories today</div>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ position: "relative", width: 72, height: 72, flexShrink: 0 }}>
              <svg width="72" height="72" viewBox="0 0 72 72"><circle cx="36" cy="36" r={Rc} fill="none" stroke="#1c1c1c" strokeWidth="7" /><circle cx="36" cy="36" r={Rc} fill="none" stroke="#60a5fa" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${Cc * 0.72} ${Cc}`} transform="rotate(-90 36 36)" /></svg>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column" }}><span style={num(18)}>1,120</span><span style={{ fontSize: 7, color: "#6b7280", letterSpacing: "0.08em", fontWeight: 700 }}>NET KCAL</span></div>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.6 }}>In 1,490<br />Out 370<br /><span style={{ color: LIME }}>Target 1,380</span></div>
          </div>
        </div>
        {/* col 2: today's meals */}
        <div style={{ background: "#0a0a0a", padding: "20px 20px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}><span style={lbl}>Today&rsquo;s meals</span><span style={{ ...lbl, color: LIME }}>2 of 4 logged</span></div>
          {meals.map(([m, d, k, done]) => (
            <div key={m} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #141414" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <span style={{ width: 22, height: 22, borderRadius: 7, border: `1.5px solid ${done ? LIME : "#333"}`, background: done ? LIME : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{done ? <Check size={12} color="#000" strokeWidth={3} /> : null}</span>
                <div><div style={{ fontSize: 13, fontWeight: 600, color: done ? "#9ca3af" : "#e5e7eb" }}>{m}</div><div style={{ fontSize: 11.5, color: "#6b7280" }}>{d}</div></div>
              </div>
              {done ? <span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 15, color: "#52525b" }}>{k}</span> : <span style={{ fontSize: 10.5, fontWeight: 700, color: "#000", background: LIME, padding: "5px 9px", borderRadius: 6 }}>I ATE THIS</span>}
            </div>
          ))}
          <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
            {[{ k: "P", v: "108/182", p: 0.59, c: LIME }, { k: "C", v: "142/165", p: 0.86, c: "#60a5fa" }, { k: "F", v: "38/41", p: 0.92, c: AMBER }].map(x => (
              <div key={x.k} style={{ flex: 1 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 10, fontWeight: 700, color: x.c }}>{x.k}</span><span style={{ fontSize: 10, color: "#6b7280" }}>{x.v}</span></div>
                <div style={{ height: 4, background: "#181818", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${x.p * 100}%`, height: "100%", background: x.c }} /></div>
              </div>
            ))}
          </div>
        </div>
        {/* col 3: weight + workout + water */}
        <div style={{ background: "#0a0a0a", padding: "20px 20px" }}>
          <div style={{ ...lbl, marginBottom: 10 }}>Weight trend</div>
          <svg viewBox="0 0 200 70" style={{ width: "100%", height: "auto", marginBottom: 16 }}>
            <polyline points="6,18 34,24 62,21 90,32 118,36 146,44 174,48 194,54" fill="none" stroke="#34d399" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            <line x1="6" x2="194" y1="60" y2="60" stroke="#34d399" strokeWidth="1" strokeDasharray="3 3" opacity="0.5" />
          </svg>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 18, fontSize: 11, color: "#6b7280" }}><span>82.5</span><span style={{ color: LIME }}>now 78.4kg</span><span>target 76</span></div>
          <div style={{ ...lbl, marginBottom: 10 }}>Today&rsquo;s workout</div>
          <div style={{ display: "flex", gap: 4, marginBottom: 8 }}>{wk.map((x, i) => <div key={i} style={{ flex: 1, height: 22, borderRadius: 6, background: x.on ? "#fb923c" : "#141414", border: `1px solid ${x.on ? "#fb923c" : "#222"}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: x.on ? "#000" : "#52525b" }}>{x.d}</div>)}</div>
          <div style={{ fontSize: 12.5, color: "#e5e7eb", marginBottom: 18, display: "inline-flex", alignItems: "center", gap: 7 }}><Dumbbell size={13} color="#fb923c" /> Upper Strength, 45 min</div>
          <div style={{ ...lbl, marginBottom: 10 }}>Water</div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><div style={{ display: "flex", gap: 3 }}>{[1, 1, 1, 1, 1, 1, 0, 0].map((f, i) => <span key={i} style={{ width: 11, height: 18, borderRadius: 3, background: f ? "#60a5fa" : "#181818", border: "1px solid #222" }} />)}</div><span style={{ fontSize: 12, color: "#6b7280" }}>6/8</span></div>
        </div>
      </div>
      <div style={{ background: "linear-gradient(135deg,rgba(163,230,53,0.06),transparent)", borderTop: "1px solid #161616", padding: "16px 22px", display: "flex", alignItems: "center", gap: 11 }}>
        <Sparkles size={15} color={LIME} style={{ flexShrink: 0 }} />
        <span style={{ fontSize: 13, color: "#d1d5db" }}><b style={{ color: LIME, fontFamily: BARLOW, fontSize: 14, letterSpacing: "0.04em" }}>WEEKLY REVIEW: </b> Five clean days and workouts on point. This week, push protein toward target. Calorie goal auto-adjusted after your plateau.</span>
      </div>
      <span style={{ position: "absolute", top: 16, right: 22, fontSize: 9.5, fontWeight: 700, color: LIME, letterSpacing: "0.1em", display: reduce ? "none" : "inline" }} />
    </div>
  );
}

/* ════════ FEATURE MOCKUPS ════════ */
function ScaleMock() {
  return (<div style={panel()}>{bar(LIME)}{chrome("Body metrics", LIME, <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: LIME, letterSpacing: "0.08em" }}><Scale size={12} /> SCALE SYNCED</span>)}
    <div style={{ padding: "20px 20px 22px" }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}><div><div style={{ ...lbl, marginBottom: 5 }}>Weight</div><div style={{ display: "flex", alignItems: "baseline", gap: 7 }}><span style={num(40)}>78.4</span><span style={{ fontSize: 15, color: "#6b7280" }}>kg</span></div></div><span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: LIME, background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.25)", padding: "5px 10px", borderRadius: 8 }}><TrendingDown size={14} /> 2.1 kg this month</span></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 8 }}>{[{ k: "Body Fat", v: "19.2%" }, { k: "Muscle", v: "34.1kg" }, { k: "BMI", v: "24.1" }, { k: "Water", v: "54%" }, { k: "Bone", v: "3.2kg" }, { k: "Visceral", v: "7" }].map(m => (<div key={m.k} style={{ background: "#0c0c0c", border: "1px solid #171717", borderRadius: 10, padding: "10px 11px" }}><div style={{ ...lbl, fontSize: 8.5 }}>{m.k}</div><div style={{ ...num(17), marginTop: 4 }}>{m.v}</div></div>))}</div>
    </div>
  </div>);
}
function SupplementMock() {
  return (<div style={panel()}>{bar("#a78bfa")}{chrome("Your stack", "#a78bfa", <span style={{ fontSize: 10, fontWeight: 700, color: "#a78bfa", letterSpacing: "0.08em" }}>FOR: WEIGHT LOSS</span>)}
    <div style={{ padding: "14px 18px 18px" }}>
      {[{ n: "Whey Isolate", d: "1 scoop, post-workout" }, { n: "Creatine Mono", d: "5g, daily" }, { n: "Vitamin D3 + K2", d: "1 cap, morning" }].map(s => (<div key={s.n} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #141414" }}><div style={{ display: "flex", alignItems: "center", gap: 11 }}><span style={{ width: 34, height: 34, borderRadius: 9, background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.25)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Pill size={16} color="#a78bfa" /></span><div><div style={{ fontSize: 13.5, fontWeight: 600, color: "#e5e7eb" }}>{s.n}</div><div style={{ fontSize: 11.5, color: "#6b7280" }}>{s.d}</div></div></div><span style={{ fontSize: 11, fontWeight: 700, color: "#000", background: "#a78bfa", padding: "5px 11px", borderRadius: 7 }}>Buy</span></div>))}
      <div style={{ fontSize: 11.5, color: "#52525b", marginTop: 10 }}>Matched to your goal and condition, via Nutrabay</div>
    </div>
  </div>);
}
function GroceryMock() {
  const groups: { h: string; items: [string, boolean][] }[] = [{ h: "Produce", items: [["Spinach, 250g", true], ["Beetroot, 3", true], ["Tomato, 500g", false]] }, { h: "Protein", items: [["Tofu, 400g", true], ["Greek yogurt, 1kg", false], ["Eggs, 12", false]] }];
  return (<div style={panel()}>{bar(AMBER)}{chrome("This week's groceries", AMBER, <span style={lbl}>AUTO-BUILT</span>)}
    <div style={{ padding: "14px 18px 18px" }}>{groups.map(g => (<div key={g.h} style={{ marginBottom: 12 }}><div style={{ ...lbl, color: AMBER, marginBottom: 8 }}>{g.h}</div>{g.items.map(([t, done]) => (<div key={t} style={{ display: "flex", alignItems: "center", gap: 10, padding: "6px 0" }}><span style={{ width: 17, height: 17, borderRadius: 5, border: `1.5px solid ${done ? AMBER : "#333"}`, background: done ? AMBER : "transparent", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{done ? <Check size={11} color="#000" /> : null}</span><span style={{ fontSize: 13.5, color: done ? "#52525b" : "#d1d5db", textDecoration: done ? "line-through" : "none" }}>{t}</span></div>))}</div>))}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: AMBER, fontWeight: 600 }}><ShoppingCart size={14} /> Plus 12 more items</div>
    </div>
  </div>);
}
function DeliveryMock() {
  const steps: [string, boolean][] = [["Cooked", true], ["Packed", true], ["On the way", true], ["Delivered", false]];
  return (<div style={panel()}>{bar("#60a5fa")}{chrome("Today's delivery", "#60a5fa")}
    <div style={{ padding: "18px 18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 18 }}><span style={{ fontSize: 12, fontWeight: 700, color: "#000", background: "#60a5fa", padding: "5px 11px", borderRadius: 7 }}>BY 8 AM</span><span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 13, color: "#e5e7eb" }}><Truck size={15} color="#60a5fa" /> Out for delivery, Ramesh</span></div>
      <div style={{ display: "flex", alignItems: "center", marginBottom: 18 }}>{steps.map(([t, done], i) => (<div key={t} style={{ flex: 1, textAlign: "center", position: "relative" }}>{i < steps.length - 1 && <div style={{ position: "absolute", top: 7, left: "50%", width: "100%", height: 2, background: done ? "#60a5fa" : "#222" }} />}<div style={{ position: "relative", width: 16, height: 16, borderRadius: "50%", margin: "0 auto", background: done ? "#60a5fa" : "#141414", border: `2px solid ${done ? "#60a5fa" : "#333"}` }} /><div style={{ fontSize: 10.5, color: done ? "#9ca3af" : "#52525b", marginTop: 7 }}>{t}</div></div>))}</div>
      <div style={{ ...lbl, marginBottom: 9 }}>In your box</div>{["Ragi porridge, almonds", "Grilled tofu beetroot bowl"].map(x => (<div key={x} style={{ display: "flex", alignItems: "center", gap: 9, padding: "6px 0", fontSize: 13.5, color: "#d1d5db" }}><ChefHat size={14} color="#60a5fa" />{x}</div>))}
    </div>
  </div>);
}
function PdfMock() {
  const R = 26, C = 2 * Math.PI * R;
  return (<div style={panel()}>{bar(LIME)}{chrome("30-day plan, PDF", LIME, <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: LIME, letterSpacing: "0.08em" }}><FileText size={12} /> DOWNLOAD</span>)}
    <div style={{ padding: "18px 18px 20px" }}>
      <div style={{ display: "flex", gap: 16, alignItems: "center", marginBottom: 16 }}>
        <div style={{ position: "relative", width: 78, height: 78, flexShrink: 0 }}><svg width="78" height="78" viewBox="0 0 78 78"><circle cx="39" cy="39" r={R} fill="none" stroke="#1c1c1c" strokeWidth="7" /><circle cx="39" cy="39" r={R} fill="none" stroke={LIME} strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * 0.42} ${C}`} transform="rotate(-90 39 39)" /><circle cx="39" cy="39" r={R} fill="none" stroke="#60a5fa" strokeWidth="7" strokeLinecap="round" strokeDasharray={`${C * 0.3} ${C}`} transform={`rotate(${-90 + 0.42 * 360} 39 39)`} /></svg><div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#6b7280", letterSpacing: "0.08em" }}>MACROS</div></div>
        <div style={{ flex: 1 }}><div style={{ fontFamily: BARLOW, fontSize: 20, fontWeight: 900, color: "#fff", textTransform: "uppercase", lineHeight: 1, marginBottom: 6 }}>Weight Loss, Veg</div><div style={{ fontSize: 12.5, color: "#9ca3af", lineHeight: 1.5 }}>Cover, 30 days of meals, grocery list, training plan.</div></div>
      </div>
      {[{ k: "BMI scale", w: 0.62, c: LIME }, { k: "Calorie bars", w: 0.8, c: "#60a5fa" }, { k: "Weight projection", w: 0.5, c: AMBER }].map(b2 => (<div key={b2.k} style={{ marginBottom: 8 }}><div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}><span style={{ fontSize: 11.5, color: "#8b8f98" }}>{b2.k}</span></div><div style={{ height: 5, background: "#161616", borderRadius: 99, overflow: "hidden" }}><div style={{ width: `${b2.w * 100}%`, height: "100%", background: b2.c, borderRadius: 99 }} /></div></div>))}
    </div>
  </div>);
}
function NotifMock() {
  const mails = [
    { i: <Bell size={15} color={LIME} />, s: "Order confirmed", d: "Weight Loss, 1 month. Starts tomorrow.", a: LIME },
    { i: <Truck size={15} color="#60a5fa" />, s: "Out for delivery", d: "Your box is on the way, here by 8am.", a: "#60a5fa" },
    { i: "☀", s: "Morning preview", d: "Today's 4 meals and your targets.", a: LIME },
    { i: "🌙", s: "Evening recap", d: "1,180 of 1,380 kcal. Protein a touch low.", a: "#60a5fa" },
    { i: "📊", s: "Sunday digest", d: "4 workouts, down 0.8 kg, 5-day streak.", a: AMBER },
  ];
  return (<div style={panel()}>{bar(LIME)}{chrome("Inbox", LIME, <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 10, fontWeight: 700, color: LIME, letterSpacing: "0.08em" }}><Mail size={12} /> FITFUEL</span>)}
    <div style={{ padding: "12px 14px 16px" }}>{mails.map(m => (<div key={m.s} style={{ display: "flex", alignItems: "center", gap: 12, padding: "11px 12px", borderRadius: 12, marginBottom: 6, background: "#0c0c0c", border: "1px solid #161616" }}><span style={{ width: 36, height: 36, borderRadius: 10, background: "#141414", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{m.i}</span><div style={{ flex: 1, minWidth: 0 }}><div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{m.s}</div><div style={{ fontSize: 11.5, color: "#8b8f98", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{m.d}</div></div><span style={{ width: 7, height: 7, borderRadius: "50%", background: m.a, flexShrink: 0 }} /></div>))}</div>
  </div>);
}

/* ════════ FEATURE ROW ════════ */
type Feature = { eyebrow: string; title: React.ReactNode; desc: string; accent: string; bullets?: string[]; cta?: { label: string; href: string }; mock: React.ReactNode };
function FeatureRow({ f, index }: { f: Feature; index: number }) {
  const flip = index % 2 === 1;
  return (
    <section style={{ padding: "70px 0", background: flip ? "#060606" : "#080808", borderTop: "1px solid #121212" }}>
      <div style={{ ...WRAP, paddingLeft: 40, paddingRight: 40 }} className="ff-pad">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-90px" }} variants={stagger} className={`ff-feat ${flip ? "flip" : ""}`}>
          <motion.div variants={fadeUp} className="ff-feat-text">
            <Eyebrow color={f.accent}>{f.eyebrow}</Eyebrow>
            <h3 className="ff-feat-title">{f.title}</h3>
            <p style={{ fontSize: 16, lineHeight: 1.65, color: "#9ca3af", margin: "14px 0 0", maxWidth: 440 }}>{f.desc}</p>
            {f.bullets && <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 22 }}>{f.bullets.map(b3 => (<div key={b3} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}><CheckCircle size={16} color={f.accent} style={{ flexShrink: 0, marginTop: 2 }} /><span style={{ fontSize: 14.5, color: "#d1d5db", lineHeight: 1.45 }}>{b3}</span></div>))}</div>}
            {f.cta && <Link href={f.cta.href} style={{ ...ghostBtn, marginTop: 26, borderColor: `${f.accent}55`, color: f.accent }}>{f.cta.label} <ArrowRight size={14} /></Link>}
          </motion.div>
          <motion.div variants={fadeUp} className="ff-feat-mock">{f.mock}</motion.div>
        </motion.div>
      </div>
    </section>
  );
}
const features: Feature[] = [
  { eyebrow: "Weigh in", accent: LIME, title: <>Your smart scale,<br />synced automatically.</>, desc: "Step on a connected FitDays scale and your weight, body fat, muscle and BMI flow straight into FitFuel over Bluetooth. No typing, no spreadsheets, just the full body picture.", bullets: ["Body fat, muscle, BMI, water and visceral fat", "Syncs over Bluetooth, nothing entered by hand"], mock: <ScaleMock /> },
  { eyebrow: "Supplement", accent: "#a78bfa", title: <>The right stack for<br />your condition.</>, desc: "Your plan and health condition drive a focused stack with real doses, not a wall of 40 products. Educational first, and you order through our Nutrabay link only if you want to.", bullets: ["Condition-matched stack with exact doses", "Honest and content-first, never a hard sell"], cta: { label: "Browse supplements", href: "/supplements" }, mock: <SupplementMock /> },
  { eyebrow: "Cook along", accent: AMBER, title: <>Weekends at home?<br />Here is your list.</>, desc: "Your week's recipes turn into a grocery list automatically, grouped by aisle and ready to tick off. Less planning, less waste, less Sunday-evening panic.", bullets: ["Auto-built from your plan's recipes", "Grouped by category with check-off"], mock: <GroceryMock /> },
  { eyebrow: "Delivered by 8am", accent: "#60a5fa", title: <>Hot food, tracked<br />to your door.</>, desc: "Cooked fresh from 4am in our own Pune kitchen and at your door by 8am, six days a week. Follow your box from kitchen to doorstep and see exactly what is arriving.", bullets: ["Fresh daily, never frozen, never fried", "Live status plus today's box contents"], cta: { label: "See our kitchen", href: "/our-kitchen" }, mock: <DeliveryMock /> },
  { eyebrow: "Anywhere in India", accent: LIME, title: <>Not in Pune?<br />Take the plan with you.</>, desc: "The full 30-day plan as a designed PDF, with every recipe, macro, grocery list and training plan, and infographics that actually make sense. Cook it yourself, anywhere.", bullets: ["Starter ₹299 and Pro ₹699 (meals plus training)", "Macro rings, BMI scale and weight projection built in"], cta: { label: "Browse digital plans", href: "/plans/digital" }, mock: <PdfMock /> },
];

/* ════════ PLAN UNIVERSE ════════ */
type Chip = { n: string; c: string };
const universe: { cat: string; count: string; sub: string; icon: React.ReactNode; href: string; plans: Chip[] }[] = [
  { cat: "Goal & Body", count: "27 plans", sub: "Veg, Egg, Non-Veg, Jain, Vegan", icon: <Flame size={16} color={LIME} />, href: "/plans", plans: [{ n: "Weight Loss", c: LIME }, { n: "Muscle Gain", c: LIME }, { n: "Lean Bulk", c: LIME }, { n: "Body Recomp", c: LIME }, { n: "Keto Indian", c: LIME }, { n: "Intermittent Fasting", c: LIME }, { n: "Cutting", c: LIME }, { n: "Balanced", c: LIME }] },
  { cat: "Medical & Clinical", count: "37 plans", sub: "Condition-specific nutrition", icon: <HeartPulse size={16} color="#2dd4bf" />, href: "/lifestyle-plans", plans: [{ n: "PCOS", c: "#f472b6" }, { n: "Diabetic", c: "#2dd4bf" }, { n: "Thyroid", c: "#a78bfa" }, { n: "Heart Health", c: "#fb7185" }, { n: "Hypertension", c: "#fb7185" }, { n: "Fatty Liver", c: "#34d399" }, { n: "Kidney Health", c: "#38bdf8" }, { n: "Gout", c: "#fb923c" }, { n: "Anaemia", c: "#fb7185" }, { n: "Obesity", c: "#fb923c" }, { n: "Gut Health", c: "#34d399" }, { n: "Knee & Joints", c: "#38bdf8" }] },
  { cat: "Women's Health", count: "12 plans", sub: "Hormones, cycle, motherhood", icon: <Sparkles size={16} color="#f9a8d4" />, href: "/lifestyle-plans", plans: [{ n: "PCOS", c: "#f9a8d4" }, { n: "Menopause", c: "#f9a8d4" }, { n: "Fertility", c: "#f9a8d4" }, { n: "Post-Pregnancy", c: "#f9a8d4" }, { n: "PMS", c: "#f9a8d4" }, { n: "Hormonal Acne", c: "#f9a8d4" }] },
  { cat: "Skin & Hair", count: "10 plans", sub: "Nutrition for how you look", icon: <Leaf size={16} color="#fbbf24" />, href: "/lifestyle-plans", plans: [{ n: "Anti-Aging", c: "#fbbf24" }, { n: "Acne", c: "#fbbf24" }, { n: "Hair Health", c: "#fbbf24" }, { n: "Eczema", c: "#fbbf24" }, { n: "Skin Glow", c: "#fbbf24" }] },
  { cat: "Recovery & Reset", count: "11 plans", sub: "Heal, quit, rebuild", icon: <RefreshCw size={16} color="#4ade80" />, href: "/lifestyle-plans", plans: [{ n: "Quit Smoking", c: "#4ade80" }, { n: "Alcohol Recovery", c: "#94a3b8" }, { n: "Post-Surgery", c: "#34d399" }, { n: "Post-Covid", c: "#34d399" }, { n: "Cancer Recovery", c: "#34d399" }, { n: "Detox Reset", c: "#34d399" }] },
  { cat: "Seasonal & Festival", count: "4 plans", sub: "Eat right through the calendar", icon: <Clock size={16} color="#f97316" />, href: "/lifestyle-plans", plans: [{ n: "Navratri", c: "#f97316" }, { n: "Ramadan", c: "#f97316" }, { n: "Diwali Detox", c: "#f97316" }, { n: "Shravan", c: "#f97316" }] },
  { cat: "Sports Nutrition", count: "20 plans", sub: "Fuel for your sport", icon: <Dumbbell size={16} color="#c084fc" />, href: "/sports-nutrition", plans: [{ n: "Strength & Hypertrophy", c: "#c084fc" }, { n: "Endurance", c: "#c084fc" }, { n: "Cricket", c: "#c084fc" }, { n: "Football", c: "#c084fc" }, { n: "Swimming", c: "#c084fc" }, { n: "Martial Arts", c: "#c084fc" }, { n: "Competition Prep", c: "#c084fc" }, { n: "Youth Athlete", c: "#c084fc" }] },
];
function UniverseBlock({ block }: { block: typeof universe[0] }) {
  return (
    <motion.div variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.25 }} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 18, padding: "24px 24px 22px" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>{block.icon}<h3 style={{ ...num(22), textTransform: "uppercase", margin: 0 }}>{block.cat}</h3></div>
        <Link href={block.href} style={{ fontSize: 11, fontWeight: 700, color: "#52525b", letterSpacing: "0.06em", textDecoration: "none", whiteSpace: "nowrap" }}>{block.count}</Link>
      </div>
      <p style={{ fontSize: 12.5, color: "#6b7280", margin: "0 0 16px" }}>{block.sub}</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {block.plans.map(p => (<Link key={p.n} href={block.href} style={{ textDecoration: "none" }}><span style={{ display: "inline-block", fontSize: 12.5, fontWeight: 600, color: p.c, background: `${p.c}14`, border: `1px solid ${p.c}33`, padding: "6px 12px", borderRadius: 8 }}>{p.n}</span></Link>))}
      </div>
    </motion.div>
  );
}

/* ════════ INTERACTIVE PLAN FINDER ════════ */
const goalOpts = ["Lose weight", "Build muscle", "Manage a condition", "Improve performance", "Eat healthy"];
const dietOpts = ["Veg", "Egg", "Non-Veg", "Jain", "Vegan"];
const condOpts = ["PCOS", "Diabetes", "Thyroid", "Heart", "Gut health", "Other"];
function resolvePlan(goal: string, diet: string, cond: string): { name: string; accent: string; href: string; note: string } {
  const dietSlug = diet === "Non-Veg" ? "non-veg" : diet.toLowerCase();
  if (goal === "Manage a condition") {
    const map: Record<string, { name: string; accent: string; slug: string }> = {
      "PCOS": { name: "PCOS", accent: "#f472b6", slug: "pcos" }, "Diabetes": { name: "Diabetic", accent: "#2dd4bf", slug: "diabetic" },
      "Thyroid": { name: "Thyroid", accent: "#a78bfa", slug: "thyroid" }, "Heart": { name: "Heart Health", accent: "#fb7185", slug: "heart-health" },
      "Gut health": { name: "Gut Health", accent: "#34d399", slug: "gut-health" }, "Other": { name: "Balanced", accent: LIME, slug: "balanced" },
    };
    const m = map[cond] ?? map["Other"];
    const useDiet = diet === "Non-Veg" ? "non-veg" : "veg";
    return { name: `${m.name}, ${diet}`, accent: m.accent, href: `/lifestyle-plans/${m.slug}-${useDiet}`, note: "Condition-specific, low-GI, anti-inflammatory" };
  }
  if (goal === "Build muscle") return { name: `Muscle Gain, ${diet}`, accent: LIME, href: `/plans/muscle-gain-${dietSlug === "egg" ? "egg" : dietSlug}`, note: "High protein, progressive surplus" };
  if (goal === "Improve performance") return { name: `Strength & Hypertrophy, ${diet}`, accent: "#c084fc", href: `/sports-nutrition/strength-hypertrophy-${dietSlug === "non-veg" ? "non-veg" : "veg"}`, note: "2.2g per kg protein, carb cycling" };
  if (goal === "Eat healthy") return { name: `Balanced, ${diet}`, accent: LIME, href: `/plans/balanced-${dietSlug}`, note: "Clean, maintenance-calorie fuel" };
  return { name: `Weight Loss, ${diet}`, accent: LIME, href: `/plans/weight-loss-${dietSlug === "non-veg" ? "non-veg" : dietSlug}`, note: "Sustainable deficit, keeps muscle" };
}
function PlanFinder() {
  const [step, setStep] = useState(0);
  const [goal, setGoal] = useState(""); const [diet, setDiet] = useState(""); const [cond, setCond] = useState("");
  const needsCond = goal === "Manage a condition";
  const lastStep = needsCond ? 2 : 1;
  const done = step > lastStep;
  const result = done ? resolvePlan(goal, diet, cond) : null;
  const reset = () => { setStep(0); setGoal(""); setDiet(""); setCond(""); };
  const pick = (val: string) => {
    if (step === 0) { setGoal(val); setStep(1); }
    else if (step === 1) { setDiet(val); setStep(needsCond ? 2 : 3); }
    else if (step === 2) { setCond(val); setStep(3); }
  };
  const opts = step === 0 ? goalOpts : step === 1 ? dietOpts : condOpts;
  const q = step === 0 ? "What's your primary goal?" : step === 1 ? "Your dietary preference?" : "Any health condition?";
  const selected = step === 0 ? goal : step === 1 ? diet : cond;
  return (
    <div style={{ position: "relative", background: "linear-gradient(160deg,#0e0e0e,#090909)", border: "1px solid #1e1e1e", borderRadius: 22, overflow: "hidden", boxShadow: "0 30px 80px rgba(0,0,0,0.5)" }}>
      {bar(LIME_DEEP)}
      <div style={{ padding: "32px 34px 34px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 26 }}>
          {[0, 1, needsCond ? 2 : null].filter(x => x !== null).map((_, i) => (<div key={i} style={{ flex: 1, height: 4, borderRadius: 99, background: i <= Math.min(step, lastStep) ? LIME : "#1f1f1f", transition: "background 0.3s" }} />))}
        </div>
        <AnimatePresence mode="wait">
          {!done ? (
            <motion.div key={step} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: 0.3 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 18 }}>{step > 0 && <button onClick={() => setStep(step - 1)} style={{ background: "transparent", border: "none", color: "#6b7280", cursor: "pointer", display: "inline-flex", padding: 0 }}><ArrowLeft size={18} /></button>}<span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: LIME, textTransform: "uppercase" }}>Step {step + 1} of {needsCond ? 3 : 2}</span></div>
              <h3 style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: "clamp(1.7rem,3vw,2.3rem)", textTransform: "uppercase", margin: "0 0 22px", color: "#fff", lineHeight: 1 }}>{q}</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {opts.map(o => { const active = selected === o; return (
                  <button key={o} onClick={() => pick(o)} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", textAlign: "left", background: active ? "rgba(163,230,53,0.1)" : "#0c0c0c", border: `1px solid ${active ? LIME : "#1e1e1e"}`, borderRadius: 12, padding: "15px 18px", cursor: "pointer", color: "#e5e7eb", fontSize: 15, fontWeight: 500, transition: "border-color 0.2s, background 0.2s" }} onMouseEnter={e => { if (!active) e.currentTarget.style.borderColor = "#333"; }} onMouseLeave={e => { if (!active) e.currentTarget.style.borderColor = "#1e1e1e"; }}>{o}<ArrowRight size={16} color={active ? LIME : "#3f3f46"} /></button>
                ); })}
              </div>
            </motion.div>
          ) : (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.4, ease: EASE }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 18 }}><Sparkles size={16} color={result!.accent} /><span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.18em", color: result!.accent, textTransform: "uppercase" }}>Your match</span></div>
              <div style={{ width: 40, height: 4, background: result!.accent, borderRadius: 2, marginBottom: 16 }} />
              <h3 style={{ fontFamily: BARLOW, fontWeight: 900, fontSize: "clamp(2rem,4vw,3rem)", textTransform: "uppercase", margin: "0 0 10px", color: "#fff", lineHeight: 1 }}>{result!.name}</h3>
              <p style={{ fontSize: 15, color: "#9ca3af", margin: "0 0 28px" }}>{result!.note}. The full 30-day menu is public, so you never sign in just to look.</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}><Link href={result!.href} style={{ ...primaryBtn, background: result!.accent, boxShadow: `0 4px 30px ${result!.accent}55` }}>View this plan <ArrowRight size={15} /></Link><button onClick={reset} style={{ ...ghostBtn, background: "transparent" }}>Start over</button></div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ════════ DATA ════════ */
const compareRows = ["Cooks your food fresh, daily", "Verified intake, not self-reported", "Tracks every gram automatically", "Adapts your targets on a plateau", "126 condition-specific plans", "Daily coaching on your own data"];
const compareCols = ["Tiffin service", "Fitness app", "Supplement brand", "FitFuel"];
const compareMatrix: boolean[][] = [
  [true, false, false, true], [false, false, false, true], [false, true, false, true],
  [false, false, false, true], [false, false, false, true], [false, true, false, true],
];
const steps = [
  { i: <UserPlus size={22} color={LIME} />, t: "Tell us about you", d: "Weight, goal, diet and health condition in a two-minute onboarding." },
  { i: <Calculator size={22} color={LIME} />, t: "We build your plan", d: "A 30-day rotating menu and exact calorie and macro targets, personalised to your body." },
  { i: <ChefHat size={22} color={LIME} />, t: "We cook fresh daily", d: "From 4am in our own Pune kitchen. No frying, olive oil only, freshly sourced." },
  { i: <Truck size={22} color={LIME} />, t: "Delivered by 8am", d: "To your area, six days a week, in eco-friendly packaging." },
  { i: <Activity size={22} color={LIME} />, t: "Track it all", d: "Tap \"I ate this\" and macros auto-log, your rings update, the trend builds." },
  { i: <RefreshCw size={22} color={LIME} />, t: "Adjust and evolve", d: "Swap meals, recalibrate on plateau, upgrade tier. The plan bends to you." },
];
const tiers = [
  { name: "Standard", accent: LIME, price: "From ₹9,500", unit: "per month, B+L", line: "The closed loop.", status: "Live now", cta: { label: "Start ₹400 trial", href: "/plans?trial=true" }, feats: ["Goal-based meals, delivered fresh", "Per-gram tracking and diary", "Body metrics and consistency score", "Adaptive recalibration", "Smart grocery list and weekly digest"] },
  { name: "Premium", accent: AMBER, price: "From ₹11,875", unit: "per month, B+L", line: "Meals, your stack, a plan.", status: "Waitlist open", featured: true, cta: { label: "Join waitlist", href: "/pricing" }, feats: ["Everything in Standard", "Upgraded ingredients and weekly chef special", "Linked workout schedule", "Personalised supplement stack and delivery", "Weekly progress PDF and priority support"] },
  { name: "Luxury", accent: FUCHSIA, price: "From ₹14,250", unit: "per month, B+L", line: "Your full-time AI trainer.", status: "Waitlist open", cta: { label: "Join waitlist", href: "/pricing" }, feats: ["Everything in Premium", "AI personal trainer chat", "One-on-one nutritionist consult", "Custom meal-plan adjustments", "Concierge delivery and quarterly report"] },
];
const trustBadges = [
  { i: <Shield size={15} />, t: "FSSAI 21523035002815" }, { i: <Leaf size={15} />, t: "Olive oil only" },
  { i: <Flame size={15} />, t: "No frying, ever" }, { i: <Clock size={15} />, t: "Delivered by 8am" }, { i: <Star size={15} />, t: "Fresh daily" },
];
const heroStats = [{ value: "126", label: "Plans, every condition" }, { value: "30", label: "Day adaptive cycle" }, { value: "100", label: "Point consistency score" }, { value: "1", label: "Owned Pune kitchen" }];
const franchiseFeatures = [
  { i: <ClipboardList size={20} color={LIME} />, t: "A recipe SOP, not a cookbook", d: "Every dish carries raw-gram ingredients and numbered cooking steps, so any kitchen reproduces it identically." },
  { i: <Boxes size={20} color={LIME} />, t: "Production dashboard", d: "Each morning an outlet sees exactly how many portions of every dish to cook, scaled to live subscriber counts." },
  { i: <Network size={20} color={LIME} />, t: "The delivery engine", d: "Role-based dispatch, driver app and route grouping. The same system that runs our Pune kitchen runs yours." },
  { i: <Building2 size={20} color={LIME} />, t: "Corporate plans too", d: "B2B health programs for companies, billed and managed through the same platform." },
];
const testimonials = [
  { name: "Rahul M.", loc: "Kharadi", plan: "Muscle Gain, 1 Month", result: "Plus 3kg muscle", text: "The food is genuinely good, and the app tells me when I'm slipping. The weekly review is scary accurate." },
  { name: "Priya S.", loc: "Viman Nagar", plan: "PCOS, Bi-Weekly", result: "Down 4kg in 15 days", text: "A PCOS plan that's actually built for PCOS, low-GI and no guesswork. When I plateaued it just adjusted my target." },
  { name: "Amit K.", loc: "Kalyani Nagar", plan: "Weight Loss, Monthly", result: "Quit Zomato", text: "Knowing my macros are measured, not guessed, changed everything. First time I've stuck with a plan for a full month." },
];
function TierCard({ tier }: { tier: typeof tiers[0] }) {
  return (
    <motion.div variants={fadeUp} style={{ position: "relative", background: tier.featured ? "linear-gradient(160deg,#14100a,#0a0a0a)" : "#0a0a0a", border: `1px solid ${tier.featured ? `${tier.accent}66` : "#1a1a1a"}`, borderRadius: 18, padding: "30px 28px", height: "100%", boxShadow: tier.featured ? `0 20px 60px ${tier.accent}12` : "none" }}>
      {tier.featured && <span style={{ position: "absolute", top: 18, right: 18, display: "inline-flex", alignItems: "center", gap: 5, fontSize: 9, fontWeight: 700, letterSpacing: "0.1em", color: "#000", background: tier.accent, padding: "4px 9px", borderRadius: 6 }}><Crown size={11} /> MOST WANTED</span>}
      <div style={{ display: "flex", alignItems: "center", gap: 9, marginBottom: 4 }}><span style={{ width: 9, height: 9, borderRadius: "50%", background: tier.accent }} /><h3 style={{ ...num(24), textTransform: "uppercase", margin: 0 }}>{tier.name}</h3></div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, flexWrap: "wrap" }}><p style={{ fontSize: 13, color: "#9ca3af", margin: 0 }}>{tier.line}</p><span style={{ fontSize: 10, fontWeight: 700, color: tier.accent, border: `1px solid ${tier.accent}44`, borderRadius: 5, padding: "2px 7px", letterSpacing: "0.04em" }}>{tier.status}</span></div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 22 }}><span style={{ ...num(32), color: tier.featured ? tier.accent : "#fff" }}>{tier.price}</span><span style={{ fontSize: 12, color: "#6b7280" }}>{tier.unit}</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 11, marginBottom: 26 }}>{tier.feats.map(f => <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}><CheckCircle size={15} color={tier.accent} style={{ flexShrink: 0, marginTop: 1 }} /><span style={{ fontSize: 13.5, color: "#d1d5db", lineHeight: 1.4 }}>{f}</span></div>)}</div>
      <Link href={tier.cta.href} style={{ ...(tier.featured ? primaryBtn : ghostBtn), background: tier.featured ? tier.accent : "transparent", boxShadow: tier.featured ? `0 4px 24px ${tier.accent}44` : "none", width: "100%", justifyContent: "center", color: tier.featured ? "#000" : tier.accent, borderColor: tier.featured ? undefined : `${tier.accent}55` }}>{tier.cta.label}</Link>
    </motion.div>
  );
}

/* ════════════════════ PAGE ════════════════════ */
export default function HomePage() {
  const reduce = useReducedMotion();
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 120]);
  const heroFade = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  return (
    <div style={{ background: "#080808", color: "#fff", overflow: "hidden" }}>
      <style>{`
        ${FONT_IMPORT}
        @keyframes ff-pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.35;transform:scale(0.8)} }
        @keyframes ff-float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
        @keyframes ff-scroll { from{transform:translateX(0)} to{transform:translateX(-50%)} }
        * { -webkit-font-smoothing:antialiased; -moz-osx-font-smoothing:grayscale; }
        .ff-float { animation: ff-float 6s ease-in-out infinite; }
        .ff-marquee { animation: ff-scroll 40s linear infinite; }
        .ff-marquee:hover { animation-play-state: paused; }
        @media (prefers-reduced-motion: reduce) { .ff-float, .ff-marquee { animation: none !important; } }

        .ff-pad { padding-left:40px; padding-right:40px; }
        .ff-display { font-family:${BARLOW}; font-weight:900; text-transform:uppercase; letter-spacing:0.005em; line-height:0.95; font-size:clamp(2.1rem,4.2vw,3.7rem); color:#f9fafb; }
        .ff-hero-h { font-family:${BARLOW}; font-weight:900; font-style:italic; text-transform:uppercase; letter-spacing:-0.005em; line-height:0.88; font-size:clamp(2.4rem,4.8vw,4.4rem); color:#fff; }
        .ff-feat-title { font-family:${BARLOW}; font-weight:900; text-transform:uppercase; letter-spacing:0.005em; line-height:0.94; font-size:clamp(1.8rem,3.4vw,2.7rem); color:#f9fafb; margin:0; }

        .ff-hero-grid { display:grid; grid-template-columns:1.05fr 0.95fr; gap:56px; align-items:center; }
        .ff-feat { display:grid; grid-template-columns:1fr 1fr; gap:56px; align-items:center; }
        .ff-feat.flip .ff-feat-text { order:2; }
        .ff-uni-grid { display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        .ff-finder-grid { display:grid; grid-template-columns:0.9fr 1.1fr; gap:48px; align-items:center; }
        .ff-tiers-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .ff-stats-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        .ff-tg-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:14px; }
        .ff-steps-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:16px; }
        .ff-notif-grid { display:grid; grid-template-columns:1.1fr 0.9fr; gap:48px; align-items:center; }
        .ff-fr-grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; }
        .ff-cta-grid { display:grid; grid-template-columns:1fr 1fr; }
        .ff-dash-grid { grid-template-columns:0.85fr 1.15fr 0.9fr; }
        .ff-compare-mobile { display:none; }

        @media(max-width:1000px){
          .ff-hero-grid { grid-template-columns:1fr; gap:44px; }
          .ff-hero-card { order:-1; max-width:430px; margin:0 auto; width:100%; }
          .ff-feat { grid-template-columns:1fr; gap:32px; }
          .ff-feat.flip .ff-feat-text { order:0; }
          .ff-feat-mock { max-width:460px; }
          .ff-uni-grid { grid-template-columns:1fr; }
          .ff-finder-grid, .ff-notif-grid { grid-template-columns:1fr; gap:34px; }
          .ff-notif-grid .ff-notif-mock { max-width:460px; }
          .ff-tiers-grid, .ff-tg-grid, .ff-steps-grid, .ff-fr-grid { grid-template-columns:1fr; }
          .ff-dash-grid { grid-template-columns:1fr; }
        }
        @media(max-width:760px){
          .ff-compare-desktop { display:none !important; }
          .ff-compare-mobile { display:block; }
        }
        @media(max-width:640px){
          .ff-stats-grid { grid-template-columns:repeat(2,1fr); gap:30px 20px; }
          .ff-pad { padding-left:20px !important; padding-right:20px !important; }
          .ff-cta-grid { grid-template-columns:1fr; }
          .ff-cta-grid > div:first-child { border-right:none !important; border-bottom:1px solid #1a1a1a !important; }
        }
      `}</style>

      {/* ══ HERO ══ */}
      <section ref={heroRef} style={{ position: "relative", padding: "108px 0 84px", overflow: "hidden", minHeight: "88vh", display: "flex", alignItems: "center" }}>
        <Aurora />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(90deg,#080808 0%,rgba(8,8,8,0.78) 38%,rgba(8,8,8,0.25) 100%)", pointerEvents: "none" }} />
        <motion.div style={{ ...WRAP, position: "relative", y: heroY, opacity: heroFade }} className="ff-pad">
          <div className="ff-hero-grid">
            <motion.div initial="hidden" animate="visible" variants={stagger}>
              <motion.div variants={fadeUp}><div style={{ display: "inline-flex", alignItems: "center", gap: 9, background: "rgba(163,230,53,0.07)", border: "1px solid rgba(163,230,53,0.2)", borderRadius: 99, padding: "7px 15px", marginBottom: 24, backdropFilter: "blur(6px)" }}><span style={{ width: 7, height: 7, borderRadius: "50%", background: LIME, animation: reduce ? "none" : "ff-pulse 1.8s ease-in-out infinite" }} /><span style={{ fontSize: 12, fontWeight: 600, color: LIME, letterSpacing: "0.04em" }}>A health system that delivers food, in Pune</span></div></motion.div>
              <motion.h1 variants={fadeUp} className="ff-hero-h" style={{ margin: "0 0 22px" }}>The only diet coach<br />that <span style={{ color: LIME }}>cooks your food.</span></motion.h1>
              <motion.p variants={fadeUp} style={{ fontSize: 17, lineHeight: 1.6, color: "#b3b8c0", maxWidth: 500, margin: "0 0 14px" }}>Apps track what you <i>say</i> you ate. We cook it, deliver it, and log every gram for you, so your nutrition is <b style={{ color: "#f1f3f5" }}>measured, not guessed</b>. Then we watch your weight, adapt on plateaus, and coach you on real data.</motion.p>
              <motion.p variants={fadeUp} style={{ fontSize: 14, color: LIME, fontWeight: 600, margin: "0 0 30px" }}>Track every gram. No dish repeats in 30 days. Personalised to your body.</motion.p>
              <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: 12, marginBottom: 24 }}><Magnetic href="/plans?trial=true"><span style={primaryBtn}>Start with a ₹400 trial <ArrowRight size={15} /></span></Magnetic><Magnetic href="#finder"><span style={ghostBtn}>Find my plan</span></Magnetic></motion.div>
              <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px 18px" }}>{trustBadges.slice(0, 3).map(b => <span key={b.t} style={{ display: "inline-flex", alignItems: "center", gap: 7, fontSize: 12.5, color: "#8b8f98" }}><span style={{ color: LIME_DEEP }}>{b.i}</span>{b.t}</span>)}</motion.div>
            </motion.div>
            <motion.div className="ff-hero-card" initial={{ opacity: 0, y: 30, filter: "blur(6px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.9, ease: EASE, delay: 0.2 }}><Console /></motion.div>
          </div>
        </motion.div>
      </section>

      {/* ══ MARQUEE ══ */}
      <section style={{ background: "#060606", borderTop: "1px solid #121212", borderBottom: "1px solid #121212" }}><Marquee /></section>

      {/* ══ MOAT / COMPARISON ══ */}
      <section style={{ padding: "92px 0", borderTop: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Why nobody can copy this</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 14, maxWidth: 720 }}>Everyone else trusts what you tell them. We control the plate.</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 600, margin: "0 0 44px" }}>A tiffin service feeds you but tracks nothing. An app tracks you but trusts your memory. We do both, and because we cooked the meal, your data is verified, not self-reported. That closed loop is the moat.</motion.p>

            {/* desktop table */}
            <motion.div variants={fadeUp} className="ff-compare-desktop" style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 18, overflow: "hidden" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1.6fr repeat(4,1fr)", fontSize: 13 }}>
                <div style={{ padding: "16px 18px", borderBottom: "1px solid #1a1a1a" }} />
                {compareCols.map((c, i) => (<div key={c} style={{ padding: "16px 10px", textAlign: "center", borderBottom: "1px solid #1a1a1a", borderLeft: "1px solid #141414", background: i === 3 ? "rgba(163,230,53,0.06)" : "transparent" }}><span style={{ fontFamily: BARLOW, fontWeight: 800, fontSize: 15, textTransform: "uppercase", color: i === 3 ? LIME : "#9ca3af", letterSpacing: "0.02em" }}>{c}</span></div>))}
                {compareRows.map((row, r) => (<div key={row} style={{ display: "contents" }}>
                  <div style={{ padding: "15px 18px", borderBottom: r < compareRows.length - 1 ? "1px solid #141414" : "none", color: "#d1d5db", fontWeight: 500, display: "flex", alignItems: "center" }}>{row}</div>
                  {compareMatrix[r].map((on, c) => (<div key={c} style={{ padding: "15px 10px", textAlign: "center", borderBottom: r < compareRows.length - 1 ? "1px solid #141414" : "none", borderLeft: "1px solid #141414", background: c === 3 ? "rgba(163,230,53,0.06)" : "transparent", display: "flex", alignItems: "center", justifyContent: "center" }}>{on ? <Check size={18} color={c === 3 ? LIME : "#52525b"} strokeWidth={3} /> : <Minus size={16} color="#2f2f2f" />}</div>))}
                </div>))}
              </div>
            </motion.div>

            {/* mobile cards */}
            <motion.div variants={fadeUp} className="ff-compare-mobile">
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {compareRows.map((row, r) => (
                  <div key={row} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 14, padding: "16px 16px" }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#e5e7eb", marginBottom: 12 }}>{row}</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                      {compareCols.map((c, ci) => { const on = compareMatrix[r][ci]; const isFF = ci === 3; return (
                        <div key={c} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: isFF ? "rgba(163,230,53,0.08)" : "#0c0c0c", border: `1px solid ${isFF ? "rgba(163,230,53,0.25)" : "#171717"}`, borderRadius: 9, padding: "9px 11px" }}>
                          <span style={{ fontSize: 11.5, fontWeight: 600, color: isFF ? LIME : "#9ca3af" }}>{c}</span>
                          {on ? <Check size={15} color={isFF ? LIME : "#6b7280"} strokeWidth={3} /> : <Minus size={14} color="#3a3a3a" />}
                        </div>
                      ); })}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ HOW IT WORKS ══ */}
      <section style={{ padding: "92px 0", background: "#060606", borderTop: "1px solid #121212", borderBottom: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>How it works</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 44, maxWidth: 560 }}>From your body to your door in six steps.</motion.h2>
            <div className="ff-steps-grid">{steps.map((s, i) => (<motion.div key={s.t} variants={fadeUp} whileHover={{ y: -4 }} transition={{ duration: 0.25 }} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: "26px 24px" }}><div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}><div style={{ width: 46, height: 46, borderRadius: 12, background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>{s.i}</div><span style={{ fontFamily: BARLOW, fontSize: 34, fontWeight: 900, fontStyle: "italic", color: "#161616" }}>0{i + 1}</span></div><h3 style={{ ...num(22), textTransform: "uppercase", margin: "0 0 8px" }}>{s.t}</h3><p style={{ fontSize: 14, lineHeight: 1.6, color: "#9ca3af", margin: 0 }}>{s.d}</p></motion.div>))}</div>
          </motion.div>
        </div>
      </section>

      {/* ══ FULL DASHBOARD SNAPSHOT ══ */}
      <section style={{ padding: "92px 0", borderTop: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger} style={{ textAlign: "center", marginBottom: 48 }}>
            <motion.div variants={fadeUp} style={{ display: "flex", justifyContent: "center" }}><Eyebrow>Your command center</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ margin: "0 auto 16px", maxWidth: 680 }}>One screen that runs your whole day.</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 580, margin: "0 auto" }}>Active plan, consistency score, net calories, today's meals with one-tap logging, your weight trend, today's workout, water, and a weekly review that tells you what to fix. All in one place.</motion.p>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-60px" }} transition={{ duration: 0.8, ease: EASE }}><FullDashboard /></motion.div>
        </div>
      </section>

      {/* ══ INTRO BAND ══ */}
      <section style={{ padding: "24px 0", background: "#060606", borderTop: "1px solid #121212", borderBottom: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad"><p style={{ textAlign: "center", fontSize: 14, color: "#71717a", margin: 0 }}><span style={{ color: LIME, fontWeight: 700 }}>And there is more under the hood.</span>{"  "}Smart-scale metrics, a personalised supplement stack, an auto grocery list, delivery tracking, daily email updates, and downloadable plans.</p></div>
      </section>

      {/* ══ PRODUCT TOUR ══ */}
      {features.map((f, i) => <FeatureRow key={f.eyebrow} f={f} index={i} />)}

      {/* ══ NOTIFICATIONS ══ */}
      <section style={{ padding: "92px 0", background: "#060606", borderTop: "1px solid #121212", borderBottom: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <div className="ff-notif-grid">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
              <motion.div variants={fadeUp}><Eyebrow>Daily email updates</Eyebrow></motion.div>
              <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 16, maxWidth: 460 }}>The nudges that keep you honest.</motion.h2>
              <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 420, margin: "0 0 22px" }}>You do not have to live in the app. The important moments come to your inbox, automatically.</motion.p>
              <motion.div variants={fadeUp} style={{ display: "flex", flexDirection: "column", gap: 11 }}>
                {[["Order and delivery", "Confirmation, then a heads-up when your box is out for delivery."], ["Morning preview", "Today's four meals and your targets, before the day starts."], ["Evening recap", "How the day actually went against your goal."], ["Sunday digest", "Workouts, weight change, best dish and your streak."]].map(([h, d]) => (
                  <div key={h} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}><div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Mail size={14} color={LIME} /></div><div><div style={{ fontSize: 14.5, fontWeight: 600, color: "#e5e7eb" }}>{h}</div><div style={{ fontSize: 13.5, color: "#9ca3af", lineHeight: 1.45 }}>{d}</div></div></div>
                ))}
              </motion.div>
            </motion.div>
            <motion.div className="ff-notif-mock" variants={fadeUp} initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }}><NotifMock /></motion.div>
          </div>
        </div>
      </section>

      {/* ══ PLAN UNIVERSE ══ */}
      <section id="plans" style={{ padding: "96px 0", borderTop: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>126 plans</Eyebrow></motion.div>
            <motion.div variants={fadeUp} style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 14 }}><h2 className="ff-display" style={{ margin: 0, maxWidth: 680 }}>A plan for the body you actually have.</h2><Link href="/plans" style={{ ...ghostBtn, whiteSpace: "nowrap" }}>Browse all plans <ArrowRight size={14} /></Link></motion.div>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 620, margin: "0 0 44px" }}>Not five generic diets. A hundred and twenty-six, each with condition-specific nutrition, from PCOS and diabetes to marathon training and Navratri. Every full 30-day menu is public, so you never sign in just to look.</motion.p>
            <div className="ff-uni-grid">{universe.map(b4 => <UniverseBlock key={b4.cat} block={b4} />)}</div>
          </motion.div>
        </div>
      </section>

      {/* ══ PLAN FINDER ══ */}
      <section id="finder" style={{ padding: "96px 0", background: "#060606", borderTop: "1px solid #121212", borderBottom: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <div className="ff-finder-grid">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
              <motion.div variants={fadeUp}><Eyebrow>Find your plan</Eyebrow></motion.div>
              <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 16, maxWidth: 420 }}>Not sure where to start?</motion.h2>
              <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 380, margin: 0 }}>Answer three quick questions and we will point you to the exact plan built for your goal, your diet, and your body, out of all 126.</motion.p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 0.7, ease: EASE }}><PlanFinder /></motion.div>
          </div>
        </div>
      </section>

      {/* ══ TIERS ══ */}
      <section style={{ padding: "96px 0", borderTop: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Plans and tiers</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 14, maxWidth: 640 }}>Start with food. Add a stack. Then a coach.</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 560, margin: "0 0 44px" }}>Every tier runs the same closed loop. Premium and Luxury add upgraded ingredients, linked workouts, a personalised supplement stack, and at the top, a real AI trainer.</motion.p>
            <div className="ff-tiers-grid">{tiers.map(t => <TierCard key={t.name} tier={t} />)}</div>
            <motion.p variants={fadeUp} style={{ textAlign: "center", fontSize: 13, color: "#52525b", marginTop: 22 }}>Prices shown for Breakfast plus Lunch. Full pricing, durations and the complete tier matrix on the <Link href="/pricing" style={{ color: LIME, textDecoration: "none" }}>pricing page</Link>.</motion.p>
          </motion.div>
        </div>
      </section>

      {/* ══ KITCHEN / TRUST ══ */}
      <section style={{ padding: "96px 0", background: "#060606", borderTop: "1px solid #121212", borderBottom: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>The operational moat</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 16, maxWidth: 640 }}>We own the kitchen. That is the whole point.</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 600, margin: "0 0 36px" }}>Verified intake only works if we control the cooking. Our own Pune kitchen preps from 4am, no frying, olive oil only, freshly sourced, so every gram on your dashboard is real and every meal is at your door by 8am.</motion.p>
            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>{trustBadges.map(b5 => (<span key={b5.t} style={{ display: "inline-flex", alignItems: "center", gap: 9, fontSize: 13.5, fontWeight: 600, color: "#d1d5db", background: "#0c0c0c", border: "1px solid #1d1d1d", borderRadius: 10, padding: "11px 16px" }}><span style={{ color: LIME }}>{b5.i}</span>{b5.t}</span>))}<Link href="/our-kitchen" style={{ ...ghostBtn }}>See our kitchen <ArrowRight size={14} /></Link></motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ PROOF ══ */}
      <section style={{ padding: "96px 0", borderTop: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <div className="ff-stats-grid" style={{ marginBottom: 68 }}>{heroStats.map(s => <CountStat key={s.label} value={s.value} label={s.label} />)}</div>
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow>Real results</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 40, maxWidth: 560 }}>They came for food. They stayed for the system.</motion.h2>
            <div className="ff-tg-grid">{testimonials.map(t => (<motion.div key={t.name} variants={fadeUp} style={{ background: "#0b0b0b", border: "1px solid #1a1a1a", borderRadius: 16, padding: "26px 24px", display: "flex", flexDirection: "column" }}><div style={{ display: "inline-flex", alignItems: "center", gap: 6, alignSelf: "flex-start", background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)", borderRadius: 7, padding: "4px 10px", marginBottom: 18 }}><Flame size={12} color={LIME} /><span style={{ fontFamily: BARLOW, fontSize: 14, fontWeight: 800, color: LIME }}>{t.result}</span></div><p style={{ fontSize: 14.5, lineHeight: 1.65, color: "#d1d5db", margin: "0 0 22px", flex: 1 }}>&ldquo;{t.text}&rdquo;</p><div style={{ borderTop: "1px solid #181818", paddingTop: 16 }}><div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.name} <span style={{ color: "#52525b", fontWeight: 500 }}>, {t.loc}</span></div><div style={{ fontSize: 12, color: "#6b7280", marginTop: 3 }}>{t.plan}</div></div></motion.div>))}</div>
          </motion.div>
        </div>
      </section>

      {/* ══ FRANCHISE / PARTNER ══ */}
      <section style={{ padding: "96px 0", background: "#060606", borderTop: "1px solid #121212", borderBottom: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={stagger}>
            <motion.div variants={fadeUp}><Eyebrow color={AMBER}>Run a FitFuel</Eyebrow></motion.div>
            <motion.h2 variants={fadeUp} className="ff-display" style={{ marginBottom: 16, maxWidth: 720 }}>We did not just build an app. We built the operating system for a health kitchen.</motion.h2>
            <motion.p variants={fadeUp} style={{ fontSize: 16, lineHeight: 1.7, color: "#9ca3af", maxWidth: 620, margin: "0 0 44px" }}>The same system that runs our Pune kitchen is built to run yours. Recipes are a precise SOP, production is a daily cook sheet scaled to demand, and dispatch is a working delivery engine. A partner or franchise plugs into a turnkey operation, not a blank slate.</motion.p>
            <div className="ff-fr-grid" style={{ marginBottom: 36 }}>{franchiseFeatures.map(f => (<motion.div key={f.t} variants={fadeUp} style={{ background: "#0a0a0a", border: "1px solid #1a1a1a", borderRadius: 16, padding: "26px 24px", display: "flex", gap: 16, alignItems: "flex-start" }}><div style={{ width: 44, height: 44, borderRadius: 12, background: "rgba(163,230,53,0.08)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>{f.i}</div><div><h3 style={{ ...num(20), textTransform: "uppercase", margin: "0 0 7px" }}>{f.t}</h3><p style={{ fontSize: 14, lineHeight: 1.55, color: "#9ca3af", margin: 0 }}>{f.d}</p></div></motion.div>))}</div>
            <motion.div variants={fadeUp} style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "center" }}><Magnetic href="/contact"><span style={{ ...primaryBtn }}>Talk to us about franchising <ArrowUpRight size={15} /></span></Magnetic><Link href="/corporate" style={ghostBtn}>Corporate plans <ArrowRight size={14} /></Link></motion.div>
          </motion.div>
        </div>
      </section>

      {/* ══ FINAL CTA ══ */}
      <section style={{ padding: "96px 0 88px", borderTop: "1px solid #121212" }}>
        <div style={{ ...WRAP }} className="ff-pad">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-80px" }} variants={fadeIn}>
            <div style={{ position: "relative", overflow: "hidden", background: "linear-gradient(145deg,#0e0e0e,#0a0a0a)", border: "1px solid rgba(163,230,53,0.22)", borderRadius: 24 }}>
              <div style={{ position: "absolute", bottom: -120, right: -120, width: 560, height: 560, background: "radial-gradient(circle,rgba(163,230,53,0.08),transparent 60%)", pointerEvents: "none" }} />
              {bar(LIME_DEEP)}
              <div className="ff-cta-grid">
                <div style={{ padding: "60px 54px", borderRight: "1px solid #1a1a1a" }}>
                  <Eyebrow>No risk</Eyebrow>
                  <h2 style={{ fontFamily: BARLOW, fontSize: "clamp(2.6rem,5vw,4.6rem)", fontWeight: 900, fontStyle: "italic", textTransform: "uppercase", letterSpacing: "-0.005em", lineHeight: 0.88, margin: "12px 0 20px", color: "#fff" }}>Taste the system<br />for <span style={{ color: LIME }}>₹400.</span></h2>
                  <p style={{ fontSize: 15, lineHeight: 1.7, color: "#9ca3af", maxWidth: 340, margin: 0 }}>One trial day, breakfast and lunch, cooked fresh and delivered tomorrow. No subscription, no lock-in. If it is not the best diet food you have had, you are out ₹400, nothing more.</p>
                </div>
                <div style={{ padding: "60px 54px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 28 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 15 }}>{["Verified macros from day one", "Tracking and weekly review included", "Cancel anytime, no questions asked"].map(item => (<div key={item} style={{ display: "flex", alignItems: "center", gap: 14 }}><div style={{ width: 24, height: 24, borderRadius: "50%", background: "rgba(163,230,53,0.12)", border: "1px solid rgba(163,230,53,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Check size={13} color={LIME} strokeWidth={3} /></div><span style={{ fontSize: 14, color: "#d1d5db" }}>{item}</span></div>))}</div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}><Magnetic href="/plans?trial=true"><span style={primaryBtn}>Order trial day <ArrowRight size={14} /></span></Magnetic><Link href="/plans" style={ghostBtn}>View all plans</Link></div>
                  <p style={{ fontSize: 12, color: "#52525b", margin: 0, display: "inline-flex", alignItems: "center", gap: 7 }}><Shield size={12} /> GST 5%, FSSAI 21523035002815, delivery across Pune</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}