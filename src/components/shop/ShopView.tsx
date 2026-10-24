"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useMemo } from "react";
import { Search, X } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useCatalog } from "@/context/CatalogContext";

const sorts = {
  newest: "Newest",
  "price-asc": "Price: low to high",
  "price-desc": "Price: high to low",
  popular: "Most popular",
} as const;
type SortKey = keyof typeof sorts;

export default function ShopView() {
  const { products, categories, loading, error } = useCatalog();
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const q = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const sort = (params.get("sort") as SortKey) in sorts ? (params.get("sort") as SortKey) : "newest";

  const setParam = (key: string, value: string) => {
    const next = new URLSearchParams(params.toString());
    if (value) next.set(key, value);
    else next.delete(key);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  };

  const visible = useMemo(() => {
    const needle = q.toLowerCase();
    const list = products.filter(
      (p) =>
        (!category || p.categoryId === category) &&
        (!needle || p.name.toLowerCase().includes(needle) || p.description.toLowerCase().includes(needle)),
    );
    const sorted = [...list];
    if (sort === "price-asc") sorted.sort((a, b) => a.price - b.price);
    if (sort === "price-desc") sorted.sort((a, b) => b.price - a.price);
    if (sort === "popular") sorted.sort((a, b) => b.reviews - a.reviews);
    return sorted;
  }, [products, q, category, sort]);

  const activeCategory = categories.find((c) => c.id === category);
  const chip = (selected: boolean) =>
    `min-h-11 shrink-0 rounded-full border-2 px-4 text-sm font-semibold transition ${
      selected ? "border-primary bg-primary text-on-primary" : "border-line bg-bg text-primary hover:border-primary"
    }`;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-bold text-primary sm:text-3xl">{activeCategory?.name ?? "All Products"}</h1>
      <p className="mt-1 text-sm text-muted">
        {loading ? "Loading products…" : `${visible.length} product${visible.length === 1 ? "" : "s"}`}
        {q && (
          <>
            {" "}for “{q}”{" "}
            <button type="button" onClick={() => setParam("q", "")} className="inline-flex items-center gap-1 font-semibold text-primary underline">
              <X className="size-3.5" aria-hidden /> clear search
            </button>
          </>
        )}
      </p>

      <div className="mt-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div role="group" aria-label="Filter by category" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1 lg:mx-0 lg:flex-wrap lg:px-0">
          <button type="button" aria-pressed={!category} onClick={() => setParam("category", "")} className={chip(!category)}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} type="button" aria-pressed={category === c.id} onClick={() => setParam("category", c.id)} className={chip(category === c.id)}>
              {c.name}
            </button>
          ))}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <label htmlFor="sort" className="text-sm font-medium text-muted">
            Sort by
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setParam("sort", e.target.value === "newest" ? "" : e.target.value)}
            className="h-11 rounded-control border border-line bg-bg px-3 text-sm font-medium text-text"
          >
            {Object.entries(sorts).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error && <p className="mt-6 rounded-control bg-sale/10 p-4 text-sm text-sale">Could not load products: {error}</p>}

      {!loading && visible.length === 0 ? (
        <div className="mt-16 flex flex-col items-center gap-3 text-center text-muted">
          <Search className="size-10" aria-hidden />
          <p className="font-semibold text-text">No products found</p>
          <p className="text-sm">Try another search or category.</p>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}
