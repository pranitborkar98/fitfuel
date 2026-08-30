// app/dashboard/nutrition/page.tsx
// Server component: auth guard and the initial data for today.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { formatDateOnly, todayIndiaDate } from "@/lib/date-only";
import { prisma } from "@/lib/prisma";
import { screen } from "@/app/_app/theme";
import NutritionClient from "./NutritionClient";
import s from "./nutrition.module.css";

export const metadata: Metadata = { title: "Nutrition" };
export const dynamic = "force-dynamic";

const DEFAULT_GOAL = {
  calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 28, waterMl: 2500,
};

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/nutrition");

  const userId = session.user.id;
  const today = todayIndiaDate();

  const [mealTypes, goal, waterLog, entries] = await Promise.all([
    prisma.mealType.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.nutritionGoal.findUnique({ where: { userId } }),
    prisma.waterLog.findUnique({ where: { userId_entryDate: { userId, entryDate: today } } }),
    prisma.foodEntry.findMany({
      where: { userId, entryDate: today },
      include: { foodItem: true, mealType: true },
      orderBy: [{ mealType: { sortOrder: "asc" } }, { createdAt: "asc" }],
    }),
  ]);

  return (
    <div className={s.page}>
      <header className={s.header}>
        <h1 style={screen()}>Nutrition</h1>
        <p className={s.intro}>Log meals and water, see what remains for the day, and adjust targets when your plan changes.</p>
      </header>

      <NutritionClient
        initialEntries={JSON.parse(JSON.stringify(entries))}
        mealTypes={JSON.parse(JSON.stringify(mealTypes))}
        goal={goal ? JSON.parse(JSON.stringify(goal)) : DEFAULT_GOAL}
        initialWaterMl={waterLog?.amountMl ?? 0}
        initialDate={formatDateOnly(today)}
      />
    </div>
  );
}
