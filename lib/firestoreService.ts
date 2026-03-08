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
  const docRef = doc(db, 'users', userId);
  await setDoc(docRef, { collections }, { merge: true });
}
