<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design work is governed, not improvised

Before writing or changing **any** UI — a page, a component, colour, type,
layout, spacing, motion, an image treatment, a chart — load the
**`fitfuel-design-system`** skill and read `DESIGN.md`. Not optional, not only
for "design tasks": a one-line style tweak counts.

The art direction is locked and has already swung twice. It is not a decision to
re-open, and the generic design skills in `.claude/skills/` (`ui-styling`,
`ui-ux-pro-max`, `design`, `design-system`, `brand`, `banner-design`, `slides`)
are third-party packages whose defaults this repo bans. Each carries a FITFUEL
OVERRIDE header. `fitfuel-design-system` outranks all of them.

The five that get broken most often, so they are stated here too:

- **Radius is 0.** Not 2px, not 6px, never pills.
- **Three faces only** — Barlow Condensed (display), Archivo (body),
  JetBrains Mono (data). Inter, Roboto, system-ui, Syne, DM Sans, Space Mono and
  Fraunces are banned by name.
- **Lime `#84cc16` is the only chromatic value**, one purpose per section.
  No per-category accent hues.
- **No Tailwind utilities or shadcn components in page bodies.** CSS Modules or
  inline `style={{}}` from `app/_hp/theme.ts`.
- **No glows, gradients, glass, or decorative eyebrow chips.** Hairlines and
  grain do the structural work.

Run the anti-slop audit in the skill before calling any UI work done.
