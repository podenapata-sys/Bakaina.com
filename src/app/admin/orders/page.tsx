"use client";

import { useState } from "react";
import { ChevronDown, Phone } from "lucide-react";
import OrderStatusBadge, { orderStatuses } from "@/components/admin/OrderStatusBadge";
import { card, input } from "@/components/admin/ui";
import { useAdminData } from "@/components/admin/useAdminData";
import { formatPrice } from "@/data/products";
import { fetchOrders, updateOrderStatus } from "@/lib/db";
import type { Order, OrderStatus } from "@/types";

export default function AdminOrders() {
  const { data: orders, loading, error, reload } = useAdminData(fetchOrders, [] as Order[]);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");
  const [open, setOpen] = useState<string | null>(null);
  const [saving, setSaving] = useState<string | null>(null);

  const visible = filter === "all" ? orders : orders.filter((o) => o.status === filter);
  const count = (s: OrderStatus) => orders.filter((o) => o.status === s).length;

  async function changeStatus(id: string, status: OrderStatus) {
    setSaving(id);
    await updateOrderStatus(id, status);
    await reload();
    setSaving(null);
  }

  const chip = (selected: boolean) =>
    `min-h-10 shrink-0 rounded-full border px-4 text-sm font-semibold transition ${
      selected ? "border-primary bg-primary text-on-primary" : "border-line bg-bg text-text hover:border-primary"
    }`;

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-primary">Orders</h1>
      {error && <p className="rounded-control bg-sale/10 p-4 text-sm text-sale">{error}</p>}

      <div role="group" aria-label="Filter orders" className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
        <button type="button" aria-pressed={filter === "all"} onClick={() => setFilter("all")} className={chip(filter === "all")}>
          All ({orders.length})
        </button>
        {orderStatuses.map((s) => (
          <button key={s.id} type="button" aria-pressed={filter === s.id} onClick={() => setFilter(s.id)} className={chip(filter === s.id)}>
            {s.label} ({count(s.id)})
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-muted">Loading…</p>
      ) : visible.length === 0 ? (
        <div className={card}>
          <p className="text-sm text-muted">
            {orders.length === 0 ? "No orders yet. Orders placed through checkout will appear here." : "No orders with this status."}
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-3">
          {visible.map((o) => {
            const expanded = open === o.id;
            return (
              <li key={o.id} className={card}>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setOpen(expanded ? null : o.id)}
                    className="flex min-h-11 min-w-0 flex-1 items-center gap-3 text-left"
                  >
                    <ChevronDown className={`size-5 shrink-0 text-muted transition ${expanded ? "rotate-180" : ""}`} aria-hidden />
                    <span className="min-w-0">
                      <span className="block truncate font-semibold text-text">{o.customer.name}</span>
                      <span className="block text-xs text-muted">
                        #{o.id.slice(0, 8).toUpperCase()} · {new Date(o.createdAt).toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" })}
                      </span>
                    </span>
                  </button>
                  <span className="font-bold text-text">{formatPrice(o.total)}</span>
                  <OrderStatusBadge status={o.status} />
                  <label className="flex items-center gap-2 text-sm">
                    <span className="sr-only">Change status of order {o.id}</span>
                    <select
                      value={o.status}
                      disabled={saving === o.id}
                      onChange={(e) => changeStatus(o.id, e.target.value as OrderStatus)}
                      className={`${input} w-36`}
                    >
                      {orderStatuses.map((s) => (
                        <option key={s.id} value={s.id}>{s.label}</option>
                      ))}
                    </select>
                  </label>
                </div>

                {expanded && (
                  <div className="mt-4 grid gap-4 border-t border-line pt-4 text-sm md:grid-cols-2">
                    <div className="flex flex-col gap-1">
                      <p className="font-semibold text-text">Customer</p>
                      <a href={`tel:${o.customer.phone}`} className="flex w-fit items-center gap-2 text-primary hover:underline">
                        <Phone className="size-4" aria-hidden /> {o.customer.phone}
                      </a>
                      <p className="text-muted">{o.customer.address}, {o.customer.district}</p>
                      <p className="text-muted">
                        {o.deliveryZone === "inside-dhaka" ? "Inside Dhaka" : "Outside Dhaka"} · Cash on delivery
                      </p>
                    </div>
                    <div>
                      <p className="mb-1 font-semibold text-text">Items</p>
                      <ul className="flex flex-col gap-1">
                        {o.items.map((it) => (
                          <li key={it.productId} className="flex justify-between gap-3">
                            <span className="text-muted">{it.qty} × {it.name}</span>
                            <span>{formatPrice(it.price * it.qty)}</span>
                          </li>
                        ))}
                        <li className="flex justify-between gap-3 text-muted"><span>Delivery</span><span>{formatPrice(o.deliveryFee)}</span></li>
                        <li className="flex justify-between gap-3 border-t border-line pt-1 font-semibold"><span>Total</span><span>{formatPrice(o.total)}</span></li>
                      </ul>
                    </div>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
