// scripts/check-slot-sync.mjs
//
// Fails if scripts/image-slots.mjs and lib/site-images.ts disagree about which
// slots exist.
//
// THE FAILURE THIS CATCHES. The site reads lib/site-images.ts. The generator
// writes what scripts/image-slots.mjs lists. Nothing connects them but care, and
// care has already failed once here: the old generator emitted "goal-fatloss"
// into a flat public/images/ai/ for months while the resolver looked for
// "lose-fat" in public/images/ai/goals/. Every file it produced was invisible,
// and nothing on disk or in CI said so. A rename on either side reintroduces
// exactly that, silently, and the symptom is not an error — it is a page that
// still renders type and an owner who cannot tell whether the batch worked.
//
//   node scripts/check-slot-sync.mjs
//
// Dishes are excluded: both sides derive them from lib/menu-alacarte.ts with the
// same dishSlug(), so they cannot disagree without that file changing shape,
// which is a different failure with a louder symptom.

import fs from "node:fs";
import path from "node:path";
import { SLOTS } from "./image-slots.mjs";

const src = fs.readFileSync(path.resolve("lib/site-images.ts"), "utf8");

/** Pull the string members out of one `export const NAME = [...] as const;`. */
function arrayFrom(constName) {
  const m = src.match(new RegExp(`export const ${constName} = \\[([\\s\\S]*?)\\] as const;`));
  if (!m) throw new Error(`${constName} not found in lib/site-images.ts`);
  return [...m[1].matchAll(/"([^"]+)"/g)].map((x) => x[1]);
}

const EXPECTED = {
  hero: arrayFrom("HERO_SLOTS"),
  goals: arrayFrom("GOAL_SLOTS"),
  film: arrayFrom("FILM_SLOTS"),
  sections: arrayFrom("SECTION_SLOTS"),
  social: arrayFrom("SOCIAL_SLOTS"),
};

const actual = {};
for (const s of SLOTS) (actual[s.folder] ??= []).push(s.name);

let bad = 0;
for (const [folder, want] of Object.entries(EXPECTED)) {
  const got = actual[folder] ?? [];
  const missing = want.filter((n) => !got.includes(n));
  const extra = got.filter((n) => !want.includes(n));

  for (const n of missing) {
    bad++;
    console.error(`MISSING  ${folder}/${n} is in lib/site-images.ts but has no prompt in image-slots.mjs`);
  }
  for (const n of extra) {
    bad++;
    console.error(`ORPHAN   ${folder}/${n} has a prompt but nothing in lib/site-images.ts reads it`);
  }
}

if (bad) {
  console.error(`\n${bad} slot mismatch${bad === 1 ? "" : "es"}. Generated files would land where no code looks.`);
  process.exit(1);
}
console.log(`slot manifests agree: ${Object.values(EXPECTED).flat().length} non-dish slots in sync`);
