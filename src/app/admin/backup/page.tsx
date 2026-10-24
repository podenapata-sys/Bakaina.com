"use client";

import { useState } from "react";
import { Download, Upload } from "lucide-react";
import { btnGhost, btnPrimary, card } from "@/components/admin/ui";
import { useCatalog } from "@/context/CatalogContext";
import { type Backup, exportBackup, restoreCatalog } from "@/lib/db";

export default function AdminBackup() {
  const { refresh } = useCatalog();
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);

  async function download() {
    setBusy(true);
    setStatus("");
    try {
      const backup = await exportBackup();
      const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `bakaina-backup-${backup.exportedAt.slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus(`Backup downloaded: ${backup.products.length} products, ${backup.categories.length} categories, ${backup.orders.length} orders.`);
    } catch {
      setStatus("Backup failed. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  async function restore(file: File | undefined) {
    if (!file) return;
    if (!window.confirm("Restore products and categories from this file? Existing items with the same ID are overwritten. Orders are not touched.")) return;
    setBusy(true);
    setStatus("");
    try {
      const backup = JSON.parse(await file.text()) as Backup;
      if (!Array.isArray(backup.products) || !Array.isArray(backup.categories)) throw new Error("bad file");
      const n = await restoreCatalog(backup);
      await refresh();
      setStatus(`Restored ${n} items.`);
    } catch {
      setStatus("That file is not a valid BAKAINA backup.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex max-w-2xl flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">Backup</h1>
      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="font-semibold text-text">Download a backup</h2>
        <p className="text-sm text-muted">
          Saves all products, categories and orders to one file on this device. Download one every week and keep it in
          Google Drive. Product photos stay safe in Firebase Storage.
        </p>
        <button type="button" disabled={busy} onClick={download} className={`${btnPrimary} w-fit`}>
          <Download className="size-4" aria-hidden /> Download backup
        </button>
      </section>
      <section className={`${card} flex flex-col gap-3`}>
        <h2 className="font-semibold text-text">Restore products &amp; categories</h2>
        <p className="text-sm text-muted">Use this only if products were deleted by mistake. Orders are never overwritten.</p>
        <label className={`${btnGhost} w-fit cursor-pointer`}>
          <Upload className="size-4" aria-hidden /> Choose backup file
          <input type="file" accept="application/json,.json" className="sr-only" disabled={busy} onChange={(e) => restore(e.target.files?.[0])} />
        </label>
      </section>
      {status && <p role="status" className="text-sm font-medium text-text">{status}</p>}
    </div>
  );
}
