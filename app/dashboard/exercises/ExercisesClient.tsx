"use client";

// app/dashboard/exercises/ExercisesClient.tsx
// Phase 7 — Exercise Library + Workout Logger
// Premium redesign: 5-6 col grid, refined dark UI, fixed encoding

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, X, ChevronLeft, ChevronRight,
  Play, Plus, Trash2, CheckCircle2, Circle, ChevronDown,
  Dumbbell, Flame, Clock, Calendar, BarChart2, ArrowLeft,
  Zap, Target, Activity, SlidersHorizontal, TrendingUp,
} from "lucide-react";

// ─── Google Fonts injection ─────────────────────────────────────────────────
const FONT_LINK = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;1,9..40,300&display=swap');
`;

// ─── Types ──────────────────────────────────────────────────────────────────

interface Exercise {
  id: string;
  name: string;
  category: string;
  level: string;
  equipment: string | null;
  force: string | null;
  mechanic: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  images: string[];
  instructions?: string[];
}

interface WorkoutSet {
  id: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSecs: number | null;
  distanceM: number | null;
  completed: boolean;
  notes: string | null;
}

interface WorkoutExercise {
  id: string;
  exerciseId: string;
  orderInSession: number;
  notes: string | null;
  exercise: Pick<Exercise, "id" | "name" | "category" | "equipment" | "primaryMuscles" | "images">;
  sets: WorkoutSet[];
}

interface WorkoutSession {
  id: string;
  name: string | null;
  date: string;
  startedAt: string | null;
  completedAt: string | null;
  durationMins: number | null;
  caloriesBurned: number | null;
  notes: string | null;
  exercises: WorkoutExercise[];
}

interface ExercisesClientProps {
  initialExercises: Exercise[];
  initialTotal: number;
  categories: string[];
  levels: string[];
  equipment: string[];
  muscles: string[];
}

// ─── Constants ───────────────────────────────────────────────────────────────

const IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const CAT: Record<string, { accent: string; label: string; glow: string }> = {
  strength:              { accent: "#a3e635", label: "Strength",    glow: "rgba(163,230,53,0.15)" },
  cardio:                { accent: "#fb923c", label: "Cardio",      glow: "rgba(251,146,60,0.15)" },
  stretching:            { accent: "#38bdf8", label: "Stretching",  glow: "rgba(56,189,248,0.15)" },
  plyometrics:           { accent: "#c084fc", label: "Plyometrics", glow: "rgba(192,132,252,0.15)" },
  powerlifting:          { accent: "#f87171", label: "Powerlifting",glow: "rgba(248,113,113,0.15)" },
  strongman:             { accent: "#fbbf24", label: "Strongman",   glow: "rgba(251,191,36,0.15)" },
  olympic_weightlifting: { accent: "#22d3ee", label: "Olympic",     glow: "rgba(34,211,238,0.15)" },
};

const LEVEL_CONFIG: Record<string, { color: string; bars: number; label: string }> = {
  beginner:     { color: "#4ade80", bars: 1, label: "Beginner" },
  intermediate: { color: "#fbbf24", bars: 2, label: "Intermediate" },
  expert:       { color: "#f87171", bars: 3, label: "Expert" },
};

function formatDuration(mins: number | null) {
  if (!mins) return "—";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ─── Micro components ────────────────────────────────────────────────────────

function LevelBars({ level }: { level: string }) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.beginner;
  return (
    <span className="flex items-end gap-[3px]">
      {[1, 2, 3].map((b) => (
        <span
          key={b}
          style={{
            width: 4,
            height: 6 + b * 3,
            borderRadius: 2,
            background: b <= cfg.bars ? cfg.color : "rgba(255,255,255,0.12)",
          }}
        />
      ))}
    </span>
  );
}

function CatChip({ category }: { category: string }) {
  const c = CAT[category];
  if (!c) return null;
  return (
    <span
      style={{
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: "0.1em",
        textTransform: "uppercase",
        color: c.accent,
        background: `${c.accent}18`,
        border: `1px solid ${c.accent}30`,
        borderRadius: 6,
        padding: "2px 7px",
        fontFamily: "DM Sans, sans-serif",
      }}
    >
      {c.label}
    </span>
  );
}

// ─── Exercise Card ────────────────────────────────────────────────────────────

function ExerciseCard({
  exercise,
  onClick,
  onAdd,
  inWorkout = false,
  added = false,
}: {
  exercise: Exercise;
  onClick: () => void;
  onAdd?: () => void;
  inWorkout?: boolean;
  added?: boolean;
}) {
  const imgSrc = exercise.images[0] ? `${IMG_BASE}${exercise.images[0]}` : null;
  const [imgErr, setImgErr] = useState(false);
  const [hovered, setHovered] = useState(false);
  const cat = CAT[exercise.category];
  const lvl = LEVEL_CONFIG[exercise.level] ?? LEVEL_CONFIG.beginner;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
      style={{
        background: hovered ? "#161616" : "#101010",
        border: `1px solid ${hovered ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.055)"}`,
        borderRadius: 16,
        overflow: "hidden",
        cursor: "pointer",
        transform: hovered ? "translateY(-2px)" : "none",
        transition: "all 0.18s ease",
        boxShadow: hovered ? "0 12px 40px rgba(0,0,0,0.6)" : "none",
        position: "relative",
      }}
    >
      {/* Image */}
      <div style={{ position: "relative", height: 130, background: "#0a0a0a", overflow: "hidden" }}>
        {imgSrc && !imgErr ? (
          <img
            src={imgSrc}
            alt={exercise.name}
            onError={() => setImgErr(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: "top",
              transform: hovered ? "scale(1.05)" : "scale(1)",
              transition: "transform 0.4s ease",
            }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Dumbbell size={28} color="rgba(255,255,255,0.08)" />
          </div>
        )}
        {/* gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #101010 0%, transparent 55%)",
          pointerEvents: "none",
        }} />
        {/* top chips */}
        <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <CatChip category={exercise.category} />
          <LevelBars level={exercise.level} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: "10px 12px 12px" }}>
        <p style={{
          fontSize: 12,
          fontWeight: 600,
          color: "#fff",
          margin: 0,
          marginBottom: 4,
          lineHeight: 1.35,
          fontFamily: "DM Sans, sans-serif",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {exercise.name}
        </p>
        {exercise.primaryMuscles.length > 0 && (
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: 0, fontFamily: "DM Sans, sans-serif", textTransform: "capitalize" }}>
            {exercise.primaryMuscles.slice(0, 2).join(" · ")}
            {exercise.primaryMuscles.length > 2 && ` +${exercise.primaryMuscles.length - 2}`}
          </p>
        )}
        {exercise.equipment && (
          <p style={{ fontSize: 9, color: "rgba(255,255,255,0.18)", margin: "5px 0 0", fontFamily: "DM Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            {exercise.equipment}
          </p>
        )}
      </div>

      {/* Add button */}
      {inWorkout && onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 26,
            height: 26,
            borderRadius: "50%",
            background: added ? "#a3e635" : "rgba(255,255,255,0.08)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
            color: added ? "#000" : "rgba(255,255,255,0.5)",
          }}
        >
          {added ? <CheckCircle2 size={13} /> : <Plus size={13} />}
        </button>
      )}
    </div>
  );
}

// ─── Exercise Modal ───────────────────────────────────────────────────────────

function ExerciseModal({
  exercise,
  onClose,
  onAddToWorkout,
  inWorkout,
}: {
  exercise: Exercise;
  onClose: () => void;
  onAddToWorkout?: () => void;
  inWorkout?: boolean;
}) {
  const [detail, setDetail] = useState<Exercise>(exercise);
  const [loading, setLoading] = useState(!exercise.instructions);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!exercise.instructions) {
      fetch(`/api/exercises/${exercise.id}`)
        .then((r) => r.json())
        .then((d) => { if (d.exercise) setDetail(d.exercise); })
        .finally(() => setLoading(false));
    }
  }, [exercise.id, exercise.instructions]);

  const cat = CAT[detail.category];
  const lvl = LEVEL_CONFIG[detail.level] ?? LEVEL_CONFIG.beginner;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "flex-end", justifyContent: "center" }}>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      />
      {/* Sheet */}
      <div style={{
        position: "relative",
        width: "100%",
        maxWidth: 520,
        background: "#0d0d0d",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: "24px 24px 0 0",
        maxHeight: "92vh",
        overflowY: "auto",
        boxShadow: "0 -20px 80px rgba(0,0,0,0.8)",
      }}>
        {/* Hero */}
        <div style={{ position: "relative", height: 220, background: "#080808", borderRadius: "24px 24px 0 0", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%", gap: 2 }}>
            {[0, 1].map((i) => {
              const src = detail.images[i] ? `${IMG_BASE}${detail.images[i]}` : null;
              return src && !imgErrors[i] ? (
                <img
                  key={i}
                  src={src}
                  alt=""
                  onError={() => setImgErrors((p) => ({ ...p, [i]: true }))}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                />
              ) : (
                <div key={i} style={{ width: "100%", height: "100%", background: "#111", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Dumbbell size={28} color="rgba(255,255,255,0.06)" />
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #0d0d0d 0%, transparent 60%)" }} />
          <button
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              width: 32, height: 32,
              borderRadius: "50%",
              background: "rgba(0,0,0,0.6)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)",
              cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <X size={14} />
          </button>
        </div>

        <div style={{ padding: "0 22px 28px", marginTop: -8, position: "relative", zIndex: 1 }}>
          {/* Title row */}
          <div style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "Syne, sans-serif", fontSize: 20, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
              {detail.name}
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <CatChip category={detail.category} />
              <span style={{ fontSize: 11, color: lvl.color, fontWeight: 600, fontFamily: "DM Sans, sans-serif" }}>
                {lvl.label}
              </span>
            </div>
          </div>

          {/* Meta pills */}
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 18 }}>
            {[
              detail.equipment && `🏋️ ${detail.equipment}`,
              detail.force && `↕ ${detail.force}`,
              detail.mechanic && `⚙ ${detail.mechanic}`,
            ].filter(Boolean).map((label) => (
              <span key={label as string} style={{
                fontSize: 11, background: "rgba(255,255,255,0.05)", color: "rgba(255,255,255,0.45)",
                border: "1px solid rgba(255,255,255,0.08)", borderRadius: 8, padding: "4px 10px",
                fontFamily: "DM Sans, sans-serif", textTransform: "capitalize",
              }}>
                {label}
              </span>
            ))}
          </div>

          {/* Muscles */}
          <div style={{ background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, padding: "14px 16px", marginBottom: 18 }}>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, margin: "0 0 10px", fontFamily: "DM Sans, sans-serif" }}>
              Primary Muscles
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {detail.primaryMuscles.map((m) => (
                <span key={m} style={{
                  fontSize: 11, background: `${cat?.accent ?? "#a3e635"}15`,
                  color: cat?.accent ?? "#a3e635",
                  border: `1px solid ${cat?.accent ?? "#a3e635"}30`,
                  borderRadius: 20, padding: "3px 10px", textTransform: "capitalize",
                  fontFamily: "DM Sans, sans-serif", fontWeight: 500,
                }}>
                  {m}
                </span>
              ))}
            </div>
            {detail.secondaryMuscles.length > 0 && (
              <>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, margin: "14px 0 10px", fontFamily: "DM Sans, sans-serif" }}>
                  Secondary
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {detail.secondaryMuscles.map((m) => (
                    <span key={m} style={{
                      fontSize: 11, background: "rgba(255,255,255,0.04)",
                      color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.07)",
                      borderRadius: 20, padding: "3px 10px", textTransform: "capitalize",
                      fontFamily: "DM Sans, sans-serif",
                    }}>
                      {m}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div style={{ marginBottom: 20 }}>
            <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 700, margin: "0 0 14px", fontFamily: "DM Sans, sans-serif" }}>
              Instructions
            </p>
            {loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 14, background: "rgba(255,255,255,0.05)", borderRadius: 8, animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : (
              <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {(detail.instructions ?? []).map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{
                      flexShrink: 0, width: 22, height: 22, borderRadius: "50%",
                      background: `${cat?.accent ?? "#a3e635"}15`,
                      border: `1px solid ${cat?.accent ?? "#a3e635"}30`,
                      color: cat?.accent ?? "#a3e635",
                      fontSize: 10, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "DM Sans, sans-serif",
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {inWorkout && onAddToWorkout && (
            <button
              onClick={() => { onAddToWorkout(); onClose(); }}
              style={{
                width: "100%",
                background: "#a3e635",
                color: "#000",
                border: "none",
                borderRadius: 14,
                padding: "14px",
                fontSize: 13,
                fontWeight: 700,
                fontFamily: "Syne, sans-serif",
                letterSpacing: "0.05em",
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              + Add to Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Browse Tab ───────────────────────────────────────────────────────────────

function BrowseTab({
  initialExercises,
  initialTotal,
  categories,
  levels,
  equipment,
  muscles,
  workoutMode = false,
  addedIds = new Set(),
  onAdd,
}: {
  initialExercises: Exercise[];
  initialTotal: number;
  categories: string[];
  levels: string[];
  equipment: string[];
  muscles: string[];
  workoutMode?: boolean;
  addedIds?: Set<string>;
  onAdd?: (ex: Exercise) => void;
}) {
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [category, setCategory] = useState("");
  const [level, setLevel] = useState("");
  const [equip, setEquip] = useState("");
  const [muscle, setMuscle] = useState("");
  const [offset, setOffset] = useState(0);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);
  const LIMIT = 30;
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchExercises = useCallback(async (params: {
    q: string; category: string; level: string; equip: string; muscle: string; offset: number;
  }) => {
    setLoading(true);
    const sp = new URLSearchParams();
    if (params.q)        sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.level)    sp.set("level", params.level);
    if (params.equip)    sp.set("equipment", params.equip);
    if (params.muscle)   sp.set("muscle", params.muscle);
    sp.set("limit", String(LIMIT));
    sp.set("offset", String(params.offset));
    const res = await fetch(`/api/exercises?${sp}`);
    const data = await res.json();
    setExercises(data.exercises ?? []);
    setTotal(data.total ?? 0);
    setLoading(false);
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setOffset(0);
      fetchExercises({ q, category, level, equip, muscle, offset: 0 });
    }, 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [q, category, level, equip, muscle]); // eslint-disable-line

  useEffect(() => {
    fetchExercises({ q, category, level, equip, muscle, offset });
  }, [offset]); // eslint-disable-line

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const hasFilters = !!(category || level || equip || muscle);

  return (
    <div>
      {/* Search + filter row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} color="rgba(255,255,255,0.2)" style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={`Search ${initialTotal.toLocaleString()} exercises…`}
            value={q}
            onChange={(e) => setQ(e.target.value)}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 12,
              padding: "10px 36px 10px 38px",
              fontSize: 13,
              color: "#fff",
              fontFamily: "DM Sans, sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {q && (
            <button
              onClick={() => setQ("")}
              style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.3)" }}
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            padding: "10px 14px",
            background: showFilters || hasFilters ? "rgba(163,230,53,0.1)" : "rgba(255,255,255,0.04)",
            border: `1px solid ${showFilters || hasFilters ? "rgba(163,230,53,0.3)" : "rgba(255,255,255,0.08)"}`,
            borderRadius: 12,
            color: showFilters || hasFilters ? "#a3e635" : "rgba(255,255,255,0.4)",
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "DM Sans, sans-serif",
            fontWeight: 500,
            position: "relative",
          }}
        >
          <SlidersHorizontal size={15} />
          {hasFilters && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              width: 8, height: 8,
              borderRadius: "50%",
              background: "#a3e635",
            }} />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{
          marginBottom: 16,
          padding: 16,
          background: "rgba(255,255,255,0.025)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
        }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            {[
              { label: "Category", value: category, set: setCategory, options: categories },
              { label: "Level",    value: level,    set: setLevel,    options: levels },
              { label: "Equipment",value: equip,    set: setEquip,    options: equipment },
              { label: "Muscle",   value: muscle,   set: setMuscle,   options: muscles },
            ].map(({ label, value, set, options }) => (
              <div key={label}>
                <p style={{ fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 700, margin: "0 0 6px", fontFamily: "DM Sans, sans-serif" }}>
                  {label}
                </p>
                <select
                  value={value}
                  onChange={(e) => { set(e.target.value); setOffset(0); }}
                  style={{
                    width: "100%",
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    fontSize: 12,
                    color: "rgba(255,255,255,0.7)",
                    outline: "none",
                    appearance: "none",
                    fontFamily: "DM Sans, sans-serif",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All</option>
                  {options.map((o) => (
                    <option key={o} value={o} style={{ background: "#111" }}>{o.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {hasFilters && (
            <button
              onClick={() => { setCategory(""); setLevel(""); setEquip(""); setMuscle(""); setOffset(0); }}
              style={{ marginTop: 12, width: "100%", background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif" }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
          {loading ? "Searching…" : `${total.toLocaleString()} result${total !== 1 ? "s" : ""}`}
        </p>
        {totalPages > 1 && (
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
            {currentPage} / {totalPages}
          </p>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ height: 190, background: "rgba(255,255,255,0.03)", borderRadius: 16, border: "1px solid rgba(255,255,255,0.05)" }} />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.18)" }}>
          <Dumbbell size={36} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, margin: 0, fontFamily: "DM Sans, sans-serif" }}>No exercises found</p>
          <p style={{ fontSize: 12, margin: "4px 0 0", color: "rgba(255,255,255,0.12)", fontFamily: "DM Sans, sans-serif" }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 10 }}>
          {exercises.map((ex) => (
            <ExerciseCard
              key={ex.id}
              exercise={ex}
              onClick={() => setSelectedExercise(ex)}
              inWorkout={workoutMode}
              added={addedIds.has(ex.id)}
              onAdd={() => onAdd?.(ex)}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, marginTop: 28 }}>
          <button
            onClick={() => setOffset(offset - LIMIT)}
            disabled={offset === 0}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              cursor: offset === 0 ? "not-allowed" : "pointer",
              opacity: offset === 0 ? 0.3 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif", fontVariantNumeric: "tabular-nums" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setOffset(offset + LIMIT)}
            disabled={offset + LIMIT >= total}
            style={{
              width: 36, height: 36, borderRadius: 10,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "rgba(255,255,255,0.5)",
              cursor: offset + LIMIT >= total ? "not-allowed" : "pointer",
              opacity: offset + LIMIT >= total ? 0.3 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronRight size={15} />
          </button>
        </div>
      )}

      {selectedExercise && (
        <ExerciseModal
          exercise={selectedExercise}
          onClose={() => setSelectedExercise(null)}
          inWorkout={workoutMode}
          onAddToWorkout={() => onAdd?.(selectedExercise)}
        />
      )}
    </div>
  );
}

// ─── Set Row ──────────────────────────────────────────────────────────────────

function SetRow({
  set, setNum, onUpdate, onDelete, isTimeBase,
}: {
  set: WorkoutSet; setNum: number;
  onUpdate: (data: Partial<WorkoutSet>) => void;
  onDelete: () => void; isTimeBase: boolean;
}) {
  const inputStyle = {
    width: 60,
    background: "rgba(255,255,255,0.05)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    padding: "6px 8px",
    fontSize: 12,
    color: "#fff",
    textAlign: "center" as const,
    outline: "none",
    fontFamily: "DM Sans, sans-serif",
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 6px",
      borderRadius: 10,
      background: set.completed ? "rgba(163,230,53,0.04)" : "transparent",
    }}>
      <span style={{ width: 18, textAlign: "center", fontSize: 11, color: "rgba(255,255,255,0.2)", fontFamily: "monospace" }}>{setNum}</span>
      {isTimeBase ? (
        <input type="number" placeholder="secs" value={set.durationSecs ?? ""} onChange={(e) => onUpdate({ durationSecs: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
      ) : (
        <>
          <input type="number" placeholder="kg" value={set.weightKg ?? ""} onChange={(e) => onUpdate({ weightKg: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
          <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12, fontWeight: 700 }}>×</span>
          <input type="number" placeholder="reps" value={set.reps ?? ""} onChange={(e) => onUpdate({ reps: e.target.value ? Number(e.target.value) : null })} style={inputStyle} />
        </>
      )}
      <button onClick={() => onUpdate({ completed: !set.completed })} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: set.completed ? "#a3e635" : "rgba(255,255,255,0.2)", transform: set.completed ? "scale(1.1)" : "none", transition: "all 0.15s" }}>
        {set.completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>
      <button onClick={onDelete} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.15)" }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Workout Exercise Card ────────────────────────────────────────────────────

function WorkoutExerciseCard({
  we, sessionId, onSetsChange, onRemove,
}: {
  we: WorkoutExercise; sessionId: string;
  onSetsChange: (sets: WorkoutSet[]) => void;
  onRemove: () => void;
}) {
  const [sets, setSets] = useState<WorkoutSet[]>(we.sets);
  const [collapsed, setCollapsed] = useState(false);
  const isTimeBase = ["stretching", "cardio"].includes(we.exercise.category ?? "");
  const imgSrc = we.exercise.images[0] ? `${IMG_BASE}${we.exercise.images[0]}` : null;
  const completedSets = sets.filter((s) => s.completed).length;
  const progress = sets.length > 0 ? completedSets / sets.length : 0;

  async function addSet() {
    const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isTimeBase ? { durationSecs: null } : { reps: null, weightKg: null }),
    });
    const data = await res.json();
    if (data.set) { const n = [...sets, data.set]; setSets(n); onSetsChange(n); }
  }

  async function updateSet(setId: string, update: Partial<WorkoutSet>) {
    const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, ...update }),
    });
    const data = await res.json();
    if (data.set) { const n = sets.map((s) => (s.id === setId ? data.set : s)); setSets(n); onSetsChange(n); }
  }

  async function deleteSet(setId: string) {
    await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId }),
    });
    const n = sets.filter((s) => s.id !== setId); setSets(n); onSetsChange(n);
  }

  return (
    <div style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, cursor: "pointer" }}
      >
        {imgSrc ? (
          <img src={imgSrc} alt="" style={{ width: 40, height: 40, borderRadius: 10, objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,255,255,0.05)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Dumbbell size={18} color="rgba(255,255,255,0.2)" />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {we.exercise.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div style={{ flex: 1, maxWidth: 80, height: 3, background: "rgba(255,255,255,0.06)", borderRadius: 2, overflow: "hidden" }}>
              <div style={{ width: `${progress * 100}%`, height: "100%", background: "#a3e635", borderRadius: 2, transition: "width 0.3s" }} />
            </div>
            <p style={{ margin: 0, fontSize: 10, color: "rgba(255,255,255,0.28)", fontFamily: "DM Sans, sans-serif" }}>
              {sets.length === 0 ? "No sets" : `${completedSets}/${sets.length}`}
            </p>
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(255,255,255,0.15)", marginRight: 4 }}>
          <Trash2 size={13} />
        </button>
        <ChevronDown size={15} color="rgba(255,255,255,0.2)" style={{ transform: collapsed ? "none" : "rotate(180deg)", transition: "transform 0.2s" }} />
      </div>

      {!collapsed && (
        <div style={{ padding: "0 12px 12px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          {sets.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 2, paddingLeft: 26, fontSize: 9, color: "rgba(255,255,255,0.2)", textTransform: "uppercase", letterSpacing: "0.12em", fontFamily: "DM Sans, sans-serif" }}>
              {isTimeBase ? <span style={{ width: 60, textAlign: "center" }}>Duration</span> : (
                <>
                  <span style={{ width: 60, textAlign: "center" }}>Weight</span>
                  <span style={{ width: 16 }} />
                  <span style={{ width: 60, textAlign: "center" }}>Reps</span>
                </>
              )}
            </div>
          )}
          {sets.map((set, i) => (
            <SetRow key={set.id} set={set} setNum={i + 1} isTimeBase={isTimeBase} onUpdate={(u) => updateSet(set.id, u)} onDelete={() => deleteSet(set.id)} />
          ))}
          <button
            onClick={addSet}
            style={{
              marginTop: 8, width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px",
              background: "none",
              border: "1px dashed rgba(255,255,255,0.08)",
              borderRadius: 10, fontSize: 12, color: "rgba(255,255,255,0.22)",
              cursor: "pointer", fontFamily: "DM Sans, sans-serif",
            }}
          >
            <Plus size={13} /> Add Set
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Workout Tab ──────────────────────────────────────────────────────────────

function WorkoutTab({
  initialExercises, initialTotal, categories, levels, equipment, muscles,
}: Omit<ExercisesClientProps, "initialTotal"> & { initialTotal: number }) {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showBrowse, setShowBrowse] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [finishing, setFinishing] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => setElapsed((e) => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSession?.id]);

  function formatElapsed(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function startSession() {
    const res = await fetch("/api/workout/sessions", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sessionName || null, date: todayStr() }),
    });
    const data = await res.json();
    if (data.session) { setActiveSession({ ...data.session, exercises: [] }); setWorkoutExercises([]); setAddedIds(new Set()); }
  }

  async function addExercise(ex: Exercise) {
    if (!activeSession || addedIds.has(ex.id)) return;
    const res = await fetch(`/api/workout/sessions/${activeSession.id}/exercises`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ exerciseId: ex.id }),
    });
    const data = await res.json();
    if (data.workoutExercise) {
      setWorkoutExercises((prev) => [...prev, data.workoutExercise]);
      setAddedIds((prev) => new Set([...prev, ex.id]));
    }
  }

  async function removeExercise(weId: string, exId: string) {
    await fetch(`/api/workout/sessions/${activeSession!.id}/exercises`, {
      method: "DELETE", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutExerciseId: weId }),
    });
    setWorkoutExercises((prev) => prev.filter((w) => w.id !== weId));
    setAddedIds((prev) => { const s = new Set(prev); s.delete(exId); return s; });
  }

  async function finishSession() {
    if (!activeSession) return;
    setFinishing(true);
    const durationMins = Math.round(elapsed / 60);
    const totalSets = workoutExercises.reduce((s, we) => s + we.sets.length, 0);
    const caloriesBurned = Math.round(durationMins * 5 + totalSets * 3);
    await fetch(`/api/workout/sessions/${activeSession.id}`, {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt: new Date().toISOString(), durationMins, caloriesBurned }),
    });
    setActiveSession(null); setWorkoutExercises([]); setAddedIds(new Set()); setSessionName(""); setFinishing(false);
  }

  const btnPrimary: React.CSSProperties = {
    background: "#a3e635", color: "#000", border: "none", borderRadius: 14,
    padding: "14px", fontSize: 13, fontWeight: 700,
    fontFamily: "Syne, sans-serif", letterSpacing: "0.04em",
    cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };

  if (!activeSession) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 16px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: 22, background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Zap size={32} color="#a3e635" />
        </div>
        <h3 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 700, color: "#fff", margin: "0 0 8px" }}>
          Start a Workout
        </h3>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)", margin: "0 0 28px", maxWidth: 280, lineHeight: 1.6, fontFamily: "DM Sans, sans-serif" }}>
          Log exercises, track sets and reps, and crush your goals.
        </p>
        <input
          type="text"
          placeholder='Session name — e.g. "Push Day"'
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          style={{
            width: "100%", maxWidth: 320,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 14, padding: "12px 16px",
            fontSize: 13, color: "#fff",
            fontFamily: "DM Sans, sans-serif",
            textAlign: "center", outline: "none", marginBottom: 14, boxSizing: "border-box",
          }}
        />
        <button onClick={startSession} style={{ ...btnPrimary, maxWidth: 320, boxShadow: "0 8px 30px rgba(163,230,53,0.2)" }}>
          <Play size={15} style={{ fill: "#000" }} /> Start Workout
        </button>
      </div>
    );
  }

  if (showBrowse) {
    return (
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <button
            onClick={() => setShowBrowse(false)}
            style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.6)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: "#fff", fontFamily: "Syne, sans-serif" }}>Add Exercise</p>
            <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif" }}>{addedIds.size} added</p>
          </div>
        </div>
        <BrowseTab
          initialExercises={initialExercises} initialTotal={initialTotal}
          categories={categories} levels={levels} equipment={equipment} muscles={muscles}
          workoutMode addedIds={addedIds} onAdd={addExercise}
        />
      </div>
    );
  }

  const totalCompletedSets = workoutExercises.reduce((s, we) => s + we.sets.filter((st) => st.completed).length, 0);

  return (
    <div>
      {/* Session header */}
      <div style={{ position: "relative", background: "#101010", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 18, padding: 16, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(135deg, rgba(163,230,53,0.05) 0%, transparent 60%)", pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "#fff", fontFamily: "Syne, sans-serif" }}>{activeSession.name ?? "Workout"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif" }}>In progress</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.2)", borderRadius: 20, padding: "6px 12px" }}>
            <Clock size={12} color="#a3e635" />
            <span style={{ fontFamily: "monospace", fontSize: 14, fontWeight: 700, color: "#a3e635" }}>{formatElapsed(elapsed)}</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { val: workoutExercises.length, label: "Exercises" },
            { val: totalCompletedSets, label: "Sets Done" },
            { val: `~${Math.round(elapsed / 60 * 5 + totalCompletedSets * 3)}`, label: "kcal est." },
          ].map(({ val, label }) => (
            <div key={label} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 12, padding: "10px 0", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: "#fff", fontFamily: "Syne, sans-serif" }}>{val}</p>
              <p style={{ margin: "2px 0 0", fontSize: 9, color: "rgba(255,255,255,0.25)", fontFamily: "DM Sans, sans-serif", textTransform: "uppercase", letterSpacing: "0.1em" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {workoutExercises.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: "rgba(255,255,255,0.18)" }}>
            <Target size={28} style={{ margin: "0 auto 8px" }} />
            <p style={{ margin: 0, fontSize: 13, fontFamily: "DM Sans, sans-serif" }}>No exercises yet</p>
          </div>
        ) : workoutExercises.map((we) => (
          <WorkoutExerciseCard
            key={we.id} we={we} sessionId={activeSession.id}
            onSetsChange={(sets) => setWorkoutExercises((prev) => prev.map((w) => w.id === we.id ? { ...w, sets } : w))}
            onRemove={() => removeExercise(we.id, we.exerciseId)}
          />
        ))}
      </div>

      <button
        onClick={() => setShowBrowse(true)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "12px", background: "none",
          border: "1px dashed rgba(255,255,255,0.08)",
          borderRadius: 14, fontSize: 13, color: "rgba(255,255,255,0.28)",
          cursor: "pointer", fontFamily: "DM Sans, sans-serif", marginBottom: 10,
        }}
      >
        <Plus size={15} /> Add Exercise
      </button>

      <button onClick={finishSession} disabled={finishing} style={{ ...btnPrimary, opacity: finishing ? 0.5 : 1, boxShadow: "0 6px 24px rgba(163,230,53,0.15)" }}>
        {finishing ? "Saving…" : "Finish Workout"}
      </button>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/workout/sessions?limit=30").then((r) => r.json()).then((d) => setSessions(d.sessions ?? [])).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 2, 3].map((i) => <div key={i} style={{ height: 72, background: "rgba(255,255,255,0.03)", borderRadius: 14, border: "1px solid rgba(255,255,255,0.05)" }} />)}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: "rgba(255,255,255,0.18)" }}>
        <TrendingUp size={36} style={{ margin: "0 auto 12px" }} />
        <p style={{ margin: 0, fontSize: 14, fontFamily: "DM Sans, sans-serif" }}>No workouts yet</p>
        <p style={{ margin: "4px 0 0", fontSize: 12, color: "rgba(255,255,255,0.12)", fontFamily: "DM Sans, sans-serif" }}>Complete your first workout to see history</p>
      </div>
    );
  }

  const grouped: Record<string, WorkoutSession[]> = {};
  sessions.forEach((s) => {
    const d = s.date.split("T")[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(s);
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {Object.entries(grouped).map(([date, daySessions]) => (
        <div key={date}>
          <p style={{ margin: "0 0 10px", fontSize: 9, color: "rgba(255,255,255,0.22)", textTransform: "uppercase", letterSpacing: "0.15em", fontWeight: 700, fontFamily: "DM Sans, sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={11} />
            {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {daySessions.map((s) => (
              <div key={s.id} style={{ background: "#101010", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
                <div
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer" }}
                >
                  <div style={{ width: 38, height: 38, borderRadius: 11, background: "rgba(163,230,53,0.1)", border: "1px solid rgba(163,230,53,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Activity size={16} color="#a3e635" />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: "#fff", fontFamily: "DM Sans, sans-serif" }}>{s.name ?? "Workout"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 11, color: "rgba(255,255,255,0.3)", fontFamily: "DM Sans, sans-serif" }}>
                      {s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}
                      {s.durationMins ? ` · ${formatDuration(s.durationMins)}` : ""}
                    </p>
                  </div>
                  {s.caloriesBurned ? (
                    <div style={{ textAlign: "right", marginRight: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: "#fb923c", justifyContent: "flex-end" }}>
                        <Flame size={12} />
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "Syne, sans-serif" }}>{s.caloriesBurned}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 9, color: "rgba(255,255,255,0.2)", fontFamily: "DM Sans, sans-serif" }}>kcal</p>
                    </div>
                  ) : null}
                  <ChevronDown size={15} color="rgba(255,255,255,0.2)" style={{ transform: expanded === s.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </div>

                {expanded === s.id && s.exercises.length > 0 && (
                  <div style={{ borderTop: "1px solid rgba(255,255,255,0.05)", padding: "8px 14px" }}>
                    {s.exercises.map((we) => {
                      const imgSrc = we.exercise.images[0] ? `${IMG_BASE}${we.exercise.images[0]}` : null;
                      return (
                        <div key={we.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                          {imgSrc ? (
                            <img src={imgSrc} alt="" style={{ width: 30, height: 30, borderRadius: 8, objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 30, height: 30, borderRadius: 8, background: "rgba(255,255,255,0.04)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Dumbbell size={12} color="rgba(255,255,255,0.2)" />
                            </div>
                          )}
                          <p style={{ flex: 1, margin: 0, fontSize: 12, color: "rgba(255,255,255,0.55)", fontWeight: 500, fontFamily: "DM Sans, sans-serif" }}>{we.exercise.name}</p>
                          <p style={{ margin: 0, fontSize: 11, color: "rgba(255,255,255,0.22)", fontFamily: "DM Sans, sans-serif" }}>{we.sets.length} set{we.sets.length !== 1 ? "s" : ""}</p>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Root Component ───────────────────────────────────────────────────────────

type Tab = "browse" | "workout" | "history";

export default function ExercisesClient({
  initialExercises, initialTotal, categories, levels, equipment, muscles,
}: ExercisesClientProps) {
  const [tab, setTab] = useState<Tab>("browse");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "browse",  label: "Browse",  icon: <Search size={14} /> },
    { id: "workout", label: "Workout", icon: <Zap size={14} /> },
    { id: "history", label: "History", icon: <BarChart2 size={14} /> },
  ];

  return (
    <>
      <style>{FONT_LINK}</style>
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
        * { box-sizing: border-box; }
        input::placeholder { color: rgba(255,255,255,0.22); }
        input[type=number]::-webkit-inner-spin-button { -webkit-appearance: none; }
        select option { background: #111; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
      `}</style>

      <div style={{
        paddingTop: 88,
        paddingBottom: 48,
        maxWidth: 1120,
        margin: "0 auto",
        minHeight: "100vh",
        background: "#080808",
        paddingLeft: 18,
        paddingRight: 18,
      }}>
        {/* Header */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 4 }}>
            <div style={{
              width: 40, height: 40, borderRadius: 13,
              background: "rgba(163,230,53,0.1)",
              border: "1px solid rgba(163,230,53,0.18)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Dumbbell size={18} color="#a3e635" />
            </div>
            <div>
              <h1 style={{ fontFamily: "Syne, sans-serif", fontSize: 22, fontWeight: 800, color: "#fff", margin: 0, letterSpacing: "-0.02em" }}>
                Exercise Library
              </h1>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.22)", margin: 0, fontFamily: "DM Sans, sans-serif" }}>
                {initialTotal.toLocaleString()} exercises · browse, log, track
              </p>
            </div>
          </div>
        </div>

        {/* Tab bar */}
        <div style={{
          display: "flex",
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 16,
          padding: 4,
          marginBottom: 22,
          gap: 4,
        }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1,
                display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
                padding: "10px 0",
                borderRadius: 12,
                border: "none",
                background: tab === t.id ? "#a3e635" : "transparent",
                color: tab === t.id ? "#000" : "rgba(255,255,255,0.3)",
                fontFamily: tab === t.id ? "Syne, sans-serif" : "DM Sans, sans-serif",
                fontSize: 13,
                fontWeight: 700,
                cursor: "pointer",
                transition: "all 0.18s ease",
                boxShadow: tab === t.id ? "0 2px 12px rgba(163,230,53,0.2)" : "none",
              }}
            >
              {t.icon}
              <span>{t.label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "browse" && (
          <BrowseTab
            initialExercises={initialExercises} initialTotal={initialTotal}
            categories={categories} levels={levels} equipment={equipment} muscles={muscles}
          />
        )}
        {tab === "workout" && (
          <WorkoutTab
            initialExercises={initialExercises} initialTotal={initialTotal}
            categories={categories} levels={levels} equipment={equipment} muscles={muscles}
          />
        )}
        {tab === "history" && <HistoryTab />}
      </div>
    </>
  );
}