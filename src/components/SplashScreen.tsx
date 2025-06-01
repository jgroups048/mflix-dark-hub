import React, { useState, useEffect, useRef } from 'react';
import { getSplashAdminSettings, SplashSettings, ObjectFitOptions } from '@/lib/firebaseServices/splashAdminService';

interface SplashScreenProps {
  onComplete: () => void;
  ignoreSessionStorage?: boolean;
  testSettings?: Omit<SplashSettings, 'updatedAt' | 'enabled'> & { enabled?: boolean };
}

// --- Default Fallback Assets ---
const FALLBACK_LOGO_URL = '/defaults/default-mflix-logo.png'; // A fallback for your dynamic logo if needed
// --- End Default Fallback Assets ---

const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, ignoreSessionStorage = false, testSettings }) => {
  const [activeSplashSettings, setActiveSplashSettings] = useState<SplashSettings | null>(null);
  const [effectiveLogoUrl, setEffectiveLogoUrl] = useState<string | null>(null);
  const [show, setShow] = useState(true);
  // Removed refs and state for background video/image as they are no longer primary
  const [duration, setDuration] = useState(5000); // Default duration

  useEffect(() => {
    const initSplash = async () => {
      let logoToUse: string | null = null;
      let splashDuration = 5000;

      if (testSettings) {
        logoToUse = testSettings.logoUrl || FALLBACK_LOGO_URL;
        splashDuration = (testSettings as any).duration || 5000;
        // No session storage marking for test runs
      } else {
        try {
          const fetchedSettings = await getSplashAdminSettings();
          if (!fetchedSettings || !fetchedSettings.enabled) {
            onComplete();
            return;
          }
          const splashShownKey = 'mflixSplashScreenShown';
          if (!ignoreSessionStorage && sessionStorage.getItem(splashShownKey)) {
            onComplete();
            return;
          }
          logoToUse = fetchedSettings.logoUrl || FALLBACK_LOGO_URL;
          // Assuming duration might come from settings in the future, else default
          // splashDuration = fetchedSettings.duration || 5000; 
          if (!ignoreSessionStorage) {
            sessionStorage.setItem(splashShownKey, 'true');
          }
        } catch (error) {
          console.error("[Splash] CRITICAL: Error fetching splash settings:", error);
          logoToUse = FALLBACK_LOGO_URL; // Fallback logo on error
          // Fallback duration is already set
        }
      }
      setEffectiveLogoUrl(logoToUse);
      setDuration(splashDuration);
    };
    initSplash();
  }, [onComplete, ignoreSessionStorage, testSettings]);

  useEffect(() => {
    if (effectiveLogoUrl === null) { // Still waiting for settings to be processed
        return;
    }
    // If effectiveLogoUrl is set (even to fallback), proceed with timeout
    const timeoutId = setTimeout(() => {
      setShow(false);
      setTimeout(onComplete, 500); // Fade out duration
    }, duration);

    return () => clearTimeout(timeoutId);
  }, [effectiveLogoUrl, duration, onComplete]);

  if (!show) { // If show is false, or if settings haven't loaded logo yet
    return null;
  }

  // Render only the logo and loader on a black background
  return (
    <div 
      className={`fixed inset-0 z-[9999] bg-black flex flex-col items-center justify-center transition-opacity duration-500 ease-in-out ${show && effectiveLogoUrl ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
    >
      {effectiveLogoUrl && (
        <img 
          src={effectiveLogoUrl} 
          alt="Site Logo" 
          className="max-w-[70%] max-h-[50%] object-contain mb-8"
          onError={(e) => { 
            console.warn('[Splash] Error loading dynamic logo, using fallback text or hiding.', e); 
            (e.target as HTMLImageElement).style.display = 'none'; // Hide broken image icon
            // Optionally, you can render a text logo here as a fallback within this component
          }}
        />
      )}
      {/* Red Circular Loader */}
      <div 
        className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"
        role="status"
      >
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
};

export default SplashScreen;
