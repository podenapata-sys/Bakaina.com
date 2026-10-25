"use client";

import Image, { type ImageProps } from "next/image";
import { cloudinaryLoader, isCloudinaryUrl } from "@/lib/cloudinary";

/** next/image that lets Cloudinary resize its own photos; everything else uses the default optimizer. */
export default function SmartImage(props: ImageProps) {
  const cloud = typeof props.src === "string" && isCloudinaryUrl(props.src);
  return <Image {...props} loader={cloud ? cloudinaryLoader : props.loader} alt={props.alt} />;
}
