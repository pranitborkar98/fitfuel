// app/contact/page.tsx — server shell, see app/about/page.tsx for the why.

import type { Metadata } from "next";
import ContactClient from "./ContactClient";

export const metadata: Metadata = {
  title: "Contact",
  description:
    "Talk to FitFuel: WhatsApp +91 88504 46348, contact@fitfuel.in, or visit the " +
    "kitchen in Kharadi, Pune. Franchise, corporate and partner enquiries welcome.",
  alternates: { canonical: "/contact" },
  openGraph: {
    title: "Contact FitFuel Pune",
    description: "WhatsApp, email or visit the Kharadi kitchen.",
    url: "https://fitfuel.in/contact",
    type: "website",
  },
};

// ContactPage schema so the phone, email and address are machine-readable
// rather than only being laid out visually.
const contactLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  url: "https://fitfuel.in/contact",
  mainEntity: {
    "@type": "Organization",
    name: "FitFuel",
    email: "contact@fitfuel.in",
    telephone: "+91-88504-46348",
    address: {
      "@type": "PostalAddress",
      streetAddress: "Kharadi",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      postalCode: "411014",
      addressCountry: "IN",
    },
    contactPoint: [
      {
        "@type": "ContactPoint",
        contactType: "customer service",
        telephone: "+91-88504-46348",
        email: "contact@fitfuel.in",
        areaServed: "IN",
        availableLanguage: ["en", "hi", "mr"],
      },
    ],
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactLd) }}
      />
      <ContactClient />
    </>
  );
}
