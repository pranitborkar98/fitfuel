"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { Bot, ChevronRight, LogOut, Menu, ShoppingBag, UserRound, X } from "lucide-react";

import CartButton from "@/app/_cart/CartButton";
import Wordmark from "@/components/Wordmark";
import { TRIAL_TOTAL_LABEL } from "@/lib/trial-price";
import s from "./Navbar.module.css";

const PRIMARY = [
  { href: "/#catalog", label: "Meals" },
  { href: "/plans", label: "Meal plans" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/results", label: "Results" },
  { href: "/our-kitchen", label: "Our kitchen" },
] as const;

const MORE = [
  { href: "/supplements", label: "Supplements" },
  { href: "/tdee-calculator", label: "Calculate your target" },
  { href: "/locations", label: "Delivery areas" },
  { href: "/testimonials", label: "Customer stories" },
  { href: "/faq", label: "Questions" },
] as const;

function active(pathname: string, href: string) {
  const route = href.split("#")[0] || "/";
  return route === "/" ? pathname === "/" : pathname.startsWith(route);
}

export default function Navbar() {
  const pathname = usePathname() || "";
  const { data: session } = useSession();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const body = document.body;
    const oldOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    const panel = panelRef.current;
    const selectable = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      );
    selectable()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        return;
      }
      if (event.key !== "Tab") return;
      const items = selectable();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);
    return () => {
      body.style.overflow = oldOverflow;
      document.removeEventListener("keydown", onKey);
      triggerRef.current?.focus();
    };
  }, [open]);

  return (
    <header className={s.header}>
      <div className={s.inner}>
        <Wordmark className={s.wordmark} />

        <nav className={s.desktopNav} aria-label="Primary navigation">
          {PRIMARY.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={active(pathname, item.href) ? s.navActive : s.navLink}
              aria-current={active(pathname, item.href) ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={s.actions}>
          <Link href="/dashboard/trainer" className={s.coach}>
            <Bot size={18} aria-hidden="true" />
            <span>AI coach</span>
          </Link>
          <Link
            href={session?.user ? "/dashboard" : "/auth/signin"}
            className={s.account}
            aria-label={session?.user ? "Open your FitFuel account" : "Sign in to FitFuel"}
          >
            <UserRound size={18} aria-hidden="true" />
          </Link>
          <CartButton />
          <Link href="/plans?trial=true" className={s.trial}>
            Trial · {TRIAL_TOTAL_LABEL}
          </Link>
          <button
            ref={triggerRef}
            type="button"
            className={s.menuButton}
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-haspopup="dialog"
            aria-label="Open navigation"
          >
            <Menu size={21} aria-hidden="true" />
          </button>
        </div>
      </div>

      {open ? (
        <div className={s.mobileLayer}>
          <button type="button" className={s.scrim} onClick={() => setOpen(false)} aria-label="Close navigation" />
          <div ref={panelRef} className={s.mobilePanel} role="dialog" aria-modal="true" aria-labelledby="mobile-nav-title">
            <div className={s.mobileHead}>
              <div>
                <span id="mobile-nav-title">FitFuel</span>
                <small>Food, targets and coaching in one place</small>
              </div>
              <button type="button" onClick={() => setOpen(false)} aria-label="Close navigation">
                <X size={22} aria-hidden="true" />
              </button>
            </div>

            <Link href="/#catalog" className={s.mobileOrder}>
              <span><ShoppingBag size={20} aria-hidden="true" />Order a meal</span>
              <ChevronRight size={18} aria-hidden="true" />
            </Link>

            <nav className={s.mobileNav} aria-label="Mobile navigation">
              <p>Explore FitFuel</p>
              {PRIMARY.slice(1).map((item) => (
                <Link key={item.href} href={item.href}>{item.label}<ChevronRight size={17} aria-hidden="true" /></Link>
              ))}
              {MORE.map((item) => (
                <Link key={item.href} href={item.href}>{item.label}<ChevronRight size={17} aria-hidden="true" /></Link>
              ))}
            </nav>

            <div className={s.mobileActions}>
              <Link href="/dashboard/trainer"><Bot size={18} aria-hidden="true" /> Ask the AI coach</Link>
              <Link href={session?.user ? "/dashboard" : "/auth/signin"}>
                <UserRound size={18} aria-hidden="true" />{session?.user ? "Your FitFuel" : "Sign in"}
              </Link>
              {session?.user ? (
                <button type="button" onClick={() => signOut({ callbackUrl: "/" })}>
                  <LogOut size={18} aria-hidden="true" /> Sign out
                </button>
              ) : null}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
