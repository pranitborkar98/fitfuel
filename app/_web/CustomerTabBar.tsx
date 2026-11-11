"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CUSTOMER_NAV,
  activeCustomerNav,
  type CustomerMode,
  type CustomerNavKey,
} from "./customer-nav";
import s from "./customer-tab-bar.module.css";

const ICON: Record<CustomerNavKey, string> = {
  dishes: "M3 11h18a9 9 0 0 1-18 0ZM7 11a5 5 0 0 1 10 0M12 3v3",
  plans: "m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5",
  supps: "M9 3h6v4l4 4a6 6 0 0 1-4 10H9a6 6 0 0 1-4-10l4-4V3ZM8 10h8M9 3h6",
  coach: "M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8ZM8 9h8M8 13h5",
  today: "M8 2v3M16 2v3M4 8h16M5 4h14a2 2 0 0 1 2 2v14H3V6a2 2 0 0 1 2-2ZM8 12h3v3H8v-3Z",
};

function Icon({ name }: { name: CustomerNavKey }) {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      <path d={ICON[name]} />
    </svg>
  );
}

export default function CustomerTabBar({
  mode = "dishes",
  onCatalogSelect,
  activeKey,
}: {
  mode?: CustomerMode;
  onCatalogSelect?: (mode: CustomerMode) => void;
  activeKey?: CustomerNavKey;
}) {
  const pathname = usePathname() || "";
  const active = activeKey ?? activeCustomerNav(pathname, mode);
  const switchesHomepage = pathname === "/" && !!onCatalogSelect;

  return (
    <nav className={s.bar} aria-label="FitFuel">
      {CUSTOMER_NAV.map((item) => {
        const on = active === item.key;
        const content = (
          <>
            <Icon name={item.key} />
            {item.shortLabel ? (
              <>
                <span className={`${s.label} ${s.labelLong}`}>
                  {item.label}
                </span>
                <span className={`${s.label} ${s.labelShort}`}>
                  {item.shortLabel}
                </span>
              </>
            ) : (
              <span className={s.label}>{item.label}</span>
            )}
          </>
        );

        if (item.kind === "catalog" && switchesHomepage) {
          return (
            <button
              key={item.key}
              type="button"
              className={`${s.tab} ${on ? s.active : ""}`}
              onClick={() => onCatalogSelect(item.key)}
              aria-label={`Open ${item.accessibleLabel}`}
              aria-pressed={on}
            >
              {content}
            </button>
          );
        }

        return (
          <Link
            key={item.key}
            href={item.href}
            className={`${s.tab} ${on ? s.active : ""}`}
            aria-label={`Open ${item.accessibleLabel}`}
            aria-current={on ? "page" : undefined}
          >
            {content}
          </Link>
        );
      })}
    </nav>
  );
}
