"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

export interface CartItem {
  productId: string;
  /** Set for products with variants (size, colour…). */
  variantId?: string;
  qty: number;
}

interface StoreValue {
  cart: readonly CartItem[];
  cartCount: number;
  addToCart: (productId: string, options?: { variantId?: string; qty?: number }) => void;
  wishlist: ReadonlySet<string>;
  toggleWishlist: (productId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());

  const addToCart = useCallback((productId: string, options?: { variantId?: string; qty?: number }) => {
    const qty = Math.max(1, options?.qty ?? 1);
    const variantId = options?.variantId;
    setCart((items) => {
      const i = items.findIndex((it) => it.productId === productId && it.variantId === variantId);
      if (i === -1) return [...items, { productId, variantId, qty }];
      return items.map((it, j) => (j === i ? { ...it, qty: it.qty + qty } : it));
    });
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const cartCount = useMemo(() => cart.reduce((n, it) => n + it.qty, 0), [cart]);

  const value = useMemo(
    () => ({ cart, cartCount, addToCart, wishlist, toggleWishlist }),
    [cart, cartCount, addToCart, wishlist, toggleWishlist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
