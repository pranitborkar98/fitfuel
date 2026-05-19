// app/supplements/page.tsx
import { auth } from "@/lib/auth";
import SupplementsLanding from "./SupplementsLanding";

export const metadata = {
  title: "Supplements — FitFuel Premium",
  description: "Goal-based supplement stacks personalised for you. Delivered with your meals.",
};

export default async function SupplementsPage() {
  const session = await auth();
  return <SupplementsLanding isLoggedIn={!!session?.user} />;
}
