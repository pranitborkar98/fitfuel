// app/_hp/DishGlyph.tsx
//
// EVERY DISH GETS A FACE, DRAWN FROM ITS OWN MACROS.
//
// The problem: 126 plans and 30 seeded recipes, and one photograph of a plated
// dish in the entire repository. Every card on this page has been a rectangle
// of text because there was nothing to put in it.
//
// The obvious fix is AI-generated food photography. The owner has approved
// that with a disclosure, and it is worth doing for atmosphere — but NOT as
// the picture attached to "Maharashtrian Moong Dal Chilla, 355 kcal, 25g
// protein". That specific pairing is a picture of a product a customer is
// about to buy, and a footer disclaimer does not undo the impression it makes
// on the person who then opens a box that looks nothing like it. Under the
// CCPA's misleading-advertisement test what matters is the overall impression,
// not whether a disclaimer exists somewhere.
//
// So the dish-level visual is generated from the dish's OWN DATA instead.
// Three arcs sized by the real protein / carbs / fat split, on a ring scaled
// by real calories, rotated by a hash of the dish name so no two compositions
// repeat. It is not a picture of food; it is a fingerprint of the food, and it
// happens to be the most on-brand thing this page could possibly show: a
// company whose entire argument is "we weigh it" showing you the weights.
//
// Properties worth keeping:
//   · Truthful. Nothing here is invented; change a recipe and the glyph moves.
//   · Unique automatically, across all 126 plans, with no asset pipeline.
//   · ~1KB of inline SVG per dish. No image requests, nothing to 404.
//   · Deterministic, so server and client render identically.
//
// SERVER COMPONENT. Pure SVG, zero JavaScript.

type Props = {
  name: string;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  accent?: string;
  size?: number;
};

/* Stable string hash. Deterministic across server and client — Math.random()
   here would produce a hydration mismatch on every card. */
function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

/* Arc path on a circle, from `start` to `start + sweep` turns. */
function arc(cx: number, cy: number, r: number, start: number, sweep: number): string {
  const a0 = start * Math.PI * 2 - Math.PI / 2;
  const a1 = (start + sweep) * Math.PI * 2 - Math.PI / 2;
  const x0 = cx + r * Math.cos(a0);
  const y0 = cy + r * Math.sin(a0);
  const x1 = cx + r * Math.cos(a1);
  const y1 = cy + r * Math.sin(a1);
  const large = sweep > 0.5 ? 1 : 0;
  return `M ${x0.toFixed(2)} ${y0.toFixed(2)} A ${r} ${r} 0 ${large} 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
}

export default function DishGlyph({
  name,
  kcal,
  protein,
  carbs,
  fat,
  accent = "#84cc16",
  size = 132,
}: Props) {
  const p = Math.max(0, protein ?? 0);
  const c = Math.max(0, carbs ?? 0);
  const f = Math.max(0, fat ?? 0);

  /* Macros are weighed in grams but energy is what the ring should represent,
     so convert: protein and carbs are 4 kcal/g, fat is 9. A gram-share ring
     would make every dish look carb-dominated and would be lying by omission. */
  const eP = p * 4;
  const eC = c * 4;
  const eF = f * 9;
  const total = eP + eC + eF || 1;

  const cx = 50;
  const cy = 50;
  const gap = 0.012; // a hairline of breathing room between arcs

  /* Seeded rotation, so a grid of these reads as a set rather than a repeat. */
  const seed = hash(name);
  const rot = (seed % 360) / 360;

  /* Calories scale the outer radius, clamped so a 195 kcal snack and a 488 kcal
     lunch are visibly different without the small one vanishing. */
  const k = Math.min(1, Math.max(0.55, (kcal ?? 350) / 520));
  const rOuter = 26 + 12 * k;

  const shares = [
    { v: eP / total, color: accent, w: 7 },
    { v: eC / total, color: "#9a9a94", w: 5 },
    { v: eF / total, color: "#5f5f59", w: 3 },
  ];

  let cursor = rot;

  /* Inner texture rings, count seeded, evoking the concentric marks on a
     kitchen scale dial. */
  const rings = 3 + (seed % 3);

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      role="img"
      aria-label={`Macro composition for ${name}: ${Math.round(p)} grams protein, ${Math.round(c)} grams carbohydrate, ${Math.round(f)} grams fat`}
      style={{ display: "block", overflow: "visible" }}
    >
      {Array.from({ length: rings }).map((_, i) => (
        <circle
          key={i}
          cx={cx}
          cy={cy}
          r={8 + i * ((rOuter - 14) / rings)}
          fill="none"
          stroke="#232320"
          strokeWidth={0.6}
        />
      ))}

      {/* The energy split. Order is fixed (protein, carbs, fat) so the same
          colour always means the same macro across every card on the site. */}
      {shares.map((s, i) => {
        const sweep = Math.max(0, s.v - gap);
        const d = arc(cx, cy, rOuter, cursor, sweep);
        cursor += s.v;
        return (
          <path
            key={i}
            d={d}
            fill="none"
            stroke={s.color}
            strokeWidth={s.w}
            strokeLinecap="butt"
          />
        );
      })}

      {/* Centre mark: the still point the arcs are measured against. */}
      <circle cx={cx} cy={cy} r={2} fill={accent} />
    </svg>
  );
}
