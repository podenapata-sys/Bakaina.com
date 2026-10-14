import { trendingProducts } from "@/data/products";
import ProductCard from "./ProductCard";
import SectionHeading from "./SectionHeading";

export default function TrendingProducts() {
  return (
    <section id="trending" aria-labelledby="trending-heading" className="mx-auto max-w-7xl px-4 pt-16">
      <SectionHeading id="trending-heading">Trending Products</SectionHeading>
      <div className="grid gap-5 md:grid-cols-2">
        {trendingProducts.map((p) => (
          <ProductCard key={p.id} product={p} variant="horizontal" />
        ))}
      </div>
    </section>
  );
}
