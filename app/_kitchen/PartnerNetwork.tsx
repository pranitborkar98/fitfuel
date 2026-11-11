import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Dumbbell,
  Store,
  UserRound,
} from "lucide-react";
import { PUBLIC_PARTNERS } from "@/lib/public-partners";
import {
  PLACEHOLDER_LOGO_GROUPS,
  type LogoRowIcon,
} from "@/lib/partner-logo-rows";
import s from "./product-network.module.css";

/* One generic glyph per placeholder category. Lucide inline SVGs, not brand
   marks: the tiles are placeholders, so they carry a category glyph and a
   category word, never a company logo. */
const ROW_ICONS: Record<LogoRowIcon, typeof Dumbbell> = {
  dumbbell: Dumbbell,
  building: Building2,
  trainer: UserRound,
  storefront: Store,
};

/* Merged 2026-11-11 (homepage-fix-partners): the partner cards and the
   logo wall below them said the same thing twice, so they are one section
   now. One heading, one lede, then the logo rows themselves: the one real
   Nutrabay tile first, then the four placeholder groups, each carrying
   its own apply link on its header row. Nothing the cards said is lost
   that the rows do not carry: the apply links moved onto the groups, the
   franchise note and the disclosure stay word for word. */
export default function PartnerNetwork() {
  /* The one real partner. Its status and link come from PUBLIC_PARTNERS, so
     the tile can never drift from the public partner record. Text wordmark
     only: no Nutrabay logo file exists in the repo. */
  const nutrabay = PUBLIC_PARTNERS.find((p) => p.name === "Nutrabay")!;
  return (
    <section className={s.network} aria-labelledby="partner-network-title">
      <header className={s.sectionHead}>
        <div>
          <h2 id="partner-network-title">Supplements, gyms and workplaces</h2>
          <p>
            Our supplement retailer and the partner programmes we are building
            around your daily routine. A tile that says your logo here is an
            open place, not a signed partner.
          </p>
        </div>
        <Link href="/partners">
          Partner with FitFuel <ArrowUpRight size={17} aria-hidden="true" />
        </Link>
      </header>
      <div className={s.logoGroup}>
        <div className={s.logoGroupHead}>
          <h3 className={s.logoGroupTitle}>Supplements</h3>
          <Link href={nutrabay.href}>
            {nutrabay.action}
            <ArrowUpRight size={16} aria-hidden="true" />
          </Link>
        </div>
        <ul className={s.logoRow} aria-label="Supplement partner">
          <li className={`${s.logoTile} ${s.logoTileReal}`}>
            <Link
              href={nutrabay.href}
              className={s.logoTileLink}
              aria-label="Nutrabay, affiliate retailer. Browse supplements."
            >
              <span className={s.logoWordmark}>{nutrabay.name}</span>
              <span className={s.logoTileStatus}>{nutrabay.status}</span>
            </Link>
          </li>
        </ul>
      </div>
      {PLACEHOLDER_LOGO_GROUPS.map((group) => {
        const RowIcon = ROW_ICONS[group.icon];
        return (
          <div key={group.key} className={s.logoGroup}>
            <div className={s.logoGroupHead}>
              <h3 className={s.logoGroupTitle}>{group.label}</h3>
              <Link href={group.href}>
                {group.action}
                <ArrowUpRight size={16} aria-hidden="true" />
              </Link>
            </div>
            <ul
              className={s.logoRow}
              aria-label={`${group.label} places coming soon`}
            >
              {Array.from({ length: group.tiles }, (_, i) => (
                <li key={i} className={s.logoTile}>
                  <RowIcon size={20} aria-hidden="true" />
                  <span className={s.logoTileWord}>{group.tileWord}</span>
                  <span className={s.logoTileStatus}>Coming soon</span>
                  <span className={s.logoTileHint}>Your logo here</span>
                </li>
              ))}
            </ul>
            {group.key === "franchise" ? (
              <p className={s.franchiseNote}>
                The operating system that runs its own kitchen is the
                franchise product. The franchise portal is a future phase.
                Enquiries go to the founders via the{" "}
                <Link href="/contact">contact page</Link>.
              </p>
            ) : null}
          </div>
        );
      })}
      <p className={s.disclosure}>
        Gym, company and trainer places are not signed partners or endorsements.
        Nutrabay is linked through an affiliate relationship, not presented as
        an exclusive partnership.
      </p>
    </section>
  );
}
