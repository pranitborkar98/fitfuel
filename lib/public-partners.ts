/** Public display only. Partnership slots that are not live yet are shown
 *  as coming soon, under their partnership name — never under a made-up
 *  partner name. */
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
    name: "Gym partnerships",
    role: "Gym partner",
    status: "Coming soon",
    placeholder: true,
    description:
      "A place for a future approved gym. Member referrals, a tracked code and agreed rewards.",
    href: "/partners/apply?type=gym",
    action: "Apply as a gym",
  },
  {
    name: "Corporate partnerships",
    role: "Corporate partner",
    status: "Coming soon",
    placeholder: true,
    description:
      "A place for a future approved employer. Employee meal programmes with terms agreed for each workplace.",
    href: "/corporate",
    action: "Explore team meals",
  },
  {
    name: "Trainer partnerships",
    role: "Trainer partner",
    status: "Coming soon",
    placeholder: true,
    description:
      "A place for a future approved trainer. Refer clients and track eligible rewards in the partner dashboard.",
    href: "/partners/apply?type=trainer",
    action: "Apply as a trainer",
  },
] as const;
