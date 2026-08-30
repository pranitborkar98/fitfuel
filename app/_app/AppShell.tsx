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
// Sidebar at >=1024px, bottom tab bar below it, exactly one visible at a time
// (shell.module.css owns the switch). Five tabs plus More.
//
// The More sheet locks body scroll, moves focus in, traps it and restores it
// on close.

import Link from "next/link";
import Wordmark from "@/components/Wordmark";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Zap, Utensils, Dumbbell, Activity, Sparkles, TrendingUp, Pill, Gift,
  Briefcase, Truck, Bell, User, MoreHorizontal, X, LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";

import s from "./shell.module.css";
import { C, label, screen, body, SANS } from "./theme";
import { NAV, TAB_ITEMS, activeHref, type IconName, type NavItem } from "./nav";

const ICONS: Record<IconName, React.ComponentType<{ size?: number; color?: string; strokeWidth?: number }>> = {
  Zap, Utensils, Dumbbell, Activity, Sparkles, TrendingUp, Pill, Gift,
  Briefcase, Truck, Bell, User,
};

function Icon({ name, size = 17, color }: { name: IconName; size?: number; color?: string }) {
  const Cmp = ICONS[name];
  return <Cmp size={size} color={color} strokeWidth={1.75} />;
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

  /* Everything not already on the tab bar, plus the partner console when the
     viewer owns one. This is what More is for: nothing is unreachable. */
  const moreItems = NAV.flatMap((g) => g.items).filter((i) => !i.tab && visible(i));

  return (
    <div className={s.shell}>

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
              <p className={s.groupLabel} style={label(12)}>{group.label}</p>
              {items.map((item) => {
                const on = active === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`${s.navRow} ${on ? s.navRowOn : ""}`}
                    aria-current={on ? "page" : undefined}
                  >
                    <Icon name={item.icon} color={on ? C.lime : C.dim} />
                    <span className={s.navLabel}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}

        <div className={s.sidebarFoot}>
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            style={{ display: "flex", alignItems: "center", gap: 10, minHeight: 44, width: "100%",
                     background: "transparent", border: 0, padding: 0, cursor: "pointer",
                     color: C.dim, fontFamily: SANS, fontWeight: 600, fontSize: 14,
                     letterSpacing: 0, textTransform: "none" }}
          >
            <LogOut size={16} strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Main column ──────────────────────────────────────────────── */}
      <div className={s.main}>
        <div className={s.topbar}>
          <Wordmark href="/dashboard" size={20} title="FitFuel dashboard" />
        </div>

        <main className={s.content} id="app-main">{children}</main>
      </div>

      {/* ── Bottom tabs, phones ──────────────────────────────────────── */}
      <nav className={s.tabbar} aria-label="Primary">
        {TAB_ITEMS.map((item) => {
          const on = active === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${s.tab} ${on ? s.tabOn : ""}`}
              aria-current={on ? "page" : undefined}
            >
              <Icon name={item.icon} size={18} color={on ? C.lime : C.dim} />
              <span className={s.tabLabel}>{item.label}</span>
            </Link>
          );
        })}
        <button
          type="button"
          className={`${s.tab} ${moreOpen ? s.tabOn : ""}`}
          onClick={() => setMoreOpen(true)}
          aria-expanded={moreOpen}
          aria-haspopup="dialog"
        >
          <MoreHorizontal size={18} color={moreOpen ? C.lime : C.dim} strokeWidth={1.75} />
          <span className={s.tabLabel}>More</span>
        </button>
      </nav>

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
              <h2 id="more-h" style={screen()}>More</h2>
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
              <Link key={item.href} href={item.href} className={s.sheetRow} onClick={close}>
                <Icon name={item.icon} size={18} color={C.dim} />
                <span style={{ minWidth: 0 }}>
                  <span style={{ display: "block", fontFamily: "var(--fk-display), Georgia, serif",
                                 fontWeight: 600, fontSize: 16, textTransform: "none",
                                 color: C.ink, lineHeight: 1.1 }}>
                    {item.label}
                  </span>
                  <span style={body(13, { display: "block", marginTop: 2 })}>{item.blurb}</span>
                </span>
              </Link>
            ))}

            <button
              type="button"
              onClick={() => signOut({ callbackUrl: "/" })}
              className={s.sheetRow}
              style={{ width: "100%", background: "transparent", cursor: "pointer", textAlign: "left" }}
            >
              <LogOut size={18} color={C.dim} strokeWidth={1.75} />
              <span style={{ fontFamily: "var(--fk-display), Georgia, serif", fontWeight: 600, fontSize: 16,
                             textTransform: "none", color: C.ink }}>
                Sign out
              </span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
