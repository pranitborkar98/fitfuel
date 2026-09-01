import type { Metadata, Viewport } from "next";
import Link from "next/link";
import AppChrome from "@/app/_web/AppChrome";
import { SHOP_DISHES, dishSlot } from "@/app/_shop/catalog";
import { resolveImage } from "@/lib/site-images";
import { cutoffLabel } from "@/lib/order-cutoff";
import { DELIVERY_WINDOWS } from "@/lib/delivery-windows";
import MenuCatalog from "./MenuCatalog";

export const metadata: Metadata = {
  title: "Single Dishes and Healthy Meals in Pune",
  description:
    "Browse FitFuel salads, bowls, breakfasts, bars and juices. Priced dishes can be added to the basket; unpublished prices are clearly marked.",
  alternates: { canonical: "/menu" },
};

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

function dishImages() {
  const images: Record<string, string> = {};
  for (const dish of SHOP_DISHES) {
    const image = resolveImage("dishes", dishSlot(dish.name));
    if (image) images[dish.id] = image.src;
  }
  return images;
}

export default async function MenuPage({
  searchParams,
}: {
  searchParams: Promise<{ course?: string | string[]; q?: string | string[] }>;
}) {
  const params = await searchParams;
  const course = Array.isArray(params.course) ? params.course[0] : params.course;
  const query = Array.isArray(params.q) ? params.q[0] : params.q;

  return (
    <AppChrome
      cutoff={cutoffLabel()}
      areaPanel={
        <div style={{ padding: 20 }}>
          <p style={{ color: "var(--fk-ink-2)", fontSize: 15, lineHeight: 1.65 }}>
            Delivery availability depends on the address you choose. Meal-plan deliveries use a {DELIVERY_WINDOWS.MORNING.time} or {DELIVERY_WINDOWS.EVENING.time} window where available.
          </p>
          <Link href="/locations" className="fk-btn fk-btn-primary" style={{ marginTop: 18 }}>Check your pincode</Link>
        </div>
      }
    >
      <MenuCatalog dishes={SHOP_DISHES} images={dishImages()} initialCourse={course} initialQuery={query} />
    </AppChrome>
  );
}
