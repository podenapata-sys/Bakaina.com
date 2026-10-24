import type { Category } from "@/types";

/** Sample categories — used until Firebase is connected, and as seed data. */
export const sampleCategories: Category[] = [
  { id: "gadgets", name: "Gadgets", icon: "gadgets", gradient: "grad-2", order: 1 },
  { id: "home-kitchen", name: "Home & Kitchen", icon: "home", gradient: "grad-1", order: 2 },
  { id: "fashion", name: "Fashion", icon: "fashion", gradient: "grad-3", order: 3 },
  { id: "beauty-care", name: "Beauty & Care", icon: "beauty", gradient: "grad-6", order: 4 },
  { id: "phone-accessories", name: "Phone Accessories", icon: "phone", gradient: "grad-4", order: 5 },
];
