"use client";

import Image from "@/components/SmartImage";
import { useEffect, useState } from "react";
import { ChevronDown, ImagePlus, Plus, Trash2, X } from "lucide-react";
import { formatPrice, productTabs } from "@/data/products";
import { fetchProductPrivate, saveProduct, saveProductPrivate, uploadProductImage } from "@/lib/db";
import { generateVariants, totalStock, usableOptions, youtubeId } from "@/lib/variants";
import type { Category, Gradient, Product, ProductCondition, ProductTag } from "@/types";
import { btnGhost, btnPrimary, input, label } from "./ui";
import VariantsEditor from "./VariantsEditor";

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

const opt = (s?: string) => s?.trim() || undefined;
const num = (v: string) => (v === "" ? undefined : Number(v));

/** Tidies optional fields before saving: trims text, drops blank rows, rebuilds variants from options. */
function normalize(p: Product): Product {
  const options = usableOptions(p.options);
  const variants = options.length ? generateVariants(options, p.variants) : undefined;
  const dims = p.dimensionsCm;
  const hasDims = dims && (dims.l || dims.w || dims.h);
  const next: Product = {
    ...p,
    name: p.name.trim(),
    oldPrice: p.oldPrice || undefined,
    shortDescription: opt(p.shortDescription),
    sku: opt(p.sku),
    warranty: opt(p.warranty),
    videoUrl: opt(p.videoUrl),
    seoDescription: opt(p.seoDescription),
    brand: opt(p.brand),
    details: p.details?.map((d) => ({ label: d.label.trim(), value: d.value.trim() })).filter((d) => d.label && d.value),
    weightKg: p.weightKg || undefined,
    dimensionsCm: hasDims ? dims : undefined,
    options: options.length ? options : undefined,
    variants,
  };
  if (next.details?.length === 0) next.details = undefined;
  if (variants) next.stock = totalStock(next);
  return next;
}

function Section({ title, hint, open = false, children }: { title: string; hint?: string; open?: boolean; children: React.ReactNode }) {
  return (
    <details open={open} className="group rounded-card ring-1 ring-line [&_summary::-webkit-details-marker]:hidden">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 px-4 py-3">
        <span>
          <span className="font-semibold text-text">{title}</span>
          {hint && <span className="ml-2 text-xs text-muted">{hint}</span>}
        </span>
        <ChevronDown className="size-5 shrink-0 text-muted transition group-open:rotate-180" aria-hidden />
      </summary>
      <div className="flex flex-col gap-4 border-t border-line p-4">{children}</div>
    </details>
  );
}

interface Props {
  initial: Product;
  categories: Category[];
  onDone: (saved: boolean) => void;
}

export default function ProductForm({ initial, categories, onDone }: Props) {
  const [p, setP] = useState<Product>(initial);
  const [buyingPrice, setBuyingPrice] = useState<number | undefined>(undefined);
  const [privateLoaded, setPrivateLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const set = <K extends keyof Product>(key: K, value: Product[K]) => setP((cur) => ({ ...cur, [key]: value }));

  // The buying price lives in an admin-only document, loaded separately.
  useEffect(() => {
    let alive = true;
    fetchProductPrivate(initial.id)
      .then((d) => alive && setBuyingPrice(d.buyingPrice))
      .catch(() => {})
      .finally(() => alive && setPrivateLoaded(true));
    return () => {
      alive = false;
    };
  }, [initial.id]);

  async function onFiles(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = await Promise.all([...files].map((f) => uploadProductImage(p.id, f)));
      setP((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
    } catch (e) {
      // Our own errors are written for the admin; network failures and timeouts get the generic hint.
      const ours = e instanceof Error && !(e instanceof TypeError) && !(e instanceof DOMException);
      setError(ours ? e.message : "Photo upload failed. Check your connection and try again.");
    } finally {
      setUploading(false);
    }
  }

  const variantMode = (p.variants?.length ?? 0) > 0;
  const profit = buyingPrice !== undefined && p.price > 0 ? p.price - buyingPrice : undefined;
  const details = p.details ?? [];

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        const next = normalize(p);
        if (next.oldPrice && next.oldPrice <= next.price) return setError("Old price must be higher than the price.");
        if (next.videoUrl && !youtubeId(next.videoUrl)) return setError("The video link must be a YouTube link.");
        if (next.options && new Set(next.options.map((o) => o.name.toLowerCase())).size !== next.options.length)
          return setError("Two variant options have the same name.");
        setBusy(true);
        setError("");
        try {
          await saveProduct(next);
        } catch {
          setError("Could not save. Check your connection and admin access.");
          setBusy(false);
          return;
        }
        try {
          if (privateLoaded) await saveProductPrivate(next.id, { buyingPrice });
        } catch {
          setError(
            "Product saved, but the buying price was not. Publish the latest firestore.rules in Firebase → Firestore → Rules, then save again.",
          );
          setBusy(false);
          return;
        }
        onDone(true);
      }}
    >
      <Section title="General information" open>
        <label className={label}>
          Product name
          <input required value={p.name} onChange={(e) => set("name", e.target.value)} className={input} />
        </label>
        <label className={label}>
          <span>
            Short description <span className="text-xs font-normal text-muted">shown under the price · optional</span>
          </span>
          <textarea rows={2} maxLength={500} value={p.shortDescription ?? ""} onChange={(e) => set("shortDescription", e.target.value)} className={`${input} h-auto py-2`} />
        </label>
        <label className={label}>
          Description
          <textarea rows={5} value={p.description} onChange={(e) => set("description", e.target.value)} className={`${input} h-auto py-2`} />
        </label>
        <div className="grid gap-3 sm:grid-cols-3">
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
          <label className={label}>
            Status
            <select value={p.active ? "active" : "draft"} onChange={(e) => set("active", e.target.value === "active")} className={input}>
              <option value="active">Active (in shop)</option>
              <option value="draft">Draft (hidden)</option>
            </select>
          </label>
        </div>
        <label className="flex items-center gap-2 text-sm font-medium">
          <input type="checkbox" checked={p.trending} onChange={(e) => set("trending", e.target.checked)} className="size-4 accent-primary" />
          Show in Trending Products
        </label>
      </Section>

      <Section title="Media" hint={`${p.images.length} photo${p.images.length === 1 ? "" : "s"}`} open>
        <div className="flex flex-wrap gap-3">
          {p.images.map((src, i) => (
            <div key={src} className="relative size-24 overflow-hidden rounded-control ring-1 ring-line">
              <Image src={src} alt={`Photo ${i + 1}`} fill sizes="96px" className="object-cover" />
              <button
                type="button"
                aria-label={`Remove photo ${i + 1}`}
                onClick={() =>
                  setP((cur) => ({
                    ...cur,
                    images: cur.images.filter((x) => x !== src),
                    variants: cur.variants?.map((v) => (v.image === src ? { ...v, image: undefined } : v)),
                  }))
                }
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
        <p className="text-xs text-muted">The first photo is the main one. Square photos under 5 MB look best.</p>
        <label className={label}>
          <span>
            YouTube video link <span className="text-xs font-normal text-muted">optional</span>
          </span>
          <input type="url" placeholder="https://youtu.be/…" value={p.videoUrl ?? ""} onChange={(e) => set("videoUrl", e.target.value)} className={input} />
        </label>
      </Section>

      <Section title="Pricing & inventory" open>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className={label}>
            Selling price (৳)
            <input required type="number" min={1} value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={input} />
          </label>
          <label className={label}>
            <span>
              Old price (৳) <span className="text-xs font-normal text-muted">optional</span>
            </span>
            <input type="number" min={0} value={p.oldPrice ?? ""} onChange={(e) => set("oldPrice", num(e.target.value))} className={input} />
          </label>
          <label className={label}>
            <span>
              Buying price (৳) <span className="text-xs font-normal text-muted">admin only</span>
            </span>
            <input type="number" min={0} disabled={!privateLoaded} value={buyingPrice ?? ""} onChange={(e) => setBuyingPrice(num(e.target.value))} className={input} />
          </label>
        </div>
        {profit !== undefined && (
          <p className={`text-sm font-semibold ${profit >= 0 ? "text-primary" : "text-sale"}`}>
            Profit per item: {formatPrice(profit)}
            {p.price > 0 && ` (${Math.round((profit / p.price) * 100)}% margin)`}
          </p>
        )}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <label className={label}>
            {variantMode ? "Stock (sum of variants)" : "Stock"}
            <input
              required
              type="number"
              min={0}
              value={variantMode ? totalStock(p) : p.stock}
              disabled={variantMode}
              onChange={(e) => set("stock", Number(e.target.value))}
              className={input}
            />
          </label>
          <label className={label}>
            SKU / product code
            <input value={p.sku ?? ""} onChange={(e) => set("sku", e.target.value)} className={input} />
          </label>
          <label className={label}>
            Warranty
            <input placeholder="e.g. 6 months" value={p.warranty ?? ""} onChange={(e) => set("warranty", e.target.value)} className={input} />
          </label>
        </div>
      </Section>

      <Section title="Product details" hint="Brand, model, material…">
        {details.map((d, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-end gap-2">
            <label className={label}>
              Label
              <input value={d.label} placeholder="Material" onChange={(e) => set("details", details.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))} className={input} />
            </label>
            <label className={label}>
              Value
              <input value={d.value} placeholder="ABS plastic" onChange={(e) => set("details", details.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))} className={input} />
            </label>
            <button type="button" aria-label={`Remove row ${d.label || i + 1}`} onClick={() => set("details", details.filter((_, j) => j !== i))} className="flex size-11 items-center justify-center rounded-control text-sale hover:bg-sale/10">
              <Trash2 className="size-4" aria-hidden />
            </button>
          </div>
        ))}
        <button type="button" onClick={() => set("details", [...details, { label: "", value: "" }])} className={`${btnGhost} w-fit`}>
          <Plus className="size-4" aria-hidden /> Add a detail row
        </button>
      </Section>

      <Section title="Variants" hint={variantMode ? `${p.variants!.length} variants` : "Size, colour…"} open={variantMode}>
        <VariantsEditor
          options={p.options ?? []}
          variants={p.variants ?? []}
          images={p.images}
          basePrice={p.price}
          onChange={(options, variants) => setP((cur) => ({ ...cur, options, variants }))}
        />
      </Section>

      <Section title="SEO & shipping" hint="Google and courier">
        <label className={label}>
          <span>
            SEO description <span className="text-xs font-normal text-muted">Google search snippet · not shown on the store</span>
          </span>
          <textarea rows={2} maxLength={255} value={p.seoDescription ?? ""} onChange={(e) => set("seoDescription", e.target.value)} className={`${input} h-auto py-2`} />
        </label>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className={label}>
            Brand
            <input value={p.brand ?? ""} onChange={(e) => set("brand", e.target.value)} className={input} />
          </label>
          <label className={label}>
            Condition
            <select value={p.condition ?? "new"} onChange={(e) => set("condition", e.target.value as ProductCondition)} className={input}>
              <option value="new">New</option>
              <option value="used">Used</option>
              <option value="refurbished">Refurbished</option>
            </select>
          </label>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <label className={label}>
            Weight (kg)
            <input type="number" min={0} step="0.01" value={p.weightKg ?? ""} onChange={(e) => set("weightKg", num(e.target.value))} className={input} />
          </label>
          {(["l", "w", "h"] as const).map((k) => (
            <label key={k} className={label}>
              {{ l: "Length", w: "Width", h: "Height" }[k]} (cm)
              <input
                type="number"
                min={0}
                step="0.1"
                value={p.dimensionsCm?.[k] ?? ""}
                onChange={(e) => set("dimensionsCm", { ...p.dimensionsCm, [k]: num(e.target.value) })}
                className={input}
              />
            </label>
          ))}
        </div>
      </Section>

      {error && <p role="alert" className="text-sm text-sale">{error}</p>}
      <div className="sticky bottom-0 flex justify-end gap-2 border-t border-line bg-bg py-4">
        <button type="button" onClick={() => onDone(false)} className={btnGhost}>Cancel</button>
        <button type="submit" disabled={busy || uploading} className={btnPrimary}>{busy ? "Saving…" : "Save product"}</button>
      </div>
    </form>
  );
}
