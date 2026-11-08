"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Banknote, Minus, Plus, RotateCcw, Tag, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductGallery from "./ProductGallery";
import StarRating from "@/components/StarRating";
import { useCatalog } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/data/products";
import { fetchProduct } from "@/lib/db";
import { productJsonLd } from "@/lib/productSeo";
import { bulkActive, bulkTotal } from "@/lib/pricing";
import { productHref, productPagePromises, siteUrl } from "@/lib/site";
import { findVariant, hasVariants, isValueAvailable, priceRange, totalStock, usableOptions, variantPrice, youtubeId } from "@/lib/variants";
import type { Product } from "@/types";

export default function ProductView() {
  const id = useSearchParams().get("id") ?? "";
  const { products, categories, loading } = useCatalog();
  const { addToCart } = useStore();
  const fromCatalog = products.find((p) => p.id === id);
  const [fetched, setFetched] = useState<Product | null | undefined>(undefined);
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState<"" | "cart" | "buy">("");
  const [selection, setSelection] = useState<Record<string, string>>({});

  // Direct visits can arrive before the catalogue loads, or for a product not in it.
  useEffect(() => {
    if (!id || fromCatalog || loading) return;
    let alive = true;
    fetchProduct(id).then((p) => alive && setFetched(p?.active ? p : null), () => alive && setFetched(null));
    return () => {
      alive = false;
    };
  }, [id, fromCatalog, loading]);

  // No ?id= in the link means there is nothing to show.
  const product = id ? (fromCatalog ?? fetched) : null;

  // Static site: the page title is set in the browser once the product has loaded.
  useEffect(() => {
    if (product) document.title = `${product.name} — BAKAINA`;
  }, [product]);

  if (product === undefined) {
    return <p className="mx-auto max-w-7xl px-4 py-16 text-center text-muted">Loading product…</p>;
  }
  if (product === null) {
    return (
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-primary">Product not found</h1>
        <p className="text-muted">It may have been removed or is no longer available.</p>
        <Link href="/shop" className="inline-flex min-h-11 items-center rounded-full bg-primary px-6 font-semibold text-on-primary">
          Browse all products
        </Link>
      </div>
    );
  }

  const category = categories.find((c) => c.id === product.categoryId);
  const related = products.filter((p) => p.categoryId === product.categoryId && p.id !== product.id).slice(0, 4);
  const images = product.images;
  const options = usableOptions(product.options);
  const variantMode = hasVariants(product);
  const variant = findVariant(product, selection);
  const needsChoice = variantMode && !variant;
  const range = priceRange(product);
  const unitPrice = variant ? variantPrice(product, variant) : variantMode ? range.min : product.price;
  const stock = variant ? variant.stock : totalStock(product);
  const soldOut = stock <= 0;
  const oldPrice = product.oldPrice && product.oldPrice > unitPrice ? product.oldPrice : undefined;
  const missing = options.filter((o) => !selection[o.name]).map((o) => o.name.toLowerCase());
  const video = youtubeId(product.videoUrl);

  const pick = (name: string, value: string) => {
    const next = { ...selection, [name]: selection[name] === value ? "" : value };
    setSelection(next);
    setQty(1);
    setAdded("");
    const chosen = findVariant(product, next);
    if (chosen?.image && images.includes(chosen.image)) setPhoto(images.indexOf(chosen.image));
  };

  const detailRows = [
    product.brand && { label: "Brand", value: product.brand },
    ...(product.details ?? []),
    product.warranty && { label: "Warranty", value: product.warranty },
    product.condition && product.condition !== "new" && { label: "Condition", value: product.condition === "used" ? "Used" : "Refurbished" },
    product.sku && { label: "Product code", value: product.sku },
  ].filter(Boolean) as { label: string; value: string }[];

  const jsonLd = JSON.stringify(productJsonLd(product, `${siteUrl}${productHref(product.id)}`)).replace(/</g, "\\u003c");
  const offPct = oldPrice ? Math.round((1 - unitPrice / oldPrice) * 100) : 0;
  const bulk = bulkActive(product.bulk) ? product.bulk : undefined;
  const line = bulkTotal(unitPrice, qty, bulk);
  const needMore = bulk ? bulk.minQty - qty : 0;
  const canBuy = !soldOut && !needsChoice;
  const blockedLabel = soldOut ? "স্টক শেষ" : `${missing.join(" ও ")} বেছে নিন`;
  const add = (kind: "cart" | "buy") => {
    addToCart(product.id, { variantId: variant?.id, qty });
    setAdded(kind);
  };
  const faqs = [
    ...(product.faqs ?? []),
    { q: "ডেলিভারি", a: productPagePromises.delivery },
    { q: "রিটার্ন ও রিফান্ড পলিসি", a: productPagePromises.returns },
  ];
  const trustIcons = [Truck, Banknote, RotateCcw];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd }} />
      <nav aria-label="Breadcrumb" className="mb-6 flex flex-wrap gap-2 text-sm text-muted">
        <Link href="/" className="hover:text-primary">Home</Link>
        <span aria-hidden>/</span>
        <Link href="/shop" className="hover:text-primary">Shop</Link>
        {category && (
          <>
            <span aria-hidden>/</span>
            <Link href={`/shop?category=${category.id}`} className="hover:text-primary">{category.name}</Link>
          </>
        )}
      </nav>

      <div className="mx-auto grid max-w-[1040px] items-start gap-8 lg:grid-cols-2 lg:gap-10">
        <ProductGallery product={product} photo={Math.min(photo, Math.max(0, images.length - 1))} onPhoto={setPhoto} badge={offPct > 0 ? `${offPct}% ছাড়` : undefined} />

        <div className="flex min-w-0 flex-col">
          {product.reviews > 0 && <StarRating rating={product.rating} reviews={product.reviews} />}
          <h1 className="mt-1.5 mb-3 text-[clamp(26px,5.4vw,34px)] leading-tight font-semibold tracking-tight text-text lg:text-[40px]">
            <span className="block">{product.name}</span>
            {product.nameBn && (
              <span lang="bn" className="mt-1.5 block text-[0.62em] leading-snug font-semibold text-primary">{product.nameBn}</span>
            )}
          </h1>
          {product.shortDescription && <p className="leading-relaxed text-muted">{product.shortDescription}</p>}
          {product.features && product.features.length > 0 && (
            <ul className="mt-4 mb-1 grid gap-1.5">
              {product.features.map((f, i) => (
                <li key={i} className="relative pl-[26px] text-[15px] before:absolute before:top-[7px] before:left-1 before:h-1.5 before:w-2.5 before:-rotate-45 before:border-b-2 before:border-l-2 before:border-primary lg:text-base">
                  {f.label && <strong className="font-semibold">{f.label}: </strong>}
                  {f.text}
                </li>
              ))}
            </ul>
          )}

          <p className="mt-4 flex flex-wrap items-center gap-3">
            {oldPrice && (
              <s className="text-[22px] font-bold text-sale decoration-sale decoration-[2.5px]">
                <span className="sr-only">আগের দাম </span>
                {formatPrice(oldPrice)}
              </s>
            )}
            <strong className="text-[30px] leading-none font-bold text-text">
              {needsChoice && range.min !== range.max && <span className="text-base font-medium text-muted">from </span>}
              {formatPrice(unitPrice)}
            </strong>
            {offPct > 0 && <span className="rounded-full bg-sale px-3 py-1 text-sm font-bold text-on-primary">{offPct}% ছাড়</span>}
          </p>
          <p className={`mt-2 text-sm font-semibold ${soldOut ? "text-sale" : "text-primary"}`} aria-live="polite">
            {soldOut ? "স্টক শেষ" : stock <= 5 ? `মাত্র ${stock}টি বাকি` : "স্টকে আছে"}
          </p>

          {options.map((o) => (
            <fieldset key={o.name} className="mt-[18px] flex flex-col">
              <legend className="mb-2 text-sm font-medium text-text">
                {o.name}: <span className="text-muted">{selection[o.name] || "বেছে নিন"}</span>
              </legend>
              <div className="flex flex-wrap gap-2">
                {o.values.map((v) => {
                  const selected = selection[o.name] === v;
                  const available = isValueAvailable(product, selection, o.name, v);
                  return (
                    <button
                      key={v}
                      type="button"
                      aria-pressed={selected}
                      disabled={!available && !selected}
                      onClick={() => pick(o.name, v)}
                      className={`min-h-11 min-w-11 rounded-full border-[1.5px] px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:line-through ${
                        selected ? "border-primary bg-primary text-on-primary" : "border-line bg-bg text-text hover:border-primary"
                      }`}
                    >
                      {v}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          ))}

          {bulk && (
            <p className="mt-[18px] flex items-center gap-2.5 rounded-xl border-[1.5px] border-dashed border-tint-line bg-tint px-3.5 py-3 text-sm font-semibold text-primary">
              <Tag className="size-5 shrink-0" aria-hidden />
              {bulk.minQty}টি বা বেশি কিনলে পুরো অর্ডারে {bulk.percent}% ছাড়!
            </p>
          )}

          <div className="mt-[18px]">
            <p className="mb-2 text-sm font-medium text-text">পরিমাণ</p>
            <div role="group" aria-label="Quantity" className="inline-flex items-center rounded-full border-[1.5px] border-line">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-11 items-center justify-center text-text disabled:opacity-35" disabled={qty <= 1}>
                <Minus className="size-4" aria-hidden />
              </button>
              <output aria-live="polite" className="min-w-7 text-center font-semibold">{qty}</output>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(Math.max(stock, 1), q + 1))} className="flex size-11 items-center justify-center text-text disabled:opacity-35" disabled={qty >= stock}>
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <div className="mt-3 border-t border-line pt-3" aria-live="polite">
              <p className="flex items-baseline justify-between text-[15px] text-muted">
                <span>মোট</span>
                <span>
                  {line.discount > 0 && <s className="mr-1.5 text-[15px] font-medium">{formatPrice(line.sub)}</s>}
                  <strong className="text-[22px] font-bold text-text">{formatPrice(line.total)}</strong>
                </span>
              </p>
              {line.discount > 0 && <p className="mt-0.5 text-right text-sm font-semibold text-save">আপনি বাঁচাচ্ছেন {formatPrice(line.discount)}</p>}
              {bulk && needMore > 0 && needMore <= 2 && (
                <p className="mt-1.5 text-[13px] text-primary">আর {needMore}টি যোগ করলে {bulk.percent}% ছাড়</p>
              )}
            </div>
          </div>

          <ul aria-label="কেনার সুবিধা" className="mt-4 mb-1 grid grid-cols-3 gap-2 text-center">
            {productPagePromises.trust.map((t, i) => {
              const Icon = trustIcons[i];
              return (
                <li key={t} className="flex flex-col items-center gap-1.5 rounded-[14px] border-[1.5px] border-tint-line bg-tint px-1.5 pt-3 pb-2.5 text-[13.5px] leading-snug font-bold sm:text-[14.5px]">
                  <span className="flex size-[34px] items-center justify-center rounded-full bg-primary text-on-primary">
                    <Icon className="size-[18px]" strokeWidth={1.8} aria-hidden />
                  </span>
                  {t}
                </li>
              );
            })}
          </ul>

          <button
            type="button"
            disabled={!canBuy}
            onClick={() => add("cart")}
            className="mt-3 flex min-h-[50px] w-full items-center justify-center rounded-full border-[1.5px] border-text bg-bg px-7 font-semibold text-text transition hover:bg-text hover:text-bg active:scale-[.98] disabled:cursor-not-allowed disabled:border-line disabled:bg-bg disabled:text-muted"
          >
            {canBuy ? (added === "cart" ? "কার্টে যোগ হয়েছে ✓" : "কার্টে যোগ করুন") : blockedLabel}
          </button>
          <button
            type="button"
            disabled={!canBuy}
            onClick={() => add("buy")}
            className="mt-3 flex min-h-[50px] w-full items-center justify-center rounded-full bg-accent px-7 font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
          >
            এখনই কিনুন
          </button>
          {added === "buy" && (
            <p role="status" className="mt-2 text-center text-sm text-primary">কার্টে যোগ হয়েছে ✓ অনলাইন চেকআউট শিগগিরই চালু হচ্ছে।</p>
          )}

          <div className="mt-5">
            <Accordion title="বিবরণ" open>
              <p className="whitespace-pre-line">{product.description}</p>
              {detailRows.length > 0 && (
                <table className="mt-3 w-full text-left">
                  <caption className="sr-only">Product details</caption>
                  <tbody className="divide-y divide-line">
                    {detailRows.map((d) => (
                      <tr key={d.label}>
                        <th scope="row" className="w-1/3 py-2 pr-4 font-semibold text-text">{d.label}</th>
                        <td className="py-2">{d.value}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </Accordion>
            {video && (
              <Accordion title="ভিডিও">
                <div className="relative aspect-video w-full overflow-hidden rounded-card bg-surface">
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${video}`}
                    title={`${product.name} video`}
                    loading="lazy"
                    allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="absolute inset-0 size-full"
                  />
                </div>
              </Accordion>
            )}
            {faqs.map((f, i) => (
              <Accordion key={i} title={f.q}>
                <p className="whitespace-pre-line">{f.a}</p>
              </Accordion>
            ))}
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related-heading" className="mt-16">
          <h2 id="related-heading" className="mb-6 text-xl font-bold text-primary sm:text-2xl">You may also like</h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

/** FAQ-style row with +/− on the right, as in the product page kit. */
function Accordion({ title, open = false, children }: { title: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group border-b border-line [&_summary::-webkit-details-marker]:hidden">
      <summary className="relative cursor-pointer list-none py-[15px] pr-8 text-[15px] font-medium text-text after:absolute after:top-1/2 after:right-0.5 after:-translate-y-1/2 after:text-xl after:content-['+'] group-open:after:content-['−']">
        {title}
      </summary>
      <div className="pb-4 text-sm leading-relaxed text-muted">{children}</div>
    </details>
  );
}
