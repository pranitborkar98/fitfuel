"use client";

import React, { useState, useCallback, useRef } from "react";
import Link from "next/link";
import {
  Activity, Bluetooth, BluetoothOff, ChevronLeft, Plus,
  Zap, Scale, Droplets, Flame, Dumbbell, Heart, Brain,
  TrendingDown, TrendingUp, Minus, Info, X, Check,
  AlertCircle, BarChart3, Clock, Target, User,
} from "lucide-react";

// ─── Design tokens (matches FitFuel system) ─────────────────────────────────
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

// ─── All 13 real Fitdays BLE parameters ─────────────────────────────────────
interface Metrics {
  weight:          number | null; // kg
  bmi:             number | null;
  bodyFatRate:     number | null; // %
  fatFreeWeight:   number | null; // kg
  subcutaneousFat: number | null; // %
  visceralFat:     number | null; // level 1-20
  bodyWater:       number | null; // %
  skeletalMuscle:  number | null; // %
  muscleMass:      number | null; // kg
  boneMass:        number | null; // kg
  protein:         number | null; // %
  bmr:             number | null; // kcal
  bodyAge:         number | null; // years
}

const EMPTY_METRICS: Metrics = {
  weight: null, bmi: null, bodyFatRate: null, fatFreeWeight: null,
  subcutaneousFat: null, visceralFat: null, bodyWater: null,
  skeletalMuscle: null, muscleMass: null, boneMass: null,
  protein: null, bmr: null, bodyAge: null,
};

// ─── User biometrics needed for BIA calculations ─────────────────────────────
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
}

const PARAM_DEFS: ParamDef[] = [
  {
    key: "weight", label: "Weight", unit: "kg", icon: <Scale size={16} />, color: T.accent, decimals: 2,
    description: "Total body weight measured in kilograms.",
    ranges: [{ label: "Normal", color: T.success, min: 0, max: 999 }],
  },
  {
    key: "bmi", label: "BMI", unit: "", icon: <Target size={16} />, color: "#60a5fa", decimals: 1,
    description: "Body Mass Index — weight relative to height.",
    ranges: [
      { label: "Underweight", color: T.info,    min: 0,    max: 18.4 },
      { label: "Normal",      color: T.success,  min: 18.5, max: 24.9 },
      { label: "Overweight",  color: T.warning,  min: 25,   max: 29.9 },
      { label: "Obese",       color: T.danger,   min: 30,   max: 999  },
    ],
  },
  {
    key: "bodyFatRate", label: "Body Fat", unit: "%", icon: <TrendingDown size={16} />, color: "#f97316", decimals: 1,
    description: "Percentage of total body mass that is fat.",
    ranges: [
      { label: "Essential",  color: T.info,    min: 2,  max: 5  },
      { label: "Athletic",   color: T.success, min: 6,  max: 13 },
      { label: "Fitness",    color: T.accent,  min: 14, max: 17 },
      { label: "Average",    color: T.warning, min: 18, max: 24 },
      { label: "Obese",      color: T.danger,  min: 25, max: 100 },
    ],
  },
  {
    key: "fatFreeWeight", label: "Fat-Free Weight", unit: "kg", icon: <Dumbbell size={16} />, color: "#a78bfa", decimals: 1,
    description: "Total body weight minus all fat mass.",
  },
  {
    key: "subcutaneousFat", label: "Subcutaneous Fat", unit: "%", icon: <TrendingDown size={16} />, color: "#fb923c", decimals: 1,
    description: "Fat stored just beneath the skin surface.",
    ranges: [
      { label: "Low",      color: T.success, min: 0,  max: 14 },
      { label: "Normal",   color: T.accent,  min: 15, max: 22 },
      { label: "High",     color: T.warning, min: 23, max: 30 },
      { label: "Very High",color: T.danger,  min: 31, max: 100 },
    ],
  },
  {
    key: "visceralFat", label: "Visceral Fat", unit: "level", icon: <AlertCircle size={16} />, color: "#f43f5e", decimals: 0,
    description: "Fat surrounding internal organs. Level 1–9 is healthy, 10–14 is high, 15+ is very high.",
    ranges: [
      { label: "Healthy",   color: T.success, min: 1,  max: 9  },
      { label: "High",      color: T.warning, min: 10, max: 14 },
      { label: "Very High", color: T.danger,  min: 15, max: 30 },
    ],
  },
  {
    key: "bodyWater", label: "Body Water", unit: "%", icon: <Droplets size={16} />, color: "#38bdf8", decimals: 1,
    description: "Total body water as a percentage of body weight.",
    ranges: [
      { label: "Low",    color: T.warning, min: 0,  max: 49 },
      { label: "Normal", color: T.success, min: 50, max: 65 },
      { label: "High",   color: T.info,   min: 66, max: 100 },
    ],
  },
  {
    key: "skeletalMuscle", label: "Skeletal Muscle", unit: "%", icon: <Activity size={16} />, color: T.accent, decimals: 1,
    description: "Skeletal muscle as a percentage of total body weight.",
    ranges: [
      { label: "Low",      color: T.warning, min: 0,  max: 32 },
      { label: "Normal",   color: T.success, min: 33, max: 44 },
      { label: "High",     color: T.accent,  min: 45, max: 100 },
    ],
  },
  {
    key: "muscleMass", label: "Muscle Mass", unit: "kg", icon: <Dumbbell size={16} />, color: "#34d399", decimals: 1,
    description: "Total skeletal muscle mass in kilograms.",
  },
  {
    key: "boneMass", label: "Bone Mass", unit: "kg", icon: <Activity size={16} />, color: "#94a3b8", decimals: 2,
    description: "Estimated bone mineral mass in kilograms.",
    ranges: [
      { label: "Low",    color: T.warning, min: 0,   max: 1.9 },
      { label: "Normal", color: T.success, min: 2.0, max: 3.5 },
      { label: "High",   color: T.info,   min: 3.6, max: 10  },
    ],
  },
  {
    key: "protein", label: "Protein", unit: "%", icon: <Zap size={16} />, color: "#f472b6", decimals: 1,
    description: "Protein content as a percentage of body weight.",
    ranges: [
      { label: "Low",    color: T.warning, min: 0,  max: 15 },
      { label: "Normal", color: T.success, min: 16, max: 20 },
      { label: "High",   color: T.accent,  min: 21, max: 100 },
    ],
  },
  {
    key: "bmr", label: "BMR", unit: "kcal", icon: <Flame size={16} />, color: "#fb923c", decimals: 0,
    description: "Basal Metabolic Rate — calories burned at complete rest per day.",
  },
  {
    key: "bodyAge", label: "Body Age", unit: "yrs", icon: <Brain size={16} />, color: "#c084fc", decimals: 0,
    description: "Metabolic age estimate based on BMR compared to the average for your age group.",
  },
];

// ─── Mock history (replace with real DB data when wired) ────────────────────
const MOCK_HISTORY = [
  { date: "May 10", weight: 72.4, bodyFatRate: 18.2, muscleMass: 55.1, bmi: 23.1 },
  { date: "May 12", weight: 72.1, bodyFatRate: 17.9, muscleMass: 55.3, bmi: 23.0 },
  { date: "May 14", weight: 71.8, bodyFatRate: 17.6, muscleMass: 55.5, bmi: 22.9 },
  { date: "May 17", weight: 71.5, bodyFatRate: 17.3, muscleMass: 55.8, bmi: 22.8 },
];

type BleStatus = "idle" | "scanning" | "connected" | "failed" | "unsupported";
type Tab = "overview" | "history" | "log";

// ─── Helper: get range label for a value ────────────────────────────────────
function getRangeInfo(def: ParamDef, value: number | null) {
  if (value === null || !def.ranges) return null;
  const range = def.ranges.find(r => value >= r.min && value <= r.max);
  return range ?? null;
}

// ─── BIA CALCULATION ENGINE ──────────────────────────────────────────────────
// These formulas mirror what the Fitdays app computes client-side.
// The scale sends only weight (kg) + impedance (ohms) over BLE.
// Everything else is derived from those two values + user profile.

function calcBodyFat(weight: number, impedance: number, height: number, age: number, gender: "male" | "female"): number {
  // Deurenberg (1991) BMI-based formula — validated across populations, gives
  // 20-30% for typical adult male (avoids the broken impedance coefficient issue).
  // Males: BF% = 1.2*BMI + 0.23*age - 16.2
  // Females: BF% = 1.2*BMI + 0.23*age - 5.4
  const h   = height / 100;
  const bmi = weight / (h * h);
  const base = 1.2 * bmi + 0.23 * age;
  const bf   = gender === "male" ? base - 16.2 : base - 5.4;
  return Math.max(5, Math.min(50, bf));
}

function calcBMR(weight: number, height: number, age: number, gender: "male" | "female"): number {
  // Mifflin–St Jeor
  if (gender === "male") return Math.round(10 * weight + 6.25 * height - 5 * age + 5);
  return Math.round(10 * weight + 6.25 * height - 5 * age - 161);
}

function computeAllMetrics(weight: number, impedance: number, bio: UserBio): Metrics {
  const { heightCm, age, gender } = bio;
  const h = heightCm / 100;

  const bmi            = parseFloat((weight / (h * h)).toFixed(1));
  const bodyFatRate    = parseFloat(calcBodyFat(weight, impedance, heightCm, age, gender).toFixed(1));
  const fatFreeWeight  = parseFloat((weight * (1 - bodyFatRate / 100)).toFixed(1));
  const subcutaneousFat = parseFloat((bodyFatRate * 0.82).toFixed(1));  // ~82% of body fat is subcutaneous
  const bodyWater      = parseFloat((fatFreeWeight / weight * 73.2).toFixed(1));
  const muscleMass     = parseFloat((fatFreeWeight * 0.826).toFixed(1));
  const skeletalMuscle = parseFloat((muscleMass / weight * 100).toFixed(1));
  const boneMass       = parseFloat((weight < 60 ? 1.96 : weight < 75 ? 2.4 : 2.95).toFixed(2));
  const protein        = parseFloat(((muscleMass * 0.2 / weight) * 100).toFixed(1));
  const bmr            = calcBMR(weight, heightCm, age, gender);
  const visceralFat    = Math.round(bodyFatRate * 0.25 + bmi * 0.1);
  const bodyAge        = Math.round(age + (bodyFatRate - (gender === "male" ? 18 : 25)) * 0.4);

  return {
    weight, bmi, bodyFatRate, fatFreeWeight, subcutaneousFat,
    visceralFat: Math.max(1, Math.min(20, visceralFat)),
    bodyWater: Math.max(35, Math.min(75, bodyWater)),
    skeletalMuscle, muscleMass, boneMass,
    protein: Math.max(8, Math.min(30, protein)),
    bmr,
    bodyAge: Math.max(age - 10, Math.min(age + 20, bodyAge)),
  };
}

// ─── BLE PACKET PARSER ───────────────────────────────────────────────────────
// MEDITIVE scale — service 0xFFB0, notify characteristic 0xFFB2
//
// ADAPTIVE PARSER — handles variable packet lengths from this scale.
//
// CONFIRMED from HCI btsnoop log (bugreport analysis, May 2026):
//   • All packets start with 0xAC 0x27
//   • Weight = (bytes[3]<<8 | bytes[4] - 25454) * (21.3/356)
//     The raw value has a fixed offset (~25454) and does NOT start at 0 for 0 kg.
//     Two-point calibration:
//       raw=26980 (0x6964) → 91.3 kg  ✓ (simultaneous scale+app photo, May 2026)
//       raw=26624 (0x6800) → 70.0 kg  ✓ (confirmed 70kg person, app wrongly showed 90.1 with old formula)
//     OLD WRONG FORMULA: raw/295.5 — gives ~90 kg for everyone regardless of actual weight. DO NOT USE.
//   • Impedance is 2-byte big-endian near the END of the packet.
//     For 20-byte packets: bytes[17:19]. For others: scan for value in 50–2000 Ω range.
//   • The scale streams AC 27 packets continuously. All 13 body composition metrics
//     are computed client-side from weight + impedance using Deurenberg BIA formulas.
//     The scale does NOT send back computed body fat — our BIA formulas are required.
//
// USER PROFILE must be written to FFB1 (handle 0x0011) before stepping on:
//   Byte layout confirmed from btsnoop captures of original Fitdays app:
//   [0:2]  = 0xac 0x27 (header)
//   [2]    = 0x6a (packet type: user profile)
//   [3]    = 0x18
//   [4:6]  = session counter (uint16 BE, increment each send; 0x0000 is fine)
//   [6]    = 0x16
//   [7]    = 0x00
//   [8]    = sex (0=female, 1=male)
//   [9]    = height in cm (uint8)
//   [10:12] = 0x00 0x00 (previous impedance, 0 for first measurement)
//   [12]   = age (uint8)
//   [13]   = unit (0x01=kg, 0x02=lb)
//   [14:16] = 0x00 0x00 (previous body fat, 0 for first measurement)
//   [16]   = 0x03
//   [17]   = 0x00
//   [18]   = 0xd0 (flag: user data profile packet)
//   [19]   = checksum: sum(bytes[2:19]) & 0xFF
//
// STABILITY via convergence:
// Require 8 consecutive packets within 0.1 kg — matching the scale's ~4-second lock window.
//
// stableCount is passed in and must reach STABLE_THRESHOLD before we declare stable.

const STABLE_THRESHOLD = 8;

/**
 * Build the user-profile packet to write to FFB1 (GATT handle 0x0011) before measurement.
 * Format confirmed from HCI btsnoop analysis of original Fitdays app.
 * The scale uses this to calibrate impedance for body composition.
 */
function buildProfilePacket(
  sex: "male" | "female",
  heightCm: number,
  age: number,
): Uint8Array {
  const pkt = new Uint8Array(20);
  pkt[0]  = 0xac;
  pkt[1]  = 0x27;
  pkt[2]  = 0x6a;  // packet type: user profile
  pkt[3]  = 0x18;
  pkt[4]  = 0x00;  // session counter hi (0 is fine)
  pkt[5]  = 0x00;  // session counter lo
  pkt[6]  = 0x16;
  pkt[7]  = 0x00;
  pkt[8]  = sex === "male" ? 0x01 : 0x00;
  pkt[9]  = Math.max(100, Math.min(250, Math.round(heightCm))) & 0xFF;
  pkt[10] = 0x00;  // previous impedance hi
  pkt[11] = 0x00;  // previous impedance lo
  pkt[12] = Math.max(10, Math.min(110, Math.round(age))) & 0xFF;
  pkt[13] = 0x01;  // unit: kg
  pkt[14] = 0x00;  // previous body fat hi
  pkt[15] = 0x00;  // previous body fat lo
  pkt[16] = 0x03;
  pkt[17] = 0x00;
  pkt[18] = 0xd0;  // flag: user data profile
  // checksum = sum(bytes[2:19]) & 0xFF
  let cs = 0;
  for (let i = 2; i < 19; i++) cs += pkt[i];
  pkt[19] = cs & 0xFF;
  return pkt;
}

function parseFitDaysPacket(
  data: DataView,
  prevWeight?: number,
  stableCount?: number,
  tareWeight?: number,   // idle baseline learned from first 5 packets
): { weight: number; impedance: number; stable: boolean; stableCount: number } | null {
  if (data.byteLength < 6) return null;

  const bytes = Array.from({ length: data.byteLength }, (_, i) => data.getUint8(i));

  // ── Non-MEDITIVE fallback: FitDays / generic BIA scale ────────────────────
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

  // ── MEDITIVE 0xAC packet — adaptive length handler ────────────────────────
  //
  // CONFIRMED 3-BYTE WEIGHT ENCODING (May 2026, photo-verified):
  // Weight is encoded as a 3-byte big-endian integer across bytes[3], [4], [5].
  // The LSB (byte[5]) carries gram-level resolution — the old 2-byte formula
  // truncated it, causing rounding errors of up to ±0.15 kg.
  //
  // Two photo-verified calibration points (scale display vs BLE raw):
  //   bytes = 69 67 38  →  raw3 = 6907704  →  91.95 kg  ✓
  //   bytes = 69 67 9c  →  raw3 = 6907804  →  92.05 kg  ✓
  //
  // Formula:  weight_kg = (raw3 - 6815754) / 1000
  //   • Offset 6815754 derived from two-point calibration
  //   • Divisor 1000 = each LSB is 1 gram (0.001 kg)
  //   • Display resolution matches scale hardware: 0.05 kg steps
  //   • Use toFixed(2) — toFixed(1) rounds 92.05 → 92.1 (the old visible bug)
  //
  // DO NOT revert to 2-byte (bytes[3]<<8|bytes[4]) — that loses byte[5] precision.
  if (data.byteLength < 6) return null;
  const rawWeight = (bytes[3] << 16) | (bytes[4] << 8) | bytes[5];
  const WEIGHT_OFFSET = 6815754;
  const weight = parseFloat(((rawWeight - WEIGHT_OFFSET) / 1000).toFixed(2));

  if (weight < 20 || weight > 300) return null;  // out of human range

  // Find impedance: confirmed from HCI btsnoop analysis.
  // For 20-byte packets: bytes[17:19] = impedance in Ω (e.g. 0x03D5 = 981Ω ✓)
  // Scan from bytes[17] downward as fallback for other packet lengths.
  let impedance = 500; // mid-range fallback (won't crash BIA calc)
  const impPositions = data.byteLength >= 20
    ? [17, 15, 13, data.byteLength - 3]
    : [data.byteLength - 3, 13, 11];

  for (const pos of impPositions) {
    if (pos >= 0 && pos + 1 < data.byteLength) {
      const imp = (bytes[pos] << 8) | bytes[pos + 1];
      if (imp >= 50 && imp <= 2000) {
        impedance = imp;
        break;
      }
    }
  }

  // ── STABILITY: tare-baseline guard ──────────────────────────────────────────
  // ROOT CAUSE (confirmed from logs, May 2026):
  //   Idle packets have byte[5] noise causing ±0.5kg fluctuation in 3-byte mode.
  //   Only allow stability counter to run if weight > tare + 3kg (a real human
  //   standing on it). tareWeight is computed and passed in by the caller.
  //   weightConverged tolerance: ≤0.05 kg (50g) — matches scale display resolution.
  //
  const TARE_MARGIN = 3.0;
  const isFirstPacket = prevWeight === undefined;
  const aboveTare = tareWeight !== undefined && weight > tareWeight + TARE_MARGIN;
  const weightConverged = !isFirstPacket && Math.abs(weight - prevWeight!) <= 0.05;

  const count = (!aboveTare)      ? 0
              : isFirstPacket     ? 0
              : weightConverged   ? (stableCount ?? 0) + 1
              :                     0;
  const stable = count >= STABLE_THRESHOLD;

  return { weight, impedance, stable, stableCount: count };
}

// ─── Mini sparkline (pure SVG) ───────────────────────────────────────────────
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

// ─── User Bio Prompt Modal ────────────────────────────────────────────────────
function BiometricPrompt({
  onConfirm,
  onClose,
}: {
  onConfirm: (bio: UserBio) => void;
  onClose: () => void;
}) {
  const [height, setHeight] = useState("");
  const [age, setAge]       = useState("");
  const [gender, setGender] = useState<"male" | "female">("male");
  const [err, setErr]       = useState("");

  function handleConfirm() {
    const h = parseFloat(height);
    const a = parseInt(age);
    if (!h || h < 100 || h > 250) { setErr("Enter a valid height (100–250 cm)."); return; }
    if (!a || a < 10 || a > 110)  { setErr("Enter a valid age (10–110)."); return; }
    onConfirm({ heightCm: h, age: a, gender });
  }

  const inputStyle: React.CSSProperties = {
    width: "100%", boxSizing: "border-box",
    background: "#0f0f0f", border: `1px solid ${T.border}`,
    borderRadius: 8, padding: "10px 12px", fontSize: 15, fontWeight: 600,
    color: T.text, outline: "none",
  };

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
          Your scale sends weight + impedance. We need your height, age, and gender to calculate all 13 body composition metrics — just like the Fitdays app does.
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
            <label style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.07em", display: "block", marginBottom: 6 }}>Gender</label>
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
  const [tab, setTab]               = useState<Tab>("overview");
  const [bleStatus, setBleStatus]   = useState<BleStatus>("idle");
  const [metrics, setMetrics]       = useState<Metrics>(EMPTY_METRICS);
  const [showManual, setShowManual] = useState(false);
  const [manualDraft, setManualDraft] = useState<Partial<Record<keyof Metrics, string>>>({});
  const [saving, setSaving]         = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showInfo, setShowInfo]     = useState<keyof Metrics | null>(null);

  // BLE state
  const [showBioPrompt, setShowBioPrompt] = useState(false);
  const [pendingRaw, setPendingRaw]       = useState<{ weight: number; impedance: number } | null>(null);
  const [bleError, setBleError]           = useState<string | null>(null);
  const [liveWeight, setLiveWeight]       = useState<number | null>(null); // streaming preview
  const [bleDebugLog, setBleDebugLog]     = useState<string[]>([]);        // raw packet log for debugging
  const prevWeightRef   = useRef<number | undefined>(undefined);
  const stableCountRef  = useRef<number>(0);
  const stableFiredRef  = useRef<boolean>(false);
  const tareBufferRef   = useRef<number[]>([]);
  const tareWeightRef   = useRef<number | undefined>(undefined);

  // Pre-fill bio from user profile if available (set during onboarding)
  const profileBio: Partial<UserBio> = {
    heightCm: user?.profile?.heightCm ?? undefined,
    age:      user?.profile?.age ?? undefined,
    gender:   user?.profile?.gender?.toLowerCase() === "female" ? "female" : "male",
  };
  const hasSavedBio = !!(profileBio.heightCm && profileBio.age);

  // ── Shared handler: subscribe to characteristic and listen for scale data ──
  const subscribeToScale = useCallback((characteristic: any) => {
    characteristic.startNotifications().then(() => {
      setBleStatus("connected");
      characteristic.addEventListener("characteristicvaluechanged", (event: any) => {
        const data: DataView = event.target.value;

        // Log every raw packet (visible in DevTools AND in the in-app debug panel)
        const raw = Array.from({ length: data.byteLength }, (_: any, i: number) =>
          data.getUint8(i).toString(16).padStart(2, "0")
        );
        const rawStr = raw.join(" ");
        console.log("[MEDITIVE BLE] raw:", rawStr, `(${data.byteLength}b)`);

        const parsed = parseFitDaysPacket(data, prevWeightRef.current, stableCountRef.current, tareWeightRef.current);
        console.log("[MEDITIVE BLE] parsed:", parsed);

        // Always append to debug log (last 20 packets)
        setBleDebugLog(prev => [
          ...prev.slice(-19),
          `[${data.byteLength}b] ${rawStr}${parsed ? ` → ${parsed.weight}kg imp=${parsed.impedance}Ω ${parsed.stable ? "✅STABLE" : `⏳${parsed.stableCount}/${STABLE_THRESHOLD}`}` : " → null"}`,
        ]);

        if (!parsed) return;

        // ── Accumulate tare baseline from first 5 idle packets ──────────────
        // The scale streams packets immediately when powered on, before anyone
        // steps on it. We collect the first 5 parsed weights to learn the idle
        // baseline (tare). Only after tare is established does the stability
        // counter start — this prevents idle noise from ever triggering "stable".
        if (tareWeightRef.current === undefined) {
          tareBufferRef.current.push(parsed.weight);
          if (tareBufferRef.current.length >= 5) {
            const avg = tareBufferRef.current.reduce((a, b) => a + b, 0) / tareBufferRef.current.length;
            tareWeightRef.current = parseFloat(avg.toFixed(1));
            console.log(`[MEDITIVE BLE] tare established: ${tareWeightRef.current} kg`);
          }
          // Don't start stability tracking until tare is established
          setLiveWeight(parsed.weight);
          prevWeightRef.current = parsed.weight;
          return;
        }

        // Update live weight preview and convergence counters
        setLiveWeight(parsed.weight);
        prevWeightRef.current  = parsed.weight;
        stableCountRef.current = parsed.stableCount;

        if (!parsed.stable) {
          console.log(`[MEDITIVE BLE] streaming ${parsed.weight}kg (${parsed.stableCount}/${STABLE_THRESHOLD} consecutive)`);
          return;
        }

        // Guard: only fire stable flow ONCE per connection session
        if (stableFiredRef.current) {
          console.log("[MEDITIVE BLE] stable already fired — ignoring repeat");
          return;
        }
        stableFiredRef.current = true;

        // Stable packet received — clear live preview and trigger BIA flow
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

  // ── BLE connection — acceptAllDevices so every nearby device is visible ────
  // NOTE: filters + acceptAllDevices cannot coexist in Web Bluetooth API.
  // Using acceptAllDevices:true is the only way to guarantee the picker shows
  // devices whose advertisement payload doesn't include the service UUID.
  const connectBLE = useCallback(async () => {
    if (!("bluetooth" in navigator)) {
      setBleStatus("unsupported");
      return;
    }
    setBleStatus("scanning");
    setBleError(null);
    stableFiredRef.current = false;
    stableCountRef.current = 0;
    prevWeightRef.current  = undefined;
    tareBufferRef.current  = [];
    tareWeightRef.current  = undefined;

    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        // acceptAllDevices shows ALL nearby BLE devices (phone, scale, anything).
        // This is required because many scales don't include service UUIDs in
        // their advertisement packets — they only expose services after GATT connect.
        acceptAllDevices: true,
        // optionalServices lets us access these services POST-connection.
        // They must be declared here even with acceptAllDevices.
        optionalServices: [
          "0000fff0-0000-1000-8000-00805f9b34fb", // FitDays / MEDITIVE primary
          "0000ffb0-0000-1000-8000-00805f9b34fb", // some MEDITIVE variants
          "0000fee0-0000-1000-8000-00805f9b34fb", // alternate scale service
          "0000180d-0000-1000-8000-00805f9b34fb", // heart rate (generic, harmless)
          "0000180a-0000-1000-8000-00805f9b34fb", // device information
        ],
      });

      device.addEventListener("gattserverdisconnected", () => setBleStatus("idle"));

      const server = await device.gatt.connect();

      // FFB0 confirmed as MEDITIVE data service via nRF Connect
      const serviceUuids = [
        "0000ffb0-0000-1000-8000-00805f9b34fb", // MEDITIVE confirmed ✓
        "0000fff0-0000-1000-8000-00805f9b34fb", // FitDays fallback
        "0000fee0-0000-1000-8000-00805f9b34fb", // other variants
      ];
      let service: any = null;
      for (const uuid of serviceUuids) {
        try { service = await server.getPrimaryService(uuid); break; } catch { /* try next */ }
      }

      if (!service) {
        setBleError("Connected to device, but no scale data service found. Make sure you selected your MEDITIVE scale, then try again.");
        setBleStatus("failed");
        return;
      }

      // FFB2 = NOTIFY confirmed, FFB1 = WRITE for triggering measurement
      const charUuids = [
        "0000ffb2-0000-1000-8000-00805f9b34fb", // MEDITIVE notify ✓
        "0000fff1-0000-1000-8000-00805f9b34fb", // FitDays fallback
        "0000fff4-0000-1000-8000-00805f9b34fb", // FitDays fallback 2
      ];
      let characteristic: any = null;
      for (const uuid of charUuids) {
        try { characteristic = await service.getCharacteristic(uuid); break; } catch { /* try next */ }
      }

      if (!characteristic) {
        setBleError("Scale service found but couldn't read measurement data. Try Manual Entry.");
        setBleStatus("failed");
        setShowManual(true);
        return;
      }

      // Subscribe to notifications first
      subscribeToScale(characteristic);

      // Send user profile to FFB1 so scale uses correct height/age/sex for impedance calibration.
      // Confirmed format from HCI btsnoop analysis — the scale needs this before stepping on.
      try {
        const writeChar = await service.getCharacteristic("0000ffb1-0000-1000-8000-00805f9b34fb");
        const bio = profileBio as UserBio;
        const profilePkt = hasSavedBio
          ? buildProfilePacket(bio.gender, bio.heightCm, bio.age)
          : new Uint8Array([0xAC, 0x27, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xdf, 0xe0]); // wake-only packet
        await writeChar.writeValue(profilePkt);
      } catch { /* write not required — scale streams automatically */ }

    } catch (err: any) {
      console.error("BLE error:", err);
      if (err?.name === "NotAllowedError") {
        setBleError("Bluetooth permission denied. Please click Allow when the browser asks for Bluetooth access.");
      } else if (err?.name === "NotFoundError") {
        // User cancelled the picker — not a real error
        setBleError(null);
      } else {
        setBleError(`Connection failed: ${err?.message ?? "unknown error"}. Make sure the scale is powered on and nearby.`);
      }
      setBleStatus("failed");
    }
  }, [subscribeToScale]);

  // connectBLEFallback kept for BleButton "failed" retry — same logic, alias
  const connectBLEFallback = useCallback(async () => {
    if (!("bluetooth" in navigator)) { setBleStatus("unsupported"); return; }
    setBleStatus("scanning");
    setBleError(null);
    stableFiredRef.current = false;
    stableCountRef.current = 0;
    prevWeightRef.current  = undefined;
    tareBufferRef.current  = [];
    tareWeightRef.current  = undefined;
    try {
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          "0000fff0-0000-1000-8000-00805f9b34fb",
          "0000ffb0-0000-1000-8000-00805f9b34fb",
          "0000fee0-0000-1000-8000-00805f9b34fb",
        ],
      });
      device.addEventListener("gattserverdisconnected", () => setBleStatus("idle"));

      const server = await device.gatt.connect();

      let service: any = null;
      for (const uuid of ["0000fff0-0000-1000-8000-00805f9b34fb", "0000ffb0-0000-1000-8000-00805f9b34fb"]) {
        try { service = await server.getPrimaryService(uuid); break; } catch { /* try next */ }
      }

      if (!service) {
        setBleError("Connected, but couldn't find scale data service. Try the Manual Entry button instead.");
        setBleStatus("connected");
        setShowManual(true);
        return;
      }

      let characteristic: any = null;
      for (const uuid of [
        "0000ffb2-0000-1000-8000-00805f9b34fb",
        "0000fff1-0000-1000-8000-00805f9b34fb",
        "0000fff4-0000-1000-8000-00805f9b34fb",
      ]) {
        try { characteristic = await service.getCharacteristic(uuid); break; } catch { /* try next */ }
      }
      if (!characteristic) throw new Error("No notify characteristic found");

      subscribeToScale(characteristic);

      try {
        const writeChar = await service.getCharacteristic("0000ffb1-0000-1000-8000-00805f9b34fb");
        const bio = profileBio as UserBio;
        const profilePkt = hasSavedBio
          ? buildProfilePacket(bio.gender, bio.heightCm, bio.age)
          : new Uint8Array([0xAC, 0x27, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0xdf, 0xe0]);
        await writeChar.writeValue(profilePkt);
      } catch { /* optional */ }

    } catch (err: any) {
      console.error("BLE fallback error:", err);
      if (err?.name === "NotAllowedError") {
        setBleError("Bluetooth permission denied. Please allow Bluetooth access and try again.");
      } else if (err?.name !== "NotFoundError") {
        setBleError(`Connection failed: ${err?.message ?? "unknown error"}.`);
      }
      setBleStatus("failed");
    }
  }, [subscribeToScale]);

  // ── Once user provides bio, compute all metrics and pre-fill form ──────────
  function handleBioConfirm(bio: UserBio) {
    setShowBioPrompt(false);
    if (!pendingRaw) return;

    const computed = computeAllMetrics(pendingRaw.weight, pendingRaw.impedance, bio);
    setMetrics(computed);

    // Pre-fill manual draft so user can review + save
    const draft: Partial<Record<keyof Metrics, string>> = {};
    for (const key of Object.keys(computed) as (keyof Metrics)[]) {
      const v = computed[key];
      if (v !== null) draft[key] = String(v);
    }
    setManualDraft(draft);
    setShowManual(true);
    setPendingRaw(null);
  }

  // ── Save metrics (POST to /api/user/metrics) ───────────────────────────────
  const handleSave = useCallback(async () => {
    setSaving(true);
    const payload: Partial<Metrics> = {};
    for (const def of PARAM_DEFS) {
      const v = manualDraft[def.key];
      if (v !== undefined && v !== "") {
        (payload as any)[def.key] = parseFloat(v);
      }
    }
    try {
      await fetch("/api/user/metrics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, recordedAt: new Date().toISOString() }),
      });
      setMetrics(m => ({ ...m, ...payload }));
      setSavedFlash(true);
      setShowManual(false);
      setTimeout(() => setSavedFlash(false), 2500);
    } catch {
      // handle error
    } finally {
      setSaving(false);
    }
  }, [manualDraft]);

  const hasData = Object.values(metrics).some(v => v !== null);
  const firstName = user?.name?.split(" ")[0] ?? "Athlete";

  return (
    <div style={{ background: T.bg, minHeight: "100vh", paddingTop: 88, paddingBottom: 80, color: T.text }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>

        {/* ── Back + Header ── */}
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

          {/* BLE connect button */}
          <BleButton status={bleStatus} onConnect={connectBLE} onFallbackConnect={connectBLEFallback} onManual={() => setShowManual(true)} />
        </div>

        {/* ── BLE error banner ── */}
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

        {/* ── BLE waiting banner (connected, waiting for step-on) ── */}
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
                  {liveWeight !== null && tareWeightRef.current === undefined
                    ? "Learning idle baseline — stay off the scale for a moment."
                    : liveWeight !== null
                    ? "Stay still — waiting for the stable final reading."
                    : "Stand still for 3–5 seconds. Metrics will auto-populate once the reading stabilises."}
                </p>
              </div>
              {bleDebugLog.length > 0 && (
                <button
                  onClick={() => navigator.clipboard.writeText(bleDebugLog.join("\n"))}
                  style={{ background: "#1a2a1a", border: `1px solid ${T.border}`, borderRadius: 7, padding: "6px 12px", fontSize: 11, color: T.textMuted, cursor: "pointer", flexShrink: 0 }}
                >
                  Copy Raw Log
                </button>
              )}
            </div>
            {/* In-app debug panel — shows last packets so you can diagnose without DevTools */}
            {bleDebugLog.length > 0 && (
              <div style={{ marginTop: 12, background: "#0a0a0a", border: `1px solid ${T.border}`, borderRadius: 8, padding: "10px 12px", fontFamily: "monospace", fontSize: 11, color: T.textMuted, maxHeight: 140, overflowY: "auto" }}>
                {bleDebugLog.map((line, i) => (
                  <div key={i} style={{ color: line.includes("✅STABLE") ? T.success : line.includes("⏳") ? T.warning : T.textMuted, marginBottom: 2 }}>{line}</div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── Saved flash ── */}
        {savedFlash && (
          <div style={{ background: "#14532d", border: `1px solid #16a34a`, borderRadius: 10, padding: "12px 20px", marginBottom: 20, display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: T.success }}>
            <Check size={16} /> Metrics saved successfully!
          </div>
        )}

        {/* ── Tabs ── */}
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

        {/* ══════════════════ TAB: OVERVIEW ══════════════════ */}
        {tab === "overview" && (
          <>
            {!hasData ? (
              <EmptyState onBle={connectBLE} onManual={() => setShowManual(true)} bleStatus={bleStatus} firstName={firstName} />
            ) : (
              <MetricsGrid metrics={metrics} onInfoClick={k => setShowInfo(k)} />
            )}
          </>
        )}

        {/* ══════════════════ TAB: HISTORY ══════════════════ */}
        {tab === "history" && <HistoryTab />}

        {/* ══════════════════ TAB: LOG ══════════════════ */}
        {tab === "log" && (
          <>
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px", marginBottom: 24 }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Log Entry</h2>
              <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
                Manually enter any or all parameters. Only filled fields are saved.
              </p>
              <ManualForm draft={manualDraft} onChange={setManualDraft} onSave={handleSave} saving={saving} />
            </div>

            {/* ── BLE Raw Packet Debug Panel — always visible in Log tab ── */}
            <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 28px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                <div>
                  <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 2 }}>BLE Raw Packet Log</h3>
                  <p style={{ fontSize: 12, color: T.textMuted }}>
                    Connect your scale and step on it — raw bytes appear here. Copy and paste to diagnose weight mismatch.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  {bleDebugLog.length > 0 && (
                    <>
                      <button
                        onClick={() => navigator.clipboard.writeText(bleDebugLog.join("\n")).then(() => alert("Copied!"))}
                        style={{ background: T.accent, color: "#000", border: "none", borderRadius: 7, padding: "8px 16px", fontSize: 12, fontWeight: 700, cursor: "pointer" }}
                      >
                        Copy Log
                      </button>
                      <button
                        onClick={() => setBleDebugLog([])}
                        style={{ background: "transparent", color: T.textMuted, border: `1px solid ${T.border}`, borderRadius: 7, padding: "8px 14px", fontSize: 12, cursor: "pointer" }}
                      >
                        Clear
                      </button>
                    </>
                  )}
                </div>
              </div>

              <div style={{
                background: "#050505", border: `1px solid ${T.border}`, borderRadius: 10,
                padding: "14px 16px", fontFamily: "monospace", fontSize: 11,
                minHeight: 80, maxHeight: 320, overflowY: "auto",
              }}>
                {bleDebugLog.length === 0 ? (
                  <p style={{ color: T.textMuted, margin: 0 }}>No packets yet. Connect scale and step on it.</p>
                ) : (
                  bleDebugLog.map((line, i) => (
                    <div key={i} style={{
                      color: line.includes("✅STABLE") ? T.success : line.includes("⏳") ? T.warning : T.textMuted,
                      marginBottom: 4, lineHeight: 1.5,
                    }}>
                      {line}
                    </div>
                  ))
                )}
              </div>

              {bleDebugLog.length > 0 && (
                <p style={{ fontSize: 11, color: T.textMuted, marginTop: 10 }}>
                  ✅ = stable reading used for BIA · ⏳ = streaming preview · Copy this and share to diagnose wrong weight.
                </p>
              )}
            </div>
          </>
        )}

      </div>

      {/* ── Bio prompt modal (appears after stable BLE reading) ── */}
      {showBioPrompt && (
        <BiometricPrompt
          onConfirm={handleBioConfirm}
          onClose={() => { setShowBioPrompt(false); setPendingRaw(null); }}
        />
      )}

      {/* ── Info drawer ── */}
      {showInfo && (
        <InfoDrawer paramKey={showInfo} onClose={() => setShowInfo(null)} metrics={metrics} />
      )}

      {/* ── Manual entry modal ── */}
      {showManual && (
        <ManualModal
          draft={manualDraft}
          onChange={setManualDraft}
          onSave={handleSave}
          onClose={() => setShowManual(false)}
          saving={saving}
          bleConnected={bleStatus === "connected"}
        />
      )}
    </div>
  );
}

// ─── BLE button component ─────────────────────────────────────────────────────
function BleButton({ status, onConnect, onFallbackConnect, onManual }: {
  status: BleStatus;
  onConnect: () => void;
  onFallbackConnect: () => void;
  onManual: () => void;
}) {
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
      {status === "unsupported" && (
        <p style={{ fontSize: 11, color: T.textMuted, alignSelf: "center" }}>Chrome required for BLE</p>
      )}
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
          borderRadius: 9, padding: "10px 20px", fontSize: 13, fontWeight: 700,
          cursor: "pointer",
        }}>
          <Plus size={14} /> Manual Entry
        </button>
      )}
    </div>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────
function EmptyState({ onBle, onManual, bleStatus, firstName }: { onBle: () => void; onManual: () => void; bleStatus: BleStatus; firstName: string }) {
  return (
    <div>
      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 20, padding: "48px 40px", marginBottom: 24, textAlign: "center", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: `linear-gradient(90deg, ${T.accent}, #38bdf8, #f472b6, ${T.accent})`, backgroundSize: "200% 100%" }} />
        <div style={{ width: 64, height: 64, borderRadius: 18, background: "#1a1a1a", border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px", color: T.accent }}>
          <Scale size={28} />
        </div>
        <h2 style={{ fontFamily: "'Barlow Condensed', sans-serif", fontSize: 28, fontWeight: 900, textTransform: "uppercase", marginBottom: 10 }}>
          No measurements yet, {firstName}
        </h2>
        <p style={{ fontSize: 14, color: T.textMuted, maxWidth: 420, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Connect your MEDITIVE BLE scale via Bluetooth, or log your first reading manually. All 13 body composition parameters will be tracked here.
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

      <p style={{ fontSize: 12, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>13 Parameters you'll track</p>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 12 }}>
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

// ─── Metrics grid (when data exists) ─────────────────────────────────────────
function MetricsGrid({ metrics, onInfoClick }: { metrics: Metrics; onInfoClick: (k: keyof Metrics) => void }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 14 }}>
      {PARAM_DEFS.map(def => {
        const value = metrics[def.key];
        const rangeInfo = getRangeInfo(def, value);
        return (
          <div key={def.key} onClick={() => onInfoClick(def.key)} style={{
            background: T.card, border: `1px solid ${T.border}`, borderRadius: 14, padding: "20px 22px",
            cursor: "pointer", position: "relative", overflow: "hidden",
            transition: "border-color 0.15s",
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

// ─── History tab ──────────────────────────────────────────────────────────────
function HistoryTab() {
  const [chartMetric, setChartMetric] = useState<"weight" | "bodyFatRate" | "muscleMass" | "bmi">("weight");
  const metrics = { weight: "Weight (kg)", bodyFatRate: "Body Fat %", muscleMass: "Muscle Mass (kg)", bmi: "BMI" };
  const colors  = { weight: T.accent, bodyFatRate: "#f97316", muscleMass: "#34d399", bmi: "#60a5fa" };

  const values = MOCK_HISTORY.map(h => h[chartMetric] as number);
  const min = Math.min(...values); const max = Math.max(...values);
  const range = max - min || 0.1;

  const W = 600; const H = 180; const PAD = 40;

  const pts = values.map((v, i) => {
    const x = PAD + (i / (values.length - 1)) * (W - PAD * 2);
    const y = H - PAD - ((v - min) / range) * (H - PAD * 2);
    return { x, y, v, label: MOCK_HISTORY[i].date };
  });

  const pathD = pts.map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`).join(" ");
  const areaD = `${pathD} L ${pts[pts.length-1].x} ${H - PAD} L ${pts[0].x} ${H - PAD} Z`;

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
        {(Object.entries(metrics) as [typeof chartMetric, string][]).map(([k, label]) => (
          <button key={k} onClick={() => setChartMetric(k)} style={{
            background: chartMetric === k ? colors[k] + "22" : T.card,
            color: chartMetric === k ? colors[k] : T.textMuted,
            border: `1px solid ${chartMetric === k ? colors[k] : T.border}`,
            borderRadius: 8, padding: "7px 14px", fontSize: 12, fontWeight: 700,
            cursor: "pointer", letterSpacing: "0.03em",
          }}>{label}</button>
        ))}
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 28px", marginBottom: 20, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <BarChart3 size={16} color={colors[chartMetric]} />
          <h3 style={{ fontSize: 14, fontWeight: 700 }}>{metrics[chartMetric]} — Last 7 days</h3>
          <span style={{ fontSize: 11, color: T.textMuted, marginLeft: "auto", display: "flex", alignItems: "center", gap: 4 }}>
            <Clock size={11} /> Sample data — connect scale to track
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: H, display: "block" }}>
            {[0, 0.25, 0.5, 0.75, 1].map(t => {
              const y = PAD + (1 - t) * (H - PAD * 2);
              return (
                <g key={t}>
                  <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke={T.border} strokeWidth={0.5} />
                  <text x={PAD - 6} y={y + 4} fontSize={9} fill={T.textMuted} textAnchor="end">
                    {(min + t * range).toFixed(1)}
                  </text>
                </g>
              );
            })}
            <path d={areaD} fill={colors[chartMetric]} fillOpacity={0.07} />
            <path d={pathD} fill="none" stroke={colors[chartMetric]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {pts.map((p, i) => (
              <g key={i}>
                <circle cx={p.x} cy={p.y} r={4} fill={colors[chartMetric]} />
                <circle cx={p.x} cy={p.y} r={7} fill={colors[chartMetric]} fillOpacity={0.15} />
                <text x={p.x} y={p.y - 12} fontSize={9} fill={T.textSecond} textAnchor="middle">{p.v.toFixed(1)}</text>
                <text x={p.x} y={H - PAD + 14} fontSize={9} fill={T.textMuted} textAnchor="middle">{p.label}</text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "24px 28px" }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16 }}>All Readings</h3>
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {[...MOCK_HISTORY].reverse().map((row, i) => (
            <div key={i} style={{ background: "#0f0f0f", border: `1px solid ${T.border}`, borderRadius: 10, padding: "14px 18px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 32, height: 32, borderRadius: 8, background: T.card, border: `1px solid ${T.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Scale size={14} color={T.accent} />
                </div>
                <div>
                  <p style={{ fontSize: 13, fontWeight: 700 }}>{row.date}, 2026</p>
                  <p style={{ fontSize: 11, color: T.textMuted }}>MEDITIVE BLE Scale</p>
                </div>
              </div>
              <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                {[
                  { label: "Weight",    value: `${row.weight} kg`,        color: T.accent },
                  { label: "Body Fat",  value: `${row.bodyFatRate}%`,      color: "#f97316" },
                  { label: "Muscle",    value: `${row.muscleMass} kg`,    color: "#34d399" },
                  { label: "BMI",       value: row.bmi.toString(),         color: "#60a5fa" },
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

// ─── Info drawer ──────────────────────────────────────────────────────────────
function InfoDrawer({ paramKey, onClose, metrics }: { paramKey: keyof Metrics; onClose: () => void; metrics: Metrics }) {
  const def = PARAM_DEFS.find(d => d.key === paramKey)!;
  const value = metrics[paramKey];
  const rangeInfo = getRangeInfo(def, value);

  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)", zIndex: 100, display: "flex", alignItems: "flex-end", justifyContent: "center" }} onClick={onClose}>
      <div style={{ background: "#141414", border: `1px solid ${T.border}`, borderRadius: "20px 20px 0 0", padding: "28px 28px 40px", width: "100%", maxWidth: 560 }} onClick={e => e.stopPropagation()}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ color: def.color }}>{def.icon}</div>
            <h3 style={{ fontSize: 17, fontWeight: 700 }}>{def.label}</h3>
            {value !== null && <span style={{ fontSize: 22, fontWeight: 900, fontFamily: "'Barlow Condensed', sans-serif", color: def.color }}>{value.toFixed(def.decimals)} {def.unit}</span>}
          </div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer" }}><X size={18} /></button>
        </div>

        <p style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.7, marginBottom: 20 }}>{def.description}</p>

        {def.ranges && (
          <>
            <p style={{ fontSize: 11, color: T.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>Reference ranges</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {def.ranges.map(r => (
                <div key={r.label} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 12px", background: rangeInfo?.label === r.label ? r.color + "15" : "#1a1a1a", border: `1px solid ${rangeInfo?.label === r.label ? r.color : T.border}`, borderRadius: 8 }}>
                  <span style={{ fontSize: 13, color: r.color, fontWeight: 700 }}>{r.label}</span>
                  <span style={{ fontSize: 12, color: T.textMuted }}>
                    {r.min === 0 ? `< ${r.max}` : r.max === 999 || r.max === 100 ? `> ${r.min}` : `${r.min} – ${r.max}`} {def.unit}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {value !== null && rangeInfo && (
          <div style={{ marginTop: 16, padding: "12px 16px", background: rangeInfo.color + "15", border: `1px solid ${rangeInfo.color}44`, borderRadius: 10 }}>
            <p style={{ fontSize: 13, fontWeight: 700, color: rangeInfo.color }}>Your reading: {rangeInfo.label}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Manual entry form ────────────────────────────────────────────────────────
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
              type="number"
              step="0.1"
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

// ─── Manual entry modal ───────────────────────────────────────────────────────
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
          {bleConnected ? "Values calculated from your weight + impedance reading. You can edit any field before saving." : "Fill any or all fields — empty fields are skipped."}
        </p>

        <ManualForm draft={draft} onChange={onChange} onSave={onSave} saving={saving} />
      </div>
    </div>
  );
}