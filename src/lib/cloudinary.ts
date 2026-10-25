/**
 * Free photo hosting for product images (no billing account needed, unlike Firebase Storage).
 * Uploads use an *unsigned* upload preset, so set its limits in the Cloudinary console:
 * images only, max 5 MB, folder bakaina/products (see docs/CLOUDINARY_SETUP.md).
 */
const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;

export const isCloudinaryConfigured = Boolean(cloudName && uploadPreset);

const MAX_BYTES = 5 * 1024 * 1024;

export async function uploadToCloudinary(file: File, folder: string): Promise<string> {
  if (!isCloudinaryConfigured) throw new Error("Cloudinary is not configured");
  if (!file.type.startsWith("image/")) throw new Error("Only image files can be uploaded");
  if (file.size > MAX_BYTES) throw new Error("Photo is larger than 5 MB");
  const body = new FormData();
  body.append("file", file);
  body.append("upload_preset", uploadPreset!);
  body.append("folder", folder);
  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, { method: "POST", body });
  if (!res.ok) throw new Error(`Cloudinary upload failed (${res.status})`);
  const json = (await res.json()) as { secure_url?: string };
  if (!json.secure_url) throw new Error("Cloudinary returned no URL");
  return json.secure_url;
}

const UPLOAD_SEGMENT = "/image/upload/";

export const isCloudinaryUrl = (src: string) => src.startsWith("https://res.cloudinary.com/") && src.includes(UPLOAD_SEGMENT);

/** next/image loader: Cloudinary resizes and picks WebP/AVIF itself, so these skip Vercel's optimizer. */
export function cloudinaryLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  const transform = `f_auto,q_${quality ?? "auto"},c_limit,w_${width}`;
  return src.replace(UPLOAD_SEGMENT, `${UPLOAD_SEGMENT}${transform}/`);
}
