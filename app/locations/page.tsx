// app/locations/page.tsx — server shell, see app/about/page.tsx for the why.
//
// This is the highest-intent local-SEO surface on the site: it answers "do
// you deliver to my area". It previously shipped with no title, no
// description and no structured data, and was not linked from the homepage.

import type { Metadata } from "next";
import LocationsClient from "./LocationsClient";

// Kept in sync with the zones rendered in LocationsClient.
const AREAS = [
  "Kharadi", "Viman Nagar", "Kalyani Nagar", "Koregaon Park", "Magarpatta City",
  "Amanora", "Hadpsar", "Mundhwa", "Wagholi", "Yerwada", "Vadgaon Sheri",
  "Dhanori", "Lohegaon", "Tingre Nagar", "Sangamwadi",
];

export const metadata: Metadata = {
  title: "Meal Delivery Areas in Pune",
  description:
    `FitFuel delivers chef-cooked, macro-tracked meals across east Pune: ` +
    `${AREAS.slice(0, 6).join(", ")} and more. Cooked from 04:00, at your door by 08:00, six days a week.`,
  alternates: { canonical: "/locations" },
  openGraph: {
    title: "Meal Delivery Areas in Pune",
    description: "Where FitFuel delivers, and the daily 08:00 delivery window.",
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
  hoursAvailable: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
    opens: "04:00",
    closes: "08:00",
  },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(areaLd) }}
      />
      <LocationsClient />
    </>
  );
}
