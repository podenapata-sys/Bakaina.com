export type ProductTag = "special" | "new" | "bestseller";

/** Placeholder gradient token, defined in globals.css as --grad-N. */
export type Gradient = "grad-1" | "grad-2" | "grad-3" | "grad-4" | "grad-5" | "grad-6";

/** Key into the icon map in src/lib/categoryIcons.ts (stored as text in Firestore). */
export type CategoryIcon = "gadgets" | "home" | "fashion" | "beauty" | "phone" | "gift" | "sport" | "kids";

export interface Product {
  id: string;
  name: string;
  /** Price in BDT. */
  price: number;
  oldPrice?: number;
  categoryId: string;
  description: string;
  /** Firebase Storage download URLs; empty means "show the gradient placeholder". */
  images: string[];
  stock: number;
  rating: number;
  reviews: number;
  tag: ProductTag;
  trending: boolean;
  gradient: Gradient;
  /** Hidden products stay in the dashboard but not in the shop. */
  active: boolean;
  createdAt?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: CategoryIcon;
  gradient: Gradient;
  order: number;
}

export type OrderStatus = "pending" | "confirmed" | "shipped" | "delivered" | "cancelled";

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  qty: number;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customer: { name: string; phone: string; address: string; district: string };
  deliveryZone: "inside-dhaka" | "outside-dhaka";
  deliveryFee: number;
  subtotal: number;
  total: number;
  paymentMethod: "cod";
  status: OrderStatus;
  createdAt: number;
}
