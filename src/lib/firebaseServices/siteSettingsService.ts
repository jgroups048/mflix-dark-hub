import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';

// Expanded SiteSettings interface
export interface SiteSettings {
  logoUrl?: string; // Existing, might be renamed or part of a branding object
  siteName?: string;
  siteTagline?: string;
  faviconUrl?: string; // For favicon image URL
  heroLogoUrl?: string; // Added for Hero Section Logo
  videoOverlayLogoUrl?: string; // ADDED: For permanent video overlay logo
  videoOverlayPosition?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'; // ADDED: Position for video overlay logo
  watchPageSplashLogoUrl?: string; // ADDED: URL for WatchPage loading splash logo
  watchPageSplashLogoSize?: 'small' | 'medium' | 'large'; // ADDED: Size for WatchPage loading splash logo
  splashScreen?: {
    enabled?: boolean;
    mode?: 'video' | 'image';          // ADDED: Splash mode selector
    videoUrl?: string;                // ADDED: URL for splash video
    imageUrl?: string;                // ADDED: URL for splash image
    logoUrl?: string;                 // Existing: For overlay logo on splash itself
    soundUrl?: string;                // ADDED: URL for optional splash sound
    duration?: number;                // Existing: Max duration for video, fixed for image (e.g., 5000ms)
    // text?: string; // Consider removing if not used, or keeping if a text overlay is still desired alongside logo
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
  };
  footer?: {
    copyrightText?: string;
    socialLinks?: {
      youtube?: string;
      facebook?: string;
      instagram?: string;
      telegram?: string;
      twitter?: string; // Added twitter as an example
    };
  };
  seo?: {
    metaTitle?: string;
    metaDescription?: string;
    keywords?: string; // Comma-separated string
  };
  // Add other settings fields here if needed
  // Example: contactEmail?: string;
}

const SETTINGS_COLLECTION_NAME = 'siteSettings';
const SETTINGS_DOC_ID = 'main';

const settingsDocRef = doc(db, SETTINGS_COLLECTION_NAME, SETTINGS_DOC_ID);

export const getSiteSettings = async (): Promise<SiteSettings | null> => {
  try {
    const docSnap = await getDoc(settingsDocRef);
    if (docSnap.exists()) {
      return docSnap.data() as SiteSettings;
    }
    console.log("No site settings document found!");
    return null;
  } catch (error) {
    console.error("Error fetching site settings: ", error);
    throw new Error('Failed to fetch site settings');
  }
};

// Update site settings
export const updateSiteSettings = async (settingsData: Partial<SiteSettings>): Promise<void> => {
  try {
    // Ensure settingsDocRef is correctly defined (it is at the top of the file)
    await setDoc(settingsDocRef, settingsData, { merge: true }); // Use setDoc with merge:true to update or create
  } catch (error) {
    console.error("Error updating site settings: ", error);
    throw new Error('Failed to update site settings');
  }
}; 