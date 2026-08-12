"use client";

// app/_shop/Chrome.tsx
//
// The shop's own chrome: the header, the bottom tab bar, the sticky order bar
// and the four-column footer.
//
// THE HOMEPAGE CARRIES ITS OWN CHROME, and has since the v2 design. The
// prototype draws a header with the wordmark, a search field, the basket, a six
// item nav and a live cut-off strip, and a footer with four link columns and the
// kitchen's facts. Those are part of the composition, so components/ChromeGate
// skips the site navbar and footer on "/" and this file is what stands in their
// place. Every other route keeps the site chrome untouched.
//
// The tab bar is the piece the prototype added that the site did not have. Six
// tabs, because the corporate screen was previously unreachable from the phone
// layout at all. It is real navigation — <Link>s to real routes, not screen
// state — so every tab is a shareable URL, crawlable, and works with the back
// button. That is the one place this implementation deliberately differs from
// the prototype, and it differs because the prototype is one page and the site
// is forty.

import Link from "next/link";
import { useEffect, useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import { rs, FOOTER_COLS, DELIVERY_AREA_LINE } from "./catalog";
import { C, COND, MONO, SANS, label, num } from "./theme";
import s from "./shop.module.css";

export type Tab = "shop" | "menu" | "plans" | "corporate" | "today" | "account";

const NAV: { key: Tab; label: string; href: string }[] = [
  { key: "shop", label: "Shop", href: "/" },
  { key: "menu", label: "Menu", href: "/menu" },
  { key: "plans", label: "Plans", href: "/plans" },
  { key: "corporate", label: "Corporate", href: "/corporate" },
  { key: "today", label: "Dashboard", href: "/dashboard" },
  { key: "account", label: "Account", href: "/dashboard" },
];

/** Two paths each, stroked not filled, so they sit at the same weight as the
 *  hairlines around them. */
const TAB_ICONS: Record<Tab, [string, string]> = {
  shop: ["m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M9 22V12h6v10"],
  menu: ["M3 3h7v7H3zM14 3h7v7h-7z", "M14 14h7v7h-7zM3 14h7v7H3z"],
  plans: ["M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7z", "M14 2v5h5M8 13h8M8 17h5"],
  corporate: ["M3 21h18M6 21V8l6-4 6 4v13", "M10 12h4M10 16h4"],
  today: ["M3 3h7v9H3zM14 3h7v5h-7z", "M14 12h7v9h-7zM3 16h7v5H3z"],
  account: ["M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2", "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0"],
};

const TABS: { key: Tab; label: string; href: string }[] = [
  { key: "shop", label: "Shop", href: "/" },
  { key: "menu", label: "Menu", href: "/menu" },
  { key: "plans", label: "Plans", href: "/plans" },
  { key: "corporate", label: "Corp", href: "/corporate" },
  { key: "today", label: "Today", href: "/dashboard" },
  { key: "account", label: "Account", href: "/dashboard" },
];

/* ── The mark ──────────────────────────────────────────────────────────────
   A lime square with the bolt knocked out of it. Square, because radius is 0,
   and the only place lime is used purely as ground. */
export function Mark({ size = 30 }: { size?: number }) {
  return (
    <span style={{ width: size, height: size, background: C.lime, display: "grid", placeItems: "center", flex: "none" }}>
      <svg width={Math.round(size * 0.57)} height={Math.round(size * 0.57)} viewBox="0 0 24 24" fill={C.bg} aria-hidden="true">
        <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
      </svg>
    </span>
  );
}

function Wordmark({ size = 18 }: { size?: number }) {
  return (
    <span style={{ fontFamily: SANS, fontSize: size, fontWeight: 800, letterSpacing: "-0.025em", color: C.ink }}>
      Fit<span style={{ color: C.lime }}>Fuel</span>
    </span>
  );
}

/* ── The 9pm cut-off, live ────────────────────────────────────────────────
   Renders as dashes on the server and takes its first real value on the next
   frame, so the markup React hydrates against cannot disagree with the clock.
   Same contract the v2 hero used. */
function useCountdown(): string {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    const first = requestAnimationFrame(() => setNow(Date.now()));
    const tick = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      cancelAnimationFrame(first);
      clearInterval(tick);
    };
  }, []);

  if (now === null) return "--:--:--";
  const ist = new Date(now + (5.5 * 60 + new Date().getTimezoneOffset()) * 60000);
  let ms = (21 - ist.getHours()) * 3600000 - ist.getMinutes() * 60000 - ist.getSeconds() * 1000;
  if (ms < 0) ms += 86400000;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(Math.floor(ms / 3600000))}:${p(Math.floor(ms / 60000) % 60)}:${p(Math.floor(ms / 1000) % 60)}`;
}

/* ── Header ─────────────────────────────────────────────────────────────── */

export function ShopHeader({ active, waHref }: { active: Tab; waHref: string }) {
  const cart = useCart();
  const countdown = useCountdown();
  const [query, setQuery] = useState("");

  return (
    <header style={{ position: "sticky", top: 0, zIndex: 40, background: C.bg, borderBottom: `1px solid ${C.rule}` }}>
      <div className={s.shell} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", minHeight: 56 }}>
        <Link href="/" aria-label="FitFuel, home" style={{ display: "flex", alignItems: "center", gap: 9, minHeight: 44, flex: "none", textDecoration: "none" }}>
          <Mark />
          <Wordmark />
        </Link>

        {/* Search is a real form: it submits to /menu, which is the surface that
            can actually filter 48 dishes. A search box that only filters the
            section you are already looking at is a decoration. */}
        <form
          action="/menu"
          style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: C.panel, border: `1px solid ${C.rule}`, padding: "0 10px", minHeight: 38 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={C.dim} strokeWidth="2" aria-hidden="true">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            name="q"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search 48 dishes, 126 plans"
            aria-label="Search the menu and the plans"
            style={{ flex: 1, minWidth: 0, background: "transparent", border: 0, outline: "none", color: C.ink, fontFamily: SANS, fontSize: 13 }}
          />
        </form>

        <button
          type="button"
          onClick={() => cart.setOpen(true)}
          aria-label={cart.badgeCount ? `Your order, ${cart.badgeCount} items` : "Your order"}
          style={{ position: "relative", flex: "none", display: "grid", placeItems: "center", width: 44, height: 44, background: "transparent", border: `1px solid ${C.rule2}`, cursor: "pointer", color: C.ink }}
        >
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <path d="M3 6h18" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cart.hydrated && cart.badgeCount > 0 && (
            <span style={{ position: "absolute", top: -1, right: -1, minWidth: 17, height: 17, padding: "0 3px", background: C.lime, color: C.bg, ...num(10.5), display: "grid", placeItems: "center" }}>
              {cart.badgeCount}
            </span>
          )}
        </button>
      </div>

      <nav className={`${s.shell} ${s.topnav}`} aria-label="Shop sections" style={{ alignItems: "center", gap: 2, padding: "0 16px 6px" }}>
        {NAV.map((t) => {
          const on = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={on ? "page" : undefined}
              style={{
                flex: "none", display: "grid", placeItems: "center", minHeight: 38, padding: "0 13px",
                borderBottom: `2px solid ${on ? C.lime : "transparent"}`, textDecoration: "none",
                fontFamily: COND, fontWeight: 800, fontSize: 14, letterSpacing: "0.05em",
                textTransform: "uppercase", color: on ? C.ink : C.dim,
              }}
            >
              {t.label}
            </Link>
          );
        })}
        <a
          href={waHref}
          target="_blank"
          rel="noopener noreferrer"
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 7, minHeight: 38, padding: "0 14px", border: `1px solid ${C.rule2}`, color: C.ink, textDecoration: "none", fontFamily: COND, fontWeight: 800, fontSize: 13.5, letterSpacing: "0.05em", textTransform: "uppercase" }}
        >
          Talk to the kitchen
        </a>
      </nav>

      <div className={s.shell} style={{ display: "flex", alignItems: "center", gap: 8, padding: "0 16px 9px", ...label(10.5, { letterSpacing: "0.14em" }) }}>
        <span aria-hidden="true" className={s.pulse} style={{ width: 6, height: 6, background: C.lime, flex: "none" }} />
        <span style={{ color: C.ink }}>Kharadi</span>
        <span>· 9pm cut-off in</span>
        <span suppressHydrationWarning style={{ color: C.ink, fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
          {countdown}
        </span>
        <Link href="/locations" className={s.under} style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", minHeight: 44, paddingLeft: 8, color: C.lime, textDecoration: "none" }}>
          Change
        </Link>
      </div>
    </header>
  );
}

/* ── Bottom bar: the order strip, then the tabs ───────────────────────────── */

export function ShopTabs({ active }: { active: Tab }) {
  const cart = useCart();
  const show = cart.hydrated && cart.totals.count > 0;

  return (
    <div style={{ position: "fixed", left: "50%", transform: "translateX(-50%)", bottom: 0, zIndex: 50, width: "100%", maxWidth: 940 }}>
      {show && (
        <button
          type="button"
          onClick={() => cart.setOpen(true)}
          className={s.up}
          style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, width: "100%", minHeight: 52, padding: "0 16px", background: C.lime, border: 0, color: C.bg, cursor: "pointer" }}
        >
          <span style={{ fontFamily: COND, fontWeight: 900, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase" }}>
            {cart.totals.count} {cart.totals.count === 1 ? "dish in order" : "dishes in order"}
          </span>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 14, fontVariantNumeric: "tabular-nums" }}>
            {rs(cart.totals.subtotalRs)} →
          </span>
        </button>
      )}

      <nav className={s.tabs} aria-label="Shop" style={{ background: C.panel, borderTop: `1px solid ${C.rule}`, paddingBottom: "env(safe-area-inset-bottom)" }}>
        {TABS.map((t) => {
          const on = t.key === active;
          return (
            <Link
              key={t.key}
              href={t.href}
              aria-current={on ? "page" : undefined}
              style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, minHeight: 60, textDecoration: "none", borderTop: `2px solid ${on ? C.lime : "transparent"}`, color: on ? C.lime : C.dim }}
            >
              <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" aria-hidden="true">
                <path d={TAB_ICONS[t.key][0]} />
                <path d={TAB_ICONS[t.key][1]} />
              </svg>
              <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", textTransform: "uppercase" }}>{t.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

/* ── Footer ─────────────────────────────────────────────────────────────── */

export function ShopFooter({ licence }: { licence: string }) {
  const facts: [string, string][] = [
    ["Kitchen", "Kharadi, Pune 411014"],
    ["FSSAI licence", licence],
    ["Order cut-off", "9:00 pm, delivery 08:00"],
    ["WhatsApp", "+91 88504 46348"],
  ];

  return (
    <footer style={{ marginTop: 52, borderTop: `1px solid ${C.rule2}`, background: C.panel }}>
      <div className={s.shell} style={{ padding: "26px 16px 0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
          <Mark size={26} />
          <Wordmark size={16} />
        </div>
        <p style={body12}>
          One kitchen in Kharadi cooking 48 dishes and 126 plans to weighed macros, delivered six mornings a week
          across fifteen areas of east Pune.
        </p>
      </div>

      <div className={`${s.two}`} style={{ display: "grid", gap: 1, background: C.rule, borderTop: `1px solid ${C.rule}`, borderBottom: `1px solid ${C.rule}`, marginTop: 22 }}>
        {FOOTER_COLS.map((col) => (
          <div key={col.title} style={{ padding: 16, background: C.panel }}>
            <span style={{ display: "block", ...label(10, { letterSpacing: "0.2em", color: C.lime }), marginBottom: 12 }}>{col.title}</span>
            <div style={{ display: "flex", flexDirection: "column" }}>
              {col.links.map((l) => (
                <Link
                  key={l.label}
                  href={l.href}
                  className={s.under}
                  style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, minHeight: 44, textDecoration: "none", fontFamily: SANS, fontSize: 13, color: C.mute }}
                >
                  <span>{l.label}</span>
                  <span style={{ fontFamily: MONO, fontSize: 12, letterSpacing: "0.06em", color: C.dim }}>{l.meta}</span>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className={s.shell} style={{ padding: "18px 16px 0" }}>
        <div className={s.two} style={{ display: "grid", gap: 1, background: C.rule, border: `1px solid ${C.rule}` }}>
          {facts.map(([k, v]) => (
            <span key={k} style={{ padding: "12px 11px", background: C.panel }}>
              <span style={{ display: "block", ...label(10, { letterSpacing: "0.16em" }) }}>{k}</span>
              <b style={{ display: "block", marginTop: 7, ...num(12) }}>{v}</b>
            </span>
          ))}
        </div>
      </div>

      <div className={s.shell} style={{ padding: 16 }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.12em", color: C.dim }), lineHeight: 1.9 }}>
          Delivering to {DELIVERY_AREA_LINE}
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 14, paddingTop: 14, borderTop: `1px solid ${C.rule}`, ...label(10, { letterSpacing: "0.1em" }) }}>
          <span>© {new Date().getFullYear()} FitFuel Foods</span>
          <Link href="/terms" className={s.under} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "inherit", textDecoration: "none" }}>Terms</Link>
          <Link href="/privacy" className={s.under} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "inherit", textDecoration: "none" }}>Privacy</Link>
          <Link href="/refund-policy" className={s.under} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "inherit", textDecoration: "none" }}>Refunds</Link>
          <Link href="/faq" className={s.under} style={{ display: "inline-flex", alignItems: "center", minHeight: 44, color: "inherit", textDecoration: "none" }}>Shipping</Link>
        </div>
      </div>
    </footer>
  );
}

const body12: React.CSSProperties = {
  margin: "12px 0 0",
  fontFamily: SANS,
  fontSize: 12.5,
  lineHeight: 1.6,
  color: C.dim,
  maxWidth: "46ch",
};

/* One mono label opens a section, and nothing else at section level: no serial,
   no bracket, no right-hand caption. The numbered variant was killed by
   name on 2026-07-30 and this is the corrected marker. */
export function SectionLabel({ children, accent = false }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span style={{ display: "block", ...label(10, { letterSpacing: "0.22em", color: accent ? C.lime : C.dim }) }}>
      {children}
    </span>
  );
}
