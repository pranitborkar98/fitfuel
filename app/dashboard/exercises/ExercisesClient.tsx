"use client";

// app/dashboard/exercises/ExercisesClient.tsx
// Phase 7 â€” Exercise Library + Workout Logger
// Tabs: Browse Â· Workout Â· History

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search, SlidersHorizontal, X, ChevronLeft, ChevronRight,
  Play, Plus, Trash2, CheckCircle2, Circle, ChevronDown,
  Dumbbell, Flame, Clock, Calendar, BarChart2, ArrowLeft,
  Zap, Target, Activity, Filter, TrendingUp
} from "lucide-react";

// â”€â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

// â”€â”€â”€ Constants â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

const IMG_BASE =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/";

const CATEGORY_COLORS: Record<string, { bg: string; text: string; dot: string }> = {
  strength:              { bg: "bg-lime-400/10",   text: "text-lime-400",   dot: "bg-lime-400" },
  cardio:                { bg: "bg-orange-400/10", text: "text-orange-400", dot: "bg-orange-400" },
  stretching:            { bg: "bg-sky-400/10",    text: "text-sky-400",    dot: "bg-sky-400" },
  plyometrics:           { bg: "bg-violet-400/10", text: "text-violet-400", dot: "bg-violet-400" },
  powerlifting:          { bg: "bg-red-400/10",    text: "text-red-400",    dot: "bg-red-400" },
  strongman:             { bg: "bg-amber-400/10",  text: "text-amber-400",  dot: "bg-amber-400" },
  olympic_weightlifting: { bg: "bg-cyan-400/10",   text: "text-cyan-400",   dot: "bg-cyan-400" },
};

const LEVEL_COLORS: Record<string, string> = {
  beginner:     "text-emerald-400",
  intermediate: "text-amber-400",
  expert:       "text-red-400",
};

const LEVEL_BAR: Record<string, number> = {
  beginner: 1, intermediate: 2, expert: 3,
};

function LevelBadge({ level }: { level: string }) {
  const filled = LEVEL_BAR[level] ?? 1;
  const color = LEVEL_COLORS[level] ?? "text-lime-400";
  return (
    <span className={`flex items-center gap-[3px] ${color}`}>
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className={`inline-block rounded-[2px] ${i < filled ? color.replace("text-", "bg-") : "bg-neutral-700"}`}
          style={{ width: 6, height: i < filled ? 10 + i * 2 : 6 }}
        />
      ))}
    </span>
  );
}

function CategoryPill({ category }: { category: string }) {
  const c = CATEGORY_COLORS[category] ?? { bg: "bg-neutral-800", text: "text-neutral-400", dot: "bg-neutral-500" };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold tracking-wide uppercase ${c.bg} ${c.text}`}>
      <span className={`w-1 h-1 rounded-full ${c.dot}`} />
      {category.replace(/_/g, " ")}
    </span>
  );
}

function formatDuration(mins: number | null) {
  if (!mins) return "â€”";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function todayStr() {
  return new Date().toISOString().split("T")[0];
}

// â”€â”€â”€ Exercise Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  return (
    <div
      className="group relative bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden cursor-pointer transition-all duration-200 hover:border-white/[0.12] hover:bg-[#161616] hover:-translate-y-0.5 hover:shadow-xl hover:shadow-black/60"
      onClick={onClick}
    >
      {/* Image area */}
      <div className="relative h-40 overflow-hidden bg-[#0d0d0d]">
        {imgSrc && !imgErr ? (
          <img
            src={imgSrc}
            alt={exercise.name}
            className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-[1.04]"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Dumbbell className="w-9 h-9 text-white/10" />
          </div>
        )}

        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#111111] via-transparent to-transparent opacity-70" />

        {/* Top badges */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-start justify-between">
          <CategoryPill category={exercise.category} />
          <span className="bg-black/50 backdrop-blur-sm rounded-lg px-2 py-1">
            <LevelBadge level={exercise.level} />
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 pt-2.5">
        <p className="text-[13px] font-semibold text-white leading-snug line-clamp-1 mb-1">
          {exercise.name}
        </p>
        <p className="text-[11px] text-white/30 leading-snug line-clamp-1">
          {exercise.primaryMuscles.slice(0, 2).join(" Â· ")}
          {exercise.primaryMuscles.length > 2 && ` +${exercise.primaryMuscles.length - 2}`}
        </p>
        {exercise.equipment && (
          <p className="text-[10px] text-white/20 uppercase tracking-widest mt-1.5 font-medium">
            {exercise.equipment}
          </p>
        )}
      </div>

      {/* Add to workout button */}
      {inWorkout && onAdd && (
        <button
          onClick={(e) => { e.stopPropagation(); onAdd(); }}
          className={`absolute bottom-3 right-3 w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg ${
            added
              ? "bg-lime-400 text-black scale-110"
              : "bg-white/10 text-white/60 hover:bg-lime-400 hover:text-black"
          }`}
        >
          {added ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
        </button>
      )}
    </div>
  );
}

// â”€â”€â”€ Exercise Detail Modal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  const images = detail.images
    .slice(0, 2)
    .map((src) => `${IMG_BASE}${src}`)
    .filter((_, i) => !imgErrors[i]);

  const catStyle = CATEGORY_COLORS[detail.category] ?? { bg: "bg-neutral-800", text: "text-neutral-400", dot: "bg-neutral-500" };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-md" onClick={onClose} />
      <div className="relative w-full sm:max-w-lg bg-[#0e0e0e] border border-white/[0.08] rounded-t-3xl sm:rounded-3xl max-h-[90vh] overflow-y-auto shadow-2xl">

        {/* Hero images */}
        <div className="relative h-52 sm:h-60 rounded-t-3xl sm:rounded-t-3xl overflow-hidden bg-[#0a0a0a]">
          <div className="grid grid-cols-2 h-full gap-0.5">
            {[0, 1].map((i) => {
              const src = detail.images[i] ? `${IMG_BASE}${detail.images[i]}` : null;
              return src && !imgErrors[i] ? (
                <img
                  key={i}
                  src={src}
                  alt=""
                  className="w-full h-full object-cover object-top"
                  onError={() => setImgErrors((p) => ({ ...p, [i]: true }))}
                />
              ) : (
                <div key={i} className="w-full h-full flex items-center justify-center bg-[#111]">
                  <Dumbbell className="w-8 h-8 text-white/10" />
                </div>
              );
            })}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-[#0e0e0e] via-transparent to-transparent" />

          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-black/70 transition-colors"
          >
            <X className="w-3.5 h-3.5 text-white/70" />
          </button>
        </div>

        <div className="px-5 pb-6 -mt-4 relative z-10">
          {/* Title */}
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white leading-tight mb-2">{detail.name}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <CategoryPill category={detail.category} />
              <span className={`text-[11px] font-semibold capitalize ${LEVEL_COLORS[detail.level] ?? "text-white/40"}`}>
                {detail.level}
              </span>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2 mb-5">
            {detail.equipment && (
              <span className="text-[11px] bg-white/[0.06] text-white/50 px-2.5 py-1 rounded-lg border border-white/[0.06]">
                ðŸ‹ï¸ {detail.equipment}
              </span>
            )}
            {detail.force && (
              <span className="text-[11px] bg-white/[0.06] text-white/50 px-2.5 py-1 rounded-lg border border-white/[0.06] capitalize">
                â†• {detail.force}
              </span>
            )}
            {detail.mechanic && (
              <span className="text-[11px] bg-white/[0.06] text-white/50 px-2.5 py-1 rounded-lg border border-white/[0.06] capitalize">
                âš™ {detail.mechanic}
              </span>
            )}
          </div>

          {/* Muscles */}
          <div className="mb-5 p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05]">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-2">Primary Muscles</p>
            <div className="flex flex-wrap gap-1.5">
              {detail.primaryMuscles.map((m) => (
                <span key={m} className="text-[11px] bg-lime-400/10 text-lime-400 border border-lime-400/20 px-2.5 py-0.5 rounded-full capitalize font-medium">
                  {m}
                </span>
              ))}
            </div>
            {detail.secondaryMuscles.length > 0 && (
              <>
                <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mt-3 mb-2">Secondary</p>
                <div className="flex flex-wrap gap-1.5">
                  {detail.secondaryMuscles.map((m) => (
                    <span key={m} className="text-[11px] bg-white/[0.05] text-white/40 px-2.5 py-0.5 rounded-full capitalize">
                      {m}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Instructions */}
          <div className="mb-5">
            <p className="text-[10px] text-white/30 uppercase tracking-[0.15em] font-semibold mb-3">Instructions</p>
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <div key={i} className="h-4 bg-white/[0.06] rounded-lg animate-pulse" />)}
              </div>
            ) : (
              <ol className="space-y-3">
                {(detail.instructions ?? []).map((step, i) => (
                  <li key={i} className="flex gap-3 group/step">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-lime-400/10 text-lime-400 text-[10px] font-bold flex items-center justify-center mt-0.5 border border-lime-400/20">
                      {i + 1}
                    </span>
                    <p className="text-[13px] text-white/60 leading-relaxed group-hover/step:text-white/80 transition-colors">{step}</p>
                  </li>
                ))}
              </ol>
            )}
          </div>

          {/* CTA */}
          {inWorkout && onAddToWorkout && (
            <button
              onClick={() => { onAddToWorkout(); onClose(); }}
              className="w-full bg-lime-400 text-black font-bold py-3.5 rounded-2xl hover:bg-lime-300 active:scale-[0.98] transition-all text-sm tracking-wide"
            >
              + Add to Workout
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// â”€â”€â”€ Browse Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
      {/* Search bar */}
      <div className="flex gap-2 mb-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-white/25" />
          <input
            type="text"
            placeholder="Search 873 exercisesâ€¦"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-xl pl-10 pr-10 py-2.5 text-sm text-white placeholder-white/25 focus:outline-none focus:border-white/20 focus:bg-white/[0.06] transition-all"
          />
          {q && (
            <button onClick={() => setQ("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`relative flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border text-sm font-medium transition-all ${
            showFilters || hasFilters
              ? "bg-lime-400/10 border-lime-400/30 text-lime-400"
              : "bg-white/[0.04] border-white/[0.08] text-white/40 hover:border-white/15 hover:text-white/60"
          }`}
        >
          <Filter className="w-4 h-4" />
          {hasFilters && (
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-lime-400" />
          )}
        </button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-4 p-4 bg-white/[0.03] border border-white/[0.07] rounded-2xl">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Category", value: category, set: setCategory, options: categories },
              { label: "Level",    value: level,    set: setLevel,    options: levels },
              { label: "Equipment",value: equip,    set: setEquip,    options: equipment },
              { label: "Muscle",   value: muscle,   set: setMuscle,   options: muscles },
            ].map(({ label, value, set, options }) => (
              <div key={label}>
                <label className="text-[10px] text-white/30 uppercase tracking-[0.12em] font-semibold block mb-1.5">{label}</label>
                <select
                  value={value}
                  onChange={(e) => { set(e.target.value); setOffset(0); }}
                  className="w-full bg-white/[0.05] border border-white/[0.08] rounded-xl px-3 py-2 text-xs text-white/70 focus:outline-none focus:border-white/20 appearance-none capitalize cursor-pointer"
                >
                  <option value="">All</option>
                  {options.map((o) => (
                    <option key={o} value={o} className="capitalize bg-neutral-900">{o.replace(/_/g, " ")}</option>
                  ))}
                </select>
              </div>
            ))}
          </div>
          {hasFilters && (
            <button
              onClick={() => { setCategory(""); setLevel(""); setEquip(""); setMuscle(""); setOffset(0); }}
              className="mt-3 w-full text-xs text-white/30 hover:text-white/60 transition-colors py-1 text-center"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Count */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-[11px] text-white/25 font-medium">
          {loading ? "Searchingâ€¦" : `${total.toLocaleString()} exercise${total !== 1 ? "s" : ""}${(q || hasFilters) ? " found" : ""}`}
        </p>
        {totalPages > 1 && (
          <p className="text-[11px] text-white/25">Page {currentPage}/{totalPages}</p>
        )}
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="bg-white/[0.03] rounded-2xl h-52 animate-pulse border border-white/[0.05]" />
          ))}
        </div>
      ) : exercises.length === 0 ? (
        <div className="text-center py-20 text-white/20">
          <Dumbbell className="w-10 h-10 mx-auto mb-3 opacity-40" />
          <p className="text-sm font-medium">No exercises found</p>
          <p className="text-xs mt-1 text-white/15">Try adjusting your filters</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4">
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
        <div className="flex items-center justify-center gap-3 mt-8">
          <button
            onClick={() => setOffset(offset - LIMIT)}
            disabled={offset === 0}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center disabled:opacity-20 hover:bg-white/[0.08] hover:border-white/15 transition-all"
          >
            <ChevronLeft className="w-4 h-4 text-white/60" />
          </button>
          <span className="text-xs text-white/30 font-medium tabular-nums">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setOffset(offset + LIMIT)}
            disabled={offset + LIMIT >= total}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center disabled:opacity-20 hover:bg-white/[0.08] hover:border-white/15 transition-all"
          >
            <ChevronRight className="w-4 h-4 text-white/60" />
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

// â”€â”€â”€ Set Row â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    <div className={`flex items-center gap-2 py-2 px-2 rounded-xl transition-colors ${set.completed ? "bg-lime-400/[0.04]" : ""}`}>
      <span className="w-5 text-center text-[11px] text-white/25 font-mono flex-shrink-0">{setNum}</span>

      {isTimeBase ? (
        <input
          type="number"
          placeholder="secs"
          value={set.durationSecs ?? ""}
          onChange={(e) => onUpdate({ durationSecs: e.target.value ? Number(e.target.value) : null })}
          className="w-20 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-lime-400/40 transition-colors"
        />
      ) : (
        <>
          <input
            type="number"
            placeholder="kg"
            value={set.weightKg ?? ""}
            onChange={(e) => onUpdate({ weightKg: e.target.value ? Number(e.target.value) : null })}
            className="w-16 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-lime-400/40 transition-colors"
          />
          <span className="text-white/20 text-xs font-bold">Ã—</span>
          <input
            type="number"
            placeholder="reps"
            value={set.reps ?? ""}
            onChange={(e) => onUpdate({ reps: e.target.value ? Number(e.target.value) : null })}
            className="w-16 bg-white/[0.05] border border-white/[0.08] rounded-lg px-2 py-1.5 text-xs text-white text-center focus:outline-none focus:border-lime-400/40 transition-colors"
          />
        </>
      )}

      <button
        onClick={() => onUpdate({ completed: !set.completed })}
        className={`ml-auto transition-all ${set.completed ? "text-lime-400 scale-110" : "text-white/20 hover:text-white/40"}`}
      >
        {set.completed ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
      </button>
      <button onClick={onDelete} className="text-white/15 hover:text-red-400 transition-colors">
        <Trash2 className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// â”€â”€â”€ Active Workout Exercise Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const completedSets = sets.filter((s) => s.completed).length;
  const progress = sets.length > 0 ? completedSets / sets.length : 0;

  async function addSet() {
    const res = await fetch(`/api/workout/sessions/${sessionId}/exercises/${we.id}/sets`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(isTimeBase ? { durationSecs: null } : { reps: null, weightKg: null }),
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

  return (
    <div className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 p-3 cursor-pointer hover:bg-white/[0.02] transition-colors"
        onClick={() => setCollapsed(!collapsed)}
      >
        {imgSrc ? (
          <img src={imgSrc} alt="" className="w-10 h-10 rounded-xl object-cover object-top flex-shrink-0" />
        ) : (
          <div className="w-10 h-10 rounded-xl bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            <Dumbbell className="w-5 h-5 text-white/20" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{we.exercise.name}</p>
          <div className="flex items-center gap-2 mt-0.5">
            <div className="flex-1 h-1 bg-white/[0.06] rounded-full overflow-hidden max-w-[80px]">
              <div
                className="h-full bg-lime-400 rounded-full transition-all duration-300"
                style={{ width: `${progress * 100}%` }}
              />
            </div>
            <p className="text-[11px] text-white/30">
              {sets.length === 0 ? "No sets" : `${completedSets}/${sets.length}`}
            </p>
          </div>
        </div>
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="text-white/15 hover:text-red-400 transition-colors mr-1 p-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
        <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-200 ${collapsed ? "" : "rotate-180"}`} />
      </div>

      {!collapsed && (
        <div className="px-3 pb-3 border-t border-white/[0.05] pt-2">
          {sets.length > 0 && (
            <div className="flex items-center gap-2 mb-1 text-[10px] text-white/20 uppercase tracking-widest pl-7">
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
            className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl border border-dashed border-white/[0.08] text-xs text-white/25 hover:text-lime-400 hover:border-lime-400/20 transition-all"
          >
            <Plus className="w-3.5 h-3.5" /> Add Set
          </button>
        </div>
      )}
    </div>
  );
}

// â”€â”€â”€ Workout Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // â”€â”€ No active session â”€â”€
  if (!activeSession) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="w-20 h-20 rounded-3xl bg-lime-400/10 border border-lime-400/20 flex items-center justify-center mb-6">
          <Zap className="w-9 h-9 text-lime-400" />
        </div>
        <h3 className="text-white font-bold text-xl mb-2">Start a Workout</h3>
        <p className="text-white/30 text-sm mb-8 max-w-xs leading-relaxed">
          Log exercises, track sets and reps, and crush your goals.
        </p>
        <input
          type="text"
          placeholder='Session name â€” e.g. "Push Day"'
          value={sessionName}
          onChange={(e) => setSessionName(e.target.value)}
          className="w-full max-w-sm bg-white/[0.04] border border-white/[0.08] rounded-2xl px-4 py-3 text-sm text-white placeholder-white/25 text-center focus:outline-none focus:border-white/20 mb-4 transition-all"
        />
        <button
          onClick={startSession}
          className="flex items-center gap-2 bg-lime-400 text-black font-bold px-8 py-3.5 rounded-2xl hover:bg-lime-300 active:scale-[0.97] transition-all text-sm tracking-wide shadow-lg shadow-lime-400/20"
        >
          <Play className="w-4 h-4 fill-black" /> Start Workout
        </button>
      </div>
    );
  }

  // â”€â”€ Browse to add exercises â”€â”€
  if (showBrowse) {
    return (
      <div>
        <div className="flex items-center gap-3 mb-5">
          <button
            onClick={() => setShowBrowse(false)}
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center hover:bg-white/[0.08] transition-all"
          >
            <ArrowLeft className="w-4 h-4 text-white/60" />
          </button>
          <div>
            <p className="text-sm font-semibold text-white">Add Exercise</p>
            <p className="text-[11px] text-white/30">{addedIds.size} added so far</p>
          </div>
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

  // â”€â”€ Active session â”€â”€
  const totalSets = workoutExercises.reduce((s, we) => s + we.sets.filter((st) => st.completed).length, 0);

  return (
    <div>
      {/* Session header card */}
      <div className="relative bg-[#111111] border border-white/[0.06] rounded-2xl p-4 mb-4 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-lime-400/[0.04] to-transparent pointer-events-none" />
        <div className="relative flex items-start justify-between mb-4">
          <div>
            <p className="text-white font-bold text-base">{activeSession.name ?? "Workout"}</p>
            <p className="text-[11px] text-white/30 mt-0.5">In progress</p>
          </div>
          <div className="flex items-center gap-1.5 bg-lime-400/10 border border-lime-400/20 rounded-full px-3 py-1.5">
            <Clock className="w-3 h-3 text-lime-400" />
            <span className="text-sm font-mono font-bold text-lime-400 tabular-nums">{formatElapsed(elapsed)}</span>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          {[
            { val: workoutExercises.length, label: "Exercises" },
            { val: totalSets, label: "Sets Done" },
            { val: `~${Math.round(elapsed / 60 * 5 + totalSets * 3)}`, label: "kcal est." },
          ].map(({ val, label }) => (
            <div key={label} className="bg-white/[0.04] rounded-xl py-2.5">
              <p className="text-lg font-bold text-white">{val}</p>
              <p className="text-[10px] text-white/25 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-2.5 mb-4">
        {workoutExercises.length === 0 ? (
          <div className="text-center py-10 text-white/20">
            <Target className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-sm">No exercises yet</p>
            <p className="text-xs mt-1 text-white/15">Tap "Add Exercise" below</p>
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
        className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl border border-dashed border-white/[0.08] text-sm text-white/30 hover:text-lime-400 hover:border-lime-400/20 transition-all mb-3"
      >
        <Plus className="w-4 h-4" /> Add Exercise
      </button>

      <button
        onClick={finishSession}
        disabled={finishing}
        className="w-full bg-lime-400 text-black font-bold py-3.5 rounded-2xl hover:bg-lime-300 active:scale-[0.98] transition-all disabled:opacity-50 text-sm tracking-wide shadow-lg shadow-lime-400/15"
      >
        {finishing ? "Savingâ€¦" : "Finish Workout"}
      </button>
    </div>
  );
}

// â”€â”€â”€ History Tab â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
          <div key={i} className="h-20 bg-white/[0.03] rounded-2xl animate-pulse border border-white/[0.05]" />
        ))}
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div className="text-center py-20 text-white/20">
        <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-30" />
        <p className="text-sm font-medium">No workouts yet</p>
        <p className="text-xs mt-1 text-white/15">Complete your first workout to see history</p>
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
    <div className="space-y-5">
      {Object.entries(grouped).map(([date, daySessions]) => (
        <div key={date}>
          <p className="text-[10px] text-white/25 uppercase tracking-[0.15em] font-semibold mb-2.5 flex items-center gap-2">
            <Calendar className="w-3 h-3" />
            {new Date(date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" })}
          </p>
          <div className="space-y-2">
            {daySessions.map((s) => (
              <div key={s.id} className="bg-[#111111] border border-white/[0.06] rounded-2xl overflow-hidden">
                <div
                  className="flex items-center gap-3 p-3.5 cursor-pointer hover:bg-white/[0.02] transition-colors"
                  onClick={() => setExpanded(expanded === s.id ? null : s.id)}
                >
                  <div className="w-10 h-10 rounded-xl bg-lime-400/10 border border-lime-400/15 flex items-center justify-center flex-shrink-0">
                    <Activity className="w-4 h-4 text-lime-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white">{s.name ?? "Workout"}</p>
                    <p className="text-[11px] text-white/30 mt-0.5">
                      {s.exercises.length} exercise{s.exercises.length !== 1 ? "s" : ""}
                      {s.durationMins ? ` Â· ${formatDuration(s.durationMins)}` : ""}
                    </p>
                  </div>
                  {s.caloriesBurned ? (
                    <div className="text-right mr-1">
                      <div className="flex items-center gap-1 text-orange-400 justify-end">
                        <Flame className="w-3 h-3" />
                        <span className="text-sm font-bold tabular-nums">{s.caloriesBurned}</span>
                      </div>
                      <p className="text-[10px] text-white/20">kcal</p>
                    </div>
                  ) : null}
                  <ChevronDown className={`w-4 h-4 text-white/20 transition-transform duration-200 ${expanded === s.id ? "rotate-180" : ""}`} />
                </div>

                {expanded === s.id && s.exercises.length > 0 && (
                  <div className="border-t border-white/[0.05] px-3.5 py-2">
                    {s.exercises.map((we) => {
                      const imgSrc = we.exercise.images[0] ? `${IMG_BASE}${we.exercise.images[0]}` : null;
                      return (
                        <div key={we.id} className="flex items-center gap-2.5 py-2 border-b border-white/[0.04] last:border-0">
                          {imgSrc ? (
                            <img src={imgSrc} alt="" className="w-8 h-8 rounded-lg object-cover object-top flex-shrink-0" />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-white/[0.04] flex items-center justify-center flex-shrink-0">
                              <Dumbbell className="w-3.5 h-3.5 text-white/20" />
                            </div>
                          )}
                          <p className="flex-1 text-xs text-white/60 font-medium">{we.exercise.name}</p>
                          <p className="text-[11px] text-white/25">{we.sets.length} set{we.sets.length !== 1 ? "s" : ""}</p>
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

// â”€â”€â”€ Root Component â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
    { id: "browse",  label: "Browse",  icon: <Search className="w-3.5 h-3.5" /> },
    { id: "workout", label: "Workout", icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "history", label: "History", icon: <BarChart2 className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="min-h-screen bg-[#080808] px-4 sm:px-6 lg:px-8 pt-[88px] pb-10 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-9 h-9 rounded-xl bg-lime-400/10 border border-lime-400/15 flex items-center justify-center">
            <Dumbbell className="w-4.5 h-4.5 text-lime-400" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-tight">Exercise Library</h1>
            <p className="text-[11px] text-white/25 font-medium">
              {initialTotal.toLocaleString()} exercises Â· browse, log, track
            </p>
          </div>
        </div>
      </div>

      {/* Tab bar */}
      <div className="flex bg-white/[0.03] border border-white/[0.07] rounded-2xl p-1 mb-6 gap-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
              tab === t.id
                ? "bg-lime-400 text-black shadow-sm shadow-lime-400/20"
                : "text-white/30 hover:text-white/60"
            }`}
          >
            {t.icon}
            <span className="hidden sm:inline tracking-wide">{t.label}</span>
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


