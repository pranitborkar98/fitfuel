// app/_home/TheDay.tsx
//
// THE FILM.
//
// The homepage had become an encyclopedia: twenty-odd sections, each
// explaining a capability. Encyclopedias are read; films are watched. The
// owner's note was that even he could not tell the story, and that the page
// should feel like "a dream, a movie, a scripted thing".
//
// So this is the opening act, and it is literally a film. One protagonist
// (you), one thread (a single day), time as the spine. You scroll DOWN and
// the day moves SIDEWAYS, frame by frame, 04:00 to the next morning. Every
// capability appears as a beat in the story instead of a feature card:
// the kitchen, the weighing, the delivery, the auto-logging, the training,
// the recap, the recalibration.
//
// Pattern per ui-ux-pro-max: "Horizontal Scroll Journey" (immersive product
// discovery, high engagement). Motion tier: Complex / scrub-driven.
//
// Built with native CSS scroll-driven animation, so it is a SERVER
// COMPONENT and ships zero JavaScript. The horizontal travel is a single
// translateX on the track, scrubbed by the runway's view-timeline. Same
// technique family as the loop dial, on the other axis.
//
// MOBILE IS NOT A SHRUNKEN DESKTOP. Below 900px the pinned horizontal
// scrub is replaced by a native horizontal scroll-snap carousel: you swipe
// through the day with your thumb, which is the correct gesture on a phone
// and needs no scroll hijacking. Same frames, same story, no clutter.

import Image from "next/image";
import { RULE, LIME, INK, MUTE, DIM, huge, mid, copy, tag } from "./theme";

type Frame = {
  time: string;
  line: string;
  sub: string;
  src: string;
  alt: string;
  duo?: boolean;
};

const FRAMES: Frame[] = [
  {
    time: "04:00",
    line: "The kitchen wakes",
    sub: "Before the city does. Today's cook sheet was computed last night, portion by portion.",
    src: "/images/kitchen.jpg",
    alt: "The FitFuel kitchen before dawn",
  },
  {
    time: "06:30",
    line: "Your food is weighed",
    sub: "Not estimated. Every portion hits your macros on a scale before it is sealed.",
    src: "/images/chef-hands.jpg",
    alt: "Ingredients being weighed on a prep board",
  },
  {
    time: "08:00",
    line: "It is at your door",
    sub: "Across east Pune, six days a week. You did not have to think about breakfast.",
    src: "/images/hero-bowl.jpg",
    alt: "A FitFuel bowl of fresh vegetables and chickpeas",
  },
  {
    time: "13:00",
    line: "You eat. It logs itself",
    sub: "No photographing your plate. No guessing a portion. The numbers were already ours.",
    src: "/images/produce.jpg",
    alt: "Fresh produce prepared for the kitchen",
  },
  {
    time: "19:00",
    line: "You train. The burn counts",
    sub: "One of 952 exercises, from a program built for your plan. It feeds one net figure.",
    src: "/images/training.jpg",
    alt: "An athlete training",
    duo: true,
  },
  {
    time: "21:00",
    line: "The day closes itself",
    sub: "A recap lands. If the week went flat, tomorrow's target has already moved.",
    src: "/images/gym.jpg",
    alt: "A gym floor at night",
    duo: true,
  },
];

function FrameCard({ f, i }: { f: Frame; i: number }) {
  return (
    <article className="ff-day-frame" aria-label={`${f.time}. ${f.line}`}>
      <div className={`ff-day-media ${f.duo ? "ff-duo" : "ff-food"}`}>
        <Image
          src={f.src}
          alt={f.alt}
          fill
          sizes="(max-width: 900px) 88vw, 100vw"
          priority={i === 0}
          quality={72}
          style={{ objectFit: "cover" }}
        />
        {f.duo ? <span className="ff-tint" aria-hidden /> : null}
        <span className="ff-day-scrim" aria-hidden />
      </div>

      <div className="ff-day-copy">
        <span className="ff-day-time" style={{ ...huge("clamp(2.6rem,7vw,5.4rem)"), color: LIME }}>{f.time}</span>
        <h3 className="ff-day-line" style={huge("clamp(2rem,5.2vw,4.2rem)")}>{f.line}</h3>
        <p className="ff-day-sub" style={{ ...copy(16), color: "#d6d6d0" }}>{f.sub}</p>
      </div>
    </article>
  );
}

export default function TheDay() {
  return (
    <section
      id="the-day"
      className="ff-day"
      aria-labelledby="day-heading"
      style={{ ["--frames" as string]: FRAMES.length }}
    >
      {/* Title card. Kept deliberately bare: a film opens on a title, not on
          a paragraph of exposition. */}
      <div className="ff-day-title">
        <span style={tag(LIME)}>One day on FitFuel</span>
        <h2 id="day-heading" style={{ ...huge("clamp(2.2rem,5.4vw,4.4rem)"), maxWidth: "18ch", marginTop: 14 }}>
          This is what a Tuesday looks like
        </h2>
      </div>

      {/* ── DESKTOP: pinned horizontal film ─────────────────────────────
          The runway's height is the film's runtime. The stage pins and the
          track slides sideways underneath it. */}
      <div className="ff-day-runway">
        <div className="ff-day-stage">
          <div className="ff-day-track">
            {FRAMES.map((f, i) => (
              <FrameCard key={f.time} f={f} i={i} />
            ))}
          </div>

          {/* Film-strip progress. Fills as the day advances. */}
          <div className="ff-day-progress" aria-hidden>
            <span className="ff-day-progress-fill" />
          </div>
        </div>
      </div>

      {/* ── MOBILE: swipeable carousel ──────────────────────────────────
          A native scroll-snap track. The correct gesture on a phone, no
          hijacking, no pinning, identical content. */}
      <div className="ff-day-swipe" role="region" aria-label="One day on FitFuel, swipe to advance">
        {FRAMES.map((f, i) => (
          <FrameCard key={f.time} f={f} i={i} />
        ))}
      </div>
      <p className="ff-day-hint" style={{ ...tag(DIM), fontSize: 12 }}>Swipe to move through the day</p>
    </section>
  );
}
