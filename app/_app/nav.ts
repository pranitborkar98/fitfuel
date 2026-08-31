// app/_app/nav.ts
//
// THE MOAT MAP. One list, and it is the only place the app's navigation is
// declared. Every capability the backend already ships gets a reachable URL
// here, because a shipped moat with no route is a moat nobody can see.
//
// Backed by, in order: /api/user/active-plan/*, /api/nutrition/*,
// /api/workout/*, /api/user/metrics/*, /api/coach/*, /api/user/referrals,
// /api/user/partner, /api/admin/supplements, /api/user/deliveries.

export type NavItem = {
  href: string;
  /** Sidebar and mobile tools-menu label. */
  label: string;
  /** What the screen is for, shown in the More sheet and as the sidebar title. */
  blurb: string;
  /** lucide-react icon name, resolved in AppShell. */
  icon: IconName;
  /** Only rendered when the viewer owns a partner account. */
  partnerOnly?: boolean;
};

export type IconName =
  | "Zap" | "Utensils" | "Dumbbell" | "Activity" | "Sparkles"
  | "TrendingUp" | "Pill" | "Gift" | "Briefcase" | "Truck"
  | "Bell" | "User";

export type NavGroup = { key: string; label: string; items: NavItem[] };

export const NAV: NavGroup[] = [
  {
    key: "today",
    label: "Your day",
    items: [
      { href: "/dashboard", label: "Today", blurb: "Your day, your meals, your targets", icon: "Zap" },
      { href: "/dashboard/trainer", label: "AI coach", blurb: "A conversation grounded in your plan and recent data", icon: "Sparkles" },
      { href: "/dashboard/coach", label: "Weekly review", blurb: "Your deterministic review and recalibration", icon: "TrendingUp" },
    ],
  },
  {
    key: "intake",
    label: "Intake",
    items: [
      { href: "/dashboard/nutrition", label: "Nutrition", blurb: "Diary, water, and the food database", icon: "Utensils" },
      { href: "/dashboard/supplements", label: "Supplements", blurb: "Researched, not stocked", icon: "Pill" },
    ],
  },
  {
    key: "output",
    label: "Output",
    items: [
      { href: "/dashboard/exercises", label: "Training", blurb: "Sessions, sets, and the exercise library", icon: "Dumbbell" },
      { href: "/dashboard/body-metrics", label: "Body", blurb: "Weigh-ins over Bluetooth, no typing", icon: "Activity" },
      { href: "/dashboard/progress", label: "Progress", blurb: "Consistency and the trend line", icon: "TrendingUp" },
    ],
  },
  {
    key: "account",
    label: "Account",
    items: [
      { href: "/dashboard/referrals", label: "Referrals", blurb: "One code, two credits, paid on delivery", icon: "Gift" },
      { href: "/dashboard/partners", label: "Partner console", blurb: "Your gym, clinic or studio, and its payouts", icon: "Briefcase", partnerOnly: true },
      { href: "/dashboard/notification-settings", label: "Notifications", blurb: "What we send, and when", icon: "Bell" },
      { href: "/dashboard/profile", label: "Profile", blurb: "Your details, addresses and plan", icon: "User" },
    ],
  },
];

/** Flat list, in sidebar order. */
export const ALL_ITEMS: NavItem[] = NAV.flatMap((g) => g.items);

/**
 * Longest-prefix match, so /dashboard/nutrition does not also light up
 * /dashboard. Exact match wins for the index route.
 */
export function activeHref(pathname: string): string | null {
  let best: string | null = null;
  for (const item of ALL_ITEMS) {
    if (pathname === item.href) return item.href;
    if (pathname.startsWith(item.href + "/") && (!best || item.href.length > best.length)) {
      best = item.href;
    }
  }
  return best;
}
