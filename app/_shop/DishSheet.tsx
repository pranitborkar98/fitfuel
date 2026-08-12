"use client";

// app/_shop/DishSheet.tsx
//
// One dish, opened. The picture, the blurb, the four macro cells, the add-on
// ladder and one button that either adds it to the basket or asks the kitchen
// what it costs.
//
// THE EST STAMP IS NOT DECORATION. The plan meals are weighed on a scale; these
// à la carte figures are recipe estimates. The line under the bars says so in
// words, because a number printed next to a weighed one and not distinguished
// from it is the kind of claim the machine-readability rule exists
// to stop us making.

import { useState } from "react";

import { useCart } from "@/app/_cart/CartProvider";
import type { AddOn } from "@/lib/menu-alacarte";
import { rs, type ShopDish } from "./catalog";
import Sheet, { SheetClose } from "./Sheet";
import Slot, { type SlotMap } from "./Slot";
import { C, COND, MONO, SANS, body, display, figure, label, num, sub } from "./theme";

const NONE = "None" as const;

export default function DishSheet({
  dish,
  images,
  onClose,
}: {
  dish: ShopDish;
  images: SlotMap;
  onClose: () => void;
}) {
  const cart = useCart();
  const [addOn, setAddOn] = useState<AddOn["kind"] | "">("");

  const qty = cart.qtyOf(dish.id);
  const asked = cart.hasEnquiry(dish.id);
  const chosen = addOn ? dish.addOns?.find((a) => a.kind === addOn) : undefined;
  const unit = (dish.price ?? 0) + (chosen?.price ?? 0);
  const hasAddOns = dish.orderable && !!dish.addOns?.length;

  const rows: { kind: string; what: string; price: number }[] = [
    { kind: NONE, what: "Dish as it comes", price: 0 },
    ...(dish.addOns ?? []),
  ];

  const macroCells: [string, string][] = [
    ["kcal", String(dish.kcal)],
    ["protein", `${dish.protein}g`],
    ["carbs", `${dish.carbs}g`],
    ["fat", `${dish.fat}g`],
  ];

  return (
    <Sheet onClose={onClose} labelledBy="dish-sheet-title">
      <div style={{ position: "relative", aspectRatio: "16/9", background: C.panel2, borderBottom: `1px solid ${C.rule}`, overflow: "hidden" }}>
        <Slot images={images} name={dish.slot} alt={dish.name} dish={dish} sizes="480px" />
        <span style={{ position: "absolute", top: 10, right: 10 }}>
          <SheetClose onClose={onClose} />
        </span>
      </div>

      <div style={{ padding: 16 }}>
        <span style={{ display: "block", ...label(10, { letterSpacing: "0.18em", color: C.lime }) }}>{dish.categoryLabel}</span>
        <h2 id="dish-sheet-title" style={display(28, { margin: "10px 0 0", lineHeight: 0.94, letterSpacing: "-0.02em" })}>{dish.name}</h2>
        <p style={body(13.5, { margin: "11px 0 0" })}>{dish.blurb}</p>
        {dish.variantNote && <p style={body(12.5, { margin: "9px 0 0", color: C.dim })}>{dish.variantNote}</p>}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 1, background: C.rule, border: `1px solid ${C.rule}`, marginTop: 18 }}>
          {macroCells.map(([k, v]) => (
            <span key={k} style={{ padding: "11px 9px", background: C.panel }}>
              <b style={figure(22, { display: "block" })}>{v}</b>
              <span style={{ display: "block", marginTop: 7, ...label(10, { letterSpacing: "0.14em" }) }}>{k}</span>
            </span>
          ))}
        </div>

        {dish.bars.length > 0 && (
          <span aria-hidden="true" style={{ display: "flex", gap: 2, height: 5, marginTop: 9, background: C.trough }}>
            {dish.bars.map((b, i) => (
              <span key={i} style={{ display: "block", height: "100%", width: `${b.pct}%`, background: b.color }} />
            ))}
          </span>
        )}
        <span style={{ display: "block", marginTop: 8, ...label(10, { letterSpacing: "0.12em" }) }}>
          Protein · carbs · fat · kitchen estimate
        </span>

        {hasAddOns && (
          <fieldset style={{ marginTop: 20, border: 0, padding: 0, margin: "20px 0 0" }}>
            <legend style={{ ...label(10, { letterSpacing: "0.2em" }), marginBottom: 10, padding: 0 }}>Add protein</legend>
            <div style={{ display: "flex", flexDirection: "column", gap: 1, background: C.rule, border: `1px solid ${C.rule}` }}>
              {rows.map((a) => {
                const on = a.kind === NONE ? !addOn : addOn === a.kind;
                return (
                  <button
                    key={a.kind}
                    type="button"
                    onClick={() => setAddOn(a.kind === NONE ? "" : (a.kind as AddOn["kind"]))}
                    aria-pressed={on}
                    style={{
                      display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12,
                      padding: "12px 13px", minHeight: 44, cursor: "pointer", textAlign: "left",
                      background: C.panel, border: 0, borderLeft: `3px solid ${on ? C.lime : "transparent"}`,
                      color: on ? C.ink : C.mute,
                    }}
                  >
                    <span>
                      <span style={{ display: "block", ...sub(15, { color: "inherit" }) }}>{a.kind}</span>
                      <span style={{ display: "block", marginTop: 4, fontFamily: SANS, fontSize: 12, color: C.dim }}>{a.what}</span>
                    </span>
                    <span style={{ ...num(12.5, { color: "inherit" }) }}>{a.price ? `+${rs(a.price)}` : "—"}</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginTop: 22, paddingTop: 16, borderTop: `1px solid ${C.rule}` }}>
          <span>
            <span style={{ display: "block", ...label(10, { letterSpacing: "0.16em" }) }}>Unit</span>
            <b style={figure(30, { display: "block", marginTop: 6 })}>{dish.orderable ? rs(unit) : "On request"}</b>
          </span>
          {dish.orderable ? (
            <button
              type="button"
              onClick={() => cart.add(dish.id, addOn || undefined)}
              style={{
                minHeight: 52, minWidth: 200, padding: "0 16px", cursor: "pointer",
                background: C.lime, border: `1px solid ${C.lime}`, color: C.onLime,
                fontFamily: COND, fontWeight: 800, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase",
              }}
            >
              {qty > 0 ? `Add another · ${qty} in order` : "Add to order"}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => cart.toggleEnquiry(dish.id)}
              style={{
                minHeight: 52, minWidth: 200, padding: "0 16px", cursor: "pointer",
                background: "transparent", border: `1px solid ${asked ? C.lime : C.rule2}`, color: asked ? C.lime : C.mute,
                fontFamily: COND, fontWeight: 800, fontSize: 15, letterSpacing: "0.06em", textTransform: "uppercase",
              }}
            >
              {asked ? "Price asked" : "Ask the price"}
            </button>
          )}
        </div>

        {!dish.orderable && (
          <p style={body(12, { margin: "12px 0 0", color: C.dim, fontFamily: MONO, letterSpacing: "0.02em" })}>
            This dish is cooked and on the menu but not priced yet. Asking adds it to your WhatsApp message and the
            kitchen replies with the figure.
          </p>
        )}
      </div>
    </Sheet>
  );
}
