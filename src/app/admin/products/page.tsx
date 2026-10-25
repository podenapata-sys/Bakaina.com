"use client";

import { useCallback, useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import ProductForm, { emptyProduct } from "@/components/admin/ProductForm";
import { btnAccent, card, input } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import ProductImage from "@/components/ProductImage";
import { useCatalog } from "@/context/CatalogContext";
import { formatPrice } from "@/data/products";
import { deleteProduct, fetchCategories, fetchProducts, newId } from "@/lib/db";
import { totalStock } from "@/lib/variants";
import type { Product } from "@/types";

export default function AdminProducts() {
  const load = useCallback(async () => {
    const [products, categories] = await Promise.all([fetchProducts(), fetchCategories()]);
    return { products, categories };
  }, []);
  const { data, loading, error, reload } = useAdminData(load, { products: [], categories: [] });
  const { refresh } = useCatalog();
  const [editing, setEditing] = useState<Product | null>(null);
  const [search, setSearch] = useState("");

  const catName = (id: string) => data.categories.find((c) => c.id === id)?.name ?? "—";
  const visible = useMemo(() => {
    const q = search.toLowerCase();
    return data.products.filter((p) => !q || p.name.toLowerCase().includes(q));
  }, [data.products, search]);

  async function onDelete(p: Product) {
    if (!window.confirm(`Delete “${p.name}”? This cannot be undone.`)) return;
    await deleteProduct(p);
    await Promise.all([reload(), refresh()]);
  }

  if (editing) {
    return (
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-primary">{editing.name ? `Edit: ${editing.name}` : "Add product"}</h1>
        <div className={card}>
          <ProductForm
            initial={editing}
            categories={data.categories}
            onDone={async (saved) => {
              setEditing(null);
              if (saved) await Promise.all([reload(), refresh()]);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">Products</h1>
        <button
          type="button"
          disabled={data.categories.length === 0}
          title={data.categories.length === 0 ? "Add a category first" : undefined}
          onClick={() => setEditing(emptyProduct(newId(), data.categories[0]?.id ?? ""))}
          className={btnAccent}
        >
          <Plus className="size-4" aria-hidden /> Add product
        </button>
      </div>
      {error && <p className="rounded-control bg-sale/10 p-4 text-sm text-sale">{error}</p>}

      <div className={`${card} flex flex-col gap-4`}>
        <div className="relative max-w-sm">
          <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden />
          <label htmlFor="product-search" className="sr-only">Search products</label>
          <input id="product-search" type="search" placeholder="Search products…" value={search} onChange={(e) => setSearch(e.target.value)} className={`${input} pl-9`} />
        </div>

        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : visible.length === 0 ? (
          <p className="text-sm text-muted">No products found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-sm">
              <thead className="border-b border-line text-xs tracking-wide text-muted uppercase">
                <tr>
                  <th className="py-2 pr-3 font-semibold">Product</th>
                  <th className="px-3 py-2 font-semibold">Category</th>
                  <th className="px-3 py-2 font-semibold">Price</th>
                  <th className="px-3 py-2 font-semibold">Stock</th>
                  <th className="px-3 py-2 font-semibold">Status</th>
                  <th className="py-2 pl-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {visible.map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <ProductImage product={p} sizes="48px" className="size-12 shrink-0 rounded-control" />
                        <span className="flex flex-col">
                          <span className="font-medium text-text">{p.name}</span>
                          {(p.variants?.length ?? 0) > 0 && <span className="text-xs text-muted">{p.variants!.length} variants</span>}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-muted">{catName(p.categoryId)}</td>
                    <td className="px-3 py-3 font-semibold">{formatPrice(p.price)}</td>
                    <td className={`px-3 py-3 font-semibold ${totalStock(p) === 0 ? "text-sale" : totalStock(p) <= 5 ? "text-accent-ink" : ""}`}>{totalStock(p)}</td>
                    <td className="px-3 py-3">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${p.active ? "bg-primary/10 text-primary" : "bg-surface text-muted ring-1 ring-line"}`}>
                        {p.active ? "Visible" : "Hidden"}
                      </span>
                    </td>
                    <td className="py-3 pl-3">
                      <div className="flex justify-end gap-1">
                        <button type="button" aria-label={`Edit ${p.name}`} onClick={() => setEditing(p)} className="flex size-10 items-center justify-center rounded-control text-primary hover:bg-surface">
                          <Pencil className="size-4" aria-hidden />
                        </button>
                        <button type="button" aria-label={`Delete ${p.name}`} onClick={() => onDelete(p)} className="flex size-10 items-center justify-center rounded-control text-sale hover:bg-sale/10">
                          <Trash2 className="size-4" aria-hidden />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
