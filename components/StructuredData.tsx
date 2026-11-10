// components/StructuredData.tsx
//
// Machine-readable statement of what this business is, where it operates and
// what it sells. The site previously shipped none of this outside /faq and
// /blog, which meant every fact on the homepage (FSSAI licence, delivery
// window, service area, price floor, ratings) existed only as prose that a
// crawler or answer engine had to infer.
//
// Rendered as a plain <script> in the server tree, so it lands in the SSR
// HTML with no client cost.
import { safeJsonLd } from "@/lib/content-safety";

const SITE = "https://fitfuel.in";

const ORGANISATION = {
  "@type": "Organization",
  "@id": `${SITE}/#organization`,
  name: "FitFuel",
  url: SITE,
  logo: { "@type": "ImageObject", url: `${SITE}/icon`, width: 512, height: 512 },
  email: "contact@fitfuel.in",
  telephone: "+91-88504-46348",
  sameAs: [
    "https://instagram.com/fitfuel.in",
    "https://youtube.com/@fitfuel",
  ],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "FSSAI Licence",
    identifier: "21523035002815",
  },
};

// FoodEstablishment rather than plain LocalBusiness: this is a production
// kitchen. No address, geo pin or area list here: kitchens are franchise
// locations, so the FSSAI licence sits on the organisation above and delivery
// areas are checked against the customer's address.
const KITCHEN = {
  "@type": ["FoodEstablishment", "LocalBusiness"],
  "@id": `${SITE}/#kitchen`,
  name: "FitFuel Kitchen",
  parentOrganization: { "@id": `${SITE}/#organization` },
  url: SITE,
  image: `${SITE}/images/hero-bowl-v2.png`,
  priceRange: "₹₹",
  servesCuisine: ["Indian", "Thai", "Mediterranean", "Mexican", "Asian", "Health food", "High protein"],
};

const SERVICE = {
  "@type": "Service",
  "@id": `${SITE}/#service`,
  name: "Chef-cooked macro-tracked meal plan delivery",
  serviceType: "Meal plan subscription",
  provider: { "@id": `${SITE}/#organization` },
  offers: {
    "@type": "Offer",
    name: "Trial day",
    description: "Breakfast plus lunch with delivery, packaging and GST included. No subscription.",
    price: "420",
    priceCurrency: "INR",
    url: `${SITE}/plans?trial=true`,
    availability: "https://schema.org/InStock",
  },
};

const WEBSITE = {
  "@type": "WebSite",
  "@id": `${SITE}/#website`,
  url: SITE,
  name: "FitFuel",
  publisher: { "@id": `${SITE}/#organization` },
  inLanguage: "en-IN",
};

export default function StructuredData() {
  const graph = {
    "@context": "https://schema.org",
    "@graph": [ORGANISATION, KITCHEN, SERVICE, WEBSITE],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: safeJsonLd(graph) }}
    />
  );
}
