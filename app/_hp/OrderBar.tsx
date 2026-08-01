// app/_hp/OrderBar.tsx
//
// THE STICKY ORDER BAR. The price and two ways to buy, always in reach.
//
// The page is long and the only order path used to be at the top and the bottom
// of it, which meant a reader who was convinced somewhere in the middle had to
// go looking. This is the whole of the fix: the trial price, the cut-off rule,
// WhatsApp and the order button.
//
// SOLID, NOT FROSTED. The prototype's version carries
// `backdrop-filter: blur(...)`, and DESIGN-FEEDBACK §2.3 killed it on this exact
// element: "Replace with solid #070707 and a 1px #232320 hairline. No
// transparency, no blur." Glassmorphism is on the reject-on-sight list.
//
// NO SLIDE-IN. The prototype animates the bar in on a scroll threshold with
// `transform: translateY(var(--barY))`, which needs a scroll listener, a client
// component and a hydration boundary for a bar that is going to end up visible
// anyway. It is simply there.
//
// THIS REPLACES WhatsAppOrder's floating bubble on the homepage. Two fixed
// elements in the same corner, one a bubble and one a bar, is how a phone
// viewport loses its bottom 140px.
//
// SERVER COMPONENT.

import Link from "next/link";

import s from "./hp.module.css";
import v from "./v2.module.css";
import { waLink } from "@/lib/site";
import { TRIAL_TOTAL_LABEL } from "@/lib/trial-price";
import { cutoffLabel } from "@/lib/order-cutoff";
import { INK, DIM, MONO, sub } from "./theme";

export default function OrderBar() {
  return (
    <div className={v.bar}>
      <div className={v.barIn}>
        <div className={v.barText}>
          <span style={{ ...sub("clamp(18px,2vw,24px)"), whiteSpace: "nowrap" }}>
            Trial day {TRIAL_TOTAL_LABEL}
          </span>
          <span
            style={{
              fontFamily: MONO,
              fontSize: 12,
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              color: DIM,
              whiteSpace: "nowrap",
            }}
          >
            order by <b style={{ color: INK, fontWeight: 700 }}>{cutoffLabel()}</b>, eat at 8am
          </span>
        </div>

        <div className={v.barCta}>
          <a
            href={waLink(
              `Hi FitFuel, I'd like to order the ${TRIAL_TOTAL_LABEL} trial day. Do you deliver to my area?`,
            )}
            target="_blank"
            rel="noopener noreferrer"
            className={s.ghost}
          >
            WhatsApp
          </a>
          <Link href="/plans?trial=true" className={s.btn}>
            Order now
          </Link>
        </div>
      </div>
    </div>
  );
}
