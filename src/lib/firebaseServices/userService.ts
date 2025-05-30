import { db } from '../firebase';
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  Timestamp,
  updateDoc,
} from 'firebase/firestore';

export type UserRole = 'admin' | 'editor' | 'viewer';

export interface UserProfile {
  uid: string; // Firebase Auth UID
  email?: string | null;
  displayName?: string | null;
  roles: UserRole[];
  createdAt: Timestamp;
  lastLogin?: Timestamp;
  // Add other user-specific profile information here
}

const usersCollection = collection(db, 'users');

// Get or Create a user profile (upsert behavior)
// Typically called after a user signs up or logs in for the first time
export const getOrCreateUserProfile = async (uid: string, userData: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'roles'>>): Promise<UserProfile> => {
  const userRef = doc(db, 'users', uid);
  try {
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      const existingData = docSnap.data() as UserProfile;
      // Optionally update lastLogin or other fields on existing user
      await updateDoc(userRef, { lastLogin: Timestamp.now() });
      return existingData;
    }
    // Create new user profile
    const newUserProfile: UserProfile = {
      uid,
      email: userData.email || null,
      displayName: userData.displayName || null,
      roles: ['viewer'], // Default role
      createdAt: Timestamp.now(),
      lastLogin: Timestamp.now(),
      ...userData, // Spread any other provided data
    };
    await setDoc(userRef, newUserProfile);
    return newUserProfile;
  } catch (error) {
    console.error("Error getting or creating user profile: ", error);
    throw new Error('Failed to manage user profile');
  }
};

// Fetch a user profile by UID
export const fetchUserProfile = async (uid: string): Promise<UserProfile | null> => {
  try {
    const userRef = doc(db, 'users', uid);
    const docSnap = await getDoc(userRef);
    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    throw new Error('Failed to fetch user profile');
  }
};

// Fetch all users (requires appropriate Firestore rules for admin access)
export const fetchAllUsers = async (): Promise<UserProfile[]> => {
  try {
    const querySnapshot = await getDocs(usersCollection);
    return querySnapshot.docs.map(doc => doc.data() as UserProfile);
  } catch (error) {
    console.error("Error fetching all users: ", error);
    throw new Error('Failed to fetch all users');
  }
};

// Assign or update roles for a user
export const updateUserRoles = async (uid: string, roles: UserRole[]): Promise<void> => {
  try {
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, { roles });
  } catch (error) {
    console.error("Error updating user roles: ", error);
    throw new Error('Failed to update user roles');
  }
};

// Helper to check if a user has admin access
export const isAdmin = (userProfile: UserProfile | null): boolean => {
  return !!userProfile && userProfile.roles.includes('admin');
};

// Update specific fields of a user profile
export const updateUserProfile = async (uid: string, updates: Partial<Omit<UserProfile, 'uid' | 'createdAt' | 'roles'>>): Promise<void> => {
    try {
        const userRef = doc(db, 'users', uid);
        await updateDoc(userRef, updates);
    } catch (error) {
        console.error("Error updating user profile details: ", error);
        throw new Error('Failed to update user profile details');
    }
}; 