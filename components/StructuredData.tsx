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
  address: {
    "@type": "PostalAddress",
    streetAddress: "Kharadi",
    addressLocality: "Pune",
    addressRegion: "Maharashtra",
    postalCode: "411014",
    addressCountry: "IN",
  },
};

// FoodEstablishment rather than plain LocalBusiness: this is a licensed
// production kitchen, and the FSSAI number is the trust signal that matters
// most for an Indian food business.
const KITCHEN = {
  "@type": ["FoodEstablishment", "LocalBusiness"],
  "@id": `${SITE}/#kitchen`,
  name: "FitFuel Kitchen",
  parentOrganization: { "@id": `${SITE}/#organization` },
  url: SITE,
  image: `${SITE}/opengraph-image`,
  priceRange: "₹₹",
  servesCuisine: ["Indian", "Health food", "High protein"],
  hasCredential: {
    "@type": "EducationalOccupationalCredential",
    credentialCategory: "FSSAI Licence",
    identifier: "21523035002815",
  },
  address: ORGANISATION.address,
  geo: { "@type": "GeoCoordinates", latitude: 18.5515, longitude: 73.9435 },
  areaServed: [
    "Kharadi", "Baner", "Viman Nagar", "Koregaon Park", "Hinjewadi",
    "Wakad", "Kalyani Nagar", "Magarpatta", "Hadapsar", "Aundh",
  ].map((n) => ({ "@type": "City", name: `${n}, Pune` })),
  openingHoursSpecification: [
    {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      opens: "04:00",
      closes: "20:00",
    },
  ],
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    reviewCount: "312",
    bestRating: "5",
  },
};

const SERVICE = {
  "@type": "Service",
  "@id": `${SITE}/#service`,
  name: "Chef-cooked macro-tracked meal plan delivery",
  serviceType: "Meal plan subscription",
  provider: { "@id": `${SITE}/#organization` },
  areaServed: { "@type": "City", name: "Pune" },
  offers: {
    "@type": "Offer",
    name: "Trial day",
    description: "Breakfast plus lunch, delivered tomorrow. No lock-in.",
    price: "400",
    priceCurrency: "INR",
    url: `${SITE}/plans?trial=true`,
    availability: "https://schema.org/InStock",
  },
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Meal plans",
    itemListElement: [
      ["Weight Loss", "weight-loss-veg"],
      ["Muscle Gain", "muscle-gain-veg"],
      ["Balanced", "balanced-veg"],
      ["Diabetic", "diabetic-veg"],
      ["PCOS", "pcos-veg"],
      ["Body Recomposition", "body-recomp-veg"],
    ].map(([name, slug]) => ({
      "@type": "Offer",
      itemOffered: { "@type": "Service", name: `${name} meal plan`, url: `${SITE}/plans/${slug}` },
      priceCurrency: "INR",
      priceSpecification: {
        "@type": "PriceSpecification",
        minPrice: "112",
        priceCurrency: "INR",
        description: "Per meal, from",
      },
    })),
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
      // Content is a build-time constant, not user input.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  );
}
