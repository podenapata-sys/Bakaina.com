"use client";

import Link from "next/link";
import { useCatalog } from "@/context/CatalogContext";
import { categoryIcons } from "@/lib/categoryIcons";
import SectionHeading from "./SectionHeading";

export default function CategoryRow() {
  const { categories } = useCatalog();
  return (
    <section id="categories" aria-labelledby="categories-heading" className="mx-auto max-w-7xl px-4 pt-16">
      <SectionHeading id="categories-heading">Shop by Category</SectionHeading>
      <ul className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0">
        {categories.slice(0, 5).map(({ id, name, icon, gradient }) => {
          const Icon = categoryIcons[icon] ?? categoryIcons.gift;
          return (
            <li key={id} className="w-32 shrink-0 snap-start sm:w-auto">
              <Link href={`/shop?category=${id}`} className="group flex flex-col items-center gap-3 rounded-card p-2 text-center">
                <span
                  className={`flex aspect-square w-full items-center justify-center rounded-card shadow-soft ring-2 ring-transparent transition duration-300 group-hover:-translate-y-1 group-hover:shadow-lift group-hover:ring-accent bg-${gradient}`}
                >
                  <Icon className="size-10 text-primary transition group-hover:text-accent-ink sm:size-12" strokeWidth={1.5} aria-hidden />
                </span>
                <span className="text-sm font-semibold text-text transition group-hover:text-accent-ink sm:text-base">
                  {name}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
