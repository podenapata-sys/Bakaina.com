export type ProductTag = "special" | "new" | "bestseller";

/** Placeholder gradient token, defined in globals.css as --grad-N. */
export type Gradient = "grad-1" | "grad-2" | "grad-3" | "grad-4" | "grad-5" | "grad-6";

/** Key into the icon map in src/lib/categoryIcons.ts (stored as text in Firestore). */
export type CategoryIcon =
  | "gadgets" | "home" | "fashion" | "beauty" | "phone" | "gift" | "sport" | "kids"
  | "bag" | "book" | "car" | "cleaning" | "tv" | "glasses" | "gaming" | "garden" | "health"
  | "decor" | "key" | "kitchen" | "perfume" | "droplet" | "pill" | "watch" | "hair";

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
  /** Status: true = Active (in the shop), false = Draft (dashboard only). */
  active: boolean;
  createdAt?: number;

  // ----- Basic extras (all optional, so older products keep working) -----
  /** One or two lines shown under the price on the product page. */
  shortDescription?: string;
  sku?: string;
  warranty?: string;
  /** YouTube link, shown as an embedded video on the product page. */
  videoUrl?: string;
  /** Free-form rows such as Brand / Model / Material. */
  details?: ProductDetail[];

  // ----- Product page extras -----
  /** Second title line in Bangla, under the English name. */
  nameBn?: string;
  /** Tick-mark checklist under the description: a bold label, then the text. */
  features?: ProductFeature[];
  /** "Buy minQty or more, get percent off" on the whole line. */
  bulk?: BulkDiscount;
  /** Questions and answers in the accordion at the bottom of the product page. */
  faqs?: ProductFaq[];

  // ----- SEO & shipping -----
  /** Google search snippet; not shown on the store. */
  seoDescription?: string;
  brand?: string;
  condition?: ProductCondition;
  weightKg?: number;
  dimensionsCm?: { l?: number; w?: number; h?: number };

  // ----- Variants -----
  /** e.g. [{ name: "Size", values: ["M", "L"] }, { name: "Colour", values: ["Black"] }] */
  options?: ProductOption[];
  /** One entry per combination of option values. When present, stock is the sum of variant stock. */
  variants?: ProductVariant[];
}

export type ProductCondition = "new" | "used" | "refurbished";

export interface ProductDetail {
  label: string;
  value: string;
}

export interface ProductFeature {
  label: string;
  text: string;
}

export interface BulkDiscount {
  minQty: number;
  percent: number;
}

export interface ProductFaq {
  q: string;
  a: string;
}

export interface ProductOption {
  name: string;
  values: string[];
}

export interface ProductVariant {
  id: string;
  /** Option name → chosen value, e.g. { Size: "M", Colour: "Black" }. */
  attrs: Record<string, string>;
  /** Overrides the product price when set. */
  price?: number;
  stock: number;
  /** One of the product's image URLs. */
  image?: string;
}

/** Admin-only data kept out of the public products collection (productPrivate/{id}). */
export interface ProductPrivate {
  buyingPrice?: number;
}

export interface Category {
  id: string;
  name: string;
  icon: CategoryIcon;
  gradient: Gradient;
  order: number;
  /** When set, the category gets its own homepage section with this title. */
  homeTitle?: string;
  homeSubtitle?: string;
  /** Order of homepage sections (lower first); falls back to `order`. */
  homeOrder?: number;
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
