// app/locations/page.tsx — server shell, see app/about/page.tsx for the why.
//
// This is the highest-intent local-SEO surface on the site: it answers "do
// you deliver to my area". It previously shipped with no title, no
// description and no structured data, and was not linked from the homepage.

import type { Metadata } from "next";
import LocationsClient from "./LocationsClient";
import { safeJsonLd } from "@/lib/content-safety";

// Kept in sync with the zones rendered in LocationsClient.
const AREAS = [
  "Kharadi", "Viman Nagar", "Kalyani Nagar", "Koregaon Park", "Magarpatta City",
  "Amanora", "Hadapsar", "Mundhwa", "Wagholi", "Yerwada", "Vadgaon Sheri",
  "Dhanori", "Lohegaon", "Tingre Nagar", "Sangamwadi",
];

export const metadata: Metadata = {
  title: "Meal Delivery Areas in Pune",
  description:
    `FitFuel delivers chef-cooked, macro-tracked meals across east Pune: ` +
    `${AREAS.slice(0, 6).join(", ")} and more. Choose a 7–10 AM or 5–8 PM delivery window at checkout.`,
  alternates: { canonical: "/locations" },
  openGraph: {
    title: "Meal Delivery Areas in Pune",
    description: "Where FitFuel delivers, with morning and evening delivery windows.",
    url: "https://fitfuel.in/locations",
    type: "website",
  },
};

const areaLd = {
  "@context": "https://schema.org",
  "@type": "Service",
  name: "FitFuel meal delivery",
  serviceType: "Meal delivery",
  provider: { "@type": "Organization", name: "FitFuel", "@id": "https://fitfuel.in/#organization" },
  url: "https://fitfuel.in/locations",
  areaServed: AREAS.map((name) => ({
    "@type": "Place",
    name: `${name}, Pune`,
    address: {
      "@type": "PostalAddress",
      addressLocality: "Pune",
      addressRegion: "Maharashtra",
      addressCountry: "IN",
    },
  })),
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(areaLd) }}
      />
      <LocationsClient />
    </>
  );
}
