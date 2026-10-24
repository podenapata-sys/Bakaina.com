"use client";

import { useState } from "react";
import { useCatalog } from "@/context/CatalogContext";
import { productTabs } from "@/data/products";
import type { ProductTag } from "@/types";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

export default function OurProducts() {
  const [active, setActive] = useState<ProductTag>("special");
  const { products } = useCatalog();
  const visible = products.filter((p) => p.tag === active).slice(0, 8);

  return (
    <section id="products" aria-labelledby="products-heading" className="mx-auto max-w-7xl px-4 py-16">
      <SectionHeading id="products-heading">Our Products</SectionHeading>
      <div role="tablist" aria-label="Product groups" className="mb-8 flex flex-wrap justify-center gap-3">
        {productTabs.map((tab) => {
          const selected = tab.id === active;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={selected}
              aria-controls="products-panel"
              onClick={() => setActive(tab.id)}
              className={`min-h-11 rounded-full border-2 px-5 text-sm font-semibold transition sm:px-6 sm:text-base ${
                selected
                  ? "border-primary bg-primary text-on-primary shadow-soft"
                  : "border-line bg-bg text-primary hover:border-primary"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        id="products-panel"
        role="tabpanel"
        aria-labelledby={`tab-${active}`}
        className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4"
      >
        {visible.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
}
