import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Check } from "lucide-react";
import PartnerNetwork from "@/app/_kitchen/PartnerNetwork";
import s from "./corporate.module.css";

export const metadata: Metadata = {
  title: "Meals for your workplace",
  alternates: { canonical: "/corporate" },
  description:
    "Plan employee meals with your nearest FitFuel kitchen. Apply for a corporate programme, agree delivery and billing terms, and give employees their own accounts.",
};

export default function CorporatePage() {
  return (
    <div className={s.page}>
      <section className={s.hero}>
        <div>
          <p className={s.eyebrow}>FitFuel for workplaces</p>
          <h1>A lunch programme your team can make their own.</h1>
          <p className={s.deck}>
            Give employees access to goal-based meals and their own food diary.
            We confirm kitchen coverage, delivery arrangements and commercial
            terms for your workplace before the programme starts.
          </p>
          <div className={s.actions}>
            <Link className={s.primary} href="/partners/apply?type=corporate">
              Apply for a team programme{" "}
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <Link href="/contact">Discuss your requirements</Link>
          </div>
          <p className={s.note}>
            Applications require sign-in and a manual review. Submitting one
            does not create an order or charge.
          </p>
        </div>
        <figure className={s.photo}>
          <Image
            src="/images/corporate.jpg"
          alt="Colleagues meeting in an office"
            fill
            sizes="(max-width: 850px) 100vw, 45vw"
            priority
          />
        <figcaption>FitFuel for workplaces</figcaption>
        </figure>
      </section>
      <section className={s.options} aria-labelledby="programme-options">
        <header>
          <h2 id="programme-options">
            Start with the arrangement that fits your team.
          </h2>
          <p>
            Delivery depends on the workplace address and your nearest kitchen.
            Employee discounts and billing terms are confirmed in your proposal.
          </p>
        </header>
        <div className={s.optionGrid}>
          <article>
            <h3>Meals at work</h3>
            <p>
              Discuss team size, working days, dietary preferences and a shared
              delivery point. Employees choose suitable meals from the available
              plans.
            </p>
            <Link href="/partners/apply?type=corporate">
              Plan office meals →
            </Link>
          </article>
          <article>
            <h3>An employee benefit</h3>
            <p>
              Apply for a corporate code with an agreed employee discount.
              Eligible orders can be tracked through the partner dashboard.
            </p>
            <Link href="/partners/apply?type=corporate">
              Set up an employee code →
            </Link>
          </article>
          <article>
            <h3>Digital plans for remote teams</h3>
            <p>
              For employees outside delivery coverage, digital plans offer
              recipes, nutrition information and grocery lists to use at home.
            </p>
            <Link href="/plans/digital">Explore digital plans →</Link>
          </article>
        </div>
      </section>
      <section className={s.process} aria-labelledby="team-onboarding">
        <div>
          <h2 id="team-onboarding">From an enquiry to the first lunch.</h2>
          <p>
            Tell us your company name, workplace address, approximate team size
            and preferred start date. Do not send employee medical records.
          </p>
        </div>
        <ol>
          <li>
            <h3>Apply with your workplace details</h3>
            <p>
              Your application is saved for review. Our team checks service
              availability and discusses the meal arrangement.
            </p>
          </li>
          <li>
            <h3>Agree the terms</h3>
            <p>
              Confirm the employee discount, delivery point, billing arrangement
              and who manages the programme. Invoicing is agreed manually, not
              automatically enabled by an application.
            </p>
          </li>
          <li>
            <h3>Invite employees after approval</h3>
            <p>
              Share your activated code. Employees use their own FitFuel
              accounts to choose meals and keep personal nutrition and activity
              records.
            </p>
          </li>
        </ol>
      </section>
      <aside className={s.privacy}>
        <Check size={24} aria-hidden="true" />
        <div>
          <h2>Personal progress stays personal.</h2>
          <p>
            A corporate partner can see eligible referral orders and configured
            rewards. The partner dashboard does not expose an employee’s private
            food diary, weight measurements or coach conversations.
          </p>
          <Link href="/dashboard-preview">See the employee dashboard →</Link>
        </div>
      </aside>
      <PartnerNetwork />
      <section className={s.close}>
        <h2>Tell us where your team works.</h2>
        <p>
          We will review the address and programme requirements before agreeing
          a start date.
        </p>
        <Link className={s.primary} href="/partners/apply?type=corporate">
          Start your corporate application{" "}
          <ArrowUpRight size={18} aria-hidden="true" />
        </Link>
      </section>
    </div>
  );
}
