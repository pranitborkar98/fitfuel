"use client";

// app/_cart/CartProvider.tsx
//
// Cart state for the à la carte menu. Two lists, not one:
//
//   lines      — priced dishes, with quantity and an optional add-on. These
//                carry a total.
//   enquiries  — the 32 dishes still on a placeholder price. A customer can
//                mark them "ask me the price" and they ride along on the same
//                WhatsApp message, but they never touch a number.
//
// Keeping them apart is the whole point. One list with a nullable price means
// every total in the UI has to remember to skip some rows, and eventually one
// of them forgets and prints Rs 100 for a dish nobody priced.
//
// PERSISTENCE. localStorage, ids and quantities only — see the note on
// StoredLine in lib/menu-cart.ts about never caching money. Writes are
// wrapped because Safari private mode throws on setItem, and a cart that
// crashes the page is worse than a cart that forgets.

import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from "react";

import {
  type CartLine, type Dish, type StoredLine, type CartTotals,
  DISH_BY_ID, MAX_QTY, isOrderable, resolveLines, totals,
} from "@/lib/menu-cart";
import type { AddOn } from "@/lib/menu-alacarte";

const KEY = "ff.cart.v1";

type Persisted = { lines: StoredLine[]; enquiries: string[] };

type CartApi = {
  lines: CartLine[];
  enquiries: Dish[];
  totals: CartTotals;
  /** Priced lines + enquiry rows, for the badge. */
  badgeCount: number;
  /** True until localStorage has been read, so SSR and first paint agree. */
  hydrated: boolean;
  open: boolean;
  setOpen: (v: boolean) => void;

  add: (id: string, addOn?: AddOn["kind"]) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  toggleEnquiry: (id: string) => void;
  clear: () => void;
  /** Quantity of a dish currently in the basket, 0 if absent. */
  qtyOf: (id: string) => number;
  hasEnquiry: (id: string) => boolean;
};

const Ctx = createContext<CartApi | null>(null);

function read(): Persisted {
  if (typeof window === "undefined") return { lines: [], enquiries: [] };
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return { lines: [], enquiries: [] };
    const parsed = JSON.parse(raw) as Partial<Persisted>;
    return {
      lines: Array.isArray(parsed.lines) ? parsed.lines : [],
      enquiries: Array.isArray(parsed.enquiries) ? parsed.enquiries : [],
    };
  } catch {
    return { lines: [], enquiries: [] };
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Persisted>({ lines: [], enquiries: [] });
  const [hydrated, setHydrated] = useState(false);
  const [open, setOpen] = useState(false);

  // Read after mount, never during render: the server has no localStorage and
  // a mismatch here is a hydration error on every page the provider wraps.
  useEffect(() => {
    setState(read());
    setHydrated(true);
  }, []);

  const first = useRef(true);
  useEffect(() => {
    if (first.current) { first.current = false; return; }
    try {
      window.localStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* private mode, quota, disabled storage — the cart still works in memory */
    }
  }, [state]);

  const add = useCallback((id: string, addOn?: AddOn["kind"]) => {
    const dish = DISH_BY_ID.get(id);
    if (!dish || !isOrderable(dish)) return;
    setState((s) => {
      const at = s.lines.findIndex((l) => l.id === id && l.addOn === addOn);
      const lines = at >= 0
        ? s.lines.map((l, i) => (i === at ? { ...l, qty: Math.min(l.qty + 1, MAX_QTY) } : l))
        : [...s.lines, { id, qty: 1, addOn }];
      return { ...s, lines };
    });
    setOpen(true);
  }, []);

  const setQty = useCallback((id: string, qty: number) => {
    setState((s) => ({
      ...s,
      lines: qty < 1
        ? s.lines.filter((l) => l.id !== id)
        : s.lines.map((l) => (l.id === id ? { ...l, qty: Math.min(qty, MAX_QTY) } : l)),
    }));
  }, []);

  const remove = useCallback((id: string) => {
    setState((s) => ({ ...s, lines: s.lines.filter((l) => l.id !== id) }));
  }, []);

  const toggleEnquiry = useCallback((id: string) => {
    if (!DISH_BY_ID.has(id)) return;
    setState((s) => ({
      ...s,
      enquiries: s.enquiries.includes(id)
        ? s.enquiries.filter((e) => e !== id)
        : [...s.enquiries, id],
    }));
    setOpen(true);
  }, []);

  const clear = useCallback(() => setState({ lines: [], enquiries: [] }), []);

  const lines = useMemo(() => resolveLines(state.lines), [state.lines]);
  const enquiries = useMemo(
    () => state.enquiries.map((id) => DISH_BY_ID.get(id)).filter((d): d is Dish => !!d),
    [state.enquiries],
  );
  const t = useMemo(() => totals(lines), [lines]);

  const value = useMemo<CartApi>(() => ({
    lines, enquiries, totals: t,
    badgeCount: t.count + enquiries.length,
    hydrated, open, setOpen,
    add, setQty, remove, toggleEnquiry, clear,
    qtyOf: (id) => lines.find((l) => l.id === id)?.qty ?? 0,
    hasEnquiry: (id) => state.enquiries.includes(id),
  }), [lines, enquiries, t, hydrated, open, add, setQty, remove, toggleEnquiry, clear, state.enquiries]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart(): CartApi {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart must be used inside <CartProvider>");
  return c;
}
