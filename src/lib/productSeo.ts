import type { Product } from "@/types";
import { priceRange, totalStock } from "./variants";

/** schema.org Product data for Google rich results. */
export function productJsonLd(p: Product, url: string) {
  const { min, max } = priceRange(p);
  const availability = totalStock(p) > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock";
  const condition = { new: "NewCondition", used: "UsedCondition", refurbished: "RefurbishedCondition" }[p.condition ?? "new"];
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.seoDescription || p.shortDescription || p.description,
    image: p.images?.length ? p.images : undefined,
    sku: p.sku,
    brand: p.brand ? { "@type": "Brand", name: p.brand } : undefined,
    offers:
      min === max
        ? { "@type": "Offer", url, price: min, priceCurrency: "BDT", availability, itemCondition: `https://schema.org/${condition}` }
        : { "@type": "AggregateOffer", url, lowPrice: min, highPrice: max, priceCurrency: "BDT", availability },
  };
}
