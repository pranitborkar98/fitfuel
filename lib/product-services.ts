/** Customer-facing capabilities with explicit availability, not a roadmap. */
export const PRODUCT_SERVICES = [
  {
    title: "Meals delivered",
    detail:
      "Choose individual meals or a meal plan. Check your address for kitchen coverage and available delivery days.",
    availability: "Address-based availability",
    href: "/?mode=dishes#catalog",
    action: "Explore the menu",
  },
  {
    title: "Personalised meal plans",
    detail:
      "Choose your goal and dietary preference, review your calorie target and see the portions before you order.",
    availability: "Delivered plans in service areas",
    href: "/plans",
    action: "Find a meal plan",
  },
  {
    title: "Digital plans",
    detail:
      "Cook at home with a recipe plan, nutrition information and a grocery list. No food delivery is included.",
    availability: "Available without delivery coverage",
    href: "/plans/digital",
    action: "Explore digital plans",
  },
  {
    title: "Food & water diary",
    detail:
      "Log meals and water, set nutrition targets and review what you have recorded today.",
    availability: "Sign-in required; no meal plan needed",
    href: "/dashboard/nutrition",
    action: "Open your diary",
  },
  {
    title: "Training & body measurements",
    detail:
      "Browse exercises, record workout sets and follow weight measurements. Manual entry is available; scale connection needs a compatible device and browser.",
    availability: "Personal account tools",
    href: "/dashboard/exercises",
    action: "Explore training",
  },
  {
    title: "Coach & weekly review",
    detail:
      "Review your logged progress and discuss your routine. AI coaching depends on service availability and is not medical care.",
    availability: "Sign-in required; reviews need logged data",
    href: "/dashboard/trainer",
    action: "Open the coach",
  },
  {
    title: "Supplements from Nutrabay",
    detail:
      "Compare retailer products and read ingredient guidance where available. Checkout, shipping and returns are handled by Nutrabay.",
    availability: "Affiliate retailer links",
    href: "/products",
    action: "Browse supplements",
  },
  {
    title: "Meals for workplaces",
    detail:
      "Apply for employee meal programmes and an agreed corporate discount. Coverage, delivery and invoicing terms are reviewed with your team.",
    availability: "Application and approval required",
    href: "/corporate",
    action: "Plan team meals",
  },
  {
    title: "Partner & referral programmes",
    detail:
      "Gyms, trainers, creators and organisations can apply for tracked referrals. Existing customers have their own referral page.",
    availability: "Partner codes activate after approval",
    href: "/partners",
    action: "Explore partner programmes",
  },
] as const;
