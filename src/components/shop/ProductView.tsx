"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Minus, Plus, RotateCcw, ShieldCheck, ShoppingCart, Truck } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import ProductImage from "@/components/ProductImage";
import StarRating from "@/components/StarRating";
import { useCatalog } from "@/context/CatalogContext";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/data/products";
import { fetchProduct } from "@/lib/db";
import { findVariant, hasVariants, isValueAvailable, priceRange, totalStock, usableOptions, variantPrice, youtubeId } from "@/lib/variants";
import type { Product } from "@/types";

export default function ProductView() {
  const { id } = useParams<{ id: string }>();
  const { products, categories, loading } = useCatalog();
  const { addToCart } = useStore();
  const fromCatalog = products.find((p) => p.id === id);
  const [fetched, setFetched] = useState<Product | null | undefined>(undefined);
  const [photo, setPhoto] = useState(0);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [selection, setSelection] = useState<Record<string, string>>({});

  // Direct visits can arrive before the catalogue loads, or for a product not in it.
  useEffect(() => {
    if (fromCatalog || loading) return;
    let alive = true;
    fetchProduct(id).then((p) => alive && setFetched(p?.active ? p : null), () => alive && setFetched(null));
    return () => {
      alive = false;
    };
  }, [id, fromCatalog, loading]);

  const product = fromCatalog ?? fetched;

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
    setAdded(false);
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

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
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

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="relative aspect-square w-full overflow-hidden rounded-card shadow-soft">
            {images.length > 0 ? (
              <Image src={images[photo] ?? images[0]} alt={product.name} fill sizes="(min-width: 1024px) 50vw, 100vw" className="object-cover" fetchPriority="high" />
            ) : (
              <ProductImage product={product} sizes="50vw" className="size-full" />
            )}
          </div>
          {images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  aria-label={`Show photo ${i + 1}`}
                  aria-pressed={i === photo}
                  onClick={() => setPhoto(i)}
                  className={`relative aspect-square overflow-hidden rounded-control ring-2 ${i === photo ? "ring-primary" : "ring-transparent"}`}
                >
                  <Image src={src} alt="" fill sizes="100px" className="object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <div className="flex flex-col gap-2">
            <h1 className="text-2xl leading-tight font-bold text-text sm:text-3xl">{product.name}</h1>
            <StarRating rating={product.rating} reviews={product.reviews} />
          </div>
          <p className="flex flex-wrap items-baseline gap-3">
            <span className="text-3xl font-bold text-accent-ink">
              {needsChoice && range.min !== range.max && <span className="text-base font-medium text-muted">from </span>}
              {formatPrice(unitPrice)}
            </span>
            {oldPrice && (
              <>
                <span className="text-lg text-muted line-through">
                  <span className="sr-only">was </span>
                  {formatPrice(oldPrice)}
                </span>
                <span className="rounded-full bg-sale px-2.5 py-0.5 text-sm font-semibold text-on-primary">
                  Save {Math.round((1 - unitPrice / oldPrice) * 100)}%
                </span>
              </>
            )}
          </p>
          {product.shortDescription && <p className="leading-relaxed text-text">{product.shortDescription}</p>}
          <p className={`text-sm font-semibold ${soldOut ? "text-sale" : "text-primary"}`} aria-live="polite">
            {soldOut ? "Out of stock" : stock <= 5 ? `Only ${stock} left` : "In stock"}
          </p>

          {options.map((o) => (
            <fieldset key={o.name} className="flex flex-col gap-2">
              <legend className="mb-2 text-sm font-semibold text-text">
                {o.name}: <span className="font-normal text-muted">{selection[o.name] || "choose one"}</span>
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
                      className={`min-h-11 min-w-11 rounded-control border-2 px-4 text-sm font-semibold transition disabled:cursor-not-allowed disabled:border-line disabled:text-muted disabled:line-through ${
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

          <div className="flex flex-wrap items-stretch gap-3">
            <div role="group" aria-label="Quantity" className="flex items-center rounded-full border border-line">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-12 items-center justify-center text-text disabled:opacity-40" disabled={qty <= 1}>
                <Minus className="size-4" aria-hidden />
              </button>
              <span aria-live="polite" className="min-w-8 text-center font-semibold">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(stock, q + 1))} className="flex size-12 items-center justify-center text-text disabled:opacity-40" disabled={qty >= stock}>
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              disabled={soldOut || needsChoice}
              onClick={() => {
                addToCart(product.id, { variantId: variant?.id, qty });
                setAdded(true);
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              <ShoppingCart className="size-5" aria-hidden />
              {soldOut ? "Sold out" : needsChoice ? `Choose ${missing.join(" & ")}` : added ? "Added to cart ✓" : "Add to Cart"}
            </button>
          </div>

          <ul className="flex flex-col gap-3 rounded-card bg-surface p-5 text-sm">
            <li className="flex items-center gap-3"><Truck className="size-5 text-primary" aria-hidden /> Delivery all over Bangladesh</li>
            <li className="flex items-center gap-3"><ShieldCheck className="size-5 text-primary" aria-hidden /> Cash on delivery — check before you pay</li>
            <li className="flex items-center gap-3"><RotateCcw className="size-5 text-primary" aria-hidden /> Easy return if the product is damaged</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 grid gap-8 lg:grid-cols-2 lg:gap-12">
        <section aria-labelledby="description-heading" className="flex min-w-0 flex-col gap-4">
          <h2 id="description-heading" className="text-xl font-bold text-primary">Description</h2>
          <p className="leading-relaxed whitespace-pre-line text-muted">{product.description}</p>
          {detailRows.length > 0 && (
            <table className="w-full text-left text-sm">
              <caption className="sr-only">Product details</caption>
              <tbody className="divide-y divide-line">
                {detailRows.map((d) => (
                  <tr key={d.label}>
                    <th scope="row" className="w-1/3 py-2.5 pr-4 font-semibold text-text">{d.label}</th>
                    <td className="py-2.5 text-muted">{d.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
        {video && (
          <section aria-labelledby="video-heading" className="flex min-w-0 flex-col gap-4">
            <h2 id="video-heading" className="text-xl font-bold text-primary">Video</h2>
            <div className="relative aspect-video w-full overflow-hidden rounded-card bg-surface shadow-soft">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${video}`}
                title={`${product.name} video`}
                loading="lazy"
                allow="accelerometer; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="absolute inset-0 size-full"
              />
            </div>
          </section>
        )}
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
