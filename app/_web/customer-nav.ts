export type CustomerMode = "dishes" | "plans" | "supps";
export type CustomerNavKey = CustomerMode | "coach" | "today";

export type CustomerNavItem =
  | {
      kind: "catalog";
      key: CustomerMode;
      label: string;
      shortLabel?: string;
      accessibleLabel: string;
      href: string;
    }
  | {
      kind: "link";
      key: "supps" | "coach" | "today";
      label: string;
      shortLabel?: string;
      accessibleLabel: string;
      href: string;
    };

/**
 * The five top-level customer destinations. This is deliberately separate
 * from the dashboard's internal tool list: top-level navigation must not
 * change merely because someone opens Coach or Today.
 */
export const CUSTOMER_NAV: readonly CustomerNavItem[] = [
  {
    kind: "catalog",
    key: "dishes",
    label: "Meals",
    accessibleLabel: "single meals",
    href: "/?mode=dishes#catalog",
  },
  {
    kind: "catalog",
    key: "plans",
    label: "Plans",
    accessibleLabel: "meal plans",
    href: "/?mode=plans#catalog",
  },
  {
    kind: "link",
    key: "supps",
    label: "Supplements",
    shortLabel: "Supps",
    accessibleLabel: "supplement marketplace",
    href: "/products",
  },
  {
    kind: "link",
    key: "coach",
    label: "Coach",
    accessibleLabel: "AI coach",
    href: "/dashboard/trainer",
  },
  {
    kind: "link",
    key: "today",
    label: "Today",
    accessibleLabel: "today dashboard",
    href: "/dashboard",
  },
] as const;

/** Exactly one top-level tab is current on every customer-facing app route. */
export function activeCustomerNav(
  pathname: string,
  homeMode: CustomerMode = "dishes",
): CustomerNavKey | null {
  if (pathname === "/") return homeMode;
  if (pathname === "/menu" || pathname.startsWith("/menu/")) return "dishes";
  if (pathname === "/plans" || pathname.startsWith("/plans/")) return "plans";
  if (
    pathname === "/products" ||
    pathname.startsWith("/products/") ||
    pathname === "/supplements" ||
    pathname.startsWith("/supplements/")
  ) {
    return "supps";
  }
  if (
    pathname === "/dashboard/trainer" ||
    pathname.startsWith("/dashboard/trainer/") ||
    pathname === "/dashboard/coach" ||
    pathname.startsWith("/dashboard/coach/")
  ) {
    return "coach";
  }
  if (pathname === "/dashboard" || pathname === "/dashboard-preview" || pathname.startsWith("/dashboard/")) {
    return "today";
  }
  return null;
}
