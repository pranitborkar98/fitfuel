"use client";

// app/_cart/CartDrawer.tsx
//
// The basket, as a right-hand drawer. Square corners, hairline rules, one
// lime CTA — the house system, not the rounded-glass drawer every dark SaaS
// site ships.
//
// THE ORDER NOW CLEARS ON A CARD. The header of this file used to say the
// basket "clears through a person on WhatsApp rather than a card form" — true
// only because OrderItem could not hold a dish. The 20260813040000 migration
// fixed that and app/api/orders/dishes signs a real PayU payload, so priced
// dishes are paid for here.
//
// THE WHATSAPP EXIT IS GONE (2026-08-13). It survived one revision as a
// secondary action for the 32 price-on-request dishes, and the owner was right
// to kill it: an order does not leave our own domain to be finished inside
// another company's app. Unpriced dishes now say so in place and stay in the
// basket until a price exists. lib/menu-cart still exports composeOrder() for
// other callers; this drawer no longer uses it.

import { useEffect, useRef, useState } from "react";
import { Minus, Plus, X, CreditCard } from "lucide-react";

import { receipt, DELIVERY_RS, PACKAGING_RS, GST_PERCENT } from "@/lib/menu-cart";
import { useCart } from "./CartProvider";
import DishCheckout from "./DishCheckout";

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function CartDrawer() {
  const { lines, enquiries, totals, open, setOpen, setQty, remove, toggleEnquiry, clear } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  /* Declared ABOVE the Escape effect that closes over it. Left below, it still
     ran (the callback fires after render) but sat in the temporal dead zone at
     the point of capture, which the react-hooks rule rejects and is one edit
     away from being a real crash. */
  const [checkout, setCheckout] = useState(false);

  // Escape closes, focus moves in, background stops scrolling. A drawer that
  // traps neither focus nor scroll is the usual shortcut and it makes the
  // whole page unusable behind it on a phone.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setCheckout(false); setOpen(false); } };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus();
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, setOpen]);

  const empty = lines.length === 0 && enquiries.length === 0;
  /* Only priced lines can be paid for. An enquiry-only basket has a zero
     total, and receipt() charges it no delivery or packaging either. */
  const payable = lines.length > 0;
  const bill = receipt(lines);

  return (
    <>
      <div
        className="ff-cart-scrim"
        data-open={open ? "1" : "0"}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />

      <div
        ref={panel}
        className="ff-cart"
        data-open={open ? "1" : "0"}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
      >
        <header className="ff-cart-head">
          <h2 className="ff-cart-title">Your order</h2>
          <button ref={closeBtn} onClick={() => setOpen(false)} className="ff-cart-x" aria-label="Close order">
            <X size={18} aria-hidden="true" />
          </button>
        </header>

        <div className="ff-cart-body">
          {empty ? (
            <p className="ff-cart-empty">
              Nothing here yet. Add a dish from the menu and it lands in this panel.
            </p>
          ) : (
            <>
              {lines.map((l) => (
                <div key={l.id} className="ff-line">
                  <div className="ff-line-main">
                    <span className="ff-line-name">{l.dish.name}</span>
                    {l.addOn ? <span className="ff-line-addon">+ {l.addOn.what}</span> : null}
                    <span className="ff-line-cat">{l.dish.categoryLabel}</span>
                  </div>

                  <div className="ff-line-side">
                    <span className="ff-line-money">{rs(l.lineRs)}</span>
                    <div className="ff-step">
                      <button onClick={() => setQty(l.id, l.qty - 1)} aria-label={`One fewer ${l.dish.name}`}>
                        <Minus size={13} aria-hidden="true" />
                      </button>
                      <span className="ff-step-n" aria-live="polite">{l.qty}</span>
                      <button onClick={() => setQty(l.id, l.qty + 1)} aria-label={`One more ${l.dish.name}`}>
                        <Plus size={13} aria-hidden="true" />
                      </button>
                    </div>
                    <button className="ff-line-rm" onClick={() => remove(l.id)}>Remove</button>
                  </div>
                </div>
              ))}

              {enquiries.length > 0 && (
                <div className="ff-enq">
                  <h3 className="ff-enq-h">Price on request</h3>
                  <p className="ff-enq-note">
                    The kitchen has not set a price for these yet, so they are not in the
                    total and cannot be paid for. They stay in your basket and become
                    orderable the moment a price is set.
                  </p>
                  {enquiries.map((d) => (
                    <div key={d.id} className="ff-enq-row">
                      <span>{d.name}</span>
                      <button onClick={() => toggleEnquiry(d.id)} className="ff-line-rm">Remove</button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {!empty && (
          <footer className="ff-cart-foot">
            <span className="ff-rec-label">The receipt, before you pay</span>
            <dl className="ff-rec">
              <div>
                <dt>Food, {totals.count} {totals.count === 1 ? "dish" : "dishes"}</dt>
                <dd>{rs(bill.subtotalRs)}</dd>
              </div>
              <div>
                <dt>Delivery</dt>
                <dd>{rs(bill.deliveryRs)}</dd>
              </div>
              <div>
                <dt>Packaging</dt>
                <dd>{rs(bill.packagingRs)}</dd>
              </div>
              <div>
                <dt>GST at {GST_PERCENT}%</dt>
                <dd>{rs(bill.gstRs)}</dd>
              </div>
            </dl>
            <div className="ff-sum">
              <span>Total</span>
              <span className="ff-sum-n">{rs(bill.totalRs)}</span>
            </div>
            <p className="ff-foot-note">
              Delivery {rs(DELIVERY_RS)} and packaging {rs(PACKAGING_RS)} are the single-day rate,
              GST at {GST_PERCENT}% on food. Nothing is added at the door. Coupon codes apply to
              meal plans at checkout, not to single dishes.
            </p>

            {checkout ? (
              <DishCheckout
                lines={lines}
                totalRs={bill.totalRs}
                onCancel={() => setCheckout(false)}
              />
            ) : (
              <>
                {payable ? (
                  <button
                    type="button"
                    onClick={() => setCheckout(true)}
                    className="ff-send"
                  >
                    <CreditCard size={17} aria-hidden="true" />
                    Pay {rs(bill.totalRs)}
                  </button>
                ) : (
                  /* Nothing priced in the basket. There is no WhatsApp exit any
                     more — an order does not leave our own domain to be
                     completed on someone else's app — so this states the truth
                     and keeps the customer here. */
                  <p className="ff-nothing">
                    Nothing here is priced yet, so there is nothing to pay.
                    Add a dish with a price and it becomes an order.
                  </p>
                )}
                <button onClick={clear} className="ff-clear">Clear order</button>
              </>
            )}
          </footer>
        )}
      </div>

      <style>{`
        .ff-cart-scrim {
          position: fixed; inset: 0; z-index: 300; background: rgba(0,0,0,0.66);
          opacity: 0; pointer-events: none; transition: opacity .24s ease;
        }
        .ff-cart-scrim[data-open="1"] { opacity: 1; pointer-events: auto; }

        .ff-cart {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 310;
          width: min(420px, 100vw);
          display: flex; flex-direction: column;
          background: var(--fk-surface);
          border-left: 1px solid var(--fk-line);
          transform: translateX(100%);
          transition: transform .3s cubic-bezier(.16,1,.3,1);
          visibility: hidden;
        }
        .ff-cart[data-open="1"] { transform: none; visibility: visible; }

        .ff-cart-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 22px; border-bottom: 1px solid var(--fk-line); flex-shrink: 0;
        }
        .ff-cart-title {
          margin: 0; font-family: var(--fk-sans); font-weight: 700; font-size: 26px;
          letter-spacing: -0.02em; text-transform: none; color: var(--fk-ink);
        }
        .ff-cart-x {
          background: none; border: 1px solid var(--fk-line); color: var(--fk-ink-2);
          /* 44 square, not 34: the touch minimum, and this is the one
             control a customer hits with a thumb while holding a phone. */
          width: 44px; height: 44px; display: grid; place-items: center; cursor: pointer;
          border-radius: 0; transition: color .15s, border-color .15s;
        }
        .ff-cart-x:hover { color: var(--fk-ink); border-color: var(--fk-line-2); }

        /* The list gets at least 40% of the drawer. It was collapsing to 213px
           of a 720px viewport because the footer (receipt + total + CTA) is
           unbounded and flex was letting it take whatever it wanted — so the
           order you are reviewing was a sliver above a giant receipt. */
        /* THE SPLIT. flex:1 alone gave the list 213px of a 720px screen,
           because the footer (receipt + total + CTA) is ~420px and flex let it
           take its full natural height. A 40vh min-height over-corrected the
           other way: 40vh plus a 60vh footer plus the header exceeds the
           viewport, so the Pay button fell off the bottom.
           min-height:0 lets the list shrink properly, flex:1 1 0 makes it take
           the REMAINING space, and the footer is capped so it can never push
           the list out or overflow the drawer. Both scroll internally.
           (No backticks in here — this whole block lives inside a template
           literal, and one backtick ends the stylesheet mid-rule.) */
        .ff-cart-body {
          flex: 1 1 0; min-height: 0; overflow-y: auto;
          padding: 4px 22px 22px; overscroll-behavior: contain;
        }
        .ff-cart-foot {
          flex: 0 0 auto; max-height: 62%; overflow-y: auto;
          overscroll-behavior: contain;
        }
        .ff-cart-empty {
          font-family: var(--fk-sans); font-size: 14.5px; color: var(--fk-ink-2);
          line-height: 1.6; margin: 26px 0 0;
        }

        .ff-line {
          display: flex; gap: 14px; justify-content: space-between;
          padding: 18px 0; border-bottom: 1px solid var(--fk-line);
        }
        .ff-line-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .ff-line-name {
          font-family: var(--fk-sans); font-weight: 800; font-size: 17px; line-height: 1.1;
          text-transform: none; letter-spacing: -0.01em; color: var(--fk-ink);
        }
        .ff-line-addon, .ff-line-cat {
          font-family: var(--fk-sans); font-size: 12.5px; color: var(--fk-ink-3);
        }
        .ff-line-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .ff-line-money {
          font-family: var(--font-mono), ui-monospace, monospace; font-weight: 700; font-size: 15px;
          color: var(--fk-ink); font-variant-numeric: tabular-nums;
        }
        .ff-step { display: flex; align-items: center; border: 1px solid var(--fk-line); }
        /* 44 square. These were 30 — the quantity steppers are the controls a
           customer taps most in the whole basket, and AGENTS.md pins 44px with
           no exception for "it is only a small button". */
        .ff-step button {
          background: none; border: 0; color: var(--fk-ink-2); cursor: pointer;
          width: 44px; height: 44px; display: grid; place-items: center;
          touch-action: manipulation;
        }
        .ff-step button:hover { color: var(--fk-green); }
        .ff-step-n {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 13px; font-weight: 700;
          color: var(--fk-ink); min-width: 26px; text-align: center;
          border-left: 1px solid var(--fk-line); border-right: 1px solid var(--fk-line);
          line-height: 30px; font-variant-numeric: tabular-nums;
        }
        /* "Remove" was an 18px-tall text hit. It stays visually a text link but
           carries the full 44px target — padding, not type size, so the line
           does not grow. */
        .ff-line-rm {
          background: none; border: 0; padding: 0; cursor: pointer;
          display: inline-flex; align-items: center; min-height: 44px;
          font-family: var(--fk-sans); font-size: 13px; color: var(--fk-ink-3);
          text-decoration: underline; text-underline-offset: 3px;
          touch-action: manipulation;
        }
        .ff-line-rm:hover { color: var(--fk-ink); }

        .ff-enq { margin-top: 26px; border-top: 1px solid var(--fk-line-2); padding-top: 18px; }
        .ff-enq-h {
          margin: 0 0 6px; font-family: var(--fk-sans); font-weight: 800; font-size: 16px;
          text-transform: none; letter-spacing: 0.04em; color: var(--fk-ink-2);
        }
        .ff-enq-note {
          margin: 0 0 12px; font-family: var(--fk-sans); font-size: 12.5px; line-height: 1.55;
          color: var(--fk-ink-3);
        }
        .ff-enq-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 9px 0; font-family: var(--fk-sans); font-size: 13.5px; color: var(--fk-ink-2);
        }

        .ff-cart-foot {
          flex-shrink: 0; border-top: 1px solid var(--fk-line);
          padding: 18px 22px calc(18px + env(safe-area-inset-bottom, 0px));
          background: var(--fk-paper);
        }
        .ff-rec-label {
          display: block; margin-bottom: 12px;
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px;
          letter-spacing: 0.02em; text-transform: none; color: var(--fk-ink-3);
        }
        .ff-rec { margin: 0 0 14px; display: flex; flex-direction: column; gap: 9px; }
        .ff-rec > div {
          display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
        }
        .ff-rec dt {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px;
          letter-spacing: 0.02em; text-transform: none; color: var(--fk-ink-3);
        }
        .ff-rec dd {
          margin: 0; font-family: var(--font-mono), ui-monospace, monospace; font-size: 12.5px;
          font-weight: 700; font-variant-numeric: tabular-nums; color: var(--fk-ink);
        }
        .ff-sum {
          display: flex; align-items: baseline; justify-content: space-between;
          padding-top: 13px; border-top: 1px solid var(--fk-line-2);
          font-family: var(--fk-sans); font-weight: 800; font-size: 18px; text-transform: none;
          color: var(--fk-ink); letter-spacing: 0.02em;
        }
        .ff-sum-n {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 22px; font-weight: 700;
          letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
        }
        .ff-foot-note {
          margin: 10px 0 14px; font-family: var(--fk-sans); font-size: 12px; line-height: 1.55;
          color: var(--fk-ink-3);
        }
        /* THE PRIMARY ACTION, and it has to look like it.
           This was WhatsApp green (#25d366) with no width, which was fine while
           it was an <a> that filled the footer. As a <button> it collapsed to
           its own text — so the pay button rendered a quarter of the width of
           the secondary action beneath it, wearing another company's brand
           colour. Inverted hierarchy, on the one control that takes money. */
        .ff-send {
          display: flex; width: 100%; align-items: center; justify-content: center; gap: 9px;
          background: var(--fk-green); color: var(--fk-on-green);
          border: 1px solid var(--fk-green); text-decoration: none;
          font-family: var(--fk-sans); font-weight: 700; font-size: 16px;
          letter-spacing: 0; text-transform: none; cursor: pointer;
          min-height: 52px; border-radius: 8px; transition: background .15s;
        }
        .ff-send:hover { background: var(--fk-green-deep); border-color: var(--fk-green-deep); }
        .ff-nothing {
          margin: 0; padding: 12px 14px; border-radius: 8px;
          background: var(--fk-warm); border: 1px solid var(--fk-line);
          font-family: var(--fk-sans); font-size: 13.5px; line-height: 1.5;
          color: var(--fk-ink-2);
        }
        .ff-send:focus-visible { outline: 3px solid var(--fk-green-deep); outline-offset: 3px; }
        /* The last sub-44px control in the drawer. Destructive, so it stays
           visually quiet — but a quiet control still has to be hittable. */
        .ff-clear {
          display: flex; align-items: center; justify-content: center;
          width: 100%; min-height: 44px; margin-top: 6px;
          background: none; border: 0; cursor: pointer;
          font-family: var(--fk-sans); font-size: 12.5px; color: var(--fk-ink-3);
          text-decoration: underline; text-underline-offset: 3px; padding: 6px;
        }
        .ff-clear:hover { color: var(--fk-ink-2); }

        @media (prefers-reduced-motion: reduce) {
          .ff-cart, .ff-cart-scrim { transition-duration: .01ms; }
        }
      `}</style>
    </>
  );
}
