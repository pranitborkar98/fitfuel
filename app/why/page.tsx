import { redirect } from "next/navigation";

/** The connected-product argument now lives on the homepage. Keep this old
 * public URL useful without maintaining a second, contradictory storefront. */
export default function WhyPage() {
  redirect("/");
}
