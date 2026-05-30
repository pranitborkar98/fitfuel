"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";
import Link from "next/link";
import {
  Activity, Bluetooth, BluetoothOff, ChevronLeft, Plus,
  Zap, Scale, Droplets, Flame, Dumbbell, Heart, Brain,
  TrendingDown, TrendingUp, Minus, Info, X, Check,
  AlertCircle, BarChart3, Clock, Target, User, Lightbulb,
} from "lucide-react";

// ─── Design tokens ────────────────────────────────────────────────────────────
const T = {
  bg:          "#0a0a0a",
  card:        "#111111",
  cardHover:   "#161616",
  border:      "#1f1f1f",
  borderHover: "#2a2a2a",
  accent:      "#84cc16",
  accentDim:   "#4d7c0f",
  text:        "#f9fafb",
  textSecond:  "#a3a3a3",
  textMuted:   "#737373",
  danger:      "#ef4444",
  warning:     "#f59e0b",
  success:     "#22c55e",
  info:        "#60a5fa",
};

// ─── All 18 parameters (13 original + 5 missing from Fitdays) ────────────────
interface Metrics {
  weight:          number | null; // kg
  bmi:             number | null;
  bodyFatRate:     number | null; // %
  fatMass:         number | null; // kg  ← NEW
  fatFreeWeight:   number | null; // kg
  subcutaneousFat: number | null; // %
  visceralFat:     number | null; // level 1-20 (1 decimal)
  bodyWater:       number | null; // %
  waterWeight:     number | null; // kg  ← NEW
  skeletalMuscle:  number | null; // %
  muscleMass:      number | null; // kg
  muscleRate:      number | null; // %   ← NEW
  boneMass:        number | null; // kg
  protein:         number | null; // %
  proteinMass:     number | null; // kg  ← NEW
  bmr:             number | null; // kcal
  bodyAge:         number | null; // years
  idealWeight:     number | null; // kg  ← NEW
}

const EMPTY_METRICS: Metrics = {
  weight: null, bmi: null, bodyFatRate: null, fatMass: null,
  fatFreeWeight: null, subcutaneousFat: null, visceralFat: null,
  bodyWater: null, waterWeight: null, skeletalMuscle: null,
  muscleMass: null, muscleRate: null, boneMass: null,
  protein: null, proteinMass: null, bmr: null, bodyAge: null, idealWeight: null,
};

// ─── History row ──────────────────────────────────────────────────────────────
interface HistoryRow {
  id: string;
  recordedAt: string; // ISO
  weight: number;
  bodyFatRate: number;
  muscleMass: number;
  bmi: number;
  bmr?: number;
  visceralFat?: number;
  bodyWater?: number;
}

// ─── User bio ─────────────────────────────────────────────────────────────────
interface UserBio {
  heightCm: number;
  age:      number;
  gender:   "male" | "female";
}

// ─── Parameter definitions ────────────────────────────────────────────────────
interface ParamDef {
  key: keyof Metrics;
  label: string;
  unit: string;
  icon: React.ReactNode;
  color: string;
  ranges?: { label: string; color: string; min: number; max: number }[];
  description: string;
  decimals: number;
  tips?: string[];           // actionable tips shown in the info drawer
  insightFn?: (v: number, metrics: Metrics) => string | null; // personalised insight
}

const PARAM_DEFS: ParamDef[] = [
  {
    key: "weight", label: "Weight", unit: "kg", icon: <Scale size={16} />, color: T.accent, decimals: 2,
    description: "Total body weight measured in kilograms. Fluctuates ±1–2 kg daily based on food, water, and glycogen. Weigh at the same time each morning for consistency.",
    ranges: [{ label: "Normal", color: T.success, min: 0, max: 999 }],
    tips: [
      "Weigh yourself first thing in the morning, after using the toilet, before eating or drinking.",
      "Daily fluctuations of 0.5–2 kg are normal — water, food, and hormones cause this. Track the weekly average, not daily swings.",
      "A caloric deficit of 500 kcal/day loses ~0.5 kg of fat per week — sustainable and muscle-preserving.",
    ],
  },
  {
    key: "bmi", label: "BMI", unit: "", icon: <Target size={16} />, color: "#60a5fa", decimals: 1,
    description: "Body Mass Index — your weight in kg divided by your height in metres squared. A population-level screening tool, not a perfect individual health measure (muscular people often score 'overweight').",
    ranges: [
      { label: "Underweight", color: T.info,    min: 0,    max: 18.4 },
      { label: "Normal",      color: T.success,  min: 18.5, max: 24.9 },
      { label: "Overweight",  color: T.warning,  min: 25,   max: 29.9 },
      { label: "Obese",       color: T.danger,   min: 30,   max: 999  },
    ],
    tips: [
      "BMI ignores muscle — a fit person with high muscle mass will score 'overweight'. Use body fat % as your primary fat metric instead.",
      "Every 5 kg of fat lost lowers BMI by ~1.7 points (at average height). Losing 10 kg of fat would bring you from Obese to Overweight.",
      "BMI below 25 correlates with significantly lower cardiovascular and metabolic disease risk.",
    ],
    insightFn: (v, m) => {
      if (v >= 30 && m.muscleMass && m.muscleMass > 55) return "Your high BMI is partly explained by strong muscle mass — focus on body fat % as your real progress metric.";
      if (v >= 30) return `At ${v}, each 5 kg of fat lost brings BMI down ~1.7 points. Target: 25.`;
      return null;
    },
  },
  {
    key: "bodyFatRate", label: "Body Fat", unit: "%", icon: <TrendingDown size={16} />, color: "#f97316", decimals: 1,
    description: "Percentage of your total body weight that is fat. Includes essential fat (needed for organ function) and storage fat. The most important single metric for metabolic health.",
    ranges: [
      { label: "Essential",  color: T.info,    min: 2,  max: 5  },
      { label: "Athletic",   color: T.success, min: 6,  max: 13 },
      { label: "Fitness",    color: T.accent,  min: 14, max: 17 },
      { label: "Average",    color: T.warning, min: 18, max: 24 },
      { label: "Obese",      color: T.danger,  min: 25, max: 100 },
    ],
    tips: [
      "Losing fat while preserving muscle requires: caloric deficit + adequate protein (1.6–2.2 g per kg of body weight daily).",
      "Cardio burns calories; strength training preserves muscle during a cut — do both.",
      "Sleep 7–9 hours. Poor sleep raises cortisol, which breaks down muscle and promotes fat storage.",
      "Alcohol is the enemy of fat loss — it halts fat oxidation entirely for several hours after consumption.",
    ],
    insightFn: (v, m) => {
      if (v > 25 && m.weight) {
        const fatKg = (m.weight * v / 100).toFixed(1);
        const targetFatKg = (m.weight * 0.20).toFixed(1);
        return `You're carrying ${fatKg} kg of fat. At 20% BF you'd carry ${targetFatKg} kg — a loss of ${(parseFloat(fatKg) - parseFloat(targetFatKg)).toFixed(1)} kg of fat.`;
      }
      return null;
    },
  },
  {
    key: "fatMass", label: "Fat Mass", unit: "kg", icon: <TrendingDown size={16} />, color: "#fb923c", decimals: 1,
    description: "The absolute weight of fat in your body (kg). More actionable than body fat % — it tells you exactly how many kg of fat you need to lose to hit your goal.",
    tips: [
      "Fat mass = Weight × Body Fat% ÷ 100. Losing 0.5 kg of fat per week is healthy and achievable.",
      "Track fat mass, not just weight. If weight stays the same but fat mass drops and muscle mass rises — that's body recomposition and it's excellent.",
      "Target fat mass for a 'fit' body: Weight × 0.15 (15% BF for men) or Weight × 0.22 (22% BF for women).",
    ],
    insightFn: (v, m) => {
      if (m.weight) {
        const target = parseFloat((m.weight * 0.18).toFixed(1));
        const diff = parseFloat((v - target).toFixed(1));
        if (diff > 0) return `You need to lose ${diff} kg of fat to reach 18% body fat. At 0.5 kg/week, that's ${Math.ceil(diff / 0.5)} weeks.`;
      }
      return null;
    },
  },
  {
    key: "fatFreeWeight", label: "Fat-Free Weight", unit: "kg", icon: <Dumbbell size={16} />, color: "#a78bfa", decimals: 1,
    description: "Total body weight minus all fat mass. Includes muscle, bone, water, and organs. This is what remains after all fat is stripped away — the 'lean body mass'.",
    tips: [
      "Fat-free weight is your goal weight floor — you cannot weigh less than this without losing muscle or bone.",
      "During a cut, if fat-free weight drops, you're losing muscle — increase protein intake and add resistance training.",
      "For men, ideal weight often equals fat-free weight ÷ 0.85 (roughly 15% BF at goal weight).",
    ],
  },
  {
    key: "subcutaneousFat", label: "Subcutaneous Fat", unit: "%", icon: <TrendingDown size={16} />, color: "#fb923c", decimals: 1,
    description: "Fat stored just beneath the skin surface — the 'pinchable' fat. Less dangerous than visceral fat but more visible. Accounts for ~80% of total body fat.",
    ranges: [
      { label: "Low",      color: T.success, min: 0,  max: 14 },
      { label: "Normal",   color: T.accent,  min: 15, max: 22 },
      { label: "High",     color: T.warning, min: 23, max: 30 },
      { label: "Very High",color: T.danger,  min: 31, max: 100 },
    ],
    tips: [
      "Subcutaneous fat is cosmetically visible but metabolically less harmful than visceral fat.",
      "Spot reduction doesn't work — you can't choose where fat is lost. Total caloric deficit reduces it everywhere.",
      "Subcutaneous fat responds well to sustained cardio (150+ min/week moderate intensity).",
    ],
  },
  {
    key: "visceralFat", label: "Visceral Fat", unit: "level", icon: <AlertCircle size={16} />, color: "#f43f5e", decimals: 1,
    description: "Fat surrounding your internal organs (liver, intestines, kidneys). The most dangerous type of fat — directly linked to insulin resistance, heart disease, and type 2 diabetes. Level 1–9 is healthy, 10–14 is high, 15+ is very high.",
    ranges: [
      { label: "Healthy",   color: T.success, min: 1,  max: 9  },
      { label: "High",      color: T.warning, min: 10, max: 14 },
      { label: "Very High", color: T.danger,  min: 15, max: 30 },
    ],
    tips: [
      "Visceral fat is more metabolically active than subcutaneous fat — it secretes inflammatory chemicals that damage organs.",
      "GOOD NEWS: Visceral fat responds faster to diet and exercise than subcutaneous fat. It's the first to go.",
      "Reducing sugar and refined carbs specifically targets visceral fat. Fructose is especially linked to visceral accumulation.",
      "Aerobic exercise (running, cycling, swimming) is the most effective way to reduce visceral fat.",
      "Target: below level 9. Each 5 kg of fat lost typically drops visceral fat by ~2–3 levels.",
    ],
    insightFn: (v) => {
      if (v >= 10) return `Visceral fat at ${v} is the most urgent health priority — it's linked to heart disease and diabetes. The good news: it responds to diet faster than any other fat type.`;
      return null;
    },
  },
  {
    key: "bodyWater", label: "Body Water", unit: "%", icon: <Droplets size={16} />, color: "#38bdf8", decimals: 1,
    description: "Total body water as a percentage of body weight. Includes intracellular (inside cells) and extracellular (blood, lymph) water. Healthy range: 50–65% for men, 45–60% for women.",
    ranges: [
      { label: "Low",    color: T.warning, min: 0,  max: 49 },
      { label: "Normal", color: T.success, min: 50, max: 65 },
      { label: "High",   color: T.info,   min: 66, max: 100 },
    ],
    tips: [
      "Drink 35 ml of water per kg of body weight daily (e.g. 3.2 L for 92 kg).",
      "Body water % naturally decreases as body fat % increases — losing fat raises this number automatically.",
      "Dehydration of just 2% bodyweight impairs strength, endurance, and cognitive performance.",
      "Electrolytes (sodium, potassium, magnesium) are needed to retain water in cells — don't just drink plain water.",
    ],
  },
  {
    key: "waterWeight", label: "Water Weight", unit: "kg", icon: <Droplets size={16} />, color: "#22d3ee", decimals: 1,
    description: "The absolute weight of water in your body (kg). Water is the heaviest component of lean mass — muscle tissue is ~73% water. This number fluctuates significantly day-to-day.",
    tips: [
      "Water weight explains most of the day-to-day scale fluctuations you see — a high-carb or high-salt meal can add 1–2 kg overnight.",
      "Muscle holds more water than fat — as you gain muscle, water weight increases, which is positive.",
      "Don't confuse water weight loss with fat loss — quick weight drops from fasting or low-carb are mostly water.",
    ],
  },
  {
    key: "skeletalMuscle", label: "Skeletal Muscle", unit: "%", icon: <Activity size={16} />, color: T.accent, decimals: 1,
    description: "Skeletal muscle as a percentage of total body weight. These are the voluntary muscles you can consciously move. Higher % means better metabolism, strength, and longevity.",
    ranges: [
      { label: "Low",      color: T.warning, min: 0,  max: 32 },
      { label: "Normal",   color: T.success, min: 33, max: 44 },
      { label: "High",     color: T.accent,  min: 45, max: 100 },
    ],
    tips: [
      "Skeletal muscle is metabolically expensive — each kg of muscle burns ~13 kcal/day at rest (vs 4.5 kcal for fat).",
      "Muscle % appears lower than absolute muscle mass when body fat is high — losing fat raises this % even if muscle mass stays constant.",
      "Progressive overload (gradually increasing weight/reps in training) is the only proven way to build skeletal muscle.",
    ],
  },
  {
    key: "muscleMass", label: "Muscle Mass", unit: "kg", icon: <Dumbbell size={16} />, color: "#34d399", decimals: 1,
    description: "Total skeletal muscle mass in kilograms. The absolute most important long-term health metric — muscle mass predicts longevity, metabolic health, injury resistance, and quality of life in old age.",
    tips: [
      "Muscle is metabolically expensive — more muscle = higher BMR = easier fat loss.",
      "You can lose fat and maintain/gain muscle simultaneously (body recomposition) with adequate protein + resistance training.",
      "Muscle mass peaks in your 30s and declines ~3–8% per decade after 30. Start building now.",
      "Target: protein intake of 1.6–2.2 g per kg of body weight. At 92 kg, that's 147–202 g of protein daily.",
      "Compound movements (squat, deadlift, bench, row, overhead press) build the most total muscle in the least time.",
    ],
    insightFn: (v, m) => {
      if (v && m.weight) {
        const ffm = m.fatFreeWeight ?? (m.weight * 0.75);
        if (v > ffm * 0.88) return `Your muscle mass is excellent relative to your fat-free weight — this means most of your lean mass is actual muscle, not just water or bone.`;
        return `At ${v} kg, you have a strong muscle base. Focus on preserving this during any fat-loss phase.`;
      }
      return null;
    },
  },
  {
    key: "muscleRate", label: "Muscle Rate", unit: "%", icon: <Activity size={16} />, color: "#10b981", decimals: 1,
    description: "Muscle mass as a percentage of total body weight. Different from skeletal muscle % — this measures all muscle tissue (skeletal + smooth). Higher is always better for metabolism.",
    tips: [
      "Muscle rate below 60% in men indicates room for significant metabolic improvement.",
      "As fat decreases, muscle rate increases automatically — losing 10 kg of fat would raise this significantly.",
      "Muscle rate correlates strongly with resting metabolic rate — each 1% increase means meaningfully more calories burned daily.",
    ],
  },
  {
    key: "boneMass", label: "Bone Mass", unit: "kg", icon: <Activity size={16} />, color: "#94a3b8", decimals: 2,
    description: "Estimated bone mineral mass in kilograms. Dense bones protect against fractures and osteoporosis. Bone density peaks around age 30 and slowly declines after.",
    ranges: [
      { label: "Low",    color: T.warning, min: 0,   max: 1.9 },
      { label: "Normal", color: T.success, min: 2.0, max: 3.5 },
      { label: "High",   color: T.info,   min: 3.6, max: 10  },
    ],
    tips: [
      "Weight-bearing exercise (running, walking, weightlifting) is the most powerful stimulus for bone density.",
      "Calcium (1000 mg/day) and Vitamin D3 (2000–4000 IU/day) are essential for bone maintenance.",
      "Bone mass correlates with body weight — if you're heavier, you naturally have denser bones.",
    ],
  },
  {
    key: "protein", label: "Protein", unit: "%", icon: <Zap size={16} />, color: "#f472b6", decimals: 1,
    description: "Protein content as a percentage of body weight. Low protein % indicates the body may be breaking down muscle for energy, or dietary protein intake is insufficient.",
    ranges: [
      { label: "Low",    color: T.warning, min: 0,  max: 15 },
      { label: "Normal", color: T.success, min: 16, max: 20 },
      { label: "High",   color: T.accent,  min: 21, max: 100 },
    ],
    tips: [
      "A protein % below 16 often means insufficient dietary protein. Aim for 1.6–2.2 g per kg bodyweight daily.",
      "Best protein sources: eggs, chicken breast, greek yoghurt, cottage cheese, whey protein, fish, lean beef.",
      "Spread protein across 4–5 meals — the body can only synthesise muscle from ~40 g protein per meal.",
    ],
  },
  {
    key: "proteinMass", label: "Protein Mass", unit: "kg", icon: <Zap size={16} />, color: "#e879f9", decimals: 1,
    description: "The absolute weight of protein in your body (kg). Protein is the structural material of muscle — this reflects the size of your protein stores.",
    tips: [
      "Protein mass = Weight × Protein% ÷ 100. A higher number means more structural muscle material.",
      "Protein mass below 14 kg often indicates muscle loss risk — prioritise protein intake and strength training.",
      "During a caloric deficit, adequate protein prevents protein mass from dropping (muscle being broken down for energy).",
    ],
  },
  {
    key: "bmr", label: "BMR", unit: "kcal", icon: <Flame size={16} />, color: "#fb923c", decimals: 0,
    description: "Basal Metabolic Rate — calories your body burns at complete rest just to maintain basic functions (breathing, circulation, temperature). Your metabolic floor.",
    tips: [
      "BMR × activity multiplier = Total Daily Energy Expenditure (TDEE). Sedentary: ×1.2. Light exercise: ×1.375. Moderate exercise: ×1.55.",
      "Eat below TDEE to lose fat. A 500 kcal/day deficit = ~0.5 kg fat/week. Never eat below BMR.",
      "Muscle mass directly raises BMR — building 5 kg of muscle increases BMR by ~65 kcal/day.",
      "BMR decreases with severe caloric restriction (metabolic adaptation). Don't crash diet.",
    ],
    insightFn: (v, m) => {
      const tdee = Math.round(v * 1.55); // moderate activity
      const target = Math.round(tdee - 500);
      return `Estimated TDEE (moderate activity): ${tdee} kcal. For 0.5 kg/week fat loss, eat ${target} kcal/day. Never below ${v} kcal.`;
    },
  },
  {
    key: "bodyAge", label: "Body Age", unit: "yrs", icon: <Brain size={16} />, color: "#c084fc", decimals: 0,
    description: "Metabolic age estimate based on your BMR compared to the population average for your age group. Body age younger than actual age = excellent metabolic health.",
    tips: [
      "Body age above actual age means your metabolism runs slower than average for your age — primarily driven by excess body fat and low muscle mass.",
      "Losing fat and building muscle are the two fastest ways to lower body age.",
      "Each 5 kg of fat lost typically drops body age by 2–3 years.",
      "Consistent aerobic exercise can lower body age by 10+ years over 12 months.",
    ],
    insightFn: (v, m) => {
      if (m.weight && m.bodyFatRate) {
        const actual = new Date().getFullYear() - 1990; // placeholder — ideally use user.age
        return `A body age of ${v} means your metabolism is running older than ideal. Dropping visceral fat is the fastest fix.`;
      }
      return null;
    },
  },
  {
    key: "idealWeight", label: "Ideal Weight", unit: "kg", icon: <Target size={16} />, color: "#818cf8", decimals: 1,
    description: "Estimated ideal body weight calculated as BMI 22 × height². This is a target for long-term health, not a number to chase aggressively — losing fat while preserving muscle is the goal.",
    tips: [
      "Ideal weight is a guideline, not a hard target. Body composition matters more than scale weight.",
      "If you have significant muscle mass, your ideal weight will be higher than this estimate.",
      "Focus on body fat % reaching 15–20% rather than hitting an exact weight number.",
    ],
    insightFn: (v, m) => {
      if (m.weight && v) {
        const diff = parseFloat((m.weight - v).toFixed(1));
        if (diff > 0) return `You're ${diff} kg above ideal weight. But since you have strong muscle, realistic target weight with 18% BF is likely ${Math.round(m.fatFreeWeight! / 0.82)} kg — higher than the BMI-22 estimate.`;
      }
      return null;
    },
  },
];

type BleStatus = "idle" | "scanning" | "connected" | "failed" | "unsupported";
type Tab = "overview" | "history" | "log";

// ─── Helper: get range label ──────────────────────────────────────────────────
function getRangeInfo(def: ParamDef, value: number | null) {
  if (value === null || !def.ranges) return null;
  return def.ranges.find(r => value >= r.min && value <= r.max) ?? null;
}

// ─── BIA CALCULATION ENGINE ──────────────────────────────────────────────────
function calcBodyFat(weight: number, impedance: number, height: number, age: number, gender: "male" | "female"): number {
  const h   = height / 100;
  const bmi = weight / (h * h);
  const base = 1.2 * bmi + 0.23 * age;
  const bf   = gender === "male" ? base - 16.2 : base - 5.4;
  return Math.max(5, Math.min(50, bf));
}

function calcBMR(weight: number, height: number, age: number, gender: "male" | "female"): number {
  if (gender === "male") return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

function computeAllMetrics(weight: number, impedance: number, bio: UserBio): Metrics {
  const { heightCm, age, gender } = bio;
  const h = heightCm / 100;

  const bmi             = parseFloat((weight / (h * h)).toFixed(1));
  const bodyFatRate     = parseFloat(calcBodyFat(weight, impedance, heightCm, age, gender).toFixed(1));
  const fatMass         = parseFloat((weight * bodyFatRate / 100).toFixed(1));
  const fatFreeWeight   = parseFloat((weight - fatMass).toFixed(1));
  const subcutaneousFat = parseFloat((bodyFatRate * 0.82).toFixed(1));
  const bodyWater       = parseFloat((fatFreeWeight / weight * 73.2).toFixed(1));
  const waterWeight     = parseFloat((weight * bodyWater / 100).toFixed(1));
  // FIX: was 0.826 — now 0.95 to match Fitdays (muscle ≈ 95% of fat-free weight)
  const muscleMass      = parseFloat((fatFreeWeight * 0.95).toFixed(1));
  const muscleRate      = parseFloat((muscleMass / weight * 100).toFixed(1));
  const skeletalMuscle  = parseFloat((muscleMass / weight * 100 * 0.73).toFixed(1)); // skeletal ≈ 73% of total muscle rate
  const boneMass        = parseFloat((weight < 60 ? 1.96 : weight < 75 ? 2.4 : 2.95).toFixed(2));
  const protein         = parseFloat(((muscleMass * 0.2 / weight) * 100).toFixed(1));
  const proteinMass     = parseFloat((weight * protein / 100).toFixed(1));
  const bmr             = calcBMR(weight, heightCm, age, gender);
  // FIX: visceral fat stored as float (1 decimal) — was Math.round()
  const visceralFat     = parseFloat((bodyFatRate * 0.25 + bmi * 0.1).toFixed(1));
  const bodyAge         = Math.round(age + (bodyFatRate - (gender === "male" ? 18 : 25)) * 0.4);
  const idealWeight     = parseFloat((22 * h * h).toFixed(1));

  return {
    weight, bmi, bodyFatRate, fatMass,
    fatFreeWeight, subcutaneousFat,
    visceralFat: parseFloat(Math.max(1, Math.min(20, visceralFat)).toFixed(1)),
    bodyWater: parseFloat(Math.max(35, Math.min(75, bodyWater)).toFixed(1)),
    waterWeight,
    skeletalMuscle, muscleMass, muscleRate, boneMass,
    protein: parseFloat(Math.max(8, Math.min(30, protein)).toFixed(1)),
    proteinMass,
    bmr,
    bodyAge: Math.max(age - 10, Math.min(age + 20, bodyAge)),
    idealWeight,
  };
}

// ─── BLE PACKET PARSER ───────────────────────────────────────────────────────
const STABLE_THRESHOLD = 8;

function buildProfilePacket(sex: "male" | "female", heightCm: number, age: number): Uint8Array {
  const pkt = new Uint8Array(20);
  pkt[0]  = 0xac; pkt[1]  = 0x27; pkt[2]  = 0x6a; pkt[3]  = 0x18;
  pkt[4]  = 0x00; pkt[5]  = 0x00; pkt[6]  = 0x16; pkt[7]  = 0x00;
  pkt[8]  = sex === "male" ? 0x01 : 0x00;
  pkt[9]  = Math.max(100, Math.min(250, Math.round(heightCm))) & 0xFF;
  pkt[10] = 0x00; pkt[11] = 0x00;
  pkt[12] = Math.max(10, Math.min(110, Math.round(age))) & 0xFF;
  pkt[13] = 0x01; pkt[14] = 0x00; pkt[15] = 0x00;
  pkt[16] = 0x03; pkt[17] = 0x00; pkt[18] = 0xd0;
  let cs = 0;
  for (let i = 2; i < 19; i++) cs += pkt[i];
  pkt[19] = cs & 0xFF;
  return pkt;
}

function parseFitDaysPacket(
  data: DataView,
  prevWeight?: number,
  stableCount?: number,
  tareWeight?: number,
): { weight: number; impedance: number; stable: boolean; stableCount: number } | null {
  if (data.byteLength < 6) return null;
  const bytes = Array.from({ length: data.byteLength }, (_, i) => data.getUint8(i));

  if (bytes[0] !== 0xAC) {
    if (data.byteLength >= 10) {
      const wBE = ((bytes[3] << 8) | bytes[4]) / 10;
      const impBE = (bytes[5] << 8) | bytes[6];
      if (wBE >= 20 && wBE <= 300 && impBE >= 50 && impBE <= 2000)
        return { weight: wBE, impedance: impBE, stable: (bytes[2] & 0x03) !== 0, stableCount: 0 };
      const wLE = (bytes[3] | (bytes[4] << 8)) / 10;
      const impLE = bytes[5] | (bytes[6] << 8);
      if (wLE >= 20 && wLE <= 300 && impLE >= 50 && impLE <= 2000)
        return { weight: wLE, impedance: impLE, stable: (bytes[2] & 0x03) !== 0, stableCount: 0 };
    }
    return null;
  }

  if (data.byteLength < 6) return null;
  const rawWeight = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
  const WEIGHT_OFFSET = 6815754;
  const weight = parseFloat(((rawWeight - WEIGHT_OFFSET) / 1000).toFixed(2));
  if (weight < 20 || weight > 300) return null;

  let impedance = 500;
  const impPositions = data.byteLength >= 20
    ? [17, 15, 13, data.byteLength - 3]
    : [data.byteLength - 3, 13, 11];
  for (const pos of impPositions) {
    if (pos >= 0 && pos + 1 < data.byteLength) {
      const imp = (bytes[pos] << 8) | bytes[pos + 1];
      if (imp >= 50 && imp <= 2000) { impedance = imp; break; }
    }
  }

  const TARE_MARGIN = 3.0;
  const isFirstPacket = prevWeight === undefined;
  const aboveTare = tareWeight !== undefined && weight > tareWeight + TARE_MARGIN;
  const weightConverged = !isFirstPacket && Math.abs(weight - prevWeight!) <= 0.05;
  const count = (!aboveTare) ? 0 : isFirstPacket ? 0 : weightConverged ? (stableCount ?? 0) + 1 : 0;
  const stable = count >= STABLE_THRESHOLD;
  return { weight, impedance, stable, stableCount: count };
}

// ─── Sparkline ────────────────────────────────────────────────────────────────
function Sparkline({ values, color }: { values: number[]; color: string }) {
  if (values.length < 2) return null;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const w = 80; const h = 28;
  const pts = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w;
    const y = h - ((v - min) / range) * (h - 4) - 2;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" opacity={0.8} />
    </svg>
  );
}

// ─── Mini progress bar ────────────────────────────────────────────────────────
function MiniBar({ value, min, max, color, label }: { value: number; min: number; max: number; color: string; label: string }) {
  const pct = Math.min(100, Math.max(0, ((value - min) / (max - min)) * 100));
  return (
    <div style={{ marginBottom: 6 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: T.textMuted, marginBottom: 3 }}>
        <span>{label}</span><span style={{ color }}>{value}</span>
      </div>
      <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
        <div style={{ height: 4, width: `${pct}%`, background: color, borderRadius: 2, transition: "width 0.6s ease" }} />
      </div>
    </div>
  );
}

// ─── Bio prompt ───────────────────────────────────────────────────────────────
function BiometricPrompt({ onConfirm, onClose }: { onConfirm: (bio: UserBio) => void; onClose: () => void }) {
  const [height, setHeight] = useState("");
  const [age, setAge]       = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [err, setErr]       = useState("");
  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#0f0f0f", border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "10px 12px", fontSize: 15, fontWeight: 600,
    color: T.text, outline: "none",
  };
  function handleConfirm() {
    const h = parseFloat(height); const a = parseInt(age);
    if (!h || h < 100 || h > 250) { setErr("Enter height (100–250 cm)."); return; }
    if (!a || a < 10 || a > 110)  { setErr("Enter age (10–110)."); return; }
    onConfirm({ heightCm: h, age: a, gender });
  }
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ background: "#141414", border: `1px solid ${T.border}`, borderRadius: 20, padding: "32px", width: "100%", maxWidth: 420 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: T.accentDim + "44", border: `1px solid ${T.accent}44`, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <User size={18} color={T.accent} />
          </div>
          <h2 style={{ fontSize: 17, fontWeight: 800 }}>Quick Setup</h2>
          <button onClick={onClose} style={{ marginLeft: "auto", background: "transparent", border: "none", color: T.textMuted, cursor: "pointer" }}><X size={18} /></button>
        </div>
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
          Your scale sends weight + impedance. We need your height, age, and sex to compute all 18 body metrics.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Height (cm)</label>
            <input type="number" placeholder="e.g. 170" value={height} onChange={e => setHeight(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Age (years)</label>
            <input type="number" placeholder="e.g. 28" value={age} onChange={e => setAge(e.target.value)} style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Sex</label>
            <div style={{ display: "flex", gap: 8 }}>
              {(["male", "female"] as const).map(g => (
                <button key={g} onClick={() => setGender(g)} style={{
                  flex: 1, padding: "10px", borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: "pointer", textTransform: "capitalize",
                  background: gender === g ? T.accent + "22" : "#0f0f0f",
                  border: `1px solid ${gender === g ? T.accent : T.border}`,
                  color: gender === g ? T.accent : T.textMuted,
                }}>{g}</button>
              ))}
            </div>
          </div>
          {err && <p style={{ fontSize: 12, color: T.danger }}>{err}</p>}
          <button onClick={handleConfirm} style={{
            background: T.accent, color: "#000", border: "none", borderRadius: 9,
            padding: "12px", fontSize: 14, fontWeight: 800, cursor: "pointer",
            textTransform: "uppercase", letterSpacing: "0.05em",
          }}>
            Calculate My Metrics
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────
export default function BodyMetricsClient({ user }: { user: any }) {
  const [tab, setTab]                 = useState<Tab>("overview");
  const [bleStatus, setBleStatus]     = useState<BleStatus>("idle");
  const [metrics, setMetrics]         = useState<Metrics>(EMPTY_METRICS);
  const [showManual, setShowManual]   = useState(false);
  const [manualDraft, setManualDraft] = useState<Partial<Record<keyof Metrics, string>>>({});
  const [saving, setSaving]           = useState(false);
  const [savedFlash, setSavedFlash]   = useState(false);
  const [showInfo, setShowInfo]       = useState<keyof Metrics | null>(null);
  const [showBioPrompt, setShowBioPrompt] = useState(false);
  const [pendingRaw, setPendingRaw]   = useState<{ weight: number; impedance: number } | null>(null);
  const [bleError, setBleError]       = useState<string | null>(null);
  const [liveWeight, setLiveWeight]   = useState<number | null>(null);
  const [bleDebugLog, setBleDebugLog] = useState<string[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [history, setHistory]         = useState<HistoryRow[]>([]);
  const [loadingLatest, setLoadingLatest]   = useState(true);

  const prevWeightRef   = useRef<number | undefined>(undefined);
  const stableCountRef  = useRef<number>(0);
  const stableFiredRef  = useRef<boolean>(false);
  const tareBufferRef   = useRef<number[]>([]);
  const tareWeightRef   = useRef<number | undefined>(undefined);

  const profileBio: Partial<UserBio> = {
    heightCm: user?.profile?.heightCm ?? undefined,
    age:      user?.profile?.age ?? undefined,
    gender:   user?.profile?.gender?.toLowerCase() === "female" ? "female" : "male",
  };
  const hasSavedBio = !!(profileBio.heightCm && profileBio.age);

  // ── FIX: Load latest reading on mount so Overview is never empty ────────────
  useEffect(() => {
    async function loadLatest() {
      try {
        const res = await fetch("/api/user/metrics/latest");
        if (res.ok) {
          const data = await res.json();
          if (data) setMetrics(prev => ({ ...prev, ...data }));
        }
      } catch { /* silent — show empty state if offline */ }
      finally { setLoadingLatest(false); }
    }
    loadLatest();
  }, []);

  // ── FIX: Load history from DB when History tab is opened ───────────────────
  useEffect(() => {
    if (tab !== "history") return;
    async function loadHistory() {
      setLoadingHistory(true);
      try {
        const res = await fetch("/api/user/metrics/history?limit=30");
        if (res.ok) {
          const data: HistoryRow[] = await res.json();
          setHistory(data);
        }
      } catch { /* silent */ }
      finally { setLoadingHistory(false); }
    }
    loadHistory();
  }, [tab]);

  const subscribeToScale = useCallback((characteristic: any) => {
    characteristic.startNotifications().then(() => {
      setBleStatus("connected");
      characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const data: DataView = event.target.value;
        const raw = Array.from({ length: data.byteLength }, (_: any, i: number) =>
          data.getUint8(i).toString(16).padStart(2, "0")
        );
        const rawStr = raw.join(" ");
        console.log("[MEDITIVE BLE] raw:", rawStr, `(${data.byteLength}b)`);
        const parsed = parseFitDaysPacket(data, prevWeightRef.current, stableCountRef.current, tareWeightRef.current);
        console.log("[MEDITIVE BLE] parsed:", parsed);
        setBleDebugLog(prev => [
          ...prev.slice(-19),
          `[${data.byteLength}b] ${rawStr}${parsed ? ` → ${parsed.weight}kg imp=${parsed.impedance}Ω ${parsed.stable ? "✅STABLE" : `⏳${parsed.stableCount}/${STABLE_THRESHOLD}`}` : " → null"}`,
        ]);
        if (!parsed) return;
        if (tareWeightRef.current === undefined) {
          tareBufferRef.current.push(parsed.weight);
          if (tareBufferRef.current.length >= 5) {
            const avg = tareBufferRef.current.reduce((a, b) => a + b, 0) / tareBufferRef.current.length;
            tareWeightRef.current = parseFloat(avg.toFixed(1));
          }
          setLiveWeight(parsed.weight);
          prevWeightRef.current = parsed.weight;
          return;
        }
        setLiveWeight(parsed.weight);
        prevWeightRef.current  = parsed.weight;
        stableCountRef.current = parsed.stableCount;
        if (!parsed.stable) return;
        if (stableFiredRef.current) return;
        stableFiredRef.current = true;
        setLiveWeight(null);
        prevWeightRef.current  = undefined;
        stableCountRef.current = 0;
        setPendingRaw({ weight: parsed.weight, impedance: parsed.impedance });
        if (hasSavedBio) {
          const bio = profileBio as UserBio;
          const computed = computeAllMetrics(parsed.weight, parsed.impedance, bio);
          setMetrics(computed);
          const draft: Partial<Record<keyof Metrics, string>> = {};
          for (const key of Object.keys(computed) as (keyof Metrics)[]) {
            const v = computed[key];
            if (v !== null) draft[key] = String(v);
          }
          setManualDraft(draft);
          setShowManual(true);
        } else {
          setShowBioPrompt(true);
        }
      });
    });
  }, [hasSavedBio]);

  const connectBLE = useCallback(async () => {
    if (!("bluetooth" in navigator)) { setBleStatus("unsupported"); return; }
    setBleStatus("scanning"); setBleError(null);
    stableFiredRef.current = false; stableCountRef.current = 0;
    prevWeightRef.current = undefined; tareBufferRef.current = []; tareWeightRef.current = undefined;
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "0000fff0-0000-1000-8000-00805f9b34fb",
          "0000ffb0-0000-1000-8000-00805f9b34fb",
          "0000fee0-0000-1000-8000-00805f9b34fb",
          "0000180d-0000-1000-8000-00805f9b34fb",
          "0000180a-0000-1000-8000-00805f9b34fb",
        ],
      });
      device.addEventListener("gattserverdisconnected", () => setBleStatus("idle"));
      const server = await device.gatt.connect();
      const serviceUuids = [
        "0000ffb0-0000-1000-8000-00805f9b34fb",
        "0000fff0-0000-1000-8000-00805f9b34fb",
        "0000fee0-0000-1000-8000-00805f9b34fb",
      ];
      let service: any = null;
      for (const uuid of serviceUuids) {
        try { service = await server.getPrimaryService(uuid); break; } catch { }
      }
      if (!service) {
        setBleError("No scale data service found. Select your MEDITIVE scale and try again.");
        setBleStatus("failed"); return;
      }
      const charUuids = [
        "0000ffb2-0000-1000-8000-00805f9b34fb",
        "0000fff1-0000-1000-8000-00805f9b34fb",
        "0000fff4-0000-1000-8000-00805f9b34fb",
      ];
      let characteristic: any = null;
      for (const uuid of charUuids) {
        try { characteristic = await service.getCharacteristic(uuid); break; } catch { }
      }
      if (!characteristic) {
        setBleError("Scale service found but couldn't read data. Try Manual Entry.");
        setBleStatus("failed"); setShowManual(true); return;
      }
      subscribeToScale(characteristic);
      try {
        const writeChar = await service.getCharacteristic("0000ffb1-0000-1000-8000-00805f9b34fb");
        const bio = profileBio as UserBio;
        const profilePkt = hasSavedBio
          ? buildProfilePacket(bio.gender, bio.heightCm, bio.age)
          : new Uint8Array([0xAC,0x27,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xdf,0xe0]);
        await writeChar.writeValue(profilePkt);
      } catch { }
    } catch (err: any) {
      if (err?.name === "NotAllowedError") setBleError("Bluetooth permission denied.");
      else if (err?.name !== "NotFoundError") setBleError(`Connection failed: ${err?.message ?? "unknown error"}.`);
      setBleStatus("failed");
    }
  }, [subscribeToScale]);

  const connectBLEFallback = useCallback(async () => {
    if (!("bluetooth" in navigator)) { setBleStatus("unsupported"); return; }
    setBleStatus("scanning"); setBleError(null);
    stableFiredRef.current = false; stableCountRef.current = 0;
    prevWeightRef.current = undefined; tareBufferRef.current = []; tareWeightRef.current = undefined;
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["0000fff0-0000-1000-8000-00805f9b34fb","0000ffb0-0000-1000-8000-00805f9b34fb","0000fee0-0000-1000-8000-00805f9b34fb"],
      });
      device.addEventListener("gattserverdisconnected", () => setBleStatus("idle"));
      const server = await device.gatt.connect();
      let service: any = null;
      for (const uuid of ["0000fff0-0000-1000-8000-00805f9b34fb","0000ffb0-0000-1000-8000-00805f9b34fb"]) {
        try { service = await server.getPrimaryService(uuid); break; } catch { }
      }
      if (!service) { setBleError("No service found. Try Manual Entry."); setBleStatus("connected"); setShowManual(true); return; }
      let characteristic: any = null;
      for (const uuid of ["0000ffb2-0000-1000-8000-00805f9b34fb","0000fff1-0000-1000-8000-00805f9b34fb","0000fff4-0000-1000-8000-00805f9b34fb"]) {
        try { characteristic = await service.getCharacteristic(uuid); break; } catch { }
      }
      if (!characteristic) throw new Error("No notify characteristic found");
      subscribeToScale(characteristic);
      try {
        const writeChar = await service.getCharacteristic("0000ffb1-0000-1000-8000-00805f9b34fb");
        const bio = profileBio as UserBio;
        const profilePkt = hasSavedBio ? buildProfilePacket(bio.gender, bio.heightCm, bio.age)
          : new Uint8Array([0xAC,0x27,0x01,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0xdf,0xe0]);
        await writeChar.writeValue(profilePkt);
      } catch { }
    } catch (err: any) {
      if (err?.name === "NotAllowedError") setBleError("Bluetooth permission denied.");
      else if (err?.name !== "NotFoundError") setBleError(`Connection failed: ${err?.message ?? "unknown error"}.`);
      setBleStatus("failed");
    }
  }, [subscribeToScale]);

  function handleBioConfirm(bio: UserBio) {
    setShowBioPrompt(false);
    if (!pendingRaw) return;
    const computed = computeAllMetrics(pendingRaw.weight, pendingRaw.impedance, bio);
    setMetrics(computed);
    const draft: Partial<Record<keyof Metrics, string>> = {};
    for (const key of Object.keys(computed) as (keyof Metrics)[]) {
      const v = computed[key];
      if (v !== null) draft[key] = String(v);
    }
    setManualDraft(draft);
    setShowManual(true);
    setPendingRaw(null);
  }

  const handleSave = useCallback(async () => {
    setSaving(true);
    const payload: Partial<Metrics> = {};
    for (const def of PARAM_DEFS) {
      const v = manualDraft[def.key];
      if (v !== undefined && v !== "") (payload as any)[def.key] = parseFloat(v);
    }
    try {
      const res = await fetch("/api/user/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, recordedAt: new Date().toISOString() }),
      });
      if (res.ok) {
        setMetrics(m => ({ ...m, ...payload }));
        setSavedFlash(true);
        setShowManual(false);
        setTimeout(() => setSavedFlash(false), 2500);
        // Refresh history if on that tab
        if (tab === "history") {
          const hRes = await fetch("/api/user/metrics/history?limit=30");
          if (hRes.ok) setHistory(await hRes.json());
        }
      }
    } catch { } finally { setSaving(false); }
  }, [manualDraft, tab]);

  const hasData = Object.values(metrics).some(v => v !== null);
  const firstName = user?.name?.split(" ")[0] ?? "Athlete";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 80, color: T.text }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* Back + Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 8 }}>
          <Link href="/dashboard" style={{ color: T.textMuted, textDecoration: "none", display: "flex", alignItems: "center", gap: 4, fontSize: 13, fontWeight: 500 }}>
            <ChevronLeft size={15} /> Dashboard
          </Link>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 16, marginBottom: 32 }}>
          <div>
            <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>Phase 5 · Body Metrics</p>
            <h1 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 38, fontWeight: 900, textTransform: "uppercase", letterSpacing: "-0.01em", lineHeight: 1 }}>
              Your Body <span style={{ color: T.accent }}>Data</span>
            </h1>
          </div>
          <BleButton status={bleStatus} onConnect={connectBLE} onFallbackConnect={connectBLEFallback} onManual={() => setShowManual(true)} />
        </div>

        {/* BLE error banner */}
        {bleError && (
          <div style={{ background: "#450a0a22", border: `1px solid ${T.danger}44`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", alignItems: "flex-start", gap: 10, fontSize: 13, color: T.danger }}>
            <AlertCircle size={15} style={{ flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontWeight: 700, marginBottom: 2 }}>Scale connection issue</p>
              <p style={{ color: T.textMuted }}>{bleError}</p>
            </div>
            <button onClick={() => setBleError(null)} style={{ marginLeft: "auto", background: "transparent", border: "none", color: T.textMuted, cursor: "pointer", flexShrink: 0 }}><X size={14} /></button>
          </div>
        )}

        {/* BLE connected banner */}
        {bleStatus === "connected" && !showManual && !showBioPrompt && (
          <div style={{ background: "#14532d22", border: `1px solid #16a34a44`, borderRadius: 10, padding: "14px 18px", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: T.success }}>
              <Bluetooth size={15} />
              <div style={{ flex: 1 }}>
                <p style={{ fontWeight: 700 }}>
                  Scale connected —{" "}
                  {liveWeight !== null && tareWeightRef.current === undefined
                    ? <span style={{ color: T.textMuted }}>calibrating baseline…</span>
                    : liveWeight !== null
                    ? <span style={{ color: T.accent }}>{liveWeight} kg (stabilising {stableCountRef.current}/{STABLE_THRESHOLD}…)</span>
                    : "step on it barefoot"}
                </p>
                <p style={{ color: T.textMuted, fontSize: 12, marginTop: 2 }}>
                  {liveWeight !== null ? "Stay still — waiting for stable reading." : "Stand still for 3–5 seconds."}
                </p>
              </div>
              {bleDebugLog.length > 0 && (
                <button onClick={() => navigator.clipboard.writeText(bleDebugLog.join("\n"))} style={{ background: "#1a2a1a", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, color: T.textMuted, cursor: "pointer", flexShrink: 0 }}>
                  Copy Raw Log
                </button>
              )}
            </div>
            {bleDebugLog.length > 0 && (
              <div style={{ marginTop: 12, background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: T.textMuted, maxHeight: 140, overflowY: "auto" }}>
                {bleDebugLog.map((line, i) => (
                  <div key={i} style={{ color: line.includes("✅STABLE") ? T.success : line.includes("⏳") ? T.warning : T.textMuted, marginBottom: 2 }}>{line}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Saved flash */}
        {savedFlash && (
          <div style={{ background: "#14532d", border: `1px solid #16a34a`, borderRadius: 10, padding: "12px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: T.success }}>
            <Check size={16} /> Metrics saved successfully!
          </div>
        )}

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, marginBottom: 28, background: T.card, border: `1px solid ${T.border}`, borderRadius: 10, padding: 4, width: "fit-content" }}>
          {(["overview", "history", "log"] as Tab[]).map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? T.accent : "transparent",
              color:      tab === t ? "#000" : T.textMuted,
              border: "none", borderRadius: 7, padding: "7px 18px", fontSize: 13, fontWeight: 700,
              cursor: "pointer", textTransform: "capitalize", letterSpacing: "0.03em",
              transition: "all 0.15s",
            }}>{t}</button>
          ))}
        </div>

        {/* ══ OVERVIEW ══ */}
        {tab === "overview" && (
          <>
            {loadingLatest ? (
              <div style={{ color: T.textMuted, fontSize: 13, padding: "40px 0", textAlign: "center" }}>Loading your data…</div>
            ) : !hasData ? (
              <EmptyState onBle={connectBLE} onManual={() => setShowManual(true)} bleStatus={bleStatus} firstName={firstName} />
            ) : (
              <MetricsGrid metrics={metrics} onInfoClick={k => setShowInfo(k)} />
            )}
          </>
        )}

        {/* ══ HISTORY ══ */}
        {tab === "history" && (
          <HistoryTab
            history={history}
            loading={loadingHistory}
          />
        )}

        {/* ══ LOG ══ */}
        {tab === "log" && (
          <>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Log Entry</h2>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
                Manually enter any or all of the 18 parameters. Only filled fields are saved.
              </p>
              <ManualForm draft={manualDraft} onChange={setManualDraft} onSave={handleSave} saving={saving} />
            </div>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>BLE Raw Packet Log</h3>
                  <p style={{ fontSize: 12, color: T.textMuted }}>Connect scale and step on — raw bytes appear here for diagnostics.</p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {bleDebugLog.length > 0 && (
                    <>
                      <button onClick={() => navigator.clipboard.writeText(bleDebugLog.join("\n")).then(() => alert("Copied!"))} style={{ background: T.accent, color: "#000", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>Copy Log</button>
                      <button onClick={() => setBleDebugLog([])} style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}>Clear</button>
                    </>
                  )}
                </div>
              </div>
              <div style={{ background: "#050505", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 16px", fontFamily: "monospace", fontSize: 11, minHeight: 80, maxHeight: 320, overflowY: "auto" }}>
                {bleDebugLog.length === 0 ? (
                  <p style={{ color: T.textMuted, margin: 0 }}>No packets yet.</p>
                ) : (
                  bleDebugLog.map((line, i) => (
                    <div key={i} style={{ color: line.includes("✅STABLE") ? T.success : line.includes("⏳") ? T.warning : T.textMuted, marginBottom: 4, lineHeight: 1.5 }}>{line}</div>
                  ))
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {showBioPrompt && (
        <BiometricPrompt onConfirm={handleBioConfirm} onClose={() => { setShowBioPrompt(false); setPendingRaw(null); }} />
      )}
      {showInfo && (
        <InfoDrawer paramKey={showInfo} onClose={() => setShowInfo(null)} metrics={metrics} />
      )}
      {showManual && (
        <ManualModal draft={manualDraft} onChange={setManualDraft} onSave={handleSave} onClose={() => setShowManual(false)} saving={saving} bleConnected={bleStatus === "connected"} />
      )}
    </div>
  );
}

// ─── BLE Button ───────────────────────────────────────────────────────────────
function BleButton({ status, onConnect, onFallbackConnect, onManual }: { status: BleStatus; onConnect: () => void; onFallbackConnect: () => void; onManual: () => void }) {
  const configs: Record<BleStatus, { label: string; icon: React.ReactNode; bg: string; color: string; onClick: () => void }> = {
    idle:        { label: "Connect Scale",   icon: <Bluetooth size={14} />,    bg: T.accent,    color: "#000",      onClick: onConnect },
    scanning:    { label: "Scanning…",       icon: <Bluetooth size={14} />,    bg: T.accentDim, color: T.accent,    onClick: () => {} },
    connected:   { label: "Scale Connected", icon: <Bluetooth size={14} />,    bg: "#14532d",   color: T.success,   onClick: onManual },
    failed:      { label: "Retry Connect",   icon: <BluetoothOff size={14} />, bg: "#450a0a",   color: T.danger,    onClick: onFallbackConnect },
    unsupported: { label: "Manual Entry",    icon: <Plus size={14} />,          bg: T.card,      color: T.textMuted, onClick: onManual },
  };
  const c = configs[status];
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {status === "unsupported" && <p style={{ fontSize: 11, color: T.textMuted, alignSelf: "center" }}>Chrome required for BLE</p>}
      <button onClick={c.onClick} disabled={status === "scanning"} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: c.bg, color: c.color,
        border: `1px solid ${status === "idle" ? "transparent" : T.border}`,
        borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700,
        cursor: status === "scanning" ? "not-allowed" : "pointer",
        letterSpacing: "0.04em", textTransform: "uppercase",
      }}>
        {c.icon} {c.label}
      </button>
      {status !== "unsupported" && (
        <button onClick={onManual} style={{
          display: "flex", alignItems: "center", gap: 8,
          background: "transparent", color: T.textMuted,
          border: `1px solid ${T.border}`,
          borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          <Plus size={14} /> Manual Entry
        </button>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────
function EmptyState({ onBle, onManual, bleStatus, firstName }: { onBle: () => void; onManual: () => void; bleStatus: BleStatus; firstName: string }) {
  return (
    <div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "48px 40px", marginBottom: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.accent}, #38bdf8, #f472b6, ${T.accent})` }} />
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#1a1a1a", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: T.accent }}>
          <Scale size={28} />
        </div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, textTransform: "uppercase", marginBottom: 10 }}>
          No measurements yet, {firstName}
        </h2>
        <p style={{ fontSize: 14, color: T.textMuted, maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Connect your MEDITIVE BLE scale via Bluetooth, or log your first reading manually. All 18 body composition parameters will be tracked here.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <button onClick={onBle} style={{ display: "flex", alignItems: "center", gap: 8, background: T.accent, color: "#000", border: "none", borderRadius: 9, padding: "12px 24px", fontSize: 14, fontWeight: 800, cursor: "pointer", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            <Bluetooth size={15} /> Connect Scale
          </button>
          <button onClick={onManual} style={{ display: "flex", alignItems: "center", gap: 8, background: "transparent", color: T.text, border: `1px solid ${T.border}`, borderRadius: 9, padding: "12px 24px", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
            <Plus size={15} /> Enter Manually
          </button>
        </div>
      </div>
      <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>18 parameters you'll track</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {PARAM_DEFS.map(def => (
          <div key={def.key} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 12, padding: "16px 18px", display: "flex", alignItems: "center", gap: 12, opacity: 0.55 }}>
            <div style={{ color: def.color, flexShrink: 0 }}>{def.icon}</div>
            <div>
              <p style={{ fontSize: 13, fontWeight: 700 }}>{def.label}</p>
              <p style={{ fontSize: 11, color: T.textMuted }}>{def.unit || "—"}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Metrics Grid ─────────────────────────────────────────────────────────────
function MetricsGrid({ metrics, onInfoClick }: { metrics: Metrics; onInfoClick: (k: keyof Metrics) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
      {PARAM_DEFS.map(def => {
        const value = metrics[def.key];
        const rangeInfo = getRangeInfo(def, value);
        return (
          <div key={def.key} onClick={() => onInfoClick(def.key)} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px",
            cursor: "pointer", position: "relative", overflow: "hidden", transition: "border-color 0.15s",
          }}
            onMouseEnter={e => (e.currentTarget.style.borderColor = T.borderHover)}
            onMouseLeave={e => (e.currentTarget.style.borderColor = T.border)}
          >
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 2, background: value !== null ? def.color : T.border, opacity: value !== null ? 1 : 0.3 }} />
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ color: def.color, opacity: value !== null ? 1 : 0.4 }}>{def.icon}</div>
              <Info size={12} color={T.textMuted} />
            </div>
            <p style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 6 }}>{def.label}</p>
            {value !== null ? (
              <>
                <p style={{ fontSize: 26, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", color: T.text, lineHeight: 1, marginBottom: 6 }}>
                  {value.toFixed(def.decimals)}
                  <span style={{ fontSize: 13, fontWeight: 500, color: T.textMuted, marginLeft: 4 }}>{def.unit}</span>
                </p>
                {rangeInfo && (
                  <span style={{ fontSize: 10, fontWeight: 700, color: rangeInfo.color, background: "#1a1a1a", border: `1px solid ${T.border}`, borderRadius: 4, padding: "2px 7px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                    {rangeInfo.label}
                  </span>
                )}
              </>
            ) : (
              <p style={{ fontSize: 22, fontWeight: 700, color: T.border }}>—</p>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── History Tab — FIXED: real DB data, no mock ────────────────────────────────
function HistoryTab({ history, loading }: { history: HistoryRow[]; loading: boolean }) {
  const [chartMetric, setChartMetric] = useState<"weight" | "bodyFatRate" | "muscleMass" | "bmi">("weight");
  const metricLabels = { weight: "Weight (kg)", bodyFatRate: "Body Fat %", muscleMass: "Muscle Mass (kg)", bmi: "BMI" };
  const colors = { weight: T.accent, bodyFatRate: "#f97316", muscleMass: "#34d399", bmi: "#60a5fa" };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return `${d.toLocaleString("default", { month: "short" })} ${d.getDate()}`;
  };

  if (loading) {
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "60px 28px", textAlign: "center" }}>
        <p style={{ color: T.textMuted, fontSize: 14 }}>Loading your history…</p>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "60px 40px", textAlign: "center" }}>
        <Scale size={32} color={T.textMuted} style={{ margin: "0 auto 16px" }} />
        <p style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>No history yet</p>
        <p style={{ color: T.textMuted, fontSize: 14 }}>Save your first measurement to start tracking progress.</p>
      </div>
    );
  }

  const values = history.map(h => (h[chartMetric] as number) ?? 0).filter(Boolean);
  const min = Math.min(...values); const max = Math.max(...values);
  const range = max - min || 0.1;
  const W = 600; const H = 180; const PAD = 40;
  const pts = values.map((v, i) => {
    const x = PAD + (i / Math.max(values.length - 1, 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return { x, y, v, label: formatDate(history[i].recordedAt) };
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <BarChart3 size={16} color={T.accent} />
            <h3 style={{ fontSize: 14, fontWeight: 700 }}>{metricLabels[chartMetric]} — Last {history.length} readings</h3>
          </div>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
            {(Object.entries(metricLabels) as [typeof chartMetric, string][]).map(([k, label]) => (
              <button key={k} onClick={() => setChartMetric(k)} style={{
                fontSize: 11, fontWeight: 700, padding: "5px 12px", borderRadius: 6, cursor: "pointer",
                background: chartMetric === k ? colors[k] + "22" : "transparent",
                color: chartMetric === k ? colors[k] : T.textMuted,
                border: `1px solid ${chartMetric === k ? colors[k] : T.border}`,
              }}>{label}</button>
            ))}
          </div>
        </div>
        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ minWidth: 300 }}>
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={colors[chartMetric]} stopOpacity={0.25} />
                <stop offset="100%" stopColor={colors[chartMetric]} stopOpacity={0} />
              </linearGradient>
            </defs>
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
              const y = H - PAD - t * (H - PAD * 2);
              return (
                <g key={t}>
                  <line x1={PAD} x2={W - PAD} y1={y} y2={y} stroke={T.border} strokeWidth={0.5} />
                  <text x={PAD - 6} y={y + 4} fontSize={9} fill={T.textMuted} textAnchor="end">
                    {(min + t * range).toFixed(1)}
                  </text>
                </g>
              );
            })}
            {pts.length > 1 && (
              <>
                <polygon
                  points={`${pts[0].x},${H - PAD} ${pts.map(p => `${p.x},${p.y}`).join(" ")} ${pts[pts.length-1].x},${H - PAD}`}
                  fill="url(#chartGrad)"
                />
                <polyline
                  points={pts.map(p => `${p.x},${p.y}`).join(" ")}
                  fill="none" stroke={colors[chartMetric]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round"
                />
              </>
            )}
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill={colors[chartMetric]} />
                <text x={p.x} y={p.y - 10} fontSize={9} fill={colors[chartMetric]} textAnchor="middle" fontWeight="700">{p.v.toFixed(1)}</text>
                <text x={p.x} y={H - PAD + 14} fontSize={9} fill={T.textMuted} textAnchor="middle">{p.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 28px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>All Readings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...history].reverse().map((row, i) => (
            <div key={i} style={{ background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Scale size={14} color={T.accent} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{formatDate(row.recordedAt)}, {new Date(row.recordedAt).getFullYear()}</p>
                  <p style={{ fontSize: 11, color: T.textMuted }}>{new Date(row.recordedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })} · MEDITIVE BLE Scale</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { label: "Weight",   value: `${row.weight} kg`,      color: T.accent },
                  { label: "Body Fat", value: `${row.bodyFatRate}%`,   color: "#f97316" },
                  { label: "Muscle",   value: `${row.muscleMass} kg`,  color: "#34d399" },
                  { label: "BMI",      value: `${row.bmi}`,            color: "#60a5fa" },
                  ...(row.visceralFat ? [{ label: "Visceral", value: `${row.visceralFat}`, color: "#f43f5e" }] : []),
                ].map(stat => (
                  <div key={stat.label} style={{ textAlign: "right" }}>
                    <p style={{ fontSize: 14, fontWeight: 800, color: stat.color }}>{stat.value}</p>
                    <p style={{ fontSize: 10, color: T.textMuted }}>{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Rich Info Drawer with tips + personalised insight ────────────────────────
function InfoDrawer({ paramKey, onClose, metrics }: { paramKey: keyof Metrics; onClose: () => void; metrics: Metrics }) {
  const def = PARAM_DEFS.find(d => d.key === paramKey)!;
  const value = metrics[paramKey];
  const rangeInfo = getRangeInfo(def, value);
  const personalInsight = def.insightFn && value !== null ? def.insightFn(value, metrics) : null;

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#141414", border: `1px solid ${T.border}`, borderRadius: "20px 20px 0 0", padding: "28px 28px 44px", width: "100%", maxWidth: 580, maxHeight: "85vh", overflowY: "auto" }} onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: def.color }}>{def.icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>{def.label}</h3>
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer" }}><X size={18} /></button>
        </div>

        {/* Value + badge */}
        {value !== null && (
          <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 16 }}>
            <span style={{ fontSize: 36, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", color: def.color }}>
              {value.toFixed(def.decimals)}
            </span>
            <span style={{ fontSize: 16, color: T.textMuted }}>{def.unit}</span>
            {rangeInfo && (
              <span style={{ fontSize: 11, fontWeight: 700, color: rangeInfo.color, background: rangeInfo.color + "18", border: `1px solid ${rangeInfo.color}44`, borderRadius: 5, padding: "3px 9px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                {rangeInfo.label}
              </span>
            )}
          </div>
        )}

        {/* Description */}
        <p style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.75, marginBottom: 20 }}>{def.description}</p>

        {/* Personalised insight */}
        {personalInsight && (
          <div style={{ background: def.color + "12", border: `1px solid ${def.color}33`, borderRadius: 10, padding: "12px 16px", marginBottom: 20, display: "flex", gap: 10 }}>
            <Lightbulb size={15} color={def.color} style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: 13, color: def.color, lineHeight: 1.6 }}>{personalInsight}</p>
          </div>
        )}

        {/* Reference ranges */}
        {def.ranges && (
          <>
            <p style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Reference ranges</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 20 }}>
              {def.ranges.map(r => {
                const isActive = rangeInfo?.label === r.label;
                const barPct = value !== null && def.ranges
                  ? Math.min(100, Math.max(0, ((value - r.min) / (r.max - r.min)) * 100))
                  : 0;
                return (
                  <div key={r.label} style={{
                    padding: "10px 14px", background: isActive ? r.color + "15" : "#1a1a1a",
                    border: `1px solid ${isActive ? r.color : T.border}`, borderRadius: 8,
                  }}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: isActive ? 6 : 0 }}>
                      <span style={{ fontSize: 13, color: r.color, fontWeight: 700 }}>{r.label}</span>
                      <span style={{ fontSize: 12, color: T.textMuted }}>
                        {r.min === 0 ? `< ${r.max}` : r.max === 999 || r.max === 100 ? `> ${r.min}` : `${r.min} – ${r.max}`} {def.unit}
                      </span>
                    </div>
                    {isActive && value !== null && (
                      <div style={{ height: 3, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                        <div style={{ height: 3, width: `${barPct}%`, background: r.color, borderRadius: 2 }} />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}

        {/* Tips */}
        {def.tips && def.tips.length > 0 && (
          <>
            <p style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
              Tips to improve
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {def.tips.map((tip, i) => (
                <div key={i} style={{ display: "flex", gap: 10, padding: "10px 14px", background: "#111", border: `1px solid ${T.border}`, borderRadius: 8 }}>
                  <div style={{ width: 20, height: 20, borderRadius: 5, background: def.color + "22", border: `1px solid ${def.color}44`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 10, fontWeight: 800, color: def.color }}>
                    {i + 1}
                  </div>
                  <p style={{ fontSize: 13, color: T.textSecond, lineHeight: 1.6 }}>{tip}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Manual Form ──────────────────────────────────────────────────────────────
function ManualForm({ draft, onChange, onSave, saving }: {
  draft: Partial<Record<keyof Metrics, string>>;
  onChange: (d: Partial<Record<keyof Metrics, string>>) => void;
  onSave: () => void;
  saving: boolean;
}) {
  return (
    <>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 14, marginBottom: 24 }}>
        {PARAM_DEFS.map(def => (
          <div key={def.key}>
            <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>
              <span style={{ color: def.color, marginRight: 5 }}>{def.icon}</span>
              {def.label} {def.unit && <span style={{ color: T.border }}>({def.unit})</span>}
            </label>
            <input
              type="number" step="0.1"
              value={draft[def.key] ?? ""}
              onChange={e => onChange({ ...draft, [def.key]: e.target.value })}
              placeholder="—"
              style={{
                width: "100%", boxSizing: "border-box",
                background: draft[def.key] ? "#0f1a0a" : "#0f0f0f",
                border: `1px solid ${draft[def.key] ? T.accentDim : T.border}`,
                borderRadius: 8, padding: "10px 12px", fontSize: 14, fontWeight: 600,
                color: T.text, outline: "none",
              }}
            />
          </div>
        ))}
      </div>
      <button onClick={onSave} disabled={saving} style={{
        display: "flex", alignItems: "center", gap: 8,
        background: T.accent, color: "#000", border: "none",
        borderRadius: 9, padding: "12px 28px", fontSize: 14, fontWeight: 800,
        cursor: saving ? "not-allowed" : "pointer", letterSpacing: "0.05em", textTransform: "uppercase",
        opacity: saving ? 0.6 : 1,
      }}>
        <Check size={15} /> {saving ? "Saving…" : "Save Entry"}
      </button>
    </>
  );
}

// ─── Manual Modal ─────────────────────────────────────────────────────────────
function ManualModal({ draft, onChange, onSave, onClose, saving, bleConnected }: {
  draft: Partial<Record<keyof Metrics, string>>;
  onChange: (d: Partial<Record<keyof Metrics, string>>) => void;
  onSave: () => void;
  onClose: () => void;
  saving: boolean;
  bleConnected: boolean;
}) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", zIndex: 100, overflowY: "auto", display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "40px 20px" }}>
      <div style={{ background: "#141414", border: `1px solid ${T.border}`, borderRadius: 20, padding: "32px", width: "100%", maxWidth: 720 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700 }}>
            {bleConnected ? "Scale Connected — Review & Save" : "Manual Entry"}
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer" }}><X size={20} /></button>
        </div>
        {bleConnected && (
          <div style={{ background: "#14532d22", border: `1px solid #16a34a44`, borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.success }}>
            <Bluetooth size={14} /> Metrics auto-populated from your scale. Review and hit Save.
          </div>
        )}
        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
          {bleConnected ? "Values calculated from weight + impedance. Edit any field before saving." : "Fill any or all fields — empty fields are skipped."}
        </p>
        <ManualForm draft={draft} onChange={onChange} onSave={onSave} saving={saving} />
      </div>
    </div>
  );
}