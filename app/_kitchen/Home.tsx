import Image from "next/image";
import Link from "next/link";

import MenuBoard, { type BoardCourse } from "./MenuBoard";
import s from "./home.module.css";

/* ══════════════════════════════════════════════════════════════════════════
   THE FITFUEL STOREFRONT.

   The order of this page is an argument. The previous version opened with a
   trial panel, then eight aisles, then six numbered "MOAT" sections arguing
   vertical integration — an investor deck a customer had to scroll past to
   find lunch. A customer in Pune wants to know three things, in this order:
   what does the food look like, when does it arrive, what does it cost. So:
   photograph, then arrival, then price, then the food itself, and the business
   argument reduced to one honest paragraph near the bottom.

   WHAT IS DELIBERATELY ABSENT.
   - Macro rings. AGENTS.md forbids representing a meal with a ring or glyph on
     a surface where someone is choosing what to eat. The old grid used one per
     dish because no photography exists; that is a missing-asset problem being
     solved with a diagram, and the diagram is what made the page read clinical.
   - kitchen.jpg and corporate.jpg. The first is a European fine-dining chef
     under BUFFALO-branded heat lamps in a "BRUT" apron; the second is a stock
     office high-five. Neither is FitFuel, and a trust section built on stock
     photography of other people's businesses subtracts trust.
   - The 32 unpriced dishes as tiles. See MenuBoard.tsx.
   ══════════════════════════════════════════════════════════════════════════ */

export type WeekMeal = { slot: string; name: string; kcal: number; protein: number };

export type HomeProps = {
  /** Day one of the plan the kitchen cooks most, straight off PlanScheduleSlot. */
  day: WeekMeal[];
  dayKcal: number;
  dayProtein: number;
  courses: BoardCourse[];
  /** How many dishes exist in total vs how many carry a real price. */
  dishesTotal: number;
  dishesPriced: number;
  planCount: number;
  trial: { food: number; delivery: number; packaging: number; gst: number; total: number };
  trialAllFour: number;
  menuFrom: number;
  waHref: string;
  licence: string;
  heroSrc: string | null;
  produceSrc: string | null;
};

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function Home({
  day,
  dayKcal,
  dayProtein,
  courses,
  dishesTotal,
  dishesPriced,
  planCount,
  trial,
  trialAllFour,
  menuFrom,
  waHref,
  licence,
  heroSrc,
  produceSrc,
}: HomeProps) {
  return (
    <div className="fk">
      {/* ── Chrome ─────────────────────────────────────────────────────── */}
      <header className={s.header}>
        <div className="fk-wrap">
          <div className={s.headerRow}>
            <Link href="/" className={s.wordmark}>
              Fit<em>Fuel</em>
            </Link>

            <nav className={s.nav} aria-label="Main">
              <Link href="/menu" className={s.navLink}>
                Menu
              </Link>
              <Link href="/plans" className={s.navLink}>
                Plans
              </Link>
              <Link href="/how-it-works" className={s.navLink}>
                How it works
              </Link>
              <Link href="/corporate" className={s.navLink}>
                For offices
              </Link>
            </nav>

            <div className={s.headerActions}>
              <Link href="/dashboard" className={s.navLink}>
                Sign in
              </Link>
              <Link href="/checkout" className="fk-btn fk-btn-primary">
                Start the trial
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* One line, one fact. The old header carried a live monospace countdown
          clock, which is a trading-terminal device: it creates urgency without
          telling a customer what to do. A sentence does both. */}
      <div className={s.cutoff}>
        <div className="fk-wrap">
          <p className={s.cutoffRow}>
            <span>
              Delivering across Pune. Order by <strong>9pm</strong> to eat tomorrow.
            </span>
            <span>Breakfast and lunch at your door by 8am.</span>
          </p>
        </div>
      </div>

      {/* ── Hero ───────────────────────────────────────────────────────── */}
      <section className="fk-wrap">
        <div className={s.hero}>
          <div className={s.heroCopy}>
            <h1 className={s.heroTitle}>Eat well without thinking about it.</h1>
            <p className={s.heroLede}>
              Chef-cooked meals, portioned to your goal, delivered across Pune before
              you leave the house. Start with a single day — no subscription, nothing
              to cancel.
            </p>
            <div className={s.heroCtas}>
              <Link href="/checkout" className="fk-btn fk-btn-primary">
                Start with one day — {rs(trial.total)}
              </Link>
              <a href="#menu" className="fk-btn fk-btn-secondary">
                See the menu
              </a>
            </div>
            <ul className={s.trust}>
              <li>
                <span className={s.dot} aria-hidden="true" />
                Our own kitchen and our own drivers
              </li>
              <li>
                <span className={s.dot} aria-hidden="true" />
                FSSAI <span className="fk-num">{licence}</span>
              </li>
            </ul>
          </div>

          {heroSrc ? (
            <div className={s.heroShot}>
              <Image
                src={heroSrc}
                alt="An overhead FitFuel bowl: sliced avocado, chickpeas, roast sweet potato, cherry tomatoes, red cabbage and microgreens."
                fill
                sizes="(min-width: 960px) 46vw, 100vw"
                className="fk-food"
                style={{ objectFit: "cover" }}
                /* `priority` is deprecated in Next 16; the docs steer to
                   loading/fetchPriority for the LCP image instead of preload. */
                loading="eager"
                fetchPriority="high"
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Trial ──────────────────────────────────────────────────────── */}
      <section className={s.bandWarm} aria-labelledby="trial-h">
        <div className="fk-wrap fk-section">
          <div className={s.trial}>
            <div>
              <p className="fk-eyebrow">Start here</p>
              <h2 id="trial-h">One day. {rs(trial.total)}. Nothing to cancel.</h2>
              <p className="fk-measure" style={{ marginTop: "var(--fk-s-5)" }}>
                Breakfast and lunch, cooked to your macros and at your door by 8am
                tomorrow. If it is not for you, that is the end of it — there is no
                subscription to unwind and no card left on file.
              </p>
              <p className={s.trialNote}>
                Want all four meals for the day instead? That is {rs(trialAllFour)}.
              </p>
            </div>

            {/* The receipt. Every line the customer will be charged, before they
                are asked for anything — delivery and packaging named rather
                than buried, GST stated rather than appearing on the last screen. */}
            <div className={`fk-card ${s.receipt}`}>
              <h3 className={s.receiptTitle}>What you actually pay</h3>
              <p className={s.line}>
                <span>The food</span>
                <i aria-hidden="true" />
                <b className="fk-num">{rs(trial.food)}</b>
              </p>
              <p className={s.line}>
                <span>Delivery</span>
                <i aria-hidden="true" />
                <b className="fk-num">{rs(trial.delivery)}</b>
              </p>
              <p className={s.line}>
                <span>Packaging</span>
                <i aria-hidden="true" />
                <b className="fk-num">{rs(trial.packaging)}</b>
              </p>
              <p className={s.line}>
                <span>GST at 5%</span>
                <i aria-hidden="true" />
                <b className="fk-num">{rs(trial.gst)}</b>
              </p>
              <p className={s.total}>
                <span className={s.totalLabel}>Total</span>
                <span className={`${s.totalValue} fk-num`}>{rs(trial.total)}</span>
              </p>
              <Link
                href="/checkout"
                className="fk-btn fk-btn-primary"
                style={{ width: "100%", marginTop: "var(--fk-s-5)" }}
              >
                Start the trial day
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── The week ───────────────────────────────────────────────────── */}
      {day.length > 0 ? (
        <section className="fk-wrap fk-section" aria-labelledby="week-h">
          <div className={s.sectionHead}>
            <div>
              <p className="fk-eyebrow">Today on the weight-loss plan</p>
              <h2 id="week-h">A whole day, cooked and weighed.</h2>
              <p>
                This is an actual day off the plan the kitchen cooks most — four meals,
                each weighed on a scale rather than averaged across the plan.
              </p>
            </div>
            <Link href="/plans" className={s.sectionLink}>
              All {planCount} plans →
            </Link>
          </div>

          <div className={s.week}>
            {day.map((m) => (
              <article key={m.slot} className={s.meal}>
                <p className={s.mealSlot}>{m.slot}</p>
                <h3 className={s.mealName}>{m.name}</h3>
                <p className={s.mealMacros}>
                  <b className="fk-num">{m.kcal} kcal</b>{" "}
                  <span className="fk-num">· {m.protein}g protein</span>
                </p>
              </article>
            ))}
          </div>

          <p className={s.dayTotal}>
            <span>The whole day</span>
            <b className="fk-num">
              {dayKcal.toLocaleString("en-IN")} kcal · {dayProtein}g protein
            </b>
          </p>
        </section>
      ) : null}

      {/* ── Menu ───────────────────────────────────────────────────────── */}
      <section id="menu" className={s.bandWarm} aria-labelledby="menu-h">
        <div className="fk-wrap fk-section">
          <div className={s.sectionHead}>
            <div>
              <p className="fk-eyebrow">No subscription needed</p>
              <h2 id="menu-h">Order a single meal.</h2>
              <p>
                {dishesPriced} dishes carry a price the kitchen has set, from{" "}
                {rs(menuFrom)}. Dressings travel separately so a salad arrives crisp
                rather than wilted.
              </p>
            </div>
          </div>

          <MenuBoard courses={courses} />

          <p style={{ marginTop: "var(--fk-s-6)", color: "var(--fk-ink-3)" }} className="fk-measure">
            The kitchen also cooks bowls, breakfasts, protein bars and cold-pressed
            juices — {dishesTotal - dishesPriced} more dishes we price to order.{" "}
            <a href={waHref} style={{ color: "var(--fk-green-deep)", fontWeight: 600 }}>
              Ask on WhatsApp
            </a>{" "}
            and we will quote you today&rsquo;s number.
          </p>
        </div>
      </section>

      {/* ── Why direct ─────────────────────────────────────────────────── */}
      <section className="fk-wrap fk-section" aria-labelledby="direct-h">
        <div className={s.direct}>
          <div>
            <p className="fk-eyebrow">Why order here</p>
            <h2 id="direct-h">The apps take about 40 paise of every rupee.</h2>
            <p className="fk-measure" style={{ marginTop: "var(--fk-s-5)" }}>
              We are listed on Swiggy and Zomato, and you are welcome to order there.
              But we run our own kitchen, our own licence and our own drivers, so
              ordering direct is the difference between a margin and a rounding error
              — and it is the only way we can weigh a portion to your numbers rather
              than to a menu average.
            </p>
            <p style={{ marginTop: "var(--fk-s-5)" }}>
              <Link href="/how-it-works" className={s.sectionLink}>
                How a day works →
              </Link>
            </p>
          </div>
          {produceSrc ? (
            <div className={s.directShot}>
              <Image
                src={produceSrc}
                alt="Vegetables being prepped: shredded cabbage and carrot, sliced radish and cucumber, tomatoes, herbs and half an avocado."
                fill
                sizes="(min-width: 900px) 46vw, 100vw"
                className="fk-food"
                style={{ objectFit: "cover" }}
              />
            </div>
          ) : null}
        </div>
      </section>

      {/* ── Proof ──────────────────────────────────────────────────────── */}
      <section className={s.bandWarm} aria-labelledby="proof-h">
        <div className="fk-wrap fk-section">
          <h2 id="proof-h" className="fk-sr-only">
            FitFuel by the numbers
          </h2>
          <ul className={s.counts}>
            <li className={s.count}>
              <b className="fk-num">{planCount}</b>
              <span>plans, for goals and medical conditions</span>
            </li>
            <li className={s.count}>
              <b className="fk-num">{dishesTotal}</b>
              <span>dishes on the single-meal menu</span>
            </li>
            <li className={s.count}>
              <b className="fk-num">30</b>
              <span>days of rotation before a dish repeats</span>
            </li>
            <li className={s.count}>
              <b className="fk-num">8am</b>
              <span>at your door, across Pune</span>
            </li>
          </ul>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────────────────── */}
      <footer className={s.footer}>
        <div className="fk-wrap">
          <div className={s.footerGrid}>
            <div>
              <p className={s.footerTitle}>FitFuel</p>
              <p style={{ color: "#b3ada0", maxWidth: "38ch" }}>
                A kitchen in Pune that cooks to your macros and delivers before
                breakfast.
              </p>
              <p style={{ marginTop: "var(--fk-s-4)", color: "#b3ada0" }}>
                FSSAI licence <span className="fk-num">{licence}</span>
              </p>
            </div>

            <div>
              <h3 className={s.footerTitle}>Order</h3>
              <ul className={s.footerList}>
                <li>
                  <Link href="/menu">The menu</Link>
                </li>
                <li>
                  <Link href="/plans">Meal plans</Link>
                </li>
                <li>
                  <Link href="/corporate">For offices</Link>
                </li>
                <li>
                  <a href={waHref}>WhatsApp us</a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className={s.footerTitle}>FitFuel</h3>
              <ul className={s.footerList}>
                <li>
                  <Link href="/how-it-works">How it works</Link>
                </li>
                <li>
                  <Link href="/faq">Questions</Link>
                </li>
                <li>
                  <Link href="/contact">Contact</Link>
                </li>
                <li>
                  <Link href="/refund-policy">Refunds</Link>
                </li>
              </ul>
            </div>
          </div>

          <div className={s.footerBase}>
            <span>© {new Date().getFullYear()} FitFuel, Pune</span>
            {/* A nav list rather than a sentence with "·" separators, so each
                legal link is a real 44px target instead of 15px of inline text. */}
            <ul className={s.legal}>
              <li>
                <Link href="/privacy">Privacy</Link>
              </li>
              <li>
                <Link href="/terms">Terms</Link>
              </li>
              <li>
                <Link href="/medical-disclaimer">Medical disclaimer</Link>
              </li>
            </ul>
          </div>
        </div>
      </footer>

      {/* Primary action follows the customer on phones. */}
      <div className={s.orderBarSpacer} aria-hidden="true" />
      <div className={s.orderBar}>
        <span className={s.orderBarNote}>
          From <span className="fk-num">{rs(menuFrom)}</span>
        </span>
        <Link href="/checkout" className="fk-btn fk-btn-primary">
          Start the trial — {rs(trial.total)}
        </Link>
      </div>
    </div>
  );
}
