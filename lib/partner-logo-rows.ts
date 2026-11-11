/** Placeholder logo rows for the partner network (2026-11-11, chintu's call).
 *
 *  Six generic tiles per category: Gyms, Corporates, Trainers, Franchise.
 *  A tile prints only its category word plus "Coming soon" and "Your logo
 *  here". It never carries a company name or a brand mark: real partners are
 *  integrated later, and a made-up name would read as a signed partner.
 *  Nutrabay is the one real partner and is NOT in this file: its tile is
 *  built from PUBLIC_PARTNERS in PartnerNetwork.tsx, where its status
 *  ("Affiliate retailer") and link (/products) already live.
 *
 *  The franchise row's apply target is the contact page: the franchise
 *  portal is a future phase and enquiries go to the founders via the
 *  contact page (public/llms.txt). There are no franchise terms, fees,
 *  territories or locations to link to, so none are stated here. */

export type LogoRowIcon = "dumbbell" | "building" | "trainer" | "storefront";

export type PlaceholderLogoGroup = {
  key: "gym" | "corporate" | "trainer" | "franchise";
  /** Plural group label, e.g. "Gyms". */
  label: string;
  /** Singular word printed on every tile in the group, e.g. "Gym". */
  tileWord: string;
  icon: LogoRowIcon;
  /** Number of placeholder tiles in the row. */
  tiles: number;
  /** Where an interested place goes: the matching apply page, or /contact
   *  for franchise, which has no apply form yet. */
  href: string;
  action: string;
};

export const PLACEHOLDER_LOGO_GROUPS: readonly PlaceholderLogoGroup[] = [
  {
    key: "gym",
    label: "Gyms",
    tileWord: "Gym",
    icon: "dumbbell",
    tiles: 6,
    href: "/partners/apply?type=gym",
    action: "Apply as a gym",
  },
  {
    key: "corporate",
    label: "Corporates",
    tileWord: "Corporate",
    icon: "building",
    tiles: 6,
    href: "/corporate",
    action: "Explore team meals",
  },
  {
    key: "trainer",
    label: "Trainers",
    tileWord: "Trainer",
    icon: "trainer",
    tiles: 6,
    href: "/partners/apply?type=trainer",
    action: "Apply as a trainer",
  },
  {
    key: "franchise",
    label: "Franchise",
    tileWord: "Franchise",
    icon: "storefront",
    tiles: 6,
    href: "/contact",
    action: "Enquire via the contact page",
  },
] as const;
