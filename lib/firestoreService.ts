import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Collection } from '../types';

export async function loadCollectionsFromFirestore(userId: string): Promise<Collection[] | null> {
  const docRef = doc(db, 'users', userId);
  const snap = await getDoc(docRef);
  if (snap.exists()) {
    const data = snap.data();
    if (Array.isArray(data.collections) && data.collections.length > 0) {
      return data.collections as Collection[];
    }
  }
  return null;
}

export async function saveCollectionsToFirestore(userId: string, collections: Collection[]): Promise<void> {
  // Strip base64 receipt data before saving to Firestore to stay under 1MB doc limit.
  // Receipts are preserved in localStorage.
  const cleanCollections = collections.map(col => ({
    ...col,
    products: col.products.map(p => {
      if (p.receipt && p.receipt.startsWith('data:')) {
        const { receipt, ...rest } = p;
        return rest;
      }
      return p;
    }),
  }));
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { collections: cleanCollections }, { merge: true });
}
