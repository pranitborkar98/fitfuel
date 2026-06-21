/* eslint-disable @typescript-eslint/no-explicit-any */
import "dotenv/config"; // ← load .env so DATABASE_URL is set before lib/prisma builds the pool
// prisma/seed-exercises-curated.ts
// EX-1b: curated cardio / HIIT / calisthenics / sport exercises that the
// free-exercise-db lacks (it has only 14 cardio and no progression chains).
// Namespaced `ff-` so ids never collide with free-db. Idempotent (upsert by id).
// Sets modality + met DIRECTLY, and uses category strings the modality backfill
// ignores (hiit/calisthenics/sport) so a backfill re-run won't clobber these.
//
//   npx tsx prisma/seed-exercises-curated.ts
//
// Run order: free-db seed → backfill-exercise-modality → THIS → seed-all-exercise-schedules.

import { prisma } from "../lib/prisma";

const db = prisma as any;

type Row = {
  id: string;
  name: string;
  category: string; // cardio | hiit | calisthenics | sport
  modality: string;
  met: number;
  level: string; // beginner | intermediate | expert
  equipment?: string;
  primaryMuscles: string[];
  secondaryMuscles?: string[];
  instructions: string[];
  force?: string;
  mechanic?: string;
  progressionGroup?: string;
  progressionLevel?: number;
};

// ── CARDIO ──────────────────────────────────────────────────────────────────
const CARDIO: Row[] = [
  ["jump-rope", "Jump Rope", 12, "beginner", "other", ["calves"], "Skip rope at a steady cadence; stay light on the balls of your feet."],
  ["running-outdoor", "Running (Outdoor)", 9.8, "beginner", "none", ["quadriceps", "hamstrings"], "Run at a conversational-to-moderate pace."],
  ["brisk-walking", "Brisk Walking", 4.3, "beginner", "none", ["quadriceps"], "Walk briskly enough to raise your breathing."],
  ["incline-walk", "Incline Treadmill Walk", 6.0, "beginner", "machine", ["glutes", "calves"], "Set 8–12% incline at a brisk walk; keep HR moderate."],
  ["sprint-intervals", "Sprint Intervals", 13.0, "intermediate", "none", ["hamstrings", "quadriceps"], "Alternate near-max sprints with walk-back recovery."],
  ["cycling-outdoor", "Cycling (Outdoor)", 8.0, "beginner", "other", ["quadriceps", "calves"], "Ride at a steady moderate effort."],
  ["swimming", "Swimming", 8.3, "intermediate", "none", ["lats", "shoulders"], "Swim continuous laps at a steady pace."],
  ["stair-climbing", "Stair Climbing", 8.0, "beginner", "none", ["glutes", "quadriceps"], "Climb stairs continuously at a steady pace."],
  ["shadow-boxing", "Shadow Boxing", 7.0, "beginner", "none", ["shoulders"], "Throw continuous controlled combinations; stay moving."],
  ["cardio-dance", "Cardio Dance", 6.5, "beginner", "none", ["quadriceps"], "Follow a continuous dance routine to keep HR up."],
  ["kickboxing-cardio", "Kickboxing Cardio", 9.5, "intermediate", "none", ["shoulders", "abdominals"], "Continuous punch–kick combinations at pace."],
  ["rowing-erg", "Rowing (Erg)", 8.5, "beginner", "machine", ["lats", "quadriceps"], "Drive with legs, then back, then arms; recover in reverse."],
  ["elliptical", "Elliptical Trainer", 6.5, "beginner", "machine", ["quadriceps", "glutes"], "Maintain a steady stride with light resistance."],
  ["spin-bike", "Spin Bike", 8.5, "intermediate", "machine", ["quadriceps"], "Hold a steady cadence with moderate resistance."],
  ["step-ups-cardio", "Step-Ups (Cardio)", 6.0, "beginner", "other", ["glutes", "quadriceps"], "Step up and down on a box at a continuous rhythm."],
  ["marching-in-place", "Marching In Place", 4.0, "beginner", "none", ["quadriceps"], "March with high-ish knees; a gentle warm-up cardio."],
].map(makeRow("cardio", "cardio"));

// ── HIIT ────────────────────────────────────────────────────────────────────
const HIIT: Row[] = [
  ["burpees", "Burpees", 10.0, "intermediate", ["chest", "quadriceps"], "Squat, kick to plank, push-up, jump back up and leap."],
  ["mountain-climbers-hiit", "Mountain Climbers", 8.0, "beginner", ["abdominals"], "From plank, drive knees to chest alternately at pace."],
  ["high-knees", "High Knees", 8.0, "beginner", ["quadriceps", "abdominals"], "Run in place driving knees to hip height."],
  ["butt-kicks", "Butt Kicks", 7.5, "beginner", ["hamstrings"], "Run in place kicking heels to glutes."],
  ["squat-jumps", "Squat Jumps", 10.0, "intermediate", ["quadriceps", "glutes"], "Squat then explode up; land soft and repeat."],
  ["jump-lunges", "Jumping Lunges", 10.0, "intermediate", ["quadriceps", "glutes"], "Lunge, jump and switch legs in mid-air."],
  ["skater-jumps", "Skater Jumps", 9.0, "intermediate", ["glutes", "abductors"], "Bound side to side landing on one leg."],
  ["tuck-jumps", "Tuck Jumps", 10.0, "intermediate", ["quadriceps"], "Jump and pull knees toward chest; land soft."],
  ["plank-jacks", "Plank Jacks", 7.0, "beginner", ["abdominals"], "In plank, jump feet wide and back together."],
  ["sprawls", "Sprawls", 9.0, "intermediate", ["abdominals", "chest"], "Drop to plank and snap back to standing (no push-up)."],
  ["star-jumps", "Star Jumps", 8.0, "beginner", ["shoulders", "quadriceps"], "Explode from a crouch into a wide star shape."],
  ["bear-crawl", "Bear Crawl", 7.0, "beginner", ["shoulders", "abdominals"], "Crawl on hands and feet, knees just off the floor."],
  ["jumping-jacks", "Jumping Jacks", 8.0, "beginner", ["shoulders", "calves"], "Jump feet wide while raising arms overhead."],
  ["broad-jumps", "Broad Jumps", 9.0, "intermediate", ["glutes", "hamstrings"], "Jump forward for distance; land soft and reset."],
  ["lateral-shuffle", "Lateral Shuffle", 8.0, "beginner", ["abductors", "quadriceps"], "Shuffle side to side in an athletic stance."],
  ["fast-feet", "Fast Feet", 8.0, "beginner", ["calves"], "Chop feet as fast as possible in a low stance."],
].map(makeRowNoEq("hiit", "hiit", "body only"));

// ── CALISTHENICS (with progression chains) ───────────────────────────────────
const CALISTHENICS: Row[] = [
  // push chain
  cal("wall-pushup", "Wall Push-Up", 3.5, "beginner", ["chest", "triceps"], "Push-up against a wall — easiest entry.", "pushup", 1),
  cal("incline-pushup", "Incline Push-Up", 3.8, "beginner", ["chest", "triceps"], "Hands elevated on a bench; push-up.", "pushup", 2),
  cal("knee-pushup", "Knee Push-Up", 4.0, "beginner", ["chest", "triceps"], "Push-up from the knees.", "pushup", 3),
  cal("full-pushup", "Push-Up", 4.0, "beginner", ["chest", "triceps"], "Standard push-up, body in a straight line.", "pushup", 4),
  cal("diamond-pushup", "Diamond Push-Up", 4.5, "intermediate", ["triceps", "chest"], "Hands together under chest; push-up.", "pushup", 5),
  cal("archer-pushup", "Archer Push-Up", 5.0, "intermediate", ["chest", "triceps"], "Shift weight to one arm, the other stays straight.", "pushup", 6),
  cal("pike-pushup", "Pike Push-Up", 5.0, "intermediate", ["shoulders", "triceps"], "Hips high, push-up targeting shoulders.", "pushup", 7),
  cal("one-arm-pushup", "One-Arm Push-Up", 6.0, "expert", ["chest", "triceps"], "Push-up on a single arm, feet wide.", "pushup", 8),
  // pull chain
  cal("dead-hang", "Dead Hang", 3.0, "beginner", ["lats", "forearms"], "Hang from a bar with active shoulders.", "pullup", 1),
  cal("scap-pull", "Scapular Pull", 3.5, "beginner", ["lats", "traps"], "From a hang, depress shoulder blades; small range.", "pullup", 2),
  cal("negative-pullup", "Negative Pull-Up", 4.5, "beginner", ["lats", "biceps"], "Jump to top, lower slowly under control.", "pullup", 3),
  cal("assisted-pullup", "Assisted Pull-Up", 4.5, "beginner", ["lats", "biceps"], "Band- or foot-assisted pull-up.", "pullup", 4),
  cal("pullup", "Pull-Up", 5.0, "intermediate", ["lats", "biceps"], "Full dead-hang pull-up, chin over bar.", "pullup", 5),
  cal("archer-pullup", "Archer Pull-Up", 5.5, "expert", ["lats", "biceps"], "Pull to one side; the other arm stays straight.", "pullup", 6),
  cal("muscle-up", "Muscle-Up", 6.5, "expert", ["lats", "triceps"], "Explosive pull-up transitioning over the bar.", "pullup", 7),
  // squat chain
  cal("assisted-squat", "Assisted Squat", 4.0, "beginner", ["quadriceps", "glutes"], "Hold support; sit to a box and stand.", "squat", 1),
  cal("bodyweight-squat", "Bodyweight Squat", 4.5, "beginner", ["quadriceps", "glutes"], "Squat to parallel, chest up.", "squat", 2),
  cal("split-squat", "Split Squat", 4.5, "beginner", ["quadriceps", "glutes"], "Static lunge stance; lower the back knee.", "squat", 3),
  cal("bulgarian-split-squat", "Bulgarian Split Squat", 5.0, "intermediate", ["quadriceps", "glutes"], "Rear foot elevated; lower under control.", "squat", 4),
  cal("shrimp-squat", "Shrimp Squat", 5.5, "expert", ["quadriceps", "glutes"], "Single-leg squat holding the rear foot.", "squat", 5),
  cal("pistol-squat", "Pistol Squat", 6.0, "expert", ["quadriceps", "glutes"], "Full single-leg squat, other leg extended.", "squat", 6),
  // dip chain
  cal("bench-dip", "Bench Dip", 4.0, "beginner", ["triceps", "chest"], "Hands on a bench behind you; dip down.", "dip", 1),
  cal("straight-bar-dip", "Straight Bar Dip", 4.5, "intermediate", ["triceps", "chest"], "Dip over a single bar, lean forward.", "dip", 2),
  cal("parallel-dip", "Parallel Bar Dip", 5.0, "intermediate", ["chest", "triceps"], "Dip on parallel bars to depth.", "dip", 3),
  cal("ring-dip", "Ring Dip", 6.0, "expert", ["chest", "triceps"], "Dip on gymnastic rings; control the wobble.", "dip", 4),
  // core chain
  cal("dead-bug", "Dead Bug", 3.0, "beginner", ["abdominals"], "On back, extend opposite arm and leg slowly.", "core", 1),
  cal("hollow-hold", "Hollow Hold", 3.5, "beginner", ["abdominals"], "On back, press low back down, hold a dish shape.", "core", 2),
  cal("leg-raises", "Lying Leg Raises", 3.5, "beginner", ["abdominals"], "On back, raise straight legs and lower slowly.", "core", 3),
  cal("hanging-knee-raise", "Hanging Knee Raise", 4.0, "intermediate", ["abdominals"], "From a bar hang, raise knees to chest.", "core", 4),
  cal("hanging-leg-raise", "Hanging Leg Raise", 4.5, "intermediate", ["abdominals"], "From a hang, raise straight legs to horizontal.", "core", 5),
  cal("l-sit", "L-Sit", 5.0, "expert", ["abdominals"], "Support on hands, hold legs out straight.", "core", 6),
  // handstand chain
  cal("pike-hold", "Pike Hold", 4.0, "beginner", ["shoulders"], "Hips high in a pike, weight over hands.", "handstand", 1),
  cal("wall-handstand", "Wall Handstand", 5.0, "intermediate", ["shoulders"], "Kick to a handstand against a wall, hold.", "handstand", 2),
  cal("freestanding-handstand", "Freestanding Handstand", 6.0, "expert", ["shoulders"], "Balance a handstand without support.", "handstand", 3),
  cal("handstand-pushup", "Handstand Push-Up", 6.5, "expert", ["shoulders", "triceps"], "Wall-supported handstand; bend and press.", "handstand", 4),
];

// ── SPORT / AGILITY / CONDITIONING ───────────────────────────────────────────
const SPORT: Row[] = [
  ["box-jump", "Box Jump", 8.0, "intermediate", "other", ["quadriceps", "glutes"], "Explode onto a box; step down to reset."],
  ["depth-jump", "Depth Jump", 9.0, "expert", "other", ["quadriceps"], "Step off a box and immediately rebound up."],
  ["battle-ropes", "Battle Ropes", 9.0, "intermediate", "other", ["shoulders", "forearms"], "Drive continuous waves down the ropes."],
  ["med-ball-slam", "Medicine Ball Slam", 8.0, "beginner", "medicine ball", ["abdominals", "lats"], "Slam the ball down explosively; catch and repeat."],
  ["agility-ladder", "Agility Ladder Run", 8.0, "beginner", "other", ["calves", "quadriceps"], "Quick feet through ladder rungs."],
  ["cone-weave", "Cone Weave Drill", 8.0, "beginner", "other", ["abductors", "quadriceps"], "Weave through cones changing direction sharply."],
  ["shuttle-run", "Shuttle Run", 9.0, "intermediate", "none", ["hamstrings", "quadriceps"], "Sprint to a line, touch, sprint back; repeat."],
  ["lateral-bound", "Lateral Bound", 8.5, "intermediate", "none", ["glutes", "abductors"], "Bound sideways for distance, stick the landing."],
  ["sled-push", "Sled Push", 9.0, "intermediate", "other", ["quadriceps", "glutes"], "Drive a loaded sled with low, hard steps."],
  ["farmers-carry", "Farmer's Carry", 6.0, "beginner", "dumbbell", ["forearms", "traps"], "Walk carrying heavy weight in each hand, braced."],
  ["sledgehammer", "Sledgehammer Swings", 8.0, "intermediate", "other", ["abdominals", "shoulders"], "Swing a hammer to a tire, alternating sides."],
  ["sprint", "Sprint", 13.0, "intermediate", "none", ["hamstrings", "quadriceps"], "Maximal-effort short sprint."],
].map(makeRow("sport", "sport"));

// helpers ─────────────────────────────────────────────────────────────────────
function makeRow(category: string, modality: string) {
  return (t: any[]): Row => ({
    id: `ff-${t[0]}`,
    name: t[1],
    category,
    modality,
    met: t[2],
    level: t[3],
    equipment: t[4],
    primaryMuscles: t[5],
    instructions: [t[6]],
    images: [] as any,
  } as Row);
}
function makeRowNoEq(category: string, modality: string, equipment: string) {
  return (t: any[]): Row => ({
    id: `ff-${t[0]}`,
    name: t[1],
    category,
    modality,
    met: t[2],
    level: t[3],
    equipment,
    primaryMuscles: t[4],
    instructions: [t[5]],
    images: [] as any,
  } as Row);
}
function cal(
  id: string,
  name: string,
  met: number,
  level: string,
  primaryMuscles: string[],
  instruction: string,
  progressionGroup: string,
  progressionLevel: number
): Row {
  return {
    id: `ff-${id}`,
    name,
    category: "calisthenics",
    modality: "calisthenics",
    met,
    level,
    equipment: "body only",
    primaryMuscles,
    instructions: [instruction],
    progressionGroup,
    progressionLevel,
  };
}

const ALL: Row[] = [...CARDIO, ...HIIT, ...CALISTHENICS, ...SPORT];

async function main() {
  console.log(`⏳ Seeding ${ALL.length} curated exercises (cardio/hiit/calisthenics/sport)...`);
  let up = 0;
  for (const r of ALL) {
    await db.exercise.upsert({
      where: { id: r.id },
      update: {
        name: r.name,
        category: r.category,
        modality: r.modality,
        met: r.met,
        level: r.level,
        equipment: r.equipment ?? null,
        primaryMuscles: r.primaryMuscles,
        secondaryMuscles: r.secondaryMuscles ?? [],
        instructions: r.instructions,
        progressionGroup: r.progressionGroup ?? null,
        progressionLevel: r.progressionLevel ?? null,
      },
      create: {
        id: r.id,
        name: r.name,
        category: r.category,
        level: r.level,
        force: r.force ?? null,
        mechanic: r.mechanic ?? null,
        equipment: r.equipment ?? null,
        primaryMuscles: r.primaryMuscles,
        secondaryMuscles: r.secondaryMuscles ?? [],
        instructions: r.instructions,
        images: [],
        modality: r.modality,
        met: r.met,
        progressionGroup: r.progressionGroup ?? null,
        progressionLevel: r.progressionLevel ?? null,
      },
    });
    up++;
  }

  const byMod = await db.exercise.groupBy({ by: ["modality"], _count: { id: true } });
  console.log(`\n📊 Library modality breakdown (incl. curated):`);
  byMod
    .sort((a: any, b: any) => b._count.id - a._count.id)
    .forEach((g: any) => console.log(`   ${String(g.modality).padEnd(14)} ${g._count.id}`));
  console.log(`\n✅ Seeded ${up} curated exercises. Re-run seed-all-exercise-schedules to use them.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => process.exit(0));
