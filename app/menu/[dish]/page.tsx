import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";

import { DISHES, dishId, isOrderable } from "@/lib/menu-cart";
import { SHOP_DISH_BY_ID, SHOP_DISHES } from "@/app/_shop/catalog";
import { FSSAI_LICENCE } from "@/lib/trust-marks";
import { resolveImage } from "@/lib/site-images";
import { cutoffLabel } from "@/lib/order-cutoff";
import AppChrome from "@/app/_web/AppChrome";
import Areas from "@/app/_hp/Areas";
import DishPage from "./DishPage";

/* ══════════════════════════════════════════════════════════════════════════
   THE INDIVIDUAL DISH PAGE.

   Plans had app/plans/[slug] all along. Dishes had nothing — a dish existed
   only as a card and a modal inside the app, with no URL, so it could not be
   linked, shared, indexed or sent to a customer. That is the gap.

   WHAT THIS PAGE CAN HONESTLY SHOW, and why it is not richer.
   The Recipe model is deep — 45 columns including iron, calcium, vitamin
   D/C/B12, folate, sodium, potassium, omega-3, zinc, magnesium, selenium and
   glycaemic index, plus RecipeIngredient (520 rows) and RecipeStep (126 rows
   with technique, temperature and kitchen notes). NONE of it is available here:
   all 30 Recipe rows are PLAN meals, and 0 of the 48 à la carte dishes has one.

   So this page shows what lib/menu-alacarte actually holds — name, course,
   description, price, the add-on ladder, any variant — plus the per-portion
   macro ESTIMATES from app/_shop/catalog.ts, which are labelled as estimates
   because that file is explicit they are computed from the ingredient list
   rather than weighed. When a dish gets a Recipe row, the ingredients, the
   method and the full micronutrient panel belong on this page.

   Statically generated for all 48 dishes: this is the surface search engines
   and WhatsApp link previews see.
   ══════════════════════════════════════════════════════════════════════════ */

type Props = { params: Promise<{ dish: string }> };

/** All 48, prerendered. Next 16 requires params to be awaited. */
export function generateStaticParams() {
  return DISHES.map((d) => ({ dish: d.id }));
}

export const viewport: Viewport = {
  themeColor: "#070707",
  colorScheme: "dark",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { dish: id } = await params;
  const d = SHOP_DISH_BY_ID.get(id);
  if (!d) return { title: "Dish not found" };

  const priced = isOrderable(d);
  return {
    title: d.name,
    description: `${d.blurb} ${priced ? `₹${d.price} from the FitFuel kitchen in Pune.` : "Priced on request."}`,
    alternates: { canonical: `/menu/${id}` },
    openGraph: {
      title: `${d.name} — FitFuel`,
      description: d.blurb,
      url: `/menu/${id}`,
      type: "article",
    },
  };
}

export default async function Page({ params }: Props) {
  const { dish: id } = await params;
  const d = SHOP_DISH_BY_ID.get(id);
  if (!d) notFound();

  /* Other dishes from the same course, so the page is a way further into the
     menu rather than a dead end. */
  const related = SHOP_DISHES.filter((x) => x.category === d.category && x.id !== d.id).slice(0, 6);

  const img = resolveImage("dishes", d.slot);

  /* THE APP SHELL. These 48 pages are reached by tapping a card on `/`, and
     until now that tap dropped the customer out of the app and onto the
     marketing site — a different header, no search, no location, no basket and
     no tab bar, with the browser back button as the only way home. The shell is
     the same header and tabs the homepage draws, and the same cart context, so
     the basket count does not reset when you open a dish. */
  return (
    <AppChrome
      cutoff={cutoffLabel()}
      areaPanel={<Areas />}
    >
    <DishPage
      dish={d}
      related={related}
      licence={FSSAI_LICENCE}
      imageSrc={img?.src ?? null}
      /* Product schema so a dish is a real, indexable product with a price.
         Only emitted when the kitchen has actually set one — 32 of the 48 sit
         on a placeholder and publishing that as an offer would be publishing a
         price we will not honour. */
      jsonLd={
        isOrderable(d)
          ? {
              "@context": "https://schema.org",
              "@type": "Product",
              name: d.name,
              description: d.blurb,
              category: d.categoryLabel,
              brand: { "@type": "Brand", name: "FitFuel" },
              offers: {
                "@type": "Offer",
                price: String(d.price),
                priceCurrency: "INR",
                availability: "https://schema.org/InStock",
              },
            }
          : null
      }
    />
    </AppChrome>
  );
}

/** Kept beside the page so the id helper cannot drift from the route. */
export const __dishIdHelper = dishId;
