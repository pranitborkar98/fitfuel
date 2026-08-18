<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Design

The old design system is gone, and nothing replaces it yet. For eighteen months
one document was the single authority, and it is the reason the product looked
the way it did: near-black ground, acid lime, uppercase condensed everything,
monospace readouts, a hard ban on any corner radius, and a rule that a slot with
no photograph renders type. Each rule was defensible alone. Together they
produced a screen that reads as a trading terminal, and the owner's verdict on
2026-08-12, looking at the live site on a phone, was that it does not look like
healthy food and a normal person cannot parse it. That verdict is correct and it
outranks anything written before it.

Do not reconstruct those rules from old code comments, and do not treat them as
binding. They are history.

**2026-08-18 — the palette half of that verdict is REVERSED.** Shown both
palettes rendered on the real catalogue and asked to pick, the owner chose
black and lime: "black only as many prefer dark themes nowadays". So
`app/_design/tokens.css` (#070707 ground, #84cc16 accent) is CURRENT and
correct, and the warm-paper direction is dead. Do not "fix" the palette back
to warm on the strength of the paragraph above; it lost a fair comparison.

What the 2026-08-12 verdict still governs, unchanged, is the part he actually
called unparseable: uppercase-everything, 8.5px labels, monospace captions,
tracked-out display type, and a meal represented by a diagram instead of a
photograph. Dark is the ground, not a licence for a trading terminal.

The empty photo wells are also SETTLED as intentional (2026-08-18): "placeholder
are there for a reason". Do not open a brief by asking for photography.

What holds instead:

- FitFuel sells food. Food has to look like food and make someone hungry. A
  photograph of a dish beats any diagram of that dish. Never represent a meal
  with a macro ring, a glyph or a typographic stand-in on a surface where
  someone is choosing what to eat.
- Write for a customer in Pune ordering lunch, not for a reader of the spec.
  Sentence case, ordinary words, numbers where a number is the point.
- The app half and the marketing half may look different. Density that is
  correct in a food diary is hostile on a storefront.
- Accessibility is not up for reinterpretation: AA contrast, 44px targets,
  visible focus, one h1, overlays trap and restore focus, honour
  prefers-reduced-motion.

FitFuel is an application that delivers food, not a website with a dashboard
attached. Design for the third open, not the first visit.
