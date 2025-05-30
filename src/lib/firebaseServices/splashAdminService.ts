import { db } from '../firebase';
import {
  doc,
  setDoc,
  getDoc,
  Timestamp,
} from 'firebase/firestore';

export type ObjectFitOptions = 'cover' | 'contain' | 'fill' | 'none' | 'scale-down';

export interface SplashSettings {
  enabled: boolean;
  mode: 'image' | 'video';
  imageUrl?: string;
  videoUrl?: string;
  logoUrl?: string;
  audioUrl?: string;
  objectFit?: ObjectFitOptions;
  updatedAt?: Timestamp; // Optional on create, will be set on save
}

const SPLASH_SETTINGS_COLLECTION = 'splashScreenSettings';
const SPLASH_SETTINGS_DOC_ID = 'main';

/**
 * Fetches the splash screen settings from Firestore.
 * @returns {Promise<SplashSettings | null>} The settings object or null if not found/error.
 */
export const getSplashAdminSettings = async (): Promise<SplashSettings | null> => {
  try {
    const docRef = doc(db, SPLASH_SETTINGS_COLLECTION, SPLASH_SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as SplashSettings;
    }
    console.log("No splash screen settings document found in 'splashScreenSettings/main'. Returning null.");
    return null;
  } catch (error) {
    console.error("Error fetching splash screen settings from splashAdminService:", error);
    throw error; // Re-throw to allow caller to handle
  }
};

/**
 * Saves the splash screen settings to Firestore.
 * @param {Partial<SplashSettings>} settingsToSave The settings object to save. `enabled` and `mode` are required.
 * @returns {Promise<void>}
 */
export const saveSplashAdminSettings = async (settingsToSave: Omit<SplashSettings, 'updatedAt'>): Promise<void> => {
  try {
    const docRef = doc(db, SPLASH_SETTINGS_COLLECTION, SPLASH_SETTINGS_DOC_ID);
    const payload: SplashSettings = {
      enabled: settingsToSave.enabled,
      mode: settingsToSave.mode,
      imageUrl: settingsToSave.imageUrl || '',
      videoUrl: settingsToSave.videoUrl || '',
      logoUrl: settingsToSave.logoUrl || '',
      audioUrl: settingsToSave.audioUrl || '',
      objectFit: settingsToSave.objectFit || 'cover',
      updatedAt: Timestamp.now(),
    };
    await setDoc(docRef, payload, { merge: true }); // Use merge:true to avoid overwriting fields not included in settingsToSave if any
    console.log("Splash screen settings saved to 'splashScreenSettings/main'. Payload:", payload);
  } catch (error) {
    console.error("Error saving splash screen settings in splashAdminService:", error);
    throw error; // Re-throw to allow caller to handle
  }
}; 