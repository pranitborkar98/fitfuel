// prisma/seed-nutrition.ts
// Run: npx tsx prisma/seed-nutrition.ts

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ 
  connectionString: "postgresql://neondb_owner:npg_BpgWQF9ZLq7K@ep-lingering-wildflower-aqi59lyk.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require",
  ssl: { rejectUnauthorized: false }
});
const adapter = new PrismaPg(pool);
const prisma  = new PrismaClient({ adapter } as ConstructorParameters<typeof PrismaClient>[0]);

async function main() {
  console.log("🌱 Seeding nutrition data...");

  // ── 1. Meal Types ──────────────────────────────────────────
  const mealTypes = [
    { name: "Breakfast", emoji: "🌅", sortOrder: 0 },
    { name: "Lunch",     emoji: "☀️",  sortOrder: 1 },
    { name: "Dinner",    emoji: "🌙", sortOrder: 2 },
    { name: "Snacks",    emoji: "🍎", sortOrder: 3 },
  ];

  for (const mt of mealTypes) {
    await prisma.mealType.upsert({
      where:  { name: mt.name },
      update: { emoji: mt.emoji, sortOrder: mt.sortOrder },
      create: mt,
    });
  }
  console.log(`✅ Upserted ${mealTypes.length} meal types`);

  // ── 2. Food Items (50 common Indian foods, per 100g) ───────
  // Fields: name, brand, category, per100Calories, per100Protein, per100Carbs, per100Fat, per100Fiber
  const foods = [
    // ── Grains & Staples ──
    { name: "Basmati Rice (cooked)",    category: "Grains",    per100Calories: 130,  per100Protein: 2.7,  per100Carbs: 28.2, per100Fat: 0.3,  per100Fiber: 0.4 },
    { name: "Roti / Chapati (plain)",   category: "Grains",    per100Calories: 297,  per100Protein: 9.0,  per100Carbs: 57.0, per100Fat: 3.7,  per100Fiber: 3.9 },
    { name: "Paratha (plain)",          category: "Grains",    per100Calories: 300,  per100Protein: 7.5,  per100Carbs: 45.0, per100Fat: 9.5,  per100Fiber: 3.2 },
    { name: "Poha (cooked)",            category: "Grains",    per100Calories: 130,  per100Protein: 2.4,  per100Carbs: 27.0, per100Fat: 1.0,  per100Fiber: 1.1 },
    { name: "Upma (plain)",             category: "Grains",    per100Calories: 150,  per100Protein: 3.5,  per100Carbs: 26.0, per100Fat: 4.0,  per100Fiber: 1.5 },
    { name: "Idli (steamed)",           category: "Grains",    per100Calories: 130,  per100Protein: 3.5,  per100Carbs: 26.0, per100Fat: 0.5,  per100Fiber: 1.0 },
    { name: "Dosa (plain)",             category: "Grains",    per100Calories: 168,  per100Protein: 3.9,  per100Carbs: 30.0, per100Fat: 3.7,  per100Fiber: 1.2 },
    { name: "Bread (white, slice)",     category: "Grains",    per100Calories: 265,  per100Protein: 9.0,  per100Carbs: 49.0, per100Fat: 3.2,  per100Fiber: 2.3 },
    { name: "Bread (brown/whole wheat)",category: "Grains",    per100Calories: 247,  per100Protein: 11.0, per100Carbs: 43.0, per100Fat: 3.4,  per100Fiber: 6.8 },
    { name: "Oats (dry rolled)",        category: "Grains",    per100Calories: 389,  per100Protein: 17.0, per100Carbs: 66.0, per100Fat: 7.0,  per100Fiber: 11.0 },

    // ── Dals & Legumes ──
    { name: "Toor Dal (cooked)",        category: "Legumes",   per100Calories: 116,  per100Protein: 7.2,  per100Carbs: 20.0, per100Fat: 0.4,  per100Fiber: 5.2 },
    { name: "Masoor Dal (cooked)",      category: "Legumes",   per100Calories: 116,  per100Protein: 9.0,  per100Carbs: 20.0, per100Fat: 0.4,  per100Fiber: 4.0 },
    { name: "Chana Dal (cooked)",       category: "Legumes",   per100Calories: 164,  per100Protein: 9.5,  per100Carbs: 27.5, per100Fat: 2.5,  per100Fiber: 8.0 },
    { name: "Rajma (cooked)",           category: "Legumes",   per100Calories: 127,  per100Protein: 8.7,  per100Carbs: 22.8, per100Fat: 0.5,  per100Fiber: 7.4 },
    { name: "Chole / Chickpeas (cooked)",category:"Legumes",   per100Calories: 164,  per100Protein: 8.9,  per100Carbs: 27.4, per100Fat: 2.6,  per100Fiber: 7.6 },
    { name: "Moong Dal (cooked)",       category: "Legumes",   per100Calories: 105,  per100Protein: 7.0,  per100Carbs: 19.0, per100Fat: 0.4,  per100Fiber: 4.1 },

    // ── Vegetables ──
    { name: "Aloo (potato, boiled)",    category: "Vegetables",per100Calories: 87,   per100Protein: 1.9,  per100Carbs: 20.1, per100Fat: 0.1,  per100Fiber: 1.8 },
    { name: "Palak (spinach, cooked)",  category: "Vegetables",per100Calories: 23,   per100Protein: 2.9,  per100Carbs: 3.6,  per100Fat: 0.4,  per100Fiber: 2.4 },
    { name: "Bhindi / Okra (cooked)",   category: "Vegetables",per100Calories: 33,   per100Protein: 2.0,  per100Carbs: 7.0,  per100Fat: 0.2,  per100Fiber: 3.2 },
    { name: "Tamatar / Tomato",         category: "Vegetables",per100Calories: 18,   per100Protein: 0.9,  per100Carbs: 3.9,  per100Fat: 0.2,  per100Fiber: 1.2 },
    { name: "Pyaaz / Onion",            category: "Vegetables",per100Calories: 40,   per100Protein: 1.1,  per100Carbs: 9.3,  per100Fat: 0.1,  per100Fiber: 1.7 },
    { name: "Gobhi / Cauliflower",      category: "Vegetables",per100Calories: 25,   per100Protein: 1.9,  per100Carbs: 5.0,  per100Fat: 0.3,  per100Fiber: 2.0 },
    { name: "Gajar / Carrot",           category: "Vegetables",per100Calories: 41,   per100Protein: 0.9,  per100Carbs: 9.6,  per100Fat: 0.2,  per100Fiber: 2.8 },

    // ── Dairy ──
    { name: "Paneer (full fat)",        category: "Dairy",     per100Calories: 265,  per100Protein: 18.3, per100Carbs: 1.2,  per100Fat: 20.8, per100Fiber: 0.0 },
    { name: "Dahi / Curd (full fat)",   category: "Dairy",     per100Calories: 98,   per100Protein: 11.0, per100Carbs: 3.4,  per100Fat: 4.3,  per100Fiber: 0.0 },
    { name: "Dahi / Curd (low fat)",    category: "Dairy",     per100Calories: 63,   per100Protein: 5.7,  per100Carbs: 7.0,  per100Fat: 1.6,  per100Fiber: 0.0 },
    { name: "Milk (full fat, 3.5%)",    category: "Dairy",     per100Calories: 61,   per100Protein: 3.2,  per100Carbs: 4.8,  per100Fat: 3.5,  per100Fiber: 0.0 },
    { name: "Milk (toned, 1.5%)",       category: "Dairy",     per100Calories: 45,   per100Protein: 3.1,  per100Carbs: 4.6,  per100Fat: 1.5,  per100Fiber: 0.0 },
    { name: "Ghee",                     category: "Dairy",     per100Calories: 900,  per100Protein: 0.0,  per100Carbs: 0.0,  per100Fat: 99.8, per100Fiber: 0.0 },
    { name: "Butter (salted)",          category: "Dairy",     per100Calories: 717,  per100Protein: 0.9,  per100Carbs: 0.1,  per100Fat: 81.0, per100Fiber: 0.0 },

    // ── Eggs & Meat ──
    { name: "Egg (whole, boiled)",      category: "Protein",   per100Calories: 155,  per100Protein: 13.0, per100Carbs: 1.1,  per100Fat: 11.0, per100Fiber: 0.0 },
    { name: "Egg White (boiled)",       category: "Protein",   per100Calories: 52,   per100Protein: 10.9, per100Carbs: 0.7,  per100Fat: 0.2,  per100Fiber: 0.0 },
    { name: "Chicken Breast (cooked)",  category: "Protein",   per100Calories: 165,  per100Protein: 31.0, per100Carbs: 0.0,  per100Fat: 3.6,  per100Fiber: 0.0 },
    { name: "Chicken Thigh (cooked)",   category: "Protein",   per100Calories: 209,  per100Protein: 26.0, per100Carbs: 0.0,  per100Fat: 10.9, per100Fiber: 0.0 },
    { name: "Mutton / Lamb (cooked)",   category: "Protein",   per100Calories: 258,  per100Protein: 25.6, per100Carbs: 0.0,  per100Fat: 16.5, per100Fiber: 0.0 },
    { name: "Salmon (cooked)",          category: "Protein",   per100Calories: 208,  per100Protein: 20.0, per100Carbs: 0.0,  per100Fat: 13.0, per100Fiber: 0.0 },
    { name: "Rohu Fish (cooked)",       category: "Protein",   per100Calories: 97,   per100Protein: 16.6, per100Carbs: 0.0,  per100Fat: 3.0,  per100Fiber: 0.0 },

    // ── Nuts & Seeds ──
    { name: "Almonds (raw)",            category: "Nuts",      per100Calories: 579,  per100Protein: 21.2, per100Carbs: 21.6, per100Fat: 49.9, per100Fiber: 12.5 },
    { name: "Walnuts (raw)",            category: "Nuts",      per100Calories: 654,  per100Protein: 15.2, per100Carbs: 13.7, per100Fat: 65.2, per100Fiber: 6.7 },
    { name: "Peanuts (roasted)",        category: "Nuts",      per100Calories: 567,  per100Protein: 25.8, per100Carbs: 16.1, per100Fat: 49.2, per100Fiber: 8.5 },
    { name: "Chia Seeds (raw)",         category: "Nuts",      per100Calories: 486,  per100Protein: 16.5, per100Carbs: 42.1, per100Fat: 30.7, per100Fiber: 34.4 },

    // ── Fruits ──
    { name: "Banana (ripe)",            category: "Fruits",    per100Calories: 89,   per100Protein: 1.1,  per100Carbs: 22.8, per100Fat: 0.3,  per100Fiber: 2.6 },
    { name: "Apple",                    category: "Fruits",    per100Calories: 52,   per100Protein: 0.3,  per100Carbs: 14.0, per100Fat: 0.2,  per100Fiber: 2.4 },
    { name: "Mango (Alphonso, ripe)",   category: "Fruits",    per100Calories: 60,   per100Protein: 0.8,  per100Carbs: 15.0, per100Fat: 0.4,  per100Fiber: 1.6 },
    { name: "Papaya (ripe)",            category: "Fruits",    per100Calories: 43,   per100Protein: 0.5,  per100Carbs: 11.0, per100Fat: 0.3,  per100Fiber: 1.7 },
    { name: "Orange",                   category: "Fruits",    per100Calories: 47,   per100Protein: 0.9,  per100Carbs: 11.8, per100Fat: 0.1,  per100Fiber: 2.4 },
    { name: "Guava",                    category: "Fruits",    per100Calories: 68,   per100Protein: 2.6,  per100Carbs: 14.3, per100Fat: 0.9,  per100Fiber: 5.4 },

    // ── Street Food / Ready-to-eat ──
    { name: "Vada Pav",                 category: "Street",    per100Calories: 215,  per100Protein: 5.8,  per100Carbs: 32.0, per100Fat: 7.5,  per100Fiber: 2.0 },
    { name: "Samosa (fried, potato)",   category: "Street",    per100Calories: 262,  per100Protein: 5.0,  per100Carbs: 30.0, per100Fat: 13.5, per100Fiber: 2.5 },
    { name: "Pav Bhaji",                category: "Street",    per100Calories: 173,  per100Protein: 4.0,  per100Carbs: 28.0, per100Fat: 5.0,  per100Fiber: 3.5 },
    { name: "Misal Pav (with pav)",     category: "Street",    per100Calories: 195,  per100Protein: 7.5,  per100Carbs: 30.0, per100Fat: 5.5,  per100Fiber: 5.0 },
    { name: "Biryani (chicken)",        category: "Street",    per100Calories: 200,  per100Protein: 11.0, per100Carbs: 27.0, per100Fat: 5.5,  per100Fiber: 1.0 },

    // ── Beverages ──
    { name: "Chai (milk tea, with sugar)", category: "Drinks", per100Calories: 55,   per100Protein: 1.5,  per100Carbs: 8.5,  per100Fat: 1.5,  per100Fiber: 0.0 },
    { name: "Lassi (sweet)",            category: "Drinks",    per100Calories: 93,   per100Protein: 3.1,  per100Carbs: 13.0, per100Fat: 3.1,  per100Fiber: 0.0 },
    { name: "Coconut Water",            category: "Drinks",    per100Calories: 19,   per100Protein: 0.7,  per100Carbs: 3.7,  per100Fat: 0.2,  per100Fiber: 1.1 },
    { name: "Protein Whey (1 scoop ~30g)", category: "Supplements", per100Calories: 370, per100Protein: 80.0, per100Carbs: 7.0, per100Fat: 4.5, per100Fiber: 1.0 },
  ] as const;

  let created = 0;
  for (const food of foods) {
    const existing = await prisma.foodItem.findFirst({
      where: { name: food.name, userId: null },
    });
    if (!existing) {
      await prisma.foodItem.create({
        data: { ...food, isCustom: false, userId: null },
      });
      created++;
    }
  }
  console.log(`✅ Seeded ${created} food items (${foods.length - created} already existed)`);

  console.log("🎉 Nutrition seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());