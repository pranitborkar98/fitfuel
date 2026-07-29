// app/_hp/DishImage.tsx
//
// A dish's picture if one exists, and its macro fingerprint if it does not.
//
// The point of this component is that adding photography requires NO code
// change. Drop a correctly named file into public/images/ and that dish starts
// showing a photograph on the next build; until then it shows the DishGlyph
// generated from its own weighed macros. The page improves one file at a time
// instead of waiting for a complete set.
//
// LOOKUP ORDER, and the order matters:
//   1. public/images/dishes/<slug>.jpg   real photography  — always wins
//   2. public/images/ai/dishes/<slug>.jpg  AI-generated, illustrative
//   3. the generated glyph
//
// Real beats AI beats generated, so replacing an illustrative image with a real
// photograph of that dish is a single file drop and needs no edit here. That is
// also why the two live in separate directories: an AI asset can never be
// mistaken for a photograph in a file listing, and the swap shows up in a diff.
//
// The existence check runs at build time on the server. The homepage is
// statically prerendered, so this costs nothing per request.
//
// SERVER COMPONENT.

import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

import DishGlyph from "./DishGlyph";
import s from "./hp.module.css";

/** Must match the slugs in IMAGE-BRIEF.md: lowercase, first six words. */
export function dishSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .split("-")
    .slice(0, 6)
    .join("-");
}

const PUBLIC = path.join(process.cwd(), "public");
const EXT = [".jpg", ".jpeg", ".png", ".webp"];

/** First existing file for this dish, or null. Real photography first.
 *  Exported because /menu resolves the same paths server-side and hands the
 *  result to a client component — one lookup convention, not two. */
export function findDishImage(slug: string): { src: string; ai: boolean } | null {
  for (const [dir, ai] of [
    ["images/dishes", false],
    ["images/ai/dishes", true],
  ] as const) {
    for (const ext of EXT) {
      const rel = `${dir}/${slug}${ext}`;
      if (fs.existsSync(path.join(PUBLIC, rel))) return { src: `/${rel}`, ai };
    }
  }
  return null;
}

export default function DishImage({
  name,
  kcal,
  protein,
  carbs,
  fat,
  accent,
}: {
  name: string;
  kcal: number | null;
  protein: number | null;
  carbs: number | null;
  fat: number | null;
  accent?: string;
}) {
  const found = findDishImage(dishSlug(name));

  if (!found) {
    return (
      <div className={s.glyph}>
        <DishGlyph name={name} kcal={kcal} protein={protein} carbs={carbs} fat={fat} accent={accent} size={146} />
      </div>
    );
  }

  return (
    <figure className={s.dishShot} style={{ margin: 0 }}>
      <Image
        src={found.src}
        alt={name}
        fill
        sizes="(max-width: 900px) 50vw, 300px"
        quality={75}
      />
      {/* Per-image provenance, in the markup rather than burned into the
          picture. Not a visible badge — the owner asked for the disclosure to
          live in the Terms, not on the photograph — but a machine-readable and
          screen-reader-reachable statement of what this image is, which is what
          makes the Terms 13A claim verifiable per asset rather than in bulk. */}
      {found.ai && (
        <figcaption className="sr-only">
          Illustrative AI-generated image. Not a photograph of the meal as
          delivered. The macros shown for this dish are real.
        </figcaption>
      )}
    </figure>
  );
}
