"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useCatalog } from "@/context/CatalogContext";
import ProductCard from "./ProductCard";

/** One homepage section per category that has a homeTitle, showing its active products. */
export default function CategoryShowcase() {
  const { categories, products } = useCatalog();
  const sections = categories
    .filter((c) => c.homeTitle)
    .sort((a, b) => (a.homeOrder ?? a.order) - (b.homeOrder ?? b.order))
    .map((c) => ({ category: c, items: products.filter((p) => p.categoryId === c.id).slice(0, 8) }))
    .filter((s) => s.items.length > 0);

  return sections.map(({ category, items }) => (
    <section key={category.id} aria-labelledby={`home-${category.id}`} className="mx-auto max-w-7xl px-4 pt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 id={`home-${category.id}`} className="text-2xl font-bold text-primary sm:text-3xl">
            {category.homeTitle}
          </h2>
          {category.homeSubtitle && <p className="mt-1 text-muted">{category.homeSubtitle}</p>}
        </div>
        <Link
          href={`/shop?category=${category.id}`}
          className="flex min-h-11 items-center gap-1.5 font-semibold text-primary transition hover:text-accent-ink"
        >
          See all <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
        {items.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  ));
}
