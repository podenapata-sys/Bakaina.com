import { Baby, Dumbbell, Gift, Headphones, Home, type LucideIcon, Shirt, Smartphone, Sparkles } from "lucide-react";
import type { CategoryIcon } from "@/types";

export const categoryIcons: Record<CategoryIcon, LucideIcon> = {
  gadgets: Headphones,
  home: Home,
  fashion: Shirt,
  beauty: Sparkles,
  phone: Smartphone,
  gift: Gift,
  sport: Dumbbell,
  kids: Baby,
};

export const categoryIconOptions = Object.keys(categoryIcons) as CategoryIcon[];
