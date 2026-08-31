import Link from "next/link";
import { Bot, ChefHat, MapPin, MessageCircle, Scale, Truck } from "lucide-react";

import Wordmark from "@/components/Wordmark";
import { waLink } from "@/lib/site";
import { TRIAL_TOTAL_LABEL } from "@/lib/trial-price";
import s from "./Footer.module.css";

const GROUPS = [
  {
    title: "Order",
    links: [
      ["Single meals", "/#catalog"], ["Meal plans", "/plans"],
      ["Trial day", "/plans?trial=true"], ["Digital plans", "/plans/digital"],
      ["Supplements", "/supplements"],
    ],
  },
  {
    title: "Why FitFuel",
    links: [
      ["How it works", "/how-it-works"], ["Results", "/results"],
      ["Customer stories", "/testimonials"], ["Our kitchen", "/our-kitchen"],
      ["Ingredients", "/our-ingredients"], ["Delivery areas", "/locations"],
    ],
  },
  {
    title: "Use the platform",
    links: [
      ["AI coach", "/dashboard/trainer"], ["Your dashboard", "/dashboard"],
      ["Calculate your target", "/tdee-calculator"], ["Corporate wellness", "/corporate"],
      ["Partner with us", "/partners"], ["Questions", "/faq"],
    ],
  },
] as const;

const LEGAL = [
  ["Privacy", "/privacy"], ["Terms", "/terms"], ["Refunds", "/refund-policy"],
  ["Allergens", "/allergen-policy"], ["Medical scope", "/medical-disclaimer"],
] as const;

export default function Footer() {
  return (
    <footer className={s.footer}>
      <section className={s.close} aria-labelledby="footer-title">
        <div>
          <p>Start with the food</p>
          <h2 id="footer-title">Tomorrow can already be planned.</h2>
          <span>Try breakfast and lunch for {TRIAL_TOTAL_LABEL}, or order a single meal tonight.</span>
        </div>
        <div className={s.closeActions}>
          <Link href="/plans?trial=true">Start the trial</Link>
          <Link href="/#catalog">See today’s meals</Link>
        </div>
      </section>

      <div className={s.wrap}>
        <div className={s.grid}>
          <div className={s.brand}>
            <Wordmark size="1.75rem" />
            <p>Chef-cooked meals connected to your nutrition target, delivery and daily coaching.</p>
            <ul className={s.operation} aria-label="What FitFuel operates">
              <li><Scale size={18} aria-hidden="true" /><span><b>Weighed</b><small>for your portion</small></span></li>
              <li><ChefHat size={18} aria-hidden="true" /><span><b>Cooked</b><small>in Kharadi</small></span></li>
              <li><Truck size={18} aria-hidden="true" /><span><b>Delivered</b><small>by our riders</small></span></li>
            </ul>
            <div className={s.contact}>
              <a href={waLink()} target="_blank" rel="noreferrer"><MessageCircle size={18} aria-hidden="true" /> WhatsApp FitFuel</a>
              <span><MapPin size={18} aria-hidden="true" /> Kharadi, Pune</span>
            </div>
          </div>

          {GROUPS.map((group) => (
            <nav key={group.title} className={s.group} aria-label={group.title}>
              <h3>{group.title}</h3>
              {group.links.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
            </nav>
          ))}

          <aside className={s.coach}>
            <span className={s.coachIcon}><Bot size={22} aria-hidden="true" /></span>
            <p>FitFuel AI coach</p>
            <h3>Ask what to eat next.</h3>
            <span>It reads your logged meals and targets before answering.</span>
            <Link href="/dashboard/trainer">Open the coach</Link>
          </aside>
        </div>

        <div className={s.base}>
          <div>
            <b>FSSAI 21523035002815</b>
            <span>© {new Date().getFullYear()} FitFuel, Pune · GST included where applicable.</span>
          </div>
          <nav aria-label="Legal information">
            {LEGAL.map(([label, href]) => <Link key={href} href={href}>{label}</Link>)}
          </nav>
        </div>

        <p className={s.disclosure}>
          Food images are illustrative and may include AI-generated imagery. Dish names, ingredients,
          macros and prices are product data. <Link href="/terms#imagery">How imagery is used</Link>.
        </p>
      </div>
    </footer>
  );
}
