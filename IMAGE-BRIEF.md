# FitFuel image brief

Every image the homepage can use, with the exact prompt and the exact filename
to save it as. Generate at **https://image.z.ai/**, save into the paths below,
and the site picks them up with no further work.

**66 images.** Sections 1–4 are the ones that change the page most; if you only
do one batch, do those (19 images).

---

## 0. Read this first — six rules that decide whether it looks real

**1. Never let AI write text.** Do not ask for the FitFuel logo, a printed macro
card, a receipt, a branded shaker or a labelled jar. Every image model renders
lettering as broken pseudo-text, and a garbled logo on your own homepage is
worse than no logo. Branding gets added in code, over the image, in the real
typeface. Every prompt below already excludes text.

**2. Never generate a photo of a named customer.** Rahul M., Priya S. and Amit K.
are real people in your testimonials table. An AI face beside a real name is an
invented person endorsing your business, and no disclosure fixes it. The
testimonial section stays type-only until you have photographs with their
written permission.

**3. Paste the global style block onto the end of every prompt.** It is what
makes 66 separate generations read as one shoot instead of 66 stock photos.

**4. Generate 4 variations, keep 1.** Indian food textures are where these
models fail most often. Reject anything with plastic sheen, impossible
symmetry, floating garnish or fused rice grains.

**5. Portions must look honest.** These images sit beside a real calorie number.
A 195 kcal snack rendered as a mountain of food contradicts the figure printed
under it, and that contradiction is the thing Terms 13A promises you will not do.

**6. Save as `.jpg`, max 1600px on the long edge, under 400KB.** Bigger costs
you mobile load time and gains nothing at these display sizes.

### The global style block — append to EVERY prompt

```
professional food photography, commercial editorial styling, single soft
north-facing window light from the left, deep soft natural shadows, dark warm
charcoal stone surface, muted earthy palette, photorealistic, shot on 50mm lens,
f/2.0 shallow depth of field, fine film grain, no text, no lettering, no logos,
no watermarks, no hands, no faces, no people, authentic Indian home-style
cooking not western restaurant plating
```

### Negative prompt (paste into the negative field every time)

```
text, lettering, watermark, logo, signature, cartoon, 3d render, illustration,
cgi, plastic food, waxy, oversaturated, neon, hands, fingers, faces, people,
messy plate, dirty rim, cluttered background, harsh flash, blown highlights
```

### Aspect ratios

| Use | Ratio | Save as |
|---|---|---|
| Hero, film frames, wide bands | `16:9` | 1600×900 |
| Dish cards, goal cards | `1:1` | 1200×1200 |
| Split-section media | `4:3` | 1400×1050 |
| Story / mobile hero | `9:16` | 1080×1920 |

---

## 1. Hero — `public/images/ai/hero/` (4 images)

The first screen. Generate all four and we will A/B them.

**`hero-day-spread.jpg`** · 16:9
```
Overhead flat lay of four matte black compartment meal containers arranged in a
loose row on a dark charcoal stone surface, lids off, each holding a different
freshly cooked Indian vegetarian meal: golden lentil crepes, a dark spinach and
paneer curry, a bright chickpea salad, and brown rice with vegetables. Faint
steam. A folded grey linen napkin at the edge of frame.
```

**`hero-single-box.jpg`** · 16:9
```
Three-quarter view of a single matte black four-compartment meal container,
lid just lifted and resting behind it, holding a complete Indian vegetarian
lunch: brown rice, dark curry, a green vegetable, and a small portion of curd.
Warm morning light raking across the surface from the left, long soft shadow.
```

**`hero-mobile.jpg`** · 9:16
```
Vertical overhead crop of one matte black meal container on dark charcoal
stone, holding golden lentil crepes with a small bowl of vivid green coriander
chutney and a bowl of white raita scattered with ruby pomegranate seeds.
Generous negative space in the upper third of the frame.
```

**`hero-texture.jpg`** · 16:9
```
Extreme close-up macro of the surface of a freshly cooked Indian lentil crepe,
crisp golden edges, visible grain and steam, filling the entire frame. Abstract,
appetising, almost a texture study.
```

---

## 2. Trial day — `public/images/ai/dishes/` (4 images)

These four are the highest-value images on the entire site: they sit under
"This is what turns up tomorrow morning" beside real macros. Get these right
before anything else.

**`maharashtrian-moong-dal-chilla-with-green.jpg`** · 1:1 · *355 kcal, 24.5g protein*
```
Overhead close-up of two crisp golden moong dal lentil crepes, folded into
half-moons and slightly overlapping on a dark ceramic plate. Beside them a small
bowl of vivid green coriander chutney and a small bowl of white pomegranate
raita scattered with ruby seeds. Visible crisp lacy edges on the crepes.
```

**`chettinad-cauliflower-steak-with-black-pepper.jpg`** · 1:1 · *468 kcal, 22.4g protein*
```
Overhead close-up of one thick seared cauliflower steak, deeply caramelised on
the cut face, sitting in a dark peppery South Indian coconut gravy on a dark
ceramic plate. A neat mound of brown rice flecked with fried curry leaves beside
it. A few whole black peppercorns scattered on the plate rim.
```

**`rajasthani-makhana-chaat-with-tamarind-chutney.jpg`** · 1:1 · *195 kcal, 5.8g protein*
```
Overhead close-up of a small brass bowl of roasted puffed lotus seeds tossed
with finely diced red onion, tomato and ruby pomegranate seeds, drizzled with
dark tamarind chutney and scattered with torn coriander. A modest single-serving
portion, not a heaped bowl.
```

**`north-indian-palak-paneer-with-jowar.jpg`** · 1:1 · *412 kcal, 28.4g protein*
```
Overhead close-up of silky dark green spinach curry with neat cubes of soft
paneer, in a shallow dark bowl, with two rustic charred millet flatbreads
resting alongside on a dark ceramic plate. A thin swirl of cream on the curry
surface and a scattering of julienned ginger.
```

---

## 3. The week — `public/images/ai/dishes/` (22 more)

The remaining seeded recipes, so the seven-day table can carry a thumbnail per
dish. Same treatment as section 2. Filenames must match exactly.

| Filename (`.jpg`) | Prompt subject (append global block) |
|---|---|
| `punjabi-missi-roti-with-low-fat` | Two golden missi rotis flecked with fenugreek leaf, a small bowl of thick low-fat curd, and a raw onion and cucumber salad with lemon, on a dark ceramic plate |
| `kashmiri-haak-saag-with-masoor-dal` | A shallow bowl of dark glossy Kashmiri collard greens in thin broth, a bowl of red masoor dal, and two soft rotis on a dark plate |
| `gujarati-sprouted-moong-dhokla-bites-with` | Six neat squares of pale steamed sprouted moong dhokla with a glossy mustard-seed and sesame tempering on top, small bowl of mint chutney |
| `maharashtrian-bharli-vangi-with-bhakri-and` | Three small stuffed baby brinjals in a dark peanut-coconut masala, one bajra flatbread, and a chopped tomato-onion kachumber |
| `andhra-style-pesarattu-with-ginger-chutney` | Two green moong crepes rolled loosely, a bowl of dark ginger-tamarind chutney, and a small mound of moong sprout salad |
| `hyderabadi-bagara-baingan-with-jowar-bhakri` | Small whole brinjals in a glossy dark sesame-peanut gravy, one jowar flatbread, raw onion rings with lemon |
| `maharashtrian-kala-chana-chaat-with-onion` | A small bowl of boiled black chickpeas tossed with finely diced raw onion, coriander and a lemon wedge. Modest snack portion |
| `south-indian-sambar-with-idli-and` | Three soft white idlis on a dark plate, a bowl of orange vegetable sambar, and a bowl of pale peanut-coconut chutney |
| `rajasthani-dalia-khichdi-with-methi-tadka` | A bowl of soft broken-wheat and moong khichdi with a dark mustard-oil fenugreek tempering poured over the top, lemon wedge on the rim |
| `sindhi-sai-bhaji-with-brown-rice` | A bowl of thick green spinach-and-lentil sai bhaji, a mound of brown rice, and a small bowl of cucumber raita |
| `punjabi-hung-curd-with-flaxseeds-and` | A small bowl of thick white hung curd dusted with roasted cumin and flaxseed, with cucumber batons standing beside it. Light snack portion |
| `rajasthani-gatte-ki-sabzi-with-bajra` | Sliced gram-flour dumplings in a pale yellow yoghurt gravy in a shallow bowl, with two bajra flatbreads |
| `gujarati-oats-handvo-with-green-chutney` | A thick golden baked savoury oats-and-bottle-gourd cake, cut into two wedges to show the crumb, sesame seeds on the crust, green chutney beside |
| `odia-dalma-with-brown-rice-and` | A bowl of toor dal cooked with chunks of pumpkin and raw banana, a mound of brown rice, and tomato-onion kachumber |
| `south-indian-oats-idli-with-sambar` | Three pale oats idlis, slightly coarser in texture than rice idlis, a small bowl of sambar and a bowl of coconut chutney |
| `punjabi-chana-masala-with-brown-rice` | A bowl of dark chickpea masala with visible whole chickpeas, a mound of brown rice, raw onion and lemon salad |
| `bengali-cholar-dal-cheela-with-kasundi` | Two golden chana dal crepes on a dark plate with a small bowl of pungent yellow kasundi mustard and cucumber slices |
| `north-indian-rajma-masala-with-roti` | A bowl of thick dark red kidney bean masala, two soft rotis, sliced raw onion with lemon |
| `gujarati-mixed-dal-khichdi-with-ghee` | A bowl of soft mixed-lentil khichdi with a pool of ghee melting on top, tomato-onion kachumber beside |
| `south-indian-ragi-roti-with-coconut` | Two dark reddish-brown finger millet flatbreads, a bowl of white coconut-coriander chutney, and a small bowl of cold curd |
| `maharashtrian-matki-usal-with-pav-and` | A bowl of sprouted moth bean curry in dark onion-garlic masala, two soft wholewheat pav rolls, green chutney |
| `malabarcoast-kadala-curry-with-appam-and` | A bowl of Kerala black chickpea coconut curry, two soft lacy appams with spongy centres, small bowl of cucumber raita |
| `continental-indian-paneer-bhurji-with-brown` | A bowl of spiced crumbled paneer scramble with peas and capsicum, mound of brown rice, capsicum-cucumber salad |
| `goan-style-tofu-xacuti-with-brown` | Cubes of tofu in a dark roasted-coconut Goan xacuti gravy, brown rice, tomato kachumber |
| `awadhi-dal-makhani-lightened-with-brown` | A bowl of dark glossy black lentil dal makhani, lighter than traditional, brown rice, lemon raita |
| `mumbaistreet-style-oats-poha-with-crunchy` | A bowl of pale yellow oats-poha with visible roasted peanuts, curry leaves and a lemon wedge |

---

## 4. Goal cards — `public/images/ai/goals/` (4 images)

For the "Which one of these is you?" picker. Each must read as a *different
kind of eating*, not four versions of the same plate. Portion size is the story.

**`goal-fatloss.jpg`** · 1:1
```
Overhead of a matte black compartment container holding a deliberately light,
protein-forward Indian vegetarian meal: grilled paneer cubes, a sprouted bean
salad, sauteed greens and a small measured portion of millet. Restrained,
precise, generous empty space in the container.
```

**`goal-muscle.jpg`** · 1:1
```
Overhead of a matte black compartment container filled generously with a
high-protein Indian vegetarian meal: a large portion of grilled paneer, thick
rajma curry, brown rice and a boiled egg halved to one side. Abundant but neat
and controlled, every compartment full.
```

**`goal-balanced.jpg`** · 1:1
```
Overhead of a matte black compartment container holding a colourful balanced
Indian thali-style meal: dal, a seasonal vegetable sabzi, two rotis, salad and
a small bowl of curd. Warm, homely, unfussy.
```

**`goal-medical.jpg`** · 1:1
```
Overhead of a matte black compartment container holding a carefully portioned
low-glycaemic Indian vegetarian meal: one millet roti, leafy greens, a modest
portion of lentils, cucumber and a small bowl of curd. Calm and measured in
feel, still appetising, nothing indulgent.
```

---

## 5. The film — `public/images/ai/film/` (7 images)

Replaces the stock imagery in the horizontal day sequence. All 16:9.

| Filename (`.jpg`) | Prompt subject |
|---|---|
| `0400-kitchen.jpg` | Wide view of a spotless stainless steel commercial kitchen prep bench before dawn, empty and ready, steel containers of chopped vegetables lined up, warm overhead task lighting pooling on the bench, dark beyond |
| `0630-weighing.jpg` | Extreme close-up of a digital kitchen scale on a steel bench with a steel bowl of cooked brown rice on the platform. Screen glow visible but the numerals unreadable and out of focus. Precision, cleanliness |
| `0800-doorstep.jpg` | An insulated black food delivery bag standing on a clean modern apartment doorstep at sunrise, long warm golden-hour shadow across the floor, plain door behind, no signage |
| `0802-logged.jpg` | Overhead of a sealed matte black meal container on a marble kitchen counter beside a dark-screened phone lying face down. Soft morning light. Calm, unopened, waiting |
| `1830-training.jpg` | A clean modern gym interior at dusk, empty rack and dumbbells in the foreground, warm low light through a large window, no people |
| `2100-evening.jpg` | A dark kitchen counter at night with one empty clean meal container drying beside a glass of water, single warm lamp overhead, quiet end-of-day mood |
| `sunday-review.jpg` | Overhead of a plain notebook and a glass of water on a dark surface in soft Sunday morning light, one small dish of nuts, calm and reflective, no writing visible on the page |

---

## 6. Sections — `public/images/ai/sections/` (8 images)

| Filename (`.jpg`) | Ratio | Prompt subject |
|---|---|---|
| `conditions.jpg` | 4:3 | Overhead of raw ingredients associated with careful eating arranged in loose groups on dark stone: millets, leafy greens, lentils, cinnamon, fenugreek seeds, a halved bitter gourd. Clinical but warm, like an apothecary bench |
| `kitchen-wide.jpg` | 16:9 | Wide three-quarter view of a small clean professional Indian kitchen mid-service, steel counters, pots on a range, steam, warm light, no people in frame |
| `produce.jpg` | 4:3 | Overhead of fresh Indian market vegetables on dark stone: bunched spinach, okra, bottle gourd, green chillies, ginger, curry leaves, still slightly wet |
| `delivery-city.jpg` | 16:9 | A quiet residential Pune street at sunrise, low apartment buildings, a scooter parked, long golden shadows, empty pavement, no signage or number plates |
| `corporate.jpg` | 4:3 | A modern bright office break area with a long communal table set with several matte black meal containers ready for a team lunch, no people, plants, morning light |
| `supplements.jpg` | 1:1 | Minimal flat lay of unlabelled amber glass supplement jars and a plain white scoop on dark stone, a few loose capsules, clinical and restrained, no branding |
| `week-spread.jpg` | 16:9 | Overhead of seven matte black meal containers arranged in a neat row across the frame, each holding a visibly different Indian vegetarian meal, showing variety across a week |
| `packaging.jpg` | 4:3 | Close-up of a sealed matte black four-compartment meal container with a clean transparent lid, condensation just forming inside, on dark stone. Plain, unbranded, premium |

---

## 7. Social and OG — `public/images/ai/social/` (5 images)

| Filename (`.jpg`) | Size | Prompt subject |
|---|---|---|
| `og-default.jpg` | 1200×630 | Overhead of three matte black meal containers on dark charcoal stone with generous empty space on the right third for text overlay |
| `og-trial.jpg` | 1200×630 | Overhead of a single open meal container holding a complete Indian vegetarian day, empty space at left for text overlay |
| `ig-square.jpg` | 1080×1080 | Overhead of one beautifully composed Indian vegetarian meal in a matte black container, centred, dark surface, room at top and bottom |
| `ig-story.jpg` | 1080×1920 | Vertical shot of a meal container on dark stone in the lower third, dramatic empty dark space above for text |
| `wa-preview.jpg` | 1200×630 | Warm inviting overhead of a full day of meals, appetising, slightly brighter and friendlier than the rest of the set |

---

## 8. Where these get used

Save exactly as named above and the wiring is mechanical:

```
public/images/ai/
├── hero/       4   → Hero.tsx (full-bleed) + mobile variant
├── dishes/    26   → TrialDay.tsx cards, Week.tsx row thumbnails, /plans/[slug]
├── goals/      4   → Pick.tsx category cards
├── film/       7   → Day.tsx horizontal sequence
├── sections/   8   → Conditions, Areas, Corporate, Supplements, Offers, Why
└── social/     5   → opengraph-image.tsx, WhatsApp link previews
```

`public/images/ai/` is separate from `public/images/` on purpose. AI-origin
assets never sit in the same directory as real photography, so when you shoot
the real thing the swap is visible in the diff instead of silent.

## 9. When the real photographs arrive

Same filenames, dropped into `public/images/` instead of `public/images/ai/`.
The code prefers the real directory and falls back to the AI one, so replacing
a single dish is one file, no deploy edits. Terms 13A gets updated to narrow
the disclosure to whatever is still illustrative.

**The four in section 2 are the ones to shoot first.** They sit directly under
your strongest claim, next to real numbers, on the screen most people decide on.
