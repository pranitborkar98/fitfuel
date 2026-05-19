// lib/supplements-data.ts
// Phase 8 — Full Supplement Catalogue
// 50+ supplements · Deep science-backed data per entry
// Prices: placeholder — update when supplier confirmed

export type SupplementGoal = "muscle_gain" | "weight_loss" | "balanced" | "performance";
export type SupplementCategory =
  | "protein"
  | "performance"
  | "recovery"
  | "health"
  | "weight"
  | "vitamins"
  | "minerals"
  | "adaptogens"
  | "joints"
  | "gut";

export type EvidenceLevel = "very_high" | "high" | "moderate" | "low" | "preliminary";

export interface Supplement {
  id: string;
  name: string;
  aka: string[];                  // alternate / common names
  category: SupplementCategory;
  tagline: string;
  description: string;            // 2-3 sentence overview
  mechanism: string;              // how it works scientifically
  benefits: string[];
  dosage: string;                 // recommended dose
  timing: string;                 // when to take
  form: string;                   // powder / capsule / softgel / liquid
  cyclingRequired: boolean;       // should user cycle on/off?
  stacksWith: string[];           // supplement IDs that pair well
  avoidWith: string[];            // supplement IDs / substances to avoid
  warnings: string;               // contraindications, side effects
  evidenceLevel: EvidenceLevel;
  studyCount: string;             // e.g. "200+ RCTs"
  goals: SupplementGoal[];
  accent: string;
  priceRange: string;
  popular: boolean;
  veganFriendly: boolean;
  emoji: string;
  indiaNote?: string;             // India / Pune specific context
}

// ─────────────────────────────────────────────────────────────────────────────
export const SUPPLEMENTS: Supplement[] = [

  // ══════════════════════════════════════════════════════
  // PROTEIN
  // ══════════════════════════════════════════════════════

  {
    id: "whey-protein",
    name: "Whey Protein Concentrate",
    aka: ["WPC", "Whey Concentrate"],
    category: "protein",
    tagline: "The gold standard of muscle protein",
    description:
      "Derived from milk during cheese production, whey concentrate contains 70–80% protein with small amounts of lactose and fat. Fast-digesting with a complete amino acid profile, it is the most studied protein supplement in sports nutrition.",
    mechanism:
      "Rapidly digested and absorbed (peaks in blood ~60–90 min). High leucine content (≈11%) directly activates mTORC1 signalling to initiate muscle protein synthesis. Also stimulates insulin release, which enhances amino acid uptake.",
    benefits: [
      "24–26g protein per 30g serving",
      "Fastest-absorbing whole-food protein source",
      "Highest leucine content among protein powders",
      "Reduces post-workout muscle soreness",
      "Supports immune function via immunoglobulins",
    ],
    dosage: "25–30g per serving",
    timing: "Within 30–60 min post-workout; or between meals",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["creatine", "bcaa", "glutamine"],
    avoidWith: [],
    warnings:
      "Not suitable for those with dairy allergy. Lactose-intolerant individuals may experience bloating — use isolate instead. Excess protein (>2.2g/kg/day) adds no additional benefit.",
    evidenceLevel: "very_high",
    studyCount: "500+ RCTs",
    goals: ["muscle_gain", "balanced"],
    accent: "#a3e635",
    priceRange: "₹1,500–2,500/mo",
    popular: true,
    veganFriendly: false,
    emoji: "🥛",
    indiaNote: "Widely available in India. MuscleBlaze, Optimum Nutrition, and MyProtein are reliable brands. Beware adulteration — buy from verified sellers.",
  },

  {
    id: "whey-isolate",
    name: "Whey Protein Isolate",
    aka: ["WPI", "Whey Isolate"],
    category: "protein",
    tagline: "Ultra-pure, near-zero lactose",
    description:
      "Filtered beyond concentrate to achieve 90%+ protein content with minimal fat and lactose. Ideal for lactose-sensitive individuals or those in a strict calorie deficit who need pure protein without extras.",
    mechanism:
      "Same MPS activation pathway as concentrate via leucine → mTORC1, but absorbed slightly faster due to lower fat/lactose content. Virtually no gastric distress.",
    benefits: [
      "90%+ protein by weight",
      "Near-zero lactose — gut friendly",
      "Minimal carbohydrates and fat",
      "Faster absorption than concentrate",
      "Ideal for cutting phases",
    ],
    dosage: "25–30g per serving",
    timing: "Post-workout or between meals",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["creatine", "glutamine"],
    avoidWith: [],
    warnings:
      "Still derived from dairy — not suitable for those with milk protein allergy (different from lactose intolerance). More expensive than concentrate.",
    evidenceLevel: "very_high",
    studyCount: "300+ RCTs",
    goals: ["muscle_gain", "weight_loss", "balanced"],
    accent: "#a3e635",
    priceRange: "₹2,000–3,500/mo",
    popular: false,
    veganFriendly: false,
    emoji: "🧪",
  },

  {
    id: "casein-protein",
    name: "Casein Protein",
    aka: ["Micellar Casein", "Slow Protein"],
    category: "protein",
    tagline: "Slow-release overnight muscle fuel",
    description:
      "Casein makes up 80% of milk protein and forms a gel in the stomach, releasing amino acids slowly over 5–7 hours. This makes it ideal before sleep to prevent muscle catabolism during the overnight fast.",
    mechanism:
      "Forms a clot in the acidic stomach environment, slowing gastric emptying. Results in a sustained but lower peak blood amino acid level compared to whey — ideal for anti-catabolic overnight coverage rather than acute MPS spikes.",
    benefits: [
      "5–7hr sustained amino acid release",
      "Prevents overnight muscle breakdown",
      "Higher satiety — reduces late-night hunger",
      "Supports morning recovery",
      "High glutamine content",
    ],
    dosage: "25–40g",
    timing: "30 min before bed",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["magnesium", "zma"],
    avoidWith: [],
    warnings:
      "Dairy-derived — avoid with milk allergy. Thick texture may be unpalatable to some. Mix with minimal water for a pudding consistency.",
    evidenceLevel: "high",
    studyCount: "100+ RCTs",
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
    aka: ["Vegan Protein", "Pea Rice Protein"],
    category: "protein",
    tagline: "Complete plant-based protein",
    description:
      "Typically a blend of pea, brown rice, and hemp proteins. Each source alone is incomplete, but combined they deliver all 9 essential amino acids in adequate ratios. Performs comparably to whey in muscle-building studies.",
    mechanism:
      "Pea protein is rich in leucine and arginine. Rice protein covers methionine, which pea lacks. Together they match whey's amino acid profile closely enough to activate MPS via the same leucine → mTORC1 pathway.",
    benefits: [
      "Complete amino acid profile via blending",
      "Vegan, dairy-free, and soy-free",
      "High digestibility (PDCAAS ≈ 0.9)",
      "Hypoallergenic for most users",
      "Sustainable protein source",
    ],
    dosage: "25–35g per serving",
    timing: "Post-workout or between meals",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["creatine", "vitamin-b12"],
    avoidWith: [],
    warnings:
      "Slightly lower leucine content than whey — use 5–10g more per serving to compensate. Some people find the texture gritty; blend with banana or oat milk.",
    evidenceLevel: "high",
    studyCount: "50+ RCTs",
    goals: ["muscle_gain", "weight_loss", "balanced"],
    accent: "#a3e635",
    priceRange: "₹1,200–2,200/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🌿",
    indiaNote: "Great choice for India's large vegetarian/vegan population. Avoid soy-based options if hormonal balance is a concern.",
  },

  {
    id: "egg-white-protein",
    name: "Egg White Protein",
    aka: ["Albumen Protein", "Egg Protein"],
    category: "protein",
    tagline: "Dairy-free, complete animal protein",
    description:
      "Made from dehydrated egg whites, this protein is lactose-free with a PDCAAS of 1.0 — the highest possible score. Medium absorption rate sits between whey and casein, making it versatile.",
    mechanism:
      "Highly bioavailable with all EAAs. Absorption speed is moderate (2–3 hrs to peak), making it useful both post-workout and between meals. High in branched-chain amino acids without the lactose of dairy.",
    benefits: [
      "PDCAAS of 1.0 — perfect amino acid score",
      "Lactose-free and dairy-free",
      "Medium absorption — versatile timing",
      "Rich in BCAAs and glutamine",
      "Low fat and carbohydrate",
    ],
    dosage: "25–30g",
    timing: "Post-workout or between meals",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["creatine", "omega3"],
    avoidWith: [],
    warnings:
      "Not suitable for egg allergy. More expensive than whey. Ensure product is heat-treated (cooked) to eliminate avidin, which blocks biotin absorption.",
    evidenceLevel: "high",
    studyCount: "40+ studies",
    goals: ["muscle_gain", "balanced"],
    accent: "#a3e635",
    priceRange: "₹2,000–3,000/mo",
    popular: false,
    veganFriendly: false,
    emoji: "🥚",
  },

  // ══════════════════════════════════════════════════════
  // PERFORMANCE
  // ══════════════════════════════════════════════════════

  {
    id: "creatine",
    name: "Creatine Monohydrate",
    aka: ["Creatine", "Cr", "Monohydrate"],
    category: "performance",
    tagline: "The most researched supplement in existence",
    description:
      "Creatine monohydrate is the single most evidence-backed supplement in sports science. It increases phosphocreatine stores in skeletal muscle, directly enhancing ATP regeneration during high-intensity efforts lasting 1–30 seconds.",
    mechanism:
      "Phosphocreatine donates its phosphate group to ADP to rapidly regenerate ATP during explosive efforts, delaying fatigue. Creatine also increases intramuscular water content (cell volumisation), which signals anabolic pathways and may directly stimulate protein synthesis. Evidence also supports cognitive benefits via the same ATP pathway in the brain.",
    benefits: [
      "Increases strength by 5–15% across most users",
      "More reps per set at the same weight",
      "Accelerates lean muscle mass gain",
      "Improves sprint and power output",
      "May enhance memory and cognitive performance",
      "Safe for long-term use — no 'cycling' required",
    ],
    dosage: "3–5g daily",
    timing: "Any time — consistency matters more than timing",
    form: "Powder / Capsule",
    cyclingRequired: false,
    stacksWith: ["whey-protein", "beta-alanine", "pre-workout"],
    avoidWith: [],
    warnings:
      "May cause 1–2kg initial water weight gain (intramuscular, not subcutaneous). Ensure adequate hydration (3L+/day). Rare reports of GI discomfort — take with food. Not contraindicated for kidneys in healthy individuals despite the myth.",
    evidenceLevel: "very_high",
    studyCount: "500+ RCTs",
    goals: ["muscle_gain", "performance"],
    accent: "#c084fc",
    priceRange: "₹400–800/mo",
    popular: true,
    veganFriendly: true,
    emoji: "⚡",
    indiaNote: "Creatine monohydrate is extremely affordable in India (₹400–600/kg). Simple micronised monohydrate is all you need — ignore expensive 'HCl' or 'buffered' versions.",
  },

  {
    id: "pre-workout",
    name: "Pre-Workout Complex",
    aka: ["PWO", "Pre-Workout", "Stim"],
    category: "performance",
    tagline: "Engineered energy for your best session",
    description:
      "A multi-ingredient formula combining stimulants, vasodilators, and buffering agents. A quality pre-workout contains caffeine, beta-alanine, L-citrulline, and betaine — each with independent evidence. Avoid 'proprietary blends' with hidden doses.",
    mechanism:
      "Caffeine blocks adenosine receptors to reduce perceived exertion. L-citrulline raises plasma arginine → nitric oxide → vasodilation (pumps). Beta-alanine buffers intramuscular acid. Betaine enhances power output via osmolyte action. Together, they synergistically extend performance.",
    benefits: [
      "Sustained energy without a harsh crash",
      "Improved muscular endurance and rep output",
      "Enhanced muscle pump and blood flow",
      "Faster reaction time and mental focus",
      "Delays onset of muscular fatigue",
    ],
    dosage: "1 scoop (7–12g) — check label per product",
    timing: "20–30 min before training",
    form: "Powder",
    cyclingRequired: true,
    stacksWith: ["creatine", "bcaa"],
    avoidWith: ["caffeine"],
    warnings:
      "Do not take within 6 hours of sleep. Sensitive individuals may experience jitteriness, palpitations, or anxiety. Cycle off for 2 weeks every 8 weeks to reset tolerance. Avoid if you have heart conditions or anxiety disorders.",
    evidenceLevel: "high",
    studyCount: "Individual ingredients: 200+ RCTs combined",
    goals: ["muscle_gain", "performance"],
    accent: "#c084fc",
    priceRange: "₹800–1,500/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🔥",
  },

  {
    id: "caffeine",
    name: "Caffeine",
    aka: ["Caffeine Anhydrous", "1,3,7-Trimethylxanthine"],
    category: "performance",
    tagline: "The world's most validated ergogenic",
    description:
      "Caffeine is the most widely used psychoactive substance globally and one of the few supplements with near-universal evidence for athletic performance. It reduces perceived exertion and pain, increases power output, and extends endurance.",
    mechanism:
      "Competitively inhibits adenosine receptors (A1, A2A), preventing the build-up of sleep pressure and reducing perceived effort. Also stimulates catecholamine release (adrenaline), increasing heart rate and mobilising free fatty acids for fuel.",
    benefits: [
      "Reduces perceived exertion by 5–10%",
      "Improves endurance performance by 2–4%",
      "Enhances strength and power output",
      "Boosts metabolic rate by 3–11%",
      "Improves reaction time and focus",
    ],
    dosage: "3–6mg per kg bodyweight (200–400mg for most adults)",
    timing: "45–60 min pre-workout or pre-competition",
    form: "Capsule / Tablet / Powder",
    cyclingRequired: true,
    stacksWith: ["l-theanine", "creatine"],
    avoidWith: ["pre-workout"],
    warnings:
      "Avoid within 8 hours of sleep — half-life is 5–6 hours. Can cause anxiety, palpitations, and GI issues in high doses. Tolerance builds rapidly — take 2-week breaks. Do not combine with other stimulants.",
    evidenceLevel: "very_high",
    studyCount: "1,000+ studies",
    goals: ["performance", "weight_loss"],
    accent: "#c084fc",
    priceRange: "₹200–400/mo",
    popular: true,
    veganFriendly: true,
    emoji: "☕",
  },

  {
    id: "beta-alanine",
    name: "Beta-Alanine",
    aka: ["CarnoSyn", "β-Alanine"],
    category: "performance",
    tagline: "Buffer acid — push harder, longer",
    description:
      "Beta-alanine is the rate-limiting precursor to carnosine in muscle tissue. Higher carnosine = better buffering of hydrogen ions during intense exercise, directly delaying fatigue in efforts lasting 1–4 minutes.",
    mechanism:
      "Carnosine acts as an intracellular pH buffer, accepting H+ ions produced during glycolysis to delay the drop in muscle pH that causes fatigue. Beta-alanine supplementation raises muscle carnosine by 40–80% over 4–6 weeks of consistent use.",
    benefits: [
      "Increases muscle carnosine by 40–80%",
      "Delays fatigue in 60–240 second efforts",
      "Improves HIIT and interval performance",
      "Increases total training volume capacity",
      "Stacks synergistically with creatine",
    ],
    dosage: "3.2–6.4g daily (split into 2 doses)",
    timing: "Any time — take with meals to reduce tingling",
    form: "Powder / Capsule",
    cyclingRequired: false,
    stacksWith: ["creatine", "pre-workout"],
    avoidWith: [],
    warnings:
      "Paresthesia (harmless skin tingling/flushing) is common, especially at higher doses. Use slow-release capsules or split doses to minimise. Not beneficial for activities shorter than 60 seconds.",
    evidenceLevel: "high",
    studyCount: "40+ RCTs",
    goals: ["performance", "muscle_gain"],
    accent: "#c084fc",
    priceRange: "₹400–700/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🏃",
  },

  {
    id: "bcaa",
    name: "BCAA Complex (2:1:1)",
    aka: ["Branched-Chain Amino Acids", "Leucine Isoleucine Valine"],
    category: "performance",
    tagline: "Fuel muscle, prevent breakdown",
    description:
      "BCAAs (leucine, isoleucine, valine) are essential amino acids that bypass liver metabolism and go directly to muscle. Most useful for those training fasted or with low overall protein intake. Less beneficial if you already eat 1.6g+/kg protein daily.",
    mechanism:
      "Leucine directly activates mTORC1, the master switch for muscle protein synthesis. Isoleucine promotes glucose uptake into muscle cells. Valine serves as an energy substrate during prolonged exercise. Together, they reduce muscle protein breakdown during catabolic states.",
    benefits: [
      "Reduces muscle protein breakdown during fasted training",
      "Leucine-driven mTOR activation for MPS",
      "Decreases DOMS by 33% in some studies",
      "Intra-workout energy substrate",
      "Improves endurance via reduced serotonin production",
    ],
    dosage: "5–10g",
    timing: "During workout or between meals when protein is low",
    form: "Powder / Capsule",
    cyclingRequired: false,
    stacksWith: ["whey-protein", "glutamine", "creatine"],
    avoidWith: [],
    warnings:
      "Redundant if daily protein intake is already adequate (1.6–2.2g/kg). Save money — prioritise total protein first. Bitter taste in powder form.",
    evidenceLevel: "moderate",
    studyCount: "50+ RCTs",
    goals: ["muscle_gain", "performance"],
    accent: "#c084fc",
    priceRange: "₹600–1,200/mo",
    popular: false,
    veganFriendly: true,
    emoji: "💪",
  },

  {
    id: "citrulline",
    name: "L-Citrulline",
    aka: ["Citrulline Malate", "L-Citrulline"],
    category: "performance",
    tagline: "Maximum pump, maximum endurance",
    description:
      "L-Citrulline is an amino acid that converts to arginine in the kidneys — more efficiently than taking arginine directly. The resulting nitric oxide production causes vasodilation, improving blood flow, nutrient delivery, and the coveted muscle pump.",
    mechanism:
      "Citrulline → arginine (via ASS and ASL enzymes in kidneys) → nitric oxide synthase → nitric oxide → smooth muscle relaxation → vasodilation. Also reduces ammonia accumulation during exercise, directly delaying fatigue.",
    benefits: [
      "Enhances muscle pump and vascularity",
      "Improves endurance by reducing fatigue markers",
      "Reduces muscle soreness post-workout",
      "Better than L-arginine for raising plasma arginine",
      "Supports cardiovascular health",
    ],
    dosage: "6–8g L-citrulline (or 8–12g as citrulline malate 2:1)",
    timing: "30–60 min pre-workout",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["pre-workout", "creatine", "beta-alanine"],
    avoidWith: [],
    warnings:
      "Very safe. May cause mild GI discomfort at high doses. Avoid if taking nitrate medications (e.g. sildenafil) due to additive blood pressure reduction.",
    evidenceLevel: "high",
    studyCount: "30+ RCTs",
    goals: ["performance", "muscle_gain"],
    accent: "#c084fc",
    priceRange: "₹500–900/mo",
    popular: false,
    veganFriendly: true,
    emoji: "💉",
  },

  {
    id: "eaa",
    name: "Essential Amino Acids (EAAs)",
    aka: ["EAAs", "Full Spectrum Aminos"],
    category: "performance",
    tagline: "All 9 essential aminos in one shot",
    description:
      "EAAs include all 9 amino acids the body cannot synthesise — the 3 BCAAs plus histidine, lysine, methionine, phenylalanine, threonine, and tryptophan. A superior alternative to BCAAs alone as they provide the full substrate required for muscle protein synthesis.",
    mechanism:
      "All 9 EAAs are required as building blocks for muscle protein synthesis. While leucine triggers mTOR, the other EAAs must be available as raw material. EAAs outperform BCAAs alone because they remove the substrate limitation for MPS.",
    benefits: [
      "Complete substrate for muscle protein synthesis",
      "Superior to BCAAs — includes all 9 EAAs",
      "Effective even without food or whey protein",
      "Useful during fasted training",
      "Supports recovery between sessions",
    ],
    dosage: "10–15g",
    timing: "During or immediately post-workout",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["creatine", "glutamine"],
    avoidWith: [],
    warnings:
      "Expensive relative to simply consuming adequate protein. If you're hitting 1.6–2g/kg protein via food and shakes, EAAs add minimal benefit.",
    evidenceLevel: "high",
    studyCount: "60+ RCTs",
    goals: ["muscle_gain", "performance"],
    accent: "#c084fc",
    priceRange: "₹800–1,500/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🔬",
  },

  // ══════════════════════════════════════════════════════
  // RECOVERY
  // ══════════════════════════════════════════════════════

  {
    id: "omega3",
    name: "Omega-3 Fish Oil",
    aka: ["Fish Oil", "EPA DHA", "Omega-3"],
    category: "recovery",
    tagline: "Nature's most powerful anti-inflammatory",
    description:
      "EPA and DHA are long-chain omega-3 fatty acids found in fatty fish and fish oil. They modulate the inflammatory response, supporting faster recovery, joint health, cardiovascular function, and brain health.",
    mechanism:
      "EPA and DHA are incorporated into cell membrane phospholipids, displacing arachidonic acid and reducing production of pro-inflammatory eicosanoids (PGE2, LTB4). They also produce resolvins and protectins — specialised pro-resolving mediators that actively terminate inflammation.",
    benefits: [
      "Reduces exercise-induced inflammation and DOMS",
      "Supports joint health and mobility",
      "Cardiovascular protection — reduces triglycerides",
      "Brain health, focus, and mood support",
      "May improve body composition via fat oxidation",
    ],
    dosage: "2–3g combined EPA+DHA daily",
    timing: "With any meal containing fat",
    form: "Softgel",
    cyclingRequired: false,
    stacksWith: ["vitamin-d3", "magnesium", "curcumin"],
    avoidWith: ["blood-thinners"],
    warnings:
      "High doses (>3g/day) may increase bleeding risk — consult a doctor if on anticoagulants. Refrigerate to prevent oxidation. Look for IFOS 5-star certified brands. Fishy burps are common — take with food or use enteric-coated capsules.",
    evidenceLevel: "very_high",
    studyCount: "1,000+ studies",
    goals: ["muscle_gain", "weight_loss", "balanced", "performance"],
    accent: "#38bdf8",
    priceRange: "₹400–800/mo",
    popular: true,
    veganFriendly: false,
    emoji: "🐟",
    indiaNote: "Many Indians have a poor omega-6:omega-3 ratio due to high sunflower/groundnut oil use. Supplementation is especially beneficial here.",
  },

  {
    id: "magnesium",
    name: "Magnesium Glycinate",
    aka: ["Magnesium Bisglycinate", "Magnesium"],
    category: "recovery",
    tagline: "Sleep deeper, recover faster, stress less",
    description:
      "Magnesium is involved in 300+ enzymatic reactions including protein synthesis, muscle contraction, nerve transmission, and ATP production. Most athletes are deficient due to sweat losses. Glycinate is the most bioavailable and gentlest form.",
    mechanism:
      "Acts as a natural NMDA receptor antagonist (similar to glycine), calming the nervous system. Cofactor for ATP synthase, essential for energy production. Regulates calcium channels in muscle cells — deficiency causes cramping. Supports melatonin production for sleep.",
    benefits: [
      "Significantly improves sleep quality and duration",
      "Eliminates muscle cramps and spasms",
      "Reduces cortisol and anxiety",
      "Supports ATP energy production",
      "Improves insulin sensitivity",
    ],
    dosage: "300–400mg elemental magnesium",
    timing: "30–60 min before bed",
    form: "Capsule / Powder",
    cyclingRequired: false,
    stacksWith: ["zinc", "vitamin-d3", "omega3"],
    avoidWith: [],
    warnings:
      "Oxide form causes diarrhea — always choose glycinate or malate. High doses can lower blood pressure. Separate from calcium supplements and antibiotics (tetracycline) by 2 hours.",
    evidenceLevel: "high",
    studyCount: "100+ RCTs",
    goals: ["muscle_gain", "balanced", "performance"],
    accent: "#38bdf8",
    priceRange: "₹400–700/mo",
    popular: false,
    veganFriendly: true,
    emoji: "😴",
    indiaNote: "Pune summers cause excessive sweating, dramatically increasing magnesium loss. Athletes training outdoors should prioritise this.",
  },

  {
    id: "glutamine",
    name: "L-Glutamine",
    aka: ["Glutamine"],
    category: "recovery",
    tagline: "Gut health meets muscle recovery",
    description:
      "The most abundant amino acid in the body, glutamine is conditionally essential during heavy training. It supports intestinal lining integrity (leaky gut prevention), immune function, and muscle glycogen resynthesis.",
    mechanism:
      "Primary fuel for intestinal enterocytes and immune cells (lymphocytes, macrophages). Maintains tight junction proteins in the gut wall. During heavy training, muscle glutamine stores deplete, impairing immunity and recovery — supplementation restores levels.",
    benefits: [
      "Speeds post-workout muscle recovery",
      "Supports gut barrier integrity",
      "Reduces overtraining immune suppression",
      "Promotes glycogen resynthesis post-workout",
      "Reduces muscle soreness",
    ],
    dosage: "5–10g",
    timing: "Post-workout and/or before bed",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["whey-protein", "bcaa", "probiotics"],
    avoidWith: [],
    warnings:
      "Generally very safe. Redundant if protein intake is very high (body produces sufficient glutamine from dietary protein). Not a substitute for adequate total protein.",
    evidenceLevel: "moderate",
    studyCount: "40+ RCTs",
    goals: ["muscle_gain", "performance"],
    accent: "#38bdf8",
    priceRange: "₹500–900/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🫀",
  },

  {
    id: "curcumin",
    name: "Curcumin (Turmeric Extract)",
    aka: ["Curcumin", "BCM-95", "Meriva", "Turmeric"],
    category: "recovery",
    tagline: "Ancient anti-inflammatory, modernised",
    description:
      "Curcumin is the active polyphenol in turmeric. Standard turmeric has poor bioavailability, but enhanced forms (BCM-95, Meriva, with piperine) are potent anti-inflammatory and antioxidant compounds that rival NSAIDs without the side effects.",
    mechanism:
      "Inhibits NF-κB transcription factor (master regulator of inflammation), suppressing COX-2 and reducing production of inflammatory cytokines (IL-6, TNF-α). Also reduces DOMS by mitigating exercise-induced oxidative stress.",
    benefits: [
      "Reduces delayed onset muscle soreness (DOMS)",
      "Joint inflammation relief comparable to ibuprofen",
      "Powerful antioxidant — reduces oxidative stress",
      "Supports cardiovascular health",
      "Anti-cancer properties in research",
    ],
    dosage: "500–1,000mg curcumin (as BCM-95 or with 20mg piperine)",
    timing: "With meals containing fat",
    form: "Capsule",
    cyclingRequired: false,
    stacksWith: ["omega3", "vitamin-d3", "black-pepper"],
    avoidWith: ["blood-thinners"],
    warnings:
      "Standard turmeric powder has <3% bioavailability — always use a standardised curcumin extract with piperine or phospholipid complex. High doses may interact with blood thinners.",
    evidenceLevel: "high",
    studyCount: "200+ studies",
    goals: ["balanced", "performance"],
    accent: "#38bdf8",
    priceRange: "₹400–800/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🌿",
    indiaNote: "Turmeric (haldi) is ubiquitous in Indian cooking but the dose in food is too low for therapeutic effect. Use a standardised extract for results.",
  },

  {
    id: "tart-cherry",
    name: "Tart Cherry Extract",
    aka: ["Montmorency Cherry", "Tart Cherry Juice"],
    category: "recovery",
    tagline: "Accelerate recovery, sleep better",
    description:
      "Tart (Montmorency) cherries are exceptionally rich in anthocyanins and melatonin. They reduce muscle damage markers, accelerate recovery from intense exercise, and improve sleep quality — making them ideal for heavy training blocks.",
    mechanism:
      "Anthocyanins inhibit COX-1/2 enzymes (same target as aspirin/ibuprofen), reducing inflammatory markers post-exercise. Natural melatonin content (2.5µg/serving) and tryptophan improve sleep onset and duration.",
    benefits: [
      "Reduces CK and LDH (muscle damage markers) by 20–30%",
      "Decreases DOMS after eccentric training",
      "Improves sleep duration and quality",
      "Reduces systemic inflammation",
      "High in antioxidants",
    ],
    dosage: "480mg extract (or 250ml concentrate) twice daily",
    timing: "Morning and evening, or post-workout",
    form: "Capsule / Concentrate",
    cyclingRequired: false,
    stacksWith: ["magnesium", "omega3"],
    avoidWith: [],
    warnings:
      "Relatively expensive as a supplement. The concentrate (juice) form has high sugar content — use the extract. Some sources contain artificial colours — buy pure extract.",
    evidenceLevel: "moderate",
    studyCount: "20+ RCTs",
    goals: ["performance", "balanced"],
    accent: "#38bdf8",
    priceRange: "₹600–1,000/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🍒",
  },

  // ══════════════════════════════════════════════════════
  // VITAMINS
  // ══════════════════════════════════════════════════════

  {
    id: "vitamin-d3",
    name: "Vitamin D3 + K2",
    aka: ["Cholecalciferol", "Sunshine Vitamin", "Vitamin D"],
    category: "vitamins",
    tagline: "The hormone your body desperately needs",
    description:
      "Vitamin D3 functions more like a hormone than a vitamin, regulating 200+ genes including those for immune function, muscle strength, testosterone, calcium absorption, and mood. Deficiency is endemic globally, including in sunny India, due to indoor lifestyles.",
    mechanism:
      "Converted to calcitriol (active form) in liver and kidneys. Binds to Vitamin D receptors (VDR) present in virtually every tissue. K2 (MK-7 form) activates osteocalcin and Matrix Gla Protein — directing calcium into bones and away from arteries.",
    benefits: [
      "Supports muscle strength and function",
      "Critical for immune system regulation",
      "Improves mood and reduces depression risk",
      "Supports testosterone production",
      "Calcium absorption and bone density",
    ],
    dosage: "2,000–5,000 IU D3 + 100–200mcg K2 (MK-7)",
    timing: "With the largest meal of the day (fat increases absorption)",
    form: "Softgel / Drops",
    cyclingRequired: false,
    stacksWith: ["magnesium", "omega3", "zinc"],
    avoidWith: [],
    warnings:
      "Fat-soluble — can accumulate to toxic levels above 10,000 IU/day long-term. Test serum 25(OH)D before and after starting — target 40–60 ng/mL. Always pair with K2 to prevent calcium misplacement.",
    evidenceLevel: "very_high",
    studyCount: "5,000+ studies",
    goals: ["muscle_gain", "weight_loss", "balanced", "performance"],
    accent: "#fbbf24",
    priceRange: "₹300–500/mo",
    popular: true,
    veganFriendly: true,
    emoji: "☀️",
    indiaNote: "Despite India's sunshine, 70–90% of urban Indians are deficient due to dark skin (requires more sun), sunscreen use, indoor work, and covered clothing. Get your levels tested — it's a ₹800 blood test.",
  },

  {
    id: "vitamin-c",
    name: "Vitamin C",
    aka: ["Ascorbic Acid", "L-Ascorbate"],
    category: "vitamins",
    tagline: "Immune shield and collagen builder",
    description:
      "Vitamin C is a water-soluble antioxidant essential for collagen synthesis, immune function, iron absorption, and cortisol metabolism. Athletes have higher requirements due to increased oxidative stress from training.",
    mechanism:
      "Powerful reducing agent — neutralises reactive oxygen species. Essential cofactor for prolyl hydroxylase, which stabilises collagen's triple helix structure. Regenerates vitamin E, extends antioxidant network. Reduces cortisol production during stress.",
    benefits: [
      "Boosts immune function during heavy training",
      "Essential for tendon and ligament collagen synthesis",
      "Enhances iron absorption from plant sources",
      "Reduces exercise-induced cortisol",
      "Antioxidant protection against oxidative damage",
    ],
    dosage: "500–1,000mg",
    timing: "With meals (reduces GI upset)",
    form: "Capsule / Powder",
    cyclingRequired: false,
    stacksWith: ["zinc", "iron", "collagen"],
    avoidWith: [],
    warnings:
      "Very high doses (>2g/day) can cause diarrhea (osmotic laxative effect). May interfere with some blood tests. Spread doses — absorption is limited to ~500mg per dose. Note: high-dose antioxidants may blunt some training adaptations if taken immediately post-workout.",
    evidenceLevel: "very_high",
    studyCount: "1,000+ studies",
    goals: ["balanced", "performance"],
    accent: "#fbbf24",
    priceRange: "₹150–300/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🍊",
  },

  {
    id: "vitamin-b12",
    name: "Vitamin B12",
    aka: ["Cobalamin", "Methylcobalamin", "Cyanocobalamin"],
    category: "vitamins",
    tagline: "Non-negotiable for vegetarians and vegans",
    description:
      "B12 is found exclusively in animal products. It is critical for neurological function, DNA synthesis, red blood cell formation, and homocysteine metabolism. Deficiency — extremely common in India — causes irreversible nerve damage if untreated.",
    mechanism:
      "Methylcobalamin (active form) is cofactor for methionine synthase (converts homocysteine → methionine) and methylmalonyl-CoA mutase (energy metabolism). Essential for myelin sheath synthesis and maintenance of the nervous system.",
    benefits: [
      "Prevents megaloblastic anaemia",
      "Protects nerve health and myelination",
      "Reduces homocysteine (cardiovascular risk marker)",
      "Supports energy production from food",
      "Mood and cognitive function support",
    ],
    dosage: "500–1,000mcg daily",
    timing: "Morning with breakfast",
    form: "Sublingual tablet / Capsule",
    cyclingRequired: false,
    stacksWith: ["vitamin-d3", "iron", "folate"],
    avoidWith: [],
    warnings:
      "Water-soluble and very safe — excess is excreted. Cyanocobalamin is cheaper; methylcobalamin may be better utilised. Sublingual absorption bypasses gastric issues. Deficiency symptoms (fatigue, tingling limbs) appear months to years after stores deplete.",
    evidenceLevel: "very_high",
    studyCount: "500+ studies",
    goals: ["muscle_gain", "weight_loss", "balanced", "performance"],
    accent: "#fbbf24",
    priceRange: "₹150–300/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🧬",
    indiaNote: "India has one of the world's highest B12 deficiency rates — estimated 47% of the population. Vegetarians and vegans must supplement without exception. Even non-vegetarians eating low meat are often deficient.",
  },

  {
    id: "multivitamin",
    name: "Sports Multivitamin",
    aka: ["Multi", "Daily Vitamin"],
    category: "vitamins",
    tagline: "Fill every nutritional gap in one tablet",
    description:
      "A comprehensive multi provides insurance against micronutrient gaps that are nearly universal in athletes due to high energy expenditure, sweat losses, and restrictive diets. Does not replace good nutrition but fills the gaps.",
    mechanism:
      "Provides recommended daily amounts of vitamins and minerals that serve as cofactors for thousands of enzymatic reactions — energy production, DNA repair, protein synthesis, immune function, and hormone production.",
    benefits: [
      "Covers common micronutrient gaps in athletes",
      "Supports energy metabolism (B vitamins)",
      "Immune system maintenance",
      "Antioxidant support during heavy training",
      "Hormone and enzyme cofactor support",
    ],
    dosage: "As per label (typically 2–3 tablets/capsules)",
    timing: "With the largest meal of the day",
    form: "Tablet / Capsule",
    cyclingRequired: false,
    stacksWith: ["omega3", "vitamin-d3", "magnesium"],
    avoidWith: [],
    warnings:
      "Multivitamins do not replace poor diet — they supplement a good one. Avoid iron-containing multis if you're male or post-menopausal female unless diagnosed deficient. Fat-soluble vitamins (A, D, E, K) can accumulate — don't double up.",
    evidenceLevel: "moderate",
    studyCount: "Constituent vitamins have 1,000s of studies",
    goals: ["muscle_gain", "weight_loss", "balanced", "performance"],
    accent: "#fbbf24",
    priceRange: "₹300–600/mo",
    popular: true,
    veganFriendly: true,
    emoji: "💊",
  },

  // ══════════════════════════════════════════════════════
  // MINERALS
  // ══════════════════════════════════════════════════════

  {
    id: "zinc",
    name: "Zinc",
    aka: ["Zinc Gluconate", "Zinc Picolinate", "Zinc Bisglycinate"],
    category: "minerals",
    tagline: "Testosterone, immunity, and recovery",
    description:
      "Zinc is an essential trace mineral involved in 300+ enzymatic processes including testosterone biosynthesis, immune function, protein synthesis, and wound healing. Athletes lose zinc through sweat, making deficiency common in active individuals.",
    mechanism:
      "Structural component of zinc-finger transcription factors regulating gene expression. Essential cofactor for 5-alpha reductase (testosterone pathway). Inhibits aromatase (estrogen conversion). Required for thymulin — a hormone controlling T-cell development.",
    benefits: [
      "Supports testosterone production in deficient individuals",
      "Strengthens immune response (especially against viral infections)",
      "Accelerates wound healing",
      "Supports protein synthesis",
      "Maintains taste, smell, and appetite",
    ],
    dosage: "15–30mg elemental zinc daily",
    timing: "Away from meals (or with food if GI issues)",
    form: "Capsule",
    cyclingRequired: false,
    stacksWith: ["magnesium", "vitamin-d3"],
    avoidWith: ["iron", "calcium"],
    warnings:
      "Chronic intake above 40mg/day depletes copper — always maintain a 10:1 zinc:copper ratio. Take away from iron and calcium supplements (compete for absorption). Nausea on empty stomach — take with food.",
    evidenceLevel: "high",
    studyCount: "200+ studies",
    goals: ["muscle_gain", "balanced", "performance"],
    accent: "#94a3b8",
    priceRange: "₹200–400/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🔩",
    indiaNote: "Vegetarian diets common in India are often low in zinc (phytates in grains/legumes reduce absorption). Soaking legumes before cooking improves zinc bioavailability significantly.",
  },

  {
    id: "iron",
    name: "Iron",
    aka: ["Ferrous Sulfate", "Ferrous Bisglycinate", "Ferric Iron"],
    category: "minerals",
    tagline: "Oxygen delivery — the aerobic foundation",
    description:
      "Iron is the central atom in hemoglobin and myoglobin, enabling oxygen transport and storage in blood and muscle. Iron-deficiency anaemia is one of the most common nutritional deficiencies globally, severely limiting aerobic capacity.",
    mechanism:
      "Core of the heme group in hemoglobin (oxygen transport in RBCs) and myoglobin (oxygen storage in muscle). Also essential component of cytochromes in the electron transport chain — directly powers mitochondrial ATP production.",
    benefits: [
      "Prevents iron-deficiency anaemia",
      "Maximises oxygen delivery to working muscles",
      "Reduces exercise-induced fatigue",
      "Supports immune function",
      "Critical during pregnancy and menstruation",
    ],
    dosage: "18mg RDA for women, 8mg for men — only supplement if deficient",
    timing: "On empty stomach with Vitamin C; away from coffee/tea",
    form: "Capsule / Liquid",
    cyclingRequired: false,
    stacksWith: ["vitamin-c", "vitamin-b12"],
    avoidWith: ["calcium", "zinc", "coffee", "tea"],
    warnings:
      "CRITICAL: Do NOT supplement iron without a blood test (ferritin + serum iron). Excess iron is a pro-oxidant and toxic. Men and post-menopausal women rarely need iron supplements. Take with Vitamin C for absorption, away from dairy, coffee, and tea.",
    evidenceLevel: "very_high",
    studyCount: "1,000+ studies",
    goals: ["balanced", "performance"],
    accent: "#94a3b8",
    priceRange: "₹150–300/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🩸",
    indiaNote: "Anaemia affects 53% of Indian women and 20% of men. Plant-based diets provide non-heme iron (less bioavailable) — pair with citrus. Avoid tea with meals, which dramatically reduces iron absorption.",
  },

  {
    id: "zma",
    name: "ZMA (Zinc + Magnesium + B6)",
    aka: ["ZMA", "Zinc Magnesium Aspartate"],
    category: "minerals",
    tagline: "Sleep, testosterone, and recovery stack",
    description:
      "ZMA combines zinc monomethionine aspartate, magnesium aspartate, and Vitamin B6. Designed to correct the zinc and magnesium depletion common in athletes, supporting testosterone levels, sleep quality, and muscle recovery simultaneously.",
    mechanism:
      "Zinc restores testosterone and IGF-1 in deficient individuals. Magnesium supports GABA-mediated sleep and muscle relaxation. B6 enhances both mineral absorptions and supports serotonin/melatonin synthesis for sleep.",
    benefits: [
      "Supports testosterone in zinc/magnesium-deficient athletes",
      "Significantly improves sleep quality",
      "Accelerates overnight muscle recovery",
      "Immune system support",
      "Reduces muscle cramps",
    ],
    dosage: "3 capsules (provides ~30mg zinc, 450mg magnesium, 10.5mg B6)",
    timing: "Before bed on an empty stomach",
    form: "Capsule",
    cyclingRequired: false,
    stacksWith: ["vitamin-d3", "casein-protein"],
    avoidWith: ["calcium", "dairy"],
    warnings:
      "Take on an empty stomach — calcium interferes with zinc absorption. Do not take with dairy products. Benefits are most pronounced in those who are actually deficient in zinc/magnesium.",
    evidenceLevel: "moderate",
    studyCount: "10+ RCTs",
    goals: ["muscle_gain", "performance"],
    accent: "#94a3b8",
    priceRange: "₹300–600/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🧬",
  },

  // ══════════════════════════════════════════════════════
  // ADAPTOGENS
  // ══════════════════════════════════════════════════════

  {
    id: "ashwagandha",
    name: "Ashwagandha",
    aka: ["Withania Somnifera", "KSM-66", "Sensoril", "Indian Ginseng"],
    category: "adaptogens",
    tagline: "Ancient adaptogen with modern science",
    description:
      "Ashwagandha is an Ayurvedic adaptogen with substantial modern research. It reduces cortisol, improves stress tolerance, enhances VO2 max, increases testosterone in men under chronic stress, and improves strength and recovery.",
    mechanism:
      "Withanolides (primary active compounds) modulate the HPA (hypothalamic-pituitary-adrenal) axis, reducing ACTH-driven cortisol secretion. Also has GABAergic and thyroid-stimulating properties. Reduces reactive oxygen species and inflammatory cytokines.",
    benefits: [
      "Reduces cortisol by 14–30% in stressed individuals",
      "Increases testosterone by 10–22% in studies",
      "Improves VO2 max and endurance",
      "Enhances strength gains when combined with training",
      "Improves sleep quality",
      "Reduces anxiety and perceived stress",
    ],
    dosage: "300–600mg KSM-66 or Sensoril extract",
    timing: "With meals; evening use may improve sleep",
    form: "Capsule",
    cyclingRequired: false,
    stacksWith: ["magnesium", "vitamin-d3", "omega3"],
    avoidWith: ["thyroid-medication", "immunosuppressants"],
    warnings:
      "May interact with thyroid medications, immunosuppressants, and sedatives — consult a doctor. Avoid during pregnancy. Rare reports of liver toxicity at very high doses. Full effects take 4–8 weeks of consistent use.",
    evidenceLevel: "high",
    studyCount: "30+ RCTs",
    goals: ["muscle_gain", "balanced", "performance"],
    accent: "#f97316",
    priceRange: "₹400–800/mo",
    popular: true,
    veganFriendly: true,
    emoji: "🌿",
    indiaNote: "Ashwagandha is indigenous to India — it grows wild across Rajasthan and Madhya Pradesh. KSM-66 (by Ixoreal Biomed, Hyderabad) is the world's highest-quality extract, made in India.",
  },

  {
    id: "rhodiola",
    name: "Rhodiola Rosea",
    aka: ["Roseroot", "Golden Root", "Arctic Root"],
    category: "adaptogens",
    tagline: "Mental stamina and physical resilience",
    description:
      "Rhodiola is a Siberian adaptogen best known for reducing mental fatigue, burnout, and improving performance under physical and psychological stress. It is particularly effective for endurance athletes and those in high-stress work environments.",
    mechanism:
      "Salidroside and rosavin (active compounds) stimulate synthesis of serotonin precursors and inhibit COMT enzyme (extends dopamine/norepinephrine activity). Reduces cortisol reactivity. Improves mitochondrial efficiency and fatty acid oxidation.",
    benefits: [
      "Reduces mental fatigue and burnout",
      "Improves endurance performance",
      "Enhances cognitive function under stress",
      "Mild antidepressant effect",
      "Reduces perception of effort",
    ],
    dosage: "200–600mg (3% rosavins, 1% salidroside extract)",
    timing: "Morning, 30 min before workout or work",
    form: "Capsule",
    cyclingRequired: true,
    stacksWith: ["ashwagandha", "caffeine", "l-theanine"],
    avoidWith: ["MAOIs", "antidepressants"],
    warnings:
      "Can be stimulating — avoid in the evening. Cycle 5 days on, 2 days off. May interact with antidepressants (SSRIs, MAOIs). Start with 200mg to assess tolerance.",
    evidenceLevel: "moderate",
    studyCount: "20+ RCTs",
    goals: ["performance", "balanced"],
    accent: "#f97316",
    priceRange: "₹400–700/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🏔️",
  },

  {
    id: "l-theanine",
    name: "L-Theanine",
    aka: ["Theanine", "Suntheanine"],
    category: "adaptogens",
    tagline: "Calm focus without sedation",
    description:
      "An amino acid found naturally in green tea, L-theanine promotes relaxed alertness by increasing alpha brainwave activity. When combined with caffeine, it eliminates jitteriness while preserving and even enhancing the cognitive benefits.",
    mechanism:
      "Crosses the blood-brain barrier and increases alpha brainwave production (associated with calm alertness). Modulates GABA and glutamate activity. Synergises with caffeine by antagonising the anxiogenic effects while preserving adenosine receptor blockade.",
    benefits: [
      "Promotes calm, focused alertness",
      "Eliminates caffeine jitteriness and anxiety",
      "Improves sleep quality (evening use)",
      "Enhances cognitive performance with caffeine",
      "Reduces blood pressure response to stress",
    ],
    dosage: "100–200mg (often 2:1 ratio with caffeine)",
    timing: "Morning with coffee/caffeine, or evening for sleep",
    form: "Capsule",
    cyclingRequired: false,
    stacksWith: ["caffeine", "magnesium"],
    avoidWith: [],
    warnings:
      "Extremely safe with no known serious side effects. May be mildly sedating at high doses (400mg+). The 1:2 caffeine:theanine ratio is the most studied combination.",
    evidenceLevel: "high",
    studyCount: "50+ studies",
    goals: ["performance", "balanced"],
    accent: "#f97316",
    priceRange: "₹300–500/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🍵",
  },

  {
    id: "lions-mane",
    name: "Lion's Mane Mushroom",
    aka: ["Hericium Erinaceus", "Yamabushitake"],
    category: "adaptogens",
    tagline: "Grow your brain while you grow your muscles",
    description:
      "Lion's Mane is a medicinal mushroom that stimulates Nerve Growth Factor (NGF) production, supporting neuroplasticity, cognitive function, and nerve repair. Emerging evidence supports benefits for focus, memory, and mood.",
    mechanism:
      "Hericenones and erinacines (unique bioactive compounds) penetrate the blood-brain barrier and stimulate NGF and BDNF (Brain-Derived Neurotrophic Factor) synthesis — promoting neuroplasticity, neurogenesis, and myelin sheath repair.",
    benefits: [
      "Stimulates Nerve Growth Factor (NGF) production",
      "Improves memory and cognitive function",
      "Reduces anxiety and mild depression",
      "Supports peripheral nerve repair",
      "Potential neuroprotective effects",
    ],
    dosage: "500–3,000mg (>25% beta-glucan extract)",
    timing: "Morning with food",
    form: "Capsule / Powder",
    cyclingRequired: false,
    stacksWith: ["rhodiola", "l-theanine"],
    avoidWith: [],
    warnings:
      "Effects build over 4–8 weeks. Ensure product is a fruiting body extract, not mycelium on grain (much weaker). Very rare reports of respiratory allergy in mushroom-sensitive individuals.",
    evidenceLevel: "moderate",
    studyCount: "15+ RCTs",
    goals: ["balanced", "performance"],
    accent: "#f97316",
    priceRange: "₹500–900/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🍄",
  },

  // ══════════════════════════════════════════════════════
  // WEIGHT MANAGEMENT
  // ══════════════════════════════════════════════════════

  {
    id: "l-carnitine",
    name: "L-Carnitine",
    aka: ["Carnitine", "ALCAR", "L-Carnitine L-Tartrate"],
    category: "weight",
    tagline: "Turn stored fat into usable fuel",
    description:
      "L-Carnitine shuttles long-chain fatty acids across the inner mitochondrial membrane for beta-oxidation. Most effective for fat burning when combined with cardio training. Also has ergogenic effects on endurance and recovery.",
    mechanism:
      "Forms carnitine palmitoyl transferase I (CPT-1) complex with fatty acids, enabling their transport into mitochondria. Without adequate carnitine, fat cannot be oxidised for energy. Also reduces lactate and ammonia accumulation during exercise.",
    benefits: [
      "Increases fatty acid oxidation during exercise",
      "Boosts energy for cardio sessions",
      "Preserves muscle glycogen (sparing effect)",
      "Improves recovery via reduced oxidative stress",
      "May improve insulin sensitivity",
    ],
    dosage: "1,000–2,000mg",
    timing: "30 min before cardio",
    form: "Liquid / Capsule",
    cyclingRequired: false,
    stacksWith: ["caffeine", "green-tea", "cla"],
    avoidWith: [],
    warnings:
      "Effect is modest without exercise — not a magic fat burner. Requires cardiovascular exercise to be effective. TMAO conversion (gut microbiome metabolite) has been associated with cardiovascular risk in some research — limit to recommended doses.",
    evidenceLevel: "moderate",
    studyCount: "30+ RCTs",
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
    aka: ["Conjugated Linoleic Acid"],
    category: "weight",
    tagline: "Lean out while keeping muscle",
    description:
      "CLA is a naturally occurring fatty acid found in grass-fed dairy and beef. It modestly reduces body fat while preserving lean muscle mass. Effects are small but consistent in meta-analyses — best used alongside a caloric deficit and exercise.",
    mechanism:
      "Activates PPARα (peroxisome proliferator-activated receptor alpha), increasing fatty acid oxidation. Inhibits lipoprotein lipase in adipose tissue (reduces fat storage). Activates CPT-1 in muscle, directing fatty acids to oxidation.",
    benefits: [
      "Modest fat mass reduction (0.1–0.2kg/week)",
      "Lean muscle mass preservation in caloric deficit",
      "Supports metabolic rate",
      "Anti-catabolic effect",
      "Anti-inflammatory properties",
    ],
    dosage: "3–6g daily",
    timing: "With main meals",
    form: "Softgel",
    cyclingRequired: false,
    stacksWith: ["l-carnitine", "green-tea", "caffeine"],
    avoidWith: [],
    warnings:
      "Effects are modest — set realistic expectations. Some studies show increased insulin resistance at very high doses. Stick to 3–6g/day. May cause GI discomfort initially.",
    evidenceLevel: "moderate",
    studyCount: "30+ RCTs",
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
    aka: ["EGCG", "Epigallocatechin Gallate", "GTE"],
    category: "weight",
    tagline: "Natural thermogenic, zero jitters",
    description:
      "Green tea extract standardised for EGCG is a potent antioxidant and mild thermogenic. EGCG inhibits the enzyme that breaks down catecholamines (noradrenaline), extending their fat-burning signal without the stimulant effects of caffeine.",
    mechanism:
      "EGCG inhibits catechol-O-methyltransferase (COMT), preventing breakdown of noradrenaline. This extends sympathetic nervous system stimulation of fat cells. Also inhibits fatty acid synthase and activates AMPK (cellular energy sensor promoting fat burning).",
    benefits: [
      "3–4% metabolic rate increase",
      "Enhances fat oxidation during exercise",
      "Powerful antioxidant (ORAC score among highest foods)",
      "Supports cardiovascular health",
      "Mild appetite suppression",
    ],
    dosage: "400–500mg EGCG (standardised extract)",
    timing: "Before meals or before exercise",
    form: "Capsule",
    cyclingRequired: false,
    stacksWith: ["l-carnitine", "caffeine", "cla"],
    avoidWith: [],
    warnings:
      "Taking on an empty stomach can cause nausea. High doses (>800mg EGCG/day) have been associated with liver stress — stay within recommended amounts. Contains some caffeine — account for total daily intake.",
    evidenceLevel: "moderate",
    studyCount: "40+ RCTs",
    goals: ["weight_loss"],
    accent: "#fb923c",
    priceRange: "₹300–600/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🍵",
  },

  {
    id: "berberine",
    name: "Berberine",
    aka: ["BBR", "Berberine HCl"],
    category: "weight",
    tagline: "Nature's metformin for blood sugar and fat",
    description:
      "Berberine is a plant alkaloid with remarkable glucose-lowering and lipid-lowering effects. Multiple meta-analyses show it rivals metformin for blood glucose control. Also supports weight management via AMPK activation and gut microbiome modulation.",
    mechanism:
      "Activates AMPK (AMP-activated protein kinase) — the master metabolic switch that mimics the effects of caloric restriction and exercise. Inhibits gluconeogenesis, increases insulin sensitivity, reduces intestinal glucose absorption, and alters gut microbiome toward leaner phenotype.",
    benefits: [
      "Reduces fasting blood glucose by 20–30%",
      "Lowers HbA1c comparably to metformin",
      "Reduces LDL cholesterol and triglycerides",
      "Supports weight loss independently",
      "Improves gut microbiome diversity",
    ],
    dosage: "500mg, 2–3 times daily with meals",
    timing: "With meals — reduces GI side effects",
    form: "Capsule",
    cyclingRequired: true,
    stacksWith: ["omega3", "vitamin-d3"],
    avoidWith: ["metformin", "blood-pressure-meds", "blood-thinners"],
    warnings:
      "Significant drug interactions — consult a doctor if on diabetes medication, blood pressure drugs, or statins. Causes GI side effects (cramping, diarrhea) when starting — build up slowly. Cycle 8 weeks on, 2 weeks off.",
    evidenceLevel: "high",
    studyCount: "40+ RCTs",
    goals: ["weight_loss", "balanced"],
    accent: "#fb923c",
    priceRange: "₹500–900/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🌱",
    indiaNote: "Particularly relevant for Indians, who have a genetic predisposition to insulin resistance and Type 2 diabetes. Always check with your doctor first.",
  },

  // ══════════════════════════════════════════════════════
  // JOINTS & STRUCTURAL
  // ══════════════════════════════════════════════════════

  {
    id: "collagen",
    name: "Collagen Peptides",
    aka: ["Hydrolysed Collagen", "Collagen Hydrolysate", "Type I II III Collagen"],
    category: "joints",
    tagline: "Rebuild connective tissue from within",
    description:
      "Hydrolysed collagen provides the amino acid building blocks (glycine, proline, hydroxyproline) specifically required for collagen synthesis in tendons, ligaments, cartilage, and skin. Best taken with Vitamin C before exercise.",
    mechanism:
      "Hydroxyproline-proline-glycine peptides from hydrolysed collagen stimulate fibroblast and chondrocyte activity, increasing collagen synthesis in connective tissue. When taken 30–60 minutes before exercise, collagen levels in tendon tissue peak during loading — maximising signal to rebuild.",
    benefits: [
      "Reduces joint pain in osteoarthritis",
      "Supports tendon and ligament repair",
      "Reduces injury risk in connective tissue",
      "Improves skin elasticity and hydration",
      "Supports gut lining (similar to gelatin)",
    ],
    dosage: "10–15g",
    timing: "30–60 min before exercise, with Vitamin C",
    form: "Powder",
    cyclingRequired: false,
    stacksWith: ["vitamin-c", "omega3", "curcumin"],
    avoidWith: [],
    warnings:
      "Not a complete protein — low in tryptophan, do not use as primary protein source. Must be taken with Vitamin C for collagen synthesis. Effects take 3+ months to appear in tendons.",
    evidenceLevel: "moderate",
    studyCount: "20+ RCTs",
    goals: ["balanced", "performance"],
    accent: "#ec4899",
    priceRange: "₹600–1,200/mo",
    popular: false,
    veganFriendly: false,
    emoji: "🦴",
  },

  {
    id: "glucosamine-chondroitin",
    name: "Glucosamine + Chondroitin",
    aka: ["Glucosamine Sulfate", "Chondroitin Sulfate", "Joint Complex"],
    category: "joints",
    tagline: "Protect cartilage for the long game",
    description:
      "The classic joint health combination. Glucosamine is a building block of cartilage; chondroitin inhibits cartilage-degrading enzymes. Best evidence is in individuals with existing mild-to-moderate knee osteoarthritis.",
    mechanism:
      "Glucosamine provides substrate for glycosaminoglycan synthesis in cartilage matrix. Chondroitin sulfate inhibits metalloproteinases that degrade cartilage and has mild anti-inflammatory effects. Together they may slow cartilage degradation.",
    benefits: [
      "Reduces knee joint pain and stiffness",
      "Slows cartilage degradation in osteoarthritis",
      "Improves joint function and mobility",
      "Reduces need for NSAIDs",
      "Long-term structural protection",
    ],
    dosage: "1,500mg glucosamine + 1,200mg chondroitin daily",
    timing: "With meals",
    form: "Tablet / Capsule",
    cyclingRequired: false,
    stacksWith: ["omega3", "collagen", "curcumin"],
    avoidWith: ["blood-thinners"],
    warnings:
      "Glucosamine is derived from shellfish — check label for shellfish allergy. Chondroitin may mildly thin blood — caution with anticoagulants. Effects take 3+ months to emerge. Strongest evidence is for existing joint pain, not prevention.",
    evidenceLevel: "moderate",
    studyCount: "30+ RCTs",
    goals: ["balanced"],
    accent: "#ec4899",
    priceRange: "₹400–800/mo",
    popular: false,
    veganFriendly: false,
    emoji: "🦵",
  },

  {
    id: "msm",
    name: "MSM (Methylsulfonylmethane)",
    aka: ["Dimethyl Sulfone", "DMSO2"],
    category: "joints",
    tagline: "Sulfur for joints, tendons, and inflammation",
    description:
      "MSM is an organic sulfur compound that provides the substrate for collagen and keratin synthesis. It has anti-inflammatory and analgesic properties, reducing joint pain and exercise-induced muscle damage.",
    mechanism:
      "Provides bioavailable sulfur — required for disulfide bonds in collagen, keratin, and other structural proteins. Reduces NF-κB activity, lowering inflammatory cytokines. Inhibits substance P (pain neurotransmitter) release.",
    benefits: [
      "Reduces joint and muscle pain",
      "Decreases post-exercise muscle damage",
      "Supports collagen and connective tissue synthesis",
      "Anti-inflammatory without NSAID side effects",
      "Improves mobility in arthritis",
    ],
    dosage: "1,000–3,000mg daily",
    timing: "With meals",
    form: "Capsule / Powder",
    cyclingRequired: false,
    stacksWith: ["glucosamine-chondroitin", "collagen", "curcumin"],
    avoidWith: [],
    warnings:
      "Very safe profile. May cause mild GI discomfort initially — start at 1g and build up. Ensure adequate hydration. Look for OptiMSM brand (best purity standards).",
    evidenceLevel: "moderate",
    studyCount: "15+ RCTs",
    goals: ["balanced", "performance"],
    accent: "#ec4899",
    priceRange: "₹300–600/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🔧",
  },

  // ══════════════════════════════════════════════════════
  // GUT HEALTH
  // ══════════════════════════════════════════════════════

  {
    id: "probiotics",
    name: "Probiotic Complex",
    aka: ["Probiotics", "Live Cultures", "Lactobacillus Bifidobacterium"],
    category: "gut",
    tagline: "A healthy gut is the foundation of everything",
    description:
      "A multi-strain probiotic with Lactobacillus and Bifidobacterium species supports gut microbiome diversity, immune function, protein absorption, mood regulation (gut-brain axis), and recovery. The gut-performance connection is now well established.",
    mechanism:
      "Beneficial bacteria competitively exclude pathogens, produce short-chain fatty acids (SCFAs) that fuel colonocytes, modulate immune response via Peyer's patches, and synthesise neurotransmitters (serotonin, GABA). SCFAs (butyrate) reduce intestinal permeability (leaky gut).",
    benefits: [
      "Improves digestion and nutrient absorption",
      "Strengthens gut barrier against leaky gut",
      "Boosts immune function (70% of immune tissue is gut-associated)",
      "Supports mood via gut-brain axis",
      "Reduces bloating, gas, and IBS symptoms",
    ],
    dosage: "10–50 billion CFU (multi-strain)",
    timing: "With or without food — morning consistency matters",
    form: "Capsule (refrigerated or shelf-stable)",
    cyclingRequired: false,
    stacksWith: ["glutamine", "prebiotic-fiber"],
    avoidWith: ["antibiotics"],
    warnings:
      "Temporarily increase gas and bloating when starting — normal and resolves in 1–2 weeks. If on antibiotics, take probiotics 2 hours apart (not together). Refrigerate unless specifically labeled shelf-stable.",
    evidenceLevel: "high",
    studyCount: "200+ RCTs",
    goals: ["balanced", "muscle_gain"],
    accent: "#10b981",
    priceRange: "₹400–800/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🦠",
    indiaNote: "Curd (dahi) and lassi are excellent probiotic sources in the Indian diet. Supplement probiotics for therapeutic use or during/after antibiotic courses.",
  },

  {
    id: "psyllium-husk",
    name: "Psyllium Husk",
    aka: ["Isabgol", "Psyllium", "Plantago Ovata"],
    category: "gut",
    tagline: "Fibre that feeds your gut microbiome",
    description:
      "Psyllium husk is a soluble fibre that forms a gel in the digestive tract, slowing glucose absorption, lowering cholesterol, and feeding beneficial gut bacteria. One of the most evidence-backed fibre supplements available.",
    mechanism:
      "Soluble fibre dissolves in water to form a viscous gel, trapping bile acids (forcing liver to use cholesterol to make more bile), slowing gastric emptying (lowers post-meal glucose spike), and being fermented by gut bacteria into butyrate and other SCFAs.",
    benefits: [
      "Lowers LDL cholesterol by 5–10%",
      "Reduces post-meal blood sugar spikes",
      "Feeds beneficial gut bacteria (prebiotic)",
      "Relieves constipation and IBS",
      "Increases satiety — useful for weight management",
    ],
    dosage: "5–10g (1–2 teaspoons)",
    timing: "Before meals with a large glass of water",
    form: "Powder / Husk",
    cyclingRequired: false,
    stacksWith: ["probiotics", "berberine"],
    avoidWith: [],
    warnings:
      "MUST be taken with plenty of water — without water it can cause choking or obstruction. Start with 5g and increase gradually. Take 2 hours away from medications as it may reduce absorption.",
    evidenceLevel: "very_high",
    studyCount: "100+ RCTs",
    goals: ["weight_loss", "balanced"],
    accent: "#10b981",
    priceRange: "₹100–200/mo",
    popular: false,
    veganFriendly: true,
    emoji: "🌾",
    indiaNote: "Known as Isabgol in India — extremely affordable and widely available at any chemist. One of the best value supplements you can buy.",
  },

];

// ─────────────────────────────────────────────────────────────────────────────
// PERSONALISED STACKS
// ─────────────────────────────────────────────────────────────────────────────

export const STACKS: Record<SupplementGoal, string[]> = {
  muscle_gain:  ["whey-protein", "creatine", "bcaa", "omega3", "multivitamin"],
  weight_loss:  ["l-carnitine", "omega3", "green-tea", "multivitamin", "vitamin-d3"],
  balanced:     ["whey-protein", "omega3", "multivitamin", "vitamin-d3", "magnesium"],
  performance:  ["pre-workout", "creatine", "beta-alanine", "omega3", "multivitamin"],
};

export const VEGAN_SWAPS: Record<string, string> = {
  "whey-protein":   "plant-protein",
  "casein-protein": "plant-protein",
  "whey-isolate":   "plant-protein",
  "omega3":         "vitamin-d3",  // TODO: add algae omega-3 in v2
  "egg-white-protein": "plant-protein",
  "collagen":       "vitamin-c",   // no vegan collagen yet — vitamin C boosts endogenous production
};

// ─────────────────────────────────────────────────────────────────────────────
// QUIZ
// ─────────────────────────────────────────────────────────────────────────────

export interface QuizAnswers {
  goal: SupplementGoal;
  frequency: "low" | "medium" | "high";
  challenge: "recovery" | "energy" | "strength" | "weight" | "sleep";
  diet: "veg" | "nonveg" | "vegan";
  budget: "low" | "mid" | "high";
}

export function resolveStack(answers: QuizAnswers): string[] {
  let stack = [...STACKS[answers.goal]];

  if (answers.diet === "vegan") {
    stack = stack.map((id) => VEGAN_SWAPS[id] ?? id);
    stack = [...new Set(stack)];
  }

  if (answers.budget === "low") {
    stack = stack.slice(0, 4);
  }

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

  return [...new Set(stack)].slice(0, 5);
}

export function getSupplementById(id: string): Supplement | undefined {
  return SUPPLEMENTS.find((s) => s.id === id);
}

// ─────────────────────────────────────────────────────────────────────────────
// META
// ─────────────────────────────────────────────────────────────────────────────

export const CATEGORY_META: Record<SupplementCategory, { label: string; accent: string; emoji: string }> = {
  protein:     { label: "Protein",            accent: "#a3e635", emoji: "🥛" },
  performance: { label: "Performance",        accent: "#c084fc", emoji: "⚡" },
  recovery:    { label: "Recovery",           accent: "#38bdf8", emoji: "🔄" },
  health:      { label: "Health",             accent: "#fbbf24", emoji: "💊" },
  vitamins:    { label: "Vitamins",           accent: "#fbbf24", emoji: "☀️" },
  minerals:    { label: "Minerals",           accent: "#94a3b8", emoji: "🔩" },
  adaptogens:  { label: "Adaptogens",         accent: "#f97316", emoji: "🌿" },
  joints:      { label: "Joints & Structure", accent: "#ec4899", emoji: "🦴" },
  gut:         { label: "Gut Health",         accent: "#10b981", emoji: "🦠" },
  weight:      { label: "Weight Management",  accent: "#fb923c", emoji: "⚖️" },
};

export const GOAL_META: Record<SupplementGoal, { label: string; emoji: string; accent: string; description: string }> = {
  muscle_gain:  { label: "Muscle Gain",     emoji: "💪", accent: "#a3e635", description: "Build size, strength, and lean mass" },
  weight_loss:  { label: "Fat Loss",        emoji: "🔥", accent: "#fb923c", description: "Burn fat while preserving muscle" },
  balanced:     { label: "Balanced Health", emoji: "⚖️", accent: "#38bdf8", description: "Optimise health, energy, and wellbeing" },
  performance:  { label: "Peak Performance",emoji: "⚡", accent: "#c084fc", description: "Push your athletic limits further" },
};

export const EVIDENCE_META: Record<EvidenceLevel, { label: string; color: string }> = {
  very_high:   { label: "Very High Evidence", color: "#22c55e" },
  high:        { label: "High Evidence",       color: "#86efac" },
  moderate:    { label: "Moderate Evidence",   color: "#fbbf24" },
  low:         { label: "Low Evidence",        color: "#fb923c" },
  preliminary: { label: "Preliminary",         color: "#94a3b8" },
};