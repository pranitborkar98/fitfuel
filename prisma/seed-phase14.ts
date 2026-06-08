// ============================================================
// FITFUEL — PHASE 14 SEED (Blog / FAQ / Testimonials)
// Run: npx prisma db push   (creates blog_posts, faqs, testimonials)
//      npx tsx prisma/seed-phase14.ts
// Idempotent: faqs + testimonials are wiped & re-created; blog upserts by slug.
// ============================================================

import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({ connectionString: process.env.DATABASE_URL! })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// ============================================================
// FAQ — grouped by category, ordered. answerHtml allows inline links.
// ============================================================
const FAQS: { category: string; question: string; answerHtml: string }[] = [
  // Delivery & Areas
  { category: 'Delivery & Areas', question: 'Where do you deliver?', answerHtml: 'We currently deliver within selected areas of Pune, with our kitchen based in Kharadi. Delivery areas are expanding &mdash; check at checkout whether your address is covered.' },
  { category: 'Delivery & Areas', question: 'When will my food arrive?', answerHtml: 'You choose a Morning or Evening window when you subscribe. All your meals for the day arrive in a single bundled delivery within that window &mdash; never split into separate trips.' },
  { category: 'Delivery & Areas', question: 'Will all my meals come together?', answerHtml: 'Yes. We bundle every meal you are subscribed to that day into one drop. It keeps deliveries sustainable and your day predictable.' },

  // Plans & Menu
  { category: 'Plans & Menu', question: 'What is included in a plan?', answerHtml: 'Most plans include up to four items a day (breakfast, lunch, snack and dinner depending on the plan you pick), each portioned and labelled with its macros. Every box also includes a Morning Boost.' },
  { category: 'Plans & Menu', question: 'Can I see the menu before I subscribe?', answerHtml: 'Yes. The full 30-day rotating menu, including dish names and macros, is completely public &mdash; no account needed. Browse a plan and view all 30 days before you decide.' },
  { category: 'Plans & Menu', question: 'How often does the menu repeat?', answerHtml: 'Plans run on a rotating cycle designed so you are not eating the same dish back to back. We are continually expanding the rotation as we add recipes.' },
  { category: 'Plans & Menu', question: 'Is there a trial?', answerHtml: 'Yes &mdash; you can try a single trial day with no lock-in before committing to a longer subscription.' },

  // Dietary & Allergens
  { category: 'Dietary & Allergens', question: 'What dietary options do you offer?', answerHtml: 'Vegetarian, eggetarian, non-vegetarian, Jain and vegan options across a wide range of goals, plus condition-specific plans. Jain plans exclude onion, garlic, root vegetables and similar ingredients.' },
  { category: 'Dietary & Allergens', question: 'Do you have plans for health conditions?', answerHtml: 'We design plans aligned with goals like diabetic-friendly, PCOS-supportive and heart-health eating. These offer nutritional support and are not medical treatment. Please read our <a href="/medical-disclaimer">Medical Disclaimer</a> and consult your doctor.' },
  { category: 'Dietary & Allergens', question: 'I have allergies. Is FitFuel safe for me?', answerHtml: 'Our meals are prepared in a shared kitchen that handles common allergens, so we cannot guarantee any meal is allergen-free. Declare your allergies in your profile and read our <a href="/allergen-policy">Allergen Policy</a>. If you have a severe allergy, consult your doctor first.' },

  // Tracking
  { category: 'Tracking', question: 'How does the tracking work?', answerHtml: 'When your meal arrives, tap &ldquo;I ate this&rdquo; in the app. The meal&rsquo;s macros are logged automatically, your calorie ring updates, and your progress charts build over time. You can adjust portions if you eat more or less.' },
  { category: 'Tracking', question: 'What makes FitFuel different from a calorie app?', answerHtml: 'Most apps ask you to guess and log what you ate. We cook and deliver the food, so your intake is verified rather than self-reported &mdash; which is what makes the coaching and progress data actually reliable.' },
  { category: 'Tracking', question: 'Do I need a smart scale?', answerHtml: 'No. You can log weight manually. If you use a supported Bluetooth scale, weigh-ins sync straight into your trend charts.' },

  // Pricing & Payment
  { category: 'Pricing & Payment', question: 'How much does it cost, and is GST included?', answerHtml: 'Plans range from a single trial day to multi-month subscriptions, with Standard, Premium and Luxury tiers. Prices are shown at checkout; GST of 5% applies on meal plans as indicated.' },
  { category: 'Pricing & Payment', question: 'How do I pay?', answerHtml: 'We accept online payment through our partner PayU, as well as Cash on Delivery where available.' },

  // Account & Subscription
  { category: 'Account & Subscription', question: 'Can I pause, skip or cancel?', answerHtml: 'Yes. You can pause, skip upcoming days or cancel from your account, subject to our daily cut-off time. See our <a href="/refund-policy">Refund &amp; Cancellation Policy</a> for how refunds work.' },
  { category: 'Account & Subscription', question: 'Do I need an account to order?', answerHtml: 'You can browse plans and the full menu without an account. To subscribe, track meals and see your progress you will create a quick account &mdash; sign-in is one tap with Google.' },
]

// ============================================================
// TESTIMONIALS — featured ones surface on homepage / featured row.
// ============================================================
const TESTIMONIALS: {
  name: string; location: string; planLabel: string; goal: string;
  resultLabel: string; rating: number; quote: string; isFeatured: boolean
}[] = [
  { name: 'Rahul M.', location: 'Kharadi', planLabel: 'Muscle Gain &middot; 1 Month', goal: 'muscle_gain', resultLabel: '+3kg muscle', rating: 5, isFeatured: true, quote: 'Gained 3kg of muscle in a month. The food is actually delicious &mdash; I was expecting bland diet food but FitFuel proved me wrong completely. Delivery is always on time.' },
  { name: 'Priya S.', location: 'Viman Nagar', planLabel: 'Weight Loss &middot; Bi-Weekly', goal: 'weight_loss', resultLabel: '-4kg in 15 days', rating: 5, isFeatured: true, quote: 'Lost 4kg in 15 days while eating properly. No starvation, no boiled chicken. Real food that tastes good and keeps me full until the next meal.' },
  { name: 'Amit K.', location: 'Kalyani Nagar', planLabel: 'Office Plan &middot; Monthly', goal: 'office', resultLabel: 'Quit Zomato', rating: 5, isFeatured: true, quote: 'Best decision for my work week. I used to order Zomato every day and still feel unhealthy. FitFuel changed my relationship with food completely.' },
  { name: 'Sneha D.', location: 'Wagholi', planLabel: 'Weight Loss (Veg) &middot; 1 Month', goal: 'weight_loss', resultLabel: '-5.2kg', rating: 5, isFeatured: false, quote: 'Being vegetarian I always struggled to hit protein. The plan handled it for me and the weekly weigh-in trend kept me honest. Down 5kg without ever feeling deprived.' },
  { name: 'Karan T.', location: 'Hadapsar', planLabel: 'Muscle Gain &middot; 3 Months', goal: 'muscle_gain', resultLabel: '+6kg, stronger lifts', rating: 5, isFeatured: false, quote: 'Three months in and my lifts are up across the board. Having the macros sorted and delivered meant I could just focus on training and recovery.' },
  { name: 'Megha R.', location: 'Magarpatta', planLabel: 'PCOS-Supportive &middot; 2 Months', goal: 'weight_loss', resultLabel: 'Steadier energy', rating: 5, isFeatured: false, quote: 'The condition-aligned meals plus consistent timing made a real difference to my energy through the day. Pairing it with my doctor&rsquo;s advice has worked well for me.' },
  { name: 'Aditya P.', location: 'Kharadi', planLabel: 'Balanced Diet &middot; Monthly', goal: 'balanced', resultLabel: 'Habit fixed', rating: 5, isFeatured: false, quote: 'I did not want to lose or gain, I just wanted to stop eating garbage at my desk. FitFuel quietly fixed my eating without me having to think about it.' },
  { name: 'Neha J.', location: 'Viman Nagar', planLabel: 'Weight Loss &middot; 1 Month', goal: 'weight_loss', resultLabel: '-3.5kg', rating: 4, isFeatured: false, quote: 'Genuinely tasty for diet food and the tracking is effortless. Would love even more variety in the snacks, but the results speak for themselves.' },
]

// ============================================================
// BLOG — launch articles (HTML bodies, India-first, on-brand).
// ============================================================
const BLOG_POSTS: {
  slug: string; title: string; excerpt: string; category: string;
  tags: string[]; readMinutes: number; isFeatured: boolean; contentHtml: string
}[] = [
  {
    slug: 'why-we-cook-your-food-instead-of-just-counting-it',
    title: 'Why We Cook Your Food Instead of Just Counting It',
    excerpt: 'Every fitness app on your phone can count calories. None of them can guarantee what actually landed on your plate. That gap is the whole reason FitFuel exists.',
    category: 'FitFuel News',
    tags: ['philosophy', 'data-loop', 'nutrition'],
    readMinutes: 5,
    isFeatured: true,
    contentHtml: `
<p>There is no shortage of apps that will count your calories. You photograph a plate, you search a database, you log a number. The problem is that almost every number you enter is a guess &mdash; portion sizes, hidden oil, the second helping you forgot to log. The data looks precise. It rarely is.</p>
<h2>The flaw in self-reported tracking</h2>
<p>Study after study finds that people under-report what they eat, often by hundreds of calories a day. It is not dishonesty &mdash; it is genuinely hard to eyeball a portion or know how much ghee went into a sabzi. When the input is unreliable, every recommendation built on top of it is unreliable too.</p>
<p>So a coaching app advises you based on data you guessed. If the advice does not work, no one can tell whether the plan was wrong or the logging was.</p>
<h2>We close the loop by owning the plate</h2>
<p>FitFuel takes a different route. We cook the food in our own Pune kitchen, portion it, label every box with its real macros, and deliver it to you. When you tap <strong>&ldquo;I ate this,&rdquo;</strong> you are not estimating &mdash; you are confirming a meal whose composition we already know to the gram.</p>
<ul>
<li><strong>Verified intake.</strong> The macros are measured at the source, not retyped from a packet.</li>
<li><strong>Honest progress.</strong> Your calorie ring and weight trend reflect what truly happened.</li>
<li><strong>Real adjustments.</strong> When the data is trustworthy, plateaus and recalibration mean something.</li>
</ul>
<h2>The meal is the door, the system is the product</h2>
<p>Delivery is where most tiffin services stop. For us it is the entry point to a loop: meals delivered, logged, paired with your workouts and weigh-ins, and turned into a consistency score that tells us &mdash; and eventually your AI coach &mdash; exactly how you are doing.</p>
<p>That is the part no calorie counter and no tiffin service can copy without doing what we do: running the kitchen. It is harder. It is also the only way the numbers stay honest.</p>
<p><em>Ready to see it work on your own plate? <a href="/plans">Browse the plans</a> and start with a single trial day.</em></p>
`.trim(),
  },
  {
    slug: 'lose-weight-in-pune-without-giving-up-indian-food',
    title: 'How to Lose Weight in Pune Without Giving Up Indian Food',
    excerpt: 'You do not need to swap dal-roti for quinoa and boiled chicken. Sustainable fat loss on a vegetarian Indian diet is mostly about portions, protein and consistency.',
    category: 'Guides',
    tags: ['weight-loss', 'vegetarian', 'indian-food'],
    readMinutes: 7,
    isFeatured: false,
    contentHtml: `
<p>The most common reason people quit a &ldquo;diet&rdquo; is that it asks them to abandon the food they actually like. The good news: you can lose weight eating recognisably Indian, mostly vegetarian meals. The mechanics are simpler than the internet makes them sound.</p>
<h2>1. A modest calorie deficit, not starvation</h2>
<p>Fat loss happens when you eat a little less than you burn &mdash; consistently. A gentle deficit you can hold for months beats a crash diet you abandon in ten days. Crash diets also tank your energy and your training.</p>
<h2>2. Protein is the lever vegetarians keep missing</h2>
<p>Protein keeps you full and protects muscle while you lose fat. On a veg diet you have to be deliberate about it. Reach for:</p>
<ul>
<li>Dal, rajma, chana and other legumes at most meals</li>
<li>Paneer, tofu and soya in sensible portions</li>
<li>Curd and Greek yogurt as snacks</li>
<li>A scoop of whey if you fall short on a busy day</li>
</ul>
<h2>3. Fix the portions, keep the dishes</h2>
<p>You rarely need to delete a dish &mdash; you need to right-size it. Two rotis instead of four, a controlled spoon of oil, a bigger share of the plate going to vegetables and protein. The methi dal and bajra roti stay; the runaway portions go.</p>
<h2>4. Consistency beats perfection</h2>
<p>One indulgent meal does not undo a week. Skipping the plan for a week does. The people who succeed are not the strictest &mdash; they are the most consistent. This is exactly why we track a weekly consistency score rather than chase a perfect day.</p>
<h2>Where FitFuel fits</h2>
<p>All of the above is real work to do alone: calculating the deficit, hitting protein every meal, controlling oil, staying consistent through a hectic Pune work week. Our weight-loss vegetarian plan does the calculation and the cooking for you, delivers it portioned and labelled, and logs it automatically so your weight trend tells the truth.</p>
<p><em>This article is general guidance, not medical advice. If you have a health condition, please consult your doctor &mdash; see our <a href="/medical-disclaimer">Medical Disclaimer</a>.</em></p>
`.trim(),
  },
  {
    slug: 'protein-for-vegetarians-hitting-your-target',
    title: 'Protein for Vegetarians: Hitting Your Target on a Veg Plan',
    excerpt: 'Hitting protein on a vegetarian diet is absolutely doable &mdash; it just needs intent. Here is how the numbers actually add up across an Indian day.',
    category: 'Nutrition',
    tags: ['protein', 'vegetarian', 'macros'],
    readMinutes: 6,
    isFeatured: false,
    contentHtml: `
<p>&ldquo;You can&rsquo;t get enough protein as a vegetarian&rdquo; is one of the most repeated myths in Indian fitness. You can. It simply will not happen by accident the way it does for someone eating chicken at every meal &mdash; it has to be planned.</p>
<h2>How much do you actually need?</h2>
<p>A common target for active adults is roughly 1.6 to 2.0 grams of protein per kilogram of bodyweight per day. For a 70kg person that is about 112 to 140g. It sounds like a lot until you spread it across four meals.</p>
<h2>A realistic vegetarian day</h2>
<ul>
<li><strong>Breakfast:</strong> besan chilla or paneer bhurji with curd &mdash; 20&ndash;25g</li>
<li><strong>Lunch:</strong> rajma or chana with rice and a side of curd &mdash; 25&ndash;30g</li>
<li><strong>Snack:</strong> roasted chana, a glass of milk or a whey shake &mdash; 20&ndash;25g</li>
<li><strong>Dinner:</strong> tofu or paneer sabzi with dal and roti &mdash; 25&ndash;30g</li>
</ul>
<p>That stacks to well over 100g without anything exotic and without a single egg or piece of meat.</p>
<h2>The quality question</h2>
<p>Animal proteins are &ldquo;complete,&rdquo; but a varied vegetarian diet covers the same bases easily &mdash; pair legumes with grains across the day and you get the full amino acid profile. You do not need to engineer every plate; you need variety across the day.</p>
<h2>Why measured plans make this easier</h2>
<p>The hard part is not knowing this &mdash; it is hitting it every single day when life gets busy. That is the entire point of a planned, macro-labelled meal: the protein target is built into the food, and when you log it, you can see in your charts whether you actually hit it instead of hoping you did.</p>
<p><em>Want the protein math handled for you? Our vegetarian plans are built to hit your target by design. <a href="/plans">Explore the plans</a>.</em></p>
`.trim(),
  },
]

async function main() {
  console.log('\nSeeding Phase 14 content...\n')

  // FAQs (wipe + recreate; Phase 14 owns this table)
  await prisma.faq.deleteMany({})
  for (let i = 0; i < FAQS.length; i++) {
    const f = FAQS[i]
    await prisma.faq.create({
      data: {
        category: f.category,
        question: f.question,
        answerHtml: f.answerHtml,
        sortOrder: i,
        isActive: true,
      },
    })
  }
  console.log(`  FAQs: ${FAQS.length}`)

  // Testimonials (wipe + recreate)
  await prisma.testimonial.deleteMany({})
  for (let i = 0; i < TESTIMONIALS.length; i++) {
    const t = TESTIMONIALS[i]
    await prisma.testimonial.create({
      data: {
        name: t.name,
        location: t.location,
        planLabel: t.planLabel,
        goal: t.goal,
        resultLabel: t.resultLabel,
        rating: t.rating,
        quote: t.quote,
        isFeatured: t.isFeatured,
        isActive: true,
        sortOrder: i,
      },
    })
  }
  console.log(`  Testimonials: ${TESTIMONIALS.length}`)

  // Blog posts (upsert by slug — safe to re-run)
  for (const p of BLOG_POSTS) {
    await prisma.blogPost.upsert({
      where: { slug: p.slug },
      update: {
        title: p.title,
        excerpt: p.excerpt,
        contentHtml: p.contentHtml,
        category: p.category,
        tags: p.tags,
        readMinutes: p.readMinutes,
        isFeatured: p.isFeatured,
        status: 'PUBLISHED',
      },
      create: {
        slug: p.slug,
        title: p.title,
        excerpt: p.excerpt,
        contentHtml: p.contentHtml,
        category: p.category,
        tags: p.tags,
        readMinutes: p.readMinutes,
        isFeatured: p.isFeatured,
        status: 'PUBLISHED',
      },
    })
    console.log(`  Blog: ${p.slug}`)
  }

  console.log('\nPhase 14 seed complete!\n')
}

main()
  .catch((e) => {
    console.error('Phase 14 seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
