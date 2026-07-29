"use client";

// app/_cart/CartButton.tsx
//
// The basket trigger in the navbar. Hidden entirely when the basket is empty.
//
// That is deliberate and it is not the e-commerce default. A permanent "0"
// badge on a site whose main product is a subscription would advertise a shop
// on every legal page and every plan page, where there is nothing to put in
// it. It appears the moment a dish is added and then follows you everywhere,
// which is the behaviour that actually matters.
//
// It also renders nothing until the provider has read localStorage, so the
// server markup and the first client paint agree.

import { ShoppingBag } from "lucide-react";

import { useCart } from "./CartProvider";

export default function CartButton() {
  const { badgeCount, hydrated, setOpen } = useCart();

  if (!hydrated || badgeCount === 0) return null;

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="ff-cart-btn"
        aria-label={`Your order, ${badgeCount} ${badgeCount === 1 ? "item" : "items"}`}
      >
        <ShoppingBag size={16} aria-hidden="true" />
        <span className="ff-cart-badge">{badgeCount}</span>
      </button>

      <style>{`
        .ff-cart-btn {
          position: relative; display: inline-flex; align-items: center; gap: 8px;
          background: transparent; border: 1px solid var(--ff-rule-2, #33332f);
          border-radius: 0; padding: 8px 13px; cursor: pointer;
          /* 44px, matching the touch-target floor the navbar already holds
             for the logo and the hamburger. */
          color: var(--ff-ink, #f7f7f5); min-height: 44px;
          transition: border-color .2s, color .2s;
        }
        .ff-cart-btn:hover { border-color: var(--ff-lime, #84cc16); }
        .ff-cart-badge {
          font-family: var(--font-mono), ui-monospace, monospace;
          font-size: 12.5px; font-weight: 700; color: var(--ff-lime, #84cc16);
          font-variant-numeric: tabular-nums; line-height: 1;
        }
      `}</style>
    </>
  );
}
