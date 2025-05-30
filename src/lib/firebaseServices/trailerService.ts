import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  Timestamp,
} from 'firebase/firestore';

export interface HeaderTrailer {
  id?: string; // Should be a singleton document, e.g., 'current'
  youtubeUrl: string;
  movieTitle: string;
  description: string;
  watchNowUrl: string;
  moreInfoUrl: string;
  updatedAt: Timestamp;
  manualOverride?: boolean;
}

const TRAILER_COLLECTION_NAME = 'headerTrailer';
const TRAILER_DOC_ID = 'current'; // Using a fixed ID for the singleton document

const trailerDocRef = doc(db, TRAILER_COLLECTION_NAME, TRAILER_DOC_ID);

// Get the current header trailer configuration
export const getHeaderTrailer = async (): Promise<HeaderTrailer | null> => {
  try {
    const docSnap = await getDoc(trailerDocRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as HeaderTrailer;
    }
    return null; // Or you could return a default trailer configuration
  } catch (error) {
    console.error("Error fetching header trailer: ", error);
    throw new Error('Failed to fetch header trailer');
  }
};

// Update or set the header trailer configuration
export const updateHeaderTrailer = async (
  trailerData: Omit<HeaderTrailer, 'id' | 'updatedAt'>
): Promise<void> => {
  try {
    await setDoc(trailerDocRef, {
      ...trailerData,
      updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating header trailer: ", error);
    throw new Error('Failed to update header trailer');
  }
}; 