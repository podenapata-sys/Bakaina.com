import { type FirebaseApp, getApps, initializeApp } from "firebase/app";
import { type Auth, connectAuthEmulator, getAuth } from "firebase/auth";
import { type Firestore, connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { type FirebaseStorage, connectStorageEmulator, getStorage } from "firebase/storage";

/**
 * Firebase web config comes from NEXT_PUBLIC_FIREBASE_* env vars (see .env.example).
 * These values are public by design; access is controlled by firestore.rules / storage.rules.
 */
const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

/** False until the env vars are set — the site then runs on the sample data in src/data. */
export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId);

/** Local development and tests: `firebase emulators:start` plus NEXT_PUBLIC_FIREBASE_EMULATORS=true. */
const useEmulators = process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true";

let app: FirebaseApp | undefined;
let firestore: Firestore | undefined;
let authInstance: Auth | undefined;
let storageInstance: FirebaseStorage | undefined;

function firebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) throw new Error("Firebase is not configured. Set NEXT_PUBLIC_FIREBASE_* env vars.");
  app ??= getApps()[0] ?? initializeApp(config);
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
