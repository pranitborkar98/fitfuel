"use client";
import { useMemo, useState, type CSSProperties } from "react";
import Link from "next/link";

type Sex = "male" | "female";
type Goal = "lose" | "maintain" | "build";
type Activity = "sedentary" | "light" | "moderate" | "active" | "athlete";

const ACTIVITY: { key: Activity; label: string; sub: string; factor: number }[] = [
  { key: "sedentary", label: "Sedentary", sub: "Desk job, little exercise", factor: 1.2 },
  { key: "light",     label: "Light",     sub: "1–3 workouts / week",       factor: 1.375 },
  { key: "moderate",  label: "Moderate",  sub: "3–5 workouts / week",       factor: 1.55 },
  { key: "active",    label: "Active",    sub: "6–7 workouts / week",       factor: 1.725 },
  { key: "athlete",   label: "Athlete",   sub: "Physical job / 2x a day",   factor: 1.9 },
];

const GOALS: { key: Goal; label: string; sub: string; delta: number; proteinPerKg: number; accent: string }[] = [
  { key: "lose",     label: "Lose fat",     sub: "−20% deficit",  delta: -0.20, proteinPerKg: 2.0, accent: "#a3e635" },
  { key: "maintain", label: "Maintain",     sub: "Hold steady",   delta: 0,     proteinPerKg: 1.8, accent: "#38bdf8" },
  { key: "build",    label: "Build muscle", sub: "+10% surplus",  delta: 0.10,  proteinPerKg: 2.0, accent: "#f97316" },
];

const cssVars = (o: Record<string, string | number>) => o as unknown as CSSProperties;
const clampNum = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

export default function TdeeCalculator() {
  const [sex, setSex] = useState<Sex>("male");
  const [age, setAge] = useState(28);
  const [height, setHeight] = useState(172); // cm
  const [weight, setWeight] = useState(74);  // kg
  const [activity, setActivity] = useState<Activity>("moderate");
  const [goal, setGoal] = useState<Goal>("lose");

  const result = useMemo(() => {
    const a = clampNum(age, 14, 90);
    const h = clampNum(height, 120, 230);
    const w = clampNum(weight, 30, 250);
    // Mifflin–St Jeor
    const bmr = 10 * w + 6.25 * h - 5 * a + (sex === "male" ? 5 : -161);
    const factor = ACTIVITY.find((x) => x.key === activity)!.factor;
    const tdee = bmr * factor;
    const g = GOALS.find((x) => x.key === goal)!;
    const calories = Math.round(tdee * (1 + g.delta));

    const proteinG = Math.round(w * g.proteinPerKg);
    const fatG = Math.round((calories * 0.25) / 9);
    const carbG = Math.max(0, Math.round((calories - proteinG * 4 - fatG * 9) / 4));
    const total = proteinG * 4 + carbG * 4 + fatG * 9 || 1;

    return {
      bmr: Math.round(bmr), tdee: Math.round(tdee), calories,
      proteinG, carbG, fatG,
      pPct: (proteinG * 4 / total) * 100,
      cPct: (carbG * 4 / total) * 100,
      fPct: (fatG * 9 / total) * 100,
      accent: g.accent,
    };
  }, [sex, age, height, weight, activity, goal]);

  const circ = 2 * Math.PI * 52;

  return (
    <main className="tdee" style={cssVars({ "--ac": result.accent })}>
      <style>{`

        .tdee{ background:#080808; color:#f4f3ee; min-height:100vh; font-family:inherit; padding:120px 24px 96px; }
        .tdee-wrap{ max-width:1000px; margin:0 auto; }
        .tdee-eyebrow{ font-family:var(--ff-cond); font-size:12px; letter-spacing:.2em; text-transform:uppercase; color:var(--ac); margin-bottom:14px; }
        .tdee-h1{ font-family:var(--ff-cond); font-weight:800; font-size:clamp(38px,7vw,64px); line-height:.95; letter-spacing:.3px; text-transform:uppercase; margin:0 0 12px; }
        .tdee-sub{ font-size:15px; color:#85857e; max-width:560px; line-height:1.6; margin:0 0 40px; }
        .tdee-grid{ display:grid; grid-template-columns:1fr 1fr; gap:16px; }
        @media (max-width:780px){ .tdee-grid{ grid-template-columns:1fr; } }
        .panel{ border:1px solid #1c1c1c; border-radius:10px; padding:22px; }
        .lbl{ font-family:var(--ff-cond); font-size:12px; letter-spacing:.14em; text-transform:uppercase; color:#85857e; margin-bottom:10px; }
        .seg{ display:flex; gap:7px; flex-wrap:wrap; margin-bottom:22px; }
        .seg button{ font-family:var(--ff-cond); font-size:12px; letter-spacing:.04em; padding:9px 14px; border-radius:6px; border:1px solid #262626; background:transparent; color:#b9b8b0; cursor:pointer; transition:all .15s; }
        .seg button.on{ background:var(--ac); border-color:var(--ac); color:#0a0a0a; font-weight:700; }
        .field{ display:flex; align-items:center; justify-content:space-between; gap:14px; margin-bottom:16px; }
        .field label{ font-size:14px; color:#c9c3ac; }
        .field input[type=number]{ width:90px; font-family:var(--ff-cond); font-size:15px; text-align:right; color:#f4f3ee; background:#0d0d0d; border:1px solid #262626; border-radius:6px; padding:9px 11px; outline:none; }
        .field input:focus{ border-color:var(--ac); }
        .field input[type=range]{ flex:1; accent-color:var(--ac); }
        .opt{ display:grid; gap:7px; }
        .opt button{ display:flex; justify-content:space-between; align-items:center; text-align:left; padding:11px 13px; border-radius:7px; border:1px solid #262626; background:transparent; color:#b9b8b0; cursor:pointer; transition:all .15s; }
        .opt button.on{ border-color:var(--ac); background:color-mix(in srgb, var(--ac) 10%, transparent); color:#f4f3ee; }
        .opt small{ font-family:var(--ff-cond); font-size:12px; color:#85857e; }
        .res{ display:flex; flex-direction:column; gap:20px; position:relative; overflow:hidden; }
        .res:before{ content:""; position:absolute; inset:0; background:radial-gradient(120% 80% at 85% 0%, color-mix(in srgb, var(--ac) 14%, transparent), transparent 55%); pointer-events:none; }
        .res-top{ display:flex; align-items:center; gap:22px; position:relative; }
        .ring{ position:relative; width:124px; height:124px; flex-shrink:0; }
        .ring-c{ position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; }
        .ring-c b{ font-family:var(--ff-cond); font-weight:800; font-size:34px; line-height:.85; }
        .ring-c i{ font-family:var(--ff-cond); font-style:normal; font-size:12px; letter-spacing:.13em; color:#85857e; margin-top:4px; }
        .res-meta{ font-family:var(--ff-cond); font-size:12px; color:#85857e; line-height:1.9; }
        .res-meta b{ color:#c9c3ac; }
        .macbar{ display:flex; height:8px; border-radius:99px; overflow:hidden; background:#161616; margin:4px 0 10px; position:relative; }
        .macrow{ display:flex; justify-content:space-between; font-family:var(--ff-cond); font-size:12px; color:#c9c3ac; position:relative; }
        .macrow span small{ display:block; color:#85857e; font-size:12px; }
        .cta{ position:relative; border-top:1px solid #1c1c1c; padding-top:18px; }
        .cta p{ font-size:13.5px; color:#85857e; line-height:1.6; margin:0 0 14px; }
        .cta a{ display:inline-flex; align-items:center; gap:8px; font-family:var(--ff-cond); font-size:12px; letter-spacing:.08em; text-transform:uppercase; font-weight:700; background:var(--ac); color:#0a0a0a; padding:13px 22px; border-radius:6px; text-decoration:none; }
        .note{ font-family:var(--ff-cond); font-size:12px; color:#85857e; margin-top:14px; position:relative; }
      `}</style>

      <div className="tdee-wrap">
        <div className="tdee-eyebrow">Free Tool</div>
        <h1 className="tdee-h1">TDEE &amp;<br/>Calorie Calculator</h1>
        <p className="tdee-sub">Find your maintenance calories and the exact protein, carb and fat split for your goal — then let FitFuel deliver meals that hit them, every day.</p>

        <div className="tdee-grid">
          {/* INPUTS */}
          <div className="panel">
            <div className="lbl">Your stats</div>
            <div className="seg">
              {(["male", "female"] as Sex[]).map((s) => (
                <button key={s} className={sex === s ? "on" : ""} onClick={() => setSex(s)}>{s === "male" ? "Male" : "Female"}</button>
              ))}
            </div>

            <div className="field"><label>Age</label>
              <input type="number" value={age} min={14} max={90} onChange={(e) => setAge(Number(e.target.value))} /></div>
            <div className="field"><label>Height (cm)</label>
              <input type="number" value={height} min={120} max={230} onChange={(e) => setHeight(Number(e.target.value))} /></div>
            <div className="field"><label>Weight (kg)</label>
              <input type="number" value={weight} min={30} max={250} onChange={(e) => setWeight(Number(e.target.value))} /></div>

            <div className="lbl" style={{ marginTop: 22 }}>Activity</div>
            <div className="opt">
              {ACTIVITY.map((a) => (
                <button key={a.key} className={activity === a.key ? "on" : ""} onClick={() => setActivity(a.key)}>
                  <span>{a.label}</span><small>{a.sub}</small>
                </button>
              ))}
            </div>

            <div className="lbl" style={{ marginTop: 22 }}>Goal</div>
            <div className="seg">
              {GOALS.map((g) => (
                <button key={g.key} className={goal === g.key ? "on" : ""} onClick={() => setGoal(g.key)}>{g.label}</button>
              ))}
            </div>
          </div>

          {/* RESULTS */}
          <div className="panel res">
            <div className="lbl" style={{ position: "relative" }}>Your daily target</div>
            <div className="res-top">
              <div className="ring">
                <svg width="124" height="124" viewBox="0 0 124 124">
                  <circle cx="62" cy="62" r="52" fill="none" stroke="#1a1a1a" strokeWidth="7" />
                  <circle cx="62" cy="62" r="52" fill="none" stroke="var(--ac)" strokeWidth="7" strokeLinecap="round"
                    strokeDasharray={circ} strokeDashoffset={circ * 0.18} transform="rotate(-90 62 62)" />
                </svg>
                <div className="ring-c"><b>{result.calories.toLocaleString("en-IN")}</b><i>KCAL / DAY</i></div>
              </div>
              <div className="res-meta">
                BMR <b>{result.bmr.toLocaleString("en-IN")}</b><br/>
                Maintenance (TDEE) <b>{result.tdee.toLocaleString("en-IN")}</b><br/>
                Target <b>{result.calories.toLocaleString("en-IN")} kcal</b>
              </div>
            </div>

            <div style={{ position: "relative" }}>
              <div className="lbl">Macros</div>
              <div className="macbar">
                <span style={{ width: `${result.pPct}%`, background: "var(--ac)" }} />
                <span style={{ width: `${result.cPct}%`, background: "#6f6d5e" }} />
                <span style={{ width: `${result.fPct}%`, background: "#3a3a35" }} />
              </div>
              <div className="macrow">
                <span>{result.proteinG}g<small>Protein</small></span>
                <span>{result.carbG}g<small>Carbs</small></span>
                <span>{result.fatG}g<small>Fat</small></span>
              </div>
            </div>

            <div className="cta">
              <p>These are your numbers. FitFuel plans are built around exactly this — meals pre-portioned to your target, macros auto-logged, no weighing or guessing.</p>
              <Link href="/plans">See plans that hit {result.calories.toLocaleString("en-IN")} kcal →</Link>
              <div className="note">Estimates use the Mifflin–St Jeor equation. Individual needs vary — treat as a starting point.</div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
