"use client";

import Link from "next/link";
import { Zap, MapPin, Phone, Mail } from "lucide-react";

const planLinks = [
  { label: "Muscle Gain",     href: "/plans/muscle-gain"     },
  { label: "Weight Loss",     href: "/plans/weight-loss"     },
  { label: "Balanced Diet",   href: "/plans/balanced-diet"   },
  { label: "Digital Plans (PDF)", href: "/plans/digital" },   // ← ADD THIS LINE
  { label: "Office Employee", href: "/plans/office-employee" },
  { label: "Jain Diet",       href: "/plans/jain-diet"       },
];

const companyLinks = [
  { label: "About Us",           href: "/about"          },
  { label: "How It Works",       href: "/#how-it-works"  },
  { label: "Delivery Locations", href: "/locations"      },
  { label: "Blog",               href: "/blog"           },
  { label: "Reviews",            href: "/testimonials"   },
  { label: "FAQ",                href: "/faq"            },
  { label: "Contact",            href: "/contact"        },
];

const legalLinks = [
  { label: "Privacy Policy",     href: "/privacy"            },
  { label: "Terms & Conditions", href: "/terms"              },
  { label: "Refund Policy",      href: "/refund-policy"      },
  { label: "Medical Disclaimer", href: "/medical-disclaimer" },
  { label: "Allergen Policy",    href: "/allergen-policy"    },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 15, height: 15 }}>
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" style={{ width: 15, height: 15 }}>
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "#060606", borderTop: "1px solid #181818" }}>

      {/* Lime glow line */}
      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #84cc16, transparent)", opacity: 0.35 }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 44px" }}>

        {/* 4-column grid */}
        <div className="ff-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr 1fr 1.5fr", gap: 56 }}>

          {/* ── Brand ── */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 20 }}>
              <div style={{ width: 34, height: 34, background: "#84cc16", borderRadius: 9, display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 14px rgba(132,204,22,0.3)" }}>
                <Zap style={{ width: 18, height: 18, color: "#000" }} fill="#000" />
              </div>
              <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.025em", color: "#f9fafb" }}>
                Fit<span style={{ color: "#84cc16" }}>Fuel</span>
              </span>
            </Link>

            {/* ✅ Legible body copy */}
            <p style={{ color: "#6b7280", fontSize: 13.5, lineHeight: 1.75, marginBottom: 28, maxWidth: 260 }}>
              Pune's premium goal-based meal delivery. Fresh, chef-cooked, delivered to your door every day.
            </p>

            {/* Contact links */}
            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <a
                href="https://wa.me/918850446348"
                style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a3e635")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
              >
                <Phone style={{ width: 14, height: 14, flexShrink: 0 }} /> WhatsApp Us
              </a>
              <a
                href="mailto:contact@fitfuel.in"
                style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#a3e635")}
                onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
              >
                <Mail style={{ width: 14, height: 14, flexShrink: 0 }} /> contact@fitfuel.in
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "#6b7280" }}>
                <MapPin style={{ width: 14, height: 14, flexShrink: 0 }} /> Kharadi, Pune, Maharashtra
              </div>
            </div>

            {/* Social icons */}
            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              {[
                { href: "https://instagram.com/fitfuel.in", label: "Instagram", Icon: InstagramIcon },
                { href: "https://youtube.com/@fitfuel",     label: "YouTube",   Icon: YoutubeIcon   },
              ].map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  style={{
                    width: 38, height: 38, borderRadius: 9,
                    background: "#111", border: "1px solid #222",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    color: "#6b7280", textDecoration: "none",
                    transition: "color 0.2s, border-color 0.2s, box-shadow 0.2s",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.color = "#84cc16"; e.currentTarget.style.borderColor = "rgba(132,204,22,0.35)"; e.currentTarget.style.boxShadow = "0 0 12px rgba(132,204,22,0.2)"; }}
                  onMouseLeave={e => { e.currentTarget.style.color = "#6b7280"; e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.boxShadow = "none"; }}
                >
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {/* ── Meal Plans ── */}
          <div>
            {/* ✅ Column header — white */}
            <div style={{ fontSize: 11, fontWeight: 800, color: "#f3f4f6", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>
              Meal Plans
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {planLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ fontSize: 13.5, color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#a3e635")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Company ── */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#f3f4f6", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>
              Company
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {companyLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ fontSize: 13.5, color: "#6b7280", textDecoration: "none", transition: "color 0.2s" }}
                  onMouseEnter={e => (e.currentTarget.style.color = "#a3e635")}
                  onMouseLeave={e => (e.currentTarget.style.color = "#6b7280")}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>

          {/* ── Trial CTA box ── */}
          <div>
            <div style={{
              background: "linear-gradient(145deg, #111, #0e0e0e)",
              border: "1px solid rgba(132,204,22,0.22)",
              borderRadius: 18, padding: 24,
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)",
            }}>
              {/* Top accent */}
              <div style={{ height: 2, background: "linear-gradient(90deg, #84cc16, transparent)", borderRadius: "18px 18px 0 0", margin: "-24px -24px 20px", borderTopLeftRadius: 18, borderTopRightRadius: 18 }} />

              <span style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                background: "rgba(132,204,22,0.09)", color: "#a3e635",
                fontSize: 10, fontWeight: 800, letterSpacing: "0.12em",
                padding: "4px 12px", borderRadius: 999,
                border: "1px solid rgba(132,204,22,0.22)",
                textTransform: "uppercase", marginBottom: 14,
              }}>
                Try Today
              </span>

              {/* ✅ CTA heading — white */}
              <div style={{ fontSize: 18, fontWeight: 800, color: "#f9fafb", marginBottom: 8, letterSpacing: "-0.01em" }}>
                Trial Day — ₹400
              </div>

              {/* ✅ CTA body — readable */}
              <p style={{ color: "#9ca3af", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Breakfast + Lunch delivered tomorrow. No commitment, no lock-in.
              </p>

              <Link
                href="/plans"
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center",
                  background: "#84cc16", color: "#000", fontSize: 13, fontWeight: 900,
                  padding: "11px 0", borderRadius: 9, textDecoration: "none",
                  letterSpacing: "0.07em", textTransform: "uppercase",
                  boxShadow: "0 4px 20px rgba(132,204,22,0.35)",
                  transition: "all 0.2s",
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "#a3e635"; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 6px 26px rgba(132,204,22,0.5)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "#84cc16"; (e.currentTarget as HTMLElement).style.transform = "translateY(0)"; (e.currentTarget as HTMLElement).style.boxShadow = "0 4px 20px rgba(132,204,22,0.35)"; }}
              >
                Start Trial
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid #181818", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          {/* ✅ Copyright — visible (was #333) */}
          <p style={{ fontSize: 12, color: "#4b5563", margin: 0, lineHeight: 1.6 }}>
            © {new Date().getFullYear()} FitFuel. All rights reserved. · GST 5% applicable on all meal plans.
          </p>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {legalLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                style={{ fontSize: 12, color: "#4b5563", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={e => (e.currentTarget.style.color = "#9ca3af")}
                onMouseLeave={e => (e.currentTarget.style.color = "#4b5563")}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        @media (max-width: 960px) {
          .ff-footer-grid { grid-template-columns: 1fr 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 560px) {
          .ff-footer-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </footer>
  );
}