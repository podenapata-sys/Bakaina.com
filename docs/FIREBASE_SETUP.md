# Connecting BAKAINA to Firebase

One-time setup, about 20 minutes. Do it in the client's Google account so they own the data.

## 1. Create the project
1. Go to https://console.firebase.google.com → **Add project** → name it `bakaina`. Google Analytics is optional.
2. **Build → Firestore Database → Create database.** Choose **production mode** and a location near Bangladesh, such as `asia-south1` (Mumbai). The location cannot be changed later.
3. **Build → Authentication → Get started → Email/Password → Enable.**
4. **Build → Storage → Get started**, same location. New Firebase projects need the **Blaze (pay-as-you-go)** plan to use Storage. A small store stays inside the free quota, but set a budget alert (for example $1) in Google Cloud Billing.

## 2. Publish the security rules
- **Firestore → Rules:** paste the contents of `firestore.rules` and click **Publish**.
- **Storage → Rules:** paste the contents of `storage.rules`, replace `ADMIN_EMAIL_HERE` with the admin's email (the one you create in step 4), and click **Publish**. To allow several admins, list them: `['a@example.com', 'b@example.com']`.

(Or with the Firebase CLI: `firebase deploy --only firestore:rules,storage`.)

## 3. Connect the website
1. **Project settings (gear icon) → Your apps → Web (`</>`)** → register an app called `bakaina-web`.
2. Copy the six config values into Vercel → Project → **Settings → Environment Variables**, using the names in `.env.example`.
3. **Deployments → … → Redeploy**, with **Use existing Build Cache** unticked.

Things that tripped us up the first time:
- **Vercel bakes `NEXT_PUBLIC_*` values into the site at build time.** Changing a variable does nothing until you redeploy.
- **Paste values with no quotes and no spaces**: `AIza...`, not `"AIza..."`.
- **Shared (team) variables** only apply if they are linked to the `bakaina-com` project. Check that they appear under the project's own **Settings → Environment Variables**.
- **If the admin login says "The Firebase API key is wrong":** open DevTools → Network, sign in, and compare the `key=` in the `accounts:signInWithPassword` request with the key in Firebase → Project settings. If they match, check Google Cloud → APIs & Services → Credentials → the browser key's application and API restrictions.

For local development, copy `.env.example` to `.env.local` and fill in the same values.

## 4. Create the admin login
1. **Authentication → Users → Add user**, with the client's email and a strong password.
2. Copy that user's **User UID**.
3. **Firestore → Start collection** `admins` → Document ID = the UID → add a field `email` (string) = the email → **Save**.

Only users listed in `admins` can open `/admin`, edit products or see orders. Only emails listed in `storage.rules` can upload photos.

4. **Authentication → Settings → User actions:** untick **Enable create (sign-up)**, so nobody else can create accounts. Admins are added by hand in the console.

## 5. First login
Open `https://<your-site>/admin`, sign in, and click **Load sample products** on the Overview page. Then edit or replace the samples with the real products and photos.

## Testing locally with the emulators
`firebase emulators:start --project demo-bakaina` runs Auth, Firestore and Storage on your machine with the same rules. Put `NEXT_PUBLIC_FIREBASE_EMULATORS=true` plus any values for the six config variables in `.env.local`, then `npm run dev`.

## Backups
- **Admin → Backup → Download backup** saves products, categories and orders to a JSON file. Do this weekly and keep the files in Google Drive.
- On the Blaze plan you can also turn on automatic daily backups: Google Cloud console → Firestore → **Disaster recovery → Backups → Create schedule**.
