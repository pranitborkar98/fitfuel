// app/_web/services.ts
//
// The "Everything else the kitchen runs" row: the MOAT services, named once.
//
// WHY THIS IS ITS OWN FILE AND NOT A CONST IN FitFuelApp.tsx. That file carries
// "use client", and Next replaces every export of a client module with a client
// *reference* when a server component imports it — so `SERVICES.map(...)` in
// app/page.tsx threw `SERVICES.map is not a function` at prerender, after
// typechecking and linting clean. Data shared across the boundary has to live in
// a module that is neither.
//
// `slot` names a photograph resolved by lib/site-images.ts. THREE OF THE SIX
// ARE DELIBERATELY BLANK. That file states the rule outright: a stand-in may
// only hold a slot whose subject it actually matches, and a hole is not a reason
// to add one. There is a real photograph of a corporate lunch, of a gym, and of
// training. There is none of an AI coach, a digital recipe book, or "the whole
// argument" — so those three take the same colour ground the dish wells use
// rather than borrowing a picture of something they are not.

export type Service = {
  href: string;
  label: string;
  blurb: string;
  stat: string;
  folder?: "sections" | "film";
  slot?: string;
};

export const SERVICES: Service[] = [
  {
    href: "/dashboard/coach",
    label: "The AI coach",
    stat: "Recalibrates weekly",
    blurb:
      "Four weigh-ins that disagree with your goal move your target, with the arithmetic shown.",
  },
  /* The conversational half, added with Phase 12B. Listed separately from the
     coach above because they are genuinely different products: that one is
     arithmetic you can audit, this one is a conversation. Pointing both at one
     card would have hidden whichever the customer wasn't shown. */
  {
    href: "/dashboard/trainer",
    label: "Ask the coach",
    stat: "Reads your last 30 days",
    blurb:
      "Why the scale stalled, whether your protein is short, what to eat tonight — answered against your own logged numbers.",
  },
  {
    href: "/dashboard/exercises",
    label: "Training",
    stat: "952 exercises",
    folder: "film",
    slot: "1830-training",
    blurb:
      "Sets, reps and rest programmed into your week, burn fed back into today's net.",
  },
  {
    href: "/corporate",
    label: "For offices",
    stat: "From ₹110 a meal",
    folder: "sections",
    slot: "corporate",
    blurb:
      "One hot lunch a day at the desk, personalised by goal and diet, trays labelled per person.",
  },
  {
    href: "/plans/digital",
    label: "Digital plans",
    stat: "₹299 / ₹699",
    blurb: "The 30-day recipe book, macros and grocery list, without the delivery.",
  },
  {
    href: "/partners",
    label: "Gyms & trainers",
    stat: "Partner network",
    folder: "sections",
    slot: "partners",
    blurb: "Your gym or trainer puts your plan on your account and gets paid for it.",
  },
  {
    href: "/why",
    label: "Why FitFuel",
    stat: "The whole argument",
    blurb:
      "The plan finder, the receipt builder and what happens between 4am and your door.",
  },
];
