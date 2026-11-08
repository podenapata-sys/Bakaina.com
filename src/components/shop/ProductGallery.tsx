"use client";

import Image from "@/components/SmartImage";
import { useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductImage from "@/components/ProductImage";
import type { Product } from "@/types";

interface Props {
  product: Product;
  /** Index of the photo in view; the parent changes it when a variant with its own photo is picked. */
  photo: number;
  onPhoto: (index: number) => void;
  /** Small pill in the top-left corner, e.g. "15% ছাড়". */
  badge?: string;
}

/** Swipeable square photos (CSS scroll-snap) with arrows and thumbnails, as in the product page kit. */
export default function ProductGallery({ product, photo, onPhoto, badge }: Props) {
  const track = useRef<HTMLDivElement>(null);
  const images = product.images;
  const many = images.length > 1;

  // Bring the chosen photo into view when it changes from outside (thumbnail, arrow, variant).
  useEffect(() => {
    const el = track.current;
    if (!el || Math.round(el.scrollLeft / Math.max(1, el.clientWidth)) === photo) return;
    const smooth = !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: el.clientWidth * photo, behavior: smooth ? "smooth" : "auto" });
  }, [photo]);

  const go = (i: number) => onPhoto((i + images.length) % images.length);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="relative">
        {badge && (
          <span className="absolute top-3.5 left-3.5 z-10 rounded-full bg-primary px-3 py-1 text-[13px] font-bold text-on-primary">{badge}</span>
        )}
        {images.length > 0 ? (
          <div
            ref={track}
            tabIndex={0}
            aria-label="Product photos"
            onScroll={(e) => {
              const el = e.currentTarget;
              const i = Math.round(el.scrollLeft / Math.max(1, el.clientWidth));
              if (i !== photo) onPhoto(i);
            }}
            className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto rounded-[18px] bg-surface"
          >
            {images.map((src, i) => (
              <div key={src} className="relative aspect-square w-full shrink-0 snap-start">
                <Image
                  src={src}
                  alt={i === 0 ? product.name : `${product.name}, photo ${i + 1}`}
                  fill
                  sizes="(min-width: 1024px) 50vw, 100vw"
                  className="object-cover"
                  {...(i === 0 ? { fetchPriority: "high" as const } : { loading: "lazy" as const })}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="aspect-square overflow-hidden rounded-[18px]">
            <ProductImage product={product} sizes="50vw" className="size-full" />
          </div>
        )}
        {many && (
          <>
            <button type="button" aria-label="Previous photo" onClick={() => go(photo - 1)} className="absolute top-1/2 left-2.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg text-text shadow-soft">
              <ChevronLeft className="size-5" aria-hidden />
            </button>
            <button type="button" aria-label="Next photo" onClick={() => go(photo + 1)} className="absolute top-1/2 right-2.5 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg text-text shadow-soft">
              <ChevronRight className="size-5" aria-hidden />
            </button>
          </>
        )}
      </div>
      {many && (
        <div className="grid grid-cols-4 gap-2.5 sm:grid-cols-5">
          {images.map((src, i) => (
            <button
              key={src}
              type="button"
              aria-label={`Show photo ${i + 1}`}
              aria-pressed={i === photo}
              onClick={() => onPhoto(i)}
              className={`relative h-14 overflow-hidden rounded-xl border-[1.5px] bg-surface sm:h-16 ${i === photo ? "border-text" : "border-transparent"}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
