import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  cacheComponents: true,
  images: {
    // Product photos uploaded from the admin dashboard live in Firebase Storage.
    remotePatterns: [{ protocol: "https", hostname: "firebasestorage.googleapis.com" }],
    // The local Storage emulator serves photos from 127.0.0.1, which the optimizer refuses.
    unoptimized: process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true",
  },
  partialPrefetching: true,
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
