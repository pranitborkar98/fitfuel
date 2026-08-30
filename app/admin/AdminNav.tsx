"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./admin-shell.module.css";

export default function AdminNav({ links }: { links: { label: string; href: string }[] }) {
  const pathname = usePathname();

  return (
    <nav className={styles.nav} aria-label="Operations sections">
      {links.map((link) => {
        const active = link.href === "/admin"
          ? pathname === "/admin"
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`${styles.navLink} ${active ? styles.navActive : ""}`}
            aria-current={active ? "page" : undefined}
          >
            <span aria-hidden="true" />
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
