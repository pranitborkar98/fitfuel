// prisma/seed-exercise-schedule.ts
// Seeds a real weight-loss training program so the PRO digital plan ships a Training Plan section.
// Matches getWorkoutPlanData(subCategory="weight_loss", tier="STANDARD").
// Run: node --env-file=.env --env-file=.env.local --import tsx prisma/seed-exercise-schedule.ts
import { prisma } from "../lib/prisma";

const CATEGORY = "weight_loss";
const TIER = "STANDARD" as const;

type Ex = { name: string; sets: number; reps: string; restSecs: number; equipment?: string };
const day = (dayOfWeek: string, focusArea: string, estimatedCalories: number, exercises: Ex[], isRestDay = false) =>
  ({ dayOfWeek, focusArea, estimatedCalories, isRestDay, exercises });

const DAYS = [
  day("monday", "Full-Body Strength", 320, [
    { name: "Goblet Squat", sets: 3, reps: "12", restSecs: 60, equipment: "Dumbbell" },
    { name: "Push-Up (or Knee Push-Up)", sets: 3, reps: "10–12", restSecs: 60, equipment: "Bodyweight" },
    { name: "Dumbbell Romanian Deadlift", sets: 3, reps: "12", restSecs: 60, equipment: "Dumbbell" },
    { name: "Bent-Over Dumbbell Row", sets: 3, reps: "12", restSecs: 60, equipment: "Dumbbell" },
    { name: "Plank", sets: 3, reps: "40s", restSecs: 45, equipment: "Bodyweight" },
  ]),
  day("tuesday", "LISS Cardio", 280, [
    { name: "Brisk Walk / Incline Treadmill", sets: 1, reps: "35 min", restSecs: 0, equipment: "Treadmill" },
    { name: "Standing Calf Raise", sets: 3, reps: "20", restSecs: 45, equipment: "Bodyweight" },
  ]),
  day("wednesday", "Lower Body + Core", 330, [
    { name: "Reverse Lunge", sets: 3, reps: "10 / leg", restSecs: 60, equipment: "Dumbbell" },
    { name: "Glute Bridge", sets: 3, reps: "15", restSecs: 45, equipment: "Bodyweight" },
    { name: "Step-Up", sets: 3, reps: "12 / leg", restSecs: 60, equipment: "Bench" },
    { name: "Bicycle Crunch", sets: 3, reps: "20", restSecs: 40, equipment: "Bodyweight" },
    { name: "Dead Bug", sets: 3, reps: "10 / side", restSecs: 40, equipment: "Bodyweight" },
  ]),
  day("thursday", "Rest & Mobility", 0, [], true),
  day("friday", "Upper Body Strength", 310, [
    { name: "Dumbbell Shoulder Press", sets: 3, reps: "12", restSecs: 60, equipment: "Dumbbell" },
    { name: "Dumbbell Floor Press", sets: 3, reps: "12", restSecs: 60, equipment: "Dumbbell" },
    { name: "One-Arm Dumbbell Row", sets: 3, reps: "12 / arm", restSecs: 60, equipment: "Dumbbell" },
    { name: "Lateral Raise", sets: 3, reps: "15", restSecs: 45, equipment: "Dumbbell" },
    { name: "Hammer Curl", sets: 2, reps: "12", restSecs: 45, equipment: "Dumbbell" },
  ]),
  day("saturday", "HIIT Conditioning", 360, [
    { name: "Jumping Jacks", sets: 4, reps: "40s on / 20s off", restSecs: 20, equipment: "Bodyweight" },
    { name: "Mountain Climbers", sets: 4, reps: "40s on / 20s off", restSecs: 20, equipment: "Bodyweight" },
    { name: "Squat-to-Press", sets: 4, reps: "40s on / 20s off", restSecs: 20, equipment: "Dumbbell" },
    { name: "High Knees", sets: 4, reps: "40s on / 20s off", restSecs: 20, equipment: "Bodyweight" },
  ]),
  day("sunday", "Rest & Recovery", 0, [], true),
];

const WEEKLY = {
  monday: ["full_body"], tuesday: ["cardio"], wednesday: ["lower", "core"],
  thursday: ["rest"], friday: ["upper"], saturday: ["hiit"], sunday: ["rest"],
};

async function main() {
  // Idempotent: clear any prior weight_loss/STANDARD schedule and its days, then recreate.
  const existing = await (prisma as any).exerciseSchedule.findMany({
    where: { mealPlanCategory: CATEGORY, tier: TIER }, select: { id: true },
  });
  for (const s of existing) {
    await (prisma as any).exerciseScheduleDay.deleteMany({ where: { scheduleId: s.id } });
    await (prisma as any).exerciseSchedule.delete({ where: { id: s.id } });
  }

  await (prisma as any).exerciseSchedule.create({
    data: {
      mealPlanCategory: CATEGORY,
      tier: TIER,
      name: "Weight-Loss 5-Day Program",
      description: "A beginner-to-intermediate fat-loss split: three strength days, one HIIT day, one steady cardio day, two recovery days.",
      weeklyStructure: WEEKLY,
      daysPerWeek: 5,
      sessionDurationMins: 45,
      workoutDays: {
        create: DAYS.map((d) => ({
          dayOfWeek: d.dayOfWeek,
          focusArea: d.focusArea,
          estimatedCalories: d.estimatedCalories,
          isRestDay: d.isRestDay,
          exercises: d.exercises, // stored as JSON; names read inline by getWorkoutPlanData
        })),
      },
    },
  });

  console.log("Seeded Weight-Loss 5-Day Program (weight_loss / STANDARD).");
}
main().catch((e) => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
