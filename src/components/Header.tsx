"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Heart, Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { useStore } from "@/context/StoreContext";
import { useCatalog } from "@/context/CatalogContext";

function SearchForm({ id }: { id: string }) {
  const router = useRouter();
  return (
    <form
      role="search"
      className="relative w-full"
      onSubmit={(e) => {
        e.preventDefault();
        const q = new FormData(e.currentTarget).get("q")?.toString().trim() ?? "";
        router.push(q ? `/shop?q=${encodeURIComponent(q)}` : "/shop");
      }}
    >
      <label htmlFor={id} className="sr-only">
        Search products
      </label>
      <input
        id={id}
        name="q"
        type="search"
        placeholder="Search for your favourite products…"
        className="h-12 w-full rounded-full border border-line bg-surface pr-14 pl-5 text-sm text-text outline-none transition placeholder:text-muted focus:border-primary focus:bg-bg"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute top-1 right-1 flex size-10 items-center justify-center rounded-full bg-primary text-on-primary transition hover:bg-primary-hover"
      >
        <Search className="size-[18px]" aria-hidden />
      </button>
    </form>
  );
}

function CartButton({ count }: { count: number }) {
  return (
    <Link
      href="#"
      aria-label={`Cart, ${count} items`}
      className="relative flex size-11 items-center justify-center rounded-full text-text transition hover:bg-surface hover:text-primary"
    >
      <ShoppingBag className="size-6" aria-hidden />
      <span
        aria-hidden
        className="absolute -top-0.5 -right-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] font-semibold text-on-accent"
      >
        {count}
      </span>
    </Link>
  );
}

export default function Header() {
  const { cartCount, wishlist } = useStore();
  const { categories } = useCatalog();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  useEffect(() => {
    if (!drawerOpen) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setDrawerOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [drawerOpen]);

  const iconBtn =
    "flex size-11 items-center justify-center rounded-full text-text transition hover:bg-surface hover:text-primary";

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 lg:gap-8">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="BAKAINA home">
          <Image src="/logo.jpg" alt="" width={40} height={40} className="size-10 object-contain" />
          <span className="text-xl font-bold tracking-wide text-primary sm:text-2xl">BAKAINA</span>
        </Link>

        <div className="hidden min-w-0 flex-1 md:block md:max-w-xl">
          <SearchForm id="search-desktop" />
        </div>

        {/* Desktop / tablet icons */}
        <nav aria-label="Account" className="ml-auto hidden items-center gap-1 md:flex">
          <Link href="#" aria-label="Account" className={iconBtn}>
            <User className="size-6" aria-hidden />
          </Link>
          <Link href="#" aria-label={`Wishlist, ${wishlist.size} items`} className={`${iconBtn} relative`}>
            <Heart className="size-6" aria-hidden />
            {wishlist.size > 0 && (
              <span aria-hidden className="absolute top-1.5 right-1.5 size-2.5 rounded-full bg-sale" />
            )}
          </Link>
          <CartButton count={cartCount} />
          <button type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)} className={iconBtn}>
            <Menu className="size-6" aria-hidden />
          </button>
        </nav>

        {/* Mobile icons */}
        <div className="ml-auto flex items-center md:hidden">
          <button
            type="button"
            aria-label={mobileSearchOpen ? "Close search" : "Open search"}
            aria-expanded={mobileSearchOpen}
            onClick={() => setMobileSearchOpen((o) => !o)}
            className={iconBtn}
          >
            {mobileSearchOpen ? <X className="size-6" aria-hidden /> : <Search className="size-6" aria-hidden />}
          </button>
          <CartButton count={cartCount} />
          <button type="button" aria-label="Open menu" onClick={() => setDrawerOpen(true)} className={iconBtn}>
            <Menu className="size-6" aria-hidden />
          </button>
        </div>
      </div>

      {mobileSearchOpen && (
        <div className="border-t border-line px-4 py-3 md:hidden">
          <SearchForm id="search-mobile" />
        </div>
      )}

      {/* Drawer */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Menu">
          <button
            type="button"
            aria-label="Close menu"
            className="absolute inset-0 bg-text/40"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="absolute top-0 right-0 flex h-full w-[min(320px,85vw)] flex-col gap-6 bg-bg p-6 shadow-lift">
            <div className="flex items-center justify-between">
              <span className="text-lg font-bold text-primary">Menu</span>
              <button
                type="button"
                aria-label="Close menu"
                onClick={() => setDrawerOpen(false)}
                className={iconBtn}
                autoFocus
              >
                <X className="size-6" aria-hidden />
              </button>
            </div>
            <nav aria-label="Categories" className="flex flex-col gap-1">
              <p className="mb-1 text-xs font-semibold tracking-wider text-muted uppercase">Shop by category</p>
              <Link
                href="/shop"
                onClick={() => setDrawerOpen(false)}
                className="rounded-control px-3 py-2.5 font-medium transition hover:bg-surface hover:text-primary"
              >
                All products
              </Link>
              {categories.map((c) => (
                <Link
                  key={c.id}
                  href={`/shop?category=${c.id}`}
                  onClick={() => setDrawerOpen(false)}
                  className="rounded-control px-3 py-2.5 font-medium transition hover:bg-surface hover:text-primary"
                >
                  {c.name}
                </Link>
              ))}
            </nav>
            <nav aria-label="Account links" className="flex flex-col gap-1 border-t border-line pt-4">
              {["My account", "Wishlist", "Track order", "Help & support"].map((label) => (
                <Link
                  key={label}
                  href="#"
                  className="rounded-control px-3 py-2.5 font-medium transition hover:bg-surface hover:text-primary"
                >
                  {label}
                </Link>
              ))}
            </nav>
          </div>
        </div>
      )}
    </header>
  );
}
