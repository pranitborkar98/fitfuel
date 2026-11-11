/** Public display only. Placeholder slots are not approved partner accounts. */
export const PUBLIC_PARTNERS = [
  {
    name: "Nutrabay",
    role: "Supplement retailer",
    status: "Affiliate retailer",
    placeholder: false,
    description:
      "Browse products on FitFuel, then buy on Nutrabay. Nutrabay handles payment and fulfilment. FitFuel may earn a commission.",
    href: "/products",
    action: "Browse supplements",
  },
  {
    name: "XYZ Gym",
    role: "Gym partner",
    status: "Placeholder",
    placeholder: true,
    description:
      "Reserved example for a future approved gym. Member referrals, a tracked code and agreed rewards.",
    href: "/partners/apply?type=gym",
    action: "Apply as a gym",
  },
  {
    name: "XYZ Company",
    role: "Corporate partner",
    status: "Placeholder",
    placeholder: true,
    description:
      "Reserved example for a future approved employer. Employee meal programmes with terms agreed for each workplace.",
    href: "/corporate",
    action: "Explore team meals",
  },
  {
    name: "XYZ Trainer",
    role: "Trainer partner",
    status: "Placeholder",
    placeholder: true,
    description:
      "Reserved example for a future approved trainer. Refer clients and track eligible rewards in the partner dashboard.",
    href: "/partners/apply?type=trainer",
    action: "Apply as a trainer",
  },
] as const;
