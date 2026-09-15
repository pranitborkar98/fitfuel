import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PRODUCT_SERVICES } from "@/lib/product-services";
import PartnerNetwork from "@/app/_kitchen/PartnerNetwork";
import s from "../corporate/corporate.module.css";

export const metadata: Metadata = {
  title: "Explore FitFuel services",
  description:
    "Meals, digital plans, nutrition tracking, training, coaching, supplements and programmes for workplaces and partners.",
  alternates: { canonical: "/services" },
};

export default function ServicesPage() {
  return (
    <div className={s.page}>
      <header className={s.hero}>
        <div>
          <p className={s.eyebrow}>The FitFuel product</p>
          <h1>Eat, track and plan your next day.</h1>
          <p className={s.deck}>
            Delivered meals are one part of FitFuel. Find the tools for your own
            routine, or bring a meal programme to your workplace or community.
          </p>
          <Link className={s.primary} href="/dashboard-preview">
            Explore the dashboard <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <aside className={s.close}>
          <h2>One account for your routine.</h2>
          <p>
            Your food diary, workouts, measurements, meal plan and orders are
            accessible from Today. Start with the tools you need; add a
            delivered or digital plan when it suits you.
          </p>
          <Link href="/dashboard">Open my dashboard →</Link>
        </aside>
      </header>
      <section className={s.options} aria-label="FitFuel services">
        <div className={s.optionGrid}>
          {PRODUCT_SERVICES.map((service) => (
            <article key={service.title}>
              <p className={s.eyebrow}>{service.availability}</p>
              <h2 style={{ fontSize: 26 }}>{service.title}</h2>
              <p>{service.detail}</p>
              <Link href={service.href}>
                {service.action}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </article>
          ))}
        </div>
      </section>
      <PartnerNetwork />
    </div>
  );
}
