"use client";

// components/WhatsAppOrder.tsx
//
// THE MISSING BUTTON. India orders food on WhatsApp, and this site had no
// WhatsApp order path anywhere on the homepage — only a "contact us" link in
// the footer. For a Pune food business that is the single largest conversion
// leak on the page: the customer who will not fill in a checkout form at 9pm
// will absolutely send a message.
//
// WhatsApp green rather than brand lime, deliberately. This is one of the few
// places a foreign brand colour earns its place: the green IS the affordance,
// recognised in under a second, and recolouring it to lime would cost more in
// recognition than it gains in consistency. Black on #25D366 is 9.4:1.
//
// The number and the deep link come from lib/site.ts, which exists because
// eight files once held their own copy and four of them pointed at a dead
// number for a month — including checkout, the money path.
//
// It appears after the first screen so it never covers the hero CTA, and it
// hides itself near the page bottom so it cannot sit on top of the footer's
// own actions.

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";

import { waLink } from "@/lib/site";

const PREFILL =
  "Hi FitFuel, I'd like to order. Can you tell me which plans deliver to my area?";

export default function WhatsAppOrder() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const doc = document.documentElement;
      const nearBottom = y + window.innerHeight > doc.scrollHeight - 520;
      setShow(y > window.innerHeight * 0.85 && !nearBottom);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <a
        href={waLink(PREFILL)}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Order on WhatsApp"
        data-show={show ? "1" : "0"}
        className="ff-wa"
      >
        <MessageCircle size={20} aria-hidden="true" />
        <span>Order on WhatsApp</span>
      </a>

      <style>{`
        .ff-wa {
          position: fixed;
          right: clamp(14px, 3vw, 28px);
          bottom: clamp(14px, 3vw, 28px);
          z-index: 60;
          display: inline-flex;
          align-items: center;
          gap: 10px;
          background: #25d366;
          color: #06140b;
          font-family: var(--font-archivo), system-ui, sans-serif;
          font-weight: 600;
          font-size: 15px;
          letter-spacing: 0;
          text-transform: none;
          padding: 14px 20px;
          min-height: 52px;
          border: 1px solid #25d366;
          text-decoration: none;
          box-shadow: 0 10px 34px -12px rgba(0,0,0,0.9);
          opacity: 0;
          transform: translateY(14px) scale(0.96);
          pointer-events: none;
          transition: opacity .28s cubic-bezier(.16,1,.3,1), transform .28s cubic-bezier(.16,1,.3,1), background .16s linear;
        }
        .ff-wa[data-show="1"] { opacity: 1; transform: none; pointer-events: auto; }
        .ff-wa:hover { background: #34e57a; }
        .ff-wa:focus-visible { outline: 3px solid #a3e635; outline-offset: 3px; }
        /* On a phone the label costs more room than it earns; the mark is
           already unambiguous, so it collapses to a square tap target. */
        @media (max-width: 560px) {
          .ff-wa { padding: 0; width: 56px; height: 56px; justify-content: center; }
          .ff-wa span { display: none; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ff-wa { transition-duration: .01ms; }
        }
      `}</style>
    </>
  );
}
