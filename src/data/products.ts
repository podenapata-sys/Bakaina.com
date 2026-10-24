import type { Product, ProductTag } from "@/types";

type Sample = Omit<Product, "images" | "active">;

/** Sample catalogue — used until Firebase is connected, and as seed data. Replace with the client's real products. */
const samples: Sample[] = [
  // Special
  { id: "p1", name: "LED Sunset Projection Lamp", price: 1150, oldPrice: 1600, categoryId: "home-kitchen", description: "Turns any wall into a golden-hour glow. USB powered with a 180° rotating head.", stock: 25, rating: 4.7, reviews: 214, tag: "special", trending: true, gradient: "grad-1" },
  { id: "p2", name: "Mini Portable Neck Fan", price: 890, oldPrice: 1290, categoryId: "gadgets", description: "Hands-free bladeless fan with 3 speeds and a rechargeable battery.", stock: 40, rating: 4.5, reviews: 132, tag: "special", trending: false, gradient: "grad-2" },
  { id: "p3", name: "Magnetic Car Phone Holder", price: 450, categoryId: "phone-accessories", description: "Strong magnetic grip that fits any air vent. One-hand mounting.", stock: 60, rating: 4.4, reviews: 88, tag: "special", trending: false, gradient: "grad-4" },
  { id: "p4", name: "Electric Lint Remover", price: 690, oldPrice: 850, categoryId: "home-kitchen", description: "Removes fuzz and pills from clothes, sofas and blankets in seconds.", stock: 30, rating: 4.3, reviews: 76, tag: "special", trending: false, gradient: "grad-5" },
  // New
  { id: "p5", name: "Wireless Earbuds Pro", price: 1890, oldPrice: 2490, categoryId: "gadgets", description: "Bluetooth 5.3 earbuds with touch controls and a charging case.", stock: 20, rating: 4.6, reviews: 41, tag: "new", trending: true, gradient: "grad-6" },
  { id: "p6", name: "Oversized Graphic T-Shirt", price: 650, categoryId: "fashion", description: "Soft cotton drop-shoulder tee. Sizes M, L, XL.", stock: 50, rating: 4.4, reviews: 33, tag: "new", trending: false, gradient: "grad-3" },
  { id: "p7", name: "Portable Blender Bottle", price: 1450, oldPrice: 1950, categoryId: "home-kitchen", description: "USB rechargeable blender for smoothies and shakes on the go.", stock: 18, rating: 4.3, reviews: 27, tag: "new", trending: false, gradient: "grad-4" },
  { id: "p8", name: "Hair Straightener Brush", price: 1290, categoryId: "beauty-care", description: "Heated brush with temperature control for quick straightening.", stock: 22, rating: 4.5, reviews: 19, tag: "new", trending: false, gradient: "grad-6" },
  // Best sellers
  { id: "p9", name: '10" Ring Light with Stand', price: 990, oldPrice: 1350, categoryId: "gadgets", description: "Dimmable ring light with 3 colour modes and a phone holder.", stock: 35, rating: 4.8, reviews: 402, tag: "bestseller", trending: true, gradient: "grad-5" },
  { id: "p10", name: "Smart Watch Strap Set", price: 550, categoryId: "phone-accessories", description: "Set of 3 silicone straps in trending colours. Fits most smart watches.", stock: 80, rating: 4.6, reviews: 311, tag: "bestseller", trending: true, gradient: "grad-2" },
  { id: "p11", name: "Fast Charging Power Bank 20000mAh", price: 1690, categoryId: "phone-accessories", description: "Dual-port fast charging power bank with an LED display.", stock: 28, rating: 4.7, reviews: 268, tag: "bestseller", trending: false, gradient: "grad-1" },
  { id: "p12", name: "Facial Ice Roller", price: 390, oldPrice: 520, categoryId: "beauty-care", description: "Cooling roller that soothes skin and reduces puffiness.", stock: 45, rating: 4.4, reviews: 187, tag: "bestseller", trending: false, gradient: "grad-3" },
];

export const sampleProducts: Product[] = samples.map((p) => ({ ...p, images: [], active: true }));

export const productTabs: { id: ProductTag; label: string }[] = [
  { id: "special", label: "Special Product" },
  { id: "new", label: "New Product" },
  { id: "bestseller", label: "Best Seller" },
];

export const formatPrice = (bdt: number) => `৳${bdt.toLocaleString("en-IN")}`;
