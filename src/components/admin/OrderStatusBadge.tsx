import type { OrderStatus } from "@/types";

export const orderStatuses: { id: OrderStatus; label: string }[] = [
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const styles: Record<OrderStatus, string> = {
  pending: "bg-accent/15 text-accent-ink",
  confirmed: "bg-primary/10 text-primary",
  shipped: "bg-primary/10 text-primary",
  delivered: "bg-surface text-text ring-1 ring-line",
  cancelled: "bg-sale/10 text-sale",
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const label = orderStatuses.find((s) => s.id === status)?.label ?? status;
  return <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[status]}`}>{label}</span>;
}
