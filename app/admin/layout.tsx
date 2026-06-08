// app/admin/layout.tsx
// Phase 10 -- command center shell. Every /admin/* page is gated here.

import { getAdminUser } from "@/lib/admin-auth";
import { redirect } from "next/navigation";
import Link from "next/link";

export const dynamic = "force-dynamic";

const T = {
  bg: "#080808",
  card: "#101010",
  border: "#222",
  text: "#ffffff",
  textMuted: "#888888",
  accent: "#84cc16",
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await getAdminUser();
  if (!admin) redirect("/"); // not logged in, or not ADMIN/OWNER

  return (
    <div style={{ minHeight: "100vh", background: T.bg, color: T.text, fontFamily: "system-ui, sans-serif" }}>
      <header
        style={{
          borderBottom: `1px solid ${T.border}`,
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          position: "sticky",
          top: 0,
          background: T.bg,
          zIndex: 10,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <span style={{ fontSize: 13, fontWeight: 800, color: T.accent, letterSpacing: 1, textTransform: "uppercase" }}>
            FitFuel &middot; Ops
          </span>
          <nav style={{ display: "flex", gap: 16, fontSize: 14 }}>
            <Link href="/admin" style={{ color: T.text, textDecoration: "none", fontWeight: 600 }}>Dispatch</Link>
            <Link href="/admin/production" style={{ color: T.textMuted, textDecoration: "none", fontWeight: 600 }}>Production</Link>
            <Link href="/admin/drivers" style={{ color: T.textMuted, textDecoration: "none", fontWeight: 600 }}>Drivers</Link>
          </nav>
        </div>
        <span style={{ fontSize: 12, color: T.textMuted }}>
          {admin.name ?? admin.email} &middot; {admin.role}
        </span>
      </header>
      <main style={{ maxWidth: 1100, margin: "0 auto", padding: "22px 16px 80px" }}>{children}</main>
    </div>
  );
}