import { cacheLife } from "next/cache";
import { sampleProducts } from "@/data/products";
import type { Product } from "@/types";
import { firebaseConfig } from "./firebase";
import { priceRange, totalStock } from "./variants";

/*
 * Server-side product lookup for <head> metadata and JSON-LD, so Google and link previews
 * see real product data even though the page itself renders on the client.
 * Uses Firestore's public REST API (products are publicly readable per firestore.rules).
 */

type FsValue = {
  stringValue?: string;
  integerValue?: string;
  doubleValue?: number;
  booleanValue?: boolean;
  nullValue?: null;
  arrayValue?: { values?: FsValue[] };
  mapValue?: { fields?: Record<string, FsValue> };
};

function decode(v: FsValue): unknown {
  if (v.stringValue !== undefined) return v.stringValue;
  if (v.integerValue !== undefined) return Number(v.integerValue);
  if (v.doubleValue !== undefined) return v.doubleValue;
  if (v.booleanValue !== undefined) return v.booleanValue;
  if (v.arrayValue) return (v.arrayValue.values ?? []).map(decode);
  if (v.mapValue) return decodeFields(v.mapValue.fields ?? {});
  return null;
}

const decodeFields = (fields: Record<string, FsValue>) =>
  Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, decode(v)]));

export async function getProductForSeo(id: string): Promise<Product | null> {
  "use cache";
  cacheLife("minutes");

  const { projectId, apiKey } = firebaseConfig;
  if (!projectId || !apiKey) return sampleProducts.find((p) => p.id === id) ?? null;
  if (!/^[\w-]{1,128}$/.test(id)) return null;

  try {
    const host =
      process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true" ? "http://127.0.0.1:8080" : "https://firestore.googleapis.com";
    const res = await fetch(`${host}/v1/projects/${projectId}/databases/(default)/documents/products/${id}?key=${apiKey}`);
    if (!res.ok) return null;
    const json = (await res.json()) as { fields?: Record<string, FsValue> };
    const product = { ...decodeFields(json.fields ?? {}), id } as Product;
    return product.active === false ? null : product;
  } catch {
    return null;
  }
}

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
