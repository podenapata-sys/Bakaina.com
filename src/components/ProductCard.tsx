"use client";

import Link from "next/link";
import { Heart, ShoppingCart, SlidersHorizontal, TrendingUp } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { formatPrice } from "@/data/products";
import { hasVariants, priceRange, totalStock } from "@/lib/variants";
import type { Product } from "@/types";
import ProductImage from "./ProductImage";
import StarRating from "./StarRating";

interface Props {
  product: Product;
  variant?: "horizontal" | "vertical";
}

function Price({ product }: { product: Product }) {
  const { min, max } = priceRange(product);
  const oldPrice = product.oldPrice && product.oldPrice > min ? product.oldPrice : undefined;
  return (
    <p className="flex flex-wrap items-baseline gap-2">
      <span className="text-lg font-bold text-accent-ink">
        {min !== max && <span className="text-sm font-medium text-muted">from </span>}
        {formatPrice(min)}
      </span>
      {oldPrice && (
        <span className="text-sm text-muted line-through">
          <span className="sr-only">was </span>
          {formatPrice(oldPrice)}
        </span>
      )}
    </p>
  );
}

function WishlistButton({ product }: { product: Product }) {
  const { wishlist, toggleWishlist } = useStore();
  const saved = wishlist.has(product.id);
  return (
    <button
      type="button"
      aria-pressed={saved}
      aria-label={saved ? `Remove ${product.name} from wishlist` : `Add ${product.name} to wishlist`}
      onClick={() => toggleWishlist(product.id)}
      className="absolute top-3 right-3 flex size-10 items-center justify-center rounded-full bg-bg/90 shadow-soft transition hover:scale-105"
    >
      <Heart className={`size-5 transition ${saved ? "fill-sale text-sale" : "text-muted"}`} aria-hidden />
    </button>
  );
}

export function AddToCart({ product, compact }: { product: Product; compact?: boolean }) {
  const { addToCart } = useStore();
  const soldOut = totalStock(product) <= 0;
  const base = `inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-4 text-sm font-semibold transition active:scale-[0.98] ${compact ? "w-full" : ""}`;
  // Products with sizes/colours need a choice first, which happens on the product page.
  if (hasVariants(product) && !soldOut) {
    return (
      <Link href={`/product/${product.id}`} className={`${base} bg-primary text-on-primary hover:bg-primary-hover`}>
        <SlidersHorizontal className="size-4" aria-hidden />
        Choose options
      </Link>
    );
  }
  return (
    <button
      type="button"
      disabled={soldOut}
      onClick={() => addToCart(product.id)}
      className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-control bg-accent px-4 text-sm font-semibold text-on-accent transition hover:bg-accent-hover active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-line disabled:text-muted ${compact ? "w-full" : ""}`}
    >
      <ShoppingCart className="size-4" aria-hidden />
      {soldOut ? "Sold out" : "Add to Cart"}
    </button>
  );
}

export default function ProductCard({ product, variant = "vertical" }: Props) {
  if (variant === "horizontal") {
    return (
      <article className="relative flex min-w-0 items-center gap-4 rounded-card bg-bg p-3 pt-8 shadow-soft transition duration-300 hover:-translate-y-0.5 hover:shadow-lift sm:gap-5 sm:p-5">
        <span className="absolute top-0 left-0 z-10 inline-flex items-center gap-1 rounded-tl-card rounded-br-control bg-sale px-3 py-1 text-xs font-semibold text-on-primary">
          <TrendingUp className="size-3.5" aria-hidden /> Trending
        </span>
        <div className="relative aspect-square w-28 shrink-0 sm:w-40 lg:w-44">
          <Link href={`/product/${product.id}`} aria-label={product.name} tabIndex={-1}>
            <ProductImage product={product} sizes="176px" className="size-full rounded-control" />
          </Link>
          <WishlistButton product={product} />
        </div>
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h3 className="text-sm font-semibold text-text sm:text-lg">
            <Link href={`/product/${product.id}`} className="hover:text-primary">{product.name}</Link>
          </h3>
          <StarRating rating={product.rating} reviews={product.reviews} />
          <Price product={product} />
          <div className="mt-1">
            <AddToCart product={product} />
          </div>
        </div>
      </article>
    );
  }

  return (
    <article className="flex min-w-0 flex-col gap-3 rounded-card bg-bg p-3 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-lift sm:p-4">
      <div className="relative aspect-square w-full">
        <Link href={`/product/${product.id}`} aria-label={product.name} tabIndex={-1}>
          <ProductImage product={product} sizes="(min-width: 1024px) 25vw, 50vw" className="size-full rounded-control" />
        </Link>
        <WishlistButton product={product} />
      </div>
      <h3 className="line-clamp-2 min-h-[2.5em] text-sm font-semibold text-text sm:text-base">
        <Link href={`/product/${product.id}`} className="hover:text-primary">{product.name}</Link>
      </h3>
      <StarRating rating={product.rating} reviews={product.reviews} />
      <Price product={product} />
      <div className="mt-auto">
        <AddToCart product={product} compact />
      </div>
    </article>
  );
}
