"use client";

// app/_hp/ShopRow.tsx
//
// THE PRODUCT SHELF. The homepage had 77 clickable elements and not one of them
// put anything in a basket — every route to buying was a link to another page
// that would then ask you to decide again. For a food business that is the whole
// ballgame: this band is where the homepage stops describing the menu and starts
// selling off it.
//
// A SCROLL RAIL, NOT A GRID. Hungry.tsx's original note is still right that the
// uniform 3-up grid is the wrong answer, but the conclusion it drew from that —
// fall back to a hairline type table — is what turned this band into more prose
// on a page already made of prose. A snapping rail is the third option: it is
// the native storefront idiom, it holds any number of dishes without reflowing
// the page, and it reads as merchandise rather than as a spec sheet.
//
// The image slot is passed in as a node from the server (Hungry.tsx), because
// DishImage does a filesystem lookup and cannot cross into a client component.
// Until a photograph lands, that node is the dish's macro glyph — which is the
// point of DishImage: this shelf needs no edit at all when the files arrive.
//
// CLIENT COMPONENT: it needs useCart.

import type { ReactNode } from "react";
import { useCart } from "../_cart/CartProvider";
import s from "./hp.module.css";
import { INK, DIM, LIME, MONO, MUTE } from "./theme";

export type ShelfDish = {
  id: string;
  name: string;
  blurb: string;
  /** Null when the kitchen has not set a price. Those dishes are cooked and
   *  listed, so they get an enquiry toggle rather than being hidden. */
  price: number | null;
  categoryLabel: string;
  media: ReactNode;
};

export default function ShopRow({ dishes, label }: { dishes: ShelfDish[]; label: string }) {
  // `hydrated` is false until localStorage has been read. Gating the basket
  // count on it keeps the server render and the first client paint identical,
  // so a returning customer's basket does not cause a hydration mismatch.
  const { add, qtyOf, hydrated, toggleEnquiry, hasEnquiry } = useCart();

  return (
    <ul className={s.shelf} aria-label={label}>
      {dishes.map((d) => {
        const inCart = hydrated ? qtyOf(d.id) : 0;
        const asking = hydrated ? hasEnquiry(d.id) : false;

        return (
          <li key={d.id} className={s.shelfItem}>
            <div className={s.shelfMedia}>{d.media}</div>

            <div className={s.shelfBody}>
              <span
                style={{
                  fontFamily: MONO, fontSize: 10.5, letterSpacing: "0.16em",
                  textTransform: "uppercase", color: DIM,
                }}
              >
                {d.categoryLabel}
              </span>

              <h3
                style={{
                  fontFamily: "var(--fk-display), Georgia, serif", fontWeight: 600,
                  fontSize: "clamp(17px,1.9vw,21px)", lineHeight: 1.05,
                  letterSpacing: "-0.015em", textTransform: "none",
                  color: INK, margin: "9px 0 0",
                }}
              >
                {d.name}
              </h3>

              <p
                style={{
                  fontFamily: "var(--font-archivo), sans-serif", fontSize: 13,
                  lineHeight: 1.5, color: MUTE, margin: "8px 0 0",
                }}
              >
                {d.blurb}
              </p>
            </div>

            <div className={s.shelfFoot}>
              <span
                style={{
                  fontFamily: MONO, fontSize: d.price == null ? 11.5 : 16, fontWeight: 600,
                  color: d.price == null ? DIM : INK, fontVariantNumeric: "tabular-nums",
                  letterSpacing: d.price == null ? "0.1em" : undefined,
                  textTransform: d.price == null ? "uppercase" : undefined,
                }}
              >
                {d.price == null ? "On request" : `₹${d.price}`}
              </span>

              {/* The whole reason this component exists. One tap, no navigation,
                  no second decision screen. Unpriced dishes are cooked and on
                  the menu, so they get an enquiry toggle instead of a price we
                  would not stand behind. */}
              {d.price == null ? (
                <button
                  type="button"
                  onClick={() => toggleEnquiry(d.id)}
                  className={s.shelfAdd}
                  aria-pressed={asking}
                  aria-label={`Ask about ${d.name}`}
                >
                  {asking ? (
                    <>
                      <span aria-hidden style={{ color: LIME }}>✓</span> Asking
                    </>
                  ) : (
                    "Ask"
                  )}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => add(d.id)}
                  className={s.shelfAdd}
                  aria-label={`Add ${d.name} to basket, ₹${d.price}`}
                >
                  {inCart > 0 ? (
                    <>
                      <span aria-hidden style={{ color: LIME }}>✓</span> {inCart} in basket
                    </>
                  ) : (
                    "Add"
                  )}
                </button>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
