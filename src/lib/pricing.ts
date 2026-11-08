import type { QuantityOffer } from "@/types";

/** Valid offers only (2+ items, a price below buying them one by one), smallest quantity first. */
export function usableOffers(unitPrice: number, offers?: QuantityOffer[]): QuantityOffer[] {
  const seen = new Set<number>();
  return (offers ?? [])
    .filter((o) => o.qty >= 2 && o.price > 0 && o.price < unitPrice * o.qty && !seen.has(o.qty) && seen.add(o.qty))
    .sort((a, b) => a.qty - b.qty);
}

/** Line total for `qty` items: the offer price when there is an offer for exactly that many. Checkout reuses this. */
export function lineTotal(unitPrice: number, qty: number, offers?: QuantityOffer[]) {
  const sub = unitPrice * qty;
  const offer = usableOffers(unitPrice, offers).find((o) => o.qty === qty);
  const total = offer ? offer.price : sub;
  return { sub, discount: sub - total, total };
}
