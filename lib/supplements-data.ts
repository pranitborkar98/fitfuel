// lib/supplements-data.ts
// Phase 8 — Static supplement catalogue
// No DB until supplier is confirmed. Wire prices + stock later.

export type SupplementGoal = "muscle_gain" | "weight_loss" | "balanced" | "performance";
export type SupplementCategory = "protein" | "performance" | "recovery" | "health" | "weight";

export interface Supplement {
  id: string;
  name: string;
  category: SupplementCategory;
  tagline: string;
  description: string;
  benefits: string[];
  dosage: string;
  timing: string;
  goals: SupplementGoal[];
  accent: string;
  priceRange: string;       // placeholder — update when supplier confirmed
  popular: boolean;
  veganFriendly: boolean;
  emoji: string;
}

export const SUPPLEMENTS: Supplement[] = [
  // ── Protein ──────────────────────────────────────────────────────────────
  {
    id: "whey-protein",
    name: "Whey Protein Concentrate",
    category: "protein",
    tagline: "The foundation of muscle growth",
    description: "High-quality whey protein with 24g protein per serving. Fast-absorbing, ideal post-workout for muscle repair and growth.",
    benefits: ["24g protein per serving", "Fast absorption post-workout", "Supports muscle repair", "Reduces soreness"],
    dosage: "25–30g",
    timing: "Within 30 min post-workout",
    goals: ["muscle_gain", "balanced"],
    accent: "#a3e635",
    priceRange: "₹1,500–2,500/mo",
    popular: true,
    veganFriendly: false,
    emoji: "🥛",
  },
  {
    id: "casein-protein",
    name: "Casein Protein",
    category: "protein",
    tagline: "Slow-release overnight fuel",
    description: "Slow-digesting protein that feeds muscles through the night. Prevents catabolism during long fasting windows.",
    benefits: ["7-8hr amino acid release", "Prevents muscle breakdown overnight", "Improves morning recovery"],
    dosage: "25–30g",
    timing: "30 min before bed",
    goals: ["muscle_gain"],
    accent: "#a3e635",
    priceRange: "₹1,800–2,800/mo",
    popular: false,
    veganFriendly: false,
    emoji: "🌙",
  },
  {
    id: "plant-protein",
    name: "Plant Protein Blend",
    category: "protein",
    tagline: "Complete plant-based protein",
    description: "Pea + Rice + Hemp blend delivering a full amino acid profile. Perfect for vegetarians, vegans, and those with dairy intolerance.",
    benefits: ["Complete amino acid profile", "Vegan & lactose-free", "Easy to digest", "Sustainable source"],
    dosage: "25–30g",
    timing: "Post-workout or between meals",
    goals: ["muscle_gain", "weight_loss", "balanced"],
    accent: "#a3e635",
    priceRange: "₹1,200–2,200/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🌿",
  },

  // ── Performance ───────────────────────────────────────────────────────────
  {
    id: "creatine",
    name: "Creatine Monohydrate",
    category: "performance",
    tagline: "The most researched supplement ever",
    description: "5g per day of pure creatine monohydrate. Increases ATP production, strength output, and long-term muscle size.",
    benefits: ["Increases strength by 5–15%", "More reps per set", "Accelerates muscle gain", "Backed by 200+ studies"],
    dosage: "5g daily",
    timing: "Any time — consistency matters most",
    goals: ["muscle_gain", "performance"],
    accent: "#c084fc",
    priceRange: "₹400–800/mo",
    popular: true,
    veganFriendly: true,
    emoji: "⚡",
  },
  {
    id: "pre-workout",
    name: "Pre-Workout Complex",
    category: "performance",
    tagline: "Unleash your best session every time",
    description: "Caffeine + Beta-Alanine + L-Citrulline blend. Clean energy, skin-splitting pumps, no crash.",
    benefits: ["Sustained clean energy", "Improved endurance", "Better muscle pumps", "No post-crash"],
    dosage: "1 scoop (7–10g)",
    timing: "30 min before training",
    goals: ["muscle_gain", "performance"],
    accent: "#c084fc",
    priceRange: "₹800–1,500/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🔥",
  },
  {
    id: "bcaa",
    name: "BCAA Complex (2:1:1)",
    category: "performance",
    tagline: "Fuel muscle, prevent breakdown",
    description: "Leucine:Isoleucine:Valine in 2:1:1 ratio. Prevents muscle catabolism during training and speeds intra-workout recovery.",
    benefits: ["Reduces muscle breakdown", "Improves endurance", "Intra-workout fuel", "Reduces DOMS"],
    dosage: "5–10g",
    timing: "During workout",
    goals: ["muscle_gain", "performance"],
    accent: "#c084fc",
    priceRange: "₹600–1,200/mo",
    popular: false,
    veganFriendly: true,
    emoji: "💪",
  },

  // ── Recovery ──────────────────────────────────────────────────────────────
  {
    id: "omega3",
    name: "Omega-3 Fish Oil",
    category: "recovery",
    tagline: "The anti-inflammatory essential",
    description: "1000mg EPA+DHA per softgel. Reduces systemic inflammation, supports joint, heart, and brain health.",
    benefits: ["Reduces inflammation", "Joint health & mobility", "Heart health", "Brain & mood support"],
    dosage: "2–3g EPA+DHA",
    timing: "With any meal",
    goals: ["muscle_gain", "weight_loss", "balanced", "performance"],
    accent: "#38bdf8",
    priceRange: "₹400–800/mo",
    popular: true,
    veganFriendly: false,
    emoji: "🐟",
  },
  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    category: "recovery",
    tagline: "Sleep deeper, recover faster",
    description: "Highly bioavailable magnesium form. Most active people are deficient — this fixes sleep quality, muscle cramps, and recovery.",
    benefits: ["Deeper sleep cycles", "Reduces muscle cramps", "Stress & cortisol reduction", "Nerve function"],
    dosage: "300–400mg",
    timing: "30–60 min before bed",
    goals: ["muscle_gain", "balanced", "performance"],
    accent: "#38bdf8",
    priceRange: "₹400–700/mo",
    popular: false,
    veganFriendly: true,
    emoji: "😴",
  },
  {
    id: "glutamine",
    name: "L-Glutamine",
    category: "recovery",
    tagline: "Gut health meets muscle recovery",
    description: "Most abundant amino acid in muscle. Supports gut lining integrity and accelerates post-workout muscle recovery.",
    benefits: ["Faster muscle recovery", "Gut health & immunity", "Reduces soreness", "Prevents overtraining"],
    dosage: "5g",
    timing: "Post-workout or before bed",
    goals: ["muscle_gain", "performance"],
    accent: "#38bdf8",
    priceRange: "₹500–900/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🫀",
  },

  // ── Health ────────────────────────────────────────────────────────────────
  {
    id: "multivitamin",
    name: "Sports Multivitamin",
    category: "health",
    tagline: "Fill every nutritional gap",
    description: "25+ vitamins and minerals in athlete-optimised doses. The daily non-negotiable for anyone training hard.",
    benefits: ["Fills dietary micronutrient gaps", "Immune system support", "Energy metabolism", "Active lifestyle formula"],
    dosage: "2 tablets",
    timing: "With breakfast",
    goals: ["muscle_gain", "weight_loss", "balanced", "performance"],
    accent: "#fbbf24",
    priceRange: "₹300–600/mo",
    popular: true,
    veganFriendly: true,
    emoji: "💊",
  },
  {
    id: "vitamin-d3",
    name: "Vitamin D3 + K2",
    category: "health",
    tagline: "The sunshine vitamin — optimised",
    description: "5000 IU Vitamin D3 paired with K2 for proper calcium direction. Critical for muscle function, immunity, and mood — especially in India.",
    benefits: ["Muscle function & strength", "Immune system", "Mood & energy", "Calcium absorption"],
    dosage: "5000 IU D3 + 100mcg K2",
    timing: "With a fatty meal",
    goals: ["muscle_gain", "weight_loss", "balanced"],
    accent: "#fbbf24",
    priceRange: "₹300–500/mo",
    popular: false,
    veganFriendly: true,
    emoji: "☀️",
  },
  {
    id: "zma",
    name: "ZMA (Zinc + Magnesium + B6)",
    category: "health",
    tagline: "Testosterone and recovery support",
    description: "Clinical ZMA formula — Zinc for testosterone, Magnesium for sleep, B6 for absorption. Taken on an empty stomach before bed.",
    benefits: ["Supports testosterone levels", "Deep sleep quality", "Immune boost", "Muscle recovery"],
    dosage: "3 capsules",
    timing: "Before bed on empty stomach",
    goals: ["muscle_gain", "performance"],
    accent: "#fbbf24",
    priceRange: "₹300–600/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🧬",
  },

  // ── Weight Management ─────────────────────────────────────────────────────
  {
    id: "l-carnitine",
    name: "L-Carnitine",
    category: "weight",
    tagline: "Turn stored fat into fuel",
    description: "Shuttles long-chain fatty acids into mitochondria for energy production. Most effective when paired with cardio.",
    benefits: ["Increases fat oxidation", "Boosts cardio energy", "Preserves muscle mass", "Improves recovery"],
    dosage: "1,000–2,000mg",
    timing: "30 min pre-cardio",
    goals: ["weight_loss"],
    accent: "#fb923c",
    priceRange: "₹400–800/mo",
    popular: true,
    veganFriendly: true,
    emoji: "🔥",
  },
  {
    id: "cla",
    name: "CLA (Conjugated Linoleic Acid)",
    category: "weight",
    tagline: "Lean out while keeping muscle",
    description: "Natural omega-6 fatty acid that supports fat loss while protecting lean muscle mass during a caloric deficit.",
    benefits: ["Fat loss support", "Lean muscle preservation", "Metabolism support", "Appetite regulation"],
    dosage: "3g",
    timing: "With main meals",
    goals: ["weight_loss"],
    accent: "#fb923c",
    priceRange: "₹500–900/mo",
    popular: false,
    veganFriendly: true,
    emoji: "⚖️",
  },
  {
    id: "green-tea",
    name: "Green Tea Extract (EGCG)",
    category: "weight",
    tagline: "Natural thermogenic — no jitters",
    description: "Standardised EGCG extract delivering a 3–4% metabolic boost. Antioxidant-rich, gentle energy without stimulant effects.",
    benefits: ["Metabolic rate boost", "Rich in antioxidants", "Gentle natural energy", "Supports fat oxidation"],
    dosage: "500mg EGCG",
    timing: "Before meals",
    goals: ["weight_loss"],
    accent: "#fb923c",
    priceRange: "₹300–600/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🍵",
  },
];

// ── Personalised Stacks ───────────────────────────────────────────────────────

export const STACKS: Record<SupplementGoal, string[]> = {
  muscle_gain:  ["whey-protein", "creatine", "bcaa", "omega3", "multivitamin"],
  weight_loss:  ["l-carnitine", "omega3", "green-tea", "multivitamin", "vitamin-d3"],
  balanced:     ["whey-protein", "omega3", "multivitamin", "vitamin-d3", "magnesium"],
  performance:  ["pre-workout", "creatine", "bcaa", "omega3", "multivitamin"],
};

// Vegan swaps
export const VEGAN_SWAPS: Record<string, string> = {
  "whey-protein": "plant-protein",
  "casein-protein": "plant-protein",
  "omega3": "vitamin-d3", // algae omega-3 not in catalogue yet — TODO Phase 8 v2
};

// ── Quiz Logic ────────────────────────────────────────────────────────────────

export interface QuizAnswers {
  goal: SupplementGoal;
  frequency: "low" | "medium" | "high";
  challenge: "recovery" | "energy" | "strength" | "weight" | "sleep";
  diet: "veg" | "nonveg" | "vegan";
  budget: "low" | "mid" | "high";
}

export function resolveStack(answers: QuizAnswers): string[] {
  let stack = [...STACKS[answers.goal]];

  // Diet overrides — swap non-vegan items
  if (answers.diet === "vegan") {
    stack = stack.map((id) => VEGAN_SWAPS[id] ?? id);
    // deduplicate
    stack = [...new Set(stack)];
  }

  // Budget trim — low budget removes lowest-priority 5th item
  if (answers.budget === "low") {
    stack = stack.slice(0, 4);
  }

  // Challenge boost — add targeted supplement if not already in stack
  const challengeBoosts: Record<QuizAnswers["challenge"], string> = {
    recovery: "magnesium",
    energy:   "vitamin-d3",
    strength: "creatine",
    weight:   "l-carnitine",
    sleep:    "magnesium",
  };
  const boost = challengeBoosts[answers.challenge];
  if (boost && !stack.includes(boost)) {
    stack = [...stack.slice(0, 4), boost];
  }

  // Deduplicate + limit to 5
  return [...new Set(stack)].slice(0, 5);
}

export function getSupplementById(id: string): Supplement | undefined {
  return SUPPLEMENTS.find((s) => s.id === id);
}

export const CATEGORY_META: Record<SupplementCategory, { label: string; accent: string; emoji: string }> = {
  protein:     { label: "Protein",            accent: "#a3e635", emoji: "🥛" },
  performance: { label: "Performance",        accent: "#c084fc", emoji: "⚡" },
  recovery:    { label: "Recovery",           accent: "#38bdf8", emoji: "🔄" },
  health:      { label: "Health & Vitamins",  accent: "#fbbf24", emoji: "💊" },
  weight:      { label: "Weight Management",  accent: "#fb923c", emoji: "⚖️" },
};

export const GOAL_META: Record<SupplementGoal, { label: string; emoji: string; accent: string; description: string }> = {
  muscle_gain:  { label: "Muscle Gain",       emoji: "💪", accent: "#a3e635", description: "Build size, strength, and lean mass" },
  weight_loss:  { label: "Fat Loss",          emoji: "🔥", accent: "#fb923c", description: "Burn fat while preserving muscle" },
  balanced:     { label: "Balanced Health",   emoji: "⚖️", accent: "#38bdf8", description: "Optimise health, energy, and wellbeing" },
  performance:  { label: "Peak Performance",  emoji: "⚡", accent: "#c084fc", description: "Push your athletic limits further" },
};
