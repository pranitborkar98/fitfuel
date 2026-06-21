// lib/exercise-program.ts
// EX-1: the exercise SYSTEM generator. Given the live Exercise pool + a plan's
// (subCategory, tier), it produces a 7-day program of protocol blocks — strength,
// LISS cardio, HIIT, calisthenics, mobility — selecting real exercises from the
// library. Output is the exact day-JSON shape the workout routes already read
// ({ exerciseId, name, sets, reps?, durationSecs?, restSecs, notes?, protocol? }),
// so nothing downstream changes. Deterministic per (subCategory|tier) so reseeds
// are stable.

export interface PoolExercise {
  id: string;
  name: string;
  modality: string; // strength | cardio | hiit | calisthenics | mobility | sport
  met: number;
  category: string;
  equipment: string | null;
  primaryMuscles: string[];
  level: string; // beginner | intermediate | expert
}

export interface PlannedExercise {
  exerciseId: string;
  name: string;
  sets: number;
  reps?: number;
  durationSecs?: number;
  restSecs: number;
  protocol?: string; // straight | circuit | hiit | mobility | cardio
  notes?: string;
}

export interface PlannedDay {
  dayOfWeek: string;
  focusArea: string;
  estimatedCalories: number;
  isRestDay: boolean;
  exercises: PlannedExercise[];
}

export interface GeneratedProgram {
  name: string;
  description: string;
  daysPerWeek: number;
  sessionDurationMins: number;
  weeklyStructure: Record<string, string[]>;
  days: PlannedDay[];
}

type Tier = "STANDARD" | "PREMIUM" | "LUXURY";
type Archetype = "fatloss" | "muscle" | "medical" | "athletic" | "general";

const WEEKDAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const PUSH = ["chest", "shoulders", "triceps"];
const PULL = ["lats", "middle back", "biceps", "traps", "lower back"];
const LEGS = ["quadriceps", "hamstrings", "glutes", "calves", "abductors", "adductors"];
const CORE = ["abdominals"];
const REF_WEIGHT_KG = 70; // reference bodyweight for the stored estimate (runtime recomputes per user)

// ── deterministic RNG (mulberry32) so reseeds are stable ──
function makeRng(seedStr: string) {
  let h = 1779033703 ^ seedStr.length;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rand: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function archetypeFor(subCategory: string): Archetype {
  const s = (subCategory || "").toLowerCase();
  if (/(loss|lean|cut|slim|fat|weight_loss)/.test(s)) return "fatloss";
  if (/(muscle|gain|strength|hypertroph|mass|bulk|build|physique)/.test(s)) return "muscle";
  if (/(pcos|diabet|thyroid|heart|cardiac|surgery|recovery|medical|clinical|hypertension|cholesterol|liver|kidney|senior|prenatal|postnatal|bp)/.test(s))
    return "medical";
  if (/(sport|athlet|performance|endurance|run|cricket|football|agility|power)/.test(s)) return "athletic";
  return "general";
}

interface Plan {
  daysPerWeek: number;
  sessionMins: number;
  intensity: number; // 0.85 medical … 1.15 muscle/athletic — scales sets/reps
  sequence: SlotKind[];
}

type SlotKind =
  | "full_body"
  | "upper"
  | "lower"
  | "push"
  | "pull"
  | "legs"
  | "liss"
  | "hiit"
  | "core"
  | "mobility"
  | "conditioning";

function planFor(arch: Archetype, tier: Tier): Plan {
  const bump = tier === "LUXURY" ? 2 : tier === "PREMIUM" ? 1 : 0;
  switch (arch) {
    case "fatloss":
      return {
        daysPerWeek: Math.min(6, 4 + bump),
        sessionMins: 40 + bump * 5,
        intensity: 1.0,
        sequence: (["full_body", "liss", "hiit", "full_body", "liss", "core"] as SlotKind[]).slice(0, Math.min(6, 4 + bump)),
      };
    case "muscle":
      return {
        daysPerWeek: Math.min(6, 4 + bump),
        sessionMins: 50 + bump * 5,
        intensity: 1.15,
        sequence: (["push", "pull", "legs", "upper", "lower", "core"] as SlotKind[]).slice(0, Math.min(6, 4 + bump)),
      };
    case "medical":
      return {
        daysPerWeek: Math.min(5, 3 + bump),
        sessionMins: 30 + bump * 5,
        intensity: 0.85,
        sequence: (["full_body", "liss", "mobility", "full_body", "liss"] as SlotKind[]).slice(0, Math.min(5, 3 + bump)),
      };
    case "athletic":
      return {
        daysPerWeek: Math.min(6, 4 + bump),
        sessionMins: 50 + bump * 5,
        intensity: 1.15,
        sequence: (["lower", "conditioning", "upper", "hiit", "full_body", "mobility"] as SlotKind[]).slice(0, Math.min(6, 4 + bump)),
      };
    default:
      return {
        daysPerWeek: Math.min(5, 3 + bump),
        sessionMins: 40 + bump * 5,
        intensity: 1.0,
        sequence: (["full_body", "liss", "upper", "lower", "core"] as SlotKind[]).slice(0, Math.min(5, 3 + bump)),
      };
  }
}

// Spread `count` training days across the 7-day week with rests interleaved.
function layoutWeek(count: number): boolean[] {
  const layout = new Array(7).fill(false);
  if (count >= 7) return new Array(7).fill(true);
  const step = 7 / count;
  for (let i = 0; i < count; i++) layout[Math.floor(i * step)] = true;
  let have = layout.filter(Boolean).length;
  for (let i = 0; i < 7 && have < count; i++)
    if (!layout[i]) {
      layout[i] = true;
      have++;
    }
  return layout;
}

interface Pickable {
  modality?: string;
  modalities?: string[];
  muscles?: string[];
  n: number;
}
function pick(pool: PoolExercise[], opts: Pickable, rand: () => number, used: Set<string>): PoolExercise[] {
  const mods = opts.modalities ?? (opts.modality ? [opts.modality] : undefined);
  let cands = pool.filter((e) => {
    if (used.has(e.id)) return false;
    if (mods && !mods.includes(e.modality)) return false;
    if (opts.muscles && !e.primaryMuscles.some((m) => opts.muscles!.includes(m))) return false;
    return true;
  });
  // fallback: drop the muscle filter if too few candidates
  if (cands.length < opts.n && opts.muscles) {
    cands = pool.filter((e) => !used.has(e.id) && (!mods || mods.includes(e.modality)));
  }
  const chosen = shuffle(cands, rand).slice(0, opts.n);
  chosen.forEach((e) => used.add(e.id));
  return chosen;
}

function resistance(
  pool: PoolExercise[],
  muscles: string[],
  count: number,
  intensity: number,
  rand: () => number,
  used: Set<string>
): PlannedExercise[] {
  const ex = pick(pool, { modalities: ["strength", "calisthenics"], muscles, n: count }, rand, used);
  const sets = Math.round(3 * intensity);
  const reps = intensity >= 1.15 ? 10 : intensity <= 0.85 ? 15 : 12;
  const rest = intensity >= 1.15 ? 75 : 45;
  return ex.map((e) => ({
    exerciseId: e.id,
    name: e.name,
    sets: Math.max(2, sets),
    reps,
    restSecs: rest,
    protocol: "straight",
  }));
}

function lissBlock(pool: PoolExercise[], mins: number, rand: () => number, used: Set<string>): PlannedExercise[] {
  const ex = pick(pool, { modalities: ["cardio"], n: 1 }, rand, used);
  if (!ex.length) return [];
  return [
    {
      exerciseId: ex[0].id,
      name: ex[0].name,
      sets: 1,
      durationSecs: Math.round(mins * 60),
      restSecs: 0,
      protocol: "cardio",
      notes: `${mins} min steady, moderate pace`,
    },
  ];
}

function hiitBlock(pool: PoolExercise[], rounds: number, rand: () => number, used: Set<string>): PlannedExercise[] {
  const ex = pick(pool, { modalities: ["hiit", "cardio", "calisthenics"], n: 4 }, rand, used);
  return ex.map((e, i) => ({
    exerciseId: e.id,
    name: e.name,
    sets: rounds,
    durationSecs: 40,
    restSecs: 20,
    protocol: "hiit",
    notes: i === 0 ? `${rounds} rounds · 40s work / 20s rest` : undefined,
  }));
}

function coreBlock(pool: PoolExercise[], count: number, rand: () => number, used: Set<string>): PlannedExercise[] {
  const ex = pick(pool, { muscles: CORE, modalities: ["strength", "calisthenics"], n: count }, rand, used);
  return ex.map((e) => ({
    exerciseId: e.id,
    name: e.name,
    sets: 3,
    durationSecs: 40,
    restSecs: 25,
    protocol: "circuit",
  }));
}

function mobilityBlock(pool: PoolExercise[], count: number, rand: () => number, used: Set<string>): PlannedExercise[] {
  const ex = pick(pool, { modalities: ["mobility"], n: count }, rand, used);
  return ex.map((e) => ({
    exerciseId: e.id,
    name: e.name,
    sets: 1,
    durationSecs: 45,
    restSecs: 15,
    protocol: "mobility",
  }));
}

function buildSession(
  kind: SlotKind,
  pool: PoolExercise[],
  intensity: number,
  rand: () => number
): { focus: string; exercises: PlannedExercise[] } {
  const used = new Set<string>();
  switch (kind) {
    case "full_body":
      return {
        focus: "Full Body Strength",
        exercises: [
          ...resistance(pool, LEGS, 2, intensity, rand, used),
          ...resistance(pool, PUSH, 1, intensity, rand, used),
          ...resistance(pool, PULL, 1, intensity, rand, used),
          ...coreBlock(pool, 1, rand, used),
        ],
      };
    case "upper":
      return {
        focus: "Upper Body",
        exercises: [
          ...resistance(pool, PUSH, 2, intensity, rand, used),
          ...resistance(pool, PULL, 2, intensity, rand, used),
        ],
      };
    case "lower":
      return {
        focus: "Lower Body",
        exercises: [...resistance(pool, LEGS, 3, intensity, rand, used), ...coreBlock(pool, 1, rand, used)],
      };
    case "push":
      return { focus: "Push (Chest · Shoulders · Triceps)", exercises: resistance(pool, PUSH, 4, intensity, rand, used) };
    case "pull":
      return { focus: "Pull (Back · Biceps)", exercises: resistance(pool, PULL, 4, intensity, rand, used) };
    case "legs":
      return { focus: "Legs", exercises: resistance(pool, LEGS, 4, intensity, rand, used) };
    case "liss":
      return { focus: "Steady-State Cardio (LISS)", exercises: lissBlock(pool, 35, rand, used) };
    case "hiit":
      return { focus: "HIIT Conditioning", exercises: hiitBlock(pool, 5, rand, used) };
    case "conditioning":
      return {
        focus: "Conditioning",
        exercises: [...hiitBlock(pool, 4, rand, used), ...lissBlock(pool, 15, rand, used)],
      };
    case "core":
      return {
        focus: "Core + Mobility",
        exercises: [...coreBlock(pool, 3, rand, used), ...mobilityBlock(pool, 2, rand, used)],
      };
    case "mobility":
      return { focus: "Mobility + Recovery", exercises: mobilityBlock(pool, 6, rand, used) };
    default:
      return {
        focus: "Full Body Strength",
        exercises: resistance(pool, [...PUSH, ...PULL, ...LEGS], 4, intensity, rand, used),
      };
  }
}

// MET-minute calorie estimate at reference bodyweight (runtime recomputes per user).
function estimateCalories(exercises: PlannedExercise[], pool: PoolExercise[]): number {
  const metById = new Map(pool.map((e) => [e.id, e.met]));
  let metMinutes = 0;
  for (const x of exercises) {
    const met = metById.get(x.exerciseId) ?? 4.0;
    const workSecs = x.durationSecs && x.durationSecs > 0 ? x.durationSecs : (x.reps ?? 12) * 3;
    const mins = (x.sets * (workSecs + x.restSecs)) / 60;
    metMinutes += met * mins;
  }
  return Math.round((metMinutes * 3.5 * REF_WEIGHT_KG) / 200);
}

export function generateProgram(opts: { subCategory: string; tier: Tier; pool: PoolExercise[] }): GeneratedProgram {
  const arch = archetypeFor(opts.subCategory);
  const plan = planFor(arch, opts.tier);
  const rand = makeRng(`${opts.subCategory}|${opts.tier}`);
  const layout = layoutWeek(plan.daysPerWeek);

  const days: PlannedDay[] = [];
  const weeklyStructure: Record<string, string[]> = {};
  let trainIdx = 0;

  for (let d = 0; d < 7; d++) {
    const dow = WEEKDAYS[d];
    if (!layout[d]) {
      days.push({ dayOfWeek: dow, focusArea: "Rest", estimatedCalories: 0, isRestDay: true, exercises: [] });
      weeklyStructure[dow.slice(0, 3)] = ["rest"];
      continue;
    }
    const kind = plan.sequence[trainIdx % plan.sequence.length];
    trainIdx++;
    const session = buildSession(kind, opts.pool, plan.intensity, rand);
    const estimatedCalories = estimateCalories(session.exercises, opts.pool);
    days.push({
      dayOfWeek: dow,
      focusArea: session.focus,
      estimatedCalories,
      isRestDay: false,
      exercises: session.exercises,
    });
    weeklyStructure[dow.slice(0, 3)] = [kind];
  }

  const archLabel: Record<Archetype, string> = {
    fatloss: "Fat Loss",
    muscle: "Muscle & Strength",
    medical: "Gentle / Condition-Safe",
    athletic: "Athletic Performance",
    general: "General Fitness",
  };
  const tierLabel = opts.tier.charAt(0) + opts.tier.slice(1).toLowerCase();

  return {
    name: `${archLabel[arch]} ${plan.daysPerWeek}-Day Program (${tierLabel})`,
    description: `Auto-generated ${plan.daysPerWeek}-day ${archLabel[arch].toLowerCase()} program for ${opts.subCategory.replace(/_/g, " ")} · ${tierLabel} tier. Strength, cardio, HIIT and mobility balanced to the goal.`,
    daysPerWeek: plan.daysPerWeek,
    sessionDurationMins: plan.sessionMins,
    weeklyStructure,
    days,
  };
}