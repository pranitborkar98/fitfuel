// app/dashboard/layout.tsx
//
// Was `<>{children}</>`, which is why the app had no persistent navigation and
// every sub-page was a dead end. It now mounts the shell once, so the nav is
// server-rendered on the first paint of every screen rather than popping in.
//
// The partner console is the one item whose visibility depends on the viewer,
// so it is resolved here, once, rather than by a fetch inside the client shell.

import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AppShell from "@/app/_app/AppShell";

/* App surfaces stay out of the index but still carry real titles, because a
   screen without one is unusable in a tab strip or a share sheet. */
export const metadata: Metadata = {
  title: { default: "Dashboard", template: "%s · FitFuel" },
  robots: { index: false, follow: false },
};

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();

  let isPartner = false;
  if (session?.user?.id) {
    try {
      const owned = await prisma.partner.findUnique({
        where: { ownerUserId: session.user.id },
        select: { type: true },
      });
      /* A CUSTOMER-type partner row is a peer-to-peer referrer, not a console
         owner. Same rule app/dashboard/page.tsx already applies. */
      isPartner = !!owned && owned.type !== "CUSTOMER";
    } catch {
      isPartner = false;
    }
  }

  return <AppShell isPartner={isPartner}>{children}</AppShell>;
}
