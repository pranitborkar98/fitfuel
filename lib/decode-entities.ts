// lib/decode-entities.ts
//
// Seeded copy in the database carries HTML entities — prisma/seed-phase14.ts has
// 31 lines containing &mdash; and &middot;. React escapes text nodes, correctly
// and deliberately, so those rows render on the page as the literal characters
// "&mdash;" rather than as an em dash. A featured testimonial reading
// "actually delicious &mdash; I was expecting" was live on the homepage.
//
// DECODED AT READ, NOT FIXED IN THE ROWS. A one-off UPDATE would fix today's
// data and nothing else: the admin content editor writes these columns too, and
// anything pasted from a document brings entities with it. This runs on the way
// out, so every consumer is covered and no row has to be rewritten.
//
// IT IS NOT AN HTML PARSER AND MUST NOT BECOME ONE. It maps a fixed set of
// named entities to characters and leaves everything else exactly as it found
// it. The output is still rendered as a TEXT node — never through
// dangerouslySetInnerHTML — so turning "&lt;" back into "<" cannot inject
// markup. Do not extend this to strip or interpret tags.

const NAMED: Record<string, string> = {
  amp: "&",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  nbsp: " ",
  mdash: "—",
  ndash: "–",
  middot: "·",
  hellip: "…",
  rsquo: "’",
  lsquo: "‘",
  rdquo: "”",
  ldquo: "“",
  deg: "°",
  times: "×",
  rupee: "₹",
};

/** Decode the named and numeric entities that show up in seeded copy. */
export function decodeEntities(input: string): string {
  if (!input || input.indexOf("&") === -1) return input;
  return input.replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z][a-zA-Z0-9]*);/g, (whole, body: string) => {
    if (body[0] === "#") {
      const hex = body[1] === "x" || body[1] === "X";
      const code = Number.parseInt(hex ? body.slice(2) : body.slice(1), hex ? 16 : 10);
      /* Surrogates and out-of-range code points come back untouched rather than
         as a replacement character, so bad input stays visible instead of
         quietly becoming a question mark. */
      if (!Number.isFinite(code) || code < 0x20 || code > 0x10ffff) return whole;
      if (code >= 0xd800 && code <= 0xdfff) return whole;
      return String.fromCodePoint(code);
    }
    return NAMED[body] ?? NAMED[body.toLowerCase()] ?? whole;
  });
}

/** Decode every string field of a row, leaving non-strings alone. */
export function decodeRow<T extends Record<string, unknown>>(row: T): T {
  const out: Record<string, unknown> = { ...row };
  for (const k of Object.keys(out)) {
    const v = out[k];
    if (typeof v === "string") out[k] = decodeEntities(v);
  }
  return out as T;
}
