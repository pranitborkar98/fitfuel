"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import {
  Activity, Bluetooth, BluetoothOff, ChevronLeft, Plus,
  Zap, Scale, Droplets, Flame, Dumbbell, Heart, Brain,
  TrendingDown, TrendingUp, Minus, Info, X, Check,
  AlertCircle, BarChart3, Clock, Target,
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
    key: "weight", label: "Weight", unit: "kg", icon: <Scale size={16} />, color: T.accent, decimals: 1,
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

// ─── Main component ──────────────────────────────────────────────────────────
export default function BodyMetricsClient({ user }: { user: any }) {
  const [tab, setTab]             = useState<Tab>("overview");
  const [bleStatus, setBleStatus] = useState<BleStatus>("idle");
  const [metrics, setMetrics]     = useState<Metrics>(EMPTY_METRICS);
  const [showManual, setShowManual] = useState(false);
  const [manualDraft, setManualDraft] = useState<Partial<Record<keyof Metrics, string>>>({});
  const [saving, setSaving]         = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);
  const [showInfo, setShowInfo]     = useState<keyof Metrics | null>(null);

  // BLE connection
  const connectBLE = useCallback(async () => {
    if (!("bluetooth" in navigator)) {
      setBleStatus("unsupported");
      return;
    }
    setBleStatus("scanning");
    try {
      // The Fitdays scale advertises as "icomon" or similar
      const device = await (navigator as any).bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["0000fff0-0000-1000-8000-00805f9b34fb"],
      });
      // In production: subscribe to characteristic notifications and parse BLE packets
      // For now: show connected state and prompt manual entry
      device.addEventListener("gattserverdisconnected", () => setBleStatus("idle"));
      setBleStatus("connected");
      setShowManual(true);
    } catch {
      setBleStatus("failed");
    }
  }, []);

  // Save metrics (POST to /api/user/metrics)
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
          <BleButton status={bleStatus} onConnect={connectBLE} onManual={() => setShowManual(true)} />
        </div>

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
          <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: 16, padding: "28px 32px" }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>Log Entry</h2>
            <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>
              Manually enter any or all parameters. Only filled fields are saved.
            </p>
            <ManualForm draft={manualDraft} onChange={setManualDraft} onSave={handleSave} saving={saving} />
          </div>
        )}

      </div>

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
function BleButton({ status, onConnect, onManual }: { status: BleStatus; onConnect: () => void; onManual: () => void }) {
  const configs: Record<BleStatus, { label: string; icon: React.ReactNode; bg: string; color: string; onClick: () => void }> = {
    idle:        { label: "Connect Scale",   icon: <Bluetooth size={14} />,    bg: T.accent,  color: "#000", onClick: onConnect },
    scanning:    { label: "Scanning…",       icon: <Bluetooth size={14} />,    bg: T.accentDim, color: T.accent, onClick: () => {} },
    connected:   { label: "Scale Connected", icon: <Bluetooth size={14} />,    bg: "#14532d", color: T.success, onClick: onManual },
    failed:      { label: "Retry Connect",   icon: <BluetoothOff size={14} />, bg: "#450a0a", color: T.danger,  onClick: onConnect },
    unsupported: { label: "Manual Entry",    icon: <Plus size={14} />,          bg: T.card,    color: T.textMuted, onClick: onManual },
  };
  const c = configs[status];
  return (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      {status === "unsupported" && (
        <p style={{ fontSize: 11, color: T.textMuted, alignSelf: "center" }}>Chrome required for BLE</p>
      )}
      <button onClick={c.onClick} style={{
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
      {/* Hero card */}
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

      {/* Parameter preview cards */}
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
      {/* Chart metric selector */}
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

      {/* Chart */}
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
            {/* Grid lines */}
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
            {/* Area */}
            <path d={areaD} fill={colors[chartMetric]} fillOpacity={0.07} />
            {/* Line */}
            <path d={pathD} fill="none" stroke={colors[chartMetric]} strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
            {/* Points + labels */}
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

      {/* History table */}
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

// ─── Manual entry form (shared between modal + log tab) ───────────────────────
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
                background: "#0f0f0f", border: `1px solid ${T.border}`,
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
            {bleConnected ? "Scale Connected — Enter Readings" : "Manual Entry"}
          </h2>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: T.textMuted, cursor: "pointer" }}><X size={20} /></button>
        </div>

        {bleConnected && (
          <div style={{ background: "#14532d22", border: `1px solid #16a34a44`, borderRadius: 10, padding: "10px 16px", marginBottom: 20, display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: T.success }}>
            <Bluetooth size={14} /> Scale connected. Step on it barefoot, then enter the readings shown in the Fitdays app below.
          </div>
        )}

        <p style={{ fontSize: 13, color: T.textMuted, marginBottom: 24 }}>Fill any or all fields — empty fields are skipped.</p>

        <ManualForm draft={draft} onChange={onChange} onSave={async () => { await onSave(); }} saving={saving} />
      </div>
    </div>
  );
}
