import { cloudinaryLoader, isCloudinaryUrl } from "./cloudinary";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

/** next/image loader for the static site: Cloudinary photos are resized by Cloudinary, everything else is served as-is. */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (isCloudinaryUrl(src)) return cloudinaryLoader({ src, width, quality });
  // Local files in /public need the GitHub Pages sub-path; the width keeps each srcset entry distinct.
  if (src.startsWith("/")) return `${basePath}${src}?w=${width}`;
  return src;
}
