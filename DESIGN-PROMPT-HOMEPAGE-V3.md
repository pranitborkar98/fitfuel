# Round 3 instruction for Claude Design — "FitFuel Homepage v2.dc.html"

**Date:** 2026-07-31
**Project:** `163cdbd9-b6f0-464d-a9d4-ac4eca71a3f3`
**Follows:** `DESIGN-FEEDBACK-HOMEPAGE-V2.md`, whose reject list has landed.

Paste section 2 into Claude Design verbatim. Section 1 is context for us, not
for the model.

---

## 1. Where this round came from

Round 2 is done and the file passes: 0 `border-radius`, 0 `box-shadow`, 0
`backdrop-filter`, 0 em dashes, one keyframe (`v2Rise`, at 16px/.6s), one
`repeat(4,1fr)`. The four remaining gradients are black scrims over photographs,
not decoration. None of that is reopened.

What is left is the image layer, and it is not a repetition problem. It is a
truth problem. Seven files in nineteen places, and the mapping is arbitrary: a
produce shot captioned "It is at your door", supplement jars captioned "Weekly
review and recalibration", `kitchen.jpg` standing in for "3,614 published
prices", and four real named dishes with real weighed macros illustrated by
produce, a salad bowl, chef hands and a kitchen.

| file | uses |
|---|---|
| `hero-bowl.jpg` | 4 |
| `kitchen.jpg` | 4 |
| `produce.jpg` | 3 |
| `chef-hands.jpg` | 3 |
| `training.jpg` | 2 |
| `supplements.jpg` | 2 |
| `gym.jpg` | 1 |

The rule that fixes it shipped in the repo on `fix/honest-image-fallbacks`: a
stand-in may only hold a slot whose subject it actually matches, and a slot with
no honest stand-in renders type rather than a wrong photograph. The repo went
from repeated use of the same handful to five photographs, all distinct, all of
their own subject. This round brings the prototype to the same place so the two
stop drifting.

---

## 2. Paste this

```
Do not regenerate this page. Patch it. Change only what is listed below and
leave every other line byte-identical. If you think something else should
change, say so in a sentence and wait.

Round 2 landed correctly. Radius 0, no shadows, no backdrop-filter, no em
dashes, one keyframe. None of that is reopened here.

THE ONE PROBLEM LEFT: the page has 7 photographs in 19 places, and the
mapping is dishonest. A stand-in may only hold a slot whose subject it
actually matches. Where it does not, render type, not a wrong picture.

1. DELETE the four Day-1 dish images. Line 732:
   const IMGS = ["images/produce.jpg", "images/hero-bowl.jpg",
                 "images/chef-hands.jpg", "images/kitchen.jpg"];
   Those sit beside real weighed macros and not one of them is the dish.
   Moong dal chilla is currently illustrated by a photo of a kitchen. Keep
   the existing macro glyph in that slot and drop IMGS, IMG_GRADE, IMG_DUO.

2. DELETE the six images behind the counters row, lines 939 to 944. A
   kitchen photo does not illustrate "3,614 published prices" and chef
   hands do not illustrate "38 conditions". The numerals in condensed 900
   are the device; a photo behind them is wallpaper.

3. In the film, lines 1035 to 1041, KEEP the photograph on exactly three
   beats: 04:00 (kitchen.jpg), 06:30 (chef-hands.jpg), 18:30 (training.jpg).
   REMOVE the src from the other four. 08:00 "It is at your door" is
   currently a bowl of vegetables, 08:02 a salad bowl, 21:00 a gym, SUNDAY
   a jar of supplements.

   The four photo-less frames get this treatment, which is already shipped
   in the repo as .framePlate, so match it exactly:
     figure  background #050504, 1px #232320 border, radius 0, unchanged size
     a top block, inset 0 0 auto 0, padding clamp(18px,2.4vw,30px),
       border-bottom 1px solid #232320
     inside it the hour in Barlow Condensed 900,
       clamp(3.4rem,7vw,5.6rem), line-height 0.82, letter-spacing -0.035em,
       colour #f7f7f5
     the caption below keeps the line and the copy, background: none
     DROP the small lime time label on these four. The hour is already the
       dominant mark; printing it twice is the over-annotation habit.

4. DELETE the kitchen.jpg wash at line 647, the one at opacity 0.34 under a
   gradient. Texture on this site is generated grain, feTurbulence in a data
   URI at ~0.055 with mix-blend-mode overlay. A photograph dimmed to a third
   is not texture, it is a fifth use of a file already on the page.

5. The hero keeps hero-bowl.jpg, once. It is the wrong photograph for the
   business, a western Buddha bowl on light barnwood while the menu is
   Chettinad and Maharashtrian, but replacing it needs a new photograph and
   that is not your job here. Do not compensate with a heavier scrim.

DO NOT add any new image URL. Do not reach for Unsplash, picsum, or any
stock source. You have seven files and there is no eighth. If a slot has no
honest photograph, it renders type. That is the correct answer, not a
placeholder and not a repeat.

Result should be 7 photographs in 4 places, all distinct, each showing its
own subject. Then run the section 11 anti-slop audit.
```

---

## 3. The ceiling, stated plainly

Every item above is subtraction, and subtraction gets the page to honest, not to
good. Good needs `hero-box-open.jpg` and the four Day-1 dishes generated from
`IMAGE-BRIEF-V2.md` §1 and §6, batches 1 and 2 in its order of work.

No prompt to Claude Design produces those. It has no image model and no access
to `public/images/`, which is exactly why it reached for the same seven files
every round. Stop asking it for photography and start asking it for structure.
