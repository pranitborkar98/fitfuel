// Role-gated operations shell. Each page still enforces its own surface.

import { canAccess, getAdminUser, type Surface } from "@/lib/admin-auth";
import Link from "next/link";
import { redirect } from "next/navigation";
import AdminNav from "./AdminNav";
import styles from "./admin-shell.module.css";

export const dynamic = "force-dynamic";

const NAV: { label: string; href: string; surface: Surface }[] = [
  { label: "Dispatch", href: "/admin", surface: "dispatch" },
  { label: "Production", href: "/admin/production", surface: "production" },
  { label: "Drivers", href: "/admin/drivers", surface: "drivers" },
  { label: "Plans", href: "/admin/plans", surface: "plans" },
  { label: "Recipes", href: "/admin/recipes", surface: "recipes" },
  { label: "Orders", href: "/admin/orders", surface: "orders" },
  { label: "Subscribers", href: "/admin/subscribers", surface: "subscribers" },
  { label: "Content", href: "/admin/content", surface: "content" },
  { label: "Notifications", href: "/admin/notifications", surface: "notifications" },
  { label: "Staff", href: "/admin/staff", surface: "staff" },
  { label: "Partners", href: "/admin/partners", surface: "partners" },
  { label: "Supplements", href: "/admin/supplements", surface: "supplements" },
  { label: "Coupons", href: "/admin/coupons", surface: "coupons" },
];

function roleLabel(value: string): string {
  const lower = value.toLowerCase();
  return lower.charAt(0).toUpperCase() + lower.slice(1);
}

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/");

  const links = NAV.filter((item) => canAccess(admin.role, item.surface)).map(({ label, href }) => ({ label, href }));
  const displayName = admin.name ?? admin.email ?? "FitFuel staff";
  const initial = displayName.trim().charAt(0).toUpperCase() || "F";

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarTop}>
          <Link href="/admin" className={styles.brand} aria-label="FitFuel operations home">
            <span>F</span>
            <div><strong>FitFuel</strong><small>Operations</small></div>
          </Link>
          <div className={styles.mobileUser} title={displayName}>{initial}</div>
        </div>

        <AdminNav links={links} />

        <div className={styles.user}>
          <span>{initial}</span>
          <div><strong>{displayName}</strong><small>{roleLabel(admin.role)}</small></div>
        </div>
      </aside>
      <div className={styles.workspace}>
        <main className={styles.main}>{children}</main>
      </div>
    </div>
  );
}
