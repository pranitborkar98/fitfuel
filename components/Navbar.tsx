"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence, useMotionValue, useSpring } from "framer-motion";

const navLinks = [
  { label: "Meal Plans",   href: "/plans"         },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "About",        href: "/about"         },
  { label: "Locations",    href: "/locations"     },
  { label: "Contact",      href: "/contact"       },
];

export default function Navbar() {
  const [isOpen,   setIsOpen]   = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [scrollPct, setScrollPct] = useState(0);

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
            boxShadow: "0 0 16px rgba(132,204,22,0.35)",
            transition: "box-shadow 0.2s",
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
              key={link.href}
              href={link.href}
              style={{
                padding: "8px 15px", fontSize: 14, fontWeight: 500,
                color: "#9ca3af", textDecoration: "none", borderRadius: 8,
                transition: "color 0.2s, background 0.2s",
                letterSpacing: "0.01em",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f9fafb"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Desktop CTAs */}
        <div className="ff-nav-desktop" style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link
            href="/login"
            style={{
              display: "inline-flex", alignItems: "center",
              fontSize: 14, fontWeight: 600, color: "#9ca3af",
              textDecoration: "none", padding: "8px 18px", borderRadius: 8,
              border: "1px solid #242424", background: "transparent",
              transition: "all 0.2s",
              letterSpacing: "0.01em",
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f9fafb"; (e.currentTarget as HTMLElement).style.borderColor = "#3a3a3a"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.04)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.borderColor = "#242424"; (e.currentTarget as HTMLElement).style.background = "transparent"; }}
          >
            Sign In
          </Link>
          <Link
            href="/plans"
            style={{
              display: "inline-flex", alignItems: "center",
              fontSize: 13, fontWeight: 800, color: "#000",
              textDecoration: "none", padding: "9px 20px", borderRadius: 8,
              background: "#84cc16", letterSpacing: "0.06em", textTransform: "uppercase",
              boxShadow: "0 2px 16px rgba(132,204,22,0.35)",
              transition: "all 0.2s",
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
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05, duration: 0.22 }}
                  >
                    <Link
                      href={link.href}
                      onClick={() => setIsOpen(false)}
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
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: "11px", fontSize: 14, fontWeight: 600, color: "#9ca3af", textDecoration: "none", borderRadius: 8, border: "1px solid #242424", transition: "all 0.2s" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#f9fafb"; (e.currentTarget as HTMLElement).style.borderColor = "#3a3a3a"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#9ca3af"; (e.currentTarget as HTMLElement).style.borderColor = "#242424"; }}
                >
                  Sign In
                </Link>
                <Link
                  href="/plans"
                  onClick={() => setIsOpen(false)}
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