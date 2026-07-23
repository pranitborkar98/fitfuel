"use client";

// components/Navbar.tsx
// Flagship navigation. Every surface in the product is reachable from here.
// Structure: Plans (mega menu) / Supplements / How It Works / Results / Company (menu) / auth / CTA.
// All plan hrefs use real DB slugs. Category links use /plans?category= (wired in PlansCatalog).

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  Menu, X, Zap, User, LogOut, LayoutDashboard, ChevronDown,
  Flame, HeartPulse, Dumbbell, Building2, FileText, Calculator, Sparkles,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const LIME = "#84cc16";
const LIME_LIGHT = "#a3e635";

// Category icons were previously colour-coded teal / purple / sky / amber /
// pink. That leaked a five-hue secondary palette into the global chrome, so
// it rendered on every page including the homepage, against DESIGN.md's
// "lime is the only chromatic value". Icons now carry meaning by shape.
const ICON = "var(--ff-dim)";

// ── Menu data ────────────────────────────────────────────────────────────────

const popularPlans = [
  { label: "Weight Loss",   href: "/plans/weight-loss-veg",   note: "Sustainable deficit" },
  { label: "Muscle Gain",   href: "/plans/muscle-gain-veg",   note: "High protein surplus" },
  { label: "Balanced",      href: "/plans/balanced-veg",      note: "Clean maintenance fuel" },
  { label: "Diabetic",      href: "/plans/diabetic-veg",      note: "Low GI, steady glucose" },
  { label: "PCOS",          href: "/plans/pcos-veg",          note: "Hormone-supportive" },
  { label: "Body Recomp",   href: "/plans/body-recomp-veg",   note: "Lose fat, keep muscle" },
];

const planCategories = [
  { label: "All Plans",            href: "/plans",                            icon: <Flame size={14} color={LIME} />,      note: "Browse the full catalog" },
  { label: "Medical & Lifestyle",  href: "/plans?category=LIFESTYLE_MEDICAL", icon: <HeartPulse size={14} color={ICON} />, note: "Condition-specific nutrition" },
  { label: "Sports Nutrition",     href: "/plans?category=SPORTS",            icon: <Dumbbell size={14} color={ICON} />,   note: "Fuel for your sport" },
  { label: "Corporate",            href: "/plans?category=CORPORATE",         icon: <Building2 size={14} color={ICON} />,  note: "Office wellness programs" },
  { label: "Digital Plans (PDF)",  href: "/plans/digital",                    icon: <FileText size={14} color={ICON} />,   note: "Personalised plan, anywhere" },
];

const planTools = [
  { label: "TDEE Calculator", href: "/tdee-calculator", icon: <Calculator size={14} color={ICON} />, note: "Know your daily calories, free" },
  { label: "Find My Plan",    href: "/#finder",         icon: <Sparkles size={14} color={ICON} />,   note: "60-second plan match" },
];

const companyLinks = [
  { label: "About Us",        href: "/about" },
  { label: "Our Kitchen",     href: "/our-kitchen" },
  { label: "Our Ingredients", href: "/our-ingredients" },
  { label: "Our Team",        href: "/our-team" },
  { label: "Delivery Areas",  href: "/locations" },
  { label: "Blog",            href: "/blog" },
  { label: "Reviews",         href: "/testimonials" },
  { label: "FAQ",             href: "/faq" },
  { label: "Corporate",       href: "/corporate" },
  { label: "Partner With Us", href: "/partners/apply" },
  { label: "Contact",         href: "/contact" },
];

const topLinks = [
  { label: "Supplements",  href: "/supplements" },
  { label: "How It Works", href: "/how-it-works" },
  { label: "Results",      href: "/results" },
];

// ── Shared bits ──────────────────────────────────────────────────────────────

const itemBase: React.CSSProperties = {
  display: "flex", alignItems: "flex-start", gap: 10,
  padding: "9px 12px", borderRadius: 0, textDecoration: "none", transition: "background 0.15s",
};

function MenuItem({ href, label, note, icon, onNavigate }: {
  href: string; label: string; note?: string; icon?: React.ReactNode; onNavigate: () => void;
}) {
  return (
    <Link href={href} onClick={onNavigate} className="ff-menu-item" style={itemBase}>
      {icon ? <span style={{ marginTop: 2, flexShrink: 0 }}>{icon}</span> : null}
      <span>
        <span style={{ display: "block", fontSize: 13.5, fontWeight: 600, color: "var(--ff-mute)", lineHeight: 1.35 }}>{label}</span>
        {note ? <span style={{ display: "block", fontSize: 12, color: "var(--ff-dim)", lineHeight: 1.4, marginTop: 1 }}>{note}</span> : null}
      </span>
    </Link>
  );
}

function ColHeader({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ fontSize: 10.5, fontWeight: 800, color: "var(--ff-dim)", textTransform: "uppercase", letterSpacing: "0.14em", padding: "0 12px", marginBottom: 8 }}>
      {children}
    </div>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled]     = useState(false);
  const [scrollPct, setScrollPct]   = useState(0);
  const [openMenu, setOpenMenu]     = useState<"plans" | "company" | "user" | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mobilePanel = useRef<HTMLDivElement>(null);
  const hamburger   = useRef<HTMLButtonElement>(null);
  const pathname = usePathname();

  const { data: session, status } = useSession();
  const isLoggedIn = status === "authenticated" && !!session?.user;
  const user = session?.user;

  useEffect(() => {
    const onScroll = () => {
      const sy = window.scrollY;
      setScrolled(sy > 24);
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      setScrollPct(docH > 0 ? (sy / docH) * 100 : 0);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Route change closes everything
  useEffect(() => { setOpenMenu(null); setMobileOpen(false); }, [pathname]);

  // Esc closes menus
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpenMenu(null); setMobileOpen(false); } };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Outside click closes desktop menus
  useEffect(() => {
    if (!openMenu) return;
    const close = () => setOpenMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [openMenu]);

  // The mobile menu is a full-height overlay. Without these three things it
  // behaved as a decoration rather than a dialog: the page scrolled behind
  // it, and keyboard/screen-reader users tabbed straight through it into the
  // page underneath because focus never moved in.
  useEffect(() => {
    if (!mobileOpen) return;

    // 1. Lock body scroll, compensating for the scrollbar so the page
    //    underneath does not visibly shift when it disappears.
    const { body } = document;
    const prevOverflow = body.style.overflow;
    const prevPad = body.style.paddingRight;
    const gap = window.innerWidth - document.documentElement.clientWidth;
    body.style.overflow = "hidden";
    if (gap > 0) body.style.paddingRight = `${gap}px`;

    // 2. Move focus into the panel.
    const panel = mobilePanel.current;
    const focusables = () =>
      Array.from(
        panel?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        ) ?? [],
      ).filter((el) => el.offsetParent !== null);
    focusables()[0]?.focus();

    // 3. Trap Tab inside the panel while it is open.
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (e.shiftKey && (active === first || !panel?.contains(active))) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault(); first.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPad;
      document.removeEventListener("keydown", onKeyDown);
      // Return focus to the control that opened the panel.
      hamburger.current?.focus();
    };
  }, [mobileOpen]);

  const hoverOpen = (m: "plans" | "company") => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenMenu(m);
  };
  const hoverClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpenMenu(null), 140);
  };
  const closeAll = () => { setOpenMenu(null); setMobileOpen(false); };

  const dropTriggerStyle = (active: boolean): React.CSSProperties => ({
    display: "inline-flex", alignItems: "center", gap: 5,
    padding: "8px 13px", fontSize: 14, fontWeight: 500, borderRadius: 0,
    color: active ? "var(--ff-ink)" : "var(--ff-mute)", background: active ? "rgba(255,255,255,0.05)" : "transparent",
    border: "none", cursor: "pointer", transition: "color 0.2s, background 0.2s", letterSpacing: "0.01em",
  });

  const panelStyle: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 10px)",
    background: "#0d0d0d", border: "1px solid #1f1f1f", borderRadius: 0,
    
    zIndex: 100, overflow: "hidden",
  };

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "background 0.35s, border-color 0.35s, backdrop-filter 0.35s",
      background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
      borderBottom: `1px solid ${scrolled ? "#1e1e1e" : "transparent"}`,
      backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
    }}>
      {/* Scroll progress */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "#1a1a1a" }}>
        <div style={{ height: "100%", width: `${scrollPct}%`, background: `linear-gradient(90deg, ${LIME}, ${LIME_LIGHT})` }} />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
          <div style={{ width: 36, height: 36, background: LIME, borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Zap style={{ width: 19, height: 19, color: "#000" }} fill="#000" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--ff-ink)" }}>
            Fit<span style={{ color: LIME }}>Fuel</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ff-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }} onClick={e => e.stopPropagation()}>

          {/* Plans mega menu */}
          <div style={{ position: "relative" }} onMouseEnter={() => hoverOpen("plans")} onMouseLeave={hoverClose}>
            <button
              style={dropTriggerStyle(openMenu === "plans")}
              aria-expanded={openMenu === "plans"} aria-haspopup="true"
              onClick={() => setOpenMenu(m => m === "plans" ? null : "plans")}
            >
              Meal Plans <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: openMenu === "plans" ? "rotate(180deg)" : "none" }} />
            </button>
            <AnimatePresence>
              {openMenu === "plans" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                  style={{ ...panelStyle, left: "50%", transform: "translateX(-50%)", width: 640, padding: 18 }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                    <div>
                      <ColHeader>Popular plans</ColHeader>
                      {popularPlans.map(p => <MenuItem key={p.href} {...p} onNavigate={closeAll} />)}
                    </div>
                    <div>
                      <ColHeader>Browse by category</ColHeader>
                      {planCategories.map(c => <MenuItem key={c.href} {...c} onNavigate={closeAll} />)}
                      <div style={{ height: 1, background: "#1a1a1a", margin: "10px 12px" }} />
                      <ColHeader>Free tools</ColHeader>
                      {planTools.map(t => <MenuItem key={t.href} {...t} onNavigate={closeAll} />)}
                    </div>
                  </div>
                  {/* Trial strip */}
                  <Link href="/plans?trial=true" onClick={closeAll} className="ff-menu-item" style={{
                    marginTop: 14, display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "rgba(132,204,22,0.06)", border: "1px solid rgba(132,204,22,0.2)",
                    borderRadius: 0, padding: "12px 16px", textDecoration: "none",
                  }}>
                    <span style={{ fontSize: 13, color: "#d1d5db" }}>
                      <b style={{ color: LIME_LIGHT }}>Trial Day, Rs 400.</b> Breakfast plus lunch delivered tomorrow. No lock-in.
                    </span>
                    <span style={{ fontSize: 12, fontWeight: 800, color: "#000", background: LIME, padding: "6px 14px", borderRadius: 0, textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Start Trial</span>
                  </Link>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {topLinks.map(link => (
            <Link key={link.href} href={link.href} className="ff-top-link" style={{
              padding: "8px 13px", fontSize: 14, fontWeight: 500,
              color: pathname === link.href ? "var(--ff-ink)" : "var(--ff-mute)",
              textDecoration: "none", borderRadius: 0, transition: "color 0.2s, background 0.2s", letterSpacing: "0.01em",
            }}>
              {link.label}
            </Link>
          ))}

          {/* Company menu */}
          <div style={{ position: "relative" }} onMouseEnter={() => hoverOpen("company")} onMouseLeave={hoverClose}>
            <button
              style={dropTriggerStyle(openMenu === "company")}
              aria-expanded={openMenu === "company"} aria-haspopup="true"
              onClick={() => setOpenMenu(m => m === "company" ? null : "company")}
            >
              Company <ChevronDown size={13} style={{ transition: "transform 0.2s", transform: openMenu === "company" ? "rotate(180deg)" : "none" }} />
            </button>
            <AnimatePresence>
              {openMenu === "company" && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.16 }}
                  style={{ ...panelStyle, right: 0, width: 420, padding: 16 }}
                >
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 8px" }}>
                    {companyLinks.map(l => <MenuItem key={l.href} {...l} onNavigate={closeAll} />)}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        {/* Desktop CTAs */}
        <div className="ff-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isLoggedIn ? (
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setOpenMenu(m => m === "user" ? null : "user")}
                aria-expanded={openMenu === "user"} aria-haspopup="true"
                className="ff-outline-btn"
                style={{ display: "flex", alignItems: "center", gap: 9, background: "transparent", border: "1px solid #242424", borderRadius: 0, padding: "6px 12px 6px 6px", cursor: "pointer", transition: "border-color 0.2s" }}
              >
                <div style={{ width: 28, height: 28, borderRadius: "50%", overflow: "hidden", background: "#1a1a1a", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  {user?.image
                    ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <User size={14} color="#737373" />}
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "var(--ff-ink)", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name?.split(" ")[0] ?? "Account"}
                </span>
              </button>
              <AnimatePresence>
                {openMenu === "user" && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{ position: "absolute", top: "calc(100% + 8px)", right: 0, background: "#111111", border: "1px solid #1f1f1f", borderRadius: 0, padding: 8, minWidth: 190, boxShadow: "0 16px 40px rgba(0,0,0,0.5)", zIndex: 100 }}
                  >
                    <MenuItem href="/dashboard"         label="Dashboard"    icon={<LayoutDashboard size={14} color="var(--ff-mute)" />} onNavigate={closeAll} />
                    <MenuItem href="/dashboard/profile" label="Edit Profile" icon={<User size={14} color="var(--ff-mute)" />}            onNavigate={closeAll} />
                    <div style={{ height: 1, background: "#1a1a1a", margin: "6px 0" }} />
                    <button
                      onClick={() => { closeAll(); signOut({ callbackUrl: "/" }); }}
                      className="ff-signout"
                      style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, background: "transparent", border: "none", cursor: "pointer", padding: "9px 12px", borderRadius: 0, fontSize: 13, fontWeight: 500, color: "var(--ff-mute)", transition: "background 0.15s, color 0.15s", textAlign: "left" }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link href="/auth/signin" className="ff-outline-btn" style={{ display: "inline-flex", alignItems: "center", fontSize: 14, fontWeight: 600, color: "var(--ff-mute)", textDecoration: "none", padding: "8px 18px", borderRadius: 0, border: "1px solid #242424", background: "transparent", transition: "color 0.2s, border-color 0.2s", letterSpacing: "0.01em" }}>
              Sign In
            </Link>
          )}
          <Link href="/plans" className="ff-cta-btn" style={{ display: "inline-flex", alignItems: "center", fontSize: 13, fontWeight: 800, color: "#000", textDecoration: "none", padding: "9px 20px", borderRadius: 0, background: LIME, letterSpacing: "0.06em", textTransform: "uppercase", transition: "background 0.2s, transform 0.2s, box-shadow 0.2s" }}>
            Order Now
          </Link>
        </div>

        {/* Hamburger */}
        <button
          ref={hamburger}
          onClick={() => setMobileOpen(o => !o)}
          className="ff-nav-mobile ff-outline-btn"
          style={{ background: "none", border: "1px solid #242424", cursor: "pointer", padding: 10, minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center", color: "var(--ff-mute)", borderRadius: 0, display: "none", transition: "border-color 0.2s, color 0.2s" }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileOpen}
          aria-controls="ff-mobile-menu"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mobileOpen ? "close" : "open"} initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.18 }}>
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            ref={mobilePanel}
            id="ff-mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", background: "rgba(8,8,8,0.97)", borderBottom: "1px solid #1e1e1e", backdropFilter: "blur(16px)", maxHeight: "calc(100dvh - 68px)", overflowY: "auto" }}
          >
            <div style={{ padding: "14px 24px 28px" }}>

              {/* Trial strip: was desktop-only, so the cheapest offer on the
                  site was invisible to the majority of traffic. */}
              <Link href="/plans?trial=true" onClick={closeAll} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                background: "rgba(132,204,22,0.06)", border: "1px solid rgba(132,204,22,0.2)",
                padding: "12px 14px", textDecoration: "none", marginBottom: 14, minHeight: 44,
              }}>
                <span style={{ fontSize: 13, color: "#d1d5db", lineHeight: 1.4 }}>
                  <b style={{ color: LIME_LIGHT }}>Trial Day, Rs 400.</b> Breakfast plus lunch, no lock-in.
                </span>
                <span style={{ fontSize: 12, fontWeight: 800, color: "#000", background: LIME, padding: "7px 12px", textTransform: "uppercase", letterSpacing: "0.06em", whiteSpace: "nowrap" }}>Start</span>
              </Link>

              {/* `popularPlans` used to render on desktop hover only, so the
                  six highest-intent links on the site did not exist in the
                  mobile nav at all. Opened by default: two taps to reach a
                  plan was one tap too many on the primary traffic source. */}
              <MobileSection title="Meal Plans" defaultOpen>
                {popularPlans.map(p => <MobileLink key={p.href} href={p.href} label={p.label} note={p.note} onNavigate={closeAll} />)}
                <MobileDivider />
                {planCategories.map(c => <MobileLink key={c.href} href={c.href} label={c.label} onNavigate={closeAll} />)}
                {planTools.map(t => <MobileLink key={t.href} href={t.href} label={t.label} onNavigate={closeAll} />)}
              </MobileSection>

              <MobileSection title="Explore">
                {topLinks.map(l => <MobileLink key={l.href} href={l.href} label={l.label} onNavigate={closeAll} />)}
              </MobileSection>

              <MobileSection title="Company">
                {companyLinks.map(l => <MobileLink key={l.href} href={l.href} label={l.label} onNavigate={closeAll} />)}
              </MobileSection>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 16, borderTop: "1px solid #1a1a1a", marginTop: 8 }}>
                {isLoggedIn ? (
                  <>
                    <MobileButtonLink href="/dashboard" onNavigate={closeAll} icon={<LayoutDashboard size={14} />} label="Dashboard" />
                    <MobileButtonLink href="/dashboard/profile" onNavigate={closeAll} icon={<User size={14} />} label="Edit Profile" />
                    <button
                      onClick={() => { closeAll(); signOut({ callbackUrl: "/" }); }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 11, fontSize: 14, fontWeight: 600, color: "var(--ff-mute)", background: "transparent", border: "1px solid #242424", borderRadius: 0, cursor: "pointer" }}
                    >
                      <LogOut size={14} /> Sign Out
                    </button>
                  </>
                ) : (
                  <MobileButtonLink href="/auth/signin" onNavigate={closeAll} label="Sign In" />
                )}
                <Link href="/plans" onClick={closeAll} style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 11, fontSize: 13, fontWeight: 800, color: "#000", textDecoration: "none", borderRadius: 0, background: LIME, textTransform: "uppercase", letterSpacing: "0.07em" }}>
                  Order Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .ff-menu-item:hover, .ff-top-link:hover { background: rgba(255,255,255,0.05); }
        .ff-top-link:hover { color: var(--ff-ink) !important; }
        .ff-outline-btn:hover { border-color: #3a3a3a !important; color: var(--ff-ink) !important; }
        .ff-cta-btn:hover { background: ${LIME_LIGHT} !important; transform: translateY(-1px);  }
        .ff-signout:hover { background: rgba(239,68,68,0.08); color: #fca5a5 !important; }
        a:focus-visible, button:focus-visible { outline: 2px solid ${LIME}; outline-offset: 2px; border-radius: 0; }
        @media (max-width: 1020px) {
          .ff-nav-desktop { display: none !important; }
          .ff-nav-mobile  { display: flex !important; }
        }
        @media (min-width: 1021px) {
          .ff-nav-mobile { display: none !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ff-cta-btn:hover { transform: none; }
        }
      `}</style>
    </header>
  );
}

// ── Mobile primitives ────────────────────────────────────────────────────────

function MobileSection({ title, children, defaultOpen = false }: { title: string; children: React.ReactNode; defaultOpen?: boolean }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: "1px solid #161616" }}>
      <button
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", background: "transparent", border: "none", cursor: "pointer", padding: "14px 4px", minHeight: 48, fontSize: 15, fontWeight: 600, color: "var(--ff-ink)" }}
      >
        {title}
        <ChevronDown size={15} color="var(--ff-dim)" style={{ transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "none" }} />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }} style={{ overflow: "hidden" }}>
            <div style={{ paddingBottom: 10 }}>{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MobileDivider() {
  return <div style={{ height: 1, background: "#1a1a1a", margin: "10px 14px" }} />;
}

function MobileLink({ href, label, note, onNavigate }: { href: string; label: string; note?: string; onNavigate: () => void }) {
  return (
    // 44px min-height: these were 38px, under the touch-target guideline.
    <Link href={href} onClick={onNavigate} className="ff-menu-item" style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "10px 14px", minHeight: 44, fontSize: 14, color: "var(--ff-mute)", textDecoration: "none", borderRadius: 0 }}>
      {label}
      {note ? <span style={{ fontSize: 12, color: "var(--ff-dim)", marginTop: 2 }}>{note}</span> : null}
    </Link>
  );
}

function MobileButtonLink({ href, label, icon, onNavigate }: { href: string; label: string; icon?: React.ReactNode; onNavigate: () => void }) {
  return (
    <Link href={href} onClick={onNavigate} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: 11, minHeight: 44, fontSize: 14, fontWeight: 600, color: "var(--ff-ink)", textDecoration: "none", borderRadius: 0, border: "1px solid #242424" }}>
      {icon}{label}
    </Link>
  );
}
