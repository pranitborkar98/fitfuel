"use client";

// app/dashboard/exercises/ExercisesClient.tsx
// Phase 7, Exercise Library + Workout Logger
// Premium redesign: 5-6 col grid, refined dark UI, fixed encoding

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import {
  Search, X, ChevronLeft, ChevronRight,
  Play, Plus, Trash2, CheckCircle2, Circle, ChevronDown,
  Dumbbell, Flame, Clock, Calendar, BarChart2, ArrowLeft,
  Zap, Target, Activity, SlidersHorizontal, TrendingUp,
} from "lucide-react";

import { C, screen } from "@/app/_app/theme";
import { formatDateOnly, todayIndiaDate } from "@/lib/date-only";
import Dialog from "@/app/_app/Dialog";
import s from "./exercises.module.css";

// Faces load once, via next/font in the root layout. The system does not
// allow font injection from a component, and there is none here.

/** Ramp aliases, so this screen stops carrying a palette of its own. */
const T = {
  bg: C.bg,
  card: C.panel,
  cardHover: C.panel2,
  border: C.rule,
  borderHover: C.rule2,
  trough: C.trough,
  accent: C.lime,
  wash: C.wash,
  onLime: C.onLime,
  text: C.ink,
  textSecond: C.mute,
  textMuted: C.dim,
  danger: C.danger,
};

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

/* This was a per-category palette, which is forbidden by name: seven
   training categories, seven hues, and an rgba `glow` on each that nothing ever
   read. The label already says it is cardio. One accent, and it is THE accent. */
const CAT: Record<string, { accent: string; label: string }> = {
  strength:              { accent: T.accent, label: "Strength" },
  cardio:                { accent: T.accent, label: "Cardio" },
  stretching:            { accent: T.accent, label: "Stretching" },
  plyometrics:           { accent: T.accent, label: "Plyometrics" },
  powerlifting:          { accent: T.accent, label: "Powerlifting" },
  strongman:             { accent: T.accent, label: "Strongman" },
  olympic_weightlifting: { accent: T.accent, label: "Olympic" },
};

/* Level was a green, an amber and a red. The bar count says it and the word
   says it, so the hue was a third copy of the same fact. Expert is not an
   error state, so it does not get the danger colour either. */
const LEVEL_CONFIG: Record<string, { color: string; bars: number; label: string }> = {
  beginner:     { color: T.accent, bars: 1, label: "Beginner" },
  intermediate: { color: T.accent, bars: 2, label: "Intermediate" },
  expert:       { color: T.accent, bars: 3, label: "Expert" },
};

function formatDuration(mins: number | null) {
  if (!mins) return "Not recorded";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function todayStr() {
  return formatDateOnly(todayIndiaDate());
}

// ─── Micro components ────────────────────────────────────────────────────────

function LevelBars({ level }: { level: string }) {
  const cfg = LEVEL_CONFIG[level] ?? LEVEL_CONFIG.beginner;
  return (
    <span style={{ display: "flex", alignItems: "flex-end", gap: 3 }}>
      {[1, 2, 3].map((b) => (
        <span
          key={b}
          style={{
            width: 4,
            height: 6 + b * 3,
            borderRadius: 999,
            background: b <= cfg.bars ? cfg.color : T.textMuted,
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
        fontSize: 13,
        fontWeight: 650,
        letterSpacing: 0,
        color: c.accent,
        background: `${T.wash}`,
        border: `1px solid ${T.wash}`,
        borderRadius: 999,
        padding: "3px 9px",
        fontFamily: "var(--font-archivo), sans-serif",
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
  return (
    <article
      className={s.card}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? T.cardHover : T.card,
        border: `1px solid ${hovered ? T.borderHover : T.border}`,
      }}
    >
      <button
        type="button"
        className={s.cardAction}
        onClick={onClick}
        aria-label={`View ${exercise.name}`}
      />
      {/* Image */}
      <div style={{ position: "relative", height: 130, background: T.bg, overflow: "hidden" }}>
        {imgSrc && !imgErr ? (
          <Image
            src={imgSrc}
            alt={exercise.name}
            fill
            sizes="(max-width: 520px) 45vw, (max-width: 1024px) 30vw, 210px"
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
            <Dumbbell size={28} color={T.textMuted} />
          </div>
        )}
        {/* gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: `linear-gradient(to top, ${T.card} 0%, transparent 55%)`,
          pointerEvents: "none",
        }} />
        {/* top chips */}
        <div style={{ position: "absolute", top: 8, left: 8, right: 8, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <CatChip category={exercise.category} />
          <LevelBars level={exercise.level} />
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: `12px ${inWorkout ? 58 : 12}px 14px 12px` }}>
        <p style={{
          fontSize: 15,
          fontWeight: 600,
          color: T.text,
          margin: 0,
          marginBottom: 4,
          lineHeight: 1.35,
          fontFamily: "var(--font-archivo), sans-serif",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 2,
          WebkitBoxOrient: "vertical",
        }}>
          {exercise.name}
        </p>
        {exercise.primaryMuscles.length > 0 && (
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0, fontFamily: "var(--font-archivo), sans-serif", textTransform: "capitalize" }}>
            {exercise.primaryMuscles.slice(0, 2).join(" · ")}
            {exercise.primaryMuscles.length > 2 && ` +${exercise.primaryMuscles.length - 2}`}
          </p>
        )}
        {exercise.equipment && (
          <p style={{ fontSize: 13, color: T.textMuted, margin: "5px 0 0", fontFamily: "var(--font-archivo), sans-serif" }}>
            {exercise.equipment}
          </p>
        )}
      </div>

      {/* Add button */}
      {inWorkout && onAdd && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          aria-label={added ? `${exercise.name} added to workout` : `Add ${exercise.name} to workout`}
          disabled={added}
          style={{
            position: "absolute",
            bottom: 10,
            right: 10,
            width: 44,
            height: 44,
            borderRadius: "var(--fk-r)",
            background: added ? T.accent : T.trough,
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            transition: "all 0.15s ease",
            color: added ? T.onLime : T.textSecond,
            zIndex: 2,
          }}
        >
          {added ? <CheckCircle2 size={13} /> : <Plus size={13} />}
        </button>
      )}
    </article>
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
  const [error, setError] = useState("");
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let alive = true;
    if (!exercise.instructions) {
      fetch(`/api/exercises/${exercise.id}`)
        .then((response) => {
          if (!response.ok) throw new Error("Detail request failed");
          return response.json();
        })
        .then((data) => { if (alive && data.exercise) setDetail(data.exercise); })
        .catch(() => { if (alive) setError("We couldn't load the instructions for this exercise."); })
        .finally(() => { if (alive) setLoading(false); });
    }
    return () => { alive = false; };
  }, [exercise.id, exercise.instructions]);

  const cat = CAT[detail.category];
  const lvl = LEVEL_CONFIG[detail.level] ?? LEVEL_CONFIG.beginner;

  return (
    <Dialog title={detail.name} onClose={onClose} maxWidth={520}>
      <div>
        {/* Hero */}
        <div style={{ position: "relative", height: 220, background: T.bg, borderRadius: "var(--fk-r-lg) var(--fk-r-lg) 0 0", overflow: "hidden" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", height: "100%", gap: 2 }}>
            {[0, 1].map((i) => {
              const src = detail.images[i] ? `${IMG_BASE}${detail.images[i]}` : null;
              return src && !imgErrors[i] ? (
                <Image
                  key={i}
                  src={src}
                  alt=""
                  width={360}
                  height={360}
                  onError={() => setImgErrors((p) => ({ ...p, [i]: true }))}
                  style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top" }}
                />
              ) : (
                <div key={i} style={{ width: "100%", height: "100%", background: T.card, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Dumbbell size={28} color={T.textMuted} />
                </div>
              );
            })}
          </div>
          <div style={{ position: "absolute", inset: 0, background: `linear-gradient(to top, ${T.card} 0%, transparent 60%)` }} />
          <button
            type="button"
            aria-label="Close exercise details"
            onClick={onClose}
            style={{
              position: "absolute", top: 14, right: 14,
              width: 44, height: 44,
              borderRadius: "var(--fk-r)",
              background: T.bg,
              border: `1px solid ${T.borderHover}`,
              color: T.textSecond,
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
            <h2 style={{ fontFamily: "var(--fk-display), Georgia, serif", fontSize: 20, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
              {detail.name}
            </h2>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
              <CatChip category={detail.category} />
              <span style={{ fontSize: 13, color: lvl.color, fontWeight: 600, fontFamily: "var(--font-archivo), sans-serif" }}>
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
                fontSize: 13, background: T.cardHover, color: T.textSecond,
                border: `1px solid ${T.border}`, borderRadius: 999, padding: "5px 10px",
                fontFamily: "var(--font-archivo), sans-serif", textTransform: "capitalize",
              }}>
                {label}
              </span>
            ))}
          </div>

          {/* Muscles */}
          <div style={{ background: T.cardHover, border: `1px solid ${T.border}`, borderRadius: "var(--fk-r)", padding: "14px 16px", marginBottom: 18 }}>
            <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 650, margin: "0 0 10px", fontFamily: "var(--font-archivo), sans-serif" }}>
              Primary muscles
            </p>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {detail.primaryMuscles.map((m) => (
                <span key={m} style={{
                  fontSize: 13, background: `${T.wash}`,
                  color: cat?.accent ?? T.accent,
                  border: `1px solid ${T.wash}`,
                  borderRadius: 999, padding: "4px 10px", textTransform: "capitalize",
                  fontFamily: "var(--font-archivo), sans-serif", fontWeight: 500,
                }}>
                  {m}
                </span>
              ))}
            </div>
            {detail.secondaryMuscles.length > 0 && (
              <>
                <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 650, margin: "14px 0 10px", fontFamily: "var(--font-archivo), sans-serif" }}>
                  Secondary muscles
                </p>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                  {detail.secondaryMuscles.map((m) => (
                    <span key={m} style={{
                      fontSize: 13, background: T.cardHover,
                      color: T.textMuted, border: `1px solid ${T.border}`,
                      borderRadius: 999, padding: "4px 10px", textTransform: "capitalize",
                      fontFamily: "var(--font-archivo), sans-serif",
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
            <p style={{ fontSize: 13, color: T.textMuted, fontWeight: 650, margin: "0 0 14px", fontFamily: "var(--font-archivo), sans-serif" }}>
              Instructions
            </p>
            {error ? (
              <p role="alert" className={s.error}>{error}</p>
            ) : loading ? (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {[1, 2, 3].map((i) => (
                  <div key={i} style={{ height: 14, background: T.cardHover, borderRadius: 999, animation: "pulse 1.5s infinite" }} />
                ))}
              </div>
            ) : (
              <ol style={{ margin: 0, padding: 0, listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                {(detail.instructions ?? []).map((step, i) => (
                  <li key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span style={{
                      flexShrink: 0, width: 28, height: 28, borderRadius: 999,
                      background: `${T.wash}`,
                      border: `1px solid ${T.wash}`,
                      color: cat?.accent ?? T.accent,
                      fontSize: 13, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "var(--font-archivo), sans-serif",
                    }}>
                      {i + 1}
                    </span>
                    <p style={{ fontSize: 14, color: T.textSecond, lineHeight: 1.65, margin: 0, fontFamily: "var(--font-archivo), sans-serif" }}>
                      {step}
                    </p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {inWorkout && onAddToWorkout && (
            <button
              type="button"
              onClick={() => { onAddToWorkout(); onClose(); }}
              style={{
                width: "100%",
                background: T.accent,
                color: T.onLime,
                border: "none",
                borderRadius: "var(--fk-r)",
                minHeight: 46,
                padding: "0 18px",
                fontSize: 15,
                fontWeight: 650,
                fontFamily: "var(--font-archivo), sans-serif",
                letterSpacing: 0,
                cursor: "pointer",
                transition: "background 0.15s",
              }}
            >
              Add to workout
            </button>
          )}
        </div>
      </div>
    </Dialog>
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
  const [error, setError] = useState("");
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
  const requestSequence = useRef(0);

  const fetchExercises = useCallback(async (params: {
    q: string; category: string; level: string; equip: string; muscle: string; offset: number;
  }, sequence: number) => {
    setLoading(true);
    setError("");
    const sp = new URLSearchParams();
    if (params.q)        sp.set("q", params.q);
    if (params.category) sp.set("category", params.category);
    if (params.level)    sp.set("level", params.level);
    if (params.equip)    sp.set("equipment", params.equip);
    if (params.muscle)   sp.set("muscle", params.muscle);
    sp.set("limit", String(LIMIT));
    sp.set("offset", String(params.offset));
    try {
      const res = await fetch(`/api/exercises?${sp}`);
      if (!res.ok) throw new Error("Exercise request failed");
      const data = await res.json();
      if (sequence !== requestSequence.current) return;
      setExercises(data.exercises ?? []);
      setTotal(data.total ?? 0);
    } catch {
      if (sequence !== requestSequence.current) return;
      setError("We couldn't load the exercise library. Check your connection and try again.");
    } finally {
      if (sequence === requestSequence.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const sequence = ++requestSequence.current;
    debounceRef.current = setTimeout(() => {
      fetchExercises({ q, category, level, equip, muscle, offset }, sequence);
    }, 250);
    return () => {
      requestSequence.current += 1;
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [q, category, level, equip, muscle, offset, fetchExercises]);

  const totalPages = Math.ceil(total / LIMIT);
  const currentPage = Math.floor(offset / LIMIT) + 1;
  const hasFilters = !!(category || level || equip || muscle);

  return (
    <div>
      {error && <p role="alert" className={s.error}>{error}</p>}
      {/* Search + filter row */}
      <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <Search size={15} color={T.textMuted} style={{ position: "absolute", left: 13, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            placeholder={`Search ${initialTotal.toLocaleString()} exercises…`}
            value={q}
            maxLength={80}
            onChange={(e) => { setQ(e.target.value); setOffset(0); }}
            style={{
              width: "100%",
              background: T.cardHover,
              border: `1px solid ${T.border}`,
              borderRadius: "var(--fk-r)",
              minHeight: 46,
              padding: "10px 44px 10px 38px",
              fontSize: 16,
              color: T.text,
              fontFamily: "var(--font-archivo), sans-serif",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          {q && (
            <button
              type="button"
              aria-label="Clear exercise search"
              onClick={() => setQ("")}
              style={{ position: "absolute", right: 1, top: "50%", transform: "translateY(-50%)", minWidth: 44, minHeight: 44, background: "none", border: "none", cursor: "pointer", color: T.textMuted }}
            >
              <X size={13} />
            </button>
          )}
        </div>
        <button
          type="button"
          aria-expanded={showFilters}
          aria-label="Filter exercises"
          onClick={() => setShowFilters(!showFilters)}
          style={{
            display: "flex", alignItems: "center", gap: 6,
            minWidth: 46, minHeight: 46, padding: "0 14px",
            background: showFilters || hasFilters ? T.wash : T.cardHover,
            border: `1px solid ${showFilters || hasFilters ? T.accent : T.border}`,
            borderRadius: "var(--fk-r)",
            color: showFilters || hasFilters ? T.accent : T.textSecond,
            cursor: "pointer",
            fontSize: 13,
            fontFamily: "var(--font-archivo), sans-serif",
            fontWeight: 500,
            position: "relative",
          }}
        >
          <SlidersHorizontal size={15} />
          {hasFilters && (
            <span style={{
              position: "absolute", top: -4, right: -4,
              width: 8, height: 8,
              borderRadius: 999,
              background: T.accent,
            }} />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div style={{
          marginBottom: 16,
          padding: 16,
          background: T.cardHover,
          border: `1px solid ${T.border}`,
          borderRadius: "var(--fk-r-lg)",
        }}>
          <div className={s.filterGrid}>
            {[
              { label: "Category", value: category, set: setCategory, options: categories },
              { label: "Level",    value: level,    set: setLevel,    options: levels },
              { label: "Equipment",value: equip,    set: setEquip,    options: equipment },
              { label: "Muscle",   value: muscle,   set: setMuscle,   options: muscles },
            ].map(({ label, value, set, options }) => (
              <div key={label}>
                <label htmlFor={`exercise-filter-${label.toLowerCase()}`} style={{ display: "block", fontSize: 13, color: T.textMuted, fontWeight: 650, margin: "0 0 6px", fontFamily: "var(--font-archivo), sans-serif" }}>
                  {label}
                </label>
                <select
                  id={`exercise-filter-${label.toLowerCase()}`}
                  value={value}
                  onChange={(e) => { set(e.target.value); setOffset(0); }}
                  style={{
                    width: "100%",
                    background: T.cardHover,
                    border: `1px solid ${T.border}`,
                    borderRadius: "var(--fk-r)",
                    minHeight: 44,
                    padding: "8px 10px",
                    fontSize: 16,
                    color: T.textSecond,
                    outline: "none",
                    appearance: "none",
                    fontFamily: "var(--font-archivo), sans-serif",
                    cursor: "pointer",
                  }}
                >
                  <option value="">All</option>
                  {options.map((o) => (
                    <option key={o} value={o} style={{ background: T.card }}>{o.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {hasFilters && (
            <button
              type="button"
              onClick={() => { setCategory(""); setLevel(""); setEquip(""); setMuscle(""); setOffset(0); }}
              style={{ marginTop: 12, width: "100%", minHeight: 44, background: "none", border: "none", cursor: "pointer", fontSize: 14, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Meta row */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <p style={{ fontSize: 13, color: T.textMuted, margin: 0, fontFamily: "var(--font-archivo), sans-serif" }}>
          {loading ? "Searching…" : `${total.toLocaleString()} result${total !== 1 ? "s" : ""}`}
        </p>
        {totalPages > 1 && (
          <p style={{ fontSize: 13, color: T.textMuted, margin: 0, fontFamily: "var(--font-archivo), sans-serif" }}>
            {currentPage} / {totalPages}
          </p>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className={s.exerciseGrid}>
          {Array.from({ length: 15 }).map((_, i) => (
            <div key={i} style={{ height: 210, background: T.cardHover, borderRadius: "var(--fk-r-lg)", border: `1px solid ${T.border}` }} />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div style={{ textAlign: "center", padding: "80px 0", color: T.textMuted }}>
          <Dumbbell size={36} style={{ margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, margin: 0, fontFamily: "var(--font-archivo), sans-serif" }}>No exercises found</p>
          <p style={{ fontSize: 13, margin: "4px 0 0", color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>Try adjusting your filters</p>
        </div>
      ) : (
        <div className={s.exerciseGrid}>
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
            type="button"
            aria-label="Previous exercise page"
            onClick={() => setOffset(offset - LIMIT)}
            disabled={offset === 0}
            style={{
              width: 44, height: 44, borderRadius: "var(--fk-r)",
              background: T.cardHover,
              border: `1px solid ${T.border}`,
              color: T.textSecond,
              cursor: offset === 0 ? "not-allowed" : "pointer",
              opacity: offset === 0 ? 0.3 : 1,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}
          >
            <ChevronLeft size={15} />
          </button>
          <span style={{ fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif", fontVariantNumeric: "tabular-nums" }}>
            {currentPage} / {totalPages}
          </span>
          <button
            type="button"
            aria-label="Next exercise page"
            onClick={() => setOffset(offset + LIMIT)}
            disabled={offset + LIMIT >= total}
            style={{
              width: 44, height: 44, borderRadius: "var(--fk-r)",
              background: T.cardHover,
              border: `1px solid ${T.border}`,
              color: T.textSecond,
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
  onUpdate: (data: Partial<WorkoutSet>) => Promise<boolean>;
  onDelete: () => void; isTimeBase: boolean;
}) {
  const [weight, setWeight] = useState(set.weightKg?.toString() ?? "");
  const [reps, setReps] = useState(set.reps?.toString() ?? "");
  const [duration, setDuration] = useState(set.durationSecs?.toString() ?? "");

  async function commit(
    field: "weightKg" | "reps" | "durationSecs",
    raw: string,
    previous: number | null,
    reset: (value: string) => void,
  ) {
    const value = raw === "" ? null : Number(raw);
    if (value !== null && (!Number.isFinite(value) || value < 0)) {
      reset(previous?.toString() ?? "");
      return;
    }
    if (value === previous) return;
    const saved = await onUpdate({ [field]: value });
    if (!saved) reset(previous?.toString() ?? "");
  }

  const inputStyle = {
    width: 60,
    background: T.cardHover,
    border: `1px solid ${T.border}`,
    borderRadius: "var(--fk-r)",
    minHeight: 44,
    padding: "6px 8px",
    fontSize: 16,
    color: T.text,
    textAlign: "center" as const,
    outline: "none",
    fontFamily: "var(--font-archivo), sans-serif",
  };

  return (
    <div style={{
      display: "flex", alignItems: "center", gap: 8,
      padding: "8px 6px",
      borderRadius: "var(--fk-r)",
      background: set.completed ? T.wash : "transparent",
    }}>
      <span style={{ width: 18, textAlign: "center", fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif", fontVariantNumeric: "tabular-nums" }}>{setNum}</span>
      {isTimeBase ? (
        <input
          type="number" min={0} max={86400} inputMode="numeric" aria-label={`Seconds for set ${setNum}`}
          placeholder="secs" value={duration} onChange={(e) => setDuration(e.target.value)}
          onBlur={() => commit("durationSecs", duration, set.durationSecs, setDuration)} style={inputStyle}
        />
      ) : (
        <>
          <input
            type="number" min={0} max={2000} step="0.5" inputMode="decimal" aria-label={`Weight in kilograms for set ${setNum}`}
            placeholder="kg" value={weight} onChange={(e) => setWeight(e.target.value)}
            onBlur={() => commit("weightKg", weight, set.weightKg, setWeight)} style={inputStyle}
          />
          <span style={{ color: T.textMuted, fontSize: 14, fontWeight: 700 }}>×</span>
          <input
            type="number" min={0} max={10000} inputMode="numeric" aria-label={`Repetitions for set ${setNum}`}
            placeholder="reps" value={reps} onChange={(e) => setReps(e.target.value)}
            onBlur={() => commit("reps", reps, set.reps, setReps)} style={inputStyle}
          />
        </>
      )}
      <button type="button" aria-label={set.completed ? `Mark set ${setNum} incomplete` : `Mark set ${setNum} complete`} onClick={() => onUpdate({ completed: !set.completed })} style={{ marginLeft: "auto", minWidth: 44, minHeight: 44, background: "none", border: "none", cursor: "pointer", color: set.completed ? T.accent : T.textMuted, transition: "color 0.15s" }}>
        {set.completed ? <CheckCircle2 size={15} /> : <Circle size={15} />}
      </button>
      <button type="button" aria-label={`Remove set ${setNum}`} onClick={onDelete} style={{ minWidth: 44, minHeight: 44, background: "none", border: "none", cursor: "pointer", color: T.textMuted }}>
        <Trash2 size={13} />
      </button>
    </div>
  );
}

// ─── Workout Exercise Card ────────────────────────────────────────────────────

function WorkoutExerciseCard({
  we, sessionId, onSetsChange, onRemove, onError,
}: {
  we: WorkoutExercise; sessionId: string;
  onSetsChange: (sets: WorkoutSet[]) => void;
  onRemove: () => void;
  onError: (message: string) => void;
}) {
  const [sets, setSets] = useState<WorkoutSet[]>(we.sets);
  const [collapsed, setCollapsed] = useState(false);
  const isTimeBase = ["stretching", "cardio"].includes(we.exercise.category ?? "");
  const imgSrc = we.exercise.images[0] ? `${IMG_BASE}${we.exercise.images[0]}` : null;
  const completedSets = sets.filter((s) => s.completed).length;
  const progress = sets.length > 0 ? completedSets / sets.length : 0;

  async function addSet() {
    try {
      const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify(isTimeBase ? { durationSecs: null } : { reps: null, weightKg: null }),
      });
      if (!res.ok) throw new Error("Add set failed");
      const data = await res.json();
      if (!data.set) throw new Error("Missing set");
      const n = [...sets, data.set]; setSets(n); onSetsChange(n);
    } catch {
      onError("We couldn't add that set. Try again.");
    }
  }

  async function updateSet(setId: string, update: Partial<WorkoutSet>) {
    try {
      const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, ...update }),
      });
      if (!res.ok) throw new Error("Update set failed");
      const data = await res.json();
      if (!data.set) throw new Error("Missing set");
      const n = sets.map((s) => (s.id === setId ? data.set : s)); setSets(n); onSetsChange(n);
      return true;
    } catch {
      onError("We couldn't save that set. Your previous values are unchanged.");
      return false;
    }
  }

  async function deleteSet(setId: string) {
    try {
      const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId }),
      });
      if (!res.ok) throw new Error("Delete set failed");
      const n = sets.filter((s) => s.id !== setId); setSets(n); onSetsChange(n);
    } catch {
      onError("We couldn't remove that set. It is still in your workout.");
    }
  }

  return (
    <div style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "var(--fk-r-lg)", overflow: "hidden" }}>
      <div
        onClick={() => setCollapsed(!collapsed)}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setCollapsed(!collapsed);
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={!collapsed}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: 12, minHeight: 64, cursor: "pointer" }}
      >
        {imgSrc ? (
          <Image src={imgSrc} alt="" width={40} height={40} style={{ width: 40, height: 40, borderRadius: "var(--fk-r)", objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
        ) : (
          <div style={{ width: 40, height: 40, borderRadius: "var(--fk-r)", background: T.cardHover, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Dumbbell size={18} color={T.textMuted} />
          </div>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "var(--font-archivo), sans-serif", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {we.exercise.name}
          </p>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4 }}>
            <div style={{ flex: 1, maxWidth: 80, height: 5, background: T.trough, borderRadius: 999, overflow: "hidden" }}>
              <div style={{ width: `${progress * 100}%`, height: "100%", background: T.accent, borderRadius: 999, transition: "width 0.3s" }} />
            </div>
            <p style={{ margin: 0, fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>
              {sets.length === 0 ? "No sets" : `${completedSets}/${sets.length}`}
            </p>
          </div>
        </div>
        <button type="button" aria-label={`Remove ${we.exercise.name} from workout`} onClick={(e) => { e.stopPropagation(); onRemove(); }} style={{ minWidth: 44, minHeight: 44, background: "none", border: "none", cursor: "pointer", color: T.textMuted, marginRight: 4 }}>
          <Trash2 size={13} />
        </button>
        <ChevronDown size={15} color={T.textMuted} style={{ transform: collapsed ? "none" : "rotate(180deg)", transition: "transform 0.2s" }} />
      </div>

      {!collapsed && (
        <div style={{ padding: "0 12px 12px", borderTop: `1px solid ${T.border}` }}>
          {sets.length > 0 && (
            <div style={{ display: "flex", gap: 8, marginTop: 8, marginBottom: 2, paddingLeft: 26, fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>
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
            type="button"
            onClick={addSet}
            style={{
              marginTop: 8, width: "100%",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
              padding: "8px",
              background: "none",
              border: `1px dashed ${T.border}`,
               borderRadius: "var(--fk-r)", minHeight: 44, fontSize: 14, color: T.textMuted,
              cursor: "pointer", fontFamily: "var(--font-archivo), sans-serif",
            }}
          >
            <Plus size={13} /> Add set
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
  const [error, setError] = useState("");
  const [starting, setStarting] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeSessionId = activeSession?.id;
  useEffect(() => {
    if (!activeSessionId) return;
    timerRef.current = setInterval(() => setElapsed((current) => current + 1), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [activeSessionId]);

  function formatElapsed(secs: number) {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${String(s).padStart(2, "0")}`;
  }

  async function startSession() {
    setStarting(true); setError("");
    try {
      const res = await fetch("/api/workout/sessions", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: sessionName || undefined, date: todayStr() }),
      });
      if (!res.ok) throw new Error("Start failed");
      const data = await res.json();
      if (!data.session) throw new Error("Missing session");
      setElapsed(0);
      setActiveSession({ ...data.session, exercises: [] }); setWorkoutExercises([]); setAddedIds(new Set());
    } catch {
      setError("We couldn't start this workout. Try again.");
    } finally {
      setStarting(false);
    }
  }

  async function addExercise(ex: Exercise) {
    if (!activeSession || addedIds.has(ex.id)) return;
    setError("");
    try {
      const res = await fetch(`/api/workout/sessions/${activeSession.id}/exercises`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ exerciseId: ex.id }),
      });
      if (!res.ok) throw new Error("Add exercise failed");
      const data = await res.json();
      if (!data.workoutExercise) throw new Error("Missing exercise");
      setWorkoutExercises((prev) => [...prev, data.workoutExercise]);
      setAddedIds((prev) => new Set([...prev, ex.id]));
    } catch {
      setError(`We couldn't add ${ex.name}. Try again.`);
    }
  }

  async function removeExercise(weId: string, exId: string) {
    if (!activeSession) return;
    setError("");
    try {
      const res = await fetch(`/api/workout/sessions/${activeSession.id}/exercises`, {
        method: "DELETE", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workoutExerciseId: weId }),
      });
      if (!res.ok) throw new Error("Remove exercise failed");
      setWorkoutExercises((prev) => prev.filter((w) => w.id !== weId));
      setAddedIds((prev) => { const next = new Set(prev); next.delete(exId); return next; });
    } catch {
      setError("We couldn't remove that exercise. It is still in your workout.");
    }
  }

  async function finishSession() {
    if (!activeSession) return;
    setFinishing(true);
    setError("");
    const durationMins = Math.round(elapsed / 60);
    try {
      const res = await fetch(`/api/workout/sessions/${activeSession.id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completedAt: new Date().toISOString(), durationMins }),
      });
      if (!res.ok) throw new Error("Finish failed");
      setElapsed(0);
      setActiveSession(null); setWorkoutExercises([]); setAddedIds(new Set()); setSessionName("");
    } catch {
      setError("We couldn't finish and save this workout. Your session is still open.");
    } finally {
      setFinishing(false);
    }
  }

  const btnPrimary: React.CSSProperties = {
    background: T.accent, color: T.onLime, border: "none", borderRadius: "var(--fk-r)",
    minHeight: 46, padding: "0 18px", fontSize: 15, fontWeight: 650,
    fontFamily: "var(--font-archivo), sans-serif", letterSpacing: 0,
    cursor: "pointer", width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
  };

  if (!activeSession) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 16px", textAlign: "center" }}>
        <div style={{ width: 72, height: 72, borderRadius: "var(--fk-r-lg)", background: T.wash, border: `1px solid ${T.wash}`, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
          <Zap size={32} color={T.accent} />
        </div>
        <h3 style={{ fontFamily: "var(--fk-display), Georgia, serif", fontSize: 22, fontWeight: 700, color: T.text, margin: "0 0 8px" }}>
          Start a workout
        </h3>
        <p style={{ fontSize: 13, color: T.textMuted, margin: "0 0 28px", maxWidth: 280, lineHeight: 1.6, fontFamily: "var(--font-archivo), sans-serif" }}>
          Log exercises, track sets and reps, and crush your goals.
        </p>
        <input
          type="text"
          placeholder='Session name, e.g. "Push Day"'
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          style={{
            width: "100%", maxWidth: 320,
            background: T.cardHover,
            border: `1px solid ${T.border}`,
            borderRadius: "var(--fk-r)", padding: "12px 16px",
            fontSize: 16, color: T.text,
            fontFamily: "var(--font-archivo), sans-serif",
            textAlign: "center", outline: "none", marginBottom: 14, boxSizing: "border-box",
          }}
        />
        {error && <p role="alert" className={s.error} style={{ width: "100%", maxWidth: 420 }}>{error}</p>}
        <button type="button" onClick={startSession} disabled={starting} style={{ ...btnPrimary, maxWidth: 320, opacity: starting ? 0.6 : 1 }}>
          <Play size={15} style={{ fill: T.onLime }} /> {starting ? "Starting…" : "Start workout"}
        </button>
      </div>
    );
  }

  if (showBrowse) {
    return (
      <div>
        {error && <p role="alert" className={s.error}>{error}</p>}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <button
            type="button"
            aria-label="Back to workout"
            onClick={() => setShowBrowse(false)}
            style={{ width: 44, height: 44, borderRadius: "var(--fk-r)", background: T.cardHover, border: `1px solid ${T.border}`, color: T.textSecond, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <ArrowLeft size={15} />
          </button>
          <div>
            <p style={{ margin: 0, fontSize: 18, fontWeight: 600, color: T.text, fontFamily: "var(--fk-display), Georgia, serif" }}>Add exercise</p>
            <p style={{ margin: 0, fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>{addedIds.size} added</p>
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
      {error && <p role="alert" className={s.error}>{error}</p>}
      {/* Session header */}
      <div style={{ position: "relative", background: T.card, border: `1px solid ${T.border}`, borderRadius: "var(--fk-r-lg)", padding: 16, marginBottom: 14, overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0, background: `linear-gradient(135deg, ${T.wash} 0%, transparent 60%)`, pointerEvents: "none" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
          <div>
            <p style={{ margin: 0, fontSize: 16, fontWeight: 700, color: T.text, fontFamily: "var(--fk-display), Georgia, serif" }}>{activeSession.name ?? "Workout"}</p>
            <p style={{ margin: "2px 0 0", fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>In progress</p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, background: T.wash, border: `1px solid ${T.wash}`, borderRadius: 999, padding: "6px 12px" }}>
            <Clock size={12} color={T.accent} />
            <span style={{ fontFamily: "var(--font-archivo), sans-serif", fontVariantNumeric: "tabular-nums", fontSize: 14, fontWeight: 700, color: T.accent }}>{formatElapsed(elapsed)}</span>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8 }}>
          {[
            { val: workoutExercises.length, label: "Exercises" },
            { val: totalCompletedSets, label: "Sets done" },
            { val: Math.floor(elapsed / 60), label: "Minutes" },
          ].map(({ val, label }) => (
            <div key={label} style={{ background: T.cardHover, borderRadius: "var(--fk-r)", padding: "10px 0", textAlign: "center" }}>
              <p style={{ margin: 0, fontSize: 18, fontWeight: 700, color: T.text, fontFamily: "var(--fk-display), Georgia, serif" }}>{val}</p>
              <p style={{ margin: "2px 0 0", fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exercise list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 12 }}>
        {workoutExercises.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 0", color: T.textMuted }}>
            <Target size={28} style={{ margin: "0 auto 8px" }} />
            <p style={{ margin: 0, fontSize: 13, fontFamily: "var(--font-archivo), sans-serif" }}>No exercises yet</p>
          </div>
        ) : workoutExercises.map((we) => (
          <WorkoutExerciseCard
            key={we.id} we={we} sessionId={activeSession.id}
            onSetsChange={(sets) => setWorkoutExercises((prev) => prev.map((w) => w.id === we.id ? { ...w, sets } : w))}
            onRemove={() => removeExercise(we.id, we.exerciseId)}
            onError={setError}
          />
        ))}
      </div>

      <button
        type="button"
        onClick={() => setShowBrowse(true)}
        style={{
          width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          padding: "12px", background: "none",
          border: `1px dashed ${T.border}`,
          borderRadius: "var(--fk-r)", minHeight: 46, fontSize: 14, color: T.textMuted,
          cursor: "pointer", fontFamily: "var(--font-archivo), sans-serif", marginBottom: 10,
        }}
      >
        <Plus size={15} /> Add exercise
      </button>

      <button type="button" onClick={finishSession} disabled={finishing} style={{ ...btnPrimary, opacity: finishing ? 0.5 : 1 }}>
        {finishing ? "Saving…" : "Finish workout"}
      </button>
    </div>
  );
}

// ─── History Tab ──────────────────────────────────────────────────────────────

function HistoryTab() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    fetch("/api/workout/sessions?limit=30")
      .then((response) => {
        if (!response.ok) throw new Error("History request failed");
        return response.json();
      })
      .then((data) => { if (alive) setSessions(data.sessions ?? []); })
      .catch(() => { if (alive) setError("We couldn't load your workout history. Try again later."); })
      .finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, []);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {[1, 2, 3].map((i) => <div key={i} style={{ height: 72, background: T.cardHover, borderRadius: "var(--fk-r-lg)", border: `1px solid ${T.border}` }} />)}
      </div>
    );
  }

  if (error) return <p role="alert" className={s.error}>{error}</p>;

  if (sessions.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "80px 0", color: T.textMuted }}>
        <TrendingUp size={36} style={{ margin: "0 auto 12px" }} />
        <p style={{ margin: 0, fontSize: 14, fontFamily: "var(--font-archivo), sans-serif" }}>No workouts yet</p>
        <p style={{ margin: "4px 0 0", fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>Complete your first workout to see history</p>
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
          <p style={{ margin: "0 0 10px", fontSize: 13, color: T.textMuted, fontWeight: 650, fontFamily: "var(--font-archivo), sans-serif", display: "flex", alignItems: "center", gap: 6 }}>
            <Calendar size={11} />
            {new Date(`${date}T00:00:00.000Z`).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" })}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {daySessions.map((s) => (
              <div key={s.id} style={{ background: T.card, border: `1px solid ${T.border}`, borderRadius: "var(--fk-r-lg)", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                  aria-expanded={expanded === s.id}
                  style={{ display: "flex", width: "100%", alignItems: "center", gap: 12, padding: "12px 14px", minHeight: 64, background: "transparent", border: 0, color: "inherit", textAlign: "left", cursor: "pointer" }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: "var(--fk-r)", background: T.wash, border: `1px solid ${T.wash}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Activity size={16} color={T.accent} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: T.text, fontFamily: "var(--font-archivo), sans-serif" }}>{s.name ?? "Workout"}</p>
                    <p style={{ margin: "2px 0 0", fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>
                      {s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}
                      {s.durationMins ? ` · ${formatDuration(s.durationMins)}` : ""}
                    </p>
                  </div>
                  {s.caloriesBurned ? (
                    <div style={{ textAlign: "right", marginRight: 6 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 4, color: T.accent, justifyContent: "flex-end" }}>
                        <Flame size={12} />
                        <span style={{ fontSize: 14, fontWeight: 700, fontFamily: "var(--fk-display), Georgia, serif" }}>{s.caloriesBurned}</span>
                      </div>
                      <p style={{ margin: 0, fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>estimated kcal</p>
                    </div>
                  ) : null}
                  <ChevronDown size={15} color={T.textMuted} style={{ transform: expanded === s.id ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                </button>

                {expanded === s.id && s.exercises.length > 0 && (
                  <div style={{ borderTop: `1px solid ${T.border}`, padding: "8px 14px" }}>
                    {s.exercises.map((we) => {
                      const imgSrc = we.exercise.images[0] ? `${IMG_BASE}${we.exercise.images[0]}` : null;
                      return (
                        <div key={we.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: `1px solid ${T.border}` }}>
                          {imgSrc ? (
                            <Image src={imgSrc} alt="" width={30} height={30} style={{ width: 30, height: 30, borderRadius: "var(--fk-r)", objectFit: "cover", objectPosition: "top", flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 30, height: 30, borderRadius: "var(--fk-r)", background: T.cardHover, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Dumbbell size={12} color={T.textMuted} />
                            </div>
                          )}
                          <p style={{ flex: 1, margin: 0, fontSize: 13, color: T.textSecond, fontWeight: 500, fontFamily: "var(--font-archivo), sans-serif" }}>{we.exercise.name}</p>
                          <p style={{ margin: 0, fontSize: 13, color: T.textMuted, fontFamily: "var(--font-archivo), sans-serif" }}>{we.sets.length} set{we.sets.length !== 1 ? "s" : ""}</p>
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
      <style>{`
        @keyframes pulse { 0%,100%{opacity:.4} 50%{opacity:.7} }
      `}</style>

      <div className={s.screen}>
        {/* Header */}
        <header className={s.header}>
          <h1 style={screen()}>Exercises</h1>
          <p className={s.intro}>Browse {initialTotal.toLocaleString("en-IN")} movements, build a session, and keep a useful set history.</p>
        </header>

        {/* Tab bar */}
        <div className={s.tabs} role="tablist" aria-label="Exercise tools">
          {tabs.map((t) => (
            <button
              type="button"
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`${s.tab} ${tab === t.id ? s.tabActive : ""}`}
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
