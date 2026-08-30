"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Check, Search, ShoppingBag } from "lucide-react";
import { useMemo, useState } from "react";
import { useCart } from "@/app/_cart/CartProvider";
import { COURSES, type ShopDish } from "@/app/_shop/catalog";
import styles from "./menu.module.css";

type Props = {
  dishes: ShopDish[];
  images: Record<string, string>;
  initialCourse?: string;
  initialQuery?: string;
};

const money = (value: number) => `₹${value.toLocaleString("en-IN")}`;

export default function MenuCatalog({ dishes, images, initialCourse, initialQuery }: Props) {
  const cart = useCart();
  const validCourse = COURSES.some((course) => course.key === initialCourse) ? initialCourse! : "all";
  const [course, setCourse] = useState(validCourse);
  const [query, setQuery] = useState(initialQuery ?? "");
  const [visibleCount, setVisibleCount] = useState(12);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return dishes.filter((dish) => {
      const inCourse = course === "all" || dish.category === course;
      const matches = !needle || `${dish.name} ${dish.blurb} ${dish.categoryLabel}`.toLowerCase().includes(needle);
      return inCourse && matches;
    });
  }, [course, dishes, query]);

  const pricedCount = dishes.filter((dish) => dish.orderable).length;
  const visibleDishes = filtered.slice(0, visibleCount);

  return (
    <div className={`${styles.page} fk`}>
      <section className={styles.hero}>
        <div className={styles.wrap}>
          <p className={styles.kicker}>Single dishes from the Kharadi kitchen</p>
          <h1>Pick what you actually want to eat.</h1>
          <p className={styles.deck}>
            Browse {dishes.length} salads, bowls, breakfasts, bars and juices. {pricedCount} have kitchen-approved prices and can go straight into your basket; the rest stay visible without a placeholder price.
          </p>
          <div className={styles.heroFacts}>
            <span><strong>{pricedCount}</strong> priced now</span>
            <span><strong>{dishes.length - pricedCount}</strong> awaiting final price</span>
            <span><strong>{COURSES.length}</strong> food categories</span>
          </div>
        </div>
      </section>

      <section className={styles.catalog} aria-labelledby="menu-title">
        <div className={styles.wrap}>
          <div className={styles.catalogHead}>
            <div><p className="fk-eyebrow">The menu</p><h2 id="menu-title">Food first. Details on every dish.</h2></div>
            <label className={styles.search}>
              <span className="fk-sr-only">Search dishes</span>
              <Search size={18} />
              <input value={query} onChange={(event) => { setQuery(event.target.value); setVisibleCount(12); }} placeholder="Search dishes" />
            </label>
          </div>

          <div className={styles.filters} role="radiogroup" aria-label="Food category">
            <button type="button" role="radio" aria-checked={course === "all"} onClick={() => { setCourse("all"); setVisibleCount(12); }} className={course === "all" ? styles.filterActive : ""}>All dishes</button>
            {COURSES.map((item) => (
              <button key={item.key} type="button" role="radio" aria-checked={course === item.key} onClick={() => { setCourse(item.key); setVisibleCount(12); }} className={course === item.key ? styles.filterActive : ""}>{item.label}</button>
            ))}
          </div>

          <div className={styles.resultLine} aria-live="polite">
            Showing {Math.min(visibleCount, filtered.length)} of {filtered.length} {filtered.length === 1 ? "dish" : "dishes"}
          </div>

          {filtered.length ? (
            <div className={styles.grid}>
              {visibleDishes.map((dish) => {
                const quantity = cart.qtyOf(dish.id);
                const requested = cart.hasEnquiry(dish.id);
                return (
                  <article key={dish.id} className={styles.card}>
                    <Link href={`/menu/${dish.id}`} className={styles.photo} aria-label={`View ${dish.name}`}>
                      {images[dish.id] ? (
                        <Image src={images[dish.id]} alt={dish.name} fill sizes="(max-width: 680px) 100vw, (max-width: 1050px) 50vw, 33vw" />
                      ) : (
                        <span><small>Photo added with final kitchen listing</small>{dish.categoryLabel}</span>
                      )}
                    </Link>
                    <div className={styles.cardBody}>
                      <span className={styles.course}>{dish.categoryLabel}</span>
                      <h3><Link href={`/menu/${dish.id}`}>{dish.name}</Link></h3>
                      <p>{dish.blurb}</p>
                      <div className={styles.macros}>
                        <span>{dish.kcal} kcal</span><span>{dish.protein}g protein</span><span>Estimated</span>
                      </div>
                    </div>
                    <div className={styles.cardFoot}>
                      <div>
                        {dish.orderable ? <strong>{money(dish.price ?? 0)}</strong> : <strong>Price on request</strong>}
                        <Link href={`/menu/${dish.id}`}>Full details <ArrowRight size={14} /></Link>
                      </div>
                      {dish.orderable ? (
                        <button type="button" onClick={() => cart.add(dish.id)}>
                          <ShoppingBag size={17} /> {quantity ? `Add another · ${quantity}` : "Add"}
                        </button>
                      ) : (
                        <button type="button" className={requested ? styles.requested : styles.ask} onClick={() => cart.toggleEnquiry(dish.id)} aria-pressed={requested}>
                          {requested ? <Check size={17} /> : null}{requested ? "Price requested" : "Ask price"}
                        </button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className={styles.empty}><h3>No dishes match that search.</h3><button type="button" onClick={() => { setQuery(""); setCourse("all"); setVisibleCount(12); }}>Clear filters</button></div>
          )}
          {visibleCount < filtered.length ? (
            <button type="button" className={styles.loadMore} onClick={() => setVisibleCount((count) => count + 12)}>
              Show 12 more dishes <ArrowRight size={17} />
            </button>
          ) : null}
        </div>
      </section>

      <section className={styles.planCta}>
        <div className={styles.wrap}>
          <div><p className="fk-eyebrow">Want the whole system?</p><h2>Turn one meal into a plan.</h2><p>Choose a goal, delivery window and complete menu with the diary loop included.</p></div>
          <Link href="/plans" className="fk-btn fk-btn-primary">Browse meal plans <ArrowRight size={18} /></Link>
        </div>
      </section>
    </div>
  );
}
