import type { Metadata } from "next";

import { MENU_STATS, MENU_FROM } from "@/lib/menu-alacarte";
import { DISHES, ORDERABLE_COUNT, ENQUIRY_COUNT } from "@/lib/menu-cart";
import { dishSlug, findDishImage } from "@/app/_hp/DishImage";
import { cutoffLabel } from "@/lib/order-cutoff";
import AppChrome from "@/app/_web/AppChrome";
import Areas from "@/app/_hp/Areas";
import MenuClient, { type MenuDish } from "./MenuClient";

/* ══════════════════════════════════════════════════════════════════════════
   /menu — THE À LA CARTE STOREFRONT.

   WHY THIS PAGE DID NOT EXIST. It nearly did. lib/menu-alacarte.ts has held 48
   priced-and-blurbed dishes since it was written, and the only thing that ever
   rendered them was app/_home/Menu.tsx — a section of the PREVIOUS homepage.
   app/page.tsx renders _hp. So the file was orphaned: the one genuinely
   e-commerce part of this business existed in the repo and on no URL.

   That is the real answer to "it doesn't look like an e-commerce website". It
   is not the corner radius and it is not the photography. There was no shop.

   WHAT IS SOLD HERE, AND WHAT IS NOT.

   16 dishes carry prices the kitchen actually set (salads, keto). Those get a
   quantity, an add-on and a running total.

   32 dishes — every bowl, breakfast, bar and juice — are on the Rs 100
   placeholder flagged `provisional: true`. They are LISTED IN FULL and they
   are NOT BUYABLE. A customer can put them on an enquiry list that rides along
   with the order message.

   Both halves of that were a decision:

     Listing them   — hiding two-thirds of the menu to make the shop look
                      tidier would misrepresent the kitchen's range, and the
                      blurbs are real.
     Not selling    — Rs 100 is a placeholder someone will screenshot. The
                      header of lib/menu-alacarte.ts says outright that someone
                      WILL try to order at that price. This is the code that
                      makes sure they cannot.

   Clearing that flag on 32 rows turns 32 enquiry buttons into buy buttons with
   no change here: `isOrderable()` reads the same field the kitchen edits.

   IMAGES. Same convention as the homepage — public/images/dishes/<slug>.jpg
   beats public/images/ai/dishes/<slug>.jpg beats nothing at all, resolved at
   build time. No dish has a file yet, so today this page is type-led, which is
   the honest state and also the locked system. Dropping files in
   lights them up with no edit here.
══════════════════════════════════════════════════════════════════════════ */

export const metadata: Metadata = {
  title: "Menu — single meals, no subscription",
  description: `${MENU_STATS.items} dishes from the FitFuel kitchen, ordered one at a time. Salads, keto, bowls, breakfast, protein bars and cold-pressed juices, from ₹${MENU_FROM}.`,
  alternates: { canonical: "/menu" },
};

export default function MenuPage() {
  // Resolve photography server-side; the client component only ever sees a
  // path or null, and never touches the filesystem.
  const dishes: MenuDish[] = DISHES.map((d) => ({
    id: d.id,
    name: d.name,
    blurb: d.blurb,
    price: d.price,
    provisional: d.provisional ?? false,
    variantNote: d.variantNote ?? null,
    addOns: d.addOns ?? null,
    category: d.category,
    categoryLabel: d.categoryLabel,
    image: findDishImage(dishSlug(d.name))?.src ?? null,
  }));

  /* AppChrome, for the same reason the dish pages have it: ChromeGate now
     treats everything under /menu as self-chromed, and without this the page
     lost the marketing navbar and got nothing in its place — a catalog with no
     navigation at all, which is worse than the mismatch it replaced. */
  return (
    <AppChrome
      dishCount={DISHES.length}
      cutoff={cutoffLabel()}
      areaPanel={<Areas />}
    >
      <MenuClient
        dishes={dishes}
        stats={{
          items: MENU_STATS.items,
          categories: MENU_STATS.categories,
          from: MENU_FROM,
          orderable: ORDERABLE_COUNT,
          enquiry: ENQUIRY_COUNT,
        }}
      />
    </AppChrome>
  );
}
