// Recipe details, kitchen SOP steps, and ingredients. OWNER/ADMIN/KITCHEN only.

import { requireApiRole } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";
import { enforceRateLimit } from "@/lib/rate-limit";
import { readJson, readQuery } from "@/lib/validation/core";
import type { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

export const dynamic = "force-dynamic";

const idSchema = z.string().cuid();
const imageUrlSchema = z.string().trim().max(2048).refine(
  (value) => !value || value.startsWith("/") || /^https:\/\//i.test(value),
  "Use an HTTPS image URL or an app-relative path.",
);
const optionalNumber = (min: number, max: number) =>
  z.union([z.literal(""), z.null(), z.coerce.number().finite().min(min).max(max)]).optional();

const querySchema = z
  .object({
    id: idSchema.optional(),
    foodq: z.string().trim().min(2).max(80).optional(),
  })
  .strict()
  .refine((value) => Boolean(value.id) !== Boolean(value.foodq), "Use either id or foodq.");

const recipeDataSchema = z
  .object({
    name: z.string().trim().min(1, "Name is required.").max(160),
    shortDescription: z.string().trim().max(300).default(""),
    description: z.string().trim().max(2_500).default(""),
    cuisineType: z.string().trim().max(80).default(""),
    mealType: z.enum(["BREAKFAST", "LUNCH", "SNACK", "DINNER"]),
    servingSizeGrams: z.coerce.number().int().min(0).max(5_000),
    prepTimeMins: z.coerce.number().int().min(0).max(1_440),
    cookTimeMins: z.coerce.number().int().min(0).max(1_440),
    difficulty: z.enum(["easy", "medium", "hard"]).default("easy"),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    imageUrl: imageUrlSchema.default(""),
    caloriesPerServing: z.coerce.number().int().min(0).max(10_000),
    proteinGrams: z.coerce.number().finite().min(0).max(1_000),
    carbsGrams: z.coerce.number().finite().min(0).max(2_000),
    fatGrams: z.coerce.number().finite().min(0).max(1_000),
    fibreGrams: z.coerce.number().finite().min(0).max(500),
  })
  .strict();

const stepDataSchema = z
  .object({
    title: z.string().trim().min(1, "Step title is required.").max(160),
    instruction: z.string().trim().min(1, "Instruction is required.").max(2_500),
    durationMins: optionalNumber(0, 1_440),
    temperatureC: optionalNumber(-50, 500),
    technique: z.string().trim().max(100).default(""),
    kitchenNote: z.string().trim().max(1_000).default(""),
  })
  .strict();

const ingredientDataSchema = z
  .object({
    foodItemId: idSchema,
    quantityGrams: z.coerce.number().finite().positive().max(10_000),
    cookedWeightFactor: z.coerce.number().finite().min(0.01).max(10).default(1),
    prepNote: z.string().trim().max(500).default(""),
    isOptional: z.boolean().default(false),
  })
  .strict();

const foodDataSchema = z
  .object({
    name: z.string().trim().min(1, "Food item name is required.").max(160),
    category: z.string().trim().max(80).default(""),
    per100Calories: z.coerce.number().finite().min(0).max(10_000).default(0),
    per100Protein: z.coerce.number().finite().min(0).max(1_000).default(0),
    per100Carbs: z.coerce.number().finite().min(0).max(1_000).default(0),
    per100Fat: z.coerce.number().finite().min(0).max(1_000).default(0),
    per100Fiber: z.coerce.number().finite().min(0).max(1_000).default(0),
  })
  .strict();

const actionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("updateRecipe"), id: idSchema, data: recipeDataSchema }).strict(),
  z.object({ action: z.literal("saveStep"), recipeId: idSchema, id: idSchema.optional(), data: stepDataSchema }).strict(),
  z.object({ action: z.literal("deleteStep"), id: idSchema }).strict(),
  z.object({ action: z.literal("reorderSteps"), recipeId: idSchema, orderedIds: z.array(idSchema).min(1).max(100) }).strict(),
  z.object({ action: z.literal("saveIngredient"), recipeId: idSchema, id: idSchema.optional(), data: ingredientDataSchema }).strict(),
  z.object({ action: z.literal("deleteIngredient"), id: idSchema }).strict(),
  z.object({ action: z.literal("createFoodItem"), data: foodDataSchema }).strict(),
]);

const INGREDIENT_SELECT = {
  id: true,
  quantityGrams: true,
  cookedWeightFactor: true,
  prepNote: true,
  isOptional: true,
  orderInRecipe: true,
  foodItemId: true,
  foodItem: { select: { id: true, name: true, category: true } },
} satisfies Prisma.RecipeIngredientSelect;

const RECIPE_DETAIL = {
  id: true,
  name: true,
  slug: true,
  shortDescription: true,
  description: true,
  cuisineType: true,
  mealType: true,
  servingSizeGrams: true,
  prepTimeMins: true,
  cookTimeMins: true,
  difficulty: true,
  isActive: true,
  isFeatured: true,
  imageUrl: true,
  caloriesPerServing: true,
  proteinGrams: true,
  carbsGrams: true,
  fatGrams: true,
  fibreGrams: true,
  ingredients: { orderBy: { orderInRecipe: "asc" as const }, select: INGREDIENT_SELECT },
  steps: {
    orderBy: { stepNumber: "asc" as const },
    select: {
      id: true,
      stepNumber: true,
      title: true,
      instruction: true,
      durationMins: true,
      temperatureC: true,
      technique: true,
      kitchenNote: true,
    },
  },
} satisfies Prisma.RecipeSelect;

function nullableNumber(value: number | "" | null | undefined): number | null {
  return value === "" || value == null ? null : value;
}

function errorCode(error: unknown): string | null {
  return typeof error === "object" && error !== null && "code" in error ? String(error.code) : null;
}

async function serializable<T>(work: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      return await prisma.$transaction(work, { isolationLevel: "Serializable" });
    } catch (error: unknown) {
      if (errorCode(error) === "P2034" && attempt < 2) continue;
      throw error;
    }
  }
  throw new Error("Recipe operation could not be completed");
}

export async function GET(req: NextRequest) {
  const admin = await requireApiRole("recipes");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "read", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = readQuery(req, querySchema);
  if (!parsed.ok) return parsed.response;
  const query = parsed.data;

  if (query.foodq) {
    const items = await prisma.foodItem.findMany({
      where: { name: { contains: query.foodq, mode: "insensitive" } },
      orderBy: { name: "asc" },
      take: 15,
      select: { id: true, name: true, category: true },
    });
    return NextResponse.json({ items });
  }

  const recipe = await prisma.recipe.findUnique({ where: { id: query.id! }, select: RECIPE_DETAIL });
  if (!recipe) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
  return NextResponse.json({ recipe });
}

export async function POST(req: NextRequest) {
  const admin = await requireApiRole("recipes");
  if (!admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const rl = await enforceRateLimit(req, "mutation", admin.id);
  if (!rl.ok) return rl.response;

  const parsed = await readJson(req, actionSchema);
  if (!parsed.ok) return parsed.response;
  const body = parsed.data;

  try {
    if (body.action === "updateRecipe") {
      const input = body.data;
      if (input.isActive) {
        if (!input.shortDescription || !input.description || !input.cuisineType) {
          return NextResponse.json({ error: "Active recipes need complete customer-facing copy." }, { status: 400 });
        }
        if (input.servingSizeGrams < 1 || input.caloriesPerServing < 1) {
          return NextResponse.json({ error: "Active recipes need a serving size and calories." }, { status: 400 });
        }
        const readiness = await prisma.recipe.findUnique({
          where: { id: body.id },
          select: { _count: { select: { ingredients: true, steps: true } } },
        });
        if (!readiness) return NextResponse.json({ error: "Recipe not found." }, { status: 404 });
        if (!readiness._count.ingredients || !readiness._count.steps) {
          return NextResponse.json({ error: "Add at least one ingredient and one cooking step before activating this recipe." }, { status: 400 });
        }
      }
      const recipe = await prisma.recipe.update({
        where: { id: body.id },
        data: {
          name: input.name,
          shortDescription: input.shortDescription,
          description: input.description,
          cuisineType: input.cuisineType,
          mealType: input.mealType,
          servingSizeGrams: input.servingSizeGrams,
          prepTimeMins: input.prepTimeMins,
          cookTimeMins: input.cookTimeMins,
          difficulty: input.difficulty,
          isActive: input.isActive,
          isFeatured: input.isFeatured,
          imageUrl: input.imageUrl || null,
          caloriesPerServing: input.caloriesPerServing,
          proteinGrams: input.proteinGrams,
          carbsGrams: input.carbsGrams,
          fatGrams: input.fatGrams,
          fibreGrams: input.fibreGrams,
        },
        select: RECIPE_DETAIL,
      });
      return NextResponse.json({ ok: true, recipe });
    }

    if (body.action === "saveStep") {
      const data = {
        title: body.data.title,
        instruction: body.data.instruction,
        durationMins: nullableNumber(body.data.durationMins),
        temperatureC: nullableNumber(body.data.temperatureC),
        technique: body.data.technique || null,
        kitchenNote: body.data.kitchenNote || null,
      };
      if (body.id) {
        const existing = await prisma.recipeStep.findFirst({ where: { id: body.id, recipeId: body.recipeId }, select: { id: true } });
        if (!existing) return NextResponse.json({ error: "Cooking step not found in this recipe." }, { status: 404 });
        const step = await prisma.recipeStep.update({ where: { id: body.id }, data });
        return NextResponse.json({ ok: true, step });
      }
      const step = await serializable(async (tx) => {
        const max = await tx.recipeStep.aggregate({ where: { recipeId: body.recipeId }, _max: { stepNumber: true } });
        return tx.recipeStep.create({
          data: { ...data, recipeId: body.recipeId, stepNumber: (max._max.stepNumber ?? 0) + 1 },
        });
      });
      return NextResponse.json({ ok: true, step });
    }

    if (body.action === "deleteStep") {
      const deleted = await serializable(async (tx) => {
        const step = await tx.recipeStep.findUnique({
          where: { id: body.id },
          select: { recipeId: true, recipe: { select: { isActive: true } } },
        });
        if (!step) return "NOT_FOUND" as const;
        if (step.recipe.isActive) {
          const count = await tx.recipeStep.count({ where: { recipeId: step.recipeId } });
          if (count <= 1) return "LAST_LIVE_STEP" as const;
        }
        await tx.recipeStep.delete({ where: { id: body.id } });
        return "DELETED" as const;
      });
      if (deleted === "NOT_FOUND") return NextResponse.json({ error: "Cooking step not found." }, { status: 404 });
      if (deleted === "LAST_LIVE_STEP") {
        return NextResponse.json({ error: "A live recipe must keep at least one cooking step. Hide the recipe first." }, { status: 400 });
      }
      return NextResponse.json({ ok: true, deleted: body.id });
    }

    if (body.action === "reorderSteps") {
      const orderedIds = [...new Set(body.orderedIds)];
      if (orderedIds.length !== body.orderedIds.length) {
        return NextResponse.json({ error: "Cooking-step order contains duplicates." }, { status: 400 });
      }
      const [matching, total] = await Promise.all([
        prisma.recipeStep.count({ where: { recipeId: body.recipeId, id: { in: orderedIds } } }),
        prisma.recipeStep.count({ where: { recipeId: body.recipeId } }),
      ]);
      if (matching !== orderedIds.length || total !== orderedIds.length) {
        return NextResponse.json({ error: "Cooking-step order no longer matches this recipe. Refresh and try again." }, { status: 409 });
      }
      await prisma.$transaction(orderedIds.map((id, index) =>
        prisma.recipeStep.update({ where: { id }, data: { stepNumber: index + 1 } })
      ));
      return NextResponse.json({ ok: true });
    }

    if (body.action === "saveIngredient") {
      const data = {
        foodItemId: body.data.foodItemId,
        quantityGrams: body.data.quantityGrams,
        cookedWeightFactor: body.data.cookedWeightFactor,
        prepNote: body.data.prepNote || null,
        isOptional: body.data.isOptional,
      };
      if (body.id) {
        const existing = await prisma.recipeIngredient.findFirst({ where: { id: body.id, recipeId: body.recipeId }, select: { id: true } });
        if (!existing) return NextResponse.json({ error: "Ingredient not found in this recipe." }, { status: 404 });
        const ingredient = await prisma.recipeIngredient.update({ where: { id: body.id }, data, select: INGREDIENT_SELECT });
        return NextResponse.json({ ok: true, ingredient });
      }
      const ingredient = await serializable(async (tx) => {
        const max = await tx.recipeIngredient.aggregate({ where: { recipeId: body.recipeId }, _max: { orderInRecipe: true } });
        return tx.recipeIngredient.create({
          data: { ...data, recipeId: body.recipeId, orderInRecipe: (max._max.orderInRecipe ?? 0) + 1 },
          select: INGREDIENT_SELECT,
        });
      });
      return NextResponse.json({ ok: true, ingredient });
    }

    if (body.action === "deleteIngredient") {
      const deleted = await serializable(async (tx) => {
        const ingredient = await tx.recipeIngredient.findUnique({
          where: { id: body.id },
          select: { recipeId: true, recipe: { select: { isActive: true } } },
        });
        if (!ingredient) return "NOT_FOUND" as const;
        if (ingredient.recipe.isActive) {
          const count = await tx.recipeIngredient.count({ where: { recipeId: ingredient.recipeId } });
          if (count <= 1) return "LAST_LIVE_INGREDIENT" as const;
        }
        await tx.recipeIngredient.delete({ where: { id: body.id } });
        return "DELETED" as const;
      });
      if (deleted === "NOT_FOUND") return NextResponse.json({ error: "Ingredient not found." }, { status: 404 });
      if (deleted === "LAST_LIVE_INGREDIENT") {
        return NextResponse.json({ error: "A live recipe must keep at least one ingredient. Hide the recipe first." }, { status: 400 });
      }
      return NextResponse.json({ ok: true, deleted: body.id });
    }

    const duplicate = await prisma.foodItem.findFirst({
      where: { name: { equals: body.data.name, mode: "insensitive" } },
      select: { id: true },
    });
    if (duplicate) return NextResponse.json({ error: "That food item already exists. Search for it instead." }, { status: 409 });
    const item = await prisma.foodItem.create({
      data: {
        name: body.data.name,
        category: body.data.category || null,
        per100Calories: body.data.per100Calories,
        per100Protein: body.data.per100Protein,
        per100Carbs: body.data.per100Carbs,
        per100Fat: body.data.per100Fat,
        per100Fiber: body.data.per100Fiber,
        isCustom: true,
      },
      select: { id: true, name: true, category: true },
    });
    return NextResponse.json({ ok: true, item });
  } catch (error: unknown) {
    const code = typeof error === "object" && error && "code" in error ? error.code : null;
    if (code === "P2025") return NextResponse.json({ error: "Recipe data was not found." }, { status: 404 });
    console.error("[admin/recipes] save failed", error);
    return NextResponse.json({ error: "Recipe save failed." }, { status: 500 });
  }
}
