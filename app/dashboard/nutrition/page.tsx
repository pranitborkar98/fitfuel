// app/dashboard/nutrition/page.tsx
// Server component — auth guard + SSR initial data for today

import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NutritionClient from "./NutritionClient";

export const metadata = { title: "Nutrition Tracker — FitFuel" };

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/auth/signin?callbackUrl=/dashboard/nutrition");
  }

  const userId = session.user.id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const [mealTypes, goal, waterLog, entries] = await Promise.all([
    prisma.mealType.findMany({ orderBy: { sortOrder: "asc" } }),

    prisma.nutritionGoal.findUnique({ where: { userId } }),

    prisma.waterLog.findUnique({
      where: { userId_entryDate: { userId, entryDate: today } },
    }),

    prisma.foodEntry.findMany({
      where: { userId, entryDate: today },
      include: { foodItem: true, mealType: true },
      orderBy: [{ mealType: { sortOrder: "asc" } }, { createdAt: "asc" }],
    }),
  ]);

  const defaultGoal = { 
    calories: 2000, 
    protein: 150, 
    carbs: 250, 
    fat: 67, 
    fiber: 28,   // ← ADD THIS
    waterMl: 2500 
  };

  return (
    <NutritionClient
      initialEntries={JSON.parse(JSON.stringify(entries))}
      mealTypes={JSON.parse(JSON.stringify(mealTypes))}
      goal={goal ? JSON.parse(JSON.stringify(goal)) : defaultGoal}
      initialWaterMl={waterLog?.amountMl ?? 0}
      userName={session.user.name ?? ""}
    />
  );
}