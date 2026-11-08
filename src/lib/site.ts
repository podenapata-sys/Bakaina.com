/** Public site address for canonical links, link previews and structured data. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Product page link. Products are added in the admin after the static build, so they share one page. */
export const productHref = (id: string) => `/product/?id=${encodeURIComponent(id)}`;
