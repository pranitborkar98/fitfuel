/** Public display only. Programme slots that are not live yet are shown as
 *  coming soon, under their programme name — never under a made-up partner
 *  name. */
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
    name: "Gym programme",
    role: "Gym partner",
    status: "Coming soon",
    placeholder: true,
    description:
      "Gym partnerships are being built. Member referrals, a tracked code and agreed rewards.",
    href: "/partners/apply?type=gym",
    action: "Apply as a gym",
  },
  {
    name: "Workplace programme",
    role: "Corporate partner",
    status: "Coming soon",
    placeholder: true,
    description:
      "Workplace meal programmes are being built, with terms agreed for each workplace.",
    href: "/corporate",
    action: "Explore team meals",
  },
  {
    name: "Trainer programme",
    role: "Trainer partner",
    status: "Coming soon",
    placeholder: true,
    description:
      "Trainer partnerships are being built. Refer clients and track eligible rewards in the partner dashboard.",
    href: "/partners/apply?type=trainer",
    action: "Apply as a trainer",
  },
] as const;
