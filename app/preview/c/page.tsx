// app/preview/c/page.tsx — DIRECTION C: HEAT
//
// The bet: near-black is the safest choice on the internet and it has never
// once made this business look like it tastes good. This drops it. Every
// section is a saturated field — tangerine, acid, rose, cream — and the page
// changes colour under you as you scroll.
//
// The discipline that keeps it premium rather than shrill: type is near-black
// ON the colour, never white on it. White on tangerine is a discount banner;
// black on tangerine is a magazine cover. Display stays Fraunces so the
// loudness reads as food rather than as sportswear.
//
// Real day-one dishes from the database, one per colour.

import Link from "next/link";
import Image from "next/image";

import { getDayOne, totals, SLOT_LABEL } from "@/app/_hp/menu-data";
import s from "./c.module.css";

/* Each dish gets its own field. Four hues in one row is the direction. */
const CELL_FIELDS = ["tangerine", "acid", "rose", "cream"] as const;

export default async function PreviewC() {
  const dishes = await getDayOne();
  const { kcal, protein } = totals(dishes);

  return (
    <main className={s.page}>
      {/* ── open on ink so the first colour lands hard ─────────────── */}
      <section className={`${s.ink} ${s.block}`} style={{ paddingTop: "clamp(90px,12vw,160px)" }}>
        <div className={s.inner}>
          <p className={s.kick}>Pune · at your door by 8am, six days a week</p>
          <h1 className={s.mega}>
            We cook it. We weigh it.{" "}
            <span className={s.italic} style={{ color: "#ff5a1f" }}>
              It logs itself.
            </span>
          </h1>
          <p className={s.say}>
            Chef-cooked meals portioned to your macros on a scale before they are sealed. The
            tracking is not another app you have to remember to open. It is the same system
            that cooked your food.
          </p>
          <div className={s.row}>
            <Link href="/plans?trial=true" className={`${s.btn} ${s.btnLight}`}>
              Try one day, Rs 400
            </Link>
            <Link href="/plans" className={`${s.btn} ${s.btnOutline}`}>
              All 126 plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── tangerine ──────────────────────────────────────────────── */}
      <section className={`${s.tangerine} ${s.block}`}>
        <div className={s.inner}>
          <h2 className={`${s.head} ${s.pop}`}>
            At four in the morning, someone is weighing your lunch
          </h2>
          <p className={`${s.say} ${s.pop}`}>
            Not ladled by eye into a shared tiffin. Every plate is cooked to one
            person&rsquo;s numbers and checked on a scale before the compartment is sealed.
          </p>
          <div className={s.figs}>
            <div className={s.pop}>
              <span className={s.fig}>04:00</span>
              <p className={s.figNote}>the kitchen starts</p>
            </div>
            <div className={s.pop}>
              <span className={s.fig}>08:00</span>
              <p className={s.figNote}>at your door</p>
            </div>
            <div className={s.pop}>
              <span className={s.fig}>15</span>
              <p className={s.figNote}>areas of east Pune</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── cream, with the photograph ─────────────────────────────── */}
      <section className={`${s.cream} ${s.block}`}>
        <div className={s.inner}>
          <div className={`${s.shot} ${s.pop}`}>
            <Image
              src="/images/hero-bowl.jpg"
              alt="A FitFuel bowl of vegetables, chickpeas and avocado"
              fill
              sizes="100vw"
              priority
              quality={75}
            />
          </div>
          <h2 className={`${s.head} ${s.pop}`} style={{ marginTop: "clamp(28px,4vw,52px)" }}>
            Every other app trusts you to log it.{" "}
            <span className={s.italic}>We already know.</span>
          </h2>
          <p className={`${s.say} ${s.pop}`}>
            Self-reported food is where every diet app quietly fails: you guess the portion,
            you forget the chai, and the numbers flatter you. We own the plate, so the
            measurement happens in the kitchen instead of in your memory.
          </p>
        </div>
      </section>

      {/* ── day one, one colour per meal ───────────────────────────── */}
      <section className={s.acid} style={{ paddingTop: "clamp(64px,10vw,120px)" }}>
        <div className={s.inner}>
          <p className={s.kick}>Day one · Rs 400 · no subscription</p>
          <h2 className={`${s.head} ${s.pop}`}>This is what turns up tomorrow morning</h2>
          <p className={`${s.say} ${s.pop}`}>
            Day one of Weight Loss Vegetarian, pulled live from the kitchen&rsquo;s own
            schedule.
            {dishes.length > 0 && (
              <>
                {" "}
                {Math.round(kcal)} kcal, {Math.round(protein)}g protein, {dishes.length}{" "}
                meals.
              </>
            )}
          </p>
          <div className={s.row} style={{ marginBottom: "clamp(34px,5vw,60px)" }}>
            <Link href="/plans?trial=true" className={s.btn}>
              Book the trial day
            </Link>
            <Link href="/plans/weight-loss-veg" className={`${s.btn} ${s.btnOutline}`}>
              See the whole week
            </Link>
          </div>
        </div>

        {dishes.length > 0 && (
          <div className={s.quad}>
            {dishes.map((d, i) => (
              <article
                key={d.slot + d.name}
                className={`${s.quadCell} ${s[CELL_FIELDS[i % CELL_FIELDS.length]]}`}
              >
                <h3 className={s.quadSlot}>{SLOT_LABEL[d.slot] ?? d.slot}</h3>
                <p className={s.quadDish}>{d.name}</p>
                <p className={s.quadMac}>
                  {d.kcal == null ? "—" : Math.round(d.kcal)}
                  <span className={s.quadMacSub}> kcal</span>
                  {d.protein != null && (
                    <>
                      {" · "}
                      {Math.round(d.protein)}
                      <span className={s.quadMacSub}>g pro</span>
                    </>
                  )}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      {/* ── rose ───────────────────────────────────────────────────── */}
      <section className={`${s.rose} ${s.block}`}>
        <div className={s.inner}>
          <h2 className={`${s.head} ${s.pop}`}>
            We cook for the condition, not just the calorie
          </h2>
          <p className={`${s.say} ${s.pop}`}>
            A diabetic plan holds the glucose curve. A PCOS plan is built around insulin
            sensitivity. Seventy of our plans are written for a diagnosis, by a nutritionist,
            not by swapping rice for quinoa and calling it medical.
          </p>
          <div className={s.figs}>
            <div className={s.pop}>
              <span className={s.fig}>38</span>
              <p className={s.figNote}>conditions cooked for</p>
            </div>
            <div className={s.pop}>
              <span className={s.fig}>70</span>
              <p className={s.figNote}>plans built for one</p>
            </div>
          </div>
          <div className={s.row}>
            <Link href="/plans?category=LIFESTYLE_MEDICAL" className={s.btn}>
              See the condition plans
            </Link>
          </div>
        </div>
      </section>

      {/* ── close on ink ───────────────────────────────────────────── */}
      <section className={`${s.ink} ${s.block}`}>
        <div className={s.inner}>
          <h2 className={s.mega}>
            Stop guessing{" "}
            <span className={s.italic} style={{ color: "#c6f24e" }}>
              what you ate
            </span>
          </h2>
          <p className={s.say}>
            One day. Rs 400. Tomorrow morning. If it is not for you, that is the end of it:
            there is nothing to cancel.
          </p>
          <div className={s.row}>
            <Link href="/plans?trial=true" className={`${s.btn} ${s.btnLight}`}>
              Book your trial day
            </Link>
            <Link href="/preview" className={`${s.btn} ${s.btnOutline}`}>
              Back to the three directions
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
