// app/_hp/Aggregators.tsx
//
// THE AGGREGATOR STRIP. Zomato and Swiggy as recognisable brand chips rather
// than as two words set in our own condensed display face.
//
// WHY THIS IS DRAWN RATHER THAN DOWNLOADED. A CDN reference would be blocked,
// and copying the official artwork into /public without going through either
// company's merchant brand kit is the kind of thing that gets a listing pulled.
// What is here is a wordmark in each brand's own colour, in a rounded chip that
// reads as their button — enough that a customer recognises the channel at a
// glance, and honest about being ours.
//
// TO USE THE OFFICIAL MARKS: both companies publish partner brand kits to
// registered restaurants. Drop `zomato.svg` and `swiggy.svg` into
// `public/images/brands/` and swap the <span> for an <Image>; the chip, the
// spacing and the hover all stay.
//
// The store URLs are not live yet — when the FitFuel listing URLs exist, set
// ZOMATO_URL and SWIGGY_URL and each chip becomes a real link automatically.
//
// SERVER COMPONENT.

import s from "./hp.module.css";

const ZOMATO_URL: string | null = null;
const SWIGGY_URL: string | null = null;

const BRANDS = [
  { name: "Zomato", colour: "#e23744", href: ZOMATO_URL },
  { name: "Swiggy", colour: "#fc8019", href: SWIGGY_URL },
];

export default function Aggregators() {
  return (
    <div className={s.aggro}>
      {BRANDS.map((b) => {
        const chip = (
          <span className={s.aggroChip} style={{ "--brand": b.colour } as React.CSSProperties}>
            <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
              {/* A plate-and-cutlery glyph, ours, not either company's icon. */}
              <circle cx="12" cy="12" r="9" fill="none" stroke="currentColor" strokeWidth="1.6" />
              <circle cx="12" cy="12" r="4.2" fill="none" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            {b.name}
          </span>
        );

        return b.href ? (
          <a key={b.name} href={b.href} target="_blank" rel="noopener noreferrer" className={s.aggroLink}>
            {chip}
          </a>
        ) : (
          <span key={b.name}>{chip}</span>
        );
      })}
    </div>
  );
}
