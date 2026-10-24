"use client";

import Image from "next/image";
import { useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { productTabs } from "@/data/products";
import { saveProduct, uploadProductImage } from "@/lib/db";
import type { Category, Gradient, Product, ProductTag } from "@/types";
import { btnGhost, btnPrimary, input, label } from "./ui";

const gradients: Gradient[] = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];

export function emptyProduct(id: string, categoryId: string): Product {
  return {
    id,
    name: "",
    price: 0,
    categoryId,
    description: "",
    images: [],
    stock: 0,
    rating: 5,
    reviews: 0,
    tag: "new",
    trending: false,
    gradient: gradients[Math.floor(Math.random() * gradients.length)],
    active: true,
  };
}

interface Props {
  initial: Product;
  categories: Category[];
  onDone: (saved: boolean) => void;
}

export default function ProductForm({ initial, categories, onDone }: Props) {
  const [p, setP] = useState<Product>(initial);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Product>(key: K, value: Product[K]) => setP((cur) => ({ ...cur, [key]: value }));

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all([...files].map((f) => uploadProductImage(p.id, f)));
      setP((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    } catch {
      setError("Photo upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (p.oldPrice && p.oldPrice <= p.price) return setError("Old price must be higher than the price.");
        setBusy(true);
        setError("");
        try {
          await saveProduct({ ...p, name: p.name.trim(), oldPrice: p.oldPrice || undefined });
          onDone(true);
        } catch {
          setError("Could not save. Check your connection and admin access.");
          setBusy(false);
        }
      }}
    >
      <label className={label}>
        Product name
        <input required value={p.name} onChange={(e) => set("name", e.target.value)} className={input} />
      </label>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <label className={label}>
          Price (৳)
          <input required type="number" min={1} value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={input} />
        </label>
        <label className={label}>
          Old price (৳) <span className="text-xs font-normal text-muted">optional</span>
          <input type="number" min={0} value={p.oldPrice ?? ""} onChange={(e) => set("oldPrice", e.target.value ? Number(e.target.value) : undefined)} className={input} />
        </label>
        <label className={label}>
          Stock
          <input required type="number" min={0} value={p.stock} onChange={(e) => set("stock", Number(e.target.value))} className={input} />
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label className={label}>
          Category
          <select required value={p.categoryId} onChange={(e) => set("categoryId", e.target.value)} className={input}>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Homepage tab
          <select value={p.tag} onChange={(e) => set("tag", e.target.value as ProductTag)} className={input}>
            {productTabs.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
        </label>
      </div>

      <label className={label}>
        Description
        <textarea rows={4} value={p.description} onChange={(e) => set("description", e.target.value)} className={`${input} h-auto py-2`} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="mb-1.5 text-sm font-medium text-text">Photos</legend>
        <div className="flex flex-wrap gap-3">
          {p.images.map((src, i) => (
            <div key={src} className="relative size-24 overflow-hidden rounded-control ring-1 ring-line">
              <Image src={src} alt={`Photo ${i + 1}`} fill sizes="96px" className="object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() => set("images", p.images.filter((x) => x !== src))}
                className="absolute top-1 right-1 flex size-7 items-center justify-center rounded-full bg-bg/90 text-sale shadow-soft"
              >
                <X className="size-4" aria-hidden />
              </button>
            </div>
          ))}
          <label className="flex size-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-control border-2 border-dashed border-line text-xs font-medium text-muted transition hover:border-primary hover:text-primary">
            <ImagePlus className="size-6" aria-hidden />
            {uploading ? "Uploading…" : "Add photos"}
            <input type="file" accept="image/*" multiple className="sr-only" disabled={uploading} onChange={(e) => onFiles(e.target.files)} />
          </label>
        </div>
        <p className="text-xs text-muted">The first photo is the main one. Square photos look best.</p>
      </fieldset>

      <div className="flex flex-wrap gap-5">
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={p.trending} onChange={(e) => set("trending", e.target.checked)} className="size-4 accent-primary" />
          Show in Trending Products
        </label>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={p.active} onChange={(e) => set("active", e.target.checked)} className="size-4 accent-primary" />
          Visible in shop
        </label>
      </div>

      {error && <p role="alert" className="text-sm text-sale">{error}</p>}
      <div className="flex justify-end gap-2 border-t border-line pt-4">
        <button type="button" onClick={() => onDone(false)} className={btnGhost}>Cancel</button>
        <button type="submit" disabled={busy || uploading} className={btnPrimary}>{busy ? "Saving…" : "Save product"}</button>
      </div>
    </form>
  );
}
