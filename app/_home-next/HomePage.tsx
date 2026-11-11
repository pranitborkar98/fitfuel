import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  BarChart3,
  ChefHat,
  ClipboardCheck,
  Dumbbell,
  MapPin,
  Menu,
  MessageCircle,
  PackageCheck,
  Sparkles,
  Utensils,
  X,
} from "lucide-react";
import { TRIAL_TOTAL_LABEL } from "@/lib/trial-price";
import { DELIVERY_WINDOWS } from "@/lib/delivery-windows";
import LoopPreview from "./LoopPreview";
import styles from "./HomePage.module.css";

const MORNING_WINDOW = DELIVERY_WINDOWS.MORNING;
const EVENING_WINDOW = DELIVERY_WINDOWS.EVENING;

export type HomePlan = {
  slug: string;
  name: string;
  tagline: string;
  diet: string;
  calories: number;
  protein: number;
  cycleDays: number;
};

export type HomeData = {
  conceptCount: number | null;
  publishedCount: number;
  exerciseCount: number | null;
  supplementCount: number | null;
  recipeCount: number | null;
  availablePlans: HomePlan[];
  featuredMeal: { name: string; calories: number; protein: number };
};

const dietLabels: Record<string, string> = {
  VEG: "Vegetarian",
  EGG: "Eggetarian",
  NON_VEG: "Non-vegetarian",
  JAIN: "Jain",
  VEGAN: "Vegan",
};

const capabilityGroups = [
  {
    title: "Food and delivery",
    copy: "Choose the goal, diet, meals and delivery window. Only plans with a complete kitchen schedule can reach checkout.",
    links: [
      { label: "Browse available plans", href: "/plans" },
      { label: "See delivery areas", href: "/locations" },
      { label: "Inside the kitchen", href: "/our-kitchen" },
    ],
    Icon: Utensils,
  },
  {
    title: "Body and progress",
    copy: "Meals arrive pre-filled in your diary. Weight, measurements and trends give the next target better context.",
    links: [
      { label: "Body metrics", href: "/dashboard/body-metrics" },
      { label: "Progress view", href: "/dashboard/progress" },
      { label: "Nutrition diary", href: "/dashboard/nutrition" },
    ],
    Icon: BarChart3,
  },
  {
    title: "Training and coaching",
    copy: "Build training from the exercise library, then use weekly trend checks and a conversational coach when you need help.",
    links: [
      { label: "Exercise library", href: "/dashboard/exercises" },
      { label: "Training plan", href: "/dashboard/trainer" },
      { label: "Ask the coach", href: "/dashboard/coach" },
    ],
    Icon: Dumbbell,
  },
  {
    title: "Support around the plan",
    copy: "Goal-aware supplement guidance, partner tools and referrals live beside the plan—not as disconnected add-ons.",
    links: [
      { label: "Supplement guide", href: "/supplements" },
      { label: "Partner network", href: "/partners" },
      { label: "Referrals", href: "/dashboard/referrals" },
    ],
    Icon: Sparkles,
  },
];

export default function HomePage({ data }: { data: HomeData }) {
  const stats = [
    data.conceptCount ? { value: String(data.conceptCount), label: "plan concepts mapped" } : null,
    data.publishedCount ? { value: String(data.publishedCount), label: data.publishedCount === 1 ? "kitchen-ready plan" : "kitchen-ready plans" } : null,
    data.recipeCount ? { value: data.recipeCount.toLocaleString("en-IN"), label: "recipes in the system" } : null,
    data.exerciseCount ? { value: data.exerciseCount.toLocaleString("en-IN"), label: "exercises in the library" } : null,
    data.supplementCount ? { value: data.supplementCount.toLocaleString("en-IN"), label: "active supplement guides" } : null,
    { value: "18", label: "body values and estimates" },
  ].filter((item): item is { value: string; label: string } => Boolean(item));

  return (
    <div className={`${styles.page} fk`}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link href="/" className={styles.wordmark} aria-label="FitFuel home">
            Fit<span>Fuel</span>
          </Link>
          <nav className={styles.desktopNav} aria-label="Primary navigation">
            <Link href="/plans">Meal plans</Link>
            <Link href="/how-it-works">How it works</Link>
            <Link href="/results">Results</Link>
            <Link href="/our-kitchen">Our kitchen</Link>
          </nav>
          <div className={styles.headerActions}>
            <Link href="/auth/signin" className={styles.signIn}>Sign in</Link>
            <Link href="/plans?trial=true" className="fk-btn fk-btn-primary">Try one day</Link>
          </div>
          <details className={styles.mobileNav}>
            <summary aria-label="Open navigation"><Menu className={styles.menuOpen} /><X className={styles.menuClose} /></summary>
            <nav aria-label="Mobile navigation">
              <Link href="/plans">Meal plans</Link>
              <Link href="/how-it-works">How it works</Link>
              <Link href="/results">Results</Link>
              <Link href="/our-kitchen">Our kitchen</Link>
              <Link href="/auth/signin">Sign in</Link>
              <Link href="/plans?trial=true" className="fk-btn fk-btn-primary">Try one day</Link>
            </nav>
          </details>
        </div>
      </header>

      <main>
        <section className={styles.hero}>
          <div className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <span className={styles.location}><MapPin size={17} /> Freshly cooked in Pune</span>
              <h1>Your meal plan should reach the plate.</h1>
              <p>
                FitFuel turns your nutrition target into a kitchen serving, delivers it in your chosen window,
                pre-fills your diary, and records what actually happened.
              </p>
              <div className={styles.heroActions}>
                <Link href="/plans?trial=true" className="fk-btn fk-btn-primary">
                  Try one day · {TRIAL_TOTAL_LABEL} <ArrowRight size={18} />
                </Link>
                <Link href="/plans" className="fk-btn fk-btn-secondary">See available plans</Link>
              </div>
              <p className={styles.heroFine}>Breakfast and lunch · Delivery, packaging and GST included · No subscription</p>
            </div>

            <div className={styles.heroVisual}>
              <Image
                src="/images/hero-bowl-v2.png"
                alt="A chef-cooked bowl with paneer, brown rice, vegetables, chickpeas and raita"
                fill
                loading="eager"
                sizes="(max-width: 820px) 100vw, 52vw"
                className="fk-food"
              />
              <div className={styles.heroCardTop}>
                <span>Your morning window</span>
                <strong>{MORNING_WINDOW.time}</strong>
              </div>
              <div className={styles.heroCardBottom}>
                <BadgeCheck size={20} />
                <div><strong>Portion linked to your target</strong><span>Diary ready to confirm</span></div>
              </div>
            </div>
          </div>
        </section>

        <section className={styles.trustStrip} aria-label="FitFuel service facts">
          <div className={styles.trustInner}>
            <span><BadgeCheck size={18} /> FSSAI licensed kitchen</span>
            <span><ChefHat size={18} /> Chef-cooked in Kharadi</span>
            <span><PackageCheck size={18} /> {MORNING_WINDOW.time} or {EVENING_WINDOW.time}</span>
            <span><ClipboardCheck size={18} /> Complete menus required before checkout</span>
          </div>
        </section>

        <section className={styles.loopSection}>
          <div className={styles.sectionWrap}>
            <div className={styles.sectionIntro}>
              <p className="fk-eyebrow">The connected product</p>
              <h2>The plan changes the plate—not just the chart.</h2>
              <p>
                Most nutrition products stop at advice. FitFuel connects the target, kitchen, delivery and diary,
                so the number in the app can match the serving in the box.
              </p>
            </div>

            <div className={styles.loopGrid}>
              {[
                ["01", "Plan", "Your goal, diet and preferred meals define the starting target."],
                ["02", "Portion", "The kitchen scales each scheduled recipe within guarded limits."],
                ["03", "Deliver", "Your box arrives in the morning or evening window you chose."],
                ["04", "Confirm", "The exact planned meal is waiting in your diary. One tap logs it."],
                ["05", "Adjust", "Weekly weight trends can move the next calorie target in small steps."],
              ].map(([number, title, copy]) => (
                <article key={number} className={styles.loopStep}>
                  <span>{number}</span>
                  <h3>{title}</h3>
                  <p>{copy}</p>
                </article>
              ))}
            </div>

            <div className={styles.previewBand}>
              <div className={styles.previewBandCopy}>
                <p className="fk-eyebrow">The third open, not the first visit</p>
                <h2>Lunch is already waiting in the diary.</h2>
                <p>
                  A member should not rebuild a delivered meal ingredient by ingredient. FitFuel already knows
                  the scheduled dish and the portion the kitchen prepared. The useful action is simply confirming it.
                </p>
                <div className={styles.previewChecks}>
                  <span><BadgeCheck size={18} /> Same serving math in kitchen and diary</span>
                  <span><BadgeCheck size={18} /> Skips, service date and plan day checked on the server</span>
                  <span><BadgeCheck size={18} /> Stale or unrelated meal logs are rejected</span>
                </div>
              </div>
              <LoopPreview
                mealName={data.featuredMeal.name}
                calories={data.featuredMeal.calories}
                protein={data.featuredMeal.protein}
              />
            </div>
          </div>
        </section>

        <section className={styles.kitchenSection}>
          <div className={styles.kitchenGrid}>
            <div className={styles.kitchenImage}>
              <Image
                src="/images/kitchen.jpg"
                alt="A chef plating food in a kitchen"
                fill
                sizes="(max-width: 820px) 100vw, 50vw"
              />
            </div>
            <div className={styles.kitchenCopy}>
              <p className="fk-eyebrow">Where software becomes food</p>
              <h2>Your target becomes a serving instruction.</h2>
              <p>
                The production sheet applies the recipe&apos;s own serving multiplier and your current target factor.
                That changes ingredient rollups, packing totals and the nutrition you see later.
              </p>
              <div className={styles.ticket}>
                <div><span>Plan baseline</span><strong>1,800 kcal</strong></div>
                <div><span>Current target</span><strong>1,650 kcal</strong></div>
                <div><span>Kitchen factor</span><strong>0.90×</strong></div>
                <div><span>Status</span><strong className={styles.ticketReady}>Ready for prep</strong></div>
              </div>
              <p className={styles.safetyNote}>Large changes are capped and flagged for the kitchen. This is nutrition support, not medical treatment.</p>
              <Link href="/how-it-works" className={styles.textLink}>See the full journey <ArrowRight size={17} /></Link>
            </div>
          </div>
        </section>

        <section className={styles.capabilitySection}>
          <div className={styles.sectionWrap}>
            <div className={styles.sectionIntroRow}>
              <div className={styles.sectionIntro}>
                <p className="fk-eyebrow">The rest of the moat</p>
                <h2>One system around the meal.</h2>
              </div>
              <p>
                FitFuel goes deep where it helps the next decision. You can use the food loop on its own,
                then add measurement, training and guidance without stitching together five apps.
              </p>
            </div>
            <div className={styles.capabilityGrid}>
              {capabilityGroups.map(({ title, copy, links, Icon }) => (
                <article key={title} className={styles.capabilityCard}>
                  <Icon size={24} />
                  <h3>{title}</h3>
                  <p>{copy}</p>
                  <div>
                    {links.map((link) => <Link key={link.href} href={link.href}>{link.label} <ArrowRight size={14} /></Link>)}
                  </div>
                </article>
              ))}
            </div>
            <div className={styles.statGrid}>
              {stats.map((stat) => (
                <div key={stat.label}><strong className="fk-num">{stat.value}</strong><span>{stat.label}</span></div>
              ))}
            </div>
          </div>
        </section>

        <section className={styles.plansSection}>
          <div className={styles.sectionWrap}>
            <div className={styles.plansHeader}>
              <div className={styles.sectionIntro}>
                <p className="fk-eyebrow">Start with food</p>
                <h2>Published menus are clearly marked.</h2>
                <p>
                  FitFuel can map {data.conceptCount ?? "many"}{" "}goals and conditions, but a concept is not sold until
                  its full kitchen schedule and price are ready. Today&apos;s catalogue shows that difference before checkout.
                </p>
              </div>
              <Link href="/plans" className="fk-btn fk-btn-secondary">Browse every plan</Link>
            </div>

            {data.availablePlans.length > 0 ? (
              <div className={styles.planGrid}>
                {data.availablePlans.map((plan) => (
                  <article key={plan.slug} className={styles.planCard}>
                    <div className={styles.planPhoto}>
                      <Image src="/images/produce.jpg" alt="Fresh ingredients ready for meal preparation" fill sizes="(max-width: 760px) 100vw, 36vw" />
                      <span>Menu published</span>
                    </div>
                    <div className={styles.planBody}>
                      <span>{dietLabels[plan.diet] ?? plan.diet} · {plan.cycleDays}-day menu</span>
                      <h3>{plan.name}</h3>
                      <p>{plan.tagline}</p>
                      <div className={styles.planMacros}><strong>{plan.calories.toLocaleString("en-IN")} kcal/day</strong><strong>{plan.protein}g protein</strong></div>
                      <Link href={`/plans/${plan.slug}`}>See this plan <ArrowRight size={16} /></Link>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className={styles.noPublished}>
                <ChefHat size={28} />
                <div><h3>Menus are being prepared</h3><p>Explore the plan concepts now; checkout opens only when a full kitchen schedule is published.</p></div>
              </div>
            )}
          </div>
        </section>

        <section className={styles.finalCta}>
          <div className={styles.finalInner}>
            <div>
              <p className="fk-eyebrow">One day is enough to understand it</p>
              <h2>Let the plan reach your plate.</h2>
              <p>Breakfast and lunch, one chosen delivery window, everything included. No subscription.</p>
            </div>
            <div className={styles.finalActions}>
              <Link href="/plans?trial=true" className="fk-btn fk-btn-primary">Start for {TRIAL_TOTAL_LABEL} <ArrowRight size={18} /></Link>
              <a href="https://wa.me/918850446348" className="fk-btn fk-btn-secondary"><MessageCircle size={18} /> Ask on WhatsApp</a>
            </div>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div>
            <Link href="/" className={styles.wordmark}>Fit<span>Fuel</span></Link>
            <p>Chef-cooked, target-linked meals for Pune.</p>
          </div>
          <nav aria-label="Footer navigation">
            <Link href="/about">About</Link><Link href="/faq">FAQ</Link><Link href="/contact">Contact</Link>
            <Link href="/privacy">Privacy</Link><Link href="/terms">Terms</Link>
          </nav>
          <div className={styles.footerLegal}>
            <span>FSSAI 21523035002815</span>
            <span>Food photographs are illustrative. Dish data and prices are shown separately.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
