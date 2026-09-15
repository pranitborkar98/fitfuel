import { getMarketplaceProducts } from "@/lib/affiliate-products";
import AppChrome from "@/app/_web/AppChrome";
import MarketplaceCatalog from "./MarketplaceCatalog";

export const dynamic = "force-dynamic";

export const metadata = {
  alternates: { canonical: "/products" },
  title: "Supplement marketplace",
  description:
    "Browse protein, creatine, vitamins and nutrition foods. Compare listed prices, read ingredient guidance and buy on Nutrabay.",
};

export default async function ProductsPage() {
  const catalog = await getMarketplaceProducts();

  return (
    <AppChrome notice="Browse on FitFuel, then buy and receive order support from Nutrabay.">
      <MarketplaceCatalog {...catalog} />
    </AppChrome>
  );
}
