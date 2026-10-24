"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { AlertTriangle, Package, ShoppingBag, Wallet } from "lucide-react";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import { btnAccent, card } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { useCatalog } from "@/context/CatalogContext";
import { formatPrice } from "@/data/products";
import { fetchOrders, fetchProducts, seedSampleData } from "@/lib/db";

const startOfToday = () => new Date().setHours(0, 0, 0, 0);

export default function AdminOverview() {
  const load = useCallback(async () => {
    const [products, orders] = await Promise.all([fetchProducts(), fetchOrders()]);
    return { products, orders };
  }, []);
  const { data, loading, error, reload } = useAdminData(load, { products: [], orders: [] });
  const { refresh } = useCatalog();
  const [seeding, setSeeding] = useState(false);

  const { products, orders } = data;
  const live = orders.filter((o) => o.status !== "cancelled");
  const today = live.filter((o) => o.createdAt >= startOfToday());
  const pending = orders.filter((o) => o.status === "pending");
  const lowStock = products.filter((p) => p.active && p.stock <= 5);
  const sales = live.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.total, 0);

  const stats = [
    { label: "Orders today", value: today.length, icon: ShoppingBag },
    { label: "Pending orders", value: pending.length, icon: AlertTriangle },
    { label: "Delivered sales", value: formatPrice(sales), icon: Wallet },
    { label: "Products", value: products.length, icon: Package },
  ];

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">Overview</h1>
      {error && <p className="rounded-control bg-sale/10 p-4 text-sm text-sale">{error}</p>}

      {!loading && products.length === 0 && (
        <div className={`${card} flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between`}>
          <div>
            <p className="font-semibold text-text">Your store has no products yet</p>
            <p className="text-sm text-muted">Load the 12 sample products and 5 categories, then edit them to your real items.</p>
          </div>
          <button
            type="button"
            disabled={seeding}
            className={btnAccent}
            onClick={async () => {
              setSeeding(true);
              await seedSampleData();
              await Promise.all([reload(), refresh()]);
              setSeeding(false);
            }}
          >
            {seeding ? "Loading…" : "Load sample products"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className={card}>
            <Icon className="size-5 text-accent-ink" aria-hidden />
            <p className="mt-3 text-2xl font-bold text-text">{loading ? "…" : value}</p>
            <p className="text-sm text-muted">{label}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <section className={`${card} xl:col-span-2`} aria-labelledby="recent-orders">
          <div className="mb-4 flex items-center justify-between">
            <h2 id="recent-orders" className="font-semibold text-text">Recent orders</h2>
            <Link href="/admin/orders" className="text-sm font-semibold text-primary hover:underline">View all</Link>
          </div>
          {orders.length === 0 ? (
            <p className="text-sm text-muted">No orders yet. They appear here once checkout goes live.</p>
          ) : (
            <ul className="divide-y divide-line">
              {orders.slice(0, 6).map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm">
                  <span className="font-medium text-text">{o.customer.name}</span>
                  <span className="text-muted">{new Date(o.createdAt).toLocaleDateString("en-GB")}</span>
                  <span className="font-semibold">{formatPrice(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className={card} aria-labelledby="low-stock">
          <h2 id="low-stock" className="mb-4 font-semibold text-text">Low stock (5 or less)</h2>
          {lowStock.length === 0 ? (
            <p className="text-sm text-muted">All products are well stocked.</p>
          ) : (
            <ul className="flex flex-col gap-2 text-sm">
              {lowStock.map((p) => (
                <li key={p.id} className="flex justify-between gap-2">
                  <span className="truncate">{p.name}</span>
                  <span className={`font-semibold ${p.stock === 0 ? "text-sale" : "text-accent-ink"}`}>{p.stock}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
