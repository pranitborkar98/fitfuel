"use client";

// components/Footer.tsx
// Full sitemap footer. Every plan link uses a real DB slug (verified against
// prisma/seed-meal-plans.ts). Tools and program surfaces are no longer orphaned.

import Link from "next/link";
import { Zap, MapPin, Phone, Mail } from "lucide-react";
import { waLink } from "@/lib/site";
import { TRIAL_TOTAL_LABEL } from "@/lib/trial-price";

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
  { label: "Single Meals",        href: "/menu" },
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
  { label: "Partner Program",     href: "/partners" },
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

/* Column heads are the mono label device, sitting on a hairline. They were
   set in the body face at weight 800, which made four bold ink-coloured
   headings compete with the brand mark for the top of the footer. */
function FooterCol({ title, links }: { title: string; links: { label: string; href: string }[] }) {
  return (
    <div>
      <div style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 500, fontSize: 12, color: "var(--ff-dim)", textTransform: "uppercase", letterSpacing: "0.22em", paddingBottom: 12, marginBottom: 16, borderBottom: "1px solid var(--ff-rule)" }}>
        {title}
      </div>
      <div className="ff-fcol-links" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
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
    /* Recessed: darker than the page, which is how a band reads as a well cut
       into the site rather than a card floating on it. The fading lime
       gradient hairline that used to sit on top of it is gone — a gradient
       fill is on the reject list, and the accent does not get to be
       decoration. A plain 1px rule does the same structural job. */
    <footer style={{ background: "var(--ff-panel)", borderTop: "1px solid var(--ff-rule)" }}>

      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "72px 40px 44px" }}>

        <div className="ff-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.7fr 1fr 1fr 1fr 1.4fr", gap: 44 }}>

          {/* Brand */}
          <div>
            <Link href="/" className="ff-fbrand" style={{ display: "inline-flex", alignItems: "center", gap: 11, textDecoration: "none", marginBottom: 20 }}>
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

            <div className="ff-fcol-links" style={{ display: "flex", flexDirection: "column", gap: 13 }}>
              <a href={waLink()} className="ff-flink" style={{ display: "flex", alignItems: "center", gap: 11, fontSize: 13.5, color: "var(--ff-dim)", textDecoration: "none", transition: "color 0.2s" }}>
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
                  style={{ width: 38, height: 38, borderRadius: 0, background: "var(--ff-bg)", border: "1px solid var(--ff-rule)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--ff-dim)", textDecoration: "none", transition: "color 0.2s, border-color 0.2s" }}>
                  <Icon />
                </a>
              ))}
            </div>

            {/* Kitchen trust */}
            <p style={{ fontSize: 12.5, color: "var(--ff-dim)", marginTop: 24, lineHeight: 1.6 }}>
              FSSAI Lic. No. 21523035002815
            </p>

            {/* Imagery disclosure. Sits here rather than only inside the Terms
                because a claim about what our photographs are should be
                readable without opening a legal page. The detail is in
                Terms 13A; this is the pointer, not the fine print.
                The dishes, macros and prices are NOT illustrative and the line
                says so, because that distinction is the whole point. */}
            <p style={{ fontSize: 12.5, color: "var(--ff-dim)", marginTop: 12, lineHeight: 1.6, maxWidth: "46ch" }}>
              Food photographs on this site are illustrative and include stock and
              AI-generated imagery. Dish names, macros, ingredients and prices are real.{" "}
              <a href="/terms#imagery" style={{ color: "var(--ff-mute)", textDecoration: "underline" }}>
                How we use images
              </a>
            </p>
          </div>

          <FooterCol title="Meal Plans" links={planLinks} />
          <FooterCol title="Company"    links={companyLinks} />
          <FooterCol title="Programs"   links={toolLinks} />

          {/* Trial CTA.
              Was the densest concentration of rejected patterns in the
              codebase: a 145deg gradient ground, an inset highlight shadow
              faking a lit top edge, a second gradient bar above it, and a
              "TRY TODAY" eyebrow chip in lime-light. Four devices to sell one
              link.

              It is now a panel with a hairline and one lime top edge, the
              price set as a condensed figure because that is the thing being
              stated, and the house button under it. */}
          <div>
            <div style={{ background: "var(--ff-bg)", border: "1px solid var(--ff-rule)", borderTop: "2px solid var(--ff-lime)", borderRadius: 0, padding: 24 }}>
              <span style={{ display: "block", fontFamily: "var(--font-mono), monospace", fontWeight: 500, fontSize: 12, letterSpacing: "0.22em", textTransform: "uppercase", color: "var(--ff-dim)", marginBottom: 14 }}>
                Trial day
              </span>
              <div style={{ fontFamily: "var(--ff-cond)", fontWeight: 900, fontSize: 40, lineHeight: 0.86, letterSpacing: "-0.035em", color: "var(--ff-ink)", fontVariantNumeric: "tabular-nums", marginBottom: 12 }}>
                {TRIAL_TOTAL_LABEL}
              </div>
              <p style={{ color: "var(--ff-mute)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>
                Breakfast plus Lunch delivered tomorrow. No commitment, no lock-in.
              </p>
              <Link href="/plans?trial=true" className="ff-trial-cta" style={{ display: "flex", alignItems: "center", justifyContent: "center", background: "var(--ff-lime)", color: "#070707", fontFamily: "var(--ff-cond)", fontSize: 15, fontWeight: 900, padding: "14px 0", minHeight: 48, borderRadius: 0, textDecoration: "none", letterSpacing: "0.06em", textTransform: "uppercase", transition: "background 0.2s linear, color 0.2s linear" }}>
                Start trial
              </Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={{ marginTop: 56, paddingTop: 28, borderTop: "1px solid var(--ff-rule)", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
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
        /* Hover resolves to ink, not to lime-light. Thirty-odd footer links
           that each turn accent on hover is the accent used decoratively. */
        .ff-flink:hover  { color: var(--ff-ink) !important; }
        .ff-legal:hover  { color: var(--ff-mute) !important; }
        .ff-social:hover { color: var(--ff-lime) !important; border-color: var(--ff-rule-2) !important; }
        /* The button inverts rather than lifting: no transform, no shadow. */
        .ff-trial-cta:hover { background: var(--ff-ink) !important; }
        @media (max-width: 1080px) {
          .ff-footer-grid { grid-template-columns: 1fr 1fr 1fr !important; gap: 40px !important; }
        }
        @media (max-width: 640px) {
          .ff-footer-grid { grid-template-columns: 1fr 1fr !important; }
        }
        @media (max-width: 460px) {
          .ff-footer-grid { grid-template-columns: 1fr !important; }
        }

        /* Touch targets. On a mouse these links are 20px tall, which is the
           right density for a five-column sitemap. On a finger that is a
           miss waiting to happen: WCAG 2.5.5 asks for 44px, and a footer of
           thirty-odd 20px links was the single biggest tap-accuracy problem
           on the phone.

           Gated on (pointer: coarse) so the desktop layout keeps its density
           while every touch device gets the bigger target, including tablets
           in landscape. The max-width arm is there because a narrow window is
           the one case a phone-sized layout can appear on a fine pointer, and
           it costs nothing to be right there too. The row gap drops to zero
           because the padding now does that job, which keeps the footer from
           growing taller than it needs to. */
        @media (pointer: coarse), (max-width: 640px) {
          .ff-fcol-links { gap: 0 !important; }
          .ff-flink { min-height: 44px; display: flex !important; align-items: center; }
          .ff-legal { min-height: 44px; display: inline-flex !important; align-items: center; }
          .ff-social { width: 44px !important; height: 44px !important; }
          .ff-fbrand, .ff-trial-cta { min-height: 44px; }
        }
      `}</style>
    </footer>
  );
}
