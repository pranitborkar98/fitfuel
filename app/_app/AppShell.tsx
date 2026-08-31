"use client";

// app/_app/AppShell.tsx
//
// The persistent chrome every logged-in screen sits inside.
//
// WHY. app/dashboard/layout.tsx was `<>{children}</>`, so there was no shell
// at all: the dashboard was a page of tiles that linked out to nine separate
// pages, each one a dead end you had to press Back out of. That is a website
// pattern. An application keeps its navigation on screen, so every moat the
// backend ships is one tap away from every other.
//
// Sidebar at >=1024px; the shared customer tab bar below it. Dashboard tools
// live in the sidebar and the mobile All tools sheet instead of replacing the
// customer's five top-level destinations.
//
// The More sheet locks body scroll, moves focus in, traps it and restores it
// on close.

import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Zap, Utensils, Dumbbell, Activity, Sparkles, TrendingUp, Pill, Gift,
  Briefcase, Truck, Bell, User, X, LogOut, ShoppingBag,
  LayoutGrid,
  type LucideIcon,
} from "lucide-react";
import { signOut } from "next-auth/react";

import s from "./shell.module.css";
import { NAV, activeHref, type IconName, type NavItem } from "./nav";
import CustomerTabBar from "@/app/_web/CustomerTabBar";

const ICONS: Record<IconName, LucideIcon> = {
  Zap, Utensils, Dumbbell, Activity, Sparkles, TrendingUp, Pill, Gift,
  Briefcase, Truck, Bell, User,
};

function Icon({ name, size = 17 }: { name: IconName; size?: number }) {
  const Cmp = ICONS[name];
  return <Cmp size={size} strokeWidth={1.75} aria-hidden="true" />;
}

export default function AppShell({
  children,
  isPartner = false,
}: {
  children: React.ReactNode;
  isPartner?: boolean;
}) {
  const pathname = usePathname() || "";
  const active = activeHref(pathname);
  const [moreOpen, setMoreOpen] = useState(false);

  const sheetRef = useRef<HTMLDivElement | null>(null);
  const restoreRef = useRef<HTMLElement | null>(null);

  const visible = useCallback(
    (i: NavItem) => !i.partnerOnly || isPartner,
    [isPartner],
  );

  /* The sheet closes on the row that was pressed, not in an effect keyed on
     pathname: every row is a Link, so the click is the event, and closing in
     an effect would cascade a render on every navigation. */
  const close = useCallback(() => setMoreOpen(false), []);

  /* Scroll lock, focus move, focus trap, focus restore. */
  useEffect(() => {
    if (!moreOpen) return;

    restoreRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const node = sheetRef.current;
    const focusables = () =>
      Array.from(
        node?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { e.preventDefault(); setMoreOpen(false); return; }
      if (e.key !== "Tab") return;
      const list = focusables();
      if (!list.length) return;
      const first = list[0]!, last = list[list.length - 1]!;
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      restoreRef.current?.focus?.();
    };
  }, [moreOpen]);

  /* The customer tab bar remains top-level. Every workspace capability lives
     here instead of replacing that bar with a second navigation system. */
  const moreItems = NAV.flatMap((g) => g.items).filter(visible);

  return (
    <div className={`fk ${s.shell}`}>

      {/* ── Sidebar, desktop ─────────────────────────────────────────── */}
      <nav className={s.sidebar} aria-label="Application">
        {/* Was condensed 900 UPPERCASE beside a bare lime square — the exact
            style AGENTS.md rejects by name, and the third of four logos on the
            site. The link still goes to /dashboard, because a reader inside the
            app expects the wordmark to return them to their own home rather
            than to the marketing front door. */}
        <Wordmark href="/dashboard" size={20} className={s.brand} title="FitFuel dashboard" />

        {NAV.map((group) => {
          const items = group.items.filter(visible);
          if (!items.length) return null;
          return (
            <div key={group.key}>
              <p className={s.groupLabel}>{group.label}</p>
              {items.map((item) => {
                const on = active === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${s.navRow} ${on ? s.navRowOn : ""}`}
                    aria-current={on ? "page" : undefined}
                  >
                    <Icon name={item.icon} />
                    <span className={s.navLabel}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}

        <Link href="/" className={s.orderCard}>
          <span className={s.orderCardIcon}><ShoppingBag size={18} aria-hidden="true" /></span>
          <span><b>Order food</b><small>Meals and plans from the same kitchen</small></span>
          <ChevronArrow />
        </Link>

        <div className={s.sidebarFoot}>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className={s.signOut}
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main column ──────────────────────────────────────────────── */}
      <div className={s.main}>
        <div className={s.topbar}>
          <span className={s.mobileBrand}><Wordmark href="/dashboard" size={20} title="FitFuel dashboard" /></span>
          <span className={s.workspaceStatus}><i aria-hidden="true" /> Your FitFuel workspace</span>
          <span className={s.topbarActions}>
            <button
              type="button"
              className={s.toolsButton}
              onClick={() => setMoreOpen(true)}
              aria-label="Open all FitFuel tools"
              aria-expanded={moreOpen}
              aria-haspopup="dialog"
            >
              <LayoutGrid size={17} strokeWidth={1.75} aria-hidden="true" />
              <span>All tools</span>
            </button>
            <Link href="/dashboard/profile"><User size={17} aria-hidden="true" /> Profile</Link>
          </span>
        </div>

        <div className={s.content} id="app-main" tabIndex={-1}>{children}</div>
      </div>

      {/* The same five destinations remain visible from storefront to coach. */}
      <CustomerTabBar />

      {/* ── More sheet ───────────────────────────────────────────────── */}
      {moreOpen && (
        <>
          <button
            type="button"
            className={s.scrim}
            aria-label="Close menu"
            onClick={close}
          />
          <div
            ref={sheetRef}
            className={s.sheet}
            role="dialog"
            aria-modal="true"
            aria-labelledby="more-h"
          >
            <div className={s.sheetHead}>
              <h2 id="more-h">All tools</h2>
              <button
                type="button"
                className={s.sheetClose}
                onClick={close}
                aria-label="Close"
              >
                <X size={19} strokeWidth={1.75} />
              </button>
            </div>

            {moreItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`${s.sheetRow} ${active === item.href ? s.sheetRowOn : ""}`}
                onClick={close}
                aria-current={active === item.href ? "page" : undefined}
              >
                <Icon name={item.icon} size={18} />
                <span className={s.sheetRowBody}>
                  <b>{item.label}</b>
                  <span>{item.blurb}</span>
                </span>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={`${s.sheetRow} ${s.sheetSignOut}`}
            >
              <LogOut size={18} strokeWidth={1.75} aria-hidden="true" />
              <span className={s.sheetRowBody}><b>Sign out</b></span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

function ChevronArrow() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}
