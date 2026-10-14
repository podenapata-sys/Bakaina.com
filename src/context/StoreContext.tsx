"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

interface StoreValue {
  cartCount: number;
  addToCart: (productId: string) => void;
  wishlist: ReadonlySet<string>;
  toggleWishlist: (productId: string) => void;
}

const StoreContext = createContext<StoreValue | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<string[]>([]);
  const [wishlist, setWishlist] = useState<ReadonlySet<string>>(new Set());

  const addToCart = useCallback((productId: string) => {
    setCart((items) => [...items, productId]);
  }, []);

  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((current) => {
      const next = new Set(current);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ cartCount: cart.length, addToCart, wishlist, toggleWishlist }),
    [cart.length, addToCart, wishlist, toggleWishlist],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used inside <StoreProvider>");
  return ctx;
}
