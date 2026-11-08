import type { NextConfig } from "next";

/**
 * The site is a static export (plain HTML/JS in `out/`) so it can be hosted on GitHub Pages; all store data
 * loads in the browser from Firebase. GitHub Pages serves it under /Bakaina.com, which the deploy workflow
 * passes in as NEXT_PUBLIC_BASE_PATH (empty for local runs).
 */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: {
    // Static hosting has no image optimizer: Cloudinary resizes product photos, other images are served as-is.
    loader: "custom",
    loaderFile: "./src/lib/imageLoader.ts",
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
