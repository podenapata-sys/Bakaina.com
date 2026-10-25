# Product photos with Cloudinary (free, no card)

Firebase Storage now needs the paid Blaze plan. To avoid that, product photos upload to
**Cloudinary's free plan** (25 credits/month ≈ 25 GB of storage or bandwidth, which is plenty for a shop
catalogue). Products, categories and orders stay in Firestore.

The admin photo upload needs the two Cloudinary variables below.
If they are missing from the build, the upload shows "Photo uploads are not set up".

## 1. Create the account
1. Go to https://cloudinary.com/users/register_free and sign up (no card needed).
2. On the **Dashboard**, copy the **Cloud name** (e.g. `dxyz123ab`).

## 2. Create an unsigned upload preset
1. Click **Settings** (gear icon) → **Upload** → **Upload presets** → **Add upload preset**.
2. Set:
   - **Upload preset name:** `bakaina_products`
   - **Signing mode:** **Unsigned**
   - **Folder:** `bakaina/products`
3. Open **Upload control** (or "Upload Manipulations / Restrictions", depending on the screen) and set:
   - **Allowed formats:** `jpg, jpeg, png, webp`
   - **Max file size:** `5000000` (5 MB)
   - Optional **Incoming transformation:** `c_limit,w_2000` (shrinks huge phone photos on upload)
4. **Save**.

> An unsigned preset lets the site upload without a secret key. The restrictions above stop it
> being used for anything except product-sized images. Only the admin dashboard shows the upload button.

## 3. Add the variables in Vercel
Vercel → project **bakaina-com** → **Settings** → **Environment Variables** → add (choose **Config**, not Secret,
and tick Production, Preview and Development):

| Key | Value |
|---|---|
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | your cloud name |
| `NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET` | `bakaina_products` |

These are baked in at build time, so **redeploy** after adding them (merging a PR redeploys too).

## 4. Check it
Admin → Products → Add product → upload a photo. It should appear, and the image link should start
with `https://res.cloudinary.com/`. The storefront serves it resized and in WebP/AVIF automatically.

## Notes
- Deleting a product does **not** delete its Cloudinary photos (that needs a secret key on a server).
  Clean up old photos now and then in Cloudinary → **Media Library** → folder `bakaina/products`.
- Photos uploaded earlier to Firebase Storage keep working.
