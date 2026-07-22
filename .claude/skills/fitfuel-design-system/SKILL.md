---
name: fitfuel-design-system
description: FitFuel's locked design tokens and UI conventions. Load before styling or building any page or component so new surfaces match the existing system.
---

# FitFuel Design System (locked)

Reconstructed 2026-07-22 from the master tracker's DESIGN SYSTEM section after the original skill file was lost. Do not invent new tokens — extend this file when a new token is genuinely needed.

## Core tokens

| Token | Value |
|---|---|
| Page background (locked globally) | `#080808` |
| Shared component set background | `#0a0a0a` (checkout/progress token set — legacy; prefer `#080808` for new pages) |
| Card background | `#101010` (`#161616` on hover) · checkout set uses `#111111` |
| Card border | `#1f1f1f` (admin uses `#222`) |
| Accent (brand lime) | `#84cc16` · light `#a3e635` |
| Text | `#ffffff` · secondary `#a3a3a3` · muted `#737373` |
| Max content width | 1120px (marketing hero/nav containers use 1280px) |
| Chart colors | good `#22c55e` · warn `#f97316` · fat `#38bdf8` · muscle `#f59e0b` |

## Fonts

- **Marketing / plans / checkout:** Barlow Condensed (700–900) for display numbers and headings; Inter for body; Space Mono for spec-strips/eyebrows.
- **Dashboard / onboarding:** Syne (600/700/800) display + DM Sans (300–600) body.
- Root layout preloads Barlow Condensed; Inter loads via `next/font`. Avoid adding per-page `@import` of Google Fonts — reuse what the layout loads.

## Tier & category accents

| Surface | Accent |
|---|---|
| Standard tier / goal plans | `#a3e635` |
| Premium tier | `#f59e0b` |
| Luxury tier | `#e879f9` |
| Sports plans | `#c084fc` |
| Seasonal/festival | `#f97316` |

Per-condition accents: PCOS `#f472b6` · Diabetic `#2dd4bf` · Thyroid `#a78bfa` · Heart `#fb7185` · Gut `#34d399` · Obesity `#fb923c` · Knee/Joints `#38bdf8` · Skin & hair `#fbbf24` · Smoking recovery `#4ade80` · Alcohol recovery `#94a3b8` · Female plans `#f9a8d4` · Senior `#67e8f9`.

## Conventions

- **Inline styles** (`style={{...}}`) are the house convention, with small scoped `<style>` blocks for hover/media/keyframes. No Tailwind classes in page bodies (Tailwind is only in the root layout body classes).
- Buttons: lime CTA = black text on `#84cc16`, uppercase, 800–900 weight, letter-spacing ~0.06em, radius 8–10; hover → `#a3e635` + slight lift. Ghost = 1px `#242424` border, muted text.
- Cards: radius 14–18, 1px border, hover border-lightening; lime glow shadows only on primary CTAs (`rgba(132,204,22,0.35)`).
- Accessibility: `:focus-visible` lime outline, skip-link in the root layout, `prefers-reduced-motion` respected in scoped styles.
- Global chrome: `Navbar` + `Footer` mount in `app/layout.tsx` via `ChromeGate` (hidden on `/driver` and `/admin`). Fixed navbar is 68px tall — full-bleed pages clear it with `padding-top: 68px`.
- Loading states use the branded spinner + Space Mono "Plating your page…" (transient only, via `loading.tsx`).
