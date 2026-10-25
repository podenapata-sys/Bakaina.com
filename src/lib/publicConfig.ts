/**
 * Production config for the live shop. Every value here is public by design: the Firebase web config
 * ships to every browser, and the Cloudinary cloud name and unsigned preset are visible in upload
 * requests. Access is protected by firestore.rules and the preset's limits, not by hiding these.
 * They live in code so a wrong or unlinked Vercel env var can't break login or uploads.
 */
export const publicConfig = {
  firebase: {
    apiKey: "AIzaSyBcjJY5BqU7u8rmkJ3_SvCq2G-ABap9dw4",
    authDomain: "bakaina-com.firebaseapp.com",
    projectId: "bakaina-com",
    storageBucket: "bakaina-com.firebasestorage.app",
    messagingSenderId: "521138376705",
    appId: "1:521138376705:web:b284e876ba904a2e2b3000",
  },
  cloudinary: {
    cloudName: "xg5eldfb",
    uploadPreset: "bakaina_products",
  },
};
