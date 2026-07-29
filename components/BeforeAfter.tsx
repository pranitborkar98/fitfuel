// components/BeforeAfter.tsx
//
// A transformation story slot, and the frame that stands where one will go.
//
// WHY THIS IS THE ONE IMAGE SLOT WITH NO AI FALLBACK.
//
// Every other slot on this site degrades real photo → AI illustration → glyph,
// because an illustrative picture of a curry beside a real calorie number is a
// labelled stand-in for food that genuinely exists. A before/after does not
// work that way. It is not decoration of a claim, it IS the claim: the image is
// the evidence that the programme changes bodies. An AI-generated before/after
// is therefore not an illustration of a result, it is a fabricated result — and
// no sr-only disclosure repairs that, because the visual is doing the
// persuading and the caption is not. In India it would also put a health-
// outcome claim on the page with nothing behind it.
//
// So resolveImage() is deliberately NOT used here, and "people" images are read
// ONLY from public/images/people/ — the real directory. There is no
// public/images/ai/people/ path in this component, and IMAGE-BRIEF-V2.md
// excludes before/after from the prompt bank for the same reason.
//
// THE BAR FOR PUTTING A STORY HERE, all four, no exceptions:
//   1. A real FitFuel member.
//   2. Written consent naming this page, on file, renewable.
//   3. Numbers from their own logged data, not recalled.
//   4. The same framing, lens and lighting in both frames. A "before" shot
//      slouched in bad light next to an "after" shot posed in good light is a
//      lighting result, not a nutrition one.
//
// Until then the empty frame is the honest render, and it is built to look
// deliberate rather than broken — the /results page already promises "we would
// rather show you nothing than show you stock photos and invented numbers",
// and this is that sentence as a component.
//
// SERVER COMPONENT.

import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

const PUBLIC = path.join(process.cwd(), "public");
const EXT = [".jpg", ".jpeg", ".png", ".webp", ".avif"];

/** Real photography only. No AI directory is consulted, on purpose. */
function realPersonImage(slug: string, phase: "before" | "after"): string | null {
  for (const ext of EXT) {
    const rel = `images/people/${slug}-${phase}${ext}`;
    if (fs.existsSync(path.join(PUBLIC, rel))) return `/${rel}`;
  }
  return null;
}

export interface Story {
  /** File key: public/images/people/<slug>-before.jpg and -after.jpg */
  slug: string;
  name: string;
  area: string;
  plan: string;
  /** How long between the two photographs. Stated, never implied. */
  weeks: number;
  /** Short factual delta from logged data, e.g. "84.2kg to 78.6kg". */
  change: string;
  /** Their words. Unedited. */
  quote?: string;
}

const C = {
  border: "#1f1f1f",
  card: "#0e0e0e",
  ink: "#ffffff",
  sub: "#a3a3a3",
  muted: "#9a9a94",
  accent: "#a3e635",
};

/** The reserved frame: correct aspect ratio, labelled halves, no fake body. */
function EmptyFrame() {
  return (
    <div
      aria-hidden="true"
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 2,
        background: C.border,
        border: `1px dashed ${C.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}
    >
      {(["Before", "After"] as const).map((label) => (
        <div
          key={label}
          style={{
            aspectRatio: "3 / 4",
            background: "#0b0b0b",
            display: "flex",
            alignItems: "flex-end",
            justifyContent: "center",
            padding: 12,
          }}
        >
          <span
            style={{
              fontFamily: "var(--ff-cond)",
              textTransform: "uppercase",
              letterSpacing: "0.18em",
              fontSize: 11,
              color: "#3a3a3a",
            }}
          >
            {label}
          </span>
        </div>
      ))}
    </div>
  );
}

export function BeforeAfterSlot({ story }: { story?: Story }) {
  const before = story ? realPersonImage(story.slug, "before") : null;
  const after = story ? realPersonImage(story.slug, "after") : null;
  const complete = Boolean(story && before && after);

  return (
    <figure
      style={{
        margin: 0,
        background: C.card,
        border: `1px solid ${C.border}`,
        borderRadius: 16,
        padding: 16,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {complete && story ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: 2,
            background: C.border,
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          {([
            ["Before", before!],
            ["After", after!],
          ] as const).map(([label, src]) => (
            <div key={label} style={{ position: "relative", aspectRatio: "3 / 4" }}>
              <Image
                src={src}
                alt={`${story.name}, ${label.toLowerCase()} ${story.weeks} weeks on the ${story.plan} plan`}
                fill
                sizes="(max-width: 700px) 50vw, 220px"
                quality={78}
                style={{ objectFit: "cover" }}
              />
              <span
                style={{
                  position: "absolute",
                  left: 8,
                  bottom: 8,
                  fontFamily: "var(--ff-cond)",
                  textTransform: "uppercase",
                  letterSpacing: "0.16em",
                  fontSize: 10.5,
                  color: "#fff",
                  background: "rgba(0,0,0,0.62)",
                  padding: "3px 8px",
                  borderRadius: 4,
                }}
              >
                {label}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyFrame />
      )}

      <figcaption style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {complete && story ? (
          <>
            <div style={{ fontSize: 15.5, fontWeight: 700, color: C.ink }}>
              {story.change}
              <span style={{ color: C.muted, fontWeight: 500 }}> in {story.weeks} weeks</span>
            </div>
            <div style={{ fontSize: 13, color: C.sub }}>
              {story.name} · {story.area} · {story.plan}
            </div>
            {story.quote && (
              <p style={{ fontSize: 14, color: C.sub, lineHeight: 1.65, margin: "6px 0 0" }}>
                &ldquo;{story.quote}&rdquo;
              </p>
            )}
            {/* Stated once per story rather than as a page-wide disclaimer under
                the strongest number, where it reads as a retraction. */}
            <p style={{ fontSize: 11.5, color: "#6b6b6b", margin: "4px 0 0", lineHeight: 1.5 }}>
              Published with written consent. Figures from this member&rsquo;s own logged
              data. Results depend on adherence and vary between people.
            </p>
          </>
        ) : (
          <>
            <div style={{ fontSize: 14.5, fontWeight: 600, color: C.sub }}>
              Reserved for a real member
            </div>
            <p style={{ fontSize: 13, color: C.muted, lineHeight: 1.6, margin: 0 }}>
              Two photographs, same framing and light, taken weeks apart, with numbers from
              their own logged data and their written permission to publish. We will not
              fill this with a stock body or a generated one.
            </p>
          </>
        )}
      </figcaption>
    </figure>
  );
}

export default BeforeAfterSlot;
