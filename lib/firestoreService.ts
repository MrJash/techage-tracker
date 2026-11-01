import { collection, doc, getDoc, getDocs, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Collection } from '../types';

// In-memory cache of synced receipts (productId -> receipt base64) to prevent redundant re-uploads
const syncedReceiptsCache = new Map<string, string>();

export function clearReceiptSyncCache(): void {
  syncedReceiptsCache.clear();
}

export interface UserPreferences {
  defaultCurrency?: string;
  ageFormat?: 'detailed' | 'compact' | 'short' | 'total-months';
  defaultWarranty?: number;
  defaultOpeningCollection?: string;
  themeMode?: 'system' | 'dark' | 'light';
  tagColors?: Record<string, string>;
}

/**
 * Loads user preferences (e.g. default currency) from Firestore.
 */
export async function loadUserPreferencesFromFirestore(userId: string): Promise<UserPreferences | null> {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    const data = snap.data();
    return (data.preferences as UserPreferences) || (data.defaultCurrency ? { defaultCurrency: data.defaultCurrency } : null);
  } catch (err) {
    console.warn('Failed to load user preferences from Firestore:', err);
    return null;
  }
}

/**
 * Saves user preferences to Firestore.
 */
export async function saveUserPreferencesToFirestore(userId: string, preferences: UserPreferences): Promise<void> {
  try {
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, { preferences, lastSyncedAt: Date.now() }, { merge: true });
  } catch (err) {
    console.warn('Failed to save user preferences to Firestore:', err);
  }
}

/**
 * Loads collections and attaches receipts from the user's receipts subcollection.
 * Subcollection path: users/{userId}/receipts/{productId}
 */
export async function loadCollectionsFromFirestore(userId: string): Promise<Collection[] | null> {
  const docRef = doc(db, 'users', userId);
  const snap = await getDoc(docRef);
  if (!snap.exists()) {
    return null;
  }

  const data = snap.data();
  if (!Array.isArray(data.collections) || data.collections.length === 0) {
    return null;
  }

  const baseCollections = data.collections as Collection[];

  // Fetch receipts from subcollection users/{userId}/receipts
  try {
    const receiptsRef = collection(db, 'users', userId, 'receipts');
    const receiptsSnap = await getDocs(receiptsRef);
    const receiptsMap = new Map<string, string>();

    receiptsSnap.forEach(rDoc => {
      const rData = rDoc.data();
      if (rData && typeof rData.receipt === 'string' && rData.receipt.length > 0) {
        receiptsMap.set(rDoc.id, rData.receipt);
        syncedReceiptsCache.set(rDoc.id, rData.receipt);
      }
    });

    // Merge receipts into products by product id
    return baseCollections.map(col => ({
      ...col,
      products: (col.products || []).map(p => {
        const cloudReceipt = receiptsMap.get(p.id);
        if (cloudReceipt) {
          return { ...p, receipt: cloudReceipt };
        }
        return p;
      }),
    }));
  } catch (receiptErr) {
    console.warn('Failed to load receipts subcollection from Firestore:', receiptErr);
    return baseCollections;
  }
}

/**
 * Deletes a receipt document for a specific product from Firestore.
 */
export async function deleteReceiptFromFirestore(userId: string, productId: string): Promise<void> {
  try {
    const receiptDocRef = doc(db, 'users', userId, 'receipts', productId);
    await deleteDoc(receiptDocRef);
    syncedReceiptsCache.delete(productId);
  } catch (err) {
    console.warn(`Failed to delete receipt from Firestore for product ${productId}:`, err);
  }
}

/**
 * Saves collections to Firestore.
 * - Primary metadata is saved in users/{userId} (receipts omitted to stay under 1MB limit).
 * - Individual receipts are saved in subcollection users/{userId}/receipts/{productId}.
 * - Only new or changed receipts are uploaded (using syncedReceiptsCache).
 * - Deleted receipts are pruned.
 */
export async function saveCollectionsToFirestore(
  userId: string, 
  collections: Collection[],
  preferences?: UserPreferences
): Promise<void> {
  // 1. Sanitize collections metadata for users/{userId} doc
  // Base64 receipts are stripped from the primary document to stay well under 1MB limit.
  const cleanCollections = collections.map(col => {
    const cleanCol: any = {
      id: col.id,
      name: col.name,
      products: (col.products || []).map(p => {
        const cleanProduct: any = {
          id: p.id,
          name: p.name,
          category: p.category,
          purchaseMonth: p.purchaseMonth,
          purchaseYear: p.purchaseYear,
          createdAt: p.createdAt || Date.now(),
        };
        if (p.price !== undefined && p.price !== null && !isNaN(p.price)) {
          cleanProduct.price = p.price;
        }
        if (p.currency) {
          cleanProduct.currency = p.currency;
        }
        if (p.warrantyYears !== undefined && p.warrantyYears !== null && !isNaN(p.warrantyYears)) {
          cleanProduct.warrantyYears = p.warrantyYears;
        }
        if (p.condition) {
          cleanProduct.condition = p.condition;
        }
        if (Array.isArray(p.tags) && p.tags.length > 0) {
          cleanProduct.tags = p.tags;
        }
        // Retain external URL receipts (if any non-base64 receipts are ever used)
        if (p.receipt && !p.receipt.startsWith('data:')) {
          cleanProduct.receipt = p.receipt;
        }
        return cleanProduct;
      }),
    };
    if (col.hasCustomOrder !== undefined) cleanCol.hasCustomOrder = col.hasCustomOrder;
    if (col.sortOrder !== undefined) cleanCol.sortOrder = col.sortOrder;
    return cleanCol;
  });

  // 2. Save primary document
  const docRef = doc(db, 'users', userId);
  const primaryDocData: any = { collections: cleanCollections, lastSyncedAt: Date.now() };
  if (preferences) {
    primaryDocData.preferences = preferences;
  }
  await setDoc(docRef, primaryDocData, { merge: true });

  // 3. Sync subcollection users/{userId}/receipts/{productId}
  const currentProductsWithReceipt = new Map<string, string>();
  for (const col of collections) {
    for (const p of col.products || []) {
      if (p.receipt) {
        currentProductsWithReceipt.set(p.id, p.receipt);
      }
    }
  }

  // Upload new or modified receipts in parallel
  const uploadPromises: Promise<void>[] = [];
  for (const [productId, receipt] of currentProductsWithReceipt.entries()) {
    if (syncedReceiptsCache.get(productId) !== receipt) {
      // 1 MiB Firestore limit safeguard (~1,040,000 chars for 750 KB file)
      if (receipt.length > 1040000) {
        console.warn(`Receipt for product ${productId} exceeds safe Firestore limit (${Math.round(receipt.length / 1024)} KB). Skipped cloud upload.`);
        continue;
      }

      uploadPromises.push((async () => {
        try {
          const receiptDocRef = doc(db, 'users', userId, 'receipts', productId);
          await setDoc(receiptDocRef, {
            productId,
            receipt,
            updatedAt: Date.now(),
          });
          syncedReceiptsCache.set(productId, receipt);
        } catch (err) {
          console.warn(`Failed to save receipt subcollection doc for product ${productId}:`, err);
        }
      })());
    }
  }

  // Prune deleted receipts from Firestore
  const deletePromises: Promise<void>[] = [];
  for (const cachedId of Array.from(syncedReceiptsCache.keys())) {
    if (!currentProductsWithReceipt.has(cachedId)) {
      deletePromises.push((async () => {
        try {
          const receiptDocRef = doc(db, 'users', userId, 'receipts', cachedId);
          await deleteDoc(receiptDocRef);
          syncedReceiptsCache.delete(cachedId);
        } catch (err) {
          console.warn(`Failed to prune deleted receipt for product ${cachedId}:`, err);
        }
      })());
    }
  }

  if (uploadPromises.length > 0 || deletePromises.length > 0) {
    await Promise.allSettled([...uploadPromises, ...deletePromises]);
  }
}
