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
// is therefore not an illustration of a result, it is a fabricated result, and
// no sr-only disclosure repairs that, because the visual is doing the
// persuading and the caption is not. In India it would also put a health-
// outcome claim on the page with nothing behind it.
//
// So resolveImage() is deliberately NOT used here, and "people" images are read
// ONLY from public/images/people/ — the real directory. There is no
// public/images/ai/people/ path in this component, and before/after is
// excluded from the AI prompt bank for the same reason.
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
// deliberate rather than broken.
//
// STYLING. Migrated onto the Instrument System. It carried its own palette
// (#1f1f1f, #0e0e0e, radius 12/16, and a #3a3a3a "Before" label at 1.5:1 that
// failed AA outright). Radius is 0 throughout now, structure is hairlines, and
// every label sits on a grey from the ramp.
//
// SERVER COMPONENT.

import fs from "node:fs";
import path from "node:path";
import Image from "next/image";

import { DIM, INK, MUTE, PANEL, RULE, body, label } from "@/app/_ui/theme";

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

/* The two frames, side by side, separated by a 1px rule rather than a gap. */
const FRAMES = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: 1,
  background: RULE,
  border: `1px solid ${RULE}`,
} as const;

/** The reserved frame: correct aspect ratio, labelled halves, no fake body. */
function EmptyFrame() {
  return (
    <div aria-hidden="true" style={FRAMES}>
      {(["Before", "After"] as const).map((phase) => (
        <div
          key={phase}
          style={{
            aspectRatio: "3 / 4",
            background: PANEL,
            display: "flex",
            alignItems: "flex-end",
            padding: 12,
          }}
        >
          {/* On the ramp at 5.4:1. The old #3a3a3a was 1.5:1, which meant the
              one word in the frame was effectively invisible. */}
          <span style={label()}>{phase}</span>
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
        background: "#070707",
        border: `1px solid ${RULE}`,
        padding: 14,
        display: "flex",
        flexDirection: "column",
        gap: 14,
      }}
    >
      {complete && story ? (
        <div style={FRAMES}>
          {(
            [
              ["Before", before!],
              ["After", after!],
            ] as const
          ).map(([phase, src]) => (
            <div key={phase} style={{ position: "relative", aspectRatio: "3 / 4" }}>
              <Image
                src={src}
                alt={`${story.name}, ${phase.toLowerCase()} ${story.weeks} weeks on the ${story.plan} plan`}
                fill
                sizes="(max-width: 700px) 50vw, 220px"
                quality={78}
                style={{ objectFit: "cover" }}
              />
              <span
                style={{
                  ...label(INK),
                  position: "absolute",
                  left: 0,
                  bottom: 0,
                  background: "rgba(7,7,7,0.78)",
                  padding: "5px 9px",
                }}
              >
                {phase}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <EmptyFrame />
      )}

      <figcaption style={{ display: "flex", flexDirection: "column", gap: 7 }}>
        {complete && story ? (
          <>
            <div
              style={{
                fontFamily: "var(--font-barlow-condensed), sans-serif",
                fontWeight: 900,
                fontSize: 22,
                lineHeight: 0.95,
                letterSpacing: "-0.02em",
                textTransform: "uppercase",
                color: INK,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {story.change}
            </div>
            <span style={label()}>In {story.weeks} weeks</span>
            <div style={{ ...body(13.5), color: MUTE, marginTop: 2 }}>
              {story.name} &middot; {story.area} &middot; {story.plan}
            </div>
            {story.quote && (
              <p style={{ ...body(14), marginTop: 6 }}>&ldquo;{story.quote}&rdquo;</p>
            )}
            {/* Stated once per story rather than as a page-wide disclaimer under
                the strongest number, where it reads as a retraction. */}
            <p style={{ ...body(12.5), color: DIM, marginTop: 6 }}>
              Published with written consent. Figures from this member&rsquo;s own logged data.
              Results depend on adherence and vary between people.
            </p>
          </>
        ) : (
          <>
            <span style={label()}>Reserved for a real member</span>
            <p style={{ ...body(13.5), marginTop: 4 }}>
              Two photographs, same framing and light, taken weeks apart, with numbers from their
              own logged data and their written permission to publish. We will not fill this with a
              stock body or a generated one.
            </p>
          </>
        )}
      </figcaption>
    </figure>
  );
}

export default BeforeAfterSlot;
