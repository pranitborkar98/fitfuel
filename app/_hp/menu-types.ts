// app/_hp/menu-types.ts
//
// The menu's shape and its slot vocabulary, with no database import.
//
// WHY THIS IS A SEPARATE FILE. WeekPicker is a client component and needs
// SLOT_ORDER and SLOT_LABEL to render a day in eating order. Importing them from
// menu-data.ts pulls that module's `import { prisma }` into the browser bundle,
// and the build fails resolving `tls` out of pg. A type-only import would have
// been erased; these are values, so they cannot be.
//
// So the pure half lives here and menu-data.ts re-exports it. Nothing that
// touches Postgres is reachable from a client component, and there is still one
// definition of the slot order.

export const SLOT_ORDER = ["BREAKFAST", "LUNCH", "SNACK", "DINNER"] as const;
export type Slot = (typeof SLOT_ORDER)[number];

export const SLOT_LABEL: Record<string, string> = {
  BREAKFAST: "Breakfast",
  LUNCH: "Lunch",
  SNACK: "Snack",
  DINNER: "Dinner",
};

export type Dish = {
  day: number;
  slot: string;
  name: string;
  blurb: string | null;
  cuisine: string | null;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  fibre: number | null;
};

/** Total a set of dishes without tripping over nulls. Pure, so it is usable on
 *  both sides of the client boundary. */
export function totals(dishes: Dish[]) {
  return {
    kcal: dishes.reduce((n, d) => n + (d.kcal ?? 0), 0),
    protein: dishes.reduce((n, d) => n + (d.protein ?? 0), 0),
  };
}
