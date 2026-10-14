import type { Product, ProductTag } from "@/types";

/** Sample catalogue — replace with the client's real products. */
export const products: Product[] = [
  // Special
  { id: "p1", name: "Gentle Foaming Cleanser 150ml", price: 850, oldPrice: 1100, rating: 4.6, reviews: 128, tag: "special", trending: true, gradient: "grad-2" },
  { id: "p2", name: "Vitamin C Brightening Serum 30ml", price: 1450, oldPrice: 1800, rating: 4.8, reviews: 214, tag: "special", trending: false, gradient: "grad-5" },
  { id: "p3", name: "Rose Hydrating Toner 200ml", price: 690, rating: 4.4, reviews: 76, tag: "special", trending: false, gradient: "grad-3" },
  { id: "p4", name: "Clay Detox Face Mask 100g", price: 780, oldPrice: 950, rating: 4.5, reviews: 91, tag: "special", trending: false, gradient: "grad-4" },
  // New
  { id: "p5", name: "Niacinamide 10% Serum 30ml", price: 1250, rating: 4.7, reviews: 42, tag: "new", trending: true, gradient: "grad-6" },
  { id: "p6", name: "Ceramide Barrier Cream 50ml", price: 1350, rating: 4.6, reviews: 35, tag: "new", trending: false, gradient: "grad-1" },
  { id: "p7", name: "Argan Repair Hair Oil 100ml", price: 990, rating: 4.3, reviews: 28, tag: "new", trending: false, gradient: "grad-4" },
  { id: "p8", name: "Lip Sleeping Mask 20g", price: 590, rating: 4.5, reviews: 19, tag: "new", trending: false, gradient: "grad-3" },
  // Best sellers
  { id: "p9", name: "Daily Sunscreen SPF 50 PA++++", price: 1150, oldPrice: 1400, rating: 4.9, reviews: 402, tag: "bestseller", trending: true, gradient: "grad-5" },
  { id: "p10", name: "Oil-Free Gel Moisturizer 75ml", price: 950, rating: 4.7, reviews: 311, tag: "bestseller", trending: true, gradient: "grad-2" },
  { id: "p11", name: "Hyaluronic Acid Serum 30ml", price: 1190, rating: 4.8, reviews: 268, tag: "bestseller", trending: false, gradient: "grad-6" },
  { id: "p12", name: "Anti-Dandruff Shampoo 250ml", price: 720, oldPrice: 850, rating: 4.4, reviews: 187, tag: "bestseller", trending: false, gradient: "grad-1" },
];

export const trendingProducts = products.filter((p) => p.trending);

export const productTabs: { id: ProductTag; label: string }[] = [
  { id: "special", label: "Special Product" },
  { id: "new", label: "New Product" },
  { id: "bestseller", label: "Best Seller" },
];

export const formatPrice = (bdt: number) => `৳${bdt.toLocaleString("en-IN")}`;
