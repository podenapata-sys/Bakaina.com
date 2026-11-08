/** Public site address for canonical links, link previews and structured data. */
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

/** Product page link. Products are added in the admin after the static build, so they share one page. */
export const productHref = (id: string) => `/product/?id=${encodeURIComponent(id)}`;

/**
 * Store-wide promises shown on every product page. Keep them true: change the wording here if the shop
 * starts offering free delivery or a replacement guarantee.
 */
export const productPagePromises = {
  trust: ["সারাদেশে ডেলিভারি", "পণ্য হাতে পেয়ে টাকা", "ড্যামেজ হলে সহজ রিটার্ন"] as const,
  delivery: "সারাদেশে ক্যাশ অন ডেলিভারিতে পণ্য পাঠানো হয়। ডেলিভারির সময় ও চার্জ অর্ডার কনফার্ম করার সময় জানিয়ে দেওয়া হয়।",
  returns: "পণ্য হাতে পেয়ে দেখে টাকা দিন। পণ্য ড্যামেজ বা ভুল হলে ডেলিভারিম্যানের সামনেই ফেরত দিতে পারবেন।",
};
