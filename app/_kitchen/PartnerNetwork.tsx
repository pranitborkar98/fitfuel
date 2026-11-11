import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { PUBLIC_PARTNERS } from "@/lib/public-partners";
import s from "./product-network.module.css";

export default function PartnerNetwork() {
  return (
    <section className={s.network} aria-labelledby="partner-network-title">
      <header className={s.sectionHead}>
        <div>
          <h2 id="partner-network-title">Supplements, gyms and workplaces.</h2>
          <p>
            Our supplement retailer and the partner programmes we are building
            around your daily routine.
          </p>
        </div>
        <Link href="/partners">
          Partner with FitFuel <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </header>
      <div className={s.partnerGrid}>
        {PUBLIC_PARTNERS.map((partner) => (
          <article
            key={partner.name}
            className={partner.placeholder ? s.placeholder : s.retailer}
          >
            <span className={s.status}>{partner.status}</span>
            <p className={s.role}>{partner.role}</p>
            <h3>{partner.name}</h3>
            <p>{partner.description}</p>
            <Link href={partner.href}>
              {partner.action}
              <ArrowUpRight size={16} aria-hidden="true" />
            </Link>
          </article>
        ))}
      </div>
      <p className={s.disclosure}>
        XYZ names are layout placeholders, not signed partners or endorsements.
        Nutrabay is linked through an affiliate relationship, not presented as
        an exclusive partnership.
      </p>
    </section>
  );
}
