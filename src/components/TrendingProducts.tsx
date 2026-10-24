"use client";

import { useCatalog } from "@/context/CatalogContext";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

export default function TrendingProducts() {
  const { products } = useCatalog();
  const trending = products.filter((p) => p.trending).slice(0, 4);
  if (trending.length === 0) return null;
  return (
    <section id="trending" aria-labelledby="trending-heading" className="mx-auto max-w-7xl px-4 pt-16">
      <SectionHeading id="trending-heading">Trending Products</SectionHeading>
      <div className="grid gap-5 md:grid-cols-2">
        {trending.map((p) => (
          <ProductCard key={p.id} product={p} variant="horizontal" />
        ))}
      </div>
    </section>
  );
}
