# Bakaina.com

Online store for BAKAINA, a trending-products shop in Bangladesh. Built with Next.js (App Router), TypeScript, Tailwind CSS v4, lucide-react and Firebase (Firestore, Auth, Storage).

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Pages

| Route | What it is |
|---|---|
| `/` | Homepage (layout from the client's wireframe) |
| `/shop` | All products, with category filter, search (`?q=`) and sort |
| `/product/[id]` | Product page: photos, price, stock, quantity, related products |
| `/admin` | Dashboard: overview, orders, products (with photo upload), categories, backup |

## Firebase

Without Firebase the site runs on the sample data in `src/data`. To connect it, follow `docs/FIREBASE_SETUP.md`: create the project, publish `firestore.rules` and `storage.rules`, add the env vars from `.env.example` to Vercel, and create the admin user.

All Firestore reads and writes go through `src/lib/db.ts`. The storefront loads the catalogue once through `src/context/CatalogContext.tsx`.

## Homepage layout

The page follows the client's wireframe (`design/wireframe.jpg`), from top to bottom:

| Section | Component |
|---|---|
| Sticky header: logo, search, account / wishlist / cart / menu | `src/components/Header.tsx` |
| Hero: 3-slide slider plus two stacked banners | `src/components/HeroGrid.tsx` |
| Shop by Category (5 tiles) | `src/components/CategoryRow.tsx` |
| Trending Products (2×2 horizontal cards) | `src/components/TrendingProducts.tsx` |
| Full-width promo banner | `src/components/PromoBanner.tsx` |
| Our Products, with Special / New / Best Seller tabs | `src/components/OurProducts.tsx` |
| Footer | `src/components/Footer.tsx` |

Both card layouts come from `ProductCard.tsx` (`variant="horizontal" | "vertical"`). Cart count and wishlist live in `src/context/StoreContext.tsx`; the cart page and checkout come in the next milestone.

## Changing the brand

All colours, radii, shadows and the placeholder gradients are CSS variables at the top of `src/app/globals.css`. Components only use the token utilities (`bg-primary`, `text-muted`, `rounded-card` and so on), so editing that one block re-themes the whole site.

## Sample content

- **Products and categories:** the data in `src/data/products.ts` and `src/data/categories.ts` is sample data. Once Firebase is connected, the client manages real products in `/admin`.
- **Product images:** gradient placeholders until real photos are uploaded in `/admin`.
- **Footer contact details:** the `[PHONE NUMBER]`, `[NUMBER]` and `[EMAIL]` lines are placeholders.

Replace all three with the client's real content.
