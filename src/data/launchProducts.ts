import { slugify } from "@/lib/slugify";
import type { Gradient, Product } from "@/types";

/**
 * The client's launch list, added from Admin → Products. Published straight away at the client's request:
 * price 0 and stock 0 (so they show "Sold out" and can't be ordered) until the owner adds name, price, stock
 * and photos. Names are as sent (some are cut short).
 */
const launchList: [categoryId: string, name: string][] = [
  ["haircare", "Karseell Hair Mask Jar Maca Essence Repair"],
  ["haircare", "Shiseido Fino Premium Touch Hair Mask"],
  ["haircare", "Shiseido Tsubaki Premium Repair Hair Mask"],
  ["bodycare", "Vaseline Gluta-Hya Overnight Radiance Repair Lotion"],
  ["bodycare", "Vaseline Gluta-Hya PDRN Serum Burst Lotion"],
  ["bodycare", "Vaseline Gluta-Hya Smoothing Perfector Lotion"],
  ["bodycare", "Vaseline Gluta-Hya Pro-Age Restore Serum Lotion"],
  ["skincare", "Cosrx Advanced Snail Mucin Gel Cleanser"],
  ["skincare", "Cosrx Hyaluronic Acid Hydra Power Essence"],
  ["skincare", "Anua Niacinamide 10% + TXA 4% Dark Spot Serum"],
  ["skincare", "Anua Rice 70 Glow Milky Toner 40ml"],
  ["skincare", "Skin1004 Madagascar Centella Sunscreen"],
  ["skincare", "Numbuzin No.5 Vitamin Boosting Essential Toner"],
  ["skincare", "Medicube PDRN Pink Collagen Capsule Cream"],
];

const gradients: Gradient[] = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];

export const launchProducts: Product[] = launchList.map(([categoryId, name], i) => ({
  id: slugify(name),
  name,
  price: 0,
  categoryId,
  description: "",
  images: [],
  stock: 0,
  rating: 0,
  reviews: 0,
  tag: "new",
  trending: false,
  gradient: gradients[i % gradients.length],
  active: true,
  createdAt: Date.UTC(2026, 10, 8) - i,
}));
