"use client";

// app/_shop/ReturnBand.tsx
//
// The third open.
//
// AGENTS.md: "FitFuel is an application that delivers food, not a website with
// a dashboard attached. Design for the third open, not the first visit." The
// homepage did the opposite. It opened with the same pitch for a person who has
// ordered four weeks running as for someone who had never heard of us: twenty
// sections arguing that the product is worth trying, above the one control a
// returning customer actually wants.
//
// So this is a band that appears ABOVE the pitch, and only for people who have
// been here before. It answers "what was I doing" in one row, and then gets out
// of the way. Everything below it is unchanged.
//
// THREE RULES IT FOLLOWS, all of which cost something to break:
//
// 1. FIRST-TIME VISITORS SEE NOTHING. Not a collapsed version, nothing. A first
//    visit has no state to resume, so a band saying "welcome" would be an empty
//    frame above the hero and a worse LCP for the exact audience the pitch is
//    written for.
//
// 2. IT WAITS FOR HYDRATION. Visit count and basket both live in localStorage,
//    which the server cannot see. Rendering optimistically and correcting on
//    hydration would shove the whole page down a row after first paint. useCart
//    already exposes `hydrated` for this reason; the visit counter uses the same
//    gate rather than inventing a second one.
//
// 3. IT COUNTS THE VISIT ONCE PER DAY. Otherwise a refresh is a visit, "third
//    open" arrives in ninety seconds, and the signal means nothing.

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

import { useCart } from "@/app/_cart/CartProvider";
import { C, COND, MONO, body, ghostBtn, label, solidBtn } from "./theme";

const KEY = "ff:visits";

type Visits = { n: number; last: string };

function read(): Visits {
  if (typeof window === "undefined") return { n: 0, last: "" };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { n: 0, last: "" };
    const v = JSON.parse(raw) as Partial<Visits>;
    return { n: Number(v.n) || 0, last: String(v.last || "") };
  } catch {
    // A corrupt or blocked store is a first visit, not a crash.
    return { n: 0, last: "" };
  }
}

export default function ReturnBand() {
  const { data: session } = useSession();
  const { totals, badgeCount, hydrated, setOpen } = useCart();

  // Starts at 0 so the server render and the first client render agree; the
  // effect below is what makes it true.
  const [visits, setVisits] = useState(0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const prev = read();
    const next: Visits =
      prev.last === today ? prev : { n: prev.n + 1, last: today };
    if (next !== prev) {
      try {
        window.localStorage.setItem(KEY, JSON.stringify(next));
      } catch {
        // Private mode. The band simply will not persist, which is correct.
      }
    }
    queueMicrotask(() => {
      setVisits(next.n);
      setReady(true);
    });
  }, []);

  const name = session?.user?.name?.split(" ")[0] ?? null;
  const returning = visits > 1;
  const hasBasket = hydrated && badgeCount > 0;

  // Nothing to resume and nobody to greet: stay out of the way entirely.
  if (!ready || !hydrated) return null;
  if (!session && !returning && !hasBasket) return null;

  // The strongest available state wins. A signed-in customer with a basket is
  // shown the basket, because that is the thing with an unfinished action in it.
  const mode = hasBasket ? "basket" : session ? "account" : "return";

  const copy = {
    basket: {
      tag: "Unfinished basket",
      head: `${badgeCount} ${badgeCount === 1 ? "item" : "items"}, ₹${totals.subtotalRs.toLocaleString("en-IN")}`,
      sub: "Still here from your last visit. Cut-off is 21:00 for tomorrow morning.",
    },
    account: {
      tag: name ? `Welcome back, ${name}` : "Welcome back",
      head: "Your day",
      sub: "Today's diary, your plan and the week ahead.",
    },
    return: {
      tag: `Visit ${visits}`,
      head: "Pick up where you left off",
      sub: "Straight to the food. The argument for it is further down, if you want it.",
    },
  }[mode];

  return (
    <section
      aria-labelledby="return-band"
      style={{
        borderBottom: `1px solid ${C.rule}`,
        background: C.panel,
        padding: "14px clamp(16px,4vw,40px)",
      }}
    >
      <div
        style={{
          maxWidth: 1240,
          margin: "0 auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div style={{ minWidth: 0 }}>
          <span style={{ ...label(11), display: "block", color: C.lime }}>{copy.tag}</span>
          <h2
            id="return-band"
            style={{
              fontFamily: COND,
              fontWeight: 600,
              fontSize: "clamp(20px,3vw,28px)",
              letterSpacing: "-0.02em",
              textTransform: "none",
              color: C.ink,
              margin: "6px 0 0",
            }}
          >
            {copy.head}
          </h2>
          <p style={body(13, { margin: "5px 0 0", maxWidth: "52ch" })}>{copy.sub}</p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", flex: "none" }}>
          {mode === "basket" && (
            <button type="button" onClick={() => setOpen(true)} style={solidBtn({ minHeight: 44 })}>
              Resume basket
            </button>
          )}
          {mode === "account" && (
            <Link href="/dashboard" style={solidBtn({ minHeight: 44, textDecoration: "none" })}>
              Open the app
            </Link>
          )}
          {mode === "return" && (
            <a href="#shop-aisles" style={solidBtn({ minHeight: 44, textDecoration: "none" })}>
              Back to the food
            </a>
          )}
          {/* The second control is always the other half of the product: an
              account holder gets the shop, everyone else gets the account. */}
          {session ? (
            <a href="#shop-aisles" style={{ ...ghostBtn(), minHeight: 44, textDecoration: "none" }}>
              Order again
            </a>
          ) : (
            <Link href="/dashboard" style={{ ...ghostBtn(), minHeight: 44, textDecoration: "none" }}>
              Sign in
            </Link>
          )}
        </div>
      </div>

      {/* Mono, not a sentence: this is a state readout, and the visit count is
          the one number that explains why the band is here at all. */}
      <p
        style={{
          maxWidth: 1240,
          margin: "10px auto 0",
          fontFamily: MONO,
          fontSize: 12,
          letterSpacing: "0.06em",
          textTransform: "none",
          color: C.dim,
        }}
      >
        {visits > 1 ? `${visits} visits` : "First return"}
        {hasBasket ? ` · basket held` : ""}
        {session ? " · signed in" : ""}
      </p>
    </section>
  );
}
