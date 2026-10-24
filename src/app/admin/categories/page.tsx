"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { btnAccent, btnGhost, btnPrimary, card, input, label } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { useCatalog } from "@/context/CatalogContext";
import { categoryIconOptions, categoryIcons } from "@/lib/categoryIcons";
import { deleteCategory, fetchCategories, fetchProducts, saveCategory } from "@/lib/db";
import type { Category, CategoryIcon, Gradient } from "@/types";

const gradients: Gradient[] = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];
const slugify = (s: string) => s.toLowerCase().trim().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

export default function AdminCategories() {
  const load = useCallback(async () => {
    const [categories, products] = await Promise.all([fetchCategories(), fetchProducts()]);
    return { categories, products };
  }, []);
  const { data, loading, error, reload } = useAdminData(load, { categories: [], products: [] });
  const { refresh } = useCatalog();
  const [editing, setEditing] = useState<(Category & { isNew: boolean }) | null>(null);
  const [busy, setBusy] = useState(false);
  const [formError, setFormError] = useState("");

  const used = (id: string) => data.products.filter((p) => p.categoryId === id).length;

  async function onDelete(c: Category) {
    const n = used(c.id);
    if (n > 0) return window.alert(`“${c.name}” still has ${n} product(s). Move them to another category first.`);
    if (!window.confirm(`Delete category “${c.name}”?`)) return;
    await deleteCategory(c.id);
    await Promise.all([reload(), refresh()]);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold text-primary">Categories</h1>
        <button
          type="button"
          onClick={() => {
            setFormError("");
            setEditing({ id: "", name: "", icon: "gift", gradient: "grad-2", order: data.categories.length + 1, isNew: true });
          }}
          className={btnAccent}
        >
          <Plus className="size-4" aria-hidden /> Add category
        </button>
      </div>
      <p className="text-sm text-muted">The first 5 categories (by order) show on the homepage.</p>
      {error && <p className="rounded-control bg-sale/10 p-4 text-sm text-sale">{error}</p>}

      {editing && (
        <form
          className={`${card} flex flex-col gap-4`}
          onSubmit={async (e) => {
            e.preventDefault();
            const id = editing.isNew ? slugify(editing.name) : editing.id;
            if (!id) return setFormError("Enter a name using letters or numbers.");
            if (editing.isNew && data.categories.some((c) => c.id === id)) return setFormError("A category with this name already exists.");
            setBusy(true);
            await saveCategory({ id, name: editing.name.trim(), icon: editing.icon, gradient: editing.gradient, order: editing.order });
            await Promise.all([reload(), refresh()]);
            setBusy(false);
            setEditing(null);
          }}
        >
          <h2 className="font-semibold text-text">{editing.isNew ? "New category" : `Edit ${editing.name}`}</h2>
          <div className="grid gap-3 sm:grid-cols-4">
            <label className={`${label} sm:col-span-2`}>
              Name
              <input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} className={input} />
            </label>
            <label className={label}>
              Icon
              <select value={editing.icon} onChange={(e) => setEditing({ ...editing, icon: e.target.value as CategoryIcon })} className={input}>
                {categoryIconOptions.map((i) => (
                  <option key={i} value={i}>{i}</option>
                ))}
              </select>
            </label>
            <label className={label}>
              Order
              <input type="number" min={1} value={editing.order} onChange={(e) => setEditing({ ...editing, order: Number(e.target.value) })} className={input} />
            </label>
          </div>
          <fieldset>
            <legend className="mb-1.5 text-sm font-medium text-text">Tile colour</legend>
            <div className="flex gap-2">
              {gradients.map((g) => (
                <button
                  key={g}
                  type="button"
                  aria-label={`Colour ${g}`}
                  aria-pressed={editing.gradient === g}
                  onClick={() => setEditing({ ...editing, gradient: g })}
                  className={`size-10 rounded-control bg-${g} ring-2 ring-offset-2 ${editing.gradient === g ? "ring-primary" : "ring-transparent"}`}
                />
              ))}
            </div>
          </fieldset>
          {formError && <p role="alert" className="text-sm text-sale">{formError}</p>}
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setEditing(null)} className={btnGhost}>Cancel</button>
            <button type="submit" disabled={busy} className={btnPrimary}>{busy ? "Saving…" : "Save category"}</button>
          </div>
        </form>
      )}

      <div className={card}>
        {loading ? (
          <p className="text-sm text-muted">Loading…</p>
        ) : data.categories.length === 0 ? (
          <p className="text-sm text-muted">No categories yet.</p>
        ) : (
          <ul className="divide-y divide-line">
            {data.categories.map((c) => {
              const Icon = categoryIcons[c.icon] ?? categoryIcons.gift;
              return (
                <li key={c.id} className="flex items-center gap-3 py-3">
                  <span className={`flex size-11 shrink-0 items-center justify-center rounded-control bg-${c.gradient}`}>
                    <Icon className="size-5 text-primary" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-medium text-text">{c.name}</span>
                    <span className="text-xs text-muted">Order {c.order} · {used(c.id)} products</span>
                  </span>
                  <button type="button" aria-label={`Edit ${c.name}`} onClick={() => { setFormError(""); setEditing({ ...c, isNew: false }); }} className="flex size-10 items-center justify-center rounded-control text-primary hover:bg-surface">
                    <Pencil className="size-4" aria-hidden />
                  </button>
                  <button type="button" aria-label={`Delete ${c.name}`} onClick={() => onDelete(c)} className="flex size-10 items-center justify-center rounded-control text-sale hover:bg-sale/10">
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
