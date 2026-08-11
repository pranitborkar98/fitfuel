// app/dashboard/nutrition/page.tsx
// Server component: auth guard and the initial data for today.

import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { screen, label, APP_MAX } from "@/app/_app/theme";
import NutritionClient from "./NutritionClient";

export const metadata: Metadata = { title: "Nutrition" };
export const dynamic = "force-dynamic";

const WRAP: React.CSSProperties = {
  width: "100%", maxWidth: APP_MAX, margin: "0 auto",
  padding: "0 clamp(16px,4vw,28px)",
};

const DEFAULT_GOAL = {
  calories: 2000, protein: 150, carbs: 250, fat: 67, fiber: 28, waterMl: 2500,
};

export default async function NutritionPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/auth/signin?callbackUrl=/dashboard/nutrition");

  const userId = session.user.id;
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

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
    <div style={{ ...WRAP, paddingTop: 26 }}>
      <header style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <h1 style={screen()}>Nutrition</h1>
        <span style={label(12)}>Diary, water, and the food database</span>
      </header>

      <NutritionClient
        initialEntries={JSON.parse(JSON.stringify(entries))}
        mealTypes={JSON.parse(JSON.stringify(mealTypes))}
        goal={goal ? JSON.parse(JSON.stringify(goal)) : DEFAULT_GOAL}
        initialWaterMl={waterLog?.amountMl ?? 0}
      />
    </div>
  );
}
