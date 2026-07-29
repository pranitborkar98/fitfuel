# FitFuel image brief v2 — the full 104

Supersedes `IMAGE-BRIEF.md`. That brief had 66 prompts and one real problem:
**it promised the wiring was mechanical for six folders when only one folder was
actually read by any code.** 40 of its 66 images would have landed where nothing
opened them.

That is fixed. `lib/site-images.ts` now resolves every folder below, so saving a
correctly-named file is genuinely all it takes.

**104 images.** Every filename here is keyed to a slug that already exists in
the codebase, so nothing needs renaming later.

---

## Where each file goes

```
public/images/            ← REAL PHOTOGRAPHY. Always wins.
public/images/ai/         ← AI-generated. Used only when no real file exists.
     ├── hero/       4
     ├── goals/      4
     ├── film/       7
     ├── sections/  10
     ├── social/     5
     └── dishes/    74     (26 week + 48 à la carte)
public/images/people/     ← before/after. REAL ONLY. Never an ai/ twin. See §8.
```

Resolution order is real → AI → the eight legacy photos → the generated macro
glyph. So you can ship one image at a time and the page improves incrementally
instead of waiting for a complete set.

---

## §0 — Seven rules

**1. Never let the model render text.** No FitFuel logo, no macro card, no
receipt, no labelled jar, no menu board. Every model turns lettering into broken
pseudo-text, and a garbled logo on your own homepage is worse than no logo.
Branding is added in code, over the image, in the real typeface.

**2. Never generate a human face or body.** Not for testimonials, not for the
hero, not for the corporate section. Rahul M., Priya S. and Amit K. are real
people in your `Testimonial` table; an AI face beside a real name is an invented
person endorsing your business, and no disclosure repairs that.

**3. Never generate a before/after.** This is not the same rule as #2 and it is
the one that matters most legally. See §8.

**4. Portions must match the number printed under them.** These images sit
beside a real calorie figure. A 195 kcal snack rendered as a mountain of food
contradicts the figure below it — which is precisely the thing Terms 13A
promises you will not do.

**5. Paste the correct style block onto every prompt.** There are two, and using
the wrong one is the single biggest cause of a set that looks like stock. Indian
home-style meals use Block A. Bowls, salads, juices, bars and breakfasts use
Block B. Mixing them makes a Rajasthani gatte sabzi look like a Sweetgreen ad.

**6. Generate 4, keep 1.** Indian food textures are where these models fail
hardest. Reject: plastic sheen, impossible symmetry, floating garnish, fused
rice grains, gravy with no oil separation, chapatis with machine-perfect circles.

**7. Save as `.jpg`, max 1600px long edge, under 400KB.** Larger costs mobile
load time and gains nothing at these display sizes. Run
`node scripts/generate-images.mjs` or export manually.

---

## Style Block A — Indian home-style

Append verbatim to every prompt in §6 (week dishes) and any Indian meal.

```
professional food photography, commercial editorial styling, single soft
north-facing window light from the left, deep soft natural shadows, dark warm
charcoal stone surface, muted earthy palette, photorealistic, shot on 50mm lens,
f/2.0 shallow depth of field, fine film grain, visible oil sheen and uneven
hand-made texture, authentic Indian home-style cooking not western restaurant
plating, no text, no lettering, no logos, no watermarks, no hands, no faces,
no people
```

## Style Block B — modern bowls, salads, juices, bars

Append verbatim to every prompt in §7.

```
professional food photography, clean contemporary café editorial styling,
bright soft diffused daylight from upper left, gentle shadows, pale grey-green
stone or matte ceramic surface, fresh saturated natural colours, photorealistic,
shot on 50mm lens, f/2.8, crisp texture on raw vegetables and seeds, light and
appetising, no text, no lettering, no logos, no watermarks, no hands, no faces,
no people
```

## Negative prompt — paste into the negative field every time

```
text, letters, words, numbers, logo, watermark, signature, label, packaging
text, menu board, hands, fingers, face, person, human, plastic sheen, waxy
surface, oversaturated, HDR, cartoon, illustration, 3d render, CGI, floating
garnish, perfect symmetry, fused rice, glowing food, steam overlay, motion blur
```

---

## §1 — Hero · `public/images/ai/hero/` (4)

The hero is full-bleed behind type, so the composition must leave the left third
readable. Every one of these is a better hero than the current bowl because it
shows **the system**, not just food.

| filename | ratio | prompt |
|---|---|---|
| `hero-box-open.jpg` | 16:9 | **PREFERRED HERO.** A matte black four-compartment meal container, lid removed and set beside it, on dark charcoal stone. Each compartment holds a visibly different component: brown rice, a dark lentil curry, a green vegetable stir-fry, and a small portion of curd. Shot from a low three-quarter angle so the compartment walls are visible and the portions read as separate and measured. Generous empty dark space across the left third of the frame. Warm dawn light raking from the right |
| `hero-bowl-overhead.jpg` | 16:9 | Directly overhead of one complete Indian vegetarian meal arranged on a dark ceramic plate — a mound of brown rice, a bowl of dal, a dry sabzi, kachumber salad and two rotis — with the plate positioned in the right two-thirds and empty dark stone filling the left third |
| `hero-week-spread.jpg` | 16:9 | Seven matte black sealed meal containers arranged in a receding diagonal row across dark stone, each holding a visibly different Indian vegetarian meal, lids off, shot from a low angle so the row recedes into soft focus. Variety across a week made visible in one frame |
| `hero-mobile.jpg` | 4:5 | Vertical crop of a single opened four-compartment meal box on dark stone, positioned in the lower two-thirds, with dramatic empty dark space above for the headline. Same lighting and surface as `hero-box-open` so the two read as one shoot |

---

## §2 — Goal cards · `public/images/ai/goals/` (4)

These are new — `Pick.tsx` previously rendered no image at all. They sit above
the heading in a 16:9 banner, four in a row, so each must be legible at ~300px
wide. **Ingredients, not people.** No gym bodies, no measuring tapes.

| filename | ratio | prompt |
|---|---|---|
| `lose-fat.jpg` | 16:9 | Overhead of a deliberately modest portioned meal on dark stone: a small mound of brown rice, a bowl of thin dal, a large pile of steamed green vegetables occupying most of the plate, and a lemon wedge. The vegetable-to-grain ratio is visibly weighted toward vegetables. Restrained, clean, not sparse |
| `build-muscle.jpg` | 16:9 | Overhead of a protein-dense Indian vegetarian spread on dark stone: a generous bowl of paneer bhurji, a bowl of thick rajma, a mound of brown rice, a bowl of curd and a boiled egg halved. Abundant but orderly, portions clearly larger than the adjacent frame |
| `eat-well.jpg` | 16:9 | Overhead of a balanced everyday Indian thali on dark stone in soft daylight: two rotis, a vegetable sabzi, dal, rice, curd and a small salad, arranged casually rather than styled. Warm, ordinary, appetising — the meal a person would actually be glad to come home to |
| `condition.jpg` | 16:9 | Overhead of raw ingredients associated with careful eating, arranged in loose separate groups on dark stone: pearl millet, foxtail millet, fenugreek seeds, cinnamon bark, a halved bitter gourd, flaxseed, spinach leaves and brown lentils. Apothecary-bench precision, warm not clinical. No prepared dish, no packaging |

---

## §3 — The film · `public/images/ai/film/` (7)

The operational day, told as pictures. Several reviewers said your kitchen story
is told in text where it should be shown — this is that fix. **Note: `Day.tsx`
is currently not imported by `page.tsx`, so wire it before generating these.**

| filename | ratio | prompt |
|---|---|---|
| `0400-kitchen.jpg` | 16:9 | A spotless stainless-steel commercial kitchen prep bench before dawn, empty and ready, steel containers of chopped vegetables lined up in a row, warm overhead task lighting pooling on the bench, deep darkness beyond the pool of light. Anticipation, not activity |
| `0630-weighing.jpg` | 4:3 | Extreme close-up of a digital kitchen scale on a steel bench, a steel bowl of cooked brown rice on the platform. The screen glows but the numerals are out of focus and unreadable. Shallow depth, precision, absolute cleanliness |
| `0800-doorstep.jpg` | 4:3 | An insulated black food delivery bag standing on a clean modern Indian apartment doorstep at sunrise, long warm golden-hour shadow stretching across the tiled floor, plain door behind, no signage, no number plate |
| `0802-logged.jpg` | 4:3 | Overhead of a sealed matte black meal container on a pale marble kitchen counter beside a dark-screened phone lying face down. Soft morning light from a window out of frame. Calm, unopened, waiting |
| `1830-training.jpg` | 16:9 | A clean modern gym interior at dusk, an empty squat rack and a rack of dumbbells in the foreground, warm low light through a large window behind, dust in the light, no people |
| `2100-evening.jpg` | 4:3 | A dark kitchen counter at night, one empty clean meal container drying upside down beside a glass of water, a single warm lamp overhead, everything else in shadow. Quiet end of day |
| `sunday-review.jpg` | 4:3 | Overhead of a plain closed notebook and a glass of water on dark stone in soft Sunday morning light, one small dish of almonds beside them. Calm and reflective. No writing visible, no pen mid-stroke |

---

## §4 — Section images · `public/images/ai/sections/` (10)

| filename | ratio | prompt |
|---|---|---|
| `conditions.jpg` | 4:3 | Overhead of ingredients for medical-condition cooking in loose groups on dark stone: millets, leafy greens, brown lentils, cinnamon, fenugreek, a halved bitter gourd, turmeric root. Clinical but warm, like an apothecary bench |
| `kitchen-wide.jpg` | 16:9 | Wide three-quarter view of a small clean professional Indian kitchen mid-service — steel counters, heavy pots on a gas range, gentle steam rising, warm overhead light, everything in its place. No people in frame |
| `produce.jpg` | 4:3 | Overhead of fresh Indian market vegetables on dark stone: bunched spinach, okra, bottle gourd, green chillies, ginger, curry leaves and tomatoes, still slightly wet from washing |
| `delivery-city.jpg` | 16:9 | A quiet residential Pune street at sunrise, low apartment buildings with balconies, a parked scooter, long golden shadows, empty pavement, a few trees. No signage, no number plates, no people |
| `corporate.jpg` | 4:3 | A modern bright office break area, a long communal table set with eight matte black sealed meal containers arranged neatly in two rows ready for a team lunch, potted plants, large window, morning light. No people |
| `supplements.jpg` | 1:1 | Minimal flat lay of unlabelled amber glass supplement jars and a plain white scoop on dark stone, a few loose capsules scattered, clinical and restrained. No branding, no labels |
| `week-spread.jpg` | 16:9 | Overhead of seven matte black meal containers in a neat row across the frame, each holding a visibly different Indian vegetarian meal, showing genuine variety across a week |
| `packaging.jpg` | 4:3 | Close-up of a sealed matte black four-compartment meal container with a clean transparent lid, faint condensation just forming on the inside of the lid, on dark stone. Plain, unbranded, premium, three-quarter angle |
| `partners.jpg` | 4:3 | A clean modern independent gym reception counter at morning, a small stack of matte black sealed meal containers on the counter beside a water jug, weights rack softly out of focus behind. No people, no signage |
| `menu-alacarte.jpg` | 16:9 | Overhead of nine different single dishes in matte black bowls arranged in a loose three-by-three grid on dark stone — salads, a grain bowl, a wrap, a juice glass, an energy bar on a small plate — showing the breadth of an à-la-carte menu in one frame |

---

## §5 — Social and OG · `public/images/ai/social/` (5)

Your funnel routes heavily through WhatsApp link shares, so these matter more
than their count suggests. Empty space is for the text overlay added in code.

| filename | exact px | prompt |
|---|---|---|
| `og-default.jpg` | 1200×630 | Overhead of three matte black sealed meal containers grouped on the left half of dark charcoal stone, generous empty dark space filling the right third for a text overlay |
| `og-trial.jpg` | 1200×630 | Overhead of a single opened four-compartment container holding a complete Indian vegetarian day, positioned right of centre, empty dark space filling the left third for a text overlay |
| `ig-square.jpg` | 1080×1080 | Overhead of one beautifully composed Indian vegetarian meal in a matte black container, centred, dark surface, breathing room at top and bottom |
| `ig-story.jpg` | 1080×1920 | Vertical. A meal container on dark stone occupying the lower third, dramatic empty dark space filling the upper two-thirds for text |
| `wa-preview.jpg` | 1200×630 | Warm inviting overhead of a full day of four meals laid out together, appetising, noticeably brighter and friendlier in tone than the rest of the set |

---

## §6 — Week dishes · `public/images/ai/dishes/` (26)

**These 26 prompts are unchanged from `IMAGE-BRIEF.md` §2–3 and are still
correct** — they are already keyed to the right slugs. Use Style Block A.

Generate these **first**. They sit directly under your strongest claim, beside
real macro numbers, on the screen most people decide on.

Priority order within the 26: the four Day-1 dishes, then Days 2–3, then the
rest.

---

## §7 — À la carte dishes · `public/images/ai/dishes/` (48) — **NEW**

The previous brief covered zero of these, and you have just given all 48 their
own URL. Every filename below is the exact output of `dishSlug()` — verified
against `lib/menu-alacarte.ts`, all 48 unique, no collisions.

**Use Style Block B for this entire section.**

### Salads (10)

| filename | prompt |
|---|---|
| `broccoli-and-bean-salad-in-mustard.jpg` | Blanched bright green broccoli florets and cooked white beans tossed in a pale wholegrain mustard dressing, in a shallow matte ceramic bowl, visible mustard seeds clinging to the florets |
| `spinach-and-bean-sprouts-in-creamy.jpg` | Raw baby spinach leaves and crisp mung bean sprouts in a pale creamy celery dressing, in a wide shallow bowl, finely sliced celery visible through the leaves |
| `bean-sprouts-and-lettuce-in-guacamole.jpg` | Crisp mung bean sprouts and torn romaine lettuce folded through chunky green guacamole, in a matte bowl, visible avocado chunks and a lime wedge on the rim |
| `garlicky-cabbage-and-spinach-salad.jpg` | Finely shredded raw green cabbage and spinach tossed with slivers of golden toasted garlic, in a shallow bowl, light and dry with no heavy dressing |
| `pineapple-cucumber-salad.jpg` | Cubes of fresh yellow pineapple and diced cucumber with fine red chilli flecks and torn mint, in a shallow white ceramic bowl, juice pooling slightly at the base |
| `brown-rice-salad.jpg` | Cooled brown rice tossed with diced red and yellow peppers, spring onion, parsley and a light lemon dressing, in a wide bowl, individual grains clearly separate |
| `carrot-raisin-salad.jpg` | Coarsely grated orange carrot with plump dark raisins and toasted sunflower seeds in a light yoghurt-lemon dressing, in a shallow bowl |
| `uncooked-pad-thai-salad.jpg` | Raw spiralised courgette and carrot noodles tossed in a peanut-tamarind sauce, topped with crushed peanuts, bean sprouts, red chilli slivers and a lime wedge, in a matte bowl |
| `beetroot-salad.jpg` | Diced deep magenta cooked beetroot with crumbled white feta-style cheese, toasted walnuts and rocket, in a pale ceramic bowl, magenta juice bleeding faintly into the dressing |
| `paneer-veggie-salad.jpg` | Cubes of grilled paneer with visible char marks, roasted red and yellow peppers and zucchini on a bed of torn lettuce, drizzled with pale mint-yoghurt dressing, in a shallow bowl |

### Keto (6) — Style Block B, but darker and richer

| filename | prompt |
|---|---|
| `avocado-chicken-keto-salad.jpg` | Sliced grilled chicken breast with char marks fanned beside halved avocado, cherry tomatoes and rocket, in a shallow bowl, glossy olive oil dressing pooling |
| `creamy-keto-paneer-bowl.jpg` | Cubes of paneer in a rich pale cream sauce with wilted spinach and a scatter of toasted almonds, in a deep matte bowl, visible fat sheen on the sauce |
| `keto-paneer-bhurji.jpg` | Spiced crumbled paneer scramble with finely diced onion, tomato and green chilli, bright with turmeric, in a small matte bowl, coriander scattered on top |
| `keto-lettuce-wrap.jpg` | Two crisp iceberg lettuce cups filled with spiced minced paneer and diced peppers, arranged side by side on a pale slate, a lime wedge beside them |
| `keto-zucchini-noodles-bowl.jpg` | Spiralised raw green zucchini noodles tossed in a basil pesto with cherry tomato halves and pine nuts, in a shallow bowl, noodles visibly raw and springy |
| `keto-avocado-smoothie.jpg` | A tall clear glass of thick pale green avocado smoothie on a pale surface, condensation on the glass, a few chia seeds settled at the base, halved avocado beside it |

### Bowls (8)

| filename | prompt |
|---|---|
| `mediterranean-power-bowl.jpg` | Overhead of a bowl sectioned into distinct wedges: herbed couscous, hummus, cucumber-tomato salad, kalamata olives, crumbled white cheese and a lemon wedge, each component clearly separate |
| `thai-buddha-bowl.jpg` | Overhead of a bowl sectioned into wedges: jasmine-brown rice, shredded purple cabbage, julienned carrot, edamame, cubed tofu and a peanut sauce drizzle across the centre |
| `indian-detox-bowl.jpg` | Overhead of a bowl sectioned into wedges: turmeric-yellow brown rice, sprouted moong, steamed pumpkin cubes, sautéed spinach and a small pool of coriander chutney |
| `green-goddess-bowl.jpg` | Overhead of a bowl dominated by greens: massaged kale, steamed broccoli, sliced avocado, edamame, pumpkin seeds and a pale green herb dressing drizzled over |
| `mexican-fiesta-bowl.jpg` | Overhead of a bowl sectioned into wedges: coriander-lime brown rice, black beans, roasted corn kernels, diced tomato salsa, sliced avocado and a lime wedge |
| `protein-packed-fitness-bowl.jpg` | Overhead of a bowl with a large mound of quinoa, grilled paneer cubes, boiled egg halves, steamed broccoli and roasted chickpeas, portions visibly generous |
| `asian-shiitake-bowl.jpg` | Overhead of a bowl with brown rice, glossy sautéed shiitake mushrooms, blanched pak choi, sliced spring onion and toasted sesame seeds, dark soy glaze pooling |
| `keto-low-carb-bowl.jpg` | Overhead of a bowl with cauliflower rice, grilled paneer, sautéed spinach, halved avocado and toasted seeds, deliberately no grains visible |

### Breakfast (9)

| filename | prompt |
|---|---|
| `avocado-toast-with-egg-or-tomato.jpg` | Two slices of toasted wholegrain sourdough spread with mashed avocado, one topped with a halved soft-boiled egg and one with sliced tomato, on a pale ceramic plate, chilli flakes scattered |
| `almond-banana-overnight-oats.jpg` | A clear glass jar of thick overnight oats layered with banana slices and flaked almonds, on a pale surface, spoon resting beside, layers clearly visible through the glass |
| `egg-white-veggie-omelette.jpg` | A pale folded egg-white omelette flecked with diced peppers, spinach and onion, on a white plate with a small side of rocket, visibly light-coloured with no yolk |
| `greek-yogurt-parfait.jpg` | A tall clear glass layered with thick white Greek yoghurt, dark berry compote and golden granola, layers sharply defined, fresh berries on top |
| `high-protein-paneer-bhurji-wrap.jpg` | A wholewheat wrap rolled and cut on the diagonal to show a filling of spiced crumbled paneer, peppers and onion, standing cut-side up on a pale plate |
| `masala-millet-veggie-upma.jpg` | A bowl of golden foxtail-millet upma studded with diced carrot, peas and green beans, curry leaves and a lemon wedge on the rim, texture visibly grainy not mushy |
| `chia-seed-pudding.jpg` | A small glass of set white chia pudding with visible suspended chia seeds throughout, topped with sliced mango and a mint leaf, on a pale surface |
| `tofu-scramble-with-wholegrain-toast.jpg` | Golden turmeric-spiced crumbled tofu scramble with spinach and tomato beside two slices of wholegrain toast on a pale plate |
| `superfood-smoothie-bowl.jpg` | Overhead of a thick deep purple smoothie bowl with a neat arranged topping row of banana slices, blueberries, chia seeds, coconut flakes and granola across one half |

### Bars (7)

Photograph these small and honest — they sit beside modest calorie figures.

| filename | prompt |
|---|---|
| `healthy-breakfast-muffins.jpg` | Three small golden wholemeal breakfast muffins studded with visible oats and berries, one broken open to show the crumb, on a pale surface, crumbs scattered |
| `peanut-butter-power-bar.jpg` | Two thick rectangular no-bake peanut butter oat bars stacked slightly offset on a pale slate, dense visible oat texture at the cut edge, a few peanuts beside |
| `chocolate-almond-crunch-bar.jpg` | Two dark chocolate-coated almond bars, one cut to show a dense nutty interior, whole almonds visible in the cross-section, on a pale slate |
| `berry-bliss-protein-bar.jpg` | Two pale pink-flecked protein bars with visible dried berry pieces, one cut to show the chewy interior, on a pale surface, a few freeze-dried raspberries beside |
| `banana-walnut-energy-bar.jpg` | Two golden-brown banana walnut oat bars, one broken to show walnut pieces and a moist dense crumb, on a pale slate |
| `coconut-cashew-keto-bar.jpg` | Two white coconut and cashew bars with visible desiccated coconut on the surface, one cut to show whole cashew pieces inside, on a pale slate |
| `double-chocolate-protein-bar.jpg` | Two very dark chocolate protein bars with a matte cocoa surface, one cut to show a dense fudgy interior with chocolate chips, on a pale slate |

### Juices and elixirs (8)

Glassware only. No garnish theatrics, no straws, no ice towers.

| filename | prompt |
|---|---|
| `green-detox-juice.jpg` | A tall clear glass of vivid opaque green juice on a pale surface, faint foam line at the top, a cucumber slice and celery stick lying beside the glass |
| `ironman-juice.jpg` | A tall clear glass of deep dark red-brown juice on a pale surface, beetroot wedge and spinach leaves lying beside it, dense and opaque |
| `magic-juice-for-eyes-and-skin.jpg` | A tall clear glass of bright orange carrot-forward juice on a pale surface, whole carrot with green top and an orange half lying beside it |
| `beet-and-carrot-juice.jpg` | A tall clear glass of deep magenta-orange juice with a faint natural gradient where beet and carrot have not fully mixed, halved beetroot and carrot beside it |
| `skin-detox-elixir.jpg` | A small clear glass of pale golden-green elixir on a pale surface, cucumber ribbon and mint sprigs beside it, very clear and light |
| `ash-gourd-juice.jpg` | A tall clear glass of pale translucent white-green ash gourd juice on a pale surface, a thick wedge of white ash gourd with green skin lying beside it |
| `glow-boosting-juice.jpg` | A tall clear glass of warm golden-orange juice on a pale surface, turmeric root, a lemon half and a small piece of ginger lying beside it |
| `ajwain-period-pain-reliever.jpg` | A small clear glass mug of warm pale amber ajwain infusion on a pale surface, loose carom seeds scattered beside it, faint natural steam, jaggery piece nearby |

---

## §8 — What we will NOT generate, and why

### Before / after transformation photographs — **never AI**

`components/BeforeAfter.tsx` reads `public/images/people/` and **has no
`ai/people/` fallback path at all.** That is deliberate and it is the one place
this brief draws a hard line.

Every other image here is decoration of a claim: an illustrative curry sits
beside a real calorie number that came from a real weighed recipe, so a labelled
stand-in is honest. A before/after is not decoration of a claim — **it is the
claim.** The image is the evidence that the programme changes bodies. Generate
one and you have not illustrated a result, you have manufactured one, and an
`sr-only` disclosure does not repair it because the picture does the persuading
and the caption does not. It would also put an unsupported health-outcome claim
on an Indian commercial page.

The bar for a real one, all four:

1. A real FitFuel member.
2. Written consent naming `/results`, on file, revocable.
3. Numbers from their own logged data, not recalled.
4. **Identical framing, lens, distance and lighting in both frames.** A slouched
   "before" in bad light beside a posed "after" in good light is a lighting
   result, not a nutrition one.

Until then `/results` renders the reserved frame, which is now shaped like a
before/after instead of a loading skeleton.

### Also never generated

- **Faces or bodies of named testimonial customers** (§0 rule 2).
- **Company or gym logos** for the corporate and partner walls. Those walls are
  now empty by design rather than filled with captioned fictions.
- **Anything with rendered text** (§0 rule 1).

---

## §9 — Order of work

If you only do one batch, do the first.

| # | batch | count | why |
|---|---|---|---|
| 1 | §6 the four Day-1 dishes | 4 | directly under your strongest claim, on the deciding screen |
| 2 | §1 hero | 4 | one image carries the whole first impression |
| 3 | §6 remaining week dishes | 22 | turns the week table from a spreadsheet into a menu |
| 4 | §2 goal cards | 4 | four cards currently rendering pure text |
| 5 | §5 social + OG | 5 | every WhatsApp share currently has no preview art |
| 6 | §4 sections | 10 | kills the eight-photos-reused-everywhere problem |
| 7 | §7 à la carte | 48 | 48 dish pages that currently show a macro glyph |
| 8 | §3 film | 7 | **wire `Day.tsx` into `page.tsx` first, or these render nowhere** |

---

## §10 — When real photographs arrive

Same filenames, dropped into `public/images/<folder>/` instead of
`public/images/ai/<folder>/`. The resolver prefers the real directory, so
replacing a single dish is one file and no deploy edit.

The two directories never mix, which is what makes the swap visible in a diff
instead of silent — and what makes the Terms 13A disclosure checkable per asset
rather than in bulk. Narrow that disclosure as the AI folder empties.
