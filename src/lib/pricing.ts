import type { BulkDiscount } from "@/types";

/** True when the bulk offer is usable: at least 2 items and a real percentage. */
export const bulkActive = (bulk?: BulkDiscount): bulk is BulkDiscount =>
  !!bulk && bulk.minQty >= 2 && bulk.percent > 0 && bulk.percent < 100;

/** Line total for `qty` items, with the bulk discount when it applies. Checkout reuses this. */
export function bulkTotal(unitPrice: number, qty: number, bulk?: BulkDiscount) {
  const sub = unitPrice * qty;
  const discount = bulkActive(bulk) && qty >= bulk.minQty ? Math.round((sub * bulk.percent) / 100) : 0;
  return { sub, discount, total: sub - discount };
}
