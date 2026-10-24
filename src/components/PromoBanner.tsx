import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function PromoBanner() {
  return (
    <section aria-label="Promotion" className="bg-grad-promo mt-16">
      <div className="mx-auto flex max-w-7xl flex-col items-start gap-6 px-4 py-14 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-on-primary">
          <p className="text-sm font-semibold tracking-widest text-accent uppercase">Limited time offer</p>
          <h2 className="mt-2 text-3xl leading-tight font-bold sm:text-4xl">Up to 30% Off Trending Deals</h2>
          <p className="mt-2 opacity-90">Gadgets, home finds and accessories. While stocks last.</p>
        </div>
        <Link
          href="/shop"
          className="inline-flex min-h-12 shrink-0 items-center gap-2 rounded-full bg-accent px-7 font-semibold text-on-accent transition hover:bg-accent-hover"
        >
          Shop the Sale <ArrowRight className="size-4" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
