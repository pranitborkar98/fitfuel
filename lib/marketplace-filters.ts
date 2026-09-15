export const MARKETPLACE_PAGE_SIZE = 36;

export type MarketplaceSort = "recommended" | "price-low" | "price-high" | "name";
export type MarketplaceFilters = {
  query: string;
  category: string;
  evidenceOnly: boolean;
  sort: MarketplaceSort;
  visible: number;
};

export function readMarketplaceFilters(
  params: Pick<URLSearchParams, "get">,
  categories: readonly string[],
  productCount: number,
): MarketplaceFilters {
  const category = params.get("category") ?? "All";
  const sort = params.get("sort");
  const shown = Number(params.get("shown"));
  return {
    query: params.get("q") ?? "",
    category: categories.includes(category) ? category : "All",
    evidenceOnly: params.get("guidance") === "1",
    sort: sort === "price-low" || sort === "price-high" || sort === "name" ? sort : "recommended",
    visible: Number.isSafeInteger(shown) && shown > MARKETPLACE_PAGE_SIZE
      ? Math.min(shown, Math.max(MARKETPLACE_PAGE_SIZE, productCount))
      : MARKETPLACE_PAGE_SIZE,
  };
}

export function marketplaceFilterQuery(filters: MarketplaceFilters): string {
  const params = new URLSearchParams();
  if (filters.query) params.set("q", filters.query);
  if (filters.category !== "All") params.set("category", filters.category);
  if (filters.evidenceOnly) params.set("guidance", "1");
  if (filters.sort !== "recommended") params.set("sort", filters.sort);
  if (filters.visible > MARKETPLACE_PAGE_SIZE) params.set("shown", String(filters.visible));
  return params.toString();
}
