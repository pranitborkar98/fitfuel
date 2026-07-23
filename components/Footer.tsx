"use client";

// components/Footer.tsx
// Full sitemap footer. Every plan link uses a real DB slug (verified against
// prisma/seed-meal-plans.ts). Tools and program surfaces are no longer orphaned.

import Link from "next/link";
import { Zap, MapPin, Phone, Mail } from "lucide-react";

const planLinks = [
  { label: "Weight Loss",         href: "/plans/weight-loss-veg" },
  { label: "Muscle Gain",         href: "/plans/muscle-gain-veg" },
  { label: "Balanced Diet",       href: "/plans/balanced-veg" },
  { label: "Jain Diet",           href: "/plans/balanced-jain" },
  { label: "Diabetic",            href: "/plans/diabetic-veg" },
  { label: "PCOS",                href: "/plans/pcos-veg" },
  { label: "Medical & Lifestyle", href: "/plans?category=LIFESTYLE_MEDICAL" },
  { label: "Sports Nutrition",    href: "/plans?category=SPORTS" },
  { label: "All 126 Plans",       href: "/plans" },
];

const companyLinks = [
  { label: "About Us",           href: "/about" },
  { label: "How It Works",       href: "/how-it-works" },
  { label: "Our Kitchen",        href: "/our-kitchen" },
  { label: "Our Ingredients",    href: "/our-ingredients" },
  { label: "Our Team",           href: "/our-team" },
  { label: "Delivery Locations", href: "/locations" },
  { label: "Blog",               href: "/blog" },
  { label: "Reviews",            href: "/testimonials" },
  { label: "FAQ",                href: "/faq" },
  { label: "Contact",            href: "/contact" },
];

const toolLinks = [
  { label: "TDEE Calculator",     href: "/tdee-calculator" },
  { label: "Real Results",        href: "/results" },
  { label: "Supplements",         href: "/supplements" },
  { label: "Digital Plans (PDF)", href: "/plans/digital" },
  { label: "Corporate Wellness",  href: "/corporate" },
  { label: "Partner Program",     href: "/partners/apply" },
];

const legalLinks = [
  { label: "Privacy Policy",     href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy",      href: "/refund-policy" },
  { label: "Medical Disclaimer", href: "/medical-disclaimer" },
  { label: "Allergen Policy",    href: "/allergen-policy" },
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

function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 800, color: "var(--ff-ink)", textTransform: "uppercase", letterSpacing: "0.14em", marginBottom: 20 }}>
        {title}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {links.map(link => (
          <Link key={link.href} href={link.href} className="ff-flink" style={{ fontSize: 13.5, color: "var(--ff-dim)", textDecoration: "none", transition: "color 0.2s" }}>
            {link.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

export default function Footer() {
  return (
    <footer style={{ background: "#060606", borderTop: "1px solid #181818" }}>

      <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #84cc16, transparent)", opacity: 0.35 }} />

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 44px" }}>

        <div className="ff-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1.4fr", gap: 44 }}>

          {/* Brand */}
          <div>
            <Link href="/" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 20 }}>
              <div style={{ width: 34, height: 34, background: "#84cc16", borderRadius: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Zap style={{ width: 18, height: 18, color: "#000" }} fill="#000" />
              </div>
              <span style={{ fontSize: 19, fontWeight: 800, letterSpacing: "-0.025em", color: "var(--ff-ink)" }}>
                Fit<span style={{ color: "#84cc16" }}>Fuel</span>
              </span>
            </Link>

            <p style={{ color: "var(--ff-dim)", fontSize: 13.5, lineHeight: 1.75, marginBottom: 28, maxWidth: 260 }}>
              The only health coach that controls the plate. Chef-cooked, condition-specific meals, delivered daily in Pune. Verified intake, not self-reported.
            </p>

            <div style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <a href="https://wa.me/918850446348" className="ff-flink" style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "var(--ff-dim)", textDecoration: "none", transition: "color 0.2s" }}>
                <Phone style={{ width: 14, height: 14, flexShrink: 0 }} /> WhatsApp Us
              </a>
              <a href="mailto:contact@fitfuel.in" className="ff-flink" style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "var(--ff-dim)", textDecoration: "none", transition: "color 0.2s" }}>
                <Mail style={{ width: 14, height: 14, flexShrink: 0 }} /> contact@fitfuel.in
              </a>
              <div style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "var(--ff-dim)" }}>
                <MapPin style={{ width: 14, height: 14, flexShrink: 0 }} /> Kharadi, Pune, Maharashtra
              </div>
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 28 }}>
              {[
                { href: "https://instagram.com/fitfuel.in", label: "Instagram", Icon: InstagramIcon },
                { href: "https://youtube.com/@fitfuel",     label: "YouTube",   Icon: YoutubeIcon },
              ].map(({ href, label, Icon }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="ff-social"
                  style={{ width: 38, height: 38, borderRadius: 0, background: "#111", border: "1px solid #222", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ff-dim)", textDecoration: "none", transition: "color 0.2s, border-color 0.2s, box-shadow 0.2s" }}>
                  <Icon />
                </a>
              ))}
            </div>

            {/* Kitchen trust */}
            <p style={{ fontSize: 12.5, color: "var(--ff-dim)", marginTop: 24, lineHeight: 1.6 }}>
              FSSAI Lic. No. 21523035002815
            </p>
          </div>

          <FooterCol title="Meal Plans" links={planLinks} />
          <FooterCol title="Company"    links={companyLinks} />
          <FooterCol title="Programs"   links={toolLinks} />

          {/* Trial CTA */}
          <div>
            <div style={{ background: "linear-gradient(145deg, #111, #0e0e0e)", border: "1px solid rgba(132,204,22,0.22)", borderRadius: 0, padding: 24, boxShadow: "inset 0 1px 0 rgba(255,255,255,0.03)" }}>
              <div style={{ height: 2, background: "linear-gradient(90deg, #84cc16, transparent)", margin: "-24px -24px 20px", borderTopLeftRadius: 0, borderTopRightRadius: 0 }} />
              <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(132,204,22,0.09)", color: "#a3e635", fontSize: 12, fontWeight: 800, letterSpacing: "0.12em", padding: "4px 12px", borderRadius: 0, border: "1px solid rgba(132,204,22,0.22)", textTransform: "uppercase", marginBottom: 14 }}>
                Try Today
              </span>
              <div style={{ fontSize: 18, fontWeight: 800, color: "var(--ff-ink)", marginBottom: 8, letterSpacing: "-0.01em" }}>
                Trial Day at Rs 400
              </div>
              <p style={{ color: "var(--ff-mute)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Breakfast plus Lunch delivered tomorrow. No commitment, no lock-in.
              </p>
              <Link href="/plans?trial=true" className="ff-trial-cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "#84cc16", color: "#000", fontSize: 13, fontWeight: 900, padding: "11px 0", borderRadius: 0, textDecoration: "none", letterSpacing: "0.07em", textTransform: "uppercase", transition: "background 0.2s, transform 0.2s, box-shadow 0.2s" }}>
                Start Trial
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid #181818", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <p style={{ fontSize: 12, color: "var(--ff-dim)", margin: 0, lineHeight: 1.6 }}>
            © {new Date().getFullYear()} FitFuel. All rights reserved. · GST 5% applicable on all meal plans.
          </p>
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap" }}>
            {legalLinks.map(link => (
              <Link key={link.href} href={link.href} className="ff-legal" style={{ fontSize: 12, color: "var(--ff-dim)", textDecoration: "none", transition: "color 0.2s" }}>
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .ff-flink:hover  { color: #a3e635 !important; }
        .ff-legal:hover  { color: var(--ff-mute) !important; }
        .ff-social:hover { color: #84cc16 !important; border-color: rgba(132,204,22,0.35) !important;  }
        .ff-trial-cta:hover { background: #a3e635 !important; transform: translateY(-1px);  }
        @media (max-width: 1080px) {
          .ff-footer-grid { grid-template-columns: 1fr 1fr 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 640px) {
          .ff-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 460px) {
          .ff-footer-grid { grid-template-columns: 1fr !important; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ff-trial-cta:hover { transform: none; }
        }
      `}</style>
    </footer>
  );
}
