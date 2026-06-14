// app/supplements/page.tsx
// Phase 18-1 — Server-side fetch supplements from DB, pass to client renderer.
// Replaces direct static-import pattern.

import { auth } from "@/lib/auth";
import SupplementsLanding from "./SupplementsLanding";
import { getAllSupplements } from "@/lib/supplements-db";

export const metadata = {
  title: "Supplements — FitFuel Premium",
  description: "Goal-based supplement stacks personalised for you. Delivered with your meals.",
};

export const dynamic = "force-dynamic";

export default async function SupplementsPage() {
  const [session, supplements] = await Promise.all([
    auth(),
    getAllSupplements(),
  ]);

  return (
    <SupplementsLanding
      isLoggedIn={!!session?.user}
      supplements={supplements}
    />
  );
}
