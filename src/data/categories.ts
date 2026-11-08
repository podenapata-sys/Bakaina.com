import { slugify } from "@/lib/slugify";
import type { Category, CategoryIcon, Gradient } from "@/types";

/** The store's final categories from the client, in homepage order. Also the seed data for sample products. */
const finalCategoryList: [name: string, icon: CategoryIcon][] = [
  ["Skincare", "droplet"],
  ["Bodycare", "beauty"],
  ["Haircare", "hair"],
  ["Gadget & Mobile Accessories", "phone"],
  ["Home Appliances", "tv"],
  ["Household Essentials", "cleaning"],
];

const gradients: Gradient[] = ["grad-1", "grad-2", "grad-3", "grad-4", "grad-5", "grad-6"];

export const finalCategories: Category[] = finalCategoryList.map(([name, icon], i) => ({
  id: slugify(name),
  name,
  icon,
  gradient: gradients[i % gradients.length],
  order: i + 1,
}));

/** Sample categories — used until Firebase is connected, and as seed data. */
export const sampleCategories = finalCategories;
