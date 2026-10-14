# Bakaina.com

Homepage for BAKAINA, a skincare and beauty store. Built with Next.js (App Router), TypeScript, Tailwind CSS v4 and lucide-react.

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build
```

## Layout

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

Both card layouts come from `ProductCard.tsx` (`variant="horizontal" | "vertical"`). Cart count and wishlist live in `src/context/StoreContext.tsx`; there is no backend yet.

## Changing the brand

All colours, radii, shadows and the placeholder gradients are CSS variables at the top of `src/app/globals.css`. Components only use the token utilities (`bg-primary`, `text-muted`, `rounded-card` and so on), so editing that one block re-themes the whole site.

## Sample content

- **Products and categories:** the data in `src/data/products.ts` and `src/data/categories.ts` is sample data.
- **Product images:** these are gradient placeholders.
- **Footer contact details:** the `[PHONE NUMBER]`, `[NUMBER]` and `[EMAIL]` lines are placeholders.

Replace all three with the client's real content.
