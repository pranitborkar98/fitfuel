import "dotenv/config";
// seed-supplements.ts — WS / Phase 18 · F5 catalog population.
//
// HOW TO USE:
//   1. For each product below, paste your real Nutrabay AFFILIATE url + price into
//      the `nutrabay` block (look for  url: "PASTE_NUTRABAY_URL"  ).
//      Use your tracked affiliate link (ref pranit1944) — paste the FULL url.
//   2. Place this file at the repo root: C:\Users\VCOM\fitfuel\seed-supplements.ts
//   3. Run:  npx tsx seed-supplements.ts
//
// IDEMPOTENT — safe to run as many times as you like:
//   • categories + supplements upsert by slug (content refreshes, no dupes)
//   • a product whose url is still "PASTE_NUTRABAY_URL" seeds the educational
//     card but NO buy-link (no dead button). Fill the url + re-run to add it.
//   • a product with a real https url gets/updates a single active NUTRABAY link.
//
// Educational content here is general supplement science — your affiliate data
// (urls/prices) is the only thing you supply.

import { prisma } from "./lib/prisma";

const db = prisma as any;

type Goal = "MUSCLE_GAIN" | "WEIGHT_LOSS" | "BALANCED" | "PERFORMANCE";

type Product = {
  slug: string;
  name: string;
  brandName?: string;
  categorySlug: string;
  tagline?: string;
  aka?: string[];
  description?: string;
  mechanism?: string;
  benefits?: string[];
  dosage?: string;
  timing?: string;
  form?: string;
  evidenceLevel?: "very_high" | "high" | "moderate" | "low" | "preliminary";
  warnings?: string;
  sideEffects?: string[];
  veganFriendly?: boolean;
  popular?: boolean;
  indiaAvailability?: string;
  recommendedFor: Goal[];
  emoji?: string;
  priceRange?: string;
  isFeatured?: boolean;
  // Paste your real affiliate data here:
  nutrabay: { url: string; priceRs?: number; mrpRs?: number; notes?: string };
};

const CATEGORIES: { slug: string; name: string; emoji?: string; sortOrder: number }[] = [
  { slug: "protein",        name: "Protein",            emoji: "🥛", sortOrder: 1 },
  { slug: "creatine",       name: "Creatine",           emoji: "⚡", sortOrder: 2 },
  { slug: "essentials",     name: "Daily Essentials",   emoji: "🧬", sortOrder: 3 },
  { slug: "performance",    name: "Performance",        emoji: "🔥", sortOrder: 4 },
  { slug: "recovery",       name: "Recovery & Sleep",   emoji: "🌙", sortOrder: 5 },
];

const PRODUCTS: Product[] = [
  {
    slug: "whey-protein-isolate",
    name: "Whey Protein Isolate",
    categorySlug: "protein",
    tagline: "The cleanest, fastest-absorbing protein for muscle repair.",
    aka: ["WPI", "Isolate"],
    description:
      "Whey isolate is filtered to ~90% protein with minimal carbs, fat and lactose — ideal when you want grams of protein without the extras.",
    mechanism:
      "Rich in leucine, which switches on muscle protein synthesis after training.",
    benefits: ["High protein per scoop", "Very low lactose", "Fast absorption", "Supports lean-muscle recovery"],
    dosage: "1 scoop (~25–30 g protein), 1–2× daily",
    timing: "Post-workout or any time you're short on protein",
    form: "Powder",
    evidenceLevel: "very_high",
    sideEffects: ["Rare bloating if lactose-sensitive (isolate is low-lactose)"],
    veganFriendly: false,
    popular: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["MUSCLE_GAIN", "WEIGHT_LOSS", "BALANCED"],
    emoji: "🥛",
    priceRange: "₹1,800–₹3,500 / kg",
    isFeatured: true,
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "1 kg pack" },
  },
  {
    slug: "whey-protein-concentrate",
    name: "Whey Protein Concentrate",
    categorySlug: "protein",
    tagline: "Best value protein for everyday muscle support.",
    aka: ["WPC"],
    description:
      "Concentrate is ~70–80% protein — slightly more carbs/fat than isolate but the best cost-per-gram for most people.",
    mechanism: "Same leucine-driven muscle protein synthesis as isolate, at a lower price point.",
    benefits: ["Excellent value", "Complete amino profile", "Supports daily protein target"],
    dosage: "1 scoop (~24 g protein), 1–2× daily",
    timing: "Any time; common post-workout",
    form: "Powder",
    evidenceLevel: "very_high",
    sideEffects: ["Bloating if lactose-intolerant"],
    veganFriendly: false,
    popular: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["MUSCLE_GAIN", "BALANCED"],
    emoji: "🥛",
    priceRange: "₹1,200–₹2,500 / kg",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "1 kg pack" },
  },
  {
    slug: "plant-protein",
    name: "Plant Protein",
    categorySlug: "protein",
    tagline: "Vegan-friendly protein from pea, rice & seeds.",
    description:
      "A blend (typically pea + brown rice) that delivers a complete amino profile without dairy — for vegetarians/vegans or the lactose-sensitive.",
    mechanism: "Combined plant sources cover all essential amino acids for muscle repair.",
    benefits: ["100% plant-based", "Dairy-free", "Easy on digestion", "Good fibre"],
    dosage: "1 scoop (~24 g protein), 1–2× daily",
    timing: "Any time",
    form: "Powder",
    evidenceLevel: "high",
    veganFriendly: true,
    popular: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["MUSCLE_GAIN", "WEIGHT_LOSS", "BALANCED"],
    emoji: "🌱",
    priceRange: "₹1,500–₹3,000 / kg",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "1 kg pack" },
  },
  {
    slug: "creatine-monohydrate",
    name: "Creatine Monohydrate",
    categorySlug: "creatine",
    tagline: "The most researched performance supplement, period.",
    aka: ["Creatine", "Mono"],
    description:
      "Creatine helps regenerate ATP, your muscles' fast energy currency — letting you squeeze out more reps and recover between sets.",
    mechanism: "Increases phosphocreatine stores, improving short-burst strength and power output.",
    benefits: ["More strength & power", "Better training volume", "Supports muscle growth", "Cognitive support"],
    dosage: "3–5 g daily (no loading needed)",
    timing: "Any time, daily — consistency matters more than timing",
    form: "Powder",
    evidenceLevel: "very_high",
    sideEffects: ["Minor water retention", "GI upset if taken dry / over-dosed"],
    veganFriendly: true,
    popular: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["MUSCLE_GAIN", "PERFORMANCE"],
    emoji: "⚡",
    priceRange: "₹600–₹1,500 / 250 g",
    isFeatured: true,
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "250 g, 50 servings" },
  },
  {
    slug: "omega-3-fish-oil",
    name: "Omega-3 Fish Oil",
    categorySlug: "essentials",
    tagline: "EPA & DHA for heart, joints and recovery.",
    aka: ["Fish Oil", "EPA/DHA"],
    description:
      "Most Indian diets are low in omega-3s. Fish oil supplies EPA and DHA, which support cardiovascular health, joints and reduced inflammation.",
    mechanism: "EPA/DHA are anti-inflammatory fatty acids incorporated into cell membranes.",
    benefits: ["Heart health", "Joint comfort", "Recovery", "Brain support"],
    dosage: "1–2 g combined EPA+DHA daily",
    timing: "With a meal containing fat",
    form: "Softgel",
    evidenceLevel: "very_high",
    sideEffects: ["Fishy aftertaste", "Mild GI upset"],
    veganFriendly: false,
    popular: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["BALANCED", "PERFORMANCE", "WEIGHT_LOSS"],
    emoji: "🐟",
    priceRange: "₹500–₹1,200 / 60 caps",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "60 softgels" },
  },
  {
    slug: "vitamin-d3",
    name: "Vitamin D3",
    categorySlug: "essentials",
    tagline: "The sunshine vitamin most Indians are low on.",
    aka: ["D3", "Cholecalciferol"],
    description:
      "Vitamin D deficiency is extremely common in India. D3 supports bone health, immunity, mood and testosterone.",
    mechanism: "Acts as a hormone regulating calcium absorption, immune and muscle function.",
    benefits: ["Bone strength", "Immune support", "Mood", "Hormonal health"],
    dosage: "1,000–2,000 IU daily (or as advised after a blood test)",
    timing: "With a fat-containing meal",
    form: "Softgel / Tablet",
    evidenceLevel: "very_high",
    warnings: "Very high doses can be harmful — test levels if unsure.",
    veganFriendly: false,
    popular: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["BALANCED", "PERFORMANCE"],
    emoji: "☀️",
    priceRange: "₹250–₹700 / 60 caps",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "60 capsules" },
  },
  {
    slug: "multivitamin",
    name: "Multivitamin",
    categorySlug: "essentials",
    tagline: "Daily insurance for the gaps in your diet.",
    description:
      "A broad multivitamin covers micronutrient gaps that are easy to miss when dieting or training hard. Not a replacement for food.",
    mechanism: "Supplies a baseline of vitamins and minerals supporting energy metabolism and recovery.",
    benefits: ["Covers dietary gaps", "Energy metabolism", "Convenient"],
    dosage: "1 serving daily, with food",
    timing: "With breakfast",
    form: "Tablet",
    evidenceLevel: "moderate",
    veganFriendly: false,
    indiaAvailability: "Widely available",
    recommendedFor: ["BALANCED", "MUSCLE_GAIN", "WEIGHT_LOSS"],
    emoji: "🧬",
    priceRange: "₹400–₹1,000 / 60 tabs",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "60 tablets" },
  },
  {
    slug: "pre-workout",
    name: "Pre-Workout",
    categorySlug: "performance",
    tagline: "Energy, focus and pumps before you train.",
    description:
      "Caffeine-based formulas (often with citrulline & beta-alanine) to boost energy, focus and training output.",
    mechanism: "Caffeine raises alertness; citrulline supports blood flow; beta-alanine buffers fatigue.",
    benefits: ["More energy", "Sharper focus", "Better pumps", "Higher training volume"],
    dosage: "1 scoop, 20–30 min before training",
    timing: "Pre-workout only; avoid late evening",
    form: "Powder",
    evidenceLevel: "high",
    warnings: "Contains caffeine — mind total daily intake and avoid before bed.",
    sideEffects: ["Tingling (beta-alanine)", "Jitters if caffeine-sensitive"],
    veganFriendly: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["PERFORMANCE", "MUSCLE_GAIN"],
    emoji: "🔥",
    priceRange: "₹900–₹2,200 / tub",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "30 servings" },
  },
  {
    slug: "magnesium",
    name: "Magnesium",
    categorySlug: "recovery",
    tagline: "For sleep, muscle relaxation and recovery.",
    description:
      "Magnesium supports hundreds of enzyme reactions, including muscle relaxation and sleep quality — and many people run low.",
    mechanism: "Regulates neuromuscular function and supports the nervous system's wind-down.",
    benefits: ["Better sleep", "Muscle relaxation", "Cramp support", "Stress support"],
    dosage: "200–400 mg elemental, evening",
    timing: "Before bed",
    form: "Tablet / Powder",
    evidenceLevel: "high",
    sideEffects: ["Loose stools at high doses (citrate form)"],
    veganFriendly: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["BALANCED", "PERFORMANCE"],
    emoji: "🌙",
    priceRange: "₹400–₹900 / 60 tabs",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "60 tablets" },
  },
  {
    slug: "ashwagandha",
    name: "Ashwagandha (KSM-66)",
    categorySlug: "recovery",
    tagline: "Adaptogen for stress, sleep and recovery.",
    description:
      "A standardised ashwagandha extract studied for lowering stress markers and supporting sleep, recovery and training adaptation.",
    mechanism: "Adaptogen that helps modulate the cortisol stress response.",
    benefits: ["Stress support", "Better sleep", "Recovery", "May support strength"],
    dosage: "300–600 mg standardised extract daily",
    timing: "Evening (or as directed)",
    form: "Capsule",
    evidenceLevel: "high",
    warnings: "Consult a doctor if pregnant, on thyroid medication, or immunosuppressed.",
    veganFriendly: true,
    indiaAvailability: "Widely available",
    recommendedFor: ["BALANCED", "PERFORMANCE"],
    emoji: "🌿",
    priceRange: "₹400–₹1,000 / 60 caps",
    nutrabay: { url: "PASTE_NUTRABAY_URL", priceRs: undefined, mrpRs: undefined, notes: "60 capsules" },
  },
];

const PLACEHOLDER = "PASTE_NUTRABAY_URL";

async function main() {
  console.log("→ Seeding supplement categories…");
  const catIdBySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const row = await db.supplementCategory.upsert({
      where: { slug: c.slug },
      update: { name: c.name, emoji: c.emoji ?? null, sortOrder: c.sortOrder, isActive: true },
      create: { slug: c.slug, name: c.name, emoji: c.emoji ?? null, sortOrder: c.sortOrder, isActive: true },
    });
    catIdBySlug.set(c.slug, row.id);
  }
  console.log(`  ✓ ${CATEGORIES.length} categories`);

  let withLink = 0;
  let contentOnly = 0;

  for (const [i, p] of PRODUCTS.entries()) {
    const categoryId = catIdBySlug.get(p.categorySlug);
    if (!categoryId) {
      console.warn(`  ! skipping ${p.slug}: unknown category ${p.categorySlug}`);
      continue;
    }

    const content = {
      name: p.name,
      brandName: p.brandName ?? null,
      categoryId,
      tagline: p.tagline ?? null,
      aka: p.aka ?? [],
      description: p.description ?? null,
      mechanism: p.mechanism ?? null,
      benefits: p.benefits ?? [],
      dosage: p.dosage ?? null,
      timing: p.timing ?? null,
      form: p.form ?? null,
      evidenceLevel: p.evidenceLevel ?? null,
      warnings: p.warnings ?? null,
      sideEffects: p.sideEffects ?? [],
      veganFriendly: p.veganFriendly ?? false,
      popular: p.popular ?? false,
      indiaAvailability: p.indiaAvailability ?? null,
      recommendedFor: p.recommendedFor,
      priceRange: p.priceRange ?? null,
      emoji: p.emoji ?? null,
      sortOrder: i + 1,
      isFeatured: p.isFeatured ?? false,
      isActive: true,
    };

    const supp = await db.supplement.upsert({
      where: { slug: p.slug },
      update: content,
      create: { slug: p.slug, ...content },
    });

    const url = p.nutrabay.url?.trim();
    const hasRealUrl = !!url && url !== PLACEHOLDER && /^https?:\/\//i.test(url);

    if (hasRealUrl) {
      const existing = await db.supplementLink.findFirst({
        where: { supplementId: supp.id, network: "NUTRABAY" },
        select: { id: true },
      });
      const linkData = {
        network: "NUTRABAY" as const,
        affiliateUrl: url,
        priceRs: p.nutrabay.priceRs ?? null,
        mrpRs: p.nutrabay.mrpRs ?? null,
        notes: p.nutrabay.notes ?? null,
        sortOrder: 0,
        isActive: true,
      };
      if (existing) {
        await db.supplementLink.update({ where: { id: existing.id }, data: linkData });
      } else {
        await db.supplementLink.create({ data: { supplementId: supp.id, ...linkData } });
      }
      withLink++;
      console.log(`  ✓ ${p.slug}  (+ Nutrabay link)`);
    } else {
      contentOnly++;
      console.log(`  ○ ${p.slug}  (content only — paste url to add buy-link)`);
    }
  }

  console.log(`\nDone. ${PRODUCTS.length} products seeded — ${withLink} with buy-links, ${contentOnly} awaiting urls.`);
}

main()
  .then(async () => { await db.$disconnect?.(); process.exit(0); })
  .catch(async (e) => { console.error(e); await db.$disconnect?.(); process.exit(1); });
