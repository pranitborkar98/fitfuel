// app/admin/recipes/page.tsx
// Phase 15E-2 — recipe management.

import { requireSurface } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import RecipesClient from "./RecipesClient";

export const dynamic = "force-dynamic";

export default async function RecipesPage() {
  await requireSurface("recipes");
  const recipes = await prisma.recipe.findMany({
    orderBy: [{ mealType: "asc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      cuisineType: true,
      mealType: true,
      isActive: true,
      _count: { select: { steps: true, ingredients: true } },
    },
  });

  return <RecipesClient initial={recipes} />;
}
