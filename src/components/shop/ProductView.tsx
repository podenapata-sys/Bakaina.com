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
  const soldOut = product.stock <= 0;
  const images = product.images;

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
            <span className="text-3xl font-bold text-accent-ink">{formatPrice(product.price)}</span>
            {product.oldPrice && (
              <>
                <span className="text-lg text-muted line-through">
                  <span className="sr-only">was </span>
                  {formatPrice(product.oldPrice)}
                </span>
                <span className="rounded-full bg-sale px-2.5 py-0.5 text-sm font-semibold text-on-primary">
                  Save {Math.round((1 - product.price / product.oldPrice) * 100)}%
                </span>
              </>
            )}
          </p>
          <p className={`text-sm font-semibold ${soldOut ? "text-sale" : "text-primary"}`}>
            {soldOut ? "Out of stock" : product.stock <= 5 ? `Only ${product.stock} left` : "In stock"}
          </p>
          <p className="leading-relaxed text-muted">{product.description}</p>

          <div className="flex flex-wrap items-stretch gap-3">
            <div role="group" aria-label="Quantity" className="flex items-center rounded-full border border-line">
              <button type="button" aria-label="Decrease quantity" onClick={() => setQty((q) => Math.max(1, q - 1))} className="flex size-12 items-center justify-center text-text disabled:opacity-40" disabled={qty <= 1}>
                <Minus className="size-4" aria-hidden />
              </button>
              <span aria-live="polite" className="min-w-8 text-center font-semibold">{qty}</span>
              <button type="button" aria-label="Increase quantity" onClick={() => setQty((q) => Math.min(product.stock, q + 1))} className="flex size-12 items-center justify-center text-text disabled:opacity-40" disabled={qty >= product.stock}>
                <Plus className="size-4" aria-hidden />
              </button>
            </div>
            <button
              type="button"
              disabled={soldOut}
              onClick={() => {
                for (let i = 0; i < qty; i++) addToCart(product.id);
                setAdded(true);
              }}
              className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-accent px-6 font-semibold text-on-accent transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-line disabled:text-muted"
            >
              <ShoppingCart className="size-5" aria-hidden />
              {soldOut ? "Sold out" : added ? "Added to cart ✓" : "Add to Cart"}
            </button>
          </div>

          <ul className="flex flex-col gap-3 rounded-card bg-surface p-5 text-sm">
            <li className="flex items-center gap-3"><Truck className="size-5 text-primary" aria-hidden /> Delivery all over Bangladesh</li>
            <li className="flex items-center gap-3"><ShieldCheck className="size-5 text-primary" aria-hidden /> Cash on delivery — check before you pay</li>
            <li className="flex items-center gap-3"><RotateCcw className="size-5 text-primary" aria-hidden /> Easy return if the product is damaged</li>
          </ul>
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
