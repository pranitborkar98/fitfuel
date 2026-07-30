// app/_hp/Day.tsx
//
// THE FILM. The story and the mission, told once, as a day.
//
// The homepage kept trying to explain the business as a list of capabilities and
// kept failing, because a list is read and a story is watched. So this is one
// protagonist (you), one thread (a single day), and time as the spine: you
// scroll DOWN and the day moves SIDEWAYS, 04:00 to the next morning. Every
// capability appears as a beat instead of a feature card — the kitchen, the
// weighing, the delivery, the auto-logging, the training, the recap, the
// recalibration, the next box.
//
// This replaces app/_home/TheDay.tsx, which was the same idea built against the
// old three-typeface theme. Keeping both would have meant two design generations
// on one page, which is the exact failure DESIGN.md was written to end.
//
// Built on native CSS scroll-driven animation, so it is a SERVER COMPONENT and
// ships zero JavaScript. Below 900px, and under prefers-reduced-motion, the
// pinned scrub becomes a native scroll-snap carousel: thumb swiping is the right
// gesture on a phone and it needs no hijacking.

import Image from "next/image";

import s from "./hp.module.css";
import Idx from "./Idx";
import { slot } from "@/lib/site-images";
import { WRAP, INK, MUTE, DIM, LIME, sub, body, label, figure as fig } from "./theme";

type Frame = {
  time: string;
  line: string;
  copy: string;
  /** Name in public/images/[ai/]film/ — see IMAGE-BRIEF-V2.md §3.
      Resolution goes through slot(), so a beat shows a photograph only when
      one of the actual subject exists. Four of these seven have no honest
      legacy stand-in and render as type until §3 is generated: illustrating
      the doorstep beat with a bowl of vegetables was worse than illustrating
      it with nothing. The honesty rule lives in LEGACY, not here. */
  slotName: string;
  alt: string;
  duo?: boolean;
};

const FRAMES: Frame[] = [
  {
    time: "04:00",
    line: "The kitchen wakes",
    copy: "Before the city does. Tonight's cook sheet was computed from every active plan, portion by portion, so nothing is cooked to an average.",
    slotName: "0400-kitchen",
    alt: "The FitFuel kitchen before dawn",
    duo: true,
  },
  {
    time: "06:30",
    line: "Your food is weighed",
    copy: "Not estimated, not eyeballed. Every portion hits your macros on a scale before the compartment is sealed. That single act is the whole product.",
    slotName: "0630-weighing",
    alt: "Ingredients being weighed on a prep board",
    duo: true,
  },
  {
    time: "08:00",
    line: "It is at your door",
    copy: "Across fifteen areas of east Pune, six days a week, tracked from the kitchen to your hand by the driver's own app.",
    slotName: "0800-doorstep",
    alt: "Fresh produce prepared for the day's cooking",
  },
  {
    time: "08:02",
    line: "It logs itself",
    copy: "The meal lands in your diary with the macros it was weighed to. You did not open an app, you did not guess a portion, you did not forget.",
    slotName: "0802-logged",
    alt: "A sealed FitFuel bowl, macros already logged",
  },
  {
    time: "18:30",
    line: "You train to the programme",
    copy: "Your plan carries a training block drawn from a 952-exercise library. Sets and reps go in, the burn comes back out as one net-calorie figure.",
    slotName: "1830-training",
    alt: "A training session in progress",
    duo: true,
  },
  {
    time: "21:00",
    line: "The day closes itself",
    copy: "Eaten against target, trained against scheduled, water, weight. One recap, on WhatsApp, without you asking for it.",
    slotName: "2100-evening",
    alt: "The end of a training day",
    duo: true,
  },
  {
    time: "SUNDAY",
    line: "The target moves",
    copy: "Flat for a week against the rate your goal needs? The calorie target is recalculated from energy-balance arithmetic on numbers we already hold. You do not have to notice the plateau. We already did.",
    slotName: "sunday-review",
    alt: "Weekly review and recalibration",
    duo: true,
  },
];

export default function Day() {
  return (
    <section aria-labelledby="hp-day">
      <div style={WRAP}>
        <Idx label="One day, start to finish" />
        <h2
          id="hp-day"
          className={s.kin}
          style={{ ...sub("clamp(1.9rem,5vw,3.6rem)"), maxWidth: "17ch" }}
        >
          Everything we built, in the order you meet it
        </h2>
        <p style={{ ...body(16.5), marginTop: 18 }}>
          Scroll. The day moves sideways.
        </p>
      </div>

      <div className={s.runway}>
        <div className={s.stage}>
          <div className={s.track}>
            {FRAMES.map((f) => {
              /* A photograph only when one of this beat's actual subject
                 exists. Otherwise the beat is set as type: the hour at
                 headline scale over a hairline, which is the readout register
                 this system already speaks in, and it varies the rhythm of the
                 runway instead of showing seven identical photo boxes. */
              const img = slot("film", f.slotName);
              const grade = img ? (f.duo ? s.gradeDuo : s.gradeFood) : s.framePlate;
              return (
              <figure key={f.time} className={`${s.frame} ${grade}`}>
                {img ? (
                  <Image
                    src={img.src}
                    alt={f.alt}
                    fill
                    sizes="(max-width: 900px) 84vw, 520px"
                    quality={75}
                  />
                ) : (
                  /* Not aria-hidden: with the caption's time label dropped
                     below, this IS the hour for a screen reader too. */
                  <div className={s.framePlateMark}>
                    <span style={fig("clamp(3.4rem,7vw,5.6rem)")}>{f.time}</span>
                  </div>
                )}
                {img?.ai && (
                  <figcaption className="sr-only">
                    Illustrative AI-generated image. Not a photograph of our kitchen.
                  </figcaption>
                )}
                <figcaption className={s.frameBody}>
                  {/* On a plate the hour is already the dominant mark at the
                      top of the frame. Repeating it here would be the
                      over-annotation habit DESIGN.md rejects by name. */}
                  {img && <span style={label(LIME)}>{f.time}</span>}
                  <div style={{ ...sub("clamp(1.4rem,2.6vw,2rem)"), color: INK, marginTop: img ? 10 : 0 }}>
                    {f.line}
                  </div>
                  <p style={{ ...body(14.5), color: MUTE, marginTop: 10 }}>{f.copy}</p>
                </figcaption>
              </figure>
              );
            })}
          </div>
        </div>
      </div>

      <div style={WRAP}>
        <p style={{ ...body(14), color: DIM, marginTop: 22 }}>
          Nothing in that day needs you to remember anything. That is the entire
          argument, and the rest of this page is the evidence for it.
        </p>
      </div>
    </section>
  );
}
