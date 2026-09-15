import catalog from "@/data/nutrabay-catalog.json";
import { NUTRABAY_PRODUCTS } from "@/lib/nutrabay-products";

export const NUTRABAY_CATALOG = catalog;
export const NUTRABAY_MARKETPLACE_COUNT = catalog.length;
export type NutrabayCatalogProduct = (typeof catalog)[number];

export const NUTRABAY_EVIDENCE_BY_PRODUCT_ID = new Map(
  NUTRABAY_PRODUCTS.flatMap((product) => {
    const productId = new URL(product.affiliateUrl).searchParams.get("pId");
    return productId ? [[productId, product.supplementSlug] as const] : [];
  }),
);

const snapshotById = new Map(
  catalog.map((product) => [`nby-${product.retailerProductId}`, product]),
);

export function findNutrabaySnapshotProduct(id: string): NutrabayCatalogProduct | null {
  return snapshotById.get(id) ?? null;
}

export function safeNutrabayUrl(value: string): URL | null {
  try {
    const url = new URL(value);
    const retailerHost = url.hostname === "nutrabay.com" || url.hostname === "www.nutrabay.com";
    return url.protocol === "https:" && retailerHost && !url.username && !url.password ? url : null;
  } catch {
    return null;
  }
}
