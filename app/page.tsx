import type { Metadata, Viewport } from "next";
import StructuredData from "@/components/StructuredData";
import { prisma } from "@/lib/prisma";
import { hasCompletePlanSchedule } from "@/lib/plan-readiness";
import HomePage, { type HomeData } from "./_home-next/HomePage";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chef-cooked meal plans connected to your goals",
  description:
    "Chef-cooked meals in Pune with portions linked to your nutrition target, delivery in your chosen window, and a diary ready to confirm.",
  alternates: { canonical: "/" },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

async function getHomeData(): Promise<HomeData> {
  try {
    const [plans, exerciseCount, supplementCount, recipeCount] = await Promise.all([
      prisma.mealPlan.findMany({
        orderBy: [{ sortOrder: "asc" }, { displayName: "asc" }],
        select: {
          slug: true,
          name: true,
          tagline: true,
          subCategory: true,
          dietaryVariant: true,
          avgCaloriesPerDay: true,
          avgProteinGrams: true,
          cycleLengthDays: true,
          mealsPerDay: true,
          _count: { select: { scheduleSlots: true } },
          planPrices: {
            where: { isActive: true, isDigital: false },
            select: { id: true },
          },
          scheduleSlots: {
            where: { dayNumber: 1, mealSlot: "LUNCH" },
            take: 1,
            select: {
              servingMultiplier: true,
              recipe: {
                select: {
                  name: true,
                  caloriesPerServing: true,
                  proteinGrams: true,
                },
              },
            },
          },
        },
      }),
      prisma.exercise.count(),
      prisma.supplement.count({ where: { isActive: true } }),
      prisma.recipe.count(),
    ]);

    const ready = plans.filter((plan) =>
      plan.planPrices.length > 0 &&
      hasCompletePlanSchedule({
        scheduleCount: plan._count.scheduleSlots,
        cycleLengthDays: plan.cycleLengthDays,
        mealsPerDay: plan.mealsPerDay,
      }),
    );

    const meal = ready.find((plan) => plan.scheduleSlots[0])?.scheduleSlots[0];
    const servingMultiplier = Number(meal?.servingMultiplier ?? 1);

    return {
      conceptCount: new Set(plans.map((plan) => plan.subCategory)).size,
      publishedCount: ready.length,
      exerciseCount,
      supplementCount,
      recipeCount,
      availablePlans: ready.slice(0, 3).map((plan) => ({
        slug: plan.slug,
        name: plan.name,
        tagline: plan.tagline,
        diet: plan.dietaryVariant,
        calories: plan.avgCaloriesPerDay,
        protein: plan.avgProteinGrams,
        cycleDays: plan.cycleLengthDays,
      })),
      featuredMeal: meal
        ? {
            name: meal.recipe.name,
            calories: Math.round(Number(meal.recipe.caloriesPerServing) * servingMultiplier),
            protein: Math.round(Number(meal.recipe.proteinGrams) * servingMultiplier),
          }
        : { name: "Your scheduled FitFuel lunch", calories: 510, protein: 28 },
    };
  } catch (error) {
    console.error("[home] Unable to load catalogue facts", error);
    return {
      conceptCount: null,
      publishedCount: 0,
      exerciseCount: null,
      supplementCount: null,
      recipeCount: null,
      availablePlans: [],
      featuredMeal: { name: "Your scheduled FitFuel lunch", calories: 510, protein: 28 },
    };
  }
}

export default async function AppPage() {
  const data = await getHomeData();

  return (
    <>
      <StructuredData />
      <HomePage data={data} />
    </>
  );
}
