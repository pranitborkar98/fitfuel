"use client";

import Image from "next/image";
import Link from "next/link";
import Breadcrumb from "@/components/Breadcrumb";
import { useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import type { ShopDish } from "@/app/_shop/catalog";
import s from "./dish.module.css";

type Props = {
  dish: ShopDish;
  related: ShopDish[];
  licence: string;
  imageSrc: string | null;
  jsonLd: Record<string, unknown> | null;
};

const rs = (n: number) => `₹${n.toLocaleString("en-IN")}`;

export default function DishPage({ dish, related, licence, imageSrc, jsonLd }: Props) {
  const cart = useCart();
  const [addOn, setAddOn] = useState<string>("");
  const qty = cart.qtyOf(dish.id);

  const chosen = dish.addOns?.find((a) => a.kind === addOn);
  const unit = (dish.price ?? 0) + (chosen?.price ?? 0);

  /* The four macros, as their own tiles. On the card these are a single mono
     line because space is tight; a product page has room to make each one
     legible, which is the point of having the page at all. */
  const macros: { v: string; l: string }[] = dish.kcal
    ? [
        { v: String(dish.kcal), l: "kcal" },
        { v: `${dish.protein}g`, l: "protein" },
        { v: `${dish.carbs}g`, l: "carbs" },
        { v: `${dish.fat}g`, l: "fat" },
      ]
    : [];

  return (
    <div className={`fk ${s.page}`}>
      {jsonLd ? (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      ) : null}

      <div className={s.wrap}>
        {/* components/Breadcrumb — the same trail every detail page draws.
            The last crumb carries the arrow and is the back button. */}
        {/* The parent is `/`, NOT /menu. This is one of the 48 à la carte
            singles, and /menu is now the plan's weekly rotation — a different
            set of recipes that does not contain this dish. Pointing a dish's
            breadcrumb at a page the dish is not on is a broken trail even
            though the link returns 200. */}
        <Breadcrumb
          className={s.crumb}
          trail={[{ href: "/menu", label: "All dishes" }]}
          current={dish.categoryLabel}
        />

        <div className={s.top}>
          {/* The image slot, kept as a placeholder. Drop a file into
              public/images/dishes/<slug> and it fills with no layout change. */}
          <div className={s.shot}>
            {imageSrc ? (
              <Image
                src={imageSrc}
                alt={dish.name}
                fill
                sizes="(min-width: 900px) 46vw, 100vw"
                style={{ objectFit: "cover" }}
                loading="eager"
                fetchPriority="high"
              />
            ) : (
              <span className={s.shotLabel}>{dish.categoryLabel}</span>
            )}
          </div>

          <div className={s.head}>
            <p className={s.course}>{dish.categoryLabel}</p>
            <h1 className={s.title}>{dish.name}</h1>
            <p className={s.blurb}>{dish.blurb}</p>

            {macros.length > 0 ? (
              <>
                <ul className={s.macros}>
                  {macros.map((m) => (
                    <li key={m.l}>
                      <b className="fk-num">{m.v}</b>
                      <span>{m.l}</span>
                    </li>
                  ))}
                </ul>
                {/* app/_shop/catalog.ts is explicit that à la carte macros are
                    computed from the ingredient list, while plan meals are
                    weighed. Printing them identically would encode a claim we
                    cannot back. */}
                <p className={s.estimate}>
                  Per portion, estimated from the recipe. Plan meals are weighed on a scale.
                </p>
              </>
            ) : null}

            {dish.orderable ? (
              <div className={s.buy}>
                {dish.addOns?.length ? (
                  <fieldset className={s.addOns}>
                    <legend>Add protein</legend>
                    <label className={addOn === "" ? s.onOpt : undefined}>
                      <input
                        type="radio"
                        name="addon"
                        checked={addOn === ""}
                        onChange={() => setAddOn("")}
                      />
                      <span>As it comes</span>
                      <b className="fk-num">{rs(dish.price ?? 0)}</b>
                    </label>
                    {dish.addOns.map((a) => (
                      <label key={a.kind} className={addOn === a.kind ? s.onOpt : undefined}>
                        <input
                          type="radio"
                          name="addon"
                          checked={addOn === a.kind}
                          onChange={() => setAddOn(a.kind)}
                        />
                        <span>
                          {a.kind} — {a.what}
                        </span>
                        <b className="fk-num">{rs((dish.price ?? 0) + a.price)}</b>
                      </label>
                    ))}
                  </fieldset>
                ) : null}

                {dish.variantNote ? <p className={s.variant}>{dish.variantNote}</p> : null}

                <div className={s.buyRow}>
                  <span className={s.price}>
                    <b className="fk-num">{rs(unit)}</b>
                    <span>including GST at checkout</span>
                  </span>
                  <button
                    type="button"
                    className={s.add}
                    onClick={() => cart.add(dish.id, chosen?.kind)}
                  >
                    {qty > 0 ? `Add another (${qty} in order)` : "Add to order"}
                  </button>
                </div>
              </div>
            ) : (
              <div className={s.buy}>
                <p className={s.notPriced}>
                  The kitchen has not set a price for this one yet, so it cannot be ordered
                  here. It is cooked to order — ask and we will quote you the number.
                </p>
                <button
                  type="button"
                  className={`${s.add} ${s.ghost}`}
                  onClick={() => cart.toggleEnquiry(dish.id)}
                >
                  {cart.hasEnquiry(dish.id) ? "Price asked" : "Ask for the price"}
                </button>
              </div>
            )}
          </div>
        </div>

        {related.length > 0 ? (
          <section className={s.more} aria-labelledby="more-h">
            <h2 id="more-h">More {dish.categoryLabel.toLowerCase()}</h2>
            <ul className={s.moreGrid}>
              {related.map((r) => (
                <li key={r.id}>
                  <Link href={`/menu/${r.id}`}>
                    <b>{r.name}</b>
                    <span className="fk-num">
                      {r.orderable ? r.priceLabel : "Price on request"}
                      {r.kcal ? ` · ${r.kcalLabel}` : ""}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {/* The second way back is gone. It sat at the BOTTOM of the page
            inside this compliance sentence, said "Back to the menu", and went
            to `/` — while the breadcrumb at the top said "The menu" and went
            to `/menu`. Two exits, two destinations, one of them buried below
            the fold on 48 product pages. The breadcrumb is the way back. */}
        <p className={s.foot}>
          Cooked in our own kitchen in Pune. FSSAI <span className="fk-num">{licence}</span>.
        </p>
      </div>
    </div>
  );
}
