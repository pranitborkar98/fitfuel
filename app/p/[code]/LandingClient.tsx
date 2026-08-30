"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, ChefHat, ClipboardCheck, MapPin, ScanLine } from "lucide-react";
import { useEffect } from "react";
import styles from "./landing.module.css";

const COOKIE_NAME = "ff_ref";
const COOKIE_DAYS = 30;

export type PartnerLandingView = {
  kind: "PARTNER" | "P2P";
  type: string;
  name: string;
  code: string;
  bio?: string | null;
  specialty?: string | null;
  profilePhotoUrl?: string | null;
  socialHandle?: string | null;
  gymAddress?: string | null;
  gymManagerName?: string | null;
  qualification?: string | null;
  clinicName?: string | null;
  hospitalAffiliation?: string | null;
  companyLogoUrl?: string | null;
  societyAddress?: string | null;
  treasurerContact?: string | null;
  refereeDiscountRs: number;
};

const TYPE_LABEL: Record<string, string> = {
  GYM: "Gym partner",
  TRAINER: "Trainer partner",
  INFLUENCER: "Creator partner",
  DIETICIAN: "Dietitian partner",
  DOCTOR: "Clinical partner",
  CORPORATE: "Workplace partner",
  RESIDENCE: "Community partner",
  CUSTOMER: "Customer invitation",
};

function readCookie(name: string): string | null {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name.replace(/[.$?*|{}()[\]\\/+^]/g, "\\$&")}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function writeFirstTouch(code: string): void {
  const maxAge = COOKIE_DAYS * 24 * 60 * 60;
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${COOKIE_NAME}=${encodeURIComponent(code)}; Path=/; Max-Age=${maxAge}; SameSite=Lax${secure}`;
}

function headline(view: PartnerLandingView): string {
  if (view.type === "CORPORATE") return `A better workday lunch, shared by ${view.name}.`;
  if (view.type === "RESIDENCE") return `Fresh meals for the ${view.name} community.`;
  if (view.type === "DIETICIAN" || view.type === "DOCTOR") return `${view.name} shared a practical cooked-meal option.`;
  if (view.type === "GYM" || view.type === "TRAINER") return `${view.name} shared food that can keep up with your training.`;
  return `${view.name} invited you to try FitFuel.`;
}

function introduction(view: PartnerLandingView): string {
  if (view.bio) return view.bio;
  if (view.type === "DIETICIAN" || view.type === "DOCTOR") return "Choose a kitchen-ready meal plan with clear portions and a diary that follows what was actually served.";
  if (view.type === "GYM" || view.type === "TRAINER") return "Pick a cooked meal plan that matches your routine, then track the meals and portions from the same account.";
  if (view.type === "CORPORATE") return "Choose a plan for your working week and have it delivered across FitFuel’s active Pune zones.";
  if (view.type === "RESIDENCE") return "Choose a plan for your week and get fresh meals delivered within FitFuel’s active Pune zones.";
  return "Choose a cooked meal plan, see the food before you order, and track what you actually eat.";
}

function partnerFacts(view: PartnerLandingView): string[] {
  return [
    view.qualification,
    view.specialty,
    view.clinicName,
    view.hospitalAffiliation,
    view.gymAddress,
    view.societyAddress,
    view.socialHandle,
  ].filter((value): value is string => Boolean(value));
}

export default function LandingClient({ view }: { view: PartnerLandingView }) {
  useEffect(() => {
    if (!readCookie(COOKIE_NAME)) writeFirstTouch(view.code);
  }, [view.code]);

  const discount = view.refereeDiscountRs;
  const facts = partnerFacts(view);
  const offer = discount > 0 ? `₹${discount.toLocaleString("en-IN")} off` : "A verified welcome";
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>{TYPE_LABEL[view.type] || "FitFuel partner"}</p>
          <h1>{headline(view)}</h1>
          <p className={styles.deck}>{introduction(view)}</p>
          <div className={styles.offerLine}><span>{offer}</span><p>{discount > 0 ? "your first eligible plan" : `via ${view.name}`}</p></div>
          <div className={styles.actions}>
            <Link className={styles.primaryAction} href={`/plans?ref=${encodeURIComponent(view.code)}`}>Choose a meal plan <ArrowRight aria-hidden="true" size={18} /></Link>
            <Link className={styles.secondaryAction} href={`/plans/digital?ref=${encodeURIComponent(view.code)}`}>See digital plans</Link>
          </div>
          <p className={styles.offerNote}><Check aria-hidden="true" size={16} />Verified at checkout when eligible. If another offer is larger, checkout uses the better discount.</p>
        </div>

        <div className={styles.foodVisual}>
          <Image src="/images/hero-bowl-v2.png" alt="A colourful FitFuel grain bowl with paneer, vegetables and fresh greens" fill priority sizes="(max-width: 820px) 100vw, 48vw" />
          <div className={styles.visualCard}><ChefHat aria-hidden="true" size={19} /><span><strong>Cooked in Pune</strong>Clear portions, delivered meals, matching diary.</span></div>
        </div>
      </section>

      <section className={styles.proofBar} aria-label="FitFuel plan facts">
        <div><strong>Real meals</strong><span>See dishes and portions before choosing.</span></div>
        <div><strong>Verified offer</strong><span>Your referral code is checked on the server.</span></div>
        <div><strong>Pune delivery</strong><span>Serviceability is confirmed at checkout.</span></div>
      </section>

      {view.kind === "PARTNER" && (
        <section className={styles.partnerSection}>
          <div className={styles.partnerIntro}>
            <p className={styles.eyebrow}>Why you are seeing this</p>
            <h2>{view.name} has an active FitFuel partner page.</h2>
            <p>The invitation identifies the partner and carries their code into checkout. It does not give the partner access to your private nutrition diary or health profile.</p>
          </div>
          <div className={styles.partnerCard}>
            {view.profilePhotoUrl
              ? <span aria-hidden="true" className={styles.partnerPhoto} style={{ backgroundImage: `url(${JSON.stringify(view.profilePhotoUrl)})` }} />
              : <span className={styles.partnerInitial}>{view.name.charAt(0).toUpperCase()}</span>}
            <div><strong>{view.name}</strong><small>{TYPE_LABEL[view.type] || "FitFuel partner"}</small>{facts.length > 0 && <ul>{facts.slice(0, 4).map((fact) => <li key={fact}>{fact}</li>)}</ul>}</div>
          </div>
        </section>
      )}

      <section className={styles.stepsSection}>
        <div className={styles.sectionHead}><p className={styles.eyebrow}>From invitation to lunch</p><h2>A short route, with the price checked before payment.</h2></div>
        <ol>
          <li><span><ScanLine aria-hidden="true" /></span><div><strong>Explore the menu</strong><p>Compare actual plans, dishes, meal slots and current prices.</p></div></li>
          <li><span><ClipboardCheck aria-hidden="true" /></span><div><strong>Choose what fits</strong><p>Select the diet, duration and meal schedule you want. FitFuel checks that the kitchen menu is ready.</p></div></li>
          <li><span><MapPin aria-hidden="true" /></span><div><strong>Confirm delivery</strong><p>Enter your Pune address, see the final server-calculated total, then choose PayU or cash on delivery where available.</p></div></li>
        </ol>
      </section>

      <section className={styles.close}>
        <div><p className={styles.eyebrow}>Invitation code {view.code}</p><h2>Start with the food. Keep the tracking if it helps.</h2><p>Browse the plans using this verified invitation, or continue without the offer.</p></div>
        <div className={styles.actions}><Link className={styles.primaryAction} href={`/plans?ref=${encodeURIComponent(view.code)}`}>See meal plans <ArrowRight aria-hidden="true" size={18} /></Link><Link className={styles.secondaryAction} href="/plans">Browse without this offer</Link></div>
      </section>
    </main>
  );
}
