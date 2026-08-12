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
> This is a generic third-party skill.
>
> **Updated 2026-08-12.** This block used to pin slide background `#070707`,
> lime `#84cc16` and Barlow Condensed 900 uppercase. That system was rejected on
> 2026-08-12 and `AGENTS.md` says the verdict outranks anything written before
> it. Do not reconstruct it from here.
>
> Any deck that represents FitFuel externally uses the current system
> (`app/_design/tokens.css`):
>
> - `--fk-*` colours. Slide ground warm paper `#fcfaf6` (or warm ink `#1b1a17`
>   for a dark slide), deep herb green `#2c6e49` and terracotta `#b44a26` as
>   accents.
> - Newsreader in **sentence case** for slide titles, Archivo for body,
>   JetBrains Mono for every measured figure.
> - Restrained radius, hairline rules `#e6ded0` for structure. No gradient
>   fills, no glow.
> - **Chart.js colour comes from the `--fk-*` ramp**, not this skill's default
>   categorical palette. Distinguish series by green/terracotta/ink values and
>   line weight, and never by hue alone — pair with a label or marker.
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
