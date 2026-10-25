import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";
import { deleteObject, getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { sampleCategories } from "@/data/categories";
import { sampleProducts } from "@/data/products";
import type { Category, Order, OrderStatus, Product, ProductPrivate } from "@/types";
import { isCloudinaryConfigured, uploadToCloudinary } from "./cloudinary";
import { db, isFirebaseConfigured, storage } from "./firebase";

/*
 * Firestore layout:
 *   products/{id}    Product (without id)
 *   categories/{id}  Category (without id)
 *   orders/{id}      Order (without id)
 *   productPrivate/{id}  ProductPrivate — admin-only (buying price), kept out of the public product
 *   admins/{uid}     { email } — marks a user as an admin (see firestore.rules)
 */

const withId = <T>(id: string, data: object) => ({ ...data, id }) as T;

/** Deep-removes undefined values, which Firestore rejects at any depth. */
function clean(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(clean);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      if (v === undefined) continue;
      out[k] = clean(v);
    }
    return out;
  }
  return value;
}

/** Removes the id (it is the document key) and anything Firestore would reject. */
function stripId<T extends { id: string }>(item: T): Omit<T, "id"> {
  const rest: Record<string, unknown> = { ...item };
  delete rest.id;
  return clean(rest) as Omit<T, "id">;
}

// ---------- Catalogue (public read) ----------

export async function fetchProducts(): Promise<Product[]> {
  if (!isFirebaseConfigured) return sampleProducts;
  const snap = await getDocs(query(collection(db(), "products"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => withId<Product>(d.id, d.data()));
}

export async function fetchProduct(id: string): Promise<Product | null> {
  if (!isFirebaseConfigured) return sampleProducts.find((p) => p.id === id) ?? null;
  const snap = await getDoc(doc(db(), "products", id));
  return snap.exists() ? withId<Product>(snap.id, snap.data()) : null;
}

export async function fetchCategories(): Promise<Category[]> {
  if (!isFirebaseConfigured) return sampleCategories;
  const snap = await getDocs(query(collection(db(), "categories"), orderBy("order")));
  return snap.docs.map((d) => withId<Category>(d.id, d.data()));
}

// ---------- Admin writes ----------

export async function saveProduct(product: Product): Promise<void> {
  const data = { ...stripId(product), createdAt: product.createdAt ?? Date.now() };
  await setDoc(doc(db(), "products", product.id), data);
}

export async function deleteProduct(product: Product): Promise<void> {
  await deleteDoc(doc(db(), "products", product.id));
  await deleteDoc(doc(db(), "productPrivate", product.id));
  // Best-effort cleanup of Firebase Storage photos. Cloudinary photos stay in the
  // Cloudinary Media Library (unsigned uploads cannot delete); remove them there if needed.
  const firebasePhotos = product.images.filter((url) => url.includes("firebasestorage"));
  await Promise.allSettled(firebasePhotos.map((url) => deleteObject(ref(storage(), url))));
}

export async function fetchProductPrivate(id: string): Promise<ProductPrivate> {
  const snap = await getDoc(doc(db(), "productPrivate", id));
  return snap.exists() ? (snap.data() as ProductPrivate) : {};
}

export async function fetchAllProductPrivate(): Promise<Record<string, ProductPrivate>> {
  if (!isFirebaseConfigured) return {};
  const snap = await getDocs(collection(db(), "productPrivate"));
  return Object.fromEntries(snap.docs.map((d) => [d.id, d.data() as ProductPrivate]));
}

export async function saveProductPrivate(id: string, data: ProductPrivate): Promise<void> {
  await setDoc(doc(db(), "productPrivate", id), clean(data) as ProductPrivate);
}

/** Uploads to Cloudinary when configured (free, no billing account), else Firebase Storage. */
export async function uploadProductImage(productId: string, file: File): Promise<string> {
  if (isCloudinaryConfigured) return uploadToCloudinary(file, `bakaina/products/${productId}`);
  const safeName = file.name.replace(/[^\w.-]+/g, "_");
  const fileRef = ref(storage(), `products/${productId}/${Date.now()}-${safeName}`);
  await uploadBytes(fileRef, file, { contentType: file.type });
  return getDownloadURL(fileRef);
}

export async function saveCategory(category: Category): Promise<void> {
  await setDoc(doc(db(), "categories", category.id), stripId(category));
}

export async function deleteCategory(id: string): Promise<void> {
  await deleteDoc(doc(db(), "categories", id));
}

/** Writes the sample catalogue into an empty Firestore so the client starts with something to edit. */
export async function seedSampleData(): Promise<void> {
  const batch = writeBatch(db());
  const now = Date.now();
  sampleCategories.forEach((c) => batch.set(doc(db(), "categories", c.id), stripId(c)));
  sampleProducts.forEach((p, i) => batch.set(doc(db(), "products", p.id), { ...stripId(p), createdAt: now - i }));
  await batch.commit();
}

// ---------- Orders (admin) ----------

export async function fetchOrders(): Promise<Order[]> {
  if (!isFirebaseConfigured) return [];
  const snap = await getDocs(query(collection(db(), "orders"), orderBy("createdAt", "desc")));
  return snap.docs.map((d) => withId<Order>(d.id, d.data()));
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<void> {
  await updateDoc(doc(db(), "orders", id), { status });
}

// ---------- Admin check & backup ----------

export async function isAdmin(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db(), "admins", uid));
  return snap.exists();
}

export interface Backup {
  exportedAt: string;
  products: Product[];
  categories: Category[];
  orders: Order[];
  /** Buying prices etc., keyed by product id. Missing in backups made before it existed. */
  productPrivate?: Record<string, ProductPrivate>;
}

export async function exportBackup(): Promise<Backup> {
  const [products, categories, orders, productPrivate] = await Promise.all([
    fetchProducts(),
    fetchCategories(),
    fetchOrders(),
    fetchAllProductPrivate(),
  ]);
  return { exportedAt: new Date().toISOString(), products, categories, orders, productPrivate };
}

/** Restores products and categories from a backup file. Orders are never overwritten. */
export async function restoreCatalog(backup: Backup): Promise<number> {
  const items = [
    ...backup.categories.map((c) => ({ path: "categories", id: c.id, data: stripId(c) })),
    ...backup.products.map((p) => ({ path: "products", id: p.id, data: stripId(p) })),
    ...Object.entries(backup.productPrivate ?? {}).map(([id, data]) => ({ path: "productPrivate", id, data: clean(data) as object })),
  ];
  // Firestore batches hold at most 500 writes.
  for (let i = 0; i < items.length; i += 450) {
    const batch = writeBatch(db());
    items.slice(i, i + 450).forEach((it) => batch.set(doc(db(), it.path, it.id), it.data));
    await batch.commit();
  }
  return items.length;
}

export const newId = () => doc(collection(db(), "products")).id;
