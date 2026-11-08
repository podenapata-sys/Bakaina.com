import { slugify } from "@/lib/slugify";
import type { Category, CategoryIcon, Gradient } from "@/types";

/** Sample categories — used until Firebase is connected, and as seed data. */
export const sampleCategories: Category[] = [
  { id: "gadgets", name: "Gadgets", icon: "gadgets", gradient: "grad-2", order: 1 },
  { id: "home-kitchen", name: "Home & Kitchen", icon: "home", gradient: "grad-1", order: 2 },
  { id: "fashion", name: "Fashion", icon: "fashion", gradient: "grad-3", order: 3 },
  { id: "beauty-care", name: "Beauty & Care", icon: "beauty", gradient: "grad-6", order: 4 },
  { id: "phone-accessories", name: "Phone Accessories", icon: "phone", gradient: "grad-4", order: 5 },
];

/** The store's full category list from the client. Added from Admin → Categories; order follows the first 5. */
const storeCategoryList: [name: string, icon: CategoryIcon][] = [
  ["Audio & Headphones", "gadgets"],
  ["Baby Care", "kids"],
  ["Bags & Wallets", "bag"],
  ["Beauty & Personal Care", "beauty"],
  ["Bodycare", "droplet"],
  ["Books", "book"],
  ["Car Accessories", "car"],
  ["Cleaning Essentials", "cleaning"],
  ["Electronics", "tv"],
  ["Eyewear & Accessories", "glasses"],
  ["Fashion & Apparels", "fashion"],
  ["Gadget & Mobile Accessories", "phone"],
  ["Gaming", "gaming"],
  ["Garden & Outdoor", "garden"],
  ["Gym & Fitness", "sport"],
  ["Haircare", "beauty"],
  ["Health & Wellness", "health"],
  ["Home Appliances", "home"],
  ["Home Decor", "decor"],
  ["Household Essentials", "home"],
  ["Keychain", "key"],
  ["Kitchen & Dining", "kitchen"],
  ["Makeup & Cosmetics", "beauty"],
  ["Perfume", "perfume"],
  ["Skincare", "droplet"],
  ["Soap & Fragrance", "perfume"],
  ["Sports & Kids", "sport"],
  ["Supplements", "pill"],
  ["Toys", "gift"],
  ["Watch & Sunglass", "watch"],
];

const gradients: Gradient[] = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];

export const storeCategories: Category[] = storeCategoryList.map(([name, icon], i) => ({
  id: slugify(name),
  name,
  icon,
  gradient: gradients[i % gradients.length],
  order: sampleCategories.length + i + 1,
}));
