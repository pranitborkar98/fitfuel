---
name: slides
description: Create strategic HTML presentations with Chart.js, design tokens, responsive layouts, copywriting formulas, and contextual slide strategies.
argument-hint: "[topic] [slide-count]"
metadata:
  author: claudekit
  version: "1.0.0"
---

> ## ⛔ FITFUEL OVERRIDE — read before using any of this
>
> This is a generic third-party skill. On this repo, **`fitfuel-design-system`
> outranks it** — load that skill and `DESIGN.md` first.
>
> Any deck that represents FitFuel externally uses the locked system:
>
> - `--ff-*` colours only. Slide background `#070707`, ink `#f7f7f5`,
>   lime `#84cc16` as the single accent.
> - Barlow Condensed 900 UPPERCASE flush-left for slide titles, Archivo for
>   body, JetBrains Mono for every figure.
> - Radius 0, hairline rules `#232320` for structure. No cards, no shadows,
>   no gradient fills.
> - **Chart.js colour comes from the `--ff-*` ramp**, not from this skill's
>   default categorical palette. Series are distinguished by lime plus
>   ink/mute/dim values and line weight, not by hue rotation.
> - Data is the hero. No decorative chart chrome, no fake metrics.
>
> Internal working decks do not need this. Anything a customer, investor or
> partner sees does.

# Slides

Strategic HTML presentation design with data visualization.

## When to Use

- Marketing presentations and pitch decks
- Data-driven slides with Chart.js
- Strategic slide design with layout patterns
- Copywriting-optimized presentation content

## Subcommands

| Subcommand | Description | Reference |
|------------|-------------|-----------|
| `create` | Create strategic presentation slides | `references/create.md` |

## References (Knowledge Base)

| Topic | File |
|-------|------|
| Layout Patterns | `references/layout-patterns.md` |
| HTML Template | `references/html-template.md` |
| Copywriting Formulas | `references/copywriting-formulas.md` |
| Slide Strategies | `references/slide-strategies.md` |

## Routing

1. Parse subcommand from `$ARGUMENTS` (first word)
2. Load corresponding `references/{subcommand}.md`
3. Execute with remaining arguments
