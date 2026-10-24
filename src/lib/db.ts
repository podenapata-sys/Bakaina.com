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
import type { Category, Order, OrderStatus, Product } from "@/types";
import { db, isFirebaseConfigured, storage } from "./firebase";

/*
 * Firestore layout:
 *   products/{id}    Product (without id)
 *   categories/{id}  Category (without id)
 *   orders/{id}      Order (without id)
 *   admins/{uid}     { email } — marks a user as an admin (see firestore.rules)
 */

const withId = <T>(id: string, data: object) => ({ ...data, id }) as T;

/** Removes the id (it is the document key) and undefined fields, which Firestore rejects. */
function stripId<T extends { id: string }>(item: T): Omit<T, "id"> {
  const rest: Record<string, unknown> = { ...item };
  delete rest.id;
  for (const key of Object.keys(rest)) if (rest[key] === undefined) delete rest[key];
  return rest as Omit<T, "id">;
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
  // Best-effort image cleanup; a missing file must not block the delete.
  await Promise.allSettled(product.images.map((url) => deleteObject(ref(storage(), url))));
}

export async function uploadProductImage(productId: string, file: File): Promise<string> {
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
}

export async function exportBackup(): Promise<Backup> {
  const [products, categories, orders] = await Promise.all([fetchProducts(), fetchCategories(), fetchOrders()]);
  return { exportedAt: new Date().toISOString(), products, categories, orders };
}

/** Restores products and categories from a backup file. Orders are never overwritten. */
export async function restoreCatalog(backup: Backup): Promise<number> {
  const items = [
    ...backup.categories.map((c) => ({ path: "categories", id: c.id, data: stripId(c) })),
    ...backup.products.map((p) => ({ path: "products", id: p.id, data: stripId(p) })),
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
