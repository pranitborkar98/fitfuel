import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Check, Link2, QrCode, ReceiptText, WalletCards } from "lucide-react";

import { ATTRIBUTION, INTEGRATIONS, PAYOUT_TERMS, PROGRAMS } from "@/lib/partner-network";

import styles from "./partners.module.css";

export const metadata: Metadata = {
  title: "Partner programme",
  description:
    "Tracked FitFuel referral programmes for gyms, trainers, creators, practitioners, companies and societies, with first-touch attribution and visible payout records.",
  alternates: { canonical: "/partners" },
};

const APPLY_PROGRAMS = PROGRAMS.filter((program) => program.type !== "CUSTOMER");
const CUSTOMER_PROGRAM = PROGRAMS.find((program) => program.type === "CUSTOMER")!;
const LIVE_INTEGRATIONS = INTEGRATIONS.filter((integration) => integration.status === "LIVE");
const REWARD_MODELS = new Set(PROGRAMS.map((program) => program.reward)).size;

export default function PartnersPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroGrid}>
          <div>
            <p className={styles.kicker}>FitFuel partner programme</p>
            <h1>Turn an introduction into a conversion you can see.</h1>
            <p className={styles.deck}>
              Approved partners get a code, a landing page and a QR. First touch stays with the customer through checkout, and the paid conversion appears in the partner console with its reward and payout status.
            </p>
            <div className={styles.heroActions}>
              <Link className={styles.primaryAction} href="/partners/apply">Apply to partner <ArrowRight aria-hidden="true" size={18} /></Link>
              <Link className={styles.secondaryAction} href="/contact">Talk to FitFuel</Link>
            </div>
          </div>

          <aside className={styles.signalCard} aria-label="The partner tracking loop">
            <div><QrCode aria-hidden="true" /><span><strong>Share</strong>Your code, page or printable QR.</span></div>
            <div><Link2 aria-hidden="true" /><span><strong>Attribute</strong>A verified first touch is attached to the account and order.</span></div>
            <div><ReceiptText aria-hidden="true" /><span><strong>See the conversion</strong>The first paid order becomes a partner record.</span></div>
            <div><WalletCards aria-hidden="true" /><span><strong>Reconcile</strong>Cash rewards roll into a monthly payout row.</span></div>
          </aside>
        </div>

        <div className={styles.factBar} aria-label="Partner programme facts">
          <div><strong>{APPLY_PROGRAMS.length}</strong><span>programmes open to applications</span></div>
          <div><strong>{REWARD_MODELS}</strong><span>reward models supported</span></div>
          <div><strong>30 days</strong><span>first-touch browser window</span></div>
          <div><strong>Manual</strong><span>approval before a code goes live</span></div>
        </div>
      </section>

      <section className={styles.programmes}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>Choose the relationship</p>
            <h2>One tracking system, different commercial models.</h2>
          </div>
          <p>The exact reward value is stored on the approved partner account. The labels below describe the model, not a guaranteed quote before review.</p>
        </div>

        <div className={styles.programmeGrid}>
          {APPLY_PROGRAMS.map((program) => (
            <article key={program.type} className={styles.programmeCard}>
              <div>
                <p>{program.rewardLine}</p>
                <h3>{program.label}</h3>
              </div>
              <p>{program.who}</p>
              <div className={styles.gets}><Check aria-hidden="true" size={17} /><span>{program.gets}</span></div>
              <Link href={`/partners/apply?type=${program.type.toLowerCase()}`}>Apply for this programme <ArrowRight aria-hidden="true" size={16} /></Link>
            </article>
          ))}
        </div>

        <aside className={styles.customerReferral}>
          <div>
            <p className={styles.kicker}>Already a customer?</p>
            <h2>{CUSTOMER_PROGRAM.label} do not need to apply.</h2>
            <span>{CUSTOMER_PROGRAM.gets}</span>
          </div>
          <Link className={styles.secondaryAction} href="/dashboard/referrals">Open my referral page</Link>
        </aside>
      </section>

      <section className={styles.attribution}>
        <div className={styles.attributionIntro}>
          <p className={styles.kicker}>How attribution works</p>
          <h2>Records at the hand-offs that matter.</h2>
          <p>We describe the mechanism as it runs today: browser first touch, verified account attribution, paid conversion and payout record.</p>
        </div>
        <ol>
          {ATTRIBUTION.map((step) => (
            <li key={step.n}>
              <span>{Number(step.n)}</span>
              <div><h3>{step.title}</h3><p>{step.body}</p><small>{step.backed}</small></div>
            </li>
          ))}
        </ol>
      </section>

      <section className={styles.proofSection}>
        <div className={styles.sectionHead}>
          <div>
            <p className={styles.kicker}>Connected services</p>
            <h2>Only integrations with live product code are listed here.</h2>
          </div>
        </div>
        <div className={styles.integrationGrid}>
          {LIVE_INTEGRATIONS.map((integration) => (
            <article key={integration.name}>
              <p>{integration.role}</p>
              <h3>{integration.name}</h3>
              <span>{integration.detail}</span>
              <small><Check aria-hidden="true" size={14} /> Connected</small>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.termsSection}>
        <div>
          <p className={styles.kicker}>Commercial terms</p>
          <h2>Read the operating rules before you apply.</h2>
        </div>
        <dl>
          {PAYOUT_TERMS.map(([term, description]) => (
            <div key={term}><dt>{term}</dt><dd>{description}</dd></div>
          ))}
        </dl>
      </section>

      <section className={styles.close}>
        <div>
          <p className={styles.kicker}>Applications are reviewed by a person</p>
          <h2>Tell us who you serve and how you want the relationship to work.</h2>
          <p>We verify the details, agree the reward model and activate the code only after approval.</p>
          <div className={styles.heroActions}>
            <Link className={styles.primaryAction} href="/partners/apply">Start an application <ArrowRight aria-hidden="true" size={18} /></Link>
            <Link className={styles.secondaryAction} href="/corporate">Explore corporate meals</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
