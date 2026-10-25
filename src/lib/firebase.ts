import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import { type Firestore, connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { type FirebaseStorage, connectStorageEmulator, getStorage } from "firebase/storage";
import { publicConfig } from "./publicConfig";

/** Local development and tests: `firebase emulators:start` plus NEXT_PUBLIC_FIREBASE_EMULATORS=true. */
const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";

/**
 * The live shop always uses the production config in publicConfig.ts. The NEXT_PUBLIC_FIREBASE_* env vars
 * only apply with the emulators (demo project), so a bad Vercel value can't override the real one.
 */
export const firebaseConfig = useEmulators
  ? {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    }
  : publicConfig.firebase;

export const isFirebaseConfigured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

let app: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let authInstance: Auth | undefined;
let storageInstance: FirebaseStorage | undefined;

function firebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
  app ??= getApps()[0] ?? initializeApp(firebaseConfig);
  return app;
}

export function db(): Firestore {
  if (!firestore) {
    firestore = getFirestore(firebaseApp());
    if (useEmulators) connectFirestoreEmulator(firestore, "127.0.0.1", 8080);
  }
  return firestore;
}

export function auth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(firebaseApp());
    if (useEmulators) connectAuthEmulator(authInstance, "http://127.0.0.1:9099", { disableWarnings: true });
  }
  return authInstance;
}

export function storage(): FirebaseStorage {
  if (!storageInstance) {
    storageInstance = getStorage(firebaseApp());
    if (useEmulators) connectStorageEmulator(storageInstance, "127.0.0.1", 9199);
  }
  return storageInstance;
}
