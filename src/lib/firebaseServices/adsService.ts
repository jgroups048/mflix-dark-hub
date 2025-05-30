import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  Timestamp,
} from 'firebase/firestore';

export type AdType = 'preroll' | 'midroll' | 'banner'; // Added banner as an example

export interface Ad {
  id?: string;
  title: string;
  code: string; // HTML/JS code snippet
  intervalMinutes?: number; // e.g., show every 10 minutes, optional
  type: AdType;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const adsCollection = collection(db, 'ads');

// Add a new ad
export const addAd = async (adData: Omit<Ad, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(adsCollection, {
      ...adData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding ad: ", error);
    throw new Error('Failed to add ad');
  }
};

// Fetch all ads
export const fetchAds = async (): Promise<Ad[]> => {
  try {
    const querySnapshot = await getDocs(adsCollection);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Ad));
  } catch (error) {
    console.error("Error fetching ads: ", error);
    throw new Error('Failed to fetch ads');
  }
};

// Fetch a single ad by ID
export const fetchAdById = async (id: string): Promise<Ad | null> => {
  try {
    const docRef = doc(db, 'ads', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Ad;
    }
    return null;
  } catch (error) {
    console.error("Error fetching ad by ID: ", error);
    throw new Error('Failed to fetch ad');
  }
};

// Update an ad
export const updateAd = async (id: string, updates: Partial<Omit<Ad, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'ads', id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating ad: ", error);
    throw new Error('Failed to update ad');
  }
};

// Delete an ad
export const deleteAd = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'ads', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting ad: ", error);
    throw new Error('Failed to delete ad');
  }
};
