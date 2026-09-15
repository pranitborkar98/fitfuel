"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { ExternalLink, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import type { MarketplaceProduct } from "@/lib/affiliate-products";
import {
  MARKETPLACE_PAGE_SIZE as PAGE_SIZE,
  marketplaceFilterQuery,
  readMarketplaceFilters,
  type MarketplaceFilters,
  type MarketplaceSort,
} from "@/lib/marketplace-filters";
import s from "./products.module.css";

const CATEGORY_LABEL: Record<string, string> = {
  Other: "More nutrition",
};

function ProductImage({ product }: { product: MarketplaceProduct }) {
  const [failed, setFailed] = useState(false);

  if (failed) {
    return (
      <span className={s.imageFallback} aria-hidden="true">
        {product.name.slice(0, 1)}
      </span>
    );
  }

  return (
    <Image
      src={product.imageUrl}
      alt={product.name}
      fill
      sizes="(min-width: 1180px) 25vw, (min-width: 720px) 33vw, 100vw"
      className={s.productImage}
      onError={() => setFailed(true)}
    />
  );
}

export default function MarketplaceCatalog({
  products,
  guidanceAvailable,
}: {
  products: MarketplaceProduct[];
  guidanceAvailable: boolean;
}) {
  const searchParams = useSearchParams();
  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const product of products) {
      counts.set(product.category, (counts.get(product.category) ?? 0) + 1);
    }
    return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [products]);

  const filters = readMarketplaceFilters(searchParams, categoryCounts.map(([name]) => name), products.length);
  const { query, category, evidenceOnly, visible } = filters;
  const sort = !guidanceAvailable && filters.sort === "recommended" ? "name" : filters.sort;

  // Native history updates retain the list state on reload and browser Back,
  // without refetching the catalogue or adding a history entry per keystroke.
  function updateFilters(change: Partial<MarketplaceFilters>) {
    const queryString = marketplaceFilterQuery({ ...filters, ...change });
    window.history.replaceState(null, "", `/products${queryString ? `?${queryString}` : ""}${window.location.hash}`);
  }

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const next = products.filter((product) => {
      if (category !== "All" && product.category !== category) return false;
      if (guidanceAvailable && evidenceOnly && !product.evidence) return false;
      if (!needle) return true;
      return `${product.name} ${product.category}`.toLowerCase().includes(needle);
    });

    return next.sort((a, b) => {
      if (sort === "price-low") return a.priceRs - b.priceRs;
      if (sort === "price-high") return b.priceRs - a.priceRs;
      if (sort === "name") return a.name.localeCompare(b.name);
      return Number(Boolean(b.evidence)) - Number(Boolean(a.evidence)) || a.name.localeCompare(b.name);
    });
  }, [category, evidenceOnly, guidanceAvailable, products, query, sort]);

  const shown = filtered.slice(0, visible);
  const evidenceCount = products.filter((product) => product.evidence).length;

  function chooseCategory(next: string) {
    updateFilters({ category: next, visible: PAGE_SIZE });
  }

  return (
    <div className={s.page} id="main-content">
      <header className={s.hero}>
        <div className={s.wrap}>
          <h1>Shop supplements</h1>
          <p className={s.lede}>
            Protein, creatine, vitamins and more. Compare listed prices, then buy on Nutrabay.
          </p>
          <dl className={s.heroStats}>
            <div>
              <dt>products</dt>
              <dd>{products.length.toLocaleString("en-IN")}</dd>
            </div>
            {guidanceAvailable ? <div>
              <dt>with guidance</dt>
              <dd>{evidenceCount.toLocaleString("en-IN")}</dd>
            </div> : null}
          </dl>
        </div>
      </header>

      <section className={s.catalog} aria-labelledby="catalog-title">
        <div className={s.wrap}>
          <div className={s.catalogHead}>
            <h2 id="catalog-title">Browse products</h2>
            <Link href="/supplements" className={s.evidenceDirectory}>
              <ShieldCheck size={19} aria-hidden="true" />
              Ingredient guide
            </Link>
          </div>

          <div className={s.controls}>
            <label className={s.searchBox} htmlFor="product-search">
              <Search size={20} aria-hidden="true" />
              <span className={s.srOnly}>Search products</span>
              <input
                id="product-search"
                type="search"
                value={query}
                placeholder="Search whey, creatine, vitamins or a brand"
                onChange={(event) => {
                  updateFilters({ query: event.target.value, visible: PAGE_SIZE });
                }}
              />
            </label>
            <label className={s.sortBox} htmlFor="product-sort">
              <span id="product-sort-label">Sort</span>
              <select
                id="product-sort"
                aria-labelledby="product-sort-label"
                value={sort}
                onChange={(event) => updateFilters({ sort: event.target.value as MarketplaceSort, visible: PAGE_SIZE })}
              >
                {guidanceAvailable ? <option value="recommended">Guidance first</option> : null}
                <option value="price-low">Price, low to high</option>
                <option value="price-high">Price, high to low</option>
                <option value="name">Name, A to Z</option>
              </select>
            </label>
          </div>

          <div className={s.categoryRail} aria-label="Product categories">
            <button
              type="button"
              className={category === "All" ? s.categoryActive : undefined}
              aria-pressed={category === "All"}
              onClick={() => chooseCategory("All")}
            >
              All <span>{products.length}</span>
            </button>
            {categoryCounts.map(([name, count]) => (
              <button
                type="button"
                key={name}
                className={category === name ? s.categoryActive : undefined}
                aria-pressed={category === name}
                onClick={() => chooseCategory(name)}
              >
                {CATEGORY_LABEL[name] ?? name} <span>{count}</span>
              </button>
            ))}
          </div>

          <div className={s.resultBar}>
            <p aria-live="polite" aria-atomic="true">
              {filtered.length.toLocaleString("en-IN")} product
              {filtered.length === 1 ? "" : "s"}
            </p>
            {guidanceAvailable ? <label>
              <input
                type="checkbox"
                checked={evidenceOnly}
                onChange={(event) => {
                  updateFilters({ evidenceOnly: event.target.checked, visible: PAGE_SIZE });
                }}
              />
              With ingredient guidance
            </label> : null}
          </div>

          <p className={s.retailerNote}>
            Final price and availability are confirmed on Nutrabay. FitFuel may earn a commission.
            {!guidanceAvailable ? " Ingredient links are temporarily unavailable." : null}
          </p>

          {shown.length > 0 ? (
            <ul className={s.grid}>
              {shown.map((product) => (
                <li key={product.id}>
                  <article className={s.card}>
                    <div className={s.imageWell}>
                      <ProductImage product={product} />
                      {product.evidence ? (
                        <span className={s.evidenceBadge}>
                          <ShieldCheck size={15} aria-hidden="true" /> Ingredient guide
                        </span>
                      ) : null}
                    </div>
                    <div className={s.cardBody}>
                      <span className={s.categoryName}>
                        {CATEGORY_LABEL[product.category] ?? product.category}
                      </span>
                      <h3>{product.name}</h3>
                      <div className={s.cardFoot}>
                        <div>
                          <b>₹{product.priceRs.toLocaleString("en-IN")}</b>
                          <small>Listed price</small>
                        </div>
                        <a
                          href={product.checkoutUrl}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          aria-label={`Buy ${product.name} on Nutrabay`}
                        >
                          Buy <ExternalLink size={16} aria-hidden="true" />
                        </a>
                      </div>
                      {product.evidence ? (
                        <Link href={`/supplements#${product.evidence.slug}`} className={s.evidenceLink}>
                          Read evidence for {product.evidence.name}
                        </Link>
                      ) : null}
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          ) : (
            <div className={s.empty} role="status">
              <h3>{products.length ? "No matching products" : "The catalogue is currently unavailable"}</h3>
              <p>{products.length ? "Try a broader search or clear your filters." : "Please check back later."}</p>
              {products.length ? (
                <button
                  type="button"
                  className={s.loadMore}
                  onClick={() => {
                    updateFilters({ query: "", category: "All", evidenceOnly: false, visible: PAGE_SIZE });
                  }}
                >
                  Clear filters
                </button>
              ) : null}
            </div>
          )}

          {visible < filtered.length ? (
            <button
              type="button"
              className={s.loadMore}
              onClick={() => updateFilters({ visible: visible + PAGE_SIZE })}
            >
              Show {Math.min(PAGE_SIZE, filtered.length - visible)} more products
            </button>
          ) : null}

          <p className={s.disclosure}>
            FitFuel may earn a commission when you buy through a marketplace link. The
            retailer sells, ships and supports every product. Ingredient guidance does
            not certify a particular brand or product. Commission does not change the guidance.
          </p>
        </div>
      </section>
    </div>
  );
}
