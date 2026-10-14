import type { LucideIcon } from "lucide-react";

export type ProductTag = "special" | "new" | "bestseller";

/** Placeholder gradient token, defined in globals.css as --grad-N. */
export type Gradient = "grad-1" | "grad-2" | "grad-3" | "grad-4" | "grad-5" | "grad-6";

export interface Product {
  id: string;
  name: string;
  /** Price in BDT. */
  price: number;
  oldPrice?: number;
  rating: number;
  reviews: number;
  tag: ProductTag;
  trending: boolean;
  gradient: Gradient;
}

export interface Category {
  id: string;
  name: string;
  icon: LucideIcon;
  gradient: Gradient;
}
