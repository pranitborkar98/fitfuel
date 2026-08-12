// app/_hp/Day.tsx
//
// THE FILM. The story and the mission, told once, as a day.
//
// The homepage kept trying to explain the business as a list of capabilities and
// kept failing, because a list is read and a story is watched. So: one
// protagonist, one thread, and time as the spine. Every capability appears as a
// beat instead of a feature card — the kitchen, the weighing, the delivery, the
// auto-logging, the training, the recap, the recalibration.
//
// IT EARNS ITS PLACE HERE rather than earlier. The steps above are THEIR day
// (choose, receive, eat); this is OURS (the 04:00 cook sheet, the scale,
// dispatch), and our day is only interesting once someone has decided theirs.
// It is also the only section that shows the kitchen instead of describing it,
// which two reviews asked for.
//
// THE PHOTOGRAPHS ARE RESOLVED, NOT ASSIGNED. Three of the seven have an honest
// stand-in in public/images and four do not, so four render as type. That is
// deliberate and it is the rule LEGACY in lib/site-images.ts exists to enforce:
// illustrating the doorstep beat with a bowl of vegetables, or the Sunday review
// with a jar of supplements, is a photograph captioned as something it is not.
// The round-3 design instruction deleted exactly those four assignments.
//
// SERVER COMPONENT. The frame switcher below it is the control.

import v from "./v2.module.css";
import Idx from "./Idx";
import Film, { type Beat } from "./Film";
import { slot } from "@/lib/site-images";
import { WRAP, DIM, display, body } from "./theme";

type Spec = Omit<Beat, "src" | "ai"> & { slotName: string };

const BEATS: Spec[] = [
  {
    time: "04:00",
    line: "The kitchen wakes",
    copy: "Before the city does. Tonight's cook sheet was computed from every active plan, portion by portion, so nothing is cooked to an average.",
    tag: "kitchen",
    slotName: "0400-kitchen",
    alt: "The FitFuel kitchen before dawn",
    duo: true,
  },
  {
    time: "06:30",
    line: "Your food is weighed",
    copy: "Not estimated, not eyeballed. Every portion hits your macros on a scale before the compartment is sealed. That single act is the whole product.",
    tag: "the scale",
    slotName: "0630-weighing",
    alt: "Ingredients being weighed on a prep board",
    duo: true,
  },
  {
    time: "08:00",
    line: "It is at your door",
    copy: "Fifteen areas of east Pune, six days a week, one bundled drop, tracked from the kitchen to your hand by the driver's own app.",
    tag: "delivery",
    slotName: "0800-doorstep",
    alt: "A FitFuel box at the door",
    duo: false,
  },
  {
    time: "08:02",
    line: "It logs itself",
    copy: "The meal lands in your diary with the macros it was weighed to. You did not open an app, you did not guess a portion, you did not forget.",
    tag: "the diary",
    slotName: "0802-logged",
    alt: "A sealed FitFuel bowl, macros already logged",
    duo: false,
  },
  {
    time: "18:30",
    line: "You train to the plan",
    copy: "Your plan carries a training block drawn from a 952-exercise library. Sets and reps go in, the burn comes back as one net-calorie figure.",
    tag: "training",
    slotName: "1830-training",
    alt: "A training session in progress",
    duo: true,
  },
  {
    time: "21:00",
    line: "The day closes itself",
    copy: "Eaten against target, trained against scheduled, water, weight. One recap, on WhatsApp, without you asking for it.",
    tag: "the recap",
    slotName: "2100-evening",
    alt: "The end of a training day",
    duo: true,
  },
  {
    time: "SUNDAY",
    line: "The target moves",
    copy: "Flat for a fortnight against the rate your goal needs? The target is recalculated from numbers we already hold. You did not have to notice the plateau.",
    tag: "recalibration",
    slotName: "sunday-review",
    alt: "The weekly review and recalibration",
    duo: true,
  },
];

export default function Day() {
  const beats: Beat[] = BEATS.map(({ slotName, ...b }) => {
    const img = slot("film", slotName);
    return { ...b, src: img?.src ?? null, ai: img?.ai ?? false };
  });

  return (
    <section aria-labelledby="hp-film" style={{ padding: "clamp(56px,8vw,110px) 0 clamp(26px,3.4vw,42px)" }}>
      <div style={WRAP}>
        <Idx label="One day, start to finish" />

        <div className={v.head}>
          <h2 id="hp-film" className={v.rise} style={{ ...display("clamp(2.2rem,6vw,4.8rem)"), maxWidth: "16ch" }}>
            Everything we built, in the order you meet it
          </h2>
          <p className={v.rise} style={{ ...body(16.5), maxWidth: "44ch" }}>
            One pass is one day: 04:00 in the kitchen to the Sunday recalibration. Pick an
            hour and the frame changes.
          </p>
        </div>

        <div style={{ marginTop: "clamp(30px,4vw,56px)" }}>
          <Film beats={beats} />
        </div>

        <p style={{ ...body(14), color: DIM, marginTop: 22 }}>
          Nothing in that day needs you to remember anything. That is the entire argument,
          and the rest of this page is the evidence for it.
        </p>
      </div>
    </section>
  );
}
