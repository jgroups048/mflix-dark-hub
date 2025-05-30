import { db } from '../firebase';
import {
  collection,
  addDoc,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
  orderBy,
  limit,
} from 'firebase/firestore';

// Interface based on the fields used in AdminPage.tsx for Supabase
export interface Movie {
  id: string; // Firestore document ID
  title: string;
  description?: string;
  posterUrl?: string; // Corresponds to poster_url
  videoUrl?: string;  // Corresponds to video_url
  downloadUrl?: string; // Corresponds to download_url
  genre?: string;
  category?: string; // Or a more specific type if available
  rating?: number;
  duration?: string; // e.g., "2h 15m"
  releaseYear?: number;
  language?: string;
  tags?: string; // Comma-separated or array? Let's assume string for now
  telegramChannel?: string; // This was static in AdminPage, may or may not be stored per movie
  trailerUrl?: string;
  isFeatured?: boolean;
  viewCount?: number;    // Consider if this should be managed by Firestore directly (e.g. increments)
  downloadCount?: number; // Same as viewCount
  createdAt?: Timestamp; // Firestore timestamp for creation
  updatedAt?: Timestamp; // Firestore timestamp for updates
}

const moviesCollection = collection(db, 'movies'); // Changed from 'videos' to 'movies'

// Add a new video
export const addVideo = async (videoData: Omit<Movie, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> => {
  try {
    const docRef = await addDoc(moviesCollection, {
      ...videoData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error adding video: ", error);
    throw new Error('Failed to add video');
  }
};

// Fetch all videos, ordered by creation date (newest first)
export const getAllVideos = async (): Promise<Movie[]> => {
  try {
    const q = query(moviesCollection, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  } catch (error) {
    console.error("Error fetching all videos: ", error);
    throw new Error('Failed to fetch all videos');
  }
};

// Fetch a single video by ID
export const fetchVideoById = async (id: string): Promise<Movie | null> => {
  try {
    const docRef = doc(db, 'movies', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Movie;
    }
    return null;
  } catch (error) {
    console.error("Error fetching video by ID: ", error);
    throw new Error('Failed to fetch video');
  }
};

// Update a video
export const updateVideo = async (id: string, updates: Partial<Omit<Movie, 'id' | 'createdAt'>>): Promise<void> => {
  try {
    const docRef = doc(db, 'movies', id);
    await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
    });
  } catch (error) {
    console.error("Error updating video: ", error);
    throw new Error('Failed to update video');
  }
};

// Delete a video
export const deleteVideo = async (id: string): Promise<void> => {
  try {
    const docRef = doc(db, 'movies', id);
    await deleteDoc(docRef);
  } catch (error) {
    console.error("Error deleting video: ", error);
    throw new Error('Failed to delete video');
  }
};

// Example: Fetch videos by a specific user ID (if needed in the future)
/*
export const fetchVideosByUserId = async (userId: string): Promise<Movie[]> => {
  try {
    const q = query(moviesCollection, where("userId", "==", userId), orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  } catch (error) {
    console.error("Error fetching videos by user ID: ", error);
    throw new Error('Failed to fetch user videos');
  }
};
*/

// Fetch the first movie marked as featured
export const getFeaturedMovie = async (): Promise<Movie | null> => {
  try {
    const moviesRef = collection(db, 'movies');
    const q = query(moviesRef, where('isFeatured', '==', true), orderBy('createdAt', 'desc'), limit(1));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const docSnap = querySnapshot.docs[0];
      return { id: docSnap.id, ...docSnap.data() } as Movie;
    }
    return null;
  } catch (error) {
    console.error("Error fetching featured movie: ", error);
    throw new Error('Failed to fetch featured movie');
  }
};

// Fetch related movies by category, excluding the current movie
export const getRelatedMovies = async (category: string | undefined, currentMovieId: string, count: number): Promise<Movie[]> => {
  if (!category) return []; // Return empty if no category to filter by
  try {
    const moviesRef = collection(db, 'movies');
    const q = query(
      moviesRef, 
      where('category', '==', category),
      where('id', '!=', currentMovieId), // This requires a composite index in Firestore: (category, id)
      orderBy('id'), // Firestore requires orderBy when using not-equals (!=)
      // Potentially orderBy('createdAt', 'desc') or another field for better relevance, 
      // but be mindful of index requirements with != comparisons.
      // For simplicity with != and another filter, ordering by id is a safe start if no other specific order is needed.
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  } catch (error) {
    console.error("Error fetching related movies: ", error);
    // Depending on requirements, you might want to throw or return empty array
    // For now, re-throwing to make it visible, but can be changed to return []
    throw new Error('Failed to fetch related movies'); 
  }
};

// Fetch videos by content type (category)
export const getVideosByContentType = async (contentType: string, count: number): Promise<Movie[]> => {
  if (!contentType || contentType === 'all') { // Handle 'all' or undefined contentType by fetching all
    // This might be inefficient if 'all' means truly all movies without limit for this component.
    // Consider if 'all' should have a different default limit or behavior.
    // For now, respecting the passed 'count' or a default if not passed by caller.
    const q = query(collection(db, 'movies'), orderBy('createdAt', 'desc'), limit(count || 20)); // Default limit for 'all'
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  }
  try {
    const moviesRef = collection(db, 'movies');
    const q = query(
      moviesRef, 
      where('category', '==', contentType),
      orderBy('createdAt', 'desc'), // Order by creation date or other relevant field
      limit(count)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Movie));
  } catch (error) {
    console.error(`Error fetching videos by content type ${contentType}: `, error);
    throw new Error(`Failed to fetch videos for ${contentType}`);
  }
}; 