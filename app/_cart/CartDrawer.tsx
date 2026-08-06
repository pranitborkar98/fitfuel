"use client";

// app/_cart/CartDrawer.tsx
//
// The basket, as a right-hand drawer. Square corners, hairline rules, one
// lime CTA — DESIGN.md's system, not the rounded-glass drawer every dark SaaS
// site ships.
//
// The footer states the two things a customer is entitled to know before they
// commit: delivery is not in this total because no single-meal fee is set,
// and the order clears through a person on WhatsApp rather than a card form.
// Both are true today and both stop being true by editing one block.

import { useEffect, useRef } from "react";
import { Minus, Plus, X, MessageCircle } from "lucide-react";

import { composeOrder, receipt, DELIVERY_RS, PACKAGING_RS, GST_PERCENT } from "@/lib/menu-cart";
import { waLink } from "@/lib/site";
import { useCart } from "./CartProvider";

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function CartDrawer() {
  const { lines, enquiries, totals, open, setOpen, setQty, remove, toggleEnquiry, clear } = useCart();
  const panel = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);

  // Escape closes, focus moves in, background stops scrolling. A drawer that
  // traps neither focus nor scroll is the usual shortcut and it makes the
  // whole page unusable behind it on a phone.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
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
  const href = waLink(composeOrder(lines, enquiries));
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
                    The kitchen has not set a price for these yet, so they are not in the total.
                    They go on the message and we reply with the number.
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

            <a href={href} target="_blank" rel="noopener noreferrer" className="ff-send">
              <MessageCircle size={17} aria-hidden="true" />
              Send order on WhatsApp
            </a>
            <button onClick={clear} className="ff-clear">Clear order</button>
          </footer>
        )}
      </div>

      <style>{`
        .ff-cart-scrim {
          position: fixed; inset: 0; z-index: 80; background: rgba(0,0,0,0.66);
          opacity: 0; pointer-events: none; transition: opacity .24s ease;
        }
        .ff-cart-scrim[data-open="1"] { opacity: 1; pointer-events: auto; }

        .ff-cart {
          position: fixed; top: 0; right: 0; bottom: 0; z-index: 81;
          width: min(420px, 100vw);
          display: flex; flex-direction: column;
          background: var(--ff-panel, #050504);
          border-left: 1px solid var(--ff-rule, #232320);
          transform: translateX(100%);
          transition: transform .3s cubic-bezier(.16,1,.3,1);
          visibility: hidden;
        }
        .ff-cart[data-open="1"] { transform: none; visibility: visible; }

        .ff-cart-head {
          display: flex; align-items: center; justify-content: space-between;
          padding: 20px 22px; border-bottom: 1px solid var(--ff-rule, #232320); flex-shrink: 0;
        }
        .ff-cart-title {
          margin: 0; font-family: var(--ff-cond); font-weight: 900; font-size: 26px;
          letter-spacing: -0.02em; text-transform: uppercase; color: var(--ff-ink, #f7f7f5);
        }
        .ff-cart-x {
          background: none; border: 1px solid var(--ff-rule, #232320); color: var(--ff-mute, #9a9a94);
          /* 44 square, not 34: DESIGN.md's touch minimum, and this is the one
             control a customer hits with a thumb while holding a phone. */
          width: 44px; height: 44px; display: grid; place-items: center; cursor: pointer;
          border-radius: 0; transition: color .15s, border-color .15s;
        }
        .ff-cart-x:hover { color: var(--ff-ink, #f7f7f5); border-color: var(--ff-rule-2, #33332f); }

        .ff-cart-body { flex: 1; overflow-y: auto; padding: 4px 22px 22px; }
        .ff-cart-empty {
          font-family: var(--ff-body); font-size: 14.5px; color: var(--ff-mute, #9a9a94);
          line-height: 1.6; margin: 26px 0 0;
        }

        .ff-line {
          display: flex; gap: 14px; justify-content: space-between;
          padding: 18px 0; border-bottom: 1px solid var(--ff-rule, #232320);
        }
        .ff-line-main { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
        .ff-line-name {
          font-family: var(--ff-cond); font-weight: 800; font-size: 17px; line-height: 1.1;
          text-transform: uppercase; letter-spacing: -0.01em; color: var(--ff-ink, #f7f7f5);
        }
        .ff-line-addon, .ff-line-cat {
          font-family: var(--ff-body); font-size: 12.5px; color: var(--ff-dim, #85857e);
        }
        .ff-line-side { display: flex; flex-direction: column; align-items: flex-end; gap: 8px; flex-shrink: 0; }
        .ff-line-money {
          font-family: var(--font-mono), ui-monospace, monospace; font-weight: 700; font-size: 15px;
          color: var(--ff-ink, #f7f7f5); font-variant-numeric: tabular-nums;
        }
        .ff-step { display: flex; align-items: center; border: 1px solid var(--ff-rule, #232320); }
        .ff-step button {
          background: none; border: 0; color: var(--ff-mute, #9a9a94); cursor: pointer;
          width: 30px; height: 30px; display: grid; place-items: center;
        }
        .ff-step button:hover { color: var(--ff-lime, #84cc16); }
        .ff-step-n {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 13px; font-weight: 700;
          color: var(--ff-ink, #f7f7f5); min-width: 26px; text-align: center;
          border-left: 1px solid var(--ff-rule, #232320); border-right: 1px solid var(--ff-rule, #232320);
          line-height: 30px; font-variant-numeric: tabular-nums;
        }
        .ff-line-rm {
          background: none; border: 0; padding: 0; cursor: pointer;
          font-family: var(--ff-body); font-size: 12px; color: var(--ff-dim, #85857e);
          text-decoration: underline; text-underline-offset: 3px;
        }
        .ff-line-rm:hover { color: var(--ff-ink, #f7f7f5); }

        .ff-enq { margin-top: 26px; border-top: 1px solid var(--ff-rule-2, #33332f); padding-top: 18px; }
        .ff-enq-h {
          margin: 0 0 6px; font-family: var(--ff-cond); font-weight: 800; font-size: 16px;
          text-transform: uppercase; letter-spacing: 0.04em; color: var(--ff-mute, #9a9a94);
        }
        .ff-enq-note {
          margin: 0 0 12px; font-family: var(--ff-body); font-size: 12.5px; line-height: 1.55;
          color: var(--ff-dim, #85857e);
        }
        .ff-enq-row {
          display: flex; align-items: center; justify-content: space-between; gap: 12px;
          padding: 9px 0; font-family: var(--ff-body); font-size: 13.5px; color: var(--ff-mute, #9a9a94);
        }

        .ff-cart-foot {
          flex-shrink: 0; border-top: 1px solid var(--ff-rule, #232320);
          padding: 18px 22px calc(18px + env(safe-area-inset-bottom, 0px));
          background: var(--ff-bg, #070707);
        }
        .ff-rec-label {
          display: block; margin-bottom: 12px;
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px;
          letter-spacing: 0.2em; text-transform: uppercase; color: var(--ff-dim, #85857e);
        }
        .ff-rec { margin: 0 0 14px; display: flex; flex-direction: column; gap: 9px; }
        .ff-rec > div {
          display: flex; align-items: baseline; justify-content: space-between; gap: 12px;
        }
        .ff-rec dt {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 12px;
          letter-spacing: 0.12em; text-transform: uppercase; color: var(--ff-dim, #85857e);
        }
        .ff-rec dd {
          margin: 0; font-family: var(--font-mono), ui-monospace, monospace; font-size: 12.5px;
          font-weight: 700; font-variant-numeric: tabular-nums; color: var(--ff-ink, #f7f7f5);
        }
        .ff-sum {
          display: flex; align-items: baseline; justify-content: space-between;
          padding-top: 13px; border-top: 1px solid var(--ff-rule-2, #33332f);
          font-family: var(--ff-cond); font-weight: 800; font-size: 18px; text-transform: uppercase;
          color: var(--ff-ink, #f7f7f5); letter-spacing: 0.02em;
        }
        .ff-sum-n {
          font-family: var(--font-mono), ui-monospace, monospace; font-size: 22px; font-weight: 700;
          letter-spacing: -0.02em; font-variant-numeric: tabular-nums;
        }
        .ff-foot-note {
          margin: 10px 0 14px; font-family: var(--ff-body); font-size: 12px; line-height: 1.55;
          color: var(--ff-dim, #85857e);
        }
        .ff-send {
          display: flex; align-items: center; justify-content: center; gap: 9px;
          background: #25d366; color: #06140b; text-decoration: none;
          font-family: var(--ff-cond); font-weight: 800; font-size: 16px;
          letter-spacing: 0.05em; text-transform: uppercase;
          min-height: 52px; border-radius: 0; transition: background .15s;
        }
        .ff-send:hover { background: #34e57a; }
        .ff-send:focus-visible { outline: 3px solid var(--ff-lime-light, #a3e635); outline-offset: 3px; }
        .ff-clear {
          display: block; width: 100%; margin-top: 10px; background: none; border: 0; cursor: pointer;
          font-family: var(--ff-body); font-size: 12.5px; color: var(--ff-dim, #85857e);
          text-decoration: underline; text-underline-offset: 3px; padding: 6px;
        }
        .ff-clear:hover { color: var(--ff-mute, #9a9a94); }

        @media (prefers-reduced-motion: reduce) {
          .ff-cart, .ff-cart-scrim { transition-duration: .01ms; }
        }
      `}</style>
    </>
  );
}
