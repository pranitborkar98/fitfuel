# FitFuel — all 104 image prompts, self-contained

Everything needed to generate the full set is in this one file. No other
document is required.

`IMAGE-BRIEF-V2.md` called itself "the full 104" but its §6 only *pointed* at
`IMAGE-BRIEF.md` for the 26 week dishes, so the prompts lived in two files.
Those 26 are written out in full below. Nothing here is a cross-reference.

**Every filename is the exact output of `dishSlug()` / the slug already in the
code.** Save the file with the name given and it is picked up on the next build
with no code change. Nothing needs renaming later.

---

## How the page finds your files

```
public/images/            ← REAL PHOTOGRAPHY. Always wins over AI.
public/images/ai/         ← AI-generated. Used only when no real file exists.
     ├── hero/       4
     ├── goals/      4
     ├── film/       7
     ├── sections/  10
     ├── social/     5
     └── dishes/    74     (26 week + 48 à la carte)
public/images/people/     ← before/after. REAL PHOTOGRAPHS ONLY. Never AI.
```

Resolution order is **real → AI → legacy photo → generated macro glyph**, so you
can ship one image at a time and the page improves incrementally. You do not
need the complete set before anything shows.

Check progress at any point:

```bash
node scripts/image-status.mjs
```

---

## Seven rules

**1. Never let the model render text.** No logo, no macro card, no receipt, no
labelled jar, no menu board. Every model turns lettering into broken pseudo-text,
and a garbled logo on your own homepage is worse than no logo. Branding is added
in code, over the image, in the real typeface.

**2. Never generate a human face or body.** Not for testimonials, not for the
hero, not for corporate. Rahul M., Priya S. and Amit K. are real people in your
`Testimonial` table; an AI face beside a real name is an invented person
endorsing your business, and no disclosure repairs that.

**3. Never generate a before/after.** Not the same rule as #2, and the one that
matters most legally. Weight-loss before/afters are a health claim. Real
customer photographs with written consent, or nothing.

**4. Portions must match the number printed under them.** These images sit beside
a real calorie figure. A 195 kcal snack rendered as a mountain of food
contradicts the figure below it — exactly what Terms 13A promises you won't do.

**5. Paste the correct style block onto every prompt.** Using the wrong one is
the single biggest cause of a set that looks like stock. Indian home-style meals
use **Block A**. Bowls, salads, juices, bars and breakfasts use **Block B**.
Mixing them makes a Rajasthani gatte sabzi look like a Sweetgreen ad.

**6. Generate 4, keep 1.** Indian food textures are where these models fail
hardest. Reject: plastic sheen, impossible symmetry, floating garnish, fused
rice grains, gravy with no oil separation, machine-perfect circular chapatis.

**7. Save as `.jpg`, max 1600px long edge, under 400KB.** Larger costs mobile
load time and gains nothing at these display sizes.

---

## Style Block A — Indian home-style

Append verbatim to every prompt in §6, and to any Indian meal.

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

## Order of work

If you are generating in batches, this is the order that changes the page
fastest:

1. **§6 first four** (trial day) — they sit under your strongest claim, beside
   real macros, on the screen most people decide on.
2. **§1 hero** — one image, top of the page.
3. **§2 goal cards** — `Pick.tsx` renders no image at all until these land.
4. **§7 salads + bowls** — these feed the new homepage product shelf.
5. **§6 remaining 22** — the seven-day table thumbnails.
6. **§4 sections**, **§3 film**, **§5 social**, then the rest of §7.

---

# §1 — Hero · `public/images/ai/hero/` (4)

Full-bleed behind type, so the composition must leave the left third readable.
**Style Block A.**

| filename | ratio | prompt |
|---|---|---|
| `hero-box-open.jpg` | 16:9 | **PREFERRED HERO.** A matte black four-compartment meal container, lid removed and set beside it, on dark charcoal stone. Each compartment holds a visibly different component: brown rice, a dark lentil curry, a green vegetable stir-fry, and a small portion of curd. Shot from a low three-quarter angle so the compartment walls are visible and the portions read as separate and measured. Generous empty dark space across the left third of the frame. Warm dawn light raking from the right |
| `hero-bowl-overhead.jpg` | 16:9 | Directly overhead of one complete Indian vegetarian meal arranged on a dark ceramic plate — a mound of brown rice, a bowl of dal, a dry sabzi, kachumber salad and two rotis — with the plate positioned in the right two-thirds and empty dark stone filling the left third |
| `hero-week-spread.jpg` | 16:9 | Seven matte black sealed meal containers arranged in a receding diagonal row across dark stone, each holding a visibly different Indian vegetarian meal, lids off, shot from a low angle so the row recedes into soft focus. Variety across a week made visible in one frame |
| `hero-mobile.jpg` | 4:5 | Vertical crop of a single opened four-compartment meal box on dark stone, positioned in the lower two-thirds, with dramatic empty dark space above for the headline. Same lighting and surface as `hero-box-open` so the two read as one shoot |

---

# §2 — Goal cards · `public/images/ai/goals/` (4)

`Pick.tsx` renders no image at all until these exist. 16:9 banner above the
heading, four in a row, so each must be legible at ~300px wide.
**Ingredients, not people.** No gym bodies, no measuring tapes. **Style Block A.**

| filename | ratio | prompt |
|---|---|---|
| `lose-fat.jpg` | 16:9 | Overhead of a deliberately modest portioned meal on dark stone: a small mound of brown rice, a bowl of thin dal, a large pile of steamed green vegetables occupying most of the plate, and a lemon wedge. The vegetable-to-grain ratio is visibly weighted toward vegetables. Restrained, clean, not sparse |
| `build-muscle.jpg` | 16:9 | Overhead of a protein-dense Indian vegetarian spread on dark stone: a generous bowl of paneer bhurji, a bowl of thick rajma, a mound of brown rice, a bowl of curd and a boiled egg halved. Abundant but orderly, portions clearly larger than the adjacent frame |
| `eat-well.jpg` | 16:9 | Overhead of a balanced everyday Indian thali on dark stone in soft daylight: two rotis, a vegetable sabzi, dal, rice, curd and a small salad, arranged casually rather than styled. Warm, ordinary, appetising — the meal a person would actually be glad to come home to |
| `condition.jpg` | 16:9 | Overhead of raw ingredients associated with careful eating, arranged in loose separate groups on dark stone: pearl millet, foxtail millet, fenugreek seeds, cinnamon bark, a halved bitter gourd, flaxseed, spinach leaves and brown lentils. Apothecary-bench precision, warm not clinical. No prepared dish, no packaging |

---

# §3 — The film · `public/images/ai/film/` (7)

The operational day, told as pictures. Your kitchen story is currently told in
text where it should be shown — this is that fix. `Day.tsx` **is** now imported
by `page.tsx`, so these land on a live section. **Style Block A**, but these are
interiors and objects rather than food: keep the lighting language, drop the
"authentic Indian home-style cooking" clause.

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

# §4 — Section images · `public/images/ai/sections/` (10)

**Style Block A** for the food frames; for interiors and flat lays keep the
lighting language and drop the food-specific clauses.

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

# §5 — Social and OG · `public/images/ai/social/` (5)

Your funnel routes heavily through WhatsApp link shares, so these matter more
than their count suggests. The empty space is for the text overlay added in
code — do not fill it. **Style Block A.**

| filename | exact px | prompt |
|---|---|---|
| `og-default.jpg` | 1200×630 | Overhead of three matte black sealed meal containers grouped on the left half of dark charcoal stone, generous empty dark space filling the right third for a text overlay |
| `og-trial.jpg` | 1200×630 | Overhead of a single opened four-compartment container holding a complete Indian vegetarian day, positioned right of centre, empty dark space filling the left third for a text overlay |
| `ig-square.jpg` | 1080×1080 | Overhead of one beautifully composed Indian vegetarian meal in a matte black container, centred, dark surface, breathing room at top and bottom |
| `ig-story.jpg` | 1080×1920 | Vertical. A meal container on dark stone occupying the lower third, dramatic empty dark space filling the upper two-thirds for text |
| `wa-preview.jpg` | 1200×630 | Warm inviting overhead of a full day of four meals laid out together, appetising, noticeably brighter and friendlier in tone than the rest of the set |

---

# §6 — Week dishes · `public/images/ai/dishes/` (26)

**Style Block A for all 26.** All 1:1.

## The trial day (4) — generate these first

These four are the highest-value images on the entire site. They sit under
"This is what turns up tomorrow morning" beside real macros. The calorie figure
is given so you can check rule #4: the portion must match the number.

**`maharashtrian-moong-dal-chilla-with-green.jpg`** · *355 kcal, 24.5g protein*
```
Overhead close-up of two crisp golden moong dal lentil crepes, folded into
half-moons and slightly overlapping on a dark ceramic plate. Beside them a small
bowl of vivid green coriander chutney and a small bowl of white pomegranate
raita scattered with ruby seeds. Visible crisp lacy edges on the crepes.
```

**`chettinad-cauliflower-steak-with-black-pepper.jpg`** · *468 kcal, 22.4g protein*
```
Overhead close-up of one thick seared cauliflower steak, deeply caramelised on
the cut face, sitting in a dark peppery South Indian coconut gravy on a dark
ceramic plate. A neat mound of brown rice flecked with fried curry leaves beside
it. A few whole black peppercorns scattered on the plate rim.
```

**`rajasthani-makhana-chaat-with-tamarind-chutney.jpg`** · *195 kcal, 5.8g protein*
```
Overhead close-up of a small brass bowl of roasted puffed lotus seeds tossed
with finely diced red onion, tomato and ruby pomegranate seeds, drizzled with
dark tamarind chutney and scattered with torn coriander. A modest single-serving
portion, not a heaped bowl.
```

**`north-indian-palak-paneer-with-jowar.jpg`** · *412 kcal, 28.4g protein*
```
Overhead close-up of silky dark green spinach curry with neat cubes of soft
paneer, in a shallow dark bowl, with two rustic charred millet flatbreads
resting alongside on a dark ceramic plate. A thin swirl of cream on the curry
surface and a scattering of julienned ginger.
```

## The rest of the week (22)

Same treatment. Filenames must match exactly.

| filename (`.jpg`) | prompt |
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

# §7 — À la carte dishes · `public/images/ai/dishes/` (48)

**Style Block B for this entire section.** All 48 filenames verified against
`lib/menu-alacarte.ts` — unique, no collisions.

The eight dishes currently on the homepage product shelf are marked **[SHELF]**.
Those are the ones a visitor sees without scrolling into `/menu`.

## Salads (10)

| filename | prompt |
|---|---|
| `broccoli-and-bean-salad-in-mustard.jpg` | Blanched bright green broccoli florets and cooked white beans tossed in a pale wholegrain mustard dressing, in a shallow matte ceramic bowl, visible mustard seeds clinging to the florets |
| `spinach-and-bean-sprouts-in-creamy.jpg` | Raw baby spinach leaves and crisp mung bean sprouts in a pale creamy celery dressing, in a wide shallow bowl, finely sliced celery visible through the leaves |
| `bean-sprouts-and-lettuce-in-guacamole.jpg` | Crisp mung bean sprouts and torn romaine lettuce folded through chunky green guacamole, in a matte bowl, visible avocado chunks and a lime wedge on the rim |
| `garlicky-cabbage-and-spinach-salad.jpg` **[SHELF]** | Finely shredded raw green cabbage and spinach tossed with slivers of golden toasted garlic, in a shallow bowl, light and dry with no heavy dressing |
| `pineapple-cucumber-salad.jpg` | Cubes of fresh yellow pineapple and diced cucumber with fine red chilli flecks and torn mint, in a shallow white ceramic bowl, juice pooling slightly at the base |
| `brown-rice-salad.jpg` | Cooled brown rice tossed with diced red and yellow peppers, spring onion, parsley and a light lemon dressing, in a wide bowl, individual grains clearly separate |
| `carrot-raisin-salad.jpg` | Coarsely grated orange carrot with plump dark raisins and toasted sunflower seeds in a light yoghurt-lemon dressing, in a shallow bowl |
| `uncooked-pad-thai-salad.jpg` | Raw spiralised courgette and carrot noodles tossed in a peanut-tamarind sauce, topped with crushed peanuts, bean sprouts, red chilli slivers and a lime wedge, in a matte bowl |
| `beetroot-salad.jpg` | Diced deep magenta cooked beetroot with crumbled white feta-style cheese, toasted walnuts and rocket, in a pale ceramic bowl, magenta juice bleeding faintly into the dressing |
| `paneer-veggie-salad.jpg` | Cubes of grilled paneer with visible char marks, roasted red and yellow peppers and zucchini on a bed of torn lettuce, drizzled with pale mint-yoghurt dressing, in a shallow bowl |

## Keto (6) — Style Block B, but darker and richer

| filename | prompt |
|---|---|
| `avocado-chicken-keto-salad.jpg` | Sliced grilled chicken breast with char marks fanned beside halved avocado, cherry tomatoes and rocket, in a shallow bowl, glossy olive oil dressing pooling |
| `creamy-keto-paneer-bowl.jpg` | Cubes of paneer in a rich pale cream sauce with wilted spinach and a scatter of toasted almonds, in a deep matte bowl, visible fat sheen on the sauce |
| `keto-paneer-bhurji.jpg` | Spiced crumbled paneer scramble with finely diced onion, tomato and green chilli, bright with turmeric, in a small matte bowl, coriander scattered on top |
| `keto-lettuce-wrap.jpg` | Two crisp iceberg lettuce cups filled with spiced minced paneer and diced peppers, arranged side by side on a pale slate, a lime wedge beside them |
| `keto-zucchini-noodles-bowl.jpg` | Spiralised raw green zucchini noodles tossed in a basil pesto with cherry tomato halves and pine nuts, in a shallow bowl, noodles visibly raw and springy |
| `keto-avocado-smoothie.jpg` | A tall clear glass of thick pale green avocado smoothie on a pale surface, condensation on the glass, a few chia seeds settled at the base, halved avocado beside it |

## Bowls (8)

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

## Breakfast (9)

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

## Bars (7)

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

## Juices and elixirs (8)

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

# What we will NOT generate

**Before/after transformation photographs — never AI.** This is a health claim
attached to a named person. Generating one is fabricating evidence of a result
your business did not produce, and no disclosure repairs it. Real customer
photographs with written consent, or the section stays as text.

**Also never generated:** human faces or bodies of any kind; anything carrying
the FitFuel name or logo; certificates, licences or lab reports; screenshots of
the app; team or chef photographs; the actual kitchen premises presented as
documentary fact.

---

# Count

| § | folder | count |
|---|---|---|
| §1 | `ai/hero/` | 4 |
| §2 | `ai/goals/` | 4 |
| §3 | `ai/film/` | 7 |
| §4 | `ai/sections/` | 10 |
| §5 | `ai/social/` | 5 |
| §6 | `ai/dishes/` | 26 |
| §7 | `ai/dishes/` | 48 |
| | **total** | **104** |
