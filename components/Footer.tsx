import Link from "next/link";
import { Zap, MapPin, Phone, Mail } from "lucide-react";

const planLinks = [
  { label: "Muscle Gain", href: "/plans/muscle-gain" },
  { label: "Weight Loss", href: "/plans/weight-loss" },
  { label: "Balanced Diet", href: "/plans/balanced-diet" },
  { label: "Office Employee", href: "/plans/office-employee" },
  { label: "Jain Diet", href: "/plans/jain-diet" },
];

const companyLinks = [
  { label: "About Us", href: "/about" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Delivery Locations", href: "/locations" },
  { label: "Blog", href: "/blog" },
  { label: "Contact", href: "/contact" },
];

const legalLinks = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms & Conditions", href: "/terms" },
  { label: "Refund Policy", href: "/refunds" },
];

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.96C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.96A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-[#080808] border-t border-[#1f1f1f]">
      <div className="glow-line" />
      <div className="container mx-auto px-6 max-w-[1200px] py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">

          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="w-8 h-8 bg-[#84cc16] rounded-lg flex items-center justify-center transition-transform group-hover:scale-110">
                <Zap className="w-5 h-5 text-black" fill="black" />
              </div>
              <span className="text-xl font-bold tracking-tight">
                Fit<span className="text-[#84cc16]">Fuel</span>
              </span>
            </Link>
            <p className="text-[#a3a3a3] text-sm leading-relaxed mb-6">
              Pune's premium goal-based meal delivery. Fresh, chef-cooked, delivered to your door every day.
            </p>

            <div className="flex flex-col gap-3">
              <a href="https://wa.me/91XXXXXXXXXX" className="flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-[#84cc16] transition-colors">
                <Phone className="w-4 h-4 shrink-0" /> WhatsApp Us
              </a>
              <a href="mailto:pranitborkar98@gmail.com" className="flex items-center gap-2 text-sm text-[#a3a3a3] hover:text-[#84cc16] transition-colors">
                <Mail className="w-4 h-4 shrink-0" /> pranitborkar98@gmail.com
              </a>
              <div className="flex items-center gap-2 text-sm text-[#a3a3a3]">
                <MapPin className="w-4 h-4 shrink-0" /> Kharadi, Pune, Maharashtra
              </div>
            </div>

            {/* Social icons */}
            <div className="flex items-center gap-3 mt-6">
              <a
                href="https://instagram.com/fitfuel.in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#111111] border border-[#1f1f1f] flex items-center justify-center text-[#a3a3a3] hover:text-[#84cc16] hover:border-[rgba(132,204,22,0.3)] transition-all"
                aria-label="Instagram"
              >
                <InstagramIcon />
              </a>
              <a
                href="https://youtube.com/@fitfuel"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-[#111111] border border-[#1f1f1f] flex items-center justify-center text-[#a3a3a3] hover:text-[#84cc16] hover:border-[rgba(132,204,22,0.3)] transition-all"
                aria-label="YouTube"
              >
                <YoutubeIcon />
              </a>
            </div>
          </div>

          {/* Meal Plans */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Meal Plans</h3>
            <ul className="flex flex-col gap-2.5">
              {planLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#a3a3a3] hover:text-[#84cc16] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Company</h3>
            <ul className="flex flex-col gap-2.5">
              {companyLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-[#a3a3a3] hover:text-[#84cc16] transition-colors">{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Trial CTA */}
          <div>
            <div className="bg-[#111111] border border-[rgba(132,204,22,0.2)] rounded-xl p-5">
              <div className="badge mb-3">Try Today</div>
              <h3 className="text-white font-bold text-lg mb-1">Trial Day — ₹400</h3>
              <p className="text-[#a3a3a3] text-sm mb-4">Breakfast + Lunch delivered tomorrow. No commitment.</p>
              <Link href="/plans" className="btn-primary text-sm w-full justify-center">Start Trial</Link>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-[#1f1f1f] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[#525252] text-sm">
            © {new Date().getFullYear()} FitFuel. All rights reserved. GST: 5% applicable on all meal plans.
          </p>
          <div className="flex items-center gap-4">
            {legalLinks.map((link) => (
              <Link key={link.href} href={link.href} className="text-xs text-[#525252] hover:text-[#a3a3a3] transition-colors">{link.label}</Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
