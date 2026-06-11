// app/api/admin/recipes/route.ts
// Phase 15E-2 — recipe + step + ingredient editing (fills SOP gaps from the UI).
//   GET  ?id=<recipeId>     -> full recipe (editable fields) + ingredients + steps
//   GET  ?foodq=<text>      -> search FoodItems for the ingredient picker
//   POST { action, ... }    -> updateRecipe | saveStep | deleteStep | reorderSteps
//                              | saveIngredient | deleteIngredient | createFoodItem
// Recipes surface (OWNER/ADMIN/KITCHEN).

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
const db = prisma as any;

const s = (v: any) => (typeof v === "string" ? v.trim() : "");
const i = (v: any, d = 0) => { const n = Number(v); return Number.isFinite(n) ? Math.round(n) : d; };
const num = (v: any, d = 0) => { const n = Number(v); return Number.isFinite(n) ? n : d; };

const RECIPE_DETAIL = {
  id: true, name: true, slug: true, shortDescription: true, description: true,
  cuisineType: true, mealType: true, servingSizeGrams: true, prepTimeMins: true,
  cookTimeMins: true, difficulty: true, isActive: true, isFeatured: true, imageUrl: true,
  caloriesPerServing: true, proteinGrams: true, carbsGrams: true, fatGrams: true, fibreGrams: true,
  ingredients: {
    orderBy: { orderInRecipe: "asc" },
    select: {
      id: true, quantityGrams: true, cookedWeightFactor: true, prepNote: true,
      isOptional: true, orderInRecipe: true, foodItemId: true,
      foodItem: { select: { id: true, name: true, category: true } },
    },
  },
  steps: {
    orderBy: { stepNumber: "asc" },
    select: {
      id: true, stepNumber: true, title: true, instruction: true,
      durationMins: true, temperatureC: true, technique: true, kitchenNote: true,
    },
  },
};

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("recipes");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const id = req.nextUrl.searchParams.get("id");
  const foodq = req.nextUrl.searchParams.get("foodq");

  if (foodq) {
    const items = await db.foodItem.findMany({
      where: { name: { contains: foodq.trim(), mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: 15,
      select: { id: true, name: true, category: true },
    });
    return NextResponse.json({ items });
  }

  if (id) {
    const recipe = await db.recipe.findUnique({ where: { id }, select: RECIPE_DETAIL });
    if (!recipe) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ recipe });
  }

  return NextResponse.json({ error: "id or foodq required" }, { status: 400 });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("recipes");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => ({}))) as { action?: string; id?: string; recipeId?: string; data?: any; orderedIds?: string[] };
  const d = body.data ?? {};

  try {
    switch (body.action) {
      case "updateRecipe": {
        if (!body.id) return bad("id required");
        if (!s(d.name)) return bad("Name is required");
        const data = {
          name: s(d.name), shortDescription: s(d.shortDescription), description: s(d.description),
          cuisineType: s(d.cuisineType), mealType: d.mealType, servingSizeGrams: i(d.servingSizeGrams),
          prepTimeMins: i(d.prepTimeMins), cookTimeMins: i(d.cookTimeMins), difficulty: s(d.difficulty) || "easy",
          isActive: !!d.isActive, isFeatured: !!d.isFeatured, imageUrl: s(d.imageUrl) || null,
          caloriesPerServing: i(d.caloriesPerServing), proteinGrams: num(d.proteinGrams),
          carbsGrams: num(d.carbsGrams), fatGrams: num(d.fatGrams), fibreGrams: num(d.fibreGrams),
        };
        const record = await db.recipe.update({ where: { id: body.id }, data, select: RECIPE_DETAIL });
        return NextResponse.json({ ok: true, recipe: record });
      }

      case "saveStep": {
        if (!body.recipeId) return bad("recipeId required");
        if (!s(d.title) || !s(d.instruction)) return bad("Step title and instruction are required");
        const data = {
          title: s(d.title), instruction: s(d.instruction),
          durationMins: d.durationMins === "" || d.durationMins == null ? null : i(d.durationMins),
          temperatureC: d.temperatureC === "" || d.temperatureC == null ? null : i(d.temperatureC),
          technique: s(d.technique) || null, kitchenNote: s(d.kitchenNote) || null,
        };
        if (body.id) {
          const step = await db.recipeStep.update({ where: { id: body.id }, data });
          return NextResponse.json({ ok: true, step });
        }
        const max = await db.recipeStep.aggregate({ where: { recipeId: body.recipeId }, _max: { stepNumber: true } });
        const step = await db.recipeStep.create({ data: { ...data, recipeId: body.recipeId, stepNumber: (max._max.stepNumber ?? 0) + 1 } });
        return NextResponse.json({ ok: true, step });
      }

      case "deleteStep": {
        if (!body.id) return bad("id required");
        await db.recipeStep.delete({ where: { id: body.id } });
        return NextResponse.json({ ok: true, deleted: body.id });
      }

      case "reorderSteps": {
        const ids = body.orderedIds ?? [];
        await Promise.all(ids.map((sid, idx) => db.recipeStep.update({ where: { id: sid }, data: { stepNumber: idx + 1 } })));
        return NextResponse.json({ ok: true });
      }

      case "saveIngredient": {
        if (!body.recipeId) return bad("recipeId required");
        if (!s(d.foodItemId)) return bad("Pick an ingredient");
        if (num(d.quantityGrams) <= 0) return bad("Quantity (g) must be greater than 0");
        const data = {
          foodItemId: s(d.foodItemId), quantityGrams: num(d.quantityGrams),
          cookedWeightFactor: num(d.cookedWeightFactor, 1.0), prepNote: s(d.prepNote) || null,
          isOptional: !!d.isOptional,
        };
        if (body.id) {
          const ing = await db.recipeIngredient.update({ where: { id: body.id }, data, select: { id: true, quantityGrams: true, cookedWeightFactor: true, prepNote: true, isOptional: true, orderInRecipe: true, foodItemId: true, foodItem: { select: { id: true, name: true, category: true } } } });
          return NextResponse.json({ ok: true, ingredient: ing });
        }
        const max = await db.recipeIngredient.aggregate({ where: { recipeId: body.recipeId }, _max: { orderInRecipe: true } });
        const ing = await db.recipeIngredient.create({
          data: { ...data, recipeId: body.recipeId, orderInRecipe: (max._max.orderInRecipe ?? 0) + 1 },
          select: { id: true, quantityGrams: true, cookedWeightFactor: true, prepNote: true, isOptional: true, orderInRecipe: true, foodItemId: true, foodItem: { select: { id: true, name: true, category: true } } },
        });
        return NextResponse.json({ ok: true, ingredient: ing });
      }

      case "deleteIngredient": {
        if (!body.id) return bad("id required");
        await db.recipeIngredient.delete({ where: { id: body.id } });
        return NextResponse.json({ ok: true, deleted: body.id });
      }

      case "createFoodItem": {
        if (!s(d.name)) return bad("Food item name required");
        const item = await db.foodItem.create({
          data: {
            name: s(d.name), category: s(d.category) || null,
            per100Calories: num(d.per100Calories), per100Protein: num(d.per100Protein),
            per100Carbs: num(d.per100Carbs), per100Fat: num(d.per100Fat), per100Fiber: num(d.per100Fiber),
            isCustom: true,
          },
          select: { id: true, name: true, category: true },
        });
        return NextResponse.json({ ok: true, item });
      }

      default:
        return bad("Unknown action");
    }
  } catch {
    return NextResponse.json({ error: "Save failed" }, { status: 400 });
  }
}

function bad(msg: string) {
  return NextResponse.json({ error: msg }, { status: 400 });
}
