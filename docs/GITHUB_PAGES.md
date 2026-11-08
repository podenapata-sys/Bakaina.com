# Hosting on GitHub Pages

The site is a static export: `npm run build` writes plain HTML/JS to `out/`, and all store data (products,
categories, orders, admin login) loads in the browser from Firebase. GitHub Pages serves it at
**https://podenapata-sys.github.io/Bakaina.com/**.

Every push to `main` rebuilds and republishes the site automatically
(`.github/workflows/deploy-pages.yml`, about 2 minutes). Products, prices and categories changed in the admin
show at once and never need a rebuild.

## One-time setup
1. GitHub → repository **Settings → Pages → Build and deployment → Source: GitHub Actions**.
2. GitHub → **Actions** → "Deploy to GitHub Pages" → **Run workflow** (or push to `main`). Wait for the green tick.
3. Firebase → **Authentication → Settings → Authorized domains → Add domain**: `podenapata-sys.github.io`.
   Without this the admin login says the address isn't allowed.
4. Optional: once the GitHub site works, delete the Vercel projects so there is only one live address.

## How it differs from a server-hosted site
- Product pages are one page that reads the product from the link: `/product/?id=…`. New products work
  immediately without a rebuild.
- The page title and Google product data (JSON-LD) are set in the browser when the product loads.
- Product photos are resized by Cloudinary (`src/lib/imageLoader.ts`); files in `public/` are served as-is.
- The site lives under `/Bakaina.com`, passed to the build as `NEXT_PUBLIC_BASE_PATH`. With a custom domain,
  set it to empty in the workflow and add the domain in Settings → Pages.

## Check the build locally
```bash
NEXT_PUBLIC_BASE_PATH=/Bakaina.com npm run build   # output in out/
```
