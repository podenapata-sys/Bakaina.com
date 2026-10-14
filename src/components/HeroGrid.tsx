"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

type Slide =
  | { kind: "image"; src: string; alt: string }
  | { kind: "text"; bg: string; tone: "light" | "dark"; eyebrow: string; title: string; text: string };

const slides: Slide[] = [
  {
    kind: "image",
    src: "/banner.jpg",
    alt: "BAKAINA — Global products, trusted quality. Fast delivery, trusted shopping, best deals.",
  },
  {
    kind: "text",
    bg: "bg-grad-hero-2",
    tone: "dark",
    eyebrow: "New arrivals",
    title: "Glow starts with the right serum",
    text: "Vitamin C, niacinamide and hyaluronic acid serums for every skin type.",
  },
  {
    kind: "text",
    bg: "bg-grad-hero-3",
    tone: "light",
    eyebrow: "Sun care week",
    title: "Daily SPF 50 for Bangladeshi summers",
    text: "Lightweight, no white cast. Protect your skin every single day.",
  },
];

const sideBanners = [
  { bg: "bg-grad-side-1", title: "Hydration Heroes", text: "Moisturizers for oily & dry skin", cta: "Shop moisturizers" },
  { bg: "bg-grad-side-2", title: "Hair Care Edit", text: "Oils, shampoos and masks", cta: "Shop hair care" },
];

export default function HeroGrid() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const go = useCallback((i: number) => setIndex((i + slides.length) % slides.length), []);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, [paused]);

  const slide = slides[index];

  return (
    <section aria-label="Featured offers" className="mx-auto max-w-7xl px-4 pt-6">
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Main slider */}
        <div
          className="relative min-w-0 overflow-hidden rounded-card bg-surface shadow-soft lg:col-span-2"
          aria-roledescription="carousel"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          onFocus={() => setPaused(true)}
          onBlur={() => setPaused(false)}
        >
          <div
            className="relative aspect-[2000/744] min-h-[220px] w-full lg:aspect-auto lg:h-full lg:min-h-[340px]"
            aria-live="polite"
            aria-label={`Slide ${index + 1} of ${slides.length}`}
          >
            {slide.kind === "image" ? (
              <Link href="#trending" className="block size-full">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  fill
                  fetchPriority="high"
                  sizes="(min-width: 1024px) 66vw, 100vw"
                  className="object-cover"
                />
              </Link>
            ) : (
              <div className={`flex size-full items-center px-14 py-8 sm:px-20 ${slide.bg}`}>
                <div className={`max-w-md ${slide.tone === "dark" ? "text-on-primary" : "text-text"}`}>
                  <p className={`mb-2 text-xs font-semibold tracking-widest uppercase sm:text-sm ${slide.tone === "dark" ? "text-accent" : "text-accent-ink"}`}>
                    {slide.eyebrow}
                  </p>
                  <h2 className="text-2xl leading-tight font-bold sm:text-4xl">{slide.title}</h2>
                  <p className="mt-3 hidden text-sm opacity-90 sm:block sm:text-base">{slide.text}</p>
                  <Link
                    href="#products"
                    className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full bg-accent px-6 text-sm font-semibold text-on-accent transition hover:bg-accent-hover"
                  >
                    Shop Now <ArrowRight className="size-4" aria-hidden />
                  </Link>
                </div>
              </div>
            )}
          </div>

          <button
            type="button"
            aria-label="Previous slide"
            onClick={() => go(index - 1)}
            className="absolute top-1/2 left-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/90 text-primary shadow-soft transition hover:bg-accent hover:text-on-accent"
          >
            <ChevronLeft className="size-5" aria-hidden />
          </button>
          <button
            type="button"
            aria-label="Next slide"
            onClick={() => go(index + 1)}
            className="absolute top-1/2 right-3 flex size-10 -translate-y-1/2 items-center justify-center rounded-full bg-bg/90 text-primary shadow-soft transition hover:bg-accent hover:text-on-accent"
          >
            <ChevronRight className="size-5" aria-hidden />
          </button>
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to slide ${i + 1}`}
                aria-current={i === index}
                onClick={() => go(i)}
                className={`h-2.5 rounded-full transition-all ${i === index ? "w-7 bg-accent" : "w-2.5 bg-bg/80 ring-1 ring-line"}`}
              />
            ))}
          </div>
        </div>

        {/* Stacked side banners */}
        <div className="grid min-w-0 gap-4 sm:grid-cols-2 lg:grid-cols-1">
          {sideBanners.map((b) => (
            <div
              key={b.title}
              className={`flex min-h-[160px] flex-col justify-center rounded-card p-6 shadow-soft ${b.bg}`}
            >
              <h3 className="text-xl font-bold text-primary">{b.title}</h3>
              <p className="mt-1 text-sm text-muted">{b.text}</p>
              <Link
                href="#categories"
                className="mt-4 inline-flex min-h-11 w-fit items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-on-primary transition hover:bg-primary-hover"
              >
                {b.cta} <ArrowRight className="size-4" aria-hidden />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
