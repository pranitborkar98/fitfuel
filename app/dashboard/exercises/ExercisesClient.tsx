"use client";

// app/dashboard/exercises/ExercisesClient.tsx
// Phase 7 — Exercise Library + Workout Logger
// Tabs: Browse · Workout · History

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  Play, Plus, Trash2, CheckCircle2, Circle, ChevronDown,
  Dumbbell, Flame, Clock, Calendar, BarChart2, ArrowLeft,
  Zap, Target, Activity, Info
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Constants ────────────────────────────────────────────────────────────────

const IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const CATEGORY_COLORS: Record<string, string> = {
  strength:               "bg-lime-400/10 text-lime-400 border-lime-400/20",
  cardio:                 "bg-orange-400/10 text-orange-400 border-orange-400/20",
  stretching:             "bg-blue-400/10 text-blue-400 border-blue-400/20",
  plyometrics:            "bg-purple-400/10 text-purple-400 border-purple-400/20",
  powerlifting:           "bg-red-400/10 text-red-400 border-red-400/20",
  strongman:              "bg-yellow-400/10 text-yellow-400 border-yellow-400/20",
  olympic_weightlifting:  "bg-cyan-400/10 text-cyan-400 border-cyan-400/20",
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:     "text-green-400",
  intermediate: "text-yellow-400",
  expert:       "text-red-400",
};

function levelDots(level: string) {
  const filled = level === "beginner" ? 1 : level === "intermediate" ? 2 : 3;
  return (
    <span className="flex gap-0.5 items-center">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`w-1.5 h-1.5 rounded-full ${i < filled ? LEVEL_COLORS[level]?.replace("text-", "bg-") ?? "bg-lime-400" : "bg-neutral-700"}`}
        />
      ))}
    </span>
  );
}

function formatDuration(mins: number | null) {
  if (!mins) return "—";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// ─── Exercise Card ─────────────────────────────────────────────────────────────

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
  const imgSrc = exercise.images[0]
    ? `${IMG_BASE}${exercise.images[0]}`
    : null;

  const catColor = CATEGORY_COLORS[exercise.category] ?? "bg-neutral-700/40 text-neutral-400 border-neutral-700";

  return (
    <div
      className="group relative bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden cursor-pointer hover:border-neutral-700 transition-all duration-200 hover:shadow-lg hover:shadow-black/40"
      onClick={onClick}
    >
      {/* Thumbnail */}
      <div className="relative h-36 bg-neutral-800 overflow-hidden">
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={exercise.name}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-300"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = "none";
            }}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-10 h-10 text-neutral-700" />
          </div>
        )}
        {/* Category badge */}
        <span className={`absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
          {exercise.category.replace(/_/g, " ")}
        </span>
        {/* Level dots */}
        <span className="absolute top-2 right-2 bg-black/60 rounded-full px-2 py-1 flex items-center gap-1">
          {levelDots(exercise.level)}
        </span>
      </div>

      {/* Body */}
      <div className="p-3">
        <p className="text-sm font-semibold text-white leading-snug line-clamp-1 mb-1">
          {exercise.name}
        </p>
        <p className="text-[11px] text-neutral-500 mb-2">
          {exercise.primaryMuscles.slice(0, 2).join(" · ")}
          {exercise.primaryMuscles.length > 2 && ` +${exercise.primaryMuscles.length - 2}`}
        </p>
        {exercise.equipment && (
          <p className="text-[10px] text-neutral-600 uppercase tracking-wide">
            {exercise.equipment}
          </p>
        )}
      </div>

      {/* Add to workout button */}
      {inWorkout && onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className={`absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all ${
            added
              ? "bg-lime-400 text-black"
              : "bg-neutral-800 text-neutral-400 hover:bg-lime-400 hover:text-black"
          }`}
        >
          {added ? <CheckCircle2 className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
        </button>
      )}
    </div>
  );
}

// ─── Exercise Detail Modal ────────────────────────────────────────────────────

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

  useEffect(() => {
    if (!exercise.instructions) {
      fetch(`/api/exercises/${exercise.id}`)
        .then((r) => r.json())
        .then((d) => { if (d.exercise) setDetail(d.exercise); })
        .finally(() => setLoading(false));
    }
  }, [exercise.id, exercise.instructions]);

  const img0 = detail.images[0] ? `${IMG_BASE}${detail.images[0]}` : null;
  const img1 = detail.images[1] ? `${IMG_BASE}${detail.images[1]}` : null;
  const catColor = CATEGORY_COLORS[detail.category] ?? "bg-neutral-700/40 text-neutral-400 border-neutral-700";

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full sm:max-w-xl bg-neutral-950 border border-neutral-800 rounded-t-2xl sm:rounded-2xl max-h-[92vh] overflow-y-auto">
        {/* Images */}
        <div className="grid grid-cols-2 h-48 sm:h-56 overflow-hidden rounded-t-2xl sm:rounded-t-2xl">
          {[img0, img1].map((src, i) =>
            src ? (
              <img key={i} src={src} alt="" className="w-full h-full object-cover object-top" />
            ) : (
              <div key={i} className="bg-neutral-800 flex items-center justify-center">
                <Dumbbell className="w-10 h-10 text-neutral-700" />
              </div>
            )
          )}
        </div>

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div>
              <h2 className="text-lg font-bold text-white leading-tight">{detail.name}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${catColor}`}>
                  {detail.category.replace(/_/g, " ")}
                </span>
                <span className={`text-[11px] font-medium capitalize ${LEVEL_COLORS[detail.level]}`}>
                  {detail.level}
                </span>
              </div>
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full bg-neutral-800 flex items-center justify-center hover:bg-neutral-700 transition-colors ml-3 flex-shrink-0">
              <X className="w-4 h-4 text-neutral-400" />
            </button>
          </div>

          {/* Meta pills */}
          <div className="flex flex-wrap gap-2 mb-4">
            {detail.equipment && (
              <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg">
                🏋️ {detail.equipment}
              </span>
            )}
            {detail.force && (
              <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg capitalize">
                ↕ {detail.force}
              </span>
            )}
            {detail.mechanic && (
              <span className="text-[11px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded-lg capitalize">
                ⚙ {detail.mechanic}
              </span>
            )}
          </div>

          {/* Muscles */}
          <div className="mb-4">
            <p className="text-[11px] text-neutral-500 uppercase tracking-widest mb-2">Primary muscles</p>
            <div className="flex flex-wrap gap-1.5">
              {detail.primaryMuscles.map((m) => (
                <span key={m} className="text-[11px] bg-lime-400/10 text-lime-400 border border-lime-400/20 px-2 py-0.5 rounded-full capitalize">
                  {m}
                </span>
              ))}
            </div>
            {detail.secondaryMuscles.length > 0 && (
              <>
                <p className="text-[11px] text-neutral-500 uppercase tracking-widest mt-3 mb-2">Secondary</p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.secondaryMuscles.map((m) => (
                    <span key={m} className="text-[11px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded-full capitalize">
                      {m}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-5">
            <p className="text-[11px] text-neutral-500 uppercase tracking-widest mb-3">Instructions</p>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-neutral-800 rounded animate-pulse" />)}
              </div>
            ) : (
              <ol className="space-y-3">
                {(detail.instructions ?? []).map((step, i) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-neutral-800 text-neutral-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-neutral-300 leading-relaxed">{step}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* Add to workout CTA */}
          {inWorkout && onAddToWorkout && (
            <button
              onClick={() => { onAddToWorkout(); onClose(); }}
              className="w-full bg-lime-400 text-black font-bold py-3 rounded-xl hover:bg-lime-300 transition-colors"
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
  const LIMIT = 20;

  const [showFilters, setShowFilters] = useState(false);
  const [selectedExercise, setSelectedExercise] = useState<Exercise | null>(null);

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

  // Debounced search on q change
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
      {/* Search + filter bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
          <input
            type="text"
            placeholder="Search exercises..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-neutral-900 border border-neutral-800 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white placeholder-neutral-600 focus:outline-none focus:border-neutral-700"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-3.5 h-3.5 text-neutral-500" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-colors ${
            showFilters || hasFilters
              ? "bg-lime-400/10 border-lime-400/30 text-lime-400"
              : "bg-neutral-900 border-neutral-800 text-neutral-400 hover:border-neutral-700"
          }`}
        >
          <SlidersHorizontal className="w-4 h-4" />
          {hasFilters && <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />}
        </button>
      </div>

      {/* Filter dropdowns */}
      {showFilters && (
        <div className="grid grid-cols-2 gap-2 mb-4 p-3 bg-neutral-900 border border-neutral-800 rounded-xl">
          {[
            { label: "Category", value: category, set: setCategory, options: categories },
            { label: "Level",    value: level,    set: setLevel,    options: levels },
            { label: "Equipment",value: equip,    set: setEquip,    options: equipment },
            { label: "Muscle",   value: muscle,   set: setMuscle,   options: muscles },
          ].map(({ label, value, set, options }) => (
            <div key={label}>
              <label className="text-[10px] text-neutral-500 uppercase tracking-widest block mb-1">{label}</label>
              <select
                value={value}
                onChange={(e) => { set(e.target.value); setOffset(0); }}
                className="w-full bg-neutral-800 border border-neutral-700 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none appearance-none capitalize"
              >
                <option value="">All</option>
                {options.map((o) => (
                  <option key={o} value={o} className="capitalize">{o.replace(/_/g, " ")}</option>
                ))}
              </select>
            </div>
          ))}
          {hasFilters && (
            <button
              onClick={() => { setCategory(""); setLevel(""); setEquip(""); setMuscle(""); setOffset(0); }}
              className="col-span-2 text-xs text-neutral-500 hover:text-white transition-colors text-center py-1"
            >
              Clear filters
            </button>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-[11px] text-neutral-600 mb-3">
        {loading ? "Loading..." : `${total.toLocaleString()} exercise${total !== 1 ? "s" : ""}`}
        {(q || hasFilters) && !loading && " found"}
      </p>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-neutral-900 rounded-xl h-52 animate-pulse border border-neutral-800" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-16 text-neutral-600">
          <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No exercises found</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
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
        <div className="flex items-center justify-center gap-3 mt-6">
          <button
            onClick={() => setOffset(offset - LIMIT)}
            disabled={offset === 0}
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center disabled:opacity-30 hover:border-neutral-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4 text-neutral-400" />
          </button>
          <span className="text-xs text-neutral-500">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setOffset(offset + LIMIT)}
            disabled={offset + LIMIT >= total}
            className="w-8 h-8 rounded-lg bg-neutral-900 border border-neutral-800 flex items-center justify-center disabled:opacity-30 hover:border-neutral-700 transition-colors"
          >
            <ChevronRight className="w-4 h-4 text-neutral-400" />
          </button>
        </div>
      )}

      {/* Exercise detail modal */}
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
  set,
  setNum,
  onUpdate,
  onDelete,
  isTimeBase,
}: {
  set: WorkoutSet;
  setNum: number;
  onUpdate: (data: Partial<WorkoutSet>) => void;
  onDelete: () => void;
  isTimeBase: boolean;
}) {
  return (
    <div className="flex items-center gap-2 py-1.5">
      <span className="w-6 text-center text-[11px] text-neutral-600 font-mono">{setNum}</span>

      {isTimeBase ? (
        <input
          type="number"
          placeholder="secs"
          value={set.durationSecs ?? ""}
          onChange={(e) => onUpdate({ durationSecs: e.target.value ? Number(e.target.value) : null })}
          className="w-20 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-lime-500"
        />
      ) : (
        <>
          <input
            type="number"
            placeholder="kg"
            value={set.weightKg ?? ""}
            onChange={(e) => onUpdate({ weightKg: e.target.value ? Number(e.target.value) : null })}
            className="w-16 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-lime-500"
          />
          <span className="text-neutral-700 text-xs">×</span>
          <input
            type="number"
            placeholder="reps"
            value={set.reps ?? ""}
            onChange={(e) => onUpdate({ reps: e.target.value ? Number(e.target.value) : null })}
            className="w-16 bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-xs text-white text-center focus:outline-none focus:border-lime-500"
          />
        </>
      )}

      <button
        onClick={() => onUpdate({ completed: !set.completed })}
        className={`ml-auto transition-colors ${set.completed ? "text-lime-400" : "text-neutral-700 hover:text-neutral-500"}`}
      >
        {set.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      </button>
      <button onClick={onDelete} className="text-neutral-700 hover:text-red-400 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Active Workout Exercise Card ─────────────────────────────────────────────

function WorkoutExerciseCard({
  we,
  sessionId,
  onSetsChange,
  onRemove,
}: {
  we: WorkoutExercise;
  sessionId: string;
  onSetsChange: (sets: WorkoutSet[]) => void;
  onRemove: () => void;
}) {
  const [sets, setSets] = useState<WorkoutSet[]>(we.sets);
  const [collapsed, setCollapsed] = useState(false);

  const isTimeBase = ["stretching", "cardio"].includes(we.exercise.category ?? "");
  const imgSrc = we.exercise.images[0] ? `${IMG_BASE}${we.exercise.images[0]}` : null;

  async function addSet() {
    const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(
        isTimeBase
          ? { durationSecs: null }
          : { reps: null, weightKg: null }
      ),
    });
    const data = await res.json();
    if (data.set) {
      const newSets = [...sets, data.set];
      setSets(newSets);
      onSetsChange(newSets);
    }
  }

  async function updateSet(setId: string, update: Partial<WorkoutSet>) {
    const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, ...update }),
    });
    const data = await res.json();
    if (data.set) {
      const newSets = sets.map((s) => (s.id === setId ? data.set : s));
      setSets(newSets);
      onSetsChange(newSets);
    }
  }

  async function deleteSet(setId: string) {
    await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId }),
    });
    const newSets = sets.filter((s) => s.id !== setId);
    setSets(newSets);
    onSetsChange(newSets);
  }

  const completedSets = sets.filter((s) => s.completed).length;

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-800/50 transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        {imgSrc ? (
          <img src={imgSrc} alt="" className="w-10 h-10 rounded-lg object-cover object-top flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-neutral-800 flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-neutral-700" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{we.exercise.name}</p>
          <p className="text-[11px] text-neutral-500">
            {sets.length === 0 ? "No sets yet" : `${completedSets}/${sets.length} sets done`}
          </p>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-neutral-700 hover:text-red-400 transition-colors mr-1"
        >
          <Trash2 className="w-4 h-4" />
        </button>
        <ChevronDown
          className={`w-4 h-4 text-neutral-600 transition-transform ${collapsed ? "" : "rotate-180"}`}
        />
      </div>

      {!collapsed && (
        <div className="px-3 pb-3 border-t border-neutral-800 pt-2">
          {/* Column headers */}
          {sets.length > 0 && (
            <div className="flex items-center gap-2 mb-1 text-[10px] text-neutral-600 uppercase tracking-widest pl-6">
              {isTimeBase ? (
                <span className="w-20 text-center">Duration</span>
              ) : (
                <>
                  <span className="w-16 text-center">Weight</span>
                  <span className="w-4" />
                  <span className="w-16 text-center">Reps</span>
                </>
              )}
            </div>
          )}

          {/* Sets */}
          {sets.map((set, i) => (
            <SetRow
              key={set.id}
              set={set}
              setNum={i + 1}
              isTimeBase={isTimeBase}
              onUpdate={(u) => updateSet(set.id, u)}
              onDelete={() => deleteSet(set.id)}
            />
          ))}

          <button
            onClick={addSet}
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg border border-dashed border-neutral-800 text-xs text-neutral-600 hover:text-lime-400 hover:border-lime-400/30 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" /> Add Set
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Workout Tab ──────────────────────────────────────────────────────────────

function WorkoutTab({
  initialExercises,
  initialTotal,
  categories,
  levels,
  equipment,
  muscles,
}: Omit<ExercisesClientProps, "initialTotal"> & { initialTotal: number }) {
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [showBrowse, setShowBrowse] = useState(false);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [finishing, setFinishing] = useState(false);
  const [sessionName, setSessionName] = useState("");
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start timer when session is active
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
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: sessionName || null, date: todayStr() }),
    });
    const data = await res.json();
    if (data.session) {
      setActiveSession({ ...data.session, exercises: [] });
      setWorkoutExercises([]);
      setAddedIds(new Set());
    }
  }

  async function addExercise(ex: Exercise) {
    if (!activeSession || addedIds.has(ex.id)) return;
    const res = await fetch(`/api/workout/sessions/${activeSession.id}/exercises`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workoutExerciseId: weId }),
    });
    setWorkoutExercises((prev) => prev.filter((w) => w.id !== weId));
    setAddedIds((prev) => { const s = new Set(prev); s.delete(exId); return s; });
  }

  async function finishSession() {
    if (!activeSession) return;
    setFinishing(true);
    const durationMins = Math.round(elapsed / 60);

    // Rough calorie estimate: 5 kcal/min average
    const totalSets = workoutExercises.reduce((s, we) => s + we.sets.length, 0);
    const caloriesBurned = Math.round(durationMins * 5 + totalSets * 3);

    await fetch(`/api/workout/sessions/${activeSession.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completedAt: new Date().toISOString(), durationMins, caloriesBurned }),
    });

    setActiveSession(null);
    setWorkoutExercises([]);
    setAddedIds(new Set());
    setSessionName("");
    setFinishing(false);
  }

  // ── No active session ──
  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="w-16 h-16 rounded-2xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center mb-5">
          <Zap className="w-8 h-8 text-lime-400" />
        </div>
        <h3 className="text-white font-bold text-lg mb-1">Start a Workout</h3>
        <p className="text-neutral-500 text-sm mb-6 max-w-xs">
          Log exercises, track sets and reps, and burn those calories.
        </p>
        <input
          type="text"
          placeholder='Name (e.g. "Push Day") — optional'
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="w-full max-w-xs bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-2.5 text-sm text-white placeholder-neutral-600 text-center focus:outline-none focus:border-neutral-700 mb-3"
        />
        <button
          onClick={startSession}
          className="flex items-center gap-2 bg-lime-400 text-black font-bold px-6 py-3 rounded-xl hover:bg-lime-300 transition-colors"
        >
          <Play className="w-4 h-4" /> Start Workout
        </button>
      </div>
    );
  }

  // ── Active session ──
  if (showBrowse) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => setShowBrowse(false)}
            className="w-8 h-8 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center hover:border-neutral-700 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-neutral-400" />
          </button>
          <p className="text-sm font-semibold text-white">Add Exercise</p>
        </div>
        <BrowseTab
          initialExercises={initialExercises}
          initialTotal={initialTotal}
          categories={categories}
          levels={levels}
          equipment={equipment}
          muscles={muscles}
          workoutMode={true}
          addedIds={addedIds}
          onAdd={(ex) => { addExercise(ex); }}
        />
      </div>
    );
  }

  return (
    <div>
      {/* Session header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-white font-bold">{activeSession.name ?? "Workout"}</p>
            <p className="text-[11px] text-neutral-500">In progress</p>
          </div>
          <div className="flex items-center gap-1.5 bg-lime-400/10 border border-lime-400/20 rounded-full px-3 py-1">
            <Clock className="w-3.5 h-3.5 text-lime-400" />
            <span className="text-sm font-mono font-bold text-lime-400">{formatElapsed(elapsed)}</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="bg-neutral-800 rounded-lg py-2">
            <p className="text-lg font-bold text-white">{workoutExercises.length}</p>
            <p className="text-[10px] text-neutral-500">Exercises</p>
          </div>
          <div className="bg-neutral-800 rounded-lg py-2">
            <p className="text-lg font-bold text-white">
              {workoutExercises.reduce((s, we) => s + we.sets.filter((st) => st.completed).length, 0)}
            </p>
            <p className="text-[10px] text-neutral-500">Sets done</p>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-3 mb-4">
        {workoutExercises.length === 0 ? (
          <div className="text-center py-8 text-neutral-600">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No exercises added yet</p>
          </div>
        ) : (
          workoutExercises.map((we) => (
            <WorkoutExerciseCard
              key={we.id}
              we={we}
              sessionId={activeSession.id}
              onSetsChange={(sets) => {
                setWorkoutExercises((prev) =>
                  prev.map((w) => (w.id === we.id ? { ...w, sets } : w))
                );
              }}
              onRemove={() => removeExercise(we.id, we.exerciseId)}
            />
          ))
        )}
      </div>

      {/* Actions */}
      <button
        onClick={() => setShowBrowse(true)}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-neutral-800 text-sm text-neutral-500 hover:text-lime-400 hover:border-lime-400/30 transition-colors mb-3"
      >
        <Plus className="w-4 h-4" /> Add Exercise
      </button>

      <button
        onClick={finishSession}
        disabled={finishing}
        className="w-full bg-lime-400 text-black font-bold py-3 rounded-xl hover:bg-lime-300 transition-colors disabled:opacity-60"
      >
        {finishing ? "Saving..." : "Finish Workout"}
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
    fetch("/api/workout/sessions?limit=30")
      .then((r) => r.json())
      .then((d) => setSessions(d.sessions ?? []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 bg-neutral-900 rounded-xl animate-pulse border border-neutral-800" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-16 text-neutral-600">
        <BarChart2 className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm">No workouts yet</p>
        <p className="text-xs mt-1">Complete your first workout to see history</p>
      </div>
    );
  }

  // Group by date
  const grouped: Record<string, WorkoutSession[]> = {};
  sessions.forEach((s) => {
    const d = s.date.split("T")[0];
    if (!grouped[d]) grouped[d] = [];
    grouped[d].push(s);
  });

  return (
    <div className="space-y-4">
      {Object.entries(grouped).map(([date, daySessions]) => (
        <div key={date}>
          <p className="text-[11px] text-neutral-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <div className="space-y-2">
            {daySessions.map((s) => (
              <div
                key={s.id}
                className="bg-neutral-900 border border-neutral-800 rounded-xl overflow-hidden"
              >
                <div
                  className="flex items-center gap-3 p-3 cursor-pointer hover:bg-neutral-800/50 transition-colors"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <div className="w-9 h-9 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-lime-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{s.name ?? "Workout"}</p>
                    <p className="text-[11px] text-neutral-500">
                      {s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}
                      {s.durationMins ? ` · ${formatDuration(s.durationMins)}` : ""}
                    </p>
                  </div>
                  <div className="text-right mr-2">
                    {s.caloriesBurned ? (
                      <div className="flex items-center gap-1 text-orange-400">
                        <Flame className="w-3.5 h-3.5" />
                        <span className="text-sm font-bold">{s.caloriesBurned}</span>
                      </div>
                    ) : null}
                    <p className="text-[10px] text-neutral-600">kcal</p>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-neutral-700 transition-transform ${expanded === s.id ? "rotate-180" : ""}`} />
                </div>

                {expanded === s.id && s.exercises.length > 0 && (
                  <div className="border-t border-neutral-800 px-3 py-2">
                    {s.exercises.map((we) => {
                      const totalSets = we.sets.length;
                      const imgSrc = we.exercise.images[0] ? `${IMG_BASE}${we.exercise.images[0]}` : null;
                      return (
                        <div key={we.id} className="flex items-center gap-2.5 py-2 border-b border-neutral-800 last:border-0">
                          {imgSrc ? (
                            <img src={imgSrc} alt="" className="w-8 h-8 rounded-md object-cover object-top flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-md bg-neutral-800 flex items-center justify-center flex-shrink-0">
                              <Dumbbell className="w-4 h-4 text-neutral-700" />
                            </div>
                          )}
                          <p className="flex-1 text-xs text-neutral-300">{we.exercise.name}</p>
                          <p className="text-[11px] text-neutral-500">{totalSets} set{totalSets !== 1 ? "s" : ""}</p>
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
  initialExercises,
  initialTotal,
  categories,
  levels,
  equipment,
  muscles,
}: ExercisesClientProps) {
  const [tab, setTab] = useState<Tab>("browse");

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: "browse",  label: "Browse",  icon: <Search className="w-4 h-4" /> },
    { id: "workout", label: "Workout", icon: <Zap className="w-4 h-4" /> },
    { id: "history", label: "History", icon: <BarChart2 className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080808] px-4 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-8 h-8 rounded-lg bg-lime-400/10 border border-lime-400/20 flex items-center justify-center">
            <Dumbbell className="w-4 h-4 text-lime-400" />
          </div>
          <h1 className="text-xl font-bold text-white">Exercise Library</h1>
        </div>
        <p className="text-sm text-neutral-500 ml-11">
          {initialTotal.toLocaleString()} exercises · browse, log, track
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex bg-neutral-900 border border-neutral-800 rounded-xl p-1 mb-5 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${
              tab === t.id
                ? "bg-lime-400 text-black shadow-sm"
                : "text-neutral-500 hover:text-neutral-300"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline">{t.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "browse" && (
        <BrowseTab
          initialExercises={initialExercises}
          initialTotal={initialTotal}
          categories={categories}
          levels={levels}
          equipment={equipment}
          muscles={muscles}
        />
      )}
      {tab === "workout" && (
        <WorkoutTab
          initialExercises={initialExercises}
          initialTotal={initialTotal}
          categories={categories}
          levels={levels}
          equipment={equipment}
          muscles={muscles}
        />
      )}
      {tab === "history" && <HistoryTab />}
    </div>
  );
}
