"use client";

import { useCallback, useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { btnAccent, btnGhost, btnPrimary, card, input, label } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { useCatalog } from "@/context/CatalogContext";
import { categoryIconOptions, categoryIcons } from "@/lib/categoryIcons";
import { applyCategoryList, deleteCategory, fetchCategories, fetchProducts, moveCategoryProducts, saveCategory } from "@/lib/db";
import { slugify } from "@/lib/slugify";
import { finalCategories } from "@/data/categories";
import type { Category, CategoryIcon, Gradient } from "@/types";

const gradients: Gradient[] = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];

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

  const [notice, setNotice] = useState("");
  const [moveTo, setMoveTo] = useState<Record<string, string>>({});

  const used = (id: string) => data.products.filter((p) => p.categoryId === id).length;
  const isFinal = (id: string) => finalCategories.some((f) => f.id === id);
  const missingFinal = finalCategories.filter((f) => !data.categories.some((c) => c.id === f.id));
  const extras = data.categories.filter((c) => !isFinal(c.id));
  const leftovers = extras.filter((c) => used(c.id) > 0);
  const missingSection = finalCategories.some((f) => f.homeTitle && !data.categories.some((c) => c.id === f.id && c.homeTitle));
  const needsSwitch = !loading && (missingFinal.length > 0 || missingSection || extras.some((c) => used(c.id) === 0));

  async function run(task: () => Promise<string>) {
    setBusy(true);
    try {
      setNotice(await task());
      await Promise.all([reload(), refresh()]);
    } catch {
      setNotice("Something went wrong. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  const onSwitch = () =>
    run(async () => {
      const r = await applyCategoryList(finalCategories);
      return `Added ${r.added}, removed ${r.removed} empty categories.${r.kept.length ? " Move the products below to finish." : ""}`;
    });

  const onMove = (c: Category) =>
    run(async () => {
      const to = moveTo[c.id] ?? finalCategories[0].id;
      const n = await moveCategoryProducts(c.id, to);
      return `Moved ${n} products from ${c.name} to ${finalCategories.find((f) => f.id === to)?.name}, and removed ${c.name}.`;
    });

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
      <p className="text-sm text-muted">The first 6 categories (by order) show on the homepage.</p>
      {error && <p className="rounded-control bg-sale/10 p-4 text-sm text-sale">{error}</p>}
      {needsSwitch && (
        <div className={`${card} flex flex-wrap items-center justify-between gap-3`}>
          <p className="text-sm">
            <strong>Use the final {finalCategories.length} categories</strong>{" "}
            <span className="text-muted">
              ({finalCategories.map((f) => f.name).join(", ")}). Adds the missing ones and removes other categories that have no
              products.
            </span>
          </p>
          <button type="button" disabled={busy} onClick={onSwitch} className={btnPrimary}>
            {busy ? "Working…" : "Use final categories"}
          </button>
        </div>
      )}
      {!loading && missingFinal.length === 0 && leftovers.length > 0 && (
        <div className={`${card} flex flex-col gap-3`}>
          <p className="text-sm">
            <strong>Old categories with products.</strong>{" "}
            <span className="text-muted">Choose where their products go; the old category is then removed.</span>
          </p>
          {leftovers.map((c) => (
            <div key={c.id} className="flex flex-wrap items-center gap-2 text-sm">
              <span className="min-w-56 font-medium">
                {c.name} <span className="text-muted">({used(c.id)} products)</span>
              </span>
              <select
                aria-label={`Move ${c.name} products to`}
                value={moveTo[c.id] ?? finalCategories[0].id}
                onChange={(e) => setMoveTo({ ...moveTo, [c.id]: e.target.value })}
                className={`${input} sm:w-64`}
              >
                {finalCategories.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
              <button type="button" disabled={busy} onClick={() => onMove(c)} className={btnGhost}>
                Move &amp; remove
              </button>
            </div>
          ))}
        </div>
      )}
      {notice && <p role="status" className="text-sm font-medium text-primary">{notice}</p>}

      {editing && (
        <form
          className={`${card} flex flex-col gap-4`}
          onSubmit={async (e) => {
            e.preventDefault();
            const id = editing.isNew ? slugify(editing.name) : editing.id;
            if (!id) return setFormError("Enter a name using letters or numbers.");
            if (editing.isNew && data.categories.some((c) => c.id === id)) return setFormError("A category with this name already exists.");
            setBusy(true);
            await saveCategory({
              id,
              name: editing.name.trim(),
              icon: editing.icon,
              gradient: editing.gradient,
              order: editing.order,
              homeOrder: editing.homeOrder,
              homeTitle: editing.homeTitle?.trim() || undefined,
              homeSubtitle: editing.homeSubtitle?.trim() || undefined,
            });
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
          <div className="grid gap-3 sm:grid-cols-2">
            <label className={label}>
              <span>
                Homepage section title <span className="text-xs font-normal text-muted">optional — shows its products on the homepage</span>
              </span>
              <input value={editing.homeTitle ?? ""} placeholder="Viral Hair Care" onChange={(e) => setEditing({ ...editing, homeTitle: e.target.value })} className={input} />
            </label>
            <label className={label}>
              <span>
                Section subtitle <span className="text-xs font-normal text-muted">optional</span>
              </span>
              <input value={editing.homeSubtitle ?? ""} onChange={(e) => setEditing({ ...editing, homeSubtitle: e.target.value })} className={input} />
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
