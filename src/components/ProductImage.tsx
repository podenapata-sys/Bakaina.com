import Image from "next/image";
import type { Product } from "@/types";

/** The product's first photo, or its gradient placeholder until a photo is uploaded. */
export default function ProductImage({ product, sizes, className = "" }: { product: Product; sizes: string; className?: string }) {
  const src = product.images[0];
  return (
    <div className={`relative overflow-hidden ${src ? "bg-surface" : `bg-${product.gradient}`} ${className}`}>
      {src && <Image src={src} alt={product.name} fill sizes={sizes} className="object-cover" />}
    </div>
  );
}
