"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Menu, X, Zap, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { label: "Meal Plans",   href: "/plans"         },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About",        href: "/about"         },
  { label: "Locations",    href: "/locations"     },
  { label: "Contact",      href: "/contact"       },
];

export default function Navbar() {
  const [isOpen,    setIsOpen]    = useState(false);
  const [scrolled,  setScrolled]  = useState(false);
  const [scrollPct, setScrollPct] = useState(0);
  const [userMenu,  setUserMenu]  = useState(false);

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

  // Close user menu on outside click
  useEffect(() => {
    if (!userMenu) return;
    const close = () => setUserMenu(false);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [userMenu]);

  return (
    <header style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      transition: "background 0.35s, border-color 0.35s, backdrop-filter 0.35s",
      background: scrolled ? "rgba(8,8,8,0.92)" : "transparent",
      borderBottom: `1px solid ${scrolled ? "#1e1e1e" : "transparent"}`,
      backdropFilter: scrolled ? "blur(16px) saturate(180%)" : "none",
    }}>
      {/* Scroll progress bar */}
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 1, background: "#1a1a1a" }}>
        <div style={{
          height: "100%", width: `${scrollPct}%`,
          background: "linear-gradient(90deg, #84cc16, #a3e635)",
          transition: "width 0.1s linear",
          boxShadow: "0 0 8px rgba(132,204,22,0.6)",
        }} />
      </div>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 68 }}>

        {/* Logo */}
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 11, textDecoration: "none", flexShrink: 0 }}>
          <div style={{
            width: 36, height: 36, background: "#84cc16", borderRadius: 9,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 0 16px rgba(132,204,22,0.35)", transition: "box-shadow 0.2s",
          }}
            onMouseEnter={e => (e.currentTarget.style.boxShadow = "0 0 24px rgba(132,204,22,0.55)")}
            onMouseLeave={e => (e.currentTarget.style.boxShadow = "0 0 16px rgba(132,204,22,0.35)")}
          >
            <Zap style={{ width: 19, height: 19, color: "#000" }} fill="#000" />
          </div>
          <span style={{ fontSize: 20, fontWeight: 800, letterSpacing: "-0.025em", color: "#f9fafb" }}>
            Fit<span style={{ color: "#84cc16" }}>Fuel</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ff-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 2 }}>
          {navLinks.map(link => (
            <Link
              key={link.href} href={link.href}
              style={{ padding: "8px 15px", fontSize: 14, fontWeight: 500, color: "#9ca3af", textDecoration: "none", borderRadius: 8, transition: "color 0.2s, background 0.2s", letterSpacing: "0.01em" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f9fafb"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="ff-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          {isLoggedIn ? (
            // ── Logged-in: avatar + dropdown ──
            <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
              <button
                onClick={() => setUserMenu(v => !v)}
                style={{
                  display: "flex", alignItems: "center", gap: 9,
                  background: "transparent", border: "1px solid #242424",
                  borderRadius: 8, padding: "6px 12px 6px 6px",
                  cursor: "pointer", transition: "all 0.2s",
                }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a3a3a"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "#242424"; }}
              >
                {/* Avatar */}
                <div style={{
                  width: 28, height: 28, borderRadius: "50%",
                  overflow: "hidden", background: "#1a1a1a",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  flexShrink: 0,
                }}>
                  {user?.image
                    ? <img src={user.image} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    : <User size={14} color="#737373" />
                  }
                </div>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#f9fafb", maxWidth: 100, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {user?.name?.split(" ")[0] ?? "Account"}
                </span>
              </button>

              {/* Dropdown */}
              <AnimatePresence>
                {userMenu && (
                  <motion.div
                    initial={{ opacity: 0, y: -6, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0,  scale: 1 }}
                    exit={{    opacity: 0, y: -6, scale: 0.97 }}
                    transition={{ duration: 0.15 }}
                    style={{
                      position: "absolute", top: "calc(100% + 8px)", right: 0,
                      background: "#111111", border: "1px solid #1f1f1f",
                      borderRadius: 12, padding: "8px", minWidth: 180,
                      boxShadow: "0 16px 40px rgba(0,0,0,0.5)",
                      zIndex: 100,
                    }}
                  >
                    <DropItem href="/dashboard" icon={<LayoutDashboard size={14} />} label="Dashboard" onClick={() => setUserMenu(false)} />
                    <div style={{ height: 1, background: "#1a1a1a", margin: "6px 0" }} />
                    <button
                      onClick={() => { setUserMenu(false); signOut({ callbackUrl: "/" }); }}
                      style={{
                        width: "100%", display: "flex", alignItems: "center", gap: 10,
                        background: "transparent", border: "none", cursor: "pointer",
                        padding: "9px 12px", borderRadius: 8,
                        fontSize: 13, fontWeight: 500, color: "#9ca3af",
                        transition: "all 0.15s", textAlign: "left",
                      }}
                      onMouseEnter={e => { e.currentTarget.style.background = "rgba(239,68,68,0.08)"; e.currentTarget.style.color = "#fca5a5"; }}
                      onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#9ca3af"; }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            // ── Logged-out: Sign In button ──
            <Link
              href="/auth/signin"
              style={{
                display: "inline-flex", alignItems: "center",
                fontSize: 14, fontWeight: 600, color: "#9ca3af",
                textDecoration: "none", padding: "8px 18px", borderRadius: 8,
                border: "1px solid #242424", background: "transparent",
                transition: "all 0.2s", letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f9fafb"; (e.currentTarget as HTMLElement).style.borderColor = "#3a3a3a"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.borderColor = "#242424"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              Sign In
            </Link>
          )}

          <Link
            href="/plans"
            style={{
              display: "inline-flex", alignItems: "center",
              fontSize: 13, fontWeight: 800, color: "#000",
              textDecoration: "none", padding: "9px 20px", borderRadius: 8,
              background: "#84cc16", letterSpacing: "0.06em", textTransform: "uppercase",
              boxShadow: "0 2px 16px rgba(132,204,22,0.35)", transition: "all 0.2s",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#a3e635"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 22px rgba(132,204,22,0.5)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#84cc16"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 2px 16px rgba(132,204,22,0.35)"; }}
          >
            Order Now
          </Link>
        </div>

        {/* Hamburger */}
        <button
          onClick={() => setIsOpen(o => !o)}
          className="ff-nav-mobile"
          style={{ background: "none", border: "1px solid #242424", cursor: "pointer", padding: "8px", color: "#9ca3af", borderRadius: 8, display: "none", transition: "all 0.2s" }}
          aria-label="Toggle menu"
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#3a3a3a"; e.currentTarget.style.color = "#f9fafb"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#242424"; e.currentTarget.style.color = "#9ca3af"; }}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={isOpen ? "close" : "open"}
              initial={{ rotate: -90, opacity: 0 }}
              animate={{ rotate: 0,   opacity: 1 }}
              exit={{    rotate:  90, opacity: 0 }}
              transition={{ duration: 0.18 }}
            >
              {isOpen ? <X size={20} /> : <Menu size={20} />}
            </motion.div>
          </AnimatePresence>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{    opacity: 0, height: 0 }}
            transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: "hidden", background: "rgba(8,8,8,0.97)", borderBottom: "1px solid #1e1e1e", backdropFilter: "blur(16px)" }}
          >
            <div style={{ padding: "12px 24px 28px" }}>
              <nav style={{ display: "flex", flexDirection: "column", gap: 2, marginBottom: 16 }}>
                {navLinks.map((link, i) => (
                  <motion.div key={link.href} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05, duration: 0.22 }}>
                    <Link
                      href={link.href} onClick={() => setIsOpen(false)}
                      style={{ display: "block", padding: "12px 16px", fontSize: 15, fontWeight: 500, color: "#9ca3af", textDecoration: "none", borderRadius: 8, transition: "all 0.2s" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f9fafb"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, paddingTop: 12, borderTop: "1px solid #1a1a1a" }}>
                {isLoggedIn ? (
                  <>
                    <Link
                      href="/dashboard" onClick={() => setIsOpen(false)}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", fontSize: 14, fontWeight: 600, color: "#f9fafb", textDecoration: "none", borderRadius: 8, border: "1px solid #242424" }}
                    >
                      <LayoutDashboard size={14} />
                      Dashboard
                    </Link>
                    <button
                      onClick={() => { setIsOpen(false); signOut({ callbackUrl: "/" }); }}
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", fontSize: 14, fontWeight: 600, color: "#9ca3af", background: "transparent", border: "1px solid #242424", borderRadius: 8, cursor: "pointer" }}
                    >
                      <LogOut size={14} />
                      Sign Out
                    </button>
                  </>
                ) : (
                  <Link
                    href="/auth/signin" onClick={() => setIsOpen(false)}
                    style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px", fontSize: 14, fontWeight: 600, color: "#9ca3af", textDecoration: "none", borderRadius: 8, border: "1px solid #242424", transition: "all 0.2s" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f9fafb"; (e.currentTarget as HTMLElement).style.borderColor = "#3a3a3a"; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.borderColor = "#242424"; }}
                  >
                    Sign In
                  </Link>
                )}
                <Link
                  href="/plans" onClick={() => setIsOpen(false)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px", fontSize: 13, fontWeight: 800, color: "#000", textDecoration: "none", borderRadius: 8, background: "#84cc16", textTransform: "uppercase", letterSpacing: "0.07em", boxShadow: "0 2px 16px rgba(132,204,22,0.35)" }}
                >
                  Order Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 860px) {
          .ff-nav-desktop { display: none !important; }
          .ff-nav-mobile  { display: flex !important; }
        }
        @media (min-width: 861px) {
          .ff-nav-mobile { display: none !important; }
        }
      `}</style>
    </header>
  );
}

function DropItem({ href, icon, label, onClick }: { href: string; icon: React.ReactNode; label: string; onClick: () => void }) {
  return (
    <Link
      href={href} onClick={onClick}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "9px 12px", borderRadius: 8,
        fontSize: 13, fontWeight: 500, color: "#9ca3af",
        textDecoration: "none", transition: "all 0.15s",
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; (e.currentTarget as HTMLElement).style.color = "#f9fafb"; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "transparent"; (e.currentTarget as HTMLElement).style.color = "#9ca3af"; }}
    >
      {icon}
      {label}
    </Link>
  );
}