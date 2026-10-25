"use client";

import Image from "next/image";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { generateVariants, usableOptions, variantLabel } from "@/lib/variants";
import type { ProductOption, ProductVariant } from "@/types";
import { btnGhost, input } from "./ui";

const MAX_OPTIONS = 3;
const MAX_VARIANTS = 100;

interface Props {
  options: ProductOption[];
  variants: ProductVariant[];
  images: string[];
  basePrice: number;
  onChange: (options: ProductOption[], variants: ProductVariant[]) => void;
}

/** Options are typed as "M, L, XL"; the text is kept as typed and parsed into values on every change. */
export default function VariantsEditor({ options, variants, images, basePrice, onChange }: Props) {
  const [texts, setTexts] = useState(() => options.map((o) => ({ name: o.name, values: o.values.join(", ") })));

  function update(next: { name: string; values: string }[]) {
    setTexts(next);
    const parsed = next.map((t) => ({ name: t.name, values: [...new Set(t.values.split(",").map((v) => v.trim()).filter(Boolean))] }));
    const generated = generateVariants(parsed, variants);
    if (generated.length > MAX_VARIANTS) return;
    onChange(parsed, generated);
  }

  const setVariant = (id: string, patch: Partial<ProductVariant>) =>
    onChange(options, variants.map((v) => (v.id === id ? { ...v, ...patch } : v)));

  const usable = usableOptions(options);
  // Judge warnings from what is typed, so they show even when an update was refused.
  const typed = usableOptions(texts.map((t) => ({ name: t.name, values: t.values.split(",") })));
  const duplicateNames = new Set(typed.map((o) => o.name.toLowerCase())).size !== typed.length;
  const combos = typed.reduce((n, o) => n * new Set(o.values).size, typed.length ? 1 : 0);

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-muted">
        Add options like <strong>Size</strong> (M, L, XL) or <strong>Colour</strong> (Black, White). Every combination
        becomes a variant with its own price, stock and photo. Leave empty for a single-version product.
      </p>

      {texts.map((t, i) => (
        <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)_auto] items-end gap-2">
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Option name
            <input
              value={t.name}
              placeholder="Size"
              onChange={(e) => update(texts.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
              className={input}
            />
          </label>
          <label className="flex flex-col gap-1.5 text-sm font-medium">
            Values (comma separated)
            <input
              value={t.values}
              placeholder="M, L, XL"
              onChange={(e) => update(texts.map((x, j) => (j === i ? { ...x, values: e.target.value } : x)))}
              className={input}
            />
          </label>
          <button
            type="button"
            aria-label={`Remove option ${t.name || i + 1}`}
            onClick={() => update(texts.filter((_, j) => j !== i))}
            className="flex size-11 items-center justify-center rounded-control text-sale hover:bg-sale/10"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      ))}

      {texts.length < MAX_OPTIONS && (
        <button type="button" onClick={() => update([...texts, { name: "", values: "" }])} className={`${btnGhost} w-fit`}>
          <Plus className="size-4" aria-hidden /> Add option
        </button>
      )}

      {duplicateNames && <p role="alert" className="text-sm text-sale">Two options have the same name. Give each option a different name.</p>}
      {combos > MAX_VARIANTS && <p role="alert" className="text-sm text-sale">That makes {combos} variants. Keep it to {MAX_VARIANTS} or fewer.</p>}

      {variants.length > 0 && (
        <div className="overflow-x-auto rounded-control ring-1 ring-line">
          <table className="w-full min-w-[520px] text-left text-sm">
            <thead className="bg-surface text-xs tracking-wide text-muted uppercase">
              <tr>
                <th className="px-3 py-2 font-semibold">Variant</th>
                <th className="px-3 py-2 font-semibold">Price (৳)</th>
                <th className="px-3 py-2 font-semibold">Stock</th>
                <th className="px-3 py-2 font-semibold">Photo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {variants.map((v) => {
                const name = variantLabel(v.attrs, usable);
                return (
                  <tr key={v.id}>
                    <td className="px-3 py-2 font-medium">{name}</td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={1}
                        aria-label={`Price for ${name}`}
                        placeholder={String(basePrice || "")}
                        value={v.price ?? ""}
                        onChange={(e) => setVariant(v.id, { price: e.target.value ? Number(e.target.value) : undefined })}
                        className={`${input} w-28`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <input
                        type="number"
                        min={0}
                        aria-label={`Stock for ${name}`}
                        value={v.stock}
                        onChange={(e) => setVariant(v.id, { stock: Math.max(0, Number(e.target.value)) })}
                        className={`${input} w-24`}
                      />
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-2">
                        {v.image && (
                          <span className="relative size-9 shrink-0 overflow-hidden rounded-md ring-1 ring-line">
                            <Image src={v.image} alt="" fill sizes="36px" className="object-cover" />
                          </span>
                        )}
                        <select
                          aria-label={`Photo for ${name}`}
                          value={v.image ?? ""}
                          onChange={(e) => setVariant(v.id, { image: e.target.value || undefined })}
                          className={`${input} w-32`}
                          disabled={images.length === 0}
                        >
                          <option value="">{images.length ? "Main photo" : "Upload photos first"}</option>
                          {images.map((src, i) => (
                            <option key={src} value={src}>Photo {i + 1}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      {variants.length > 0 && (
        <p className="text-xs text-muted">Empty price = the product price. Total stock is the sum of all variants.</p>
      )}
    </div>
  );
}
