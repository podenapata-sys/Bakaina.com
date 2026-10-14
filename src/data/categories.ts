import { Droplets, FlaskConical, Scissors, Sparkles, Sun } from "lucide-react";
import type { Category } from "@/types";

export const categories: Category[] = [
  { id: "cleansers", name: "Cleansers", icon: Droplets, gradient: "grad-2" },
  { id: "moisturizers", name: "Moisturizers", icon: Sparkles, gradient: "grad-3" },
  { id: "serums", name: "Serums", icon: FlaskConical, gradient: "grad-6" },
  { id: "sunscreen", name: "Sunscreen", icon: Sun, gradient: "grad-5" },
  { id: "hair-care", name: "Hair Care", icon: Scissors, gradient: "grad-4" },
];
