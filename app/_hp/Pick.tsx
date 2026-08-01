// app/_hp/Pick.tsx
//
// THE FINDER. Which of these is you, and what number does it produce.
//
// This is the section's third shape and the first one that answers its own
// question. It began as four cards and a link, which told a visitor which row
// was theirs but nothing about what they would get. The prototype's improvement
// is that picking a door runs the arithmetic in front of you, so the section
// stops asserting "personalised" and demonstrates it.
//
// The calculator lives in Finder.tsx because it is a control. Everything this
// file does is server-side: query the real plan counts and hand them down. No
// count on this page is typed by hand, which is the rule that stopped
// "70 condition plans" sitting on a card whose own link showed a different
// number.
//
// THE HREFS. MealPlan.subCategory is the real goal taxonomy (weight_loss,
// muscle_gain, balanced), which the catalogue searches on. `?goal=` seeds that
// search, so every door lands filtered. Three of these four once pointed at
// ?category=WEIGHT_LOSS and friends, none of which are valid categories, so they
// were silently discarded and dropped the visitor on an unfiltered list of 126.
//
// NOT filtered by diet when counting, deliberately: the 126 plans are one row
// per goal PER DIET VARIANT, so weight_loss is 5 rows of which exactly 1 is VEG.
// Counting on the VEG default would print "1 plan" under a sentence that says
// there are 126. The door is about the goal; diet is a switch on the next page.
//
// SERVER COMPONENT.

import { prisma } from "@/lib/prisma";
import v from "./v2.module.css";
import Idx from "./Idx";
import Finder, { type DoorSpec } from "./Finder";
import { WRAP, display, body } from "./theme";

/* accent: the catalogue's goal taxonomy, unchanged since the plan surfaces were
   built. See the note in Finder.tsx on why this is the one non-lime hue here. */
const DOORS: (Omit<DoorSpec, "count"> & { token: string | null })[] = [
  {
    goal: "Lose fat",
    who: "You want the weight down without living on boiled eggs.",
    what: "Calorie-controlled with protein held high, so the weight comes off and the muscle does not.",
    href: "/plans?goal=weight_loss",
    accent: "#a3e635",
    fitnessGoal: "weight_loss",
    split: [["Protein", 30], ["Carbohydrate", 43], ["Fat", 27]],
    token: "weight_loss",
  },
  {
    goal: "Build muscle",
    who: "You train, and eating enough is the part that keeps failing.",
    what: "Higher calories with protein spread across four meals, so you actually hit the number.",
    href: "/plans?goal=muscle_gain",
    accent: "#f59e0b",
    fitnessGoal: "muscle_gain",
    split: [["Protein", 28], ["Carbohydrate", 45], ["Fat", 27]],
    token: "muscle_gain",
  },
  {
    goal: "Just eat well",
    who: "No target. You are tired of deciding what is for dinner.",
    what: "Balanced macros, varied cuisines, cooked properly. Nothing about it feels like a diet.",
    href: "/plans?goal=balanced",
    accent: "#38bdf8",
    fitnessGoal: "maintenance",
    split: [["Protein", 22], ["Carbohydrate", 51], ["Fat", 27]],
    token: "balanced",
  },
  {
    goal: "Eat for a condition",
    who: "Diabetes, PCOS, thyroid, fatty liver, postpartum, and 33 more.",
    what: "Written for a diagnosis by a nutritionist, not a generic plan with the rice taken out.",
    href: "/plans?category=LIFESTYLE_MEDICAL",
    accent: "#2dd4bf",
    fitnessGoal: "manage_condition",
    split: [["Protein", 25], ["Carbohydrate", 48], ["Fat", 27]],
    token: null,
  },
];

async function doorCounts(): Promise<Record<string, number>> {
  const out: Record<string, number> = {};
  for (const d of DOORS) {
    try {
      out[d.goal] = await prisma.mealPlan.count({
        where: d.token ? { subCategory: { contains: d.token } } : { category: "LIFESTYLE_MEDICAL" },
      });
    } catch {
      out[d.goal] = 0;
    }
  }
  return out;
}

/* The catalogue total, counted. NOT the sum of the four doors: the doors are
   goal filters that neither partition nor cover MealPlan, so adding them gave
   "85 plans" in the headline under a catalogue of 126. */
async function planTotal(): Promise<number | null> {
  try {
    return await prisma.mealPlan.count();
  } catch {
    return null;
  }
}

export default async function Pick() {
  const [counts, total] = await Promise.all([doorCounts(), planTotal()]);
  /* Fields listed rather than spread-minus-token: `token` is a query detail and
     has no business crossing into the client component. */
  const doors: DoorSpec[] = DOORS.map((d) => ({
    goal: d.goal,
    who: d.who,
    what: d.what,
    href: d.href,
    accent: d.accent,
    fitnessGoal: d.fitnessGoal,
    split: d.split,
    count: counts[d.goal] ?? 0,
  }));

  return (
    <section id="hp-finder" aria-labelledby="hp-finder-h" style={{ padding: "clamp(48px,6.5vw,90px) 0" }}>
      <div style={WRAP}>
        <Idx label="Find yours" />

        <div className={v.rise}>
          <h2 id="hp-finder-h" style={{ ...display("clamp(2.4rem,6.6vw,5.4rem)"), maxWidth: "16ch" }}>
            {total === null ? "Every plan we run" : `${total} plans`} is useless until you know
            which are yours
          </h2>
        </div>

        <p className={v.rise} style={{ ...body(16.5), margin: "clamp(18px,2.4vw,26px) 0 0", maxWidth: "60ch" }}>
          Pick a goal, set your numbers, and watch the target it produces. This is the same
          arithmetic the plan builder runs: Mifflin St Jeor for the resting figure, your
          activity multiplier, then the goal adjustment, held above the calorie floor.
        </p>

        <Finder doors={doors} />
      </div>
    </section>
  );
}
