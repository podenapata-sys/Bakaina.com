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

/** Homepage sections from the client's launch list, in display order. */
const homeSections: Record<string, { homeTitle: string; homeSubtitle: string }> = {
  haircare: { homeTitle: "Viral Hair Care", homeSubtitle: "Massive demand right now" },
  bodycare: { homeTitle: "Winter Body Care & Lotions", homeSubtitle: "Stay soft all winter" },
  skincare: { homeTitle: "Trending K-Beauty Skincare", homeSubtitle: "Korean favourites everyone is searching for" },
};

export const finalCategories: Category[] = finalCategoryList.map(([name, icon], i) => {
  const id = slugify(name);
  const section = homeSections[id];
  return {
    id,
    name,
    icon,
    gradient: gradients[i % gradients.length],
    order: i + 1,
    ...(section && { ...section, homeOrder: Object.keys(homeSections).indexOf(id) + 1 }),
  };
});

/** Sample categories — used until Firebase is connected, and as seed data. */
export const sampleCategories = finalCategories;
