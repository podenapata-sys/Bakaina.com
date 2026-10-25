import type { Product, ProductOption, ProductVariant } from "@/types";

/** Options that actually have a name and at least one value. */
export function usableOptions(options: ProductOption[] = []): ProductOption[] {
  return options
    .map((o) => ({ name: o.name.trim(), values: o.values.map((v) => v.trim()).filter(Boolean) }))
    .filter((o) => o.name && o.values.length > 0);
}

export const hasVariants = (p: Product) => (p.variants?.length ?? 0) > 0;

/** Stable key for a combination, e.g. "Size=M|Colour=Black". */
export const variantKey = (attrs: Record<string, string>, options: ProductOption[]) =>
  options.map((o) => `${o.name}=${attrs[o.name] ?? ""}`).join("|");

/** Human label, e.g. "M / Black". */
export const variantLabel = (attrs: Record<string, string>, options: ProductOption[]) =>
  options.map((o) => attrs[o.name]).filter(Boolean).join(" / ");

/**
 * Every combination of the option values. Keeps price, stock and photo of combinations
 * that already existed, so editing options never wipes the admin's numbers.
 */
export function generateVariants(options: ProductOption[], existing: ProductVariant[] = []): ProductVariant[] {
  const opts = usableOptions(options);
  if (opts.length === 0) return [];
  const combos = opts.reduce<Record<string, string>[]>(
    (acc, o) => acc.flatMap((attrs) => o.values.map((v) => ({ ...attrs, [o.name]: v }))),
    [{}],
  );
  const byKey = new Map(existing.map((v) => [variantKey(v.attrs, opts), v]));
  return combos.map((attrs) => {
    const key = variantKey(attrs, opts);
    const prev = byKey.get(key);
    return prev ? { ...prev, attrs } : { id: key, attrs, stock: 0 };
  });
}

/** Total stock: the sum of variant stock when variants exist. */
export const totalStock = (p: Product) =>
  hasVariants(p) ? p.variants!.reduce((sum, v) => sum + Math.max(0, v.stock), 0) : p.stock;

export const variantPrice = (p: Product, v?: ProductVariant) => v?.price ?? p.price;

/** Lowest and highest price across in-stock variants (or all variants if none are in stock). */
export function priceRange(p: Product): { min: number; max: number } {
  if (!hasVariants(p)) return { min: p.price, max: p.price };
  const inStock = p.variants!.filter((v) => v.stock > 0);
  const prices = (inStock.length ? inStock : p.variants!).map((v) => variantPrice(p, v));
  return { min: Math.min(...prices), max: Math.max(...prices) };
}

/** The variant matching a full selection, or undefined while the shopper is still choosing. */
export function findVariant(p: Product, selection: Record<string, string>): ProductVariant | undefined {
  const opts = usableOptions(p.options);
  if (!hasVariants(p) || opts.some((o) => !selection[o.name])) return undefined;
  const key = variantKey(selection, opts);
  return p.variants!.find((v) => variantKey(v.attrs, opts) === key);
}

/** Whether choosing `value` for option `name` (given the other choices) can lead to an in-stock variant. */
export function isValueAvailable(p: Product, selection: Record<string, string>, name: string, value: string) {
  if (!hasVariants(p)) return true;
  const want = { ...selection, [name]: value };
  return p.variants!.some(
    (v) => v.stock > 0 && Object.entries(want).every(([k, val]) => !val || v.attrs[k] === val),
  );
}

/** YouTube video id from watch, share, shorts or embed links; null if it is not a YouTube URL. */
export function youtubeId(url?: string): string | null {
  if (!url) return null;
  try {
    const u = new URL(url.trim());
    const host = u.hostname.replace(/^www\.|^m\./, "");
    let id: string | null = null;
    if (host === "youtu.be") id = u.pathname.slice(1);
    else if (host === "youtube.com" || host === "youtube-nocookie.com") {
      if (u.pathname === "/watch") id = u.searchParams.get("v");
      else {
        const m = u.pathname.match(/^\/(?:shorts|embed|live)\/([^/]+)/);
        id = m ? m[1] : null;
      }
    }
    return id && /^[\w-]{6,20}$/.test(id) ? id : null;
  } catch {
    return null;
  }
}
